import json
import os
import unicodedata
from io import BytesIO
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

from dotenv import load_dotenv
from fastapi import FastAPI, File, Form, Header, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel
from PIL import Image
from supabase import Client, create_client
from ultralytics import YOLO

from api.notifications import notify_nearby_farms, sync_historical_alerts_for_farm
from api.reports import get_router as get_reports_router


ROOT_DIR = Path(__file__).resolve().parents[1]
MODEL_PATH = Path(os.getenv("MODEL_PATH") or ROOT_DIR / "model" / "best.pt")
FRONT_DIST_DIR = ROOT_DIR / "front" / "dist"

load_dotenv(ROOT_DIR / ".env")
load_dotenv(ROOT_DIR / "front" / ".env")

SUPABASE_URL = os.getenv("SUPABASE_URL") or os.getenv("VITE_SUPABASE_URL")
SUPABASE_KEY = (
    os.getenv("SUPABASE_ANON_KEY")
    or os.getenv("SUPABASE_PUBLISHABLE_KEY")
    or os.getenv("VITE_SUPABASE_PUBLISHABLE_KEY")
    or os.getenv("VITE_SUPABASE_ANON_KEY")
)
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
CORS_ORIGINS = [
    origin.strip()
    for origin in os.getenv(
        "CORS_ORIGINS",
        "http://localhost:5173,http://127.0.0.1:5173",
    ).split(",")
    if origin.strip()
]

if not MODEL_PATH.exists():
    raise RuntimeError(f"Modelo YOLO nao encontrado em: {MODEL_PATH}")
if not SUPABASE_URL or not SUPABASE_KEY:
    raise RuntimeError("Configure SUPABASE_URL/SUPABASE_ANON_KEY ou as variaveis VITE_SUPABASE_*.")

model = YOLO(str(MODEL_PATH))
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
service_supabase: Client | None = (
    create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    if SUPABASE_SERVICE_ROLE_KEY
    else None
)

app = FastAPI(title="Visiagro API", description="Deteccao de pragas com YOLOv8")



app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class PredictionActivePayload(BaseModel):
    ativa: bool


def _normalize(value: str | None) -> str:
    if not value:
        return ""
    without_accents = "".join(
        char for char in unicodedata.normalize("NFD", value) if unicodedata.category(char) != "Mn"
    )
    return without_accents.lower().replace("_", " ").replace("-", " ").strip()


def _get_user_id(user_response) -> str:
    user = getattr(user_response, "user", None)
    if user is None and hasattr(user_response, "dict"):
        user = user_response.dict().get("user")
    if isinstance(user, dict):
        user_id = user.get("id")
    else:
        user_id = getattr(user, "id", None)
    if not user_id:
        raise HTTPException(status_code=401, detail="Token invalido ou usuario nao encontrado.")
    return user_id


def _parse_bearer_token(authorization: str | None) -> str:
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="Envie o token do Supabase no header Authorization.")
    return authorization.split(" ", 1)[1].strip()


def _find_peste(label: str | None):
    if not label:
        return None

    response = (
        supabase.table("pestes")
        .select(
            "id,nome_cientifico,nome_comum,descricao_simples,nivel_risco,"
            "periodo_mais_comum,acoes_recomendadas,danos_causados"
        )
        .execute()
    )
    label_normalized = _normalize(label)

    for peste in response.data or []:
        candidates = [
            peste.get("nome_comum"),
            peste.get("nome_cientifico"),
        ]
        if any(_normalize(candidate) == label_normalized for candidate in candidates):
            return peste

    for peste in response.data or []:
        candidates = [
            peste.get("nome_comum"),
            peste.get("nome_cientifico"),
        ]
        if any(label_normalized in _normalize(candidate) for candidate in candidates):
            return peste

    return None


def _insert_prediction(token: str, payload: dict):
    url = f"{SUPABASE_URL.rstrip('/')}/rest/v1/predictions"
    request = Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "apikey": SUPABASE_KEY,
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
            "Prefer": "return=representation",
        },
        method="POST",
    )

    try:
        with urlopen(request, timeout=20) as response:
            body = response.read().decode("utf-8")
            return json.loads(body) if body else []
    except HTTPError as error:
        detail = error.read().decode("utf-8")
        raise HTTPException(status_code=error.code, detail=f"Erro ao salvar prediction: {detail}") from error
    except URLError as error:
        raise HTTPException(status_code=502, detail=f"Falha ao conectar no Supabase: {error.reason}") from error


def _validate_user_from_header(authorization: str | None) -> tuple[str, str]:
    token = _parse_bearer_token(authorization)
    try:
        user_response = supabase.auth.get_user(token)
        user_id = _get_user_id(user_response)
    except HTTPException:
        raise
    except Exception as error:
        raise HTTPException(status_code=401, detail=f"Falha ao validar usuario: {error}") from error
    return token, user_id

reports_router = get_reports_router(supabase, SUPABASE_URL, SUPABASE_KEY, _parse_bearer_token, _get_user_id)
app.include_router(reports_router)

@app.get("/health")
def health_check():
    return {"status": "ok", "model": str(MODEL_PATH)}


@app.post("/analyze", summary="Analisa uma imagem e persiste o resultado")
async def analyze_image(
    file: UploadFile = File(...),
    latitude: float | None = Form(default=None),
    longitude: float | None = Form(default=None),
    authorization: str | None = Header(default=None),
):
    token, user_id = _validate_user_from_header(authorization)

    contents = await file.read()
    try:
        image = Image.open(BytesIO(contents)).convert("RGB")
    except Exception as error:
        raise HTTPException(status_code=400, detail="Arquivo enviado nao e uma imagem valida.") from error

    results = model.predict(image, verbose=False)

    detections = []
    for result in results:
        for box in result.boxes:
            class_id = int(box.cls[0])
            label_name = model.names[class_id]
            confidence = float(box.conf[0]) if box.conf is not None else None
            detections.append(
                {
                    "class_id": class_id,
                    "label": label_name,
                    "confidence": confidence,
                }
            )

    top_detection = max(detections, key=lambda item: item["confidence"] or 0, default=None)
    unique_labels = list(dict.fromkeys(item["label"] for item in detections))
    label_final = ", ".join(unique_labels) if unique_labels else "Nenhuma deteccao"
    confidence = top_detection["confidence"] if top_detection else None
    peste = _find_peste(top_detection["label"] if top_detection else None)

    payload = {
        "filename": file.filename,
        "label": label_final,
        "user_id": user_id,
        "peste_id": peste["id"] if peste else None,
        "confianca": confidence,
        "latitude": latitude,
        "longitude": longitude,
        "ativa": True,
    }

    inserted = _insert_prediction(token, payload)
    prediction = inserted[0] if inserted else None

    if service_supabase and prediction:
        notification_payload = {
            **payload,
            "nivel_risco": peste.get("nivel_risco") if peste else None,
            "recomendacao": peste.get("acoes_recomendadas") if peste else None,
        }
        notify_nearby_farms(service_supabase, notification_payload, prediction, contents)

    return {
        "status": "success",
        "filename": file.filename,
        "label": label_final,
        "confianca": confidence,
        "peste": peste,
        "detections": detections,
        "prediction": prediction,
    }


@app.patch("/predictions/{prediction_id}/active")
def update_prediction_active(
    prediction_id: int,
    payload: PredictionActivePayload,
    authorization: str | None = Header(default=None),
):
    _token, user_id = _validate_user_from_header(authorization)
    response = (
        supabase.table("predictions")
        .update({"ativa": payload.ativa})
        .eq("id", prediction_id)
        .eq("user_id", user_id)
        .execute()
    )
    if not response.data:
        raise HTTPException(status_code=404, detail="Analise nao encontrada para este usuario.")
    return {"prediction": response.data[0]}


@app.post("/farms/{farm_id}/sync-alerts")
def sync_farm_alerts(
    farm_id: str,
    authorization: str | None = Header(default=None),
):
    if service_supabase is None:
        raise HTTPException(
            status_code=503,
            detail="Configure SUPABASE_SERVICE_ROLE_KEY para sincronizar alertas.",
        )

    _token, user_id = _validate_user_from_header(authorization)
    farm_response = (
        supabase.table("lavouras")
        .select("*")
        .eq("id", farm_id)
        .eq("user_id", user_id)
        .maybe_single()
        .execute()
    )
    if not farm_response.data:
        raise HTTPException(status_code=404, detail="Lavoura nao encontrada para este usuario.")

    return sync_historical_alerts_for_farm(service_supabase, farm_response.data)


@app.get("/{full_path:path}", include_in_schema=False)
def serve_frontend(full_path: str):
    if not FRONT_DIST_DIR.exists():
        raise HTTPException(status_code=404, detail="Frontend build nao encontrado.")

    requested_file = (FRONT_DIST_DIR / full_path).resolve()
    if requested_file.is_file() and FRONT_DIST_DIR.resolve() in requested_file.parents:
        return FileResponse(requested_file)

    index_file = FRONT_DIST_DIR / "index.html"
    if index_file.exists():
        return FileResponse(index_file)
    raise HTTPException(status_code=404, detail="Frontend index.html nao encontrado.")
