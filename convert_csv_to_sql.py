#!/usr/bin/env python3
"""
Script pour convertir votre CSV en instructions SQL INSERT
Compatible avec vos noms de colonnes actuels
"""

import csv
import sys
from datetime import datetime

def convert_date(date_str):
    """Convertit la date en format SQL (YYYY-MM-DD)"""
    if not date_str or date_str.strip() == '':
        return 'NULL'
    
    # Essayer différents formats
    formats = ['%d/%m/%Y', '%Y-%m-%d', '%d-%m-%Y']
    for fmt in formats:
        try:
            dt = datetime.strptime(date_str.strip(), fmt)
            return f"'{dt.strftime('%Y-%m-%d')}'"
        except ValueError:
            continue
    
    return 'NULL'

def convert_boolean(val):
    """Convertit les valeurs booléennes"""
    if not val or val.strip() == '':
        return 'false'
    
    val_lower = val.strip().lower()
    if val_lower in ['vrai', 'true', '1', 'oui', 'o', 'y', 'yes']:
        return 'true'
    return 'false'

def escape_sql(val):
    """Échappe les caractères spéciaux SQL"""
    if val is None or val == '':
        return 'NULL'
    
    val = str(val).replace("'", "''")  # Échapper les apostrophes
    return f"'{val}'"

def convert_numeric(val):
    """Convertit en nombre ou NULL"""
    if not val or val.strip() == '':
        return 'NULL'
    try:
        return str(float(val.strip()))
    except ValueError:
        return 'NULL'

def csv_to_sql(csv_file, output_file=None):
    """Convertit le CSV en SQL INSERT"""
    
    if output_file is None:
        output_file = csv_file.replace('.csv', '_import.sql')
    
    # Try different encodings (common for French Excel files)
    encodings = ['utf-8', 'latin-1', 'iso-8859-1', 'cp1252', 'windows-1252']
    f = None
    encoding_used = None
    
    for encoding in encodings:
        try:
            f = open(csv_file, 'r', encoding=encoding)
            first_line = f.readline()
            f.seek(0)
            encoding_used = encoding
            print(f"✅ Encodage détecté: {encoding}")
            break
        except UnicodeDecodeError:
            if f:
                f.close()
            continue
    
    if not f:
        raise Exception("Impossible de lire le fichier avec les encodages connus")
    
    # Auto-detect delimiter (tab, comma, or semicolon)
    if ';' in first_line:
        delimiter = ';'
    elif '\t' in first_line:
        delimiter = '\t'
    else:
        delimiter = ','
    
    print(f"✅ Séparateur détecté: '{delimiter}'")
    
    with f:
        reader = csv.DictReader(f, delimiter=delimiter)
        
        sql_lines = []
        sql_lines.append("-- Import généré automatiquement depuis " + csv_file)
        sql_lines.append("-- Date: " + datetime.now().strftime('%Y-%m-%d %H:%M:%S'))
        sql_lines.append("")
        sql_lines.append("INSERT INTO public.nouveaux_sites (")
        sql_lines.append("  siret, nom, date_creation, est_siege, categorie_juridique,")
        sql_lines.append("  categorie_entreprise, complement_adresse, numero_voie, type_voie,")
        sql_lines.append("  libelle_voie, code_postal, ville, coordonnee_lambert_x,")
        sql_lines.append("  coordonnee_lambert_y, code_naf")
        sql_lines.append(") VALUES")
        
        values = []
        count = 0
        
        for row in reader:
            count += 1
            
            # Validation SIRET
            siret = row.get('siret', '').strip()
            if not siret or len(siret) != 14:
                print(f"⚠️ Ligne {count}: SIRET invalide '{siret}' - ignorée")
                continue
            
            # Validation nom
            nom = row.get('Entreprise', '').strip()
            if not nom:
                print(f"⚠️ Ligne {count}: Nom vide pour SIRET {siret} - ignoré")
                continue
            
            # Construction de la valeur
            value_parts = [
                escape_sql(siret),
                escape_sql(nom),
                convert_date(row.get('date_creation', '')),
                convert_boolean(row.get('siege', '')),
                escape_sql(row.get('categorie_juridique', '')),
                escape_sql(row.get('categorie_entreprise', 'Non spécifié')),
                escape_sql(row.get('complement_adresse', '')),
                escape_sql(row.get('numero_voie', '')),
                escape_sql(row.get('type_voie', '')),
                escape_sql(row.get('libelle_voie', '')),
                escape_sql(row.get('code_postal', '')),
                escape_sql(row.get('ville', '')),
                convert_numeric(row.get('coordonnee_lambert_x', '')),
                convert_numeric(row.get('coordonnee_lambert_y', '')),
                escape_sql(row.get('code naf', ''))  # Attention à l'espace
            ]
            
            value_line = f"  ({', '.join(value_parts)})"
            values.append(value_line)
        
        # Joindre toutes les valeurs
        sql_lines.append(',\n'.join(values))
        
        # Ajouter la clause ON CONFLICT
        sql_lines.append("")
        sql_lines.append("ON CONFLICT (siret)")
        sql_lines.append("DO UPDATE SET")
        sql_lines.append("  nom = EXCLUDED.nom,")
        sql_lines.append("  date_creation = EXCLUDED.date_creation,")
        sql_lines.append("  est_siege = EXCLUDED.est_siege,")
        sql_lines.append("  categorie_juridique = EXCLUDED.categorie_juridique,")
        sql_lines.append("  categorie_entreprise = EXCLUDED.categorie_entreprise,")
        sql_lines.append("  complement_adresse = EXCLUDED.complement_adresse,")
        sql_lines.append("  numero_voie = EXCLUDED.numero_voie,")
        sql_lines.append("  type_voie = EXCLUDED.type_voie,")
        sql_lines.append("  libelle_voie = EXCLUDED.libelle_voie,")
        sql_lines.append("  code_postal = EXCLUDED.code_postal,")
        sql_lines.append("  ville = EXCLUDED.ville,")
        sql_lines.append("  coordonnee_lambert_x = EXCLUDED.coordonnee_lambert_x,")
        sql_lines.append("  coordonnee_lambert_y = EXCLUDED.coordonnee_lambert_y,")
        sql_lines.append("  code_naf = EXCLUDED.code_naf,")
        sql_lines.append("  updated_at = now();")
        sql_lines.append("")
        sql_lines.append("-- Vérification")
        sql_lines.append("SELECT COUNT(*) as total_insere")
        sql_lines.append("FROM nouveaux_sites")
        sql_lines.append("WHERE created_at >= NOW() - INTERVAL '5 minutes';")
    
    # Écrire le fichier SQL
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write('\n'.join(sql_lines))
    
    print(f"✅ Conversion terminée!")
    print(f"   {count} lignes traitées")
    print(f"   Fichier SQL généré: {output_file}")
    print(f"\n📋 Prochaines étapes:")
    print(f"   1. Ouvrir Supabase Dashboard")
    print(f"   2. Aller dans SQL Editor")
    print(f"   3. Copier-coller le contenu de {output_file}")
    print(f"   4. Cliquer sur 'Run'")

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: python3 convert_csv_to_sql.py votre_fichier.csv")
        print("\nLe fichier CSV doit être au format TSV (séparé par des tabulations)")
        print("avec ces colonnes:")
        print("  siret, Entreprise, date_creation, siege, categorie_juridique,")
        print("  categorie_entreprise, complement_adresse, numero_voie, type_voie,")
        print("  libelle_voie, code_postal, ville, coordonnee_lambert_x,")
        print("  coordonnee_lambert_y, code naf")
        sys.exit(1)
    
    csv_file = sys.argv[1]
    output_file = sys.argv[2] if len(sys.argv) > 2 else None
    
    try:
        csv_to_sql(csv_file, output_file)
    except FileNotFoundError:
        print(f"❌ Erreur: Fichier '{csv_file}' non trouvé")
    except Exception as e:
        print(f"❌ Erreur: {e}")
