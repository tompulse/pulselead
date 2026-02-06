#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script pour UPDATE les tailles d'entreprise depuis le CSV
"""

import csv
import os
import sys

# Détection de l'encoding
def detect_encoding(filepath):
    encodings = ['utf-8', 'latin-1', 'iso-8859-1', 'cp1252']
    for enc in encodings:
        try:
            with open(filepath, 'r', encoding=enc) as f:
                f.read()
            return enc
        except UnicodeDecodeError:
            continue
    return 'utf-8'

# Lire le CSV
csv_file = "data base 24 janv au 6 février.csv"
encoding = detect_encoding(csv_file)
print(f"📄 Encoding détecté : {encoding}")

# Parser le CSV
updates = []
with open(csv_file, 'r', encoding=encoding) as f:
    # Détecter le délimiteur
    first_line = f.readline()
    delimiter = ';' if ';' in first_line else ','
    f.seek(0)
    
    reader = csv.DictReader(f, delimiter=delimiter)
    
    for row in reader:
        siret = row.get('siret', '').strip()
        taille = row.get('categorie_entreprise', '').strip()
        
        if not siret:
            continue
        
        # Déterminer la taille finale
        if taille in ['GE', 'ETI', 'PME']:
            taille_finale = taille
        else:
            taille_finale = 'Taille inconnue, nouvelle entité'
        
        updates.append((siret, taille_finale))

print(f"✅ {len(updates)} entreprises à mettre à jour")

# Compter par catégorie
from collections import Counter
counts = Counter(t for s, t in updates)
print("\n📊 Répartition :")
for taille, nb in counts.most_common():
    print(f"  {taille}: {nb}")

# Générer le SQL
print("\n📝 Génération du SQL...")
sql_file = "UPDATE_TAILLES_FROM_CSV.sql"

with open(sql_file, 'w', encoding='utf-8') as f:
    f.write("-- UPDATE des tailles depuis le CSV\n")
    f.write("-- Total : {} entreprises\n\n".format(len(updates)))
    
    # Grouper par taille pour optimiser
    by_taille = {}
    for siret, taille in updates:
        if taille not in by_taille:
            by_taille[taille] = []
        by_taille[taille].append(siret)
    
    for taille, sirets in by_taille.items():
        f.write(f"\n-- UPDATE {len(sirets)} entreprises vers '{taille}'\n")
        f.write(f"UPDATE nouveaux_sites\n")
        f.write(f"SET categorie_entreprise = '{taille}'\n")
        f.write(f"WHERE siret IN (\n")
        
        # Écrire par batch de 100 pour lisibilité
        for i in range(0, len(sirets), 100):
            batch = sirets[i:i+100]
            f.write("  " + ", ".join(f"'{s}'" for s in batch))
            if i + 100 < len(sirets):
                f.write(",\n")
            else:
                f.write("\n")
        
        f.write(");\n")
    
    f.write("\n-- Vérification finale\n")
    f.write("SELECT categorie_entreprise, COUNT(*) as nombre\n")
    f.write("FROM nouveaux_sites\n")
    f.write("GROUP BY categorie_entreprise\n")
    f.write("ORDER BY nombre DESC;\n")

print(f"✅ Fichier SQL créé : {sql_file}")
print(f"\n👉 Exécute ce fichier dans Supabase SQL Editor")
