#!/usr/bin/env python3
"""
GUIDE D'EXÉCUTION - Traitement des 9000 prospects
Usage: python3 guide.py
"""

print("""
╔═══════════════════════════════════════════════════════════════════╗
║  🚀 TRAITEMENT DES 9000 PROSPECTS - GUIDE RAPIDE                 ║
╚═══════════════════════════════════════════════════════════════════╝

📋 ÉTAPES RECOMMANDÉES:

┌─────────────────────────────────────────────────────────────────┐
│ 🏃 MÉTHODE RAPIDE (2 minutes) - SQL UNIQUEMENT                  │
└─────────────────────────────────────────────────────────────────┘

1️⃣  Configurer la connexion:
   export DATABASE_URL="postgresql://user:pass@host:5432/dbname"

2️⃣  Lancer le script tout-en-un:
   ./traiter_prospects.sh

   OU manuellement:
   psql $DATABASE_URL -f ADD_SECTEUR_ACTIVITE_COLUMN.sql
   psql $DATABASE_URL -f FIX_CODES_POSTAUX.sql
   psql $DATABASE_URL -f UPDATE_ALL_SECTEURS.sql

3️⃣  Voir le rapport:
   psql $DATABASE_URL -f RAPPORT_FINAL.sql

✅ RÉSULTAT:
   - Codes postaux corrigés (4 → 5 chiffres)
   - Secteurs d'activité assignés
   - Dates validées

┌─────────────────────────────────────────────────────────────────┐
│ 🐌 MÉTHODE COMPLÈTE (15-30 min) - AVEC GÉOCODAGE               │
└─────────────────────────────────────────────────────────────────┘

1️⃣  Faire d'abord la méthode rapide ci-dessus

2️⃣  Installer Python dependencies:
   pip install supabase requests

3️⃣  Configurer Supabase:
   export SUPABASE_URL="https://ywavxjmbsywpjzchuuho.supabase.co"
   export SUPABASE_SERVICE_KEY="eyJhbGc..."

4️⃣  Lancer le géocodage:
   python3 process_new_prospects.py

5️⃣  Voir le rapport final:
   psql $DATABASE_URL -f RAPPORT_FINAL.sql

✅ RÉSULTAT COMPLET:
   - Tous les traitements SQL +
   - Latitude/Longitude ajoutés
   - Adresses géocodées via Mapbox

╔═══════════════════════════════════════════════════════════════════╗
║  📁 FICHIERS DISPONIBLES                                          ║
╚═══════════════════════════════════════════════════════════════════╝

SQL (Rapides):
  ✓ ADD_SECTEUR_ACTIVITE_COLUMN.sql    Ajoute la colonne secteur
  ✓ FIX_CODES_POSTAUX.sql              Corrige codes postaux
  ✓ UPDATE_ALL_SECTEURS.sql            Assigne secteurs NAF
  ✓ AUDIT_PROSPECTS.sql                Audit avant/après
  ✓ RAPPORT_FINAL.sql                  Rapport détaillé

Python (Géocodage):
  ✓ process_new_prospects.py           Traitement complet

Automation:
  ✓ traiter_prospects.sh               Script bash tout-en-un
  ✓ README_TRAITEMENT_PROSPECTS.md     Documentation complète

╔═══════════════════════════════════════════════════════════════════╗
║  🎯 SECTEURS D'ACTIVITÉ (10 catégories)                          ║
╚═══════════════════════════════════════════════════════════════════╝

1. Alimentaire                      NAF 10, 11
2. BTP & Construction               NAF 16, 23, 41, 42, 43
3. Automobile                       NAF 29, 30, 45
4. Commerce & Distribution          NAF 46, 47
5. Hôtellerie & Restauration        NAF 55, 56
6. Transport & Logistique           NAF 49, 50, 51, 52, 53
7. Informatique & Digital           NAF 58-63
8. Santé & Médical                  NAF 86, 87, 88
9. Services personnels              NAF 95, 96
10. Autres                          Tous les autres

╔═══════════════════════════════════════════════════════════════════╗
║  ⚡ DÉMARRAGE EXPRESS (copier-coller)                            ║
╚═══════════════════════════════════════════════════════════════════╝

# Configuration
export DATABASE_URL="votre_connection_string"

# Traitement complet SQL (2 minutes)
./traiter_prospects.sh

# OU si besoin de géocodage (15-30 min):
export SUPABASE_SERVICE_KEY="votre_key"
python3 process_new_prospects.py

# Rapport final
psql $DATABASE_URL -f RAPPORT_FINAL.sql

╔═══════════════════════════════════════════════════════════════════╗
║  📊 VÉRIFICATIONS RAPIDES                                         ║
╚═══════════════════════════════════════════════════════════════════╝

Codes postaux OK ?
  SELECT COUNT(*) FROM nouveaux_sites WHERE LENGTH(code_postal) = 5;

Secteurs assignés ?
  SELECT secteur_activite, COUNT(*) FROM nouveaux_sites 
  GROUP BY secteur_activite;

GPS présents ?
  SELECT COUNT(*) FROM nouveaux_sites 
  WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

╔═══════════════════════════════════════════════════════════════════╗
║  🆘 AIDE                                                           ║
╚═══════════════════════════════════════════════════════════════════╝

Erreur "DATABASE_URL not found":
  → Configurer: export DATABASE_URL="postgresql://..."

Erreur "permission denied: ./traiter_prospects.sh":
  → Rendre exécutable: chmod +x traiter_prospects.sh

Script Python ne trouve pas le module:
  → Installer: pip install supabase requests

Géocodage trop lent:
  → Normal, ~10 prospects/sec = 15 min pour 9000
  → Laisser tourner ou utiliser uniquement SQL (pas de GPS)

════════════════════════════════════════════════════════════════════

🎉 Prêt à traiter vos 9000 prospects !

""")
