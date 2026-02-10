#!/bin/bash
# Import CSV vers Supabase — une seule commande.
# Usage: ./importer.sh   ou   ./importer.sh mon_fichier.csv
# Prérequis: SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY dans .env ou exportés.

cd "$(dirname "$0")"
if [ -f .env ]; then
  set -a
  source .env
  set +a
fi
CSV="${1:-database.csv}"
if [ ! -f "$CSV" ]; then
  echo "❌ Fichier introuvable: $CSV"
  echo "   Mets ton CSV ici (ex: database.csv) ou lance: $0 ton_fichier.csv"
  exit 1
fi
if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
  echo "❌ Configure SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY"
  echo "   Crée un fichier .env dans ce dossier avec:"
  echo "   SUPABASE_URL=https://xxx.supabase.co"
  echo "   SUPABASE_SERVICE_ROLE_KEY=eyJ..."
  exit 1
fi
python3 import_csv_direct.py "$CSV"
