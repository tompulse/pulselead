#!/usr/bin/env python3
"""
Met à jour les dirigeants dans la BDD depuis le CSV INPI
SANS supprimer les données existantes (codes NAF, etc.)

USAGE:
    python3 update_dirigeants_from_inpi.py chemin/vers/Export_INPI.csv
"""

import csv
import sys
from datetime import datetime

def clean_siren(siren):
    """Nettoie le SIREN (enlève les apostrophes)"""
    return siren.replace("'", "").strip()

def generate_update_sql(csv_path):
    """Génère des UPDATE SQL pour ajouter les dirigeants"""
    
    print(f"📖 Lecture de {csv_path}...")
    
    updates = []
    stats = {
        'total': 0,
        'with_dirigeant': 0,
        'without_dirigeant': 0
    }
    
    with open(csv_path, 'r', encoding='utf-8') as f:
        # Sauter les 2 premières lignes (métadonnées)
        f.readline()
        f.readline()
        
        reader = csv.DictReader(f, delimiter=';')
        
        for i, row in enumerate(reader, 1):
            stats['total'] += 1
            
            # Extraire et nettoyer les données
            siren = clean_siren(row.get('SIREN', ''))
            dirigeant = row.get('Représentants', '').strip().replace("'", "''")
            
            if siren and dirigeant:
                stats['with_dirigeant'] += 1
                
                # Générer le UPDATE SQL
                sql = f"""UPDATE nouveaux_sites 
SET 
    dirigeant = '{dirigeant}',
    enrichi_dirigeant = true,
    date_enrichissement_dirigeant = '{datetime.now().isoformat()}'
WHERE siren = '{siren}';"""
                
                updates.append(sql)
            else:
                stats['without_dirigeant'] += 1
            
            if i % 100 == 0:
                print(f"   Traité : {i} lignes...")
    
    print(f"\n📊 STATISTIQUES :")
    print(f"   Total entreprises : {stats['total']}")
    print(f"   ✅ Avec dirigeant : {stats['with_dirigeant']} ({stats['with_dirigeant']/stats['total']*100:.1f}%)")
    print(f"   ❌ Sans dirigeant : {stats['without_dirigeant']} ({stats['without_dirigeant']/stats['total']*100:.1f}%)")
    
    # Sauvegarder le SQL
    output_path = csv_path.replace('.csv', '_update_dirigeants.sql')
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write("-- UPDATE des dirigeants depuis CSV INPI\n")
        f.write("-- Date : " + datetime.now().isoformat() + "\n")
        f.write(f"-- Entreprises avec dirigeant : {stats['with_dirigeant']}\n\n")
        f.write('\n'.join(updates))
        f.write(f"\n\n-- Vérification\n")
        f.write("SELECT COUNT(*) as total_updates FROM nouveaux_sites WHERE enrichi_dirigeant = true;\n")
    
    print(f"\n📄 Fichier SQL généré : {output_path}")
    print(f"\n💡 Pour mettre à jour Supabase :")
    print(f"   1. Ouvre Supabase SQL Editor")
    print(f"   2. Copie-colle le contenu de {output_path}")
    print(f"   3. Exécute")
    print(f"   4. Vérifie le résultat")
    
    return output_path, stats

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("❌ Usage : python3 update_dirigeants_from_inpi.py chemin/vers/Export_INPI.csv")
        sys.exit(1)
    
    csv_path = sys.argv[1]
    generate_update_sql(csv_path)
