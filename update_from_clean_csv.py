#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
UPDATE la BDD depuis le CSV clean en GARDANT les IDs
"""

import csv

# Lire le CSV clean
csv_file = "IMPORT_SUPABASE.csv"

print(f"📄 Lecture de {csv_file}...")

updates_by_taille = {
    'GE': [],
    'ETI': [],
    'PME': [],
    'Taille inconnue, nouvelle entité': []
}

with open(csv_file, 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    
    for row in reader:
        siret = row.get('siret', '').strip()
        taille = row.get('categorie_entreprise', '').strip()
        
        if not siret:
            continue
        
        # Déterminer la taille
        if taille in ['GE', 'ETI', 'PME']:
            taille_finale = taille
        else:
            taille_finale = 'Taille inconnue, nouvelle entité'
        
        updates_by_taille[taille_finale].append(siret)

print("\n📊 Répartition dans le CSV :")
total = sum(len(v) for v in updates_by_taille.values())
for taille, sirets in updates_by_taille.items():
    pct = len(sirets) * 100 / total if total > 0 else 0
    print(f"  {taille}: {len(sirets)} ({pct:.1f}%)")

print(f"\n✅ Total: {total} entreprises")

# Générer le SQL qui UPDATE en gardant les IDs
print("\n📝 Génération du SQL...")
sql_file = "UPDATE_CLEAN_TAILLES.sql"

with open(sql_file, 'w', encoding='utf-8') as f:
    f.write("-- UPDATE des tailles en GARDANT les IDs (safe pour tournées et CRM)\n")
    f.write(f"-- Total : {total} entreprises\n\n")
    
    for taille, sirets in updates_by_taille.items():
        if len(sirets) == 0:
            continue
        
        f.write(f"\n-- UPDATE {len(sirets)} entreprises vers '{taille}'\n")
        f.write(f"UPDATE nouveaux_sites\n")
        f.write(f"SET categorie_entreprise = '{taille}'\n")
        f.write(f"WHERE siret IN (\n")
        
        # Batch de 100 pour lisibilité
        for i in range(0, len(sirets), 100):
            batch = sirets[i:i+100]
            f.write("  " + ", ".join(f"'{s}'" for s in batch))
            if i + 100 < len(sirets):
                f.write(",\n")
            else:
                f.write("\n")
        
        f.write(");\n")
    
    f.write("\n-- Vérification finale\n")
    f.write("SELECT categorie_entreprise, COUNT(*) FROM nouveaux_sites\n")
    f.write("GROUP BY categorie_entreprise ORDER BY COUNT(*) DESC;\n")

print(f"✅ SQL créé : {sql_file}")
print("\n👉 Exécute ce fichier dans Supabase pour UPDATE en toute sécurité !")
print("   Les IDs restent identiques = tournées et CRM intacts ✅")
