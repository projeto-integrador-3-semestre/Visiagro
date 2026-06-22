# Visiagro

O Visiagro e um sistema voltado para analise e visualizacao de dados agricolas, com foco no monitoramento de pragas, uso de agrotoxicos e previsoes baseadas em dados historicos.

O objetivo da plataforma e fornecer insights que auxiliem na tomada de decisao no setor agricola, utilizando analise de dados e inteligencia artificial.

## Arquitetura do Sistema

O sistema e dividido em quatro camadas principais:

* **Frontend:** React/Vite em `front/src/App.jsx`, responsavel por autenticacao, envio de imagens, historico, mapa de lavouras, alertas e relatorios tecnicos.
* **Backend:** FastAPI em `api/index.py`, responsavel por `/analyze`, `/reports`, ativacao/desativacao de analises e sincronizacao de alertas.
* **Banco de Dados:** Supabase Auth/Postgres, com tabelas para usuarios, historico, pragas, agrotoxicos, lavouras, alertas e relatorios.
* **Modelo de IA:** modelo YOLO usado para processar as imagens enviadas pelo usuario e identificar possiveis pragas.

A comunicacao entre as camadas e realizada por APIs, garantindo modularidade, escalabilidade e separacao de responsabilidades.

## Organizacao dos Arquivos

```txt
api/                  Backend FastAPI e rotas auxiliares.
database/supabase/    Scripts SQL e policies do Supabase.
deploy/dokploy/       Exemplo de variaveis para deploy no Dokploy.
front/                Frontend React/Vite.
model/                App/demo do modelo e arquivo best.pt local.
Dockerfile            Build de producao da API + frontend.
docker-compose.yml    Compose usado em deploy.
requirements.txt      Dependencias Python do backend.
```

Arquivos sensiveis ficam fora do Git: `.env`, `front/.env` e `model/best.pt`.

## Tecnologias Utilizadas

* **Supabase** - banco de dados e autenticacao.
* **FastAPI** - backend da aplicacao.
* **YOLOv8 / Ultralytics** - modelo de deteccao de pragas.
* **React / Vite** - frontend da aplicacao.
* **Python** - API e inferencia do modelo.

## Objetivo do Projeto

Desenvolver uma aplicacao capaz de identificar pragas agricolas a partir de imagens enviadas pelo usuario, utilizando inteligencia artificial, e retornar informacoes relevantes para apoio rapido na tomada de decisao.

## Tutorial para rodar localmente

Antes de rodar o projeto, voce precisa obter por fora arquivos que nao devem ser versionados no Git:

* `.env` com as credenciais do Supabase.
* `front/.env` com as variaveis publicas do Vite.
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
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173

# Opcional: se quiser e-mail de alertas.
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu_email@gmail.com
SMTP_PASSWORD=sua_senha_de_app
EMAIL_FROM="Visiagro <seu_email@gmail.com>"
```

Exemplo do `front/.env`:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sua_chave_publica
VITE_API_URL=http://127.0.0.1:8000
```

### 0. Preparar o Supabase

Execute no SQL Editor do Supabase:

```txt
database/supabase/supabase-lavouras.sql
database/supabase/supabase-predictions-ativa.sql
```

Esses arquivos criam/ajustam as tabelas usadas pelo app:

* `profiles`
* `pestes`
* `agrotoxicos`
* `predictions`
* `lavouras`
* `alertas_publicos`
* `technical_reports`

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

Endpoints principais:

* `GET /health`
* `POST /analyze`
* `GET /reports/{prediction_id}`
* `POST /reports/`
* `PATCH /predictions/{prediction_id}/active`
* `POST /farms/{farm_id}/sync-alerts`

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
* `deploy/dokploy/.env.example` mostra as variaveis esperadas para deploy.
* `SUPABASE_SERVICE_ROLE_KEY` e necessario para sincronizar alertas entre lavouras e predicoes de outros usuarios.
* `front/dist/`, `node_modules/` e `front/node_modules/` sao gerados localmente e nao devem ser versionados.
* Se alterar algum `.env`, reinicie o servidor correspondente.
