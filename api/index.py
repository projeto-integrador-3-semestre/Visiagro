import os
from dotenv import load_dotenv
from fastapi import FastAPI, UploadFile, File
from supabase import create_client, Client
from ultralytics import YOLO
from io import BytesIO
from PIL import Image
import numpy as np

# Carrega as variáveis do arquivo .env
load_dotenv()

# Carrega o modelo customizado do Fernando
# Certifique-se de que o arquivo .pt esteja na pasta 'api' ou na raiz
model = YOLO("modelo_yolov8s_det.pt")

app = FastAPI(title="Visiagro API", description="Detecção de Pragas com YOLOv8 Custom")

# Credenciais do Supabase (Injetar via variáveis de ambiente em produção)
# Agora o código pega a chave "escondida" no sistema
URL = os.getenv("SUPABASE_URL")
KEY = os.getenv("SUPABASE_KEY")
supabase: Client = create_client(URL, KEY)

@app.post("/analyze", summary="Analisa uma imagem e persiste o resultado")
async def analyze_image(file: UploadFile = File(...)):
    """
    Endpoint que recebe um arquivo de imagem, realiza a inferência com YOLOv8
    e armazena o log da predição no banco de dados Supabase.
    """
    # Processamento da imagem recebida
    contents = await file.read()
    image = Image.open(BytesIO(contents))

    # Execução da inferência
    results = model.predict(image)
    
    # Extração das classes detectadas
    detectados = []
    for r in results:
        for box in r.boxes:
            class_id = int(box.cls[0])
            label_name = model.names[class_id]
            detectados.append(label_name)
            
    # Consolidação dos resultados (String separada por vírgula)
    label_final = ", ".join(detectados) if detectados else "Nenhuma detecção"
        
    # Persistência de dados no Supabase (Tabela: predictions)
    payload = {
        "filename": file.filename,
        "label": label_final
    }
    
    try:
        supabase.table("predictions").insert(payload).execute()
        return {
            "status": "success", 
            "filename": file.filename, 
            "analysis": label_final
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}