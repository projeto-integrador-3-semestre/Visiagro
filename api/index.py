# api/index.py
from fastapi import FastAPI, UploadFile, File
from supabase import create_client, Client
from ultralytics import YOLO
from io import BytesIO
from PIL import Image
import numpy as np

model = YOLO("yolov8s.pt")

app = FastAPI()

# Configurações do Banco (Pegue no painel do Supabase)
URL = "https://lgvnpgcaqrnvmxanjpml.supabase.co"
KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxndm5wZ2NhcXJudm14YW5qcG1sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYwNTA4MTAsImV4cCI6MjA5MTYyNjgxMH0.cgTxX0oMpTG6MclRg-fZ2vhQ-mhJxlVNcxkF2kPjj-s"
supabase: Client = create_client(URL, KEY)

@app.post("/analyze")
async def analyze_image(file: UploadFile = File(...)):
    # 1. Ler os bytes da imagem
    contents = await file.read()

    # 2. Abrir a imagem com o PIL
    image = Image.open(BytesIO(contents))

    # 3. Rodar a predição direto com o YOLO
    results = model.predict(image)

    # Nova Lista para guardar TUDO que ele achar na foto
    objetos_detectados = []
    
    # Vasculhando todas as "caixas" que o YOLO encontrou
    for r in results:
        for box in r.boxes:
            classe_id = int(box.cls[0])       # Pega o ID numérico
            nome = model.names[classe_id]     # Traduz pro nome
            objetos_detectados.append(nome)
            
    # Formata bonitinho para o banco (Ex: "Percevejo, Mosca-branca ou Lagarta")
    if objetos_detectados:
        result = ", ".join(objetos_detectados)
    else:
        result = "Nada detectado"
        
    # 4. Salvar no Supabase
    data = {
        "filename": file.filename,
        "label": result
    }
    response = supabase.table("predictions").insert(data).execute()
    
    return {"status": "success", "analysis": result}   