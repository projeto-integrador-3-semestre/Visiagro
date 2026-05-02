import json
import os
import unicodedata
from io import BytesIO
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

from dotenv import load_dotenv
from fastapi import FastAPI, File, Header, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
from supabase import Client, create_client
from ultralytics import YOLO

ROOT_DIR = Path(__file__).resolve().parents[1]
MODEL_PATH = ROOT_DIR / "model" / "best.pt"

load_dotenv(ROOT_DIR / ".env")
load_dotenv(ROOT_DIR / "front" / ".env")

SUPABASE_URL = os.getenv("SUPABASE_URL") or os.getenv("VITE_SUPABASE_URL")
SUPABASE_KEY = (
    os.getenv("SUPABASE_ANON_KEY")
    or os.getenv("SUPABASE_PUBLISHABLE_KEY")
    or os.getenv("VITE_SUPABASE_PUBLISHABLE_KEY")
    or os.getenv("VITE_SUPABASE_ANON_KEY")
)

if not MODEL_PATH.exists():
    raise RuntimeError(f"Modelo YOLO nao encontrado em: {MODEL_PATH}")
if not SUPABASE_URL or not SUPABASE_KEY:
    raise RuntimeError("Configure SUPABASE_URL/SUPABASE_ANON_KEY ou as variaveis VITE_SUPABASE_*.")

model = YOLO(str(MODEL_PATH))
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

app = FastAPI(title="Visiagro API", description="Deteccao de pragas com YOLOv8")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


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


@app.get("/health")
def health_check():
    return {"status": "ok", "model": str(MODEL_PATH)}


@app.post("/analyze", summary="Analisa uma imagem e persiste o resultado")
async def analyze_image(
    file: UploadFile = File(...),
    authorization: str | None = Header(default=None),
):
    token = _parse_bearer_token(authorization)
    try:
        user_response = supabase.auth.get_user(token)
        user_id = _get_user_id(user_response)
    except HTTPException:
        raise
    except Exception as error:
        raise HTTPException(status_code=401, detail=f"Falha ao validar usuario: {error}") from error

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
    }

    inserted = _insert_prediction(token, payload)

    return {
        "status": "success",
        "filename": file.filename,
        "label": label_final,
        "confianca": confidence,
        "peste": peste,
        "detections": detections,
        "prediction": inserted[0] if inserted else None,
    }
