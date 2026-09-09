#!/usr/bin/env bash
# Exit on error
set -o errexit

echo "🚀 Iniciando despliegue de TalentPulse..."

cd backend
pip install -r requirements.txt
python manage.py collectstatic --no-input
python manage.py migrate
python populate_db.py

echo "✅ Despliegue listo."
