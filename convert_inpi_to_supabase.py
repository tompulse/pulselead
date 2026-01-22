#!/usr/bin/env python3
"""
Convertit les CSV INPI au format Supabase
Et génère le SQL d'import

USAGE:
    python3 convert_inpi_to_supabase.py chemin/vers/Export_INPI.csv
"""

import csv
import sys
from datetime import datetime

def parse_date(date_str):
    """Convertit DD/MM/YYYY en YYYY-MM-DD"""
    try:
        d = datetime.strptime(date_str, "%d/%m/%Y")
        return d.strftime("%Y-%m-%d")
    except:
        return None

def clean_siren(siren):
    """Nettoie le SIREN (enlève les apostrophes)"""
    return siren.replace("'", "").strip()

def extract_dept(cp):
    """Extrait le département depuis le code postal"""
    if cp and len(cp) >= 2:
        return cp[:2]
    return None

def convert_csv_to_sql(csv_path):
    """Convertit un CSV INPI en instructions SQL INSERT"""
    
    print(f"📖 Lecture de {csv_path}...")
    
    sql_statements = []
    
    with open(csv_path, 'r', encoding='utf-8') as f:
        # Sauter les 2 premières lignes (métadonnées)
        f.readline()
        f.readline()
        
        reader = csv.DictReader(f, delimiter=';')
        
        for i, row in enumerate(reader, 1):
            # Extraire et nettoyer les données
            nom = row.get('Dénomination / Nom', '').strip().replace('"', '').replace("'", "''")
            siren = clean_siren(row.get('SIREN', ''))
            dirigeant = row.get('Représentants', '').strip().replace("'", "''")
            adresse = row.get('Adresse du siège', '').strip().replace("'", "''")
            date_creation = parse_date(row.get('Début d\'activité', ''))
            forme_juridique = row.get('Forme juridique', '').strip().replace("'", "''")
            activite = row.get('Activité', '').strip().replace("'", "''")
            
            # Extraire le code postal et département depuis l'adresse
            # Format : "6 RUE D'ARMAILLE 75017 PARIS FRANCE"
            parts = adresse.split()
            code_postal = None
            ville = None
            for j, part in enumerate(parts):
                if part.isdigit() and len(part) == 5:
                    code_postal = part
                    ville = ' '.join(parts[j+1:]).replace(' FRANCE', '').strip()
                    break
            
            dept = extract_dept(code_postal) if code_postal else None
            
            # Générer le SQL INSERT
            if siren and nom:
                sql = f"""
INSERT INTO nouveaux_sites (
    nom, siren, dirigeant, adresse, date_creation, 
    forme_juridique, activite, code_postal, ville, departement,
    enrichi_dirigeant, date_enrichissement_dirigeant
) VALUES (
    '{nom}',
    '{siren}',
    {f"'{dirigeant}'" if dirigeant else 'NULL'},
    '{adresse}',
    {f"'{date_creation}'" if date_creation else 'NULL'},
    '{forme_juridique}',
    '{activite}',
    {f"'{code_postal}'" if code_postal else 'NULL'},
    {f"'{ville}'" if ville else 'NULL'},
    {f"'{dept}'" if dept else 'NULL'},
    {True if dirigeant else False},
    {f"'{datetime.now().isoformat()}'" if dirigeant else 'NULL'}
);"""
                sql_statements.append(sql)
            
            if i % 100 == 0:
                print(f"   Traité : {i} lignes...")
    
    print(f"\n✅ {len(sql_statements)} entreprises converties")
    
    # Sauvegarder le SQL
    output_path = csv_path.replace('.csv', '_import.sql')
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write("-- Import généré automatiquement depuis CSV INPI\n")
        f.write("-- Date : " + datetime.now().isoformat() + "\n\n")
        f.write('\n'.join(sql_statements))
    
    print(f"📄 Fichier SQL généré : {output_path}")
    print(f"\n💡 Pour importer dans Supabase :")
    print(f"   1. Ouvre Supabase SQL Editor")
    print(f"   2. Copie-colle le contenu de {output_path}")
    print(f"   3. Exécute")
    
    return output_path

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("❌ Usage : python3 convert_inpi_to_supabase.py chemin/vers/Export_INPI.csv")
        sys.exit(1)
    
    csv_path = sys.argv[1]
    convert_csv_to_sql(csv_path)
