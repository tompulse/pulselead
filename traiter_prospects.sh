#!/bin/bash
# Script tout-en-un pour traiter les 9000 prospects
# Usage: ./traiter_prospects.sh

set -e

echo "═══════════════════════════════════════════════════════════════"
echo "🚀 TRAITEMENT COMPLET DES 9000 PROSPECTS"
echo "═══════════════════════════════════════════════════════════════"
echo ""

# Vérifier que DATABASE_URL est défini
if [ -z "$DATABASE_URL" ]; then
    echo "❌ Erreur: DATABASE_URL non défini"
    echo "   Exemple: export DATABASE_URL='postgresql://user:pass@host:5432/dbname'"
    exit 1
fi

echo "✅ Configuration OK"
echo ""

# 1. AUDIT INITIAL
echo "📊 ÉTAPE 1/5: Audit initial..."
echo "─────────────────────────────────────────────────────────────"
psql "$DATABASE_URL" -f AUDIT_PROSPECTS.sql
echo ""

# 2. AJOUTER COLONNE SECTEUR
echo "🏗️  ÉTAPE 2/5: Ajout colonne secteur_activite..."
echo "─────────────────────────────────────────────────────────────"
psql "$DATABASE_URL" -f ADD_SECTEUR_ACTIVITE_COLUMN.sql
echo ""

# 3. CORRIGER CODES POSTAUX
echo "📮 ÉTAPE 3/5: Correction des codes postaux..."
echo "─────────────────────────────────────────────────────────────"
psql "$DATABASE_URL" -f FIX_CODES_POSTAUX.sql
echo ""

# 4. ASSIGNER SECTEURS
echo "🏢 ÉTAPE 4/5: Attribution des secteurs d'activité..."
echo "─────────────────────────────────────────────────────────────"
psql "$DATABASE_URL" -f UPDATE_ALL_SECTEURS.sql
echo ""

# 5. AUDIT FINAL
echo "✅ ÉTAPE 5/5: Audit final..."
echo "─────────────────────────────────────────────────────────────"
psql "$DATABASE_URL" -f AUDIT_PROSPECTS.sql
echo ""

echo "═══════════════════════════════════════════════════════════════"
echo "🎉 TRAITEMENT TERMINÉ !"
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "📝 Pour géocoder les adresses (optionnel, prend du temps):"
echo "   export SUPABASE_SERVICE_KEY='votre_key'"
echo "   python3 process_new_prospects.py"
echo ""
