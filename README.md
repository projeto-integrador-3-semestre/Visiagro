# Visiagro

O Visiagro e um sistema voltado para analise e visualizacao de dados agricolas, com foco no monitoramento de pragas, uso de agrotoxicos e previsoes baseadas em dados historicos.

O objetivo da plataforma e fornecer insights que auxiliem na tomada de decisao no setor agricola, utilizando analise de dados e inteligencia artificial.

## Arquitetura do Sistema

O sistema e dividido em quatro camadas principais:

* **Frontend:** interface responsavel pela interacao com o usuario, envio de imagens e exibicao dos resultados da analise.
* **Backend:** responsavel pela logica da aplicacao, processamento das requisicoes, execucao do modelo de IA e comunicacao com o banco de dados.
* **Banco de Dados:** armazena usuarios, historico de analises, registros de pragas, agrotoxicos, fornecedores e demais dados do sistema.
* **Modelo de IA:** modelo YOLO usado para processar as imagens enviadas pelo usuario e identificar possiveis pragas.

A comunicacao entre as camadas e realizada por APIs, garantindo modularidade, escalabilidade e separacao de responsabilidades.

## Tecnologias Utilizadas

* **Supabase** - banco de dados e autenticacao.
* **FastAPI** - backend da aplicacao.
* **YOLOv8 / Ultralytics** - modelo de deteccao de pragas.
* **React / Vite** - frontend da aplicacao.
* **Python** - API e inferencia do modelo.

## Objetivo do Projeto

Desenvolver uma aplicacao capaz de identificar pragas agricolas a partir de imagens enviadas pelo usuario, utilizando inteligencia artificial, e retornar informacoes relevantes para apoio rapido na tomada de decisao.

## Tutorial para rodar localmente

Antes de rodar o projeto, voce precisa obter por fora dois arquivos que nao devem ser versionados no Git:

* `.env` com as credenciais do Supabase.
* `model/best.pt` com o modelo YOLO treinado.

Estrutura esperada:

```txt
Visiagro/
  .env
  api/
  front/
    .env
  model/
    best.pt
```

Exemplo do `.env` da raiz:

```env
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_ANON_KEY=sua_chave_publica
```

Exemplo do `front/.env`:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sua_chave_publica
VITE_API_URL=http://127.0.0.1:8000
```

### 1. Rodar o backend

Recomendado: Python 3.11.

```powershell
py -3.11 -m venv .venv
venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
uvicorn api.index:app --reload --host 127.0.0.1 --port 8000
```

Teste se a API subiu:

```txt
http://127.0.0.1:8000/health
```

### 2. Rodar o frontend

Em outro terminal:

```powershell
cd front
npm install
npm run dev
```

Acesse:

```txt
http://127.0.0.1:5173
```

### Observacoes

* O arquivo `model/best.pt` e obrigatorio para a API de analise funcionar.
* O `.env` da raiz e usado pelo backend.
* O `front/.env` e usado pelo Vite/React.
* Se alterar algum `.env`, reinicie o servidor correspondente.
