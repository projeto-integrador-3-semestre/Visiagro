#!/bin/sh
set -eu

MODEL_TARGET="${MODEL_PATH:-/app/model/best.pt}"

mkdir -p "$(dirname "$MODEL_TARGET")"

if [ ! -f "$MODEL_TARGET" ] && [ -n "${MODEL_URL:-}" ]; then
  echo "Downloading YOLO model to $MODEL_TARGET"
  python - <<'PY'
import os
import urllib.request

model_url = os.environ["MODEL_URL"]
model_target = os.environ.get("MODEL_PATH", "/app/model/best.pt")
tmp_target = f"{model_target}.download"

urllib.request.urlretrieve(model_url, tmp_target)
os.replace(tmp_target, model_target)
PY
fi

if [ ! -f "$MODEL_TARGET" ] && [ -f "/app/model-seed/best.pt" ]; then
  echo "Copying bundled YOLO model to $MODEL_TARGET"
  cp /app/model-seed/best.pt "$MODEL_TARGET"
fi

if [ ! -f "$MODEL_TARGET" ]; then
  echo "WARNING: YOLO model not found at $MODEL_TARGET."
  echo "Set MODEL_URL in Dokploy or provide model/best.pt before using /analyze."
fi

exec uvicorn api.index:app --host 0.0.0.0 --port "${PORT:-8000}"
