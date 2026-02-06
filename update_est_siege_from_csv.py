#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
UPDATE est_siege depuis le CSV
"""
import csv

csv_file = "IMPORT_SUPABASE.csv"

# Compteurs
sieges_true = []
sieges_false = []

print(f"📖 Lecture de {csv_file}...")

with open(csv_file, 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    
    for row in reader:
        siret = row.get('siret', '').strip()
        est_siege = row.get('est_siege', '').strip().lower()
        
        if not siret:
            continue
        
        if est_siege == 'true':
            sieges_true.append(siret)
        else:
            sieges_false.append(siret)

print(f"\n📊 Statistiques:")
print(f"  - Sièges (true): {len(sieges_true)}")
print(f"  - Sites (false): {len(sieges_false)}")

# Générer le SQL
sql_file = "UPDATE_EST_SIEGE.sql"
print(f"\n📝 Génération de {sql_file}...")

with open(sql_file, 'w', encoding='utf-8') as f:
    f.write("-- 🔧 Mise à jour de est_siege depuis le CSV\n\n")
    
    # UPDATE pour les sièges (true)
    if sieges_true:
        f.write(f"-- ✅ Mise à jour des SIÈGES ({len(sieges_true)} entreprises)\n")
        f.write("UPDATE nouveaux_sites\nSET est_siege = true\nWHERE siret IN (\n")
        
        for i, siret in enumerate(sieges_true):
            f.write(f"  '{siret}'")
            if i < len(sieges_true) - 1:
                f.write(",\n")
            else:
                f.write("\n")
        
        f.write(");\n\n")
    
    # UPDATE pour les sites (false)
    if sieges_false:
        f.write(f"-- ❌ Mise à jour des SITES ({len(sieges_false)} entreprises)\n")
        f.write("UPDATE nouveaux_sites\nSET est_siege = false\nWHERE siret IN (\n")
        
        for i, siret in enumerate(sieges_false):
            f.write(f"  '{siret}'")
            if i < len(sieges_false) - 1:
                f.write(",\n")
            else:
                f.write("\n")
        
        f.write(");\n\n")
    
    # Vérification
    f.write("-- 📊 Vérification finale\n")
    f.write("SELECT \n")
    f.write("  est_siege,\n")
    f.write("  COUNT(*) as nombre,\n")
    f.write("  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 1) as pourcentage\n")
    f.write("FROM nouveaux_sites\n")
    f.write("GROUP BY est_siege\n")
    f.write("ORDER BY est_siege DESC;\n")

print(f"✅ Fichier {sql_file} généré avec succès!\n")
print(f"👉 Exécute-le dans Supabase SQL Editor pour mettre à jour les données.")
