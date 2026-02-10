#!/usr/bin/env python3
"""
Import direct de CSV vers Supabase pour PulseLead
Usage: python3 import_csv_direct.py database.csv
"""

import csv
import sys
import os
from datetime import datetime
from supabase import create_client, Client

# Configuration Supabase
SUPABASE_URL = os.environ.get('SUPABASE_URL', 'YOUR_SUPABASE_URL')
SUPABASE_KEY = os.environ.get('SUPABASE_SERVICE_ROLE_KEY', 'YOUR_SERVICE_ROLE_KEY')

# ⚠️ REMPLACE CES VALEURS ou utilise des variables d'environnement:
# export SUPABASE_URL="https://xxxxx.supabase.co"
# export SUPABASE_SERVICE_ROLE_KEY="eyJhbGc..."

def lambert93_to_wgs84(x, y):
    """Conversion Lambert 93 vers WGS84 (lat/lng)"""
    if not x or not y or x == 0 or y == 0:
        return None, None
    
    try:
        x = float(x)
        y = float(y)
        
        if x < 100000 or x > 1300000 or y < 6000000 or y > 7200000:
            return None, None
        
        # Paramètres Lambert 93
        import math
        n = 0.7256077650532670
        c = 11754255.426096
        xs = 700000
        ys = 12655612.049876
        e = 0.08181919106
        lambda0 = 3 * math.pi / 180
        
        dx = x - xs
        dy = ys - y
        R = math.sqrt(dx * dx + dy * dy)
        gamma = math.atan2(dx, dy)
        lambda_ = lambda0 + gamma / n
        L = -math.log(R / c) / n
        
        phi = 2 * math.atan(math.exp(L)) - math.pi / 2
        
        for _ in range(10):
            eSinPhi = e * math.sin(phi)
            phi = 2 * math.atan(
                math.pow((1 + eSinPhi) / (1 - eSinPhi), e / 2) * math.exp(L)
            ) - math.pi / 2
        
        lat = phi * 180 / math.pi
        lng = lambda_ * 180 / math.pi
        
        if lat < 41 or lat > 51.5 or lng < -5.5 or lng > 10:
            return None, None
        
        return lat, lng
    except:
        return None, None

def parse_date(date_str):
    """Parse date DD/MM/YYYY vers YYYY-MM-DD"""
    if not date_str:
        return None
    try:
        if '/' in date_str:
            parts = date_str.split('/')
            if len(parts) == 3:
                day, month, year = parts
                return f"{year}-{month.zfill(2)}-{day.zfill(2)}"
        return None
    except:
        return None

def get_naf_hierarchy(code_naf):
    """Extrait hiérarchie NAF"""
    if not code_naf:
        return None, None, None, None
    
    code = code_naf.replace('.', '').upper()
    
    division = code[:2] if len(code) >= 2 else None
    groupe = code[:3] if len(code) >= 3 else None
    classe = code[:4] if len(code) >= 4 else None
    
    # Section mapping
    section = None
    if division:
        try:
            div_num = int(division)
            if 1 <= div_num <= 3: section = 'A'
            elif 5 <= div_num <= 9: section = 'B'
            elif 10 <= div_num <= 33: section = 'C'
            elif div_num == 35: section = 'D'
            elif 36 <= div_num <= 39: section = 'E'
            elif 41 <= div_num <= 43: section = 'F'
            elif 45 <= div_num <= 47: section = 'G'
            elif 49 <= div_num <= 53: section = 'H'
            elif 55 <= div_num <= 56: section = 'I'
            elif 58 <= div_num <= 63: section = 'J'
            elif 64 <= div_num <= 66: section = 'K'
            elif div_num == 68: section = 'L'
            elif 69 <= div_num <= 75: section = 'M'
            elif 77 <= div_num <= 82: section = 'N'
            elif div_num == 84: section = 'O'
            elif div_num == 85: section = 'P'
            elif 86 <= div_num <= 88: section = 'Q'
            elif 90 <= div_num <= 93: section = 'R'
            elif 94 <= div_num <= 96: section = 'S'
            elif 97 <= div_num <= 98: section = 'T'
            elif div_num == 99: section = 'U'
        except:
            pass
    
    return section, division, groupe, classe

def main():
    if len(sys.argv) < 2:
        print("❌ Usage: python3 import_csv_direct.py database.csv")
        sys.exit(1)
    
    csv_file = sys.argv[1]
    
    if not os.path.exists(csv_file):
        print(f"❌ Fichier introuvable: {csv_file}")
        sys.exit(1)
    
    print("🚀 Import CSV vers Supabase PulseLead")
    print("=" * 50)
    
    # Initialize Supabase client
    try:
        supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
        print("✅ Connexion Supabase établie")
    except Exception as e:
        print(f"❌ Erreur connexion Supabase: {e}")
        print("\n⚠️ Configure les variables d'environnement:")
        print("export SUPABASE_URL='https://xxxxx.supabase.co'")
        print("export SUPABASE_SERVICE_ROLE_KEY='eyJhbGc...'")
        sys.exit(1)
    
    # Read CSV
    print(f"📄 Lecture du fichier: {csv_file}")
    
    data_to_insert = []
    
    with open(csv_file, 'r', encoding='utf-8-sig') as f:
        # Detect delimiter
        first_line = f.readline()
        delimiter = ';' if ';' in first_line else ','
        f.seek(0)
        
        reader = csv.DictReader(f, delimiter=delimiter)
        
        print(f"🔍 Séparateur détecté: '{delimiter}'")
        print(f"📋 Colonnes: {', '.join(reader.fieldnames or [])}")
        
        for i, row in enumerate(reader, 1):
            if i % 1000 == 0:
                print(f"  📊 Lecture ligne {i}...")
            
            siret = row.get('siret', '').strip()
            if not siret:
                continue
            
            # Parse coordinates
            lambert_x = row.get('coordonneeLambertAbscisseEtablissement', '').strip()
            lambert_y = row.get('coordonneeLambertOrdonneeEtablissement', '').strip()
            
            lat, lng = None, None
            if lambert_x and lambert_y:
                try:
                    lat, lng = lambert93_to_wgs84(float(lambert_x), float(lambert_y))
                except:
                    pass
            
            # Parse date
            date_creation = parse_date(row.get('date_creation', '').strip())
            
            # Parse siege
            siege_val = row.get('siege', '').strip().upper()
            est_siege = siege_val in ['VRAI', 'TRUE', '1', 'V', 'T', 'OUI']
            
            # NAF hierarchy
            code_naf = row.get('activitePrincipaleEtablissement', '').strip() or None
            naf_section, naf_division, naf_groupe, naf_classe = get_naf_hierarchy(code_naf)
            
            # Build record
            record = {
                'siret': siret,
                'nom': row.get('entreprise', '').strip() or 'Entreprise sans nom',
                'date_creation': date_creation,
                'est_siege': est_siege,
                'categorie_juridique': row.get('categorie_juridique', '').strip() or None,
                'categorie_entreprise': row.get('categorieEntreprise', '').strip() or 'PME',
                'complement_adresse': row.get('complementAdresseEtablissement', '').strip() or None,
                'numero_voie': row.get('numeroVoieEtablissement', '').strip() or None,
                'type_voie': row.get('typeVoieEtablissement', '').strip() or None,
                'libelle_voie': row.get('libelleVoieEtablissement', '').strip() or None,
                'code_postal': row.get('codePostalEtablissement', '').strip() or None,
                'ville': row.get('libelleCommuneEtablissement', '').strip() or None,
                'coordonnee_lambert_x': float(lambert_x) if lambert_x else None,
                'coordonnee_lambert_y': float(lambert_y) if lambert_y else None,
                'latitude': lat,
                'longitude': lng,
                'code_naf': code_naf,
                'naf_section': naf_section,
                'naf_division': naf_division,
                'naf_groupe': naf_groupe,
                'naf_classe': naf_classe,
                'adresse': ' '.join(filter(None, [
                    row.get('numeroVoieEtablissement', '').strip(),
                    row.get('typeVoieEtablissement', '').strip(),
                    row.get('libelleVoieEtablissement', '').strip()
                ])) or None
            }
            
            data_to_insert.append(record)
    
    print(f"✅ {len(data_to_insert)} lignes valides à importer")
    
    # Insert in batches
    BATCH_SIZE = 200
    total_inserted = 0
    total_errors = 0
    
    print(f"\n📦 Import en batches de {BATCH_SIZE}...")
    
    for i in range(0, len(data_to_insert), BATCH_SIZE):
        batch = data_to_insert[i:i + BATCH_SIZE]
        batch_num = i // BATCH_SIZE + 1
        total_batches = (len(data_to_insert) + BATCH_SIZE - 1) // BATCH_SIZE
        
        print(f"  📤 Batch {batch_num}/{total_batches} ({len(batch)} records)...", end='')
        
        try:
            response = supabase.table('nouveaux_sites').upsert(
                batch,
                on_conflict='siret',
                ignore_duplicates=False
            ).execute()
            
            print(f" ✅")
            total_inserted += len(batch)
        except Exception as e:
            print(f" ❌ Erreur: {e}")
            total_errors += len(batch)
    
    print("\n" + "=" * 50)
    print(f"🎉 Import terminé!")
    print(f"  ✅ Insérés: {total_inserted}")
    print(f"  ❌ Erreurs: {total_errors}")
    print(f"  📊 Total: {len(data_to_insert)}")

if __name__ == '__main__':
    main()
