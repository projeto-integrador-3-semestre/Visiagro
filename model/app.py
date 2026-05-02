import gradio as gr
from ultralytics import YOLO
from PIL import Image

model = YOLO("best.pt")

def predict_pest(image):
    results = model(image)
    res_plotted = results[0].plot()
    return Image.fromarray(res_plotted[..., ::-1])

# Usando Blocks para controlar o layout
with gr.Blocks() as demo:
    gr.Markdown("# AgroPest: Identificador de Pragas")
    
    with gr.Row(): # Coloca os elementos lado a lado (se preferir)
        input_img = gr.Image(label="Envie a imagem", type="pil", height=400, width=400)
        output_img = gr.Image(label="Resultado", height=400, width=400)
    
    btn = gr.Button("Detectar Pragas")
    btn.click(fn=predict_pest, inputs=input_img, outputs=output_img)

if __name__ == "__main__":
    demo.launch()