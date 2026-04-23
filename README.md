# Visiagro
Descriação geral do projeto

# 🌱 Visiagro

O **Visiagro** é um sistema voltado para análise e visualização de dados agrícolas, com foco no monitoramento de pragas, uso de agrotóxicos e previsões baseadas em dados históricos.

O objetivo da plataforma é fornecer insights que auxiliem na tomada de decisão no setor agrícola, utilizando técnicas de análise de dados e inteligência artificial.

## 🏗️ Arquitetura do Sistema

O sistema é dividido em quatro camadas principais:

* **Frontend:** Interface responsável pela interação com o usuário, envio de imagens e exibição dos resultados da análise.

* **Backend:** Responsável pela lógica da aplicação, processamento das requisições, integração com a API de IA e comunicação com o banco de dados.

* **Banco de Dados:** Armazena informações como usuários, histórico de análises, registros de pragas e demais dados do sistema.

* **Modelo de IA (API externa):** Responsável por processar as imagens enviadas pelo usuário e retornar a identificação das possíveis pragas com base em padrões visuais.

A comunicação entre as camadas é realizada por meio de APIs, garantindo modularidade, escalabilidade e separação de responsabilidades.


## ⚙️ Tecnologias Utilizadas

* **Supabase** → Banco de dados e autenticação
* **Hugging Face** → Modelos de inteligência artificial
* **JavaScript / TypeScript** → Desenvolvimento do frontend/backend
## 🎯 Objetivo do Projeto

Desenvolver uma aplicação capaz de identificar pragas agrícolas a partir de imagens enviadas pelo usuário, utilizando Inteligência Artificial, e retornar informações relevantes para apoio rápido na tomada de decisão.

