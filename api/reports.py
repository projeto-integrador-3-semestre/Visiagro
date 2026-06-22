from fastapi import APIRouter, Header, HTTPException
from pydantic import BaseModel
from typing import Optional

router = APIRouter(prefix="/reports", tags=["reports"])

class ReportPayload(BaseModel):
    prediction_id: int
    produto_recomendado: Optional[str] = None
    ingrediente_ativo: Optional[str] = None
    dose: Optional[float] = None
    unidade_dose: Optional[str] = None
    volume_calda: Optional[str] = None
    modo_aplicacao: Optional[str] = None
    prescricao: Optional[str] = None
    observacoes: Optional[str] = None
    responsavel_tecnico: Optional[str] = None
    crea: Optional[str] = None

def get_router(supabase_client, supabase_url, supabase_key, parse_token_fn, get_user_id_fn):
    
    @router.post("/")
    async def create_or_update_report(
        payload: ReportPayload,
        authorization: Optional[str] = Header(default=None)
    ):
        token = parse_token_fn(authorization)
        user_response = supabase_client.auth.get_user(token)
        user_id = get_user_id_fn(user_response)

        data = payload.dict()
        data["user_id"] = user_id

        result = (
            supabase_client.table("technical_reports")
            .upsert(data, on_conflict="prediction_id")
            .execute()
        )
        return result.data[0] if result.data else {}

    @router.get("/{prediction_id}")
    async def get_report(
        prediction_id: int,
        authorization: Optional[str] = Header(default=None)
    ):
        token = parse_token_fn(authorization)
        user_response = supabase_client.auth.get_user(token)
        user_id = get_user_id_fn(user_response)

        result = (
            supabase_client.table("technical_reports")
            .select("*")
            .eq("prediction_id", prediction_id)
            .eq("user_id", user_id)
            .maybeSingle()
            .execute()
        )
        return result.data or {}

    return router
