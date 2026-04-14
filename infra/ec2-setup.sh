#!/usr/bin/env bash
# Bootstrap a small EC2 host for the FastAPI backend (Ubuntu-style).
set -euo pipefail

sudo apt-get update
sudo apt-get install -y python3-venv python3-pip nginx

PROJECT_DIR="${PROJECT_DIR:-/opt/market-dashboard/backend}"
sudo mkdir -p "$PROJECT_DIR"
echo "Copy your backend tree to $PROJECT_DIR and create a venv:"
echo "  python3 -m venv .venv && source .venv/bin/activate"
echo "  pip install -r requirements.txt"
echo "Run Uvicorn behind nginx or systemd; set DATABASE_URL and CORS_ORIGINS for production."
