#!/usr/bin/env python3
"""
Import direct de CSV vers Supabase pour PulseLead
Usage: python3 import_csv_direct.py database.csv
"""

import csv
import sys
import os
import math
import json
import ssl
import urllib.request
from datetime import datetime

# Contexte SSL (évite CERTIFICATE_VERIFY_FAILED sur Mac)
_SSL_CTX = ssl._create_unverified_context() if getattr(ssl, '_create_unverified_context', None) else ssl.create_default_context()


def _to_serializable(val):
    """Une seule valeur -> type JSON sûr (str, int, float, bool, None)."""
    if val is None:
        return None
    if isinstance(val, bool):
        return val
    if isinstance(val, int):
        return int(val)
    if isinstance(val, float):
        if math.isnan(val) or math.isinf(val):
            return None
        return float(val)
    if isinstance(val, (bytes, bytearray)):
        val = val.decode('utf-8', errors='replace')
    if isinstance(val, str):
        # Caractères de contrôle / non-UTF-8 peuvent casser le JSON côté API
        val = ''.join(c for c in val if ord(c) >= 32 or c in '\n\r\t')
        return val
    if isinstance(val, datetime):
        return val.isoformat()
    return str(val)


def sanitize_for_json(obj):
    """Rend un dict 100% sérialisable JSON (évite erreur 405)."""
    if obj is None:
        return None
    if isinstance(obj, dict):
        return {str(k): _to_serializable(v) for k, v in obj.items()}
    if isinstance(obj, (list, tuple)):
        return [_to_serializable(x) for x in obj]
    return _to_serializable(obj)


def safe_float(val):
    """Convertit en float ou None (évite NaN)."""
    if val is None or val == '':
        return None
    try:
        f = float(val)
        return None if math.isnan(f) or math.isinf(f) else f
    except (ValueError, TypeError):
        return None


def upsert_batch_rest(url: str, key: str, batch: list) -> None:
    """Insert/upsert via REST PostgREST (évite bug 405 du client Python)."""
    if not url or url.startswith('YOUR_'):
        raise ValueError('SUPABASE_URL non configuré')
    if not key or key.startswith('YOUR_'):
        raise ValueError('SUPABASE_SERVICE_ROLE_KEY non configuré')
    endpoint = f"{url.rstrip('/')}/rest/v1/nouveaux_sites"
    body = json.dumps(batch).encode('utf-8')
    req = urllib.request.Request(
        endpoint,
        data=body,
        method='POST',
        headers={
            'Content-Type': 'application/json',
            'apikey': key,
            'Authorization': f'Bearer {key}',
            'Prefer': 'resolution=merge-duplicates, on_conflict=siret',
        },
    )
    with urllib.request.urlopen(req, timeout=60, context=_SSL_CTX) as resp:
        if resp.status not in (200, 201):
            raise Exception(f"HTTP {resp.status}: {resp.read()}")


# Configuration Supabase
SUPABASE_URL = os.environ.get('SUPABASE_URL', 'YOUR_SUPABASE_URL').rstrip('/')
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
        print("Usage: python3 import_csv_direct.py <ton_fichier.csv>")
        print("")
        print("Mettre à jour la base (même fichier, mêmes colonnes):")
        print("  1. Exporte ton CSV avec les mêmes colonnes qu’avant")
        print("  2. Dans le terminal: cd vers le dossier du projet")
        print("  3. export SUPABASE_URL='...'  et  export SUPABASE_SERVICE_ROLE_KEY='...'")
        print("  4. python3 import_csv_direct.py database.csv")
        print("")
        print("Les lignes sont fusionnées par SIRET (même SIRET = mise à jour, nouveau SIRET = ajout).")
        sys.exit(1)
    
    csv_file = sys.argv[1]
    
    # Si le chemin n'existe pas, essayer dans le dossier du script (où est souvent database.csv)
    if not os.path.exists(csv_file):
        script_dir = os.path.dirname(os.path.abspath(__file__))
        fallback = os.path.join(script_dir, os.path.basename(csv_file))
        if os.path.exists(fallback):
            csv_file = fallback
            print(f"📂 Fichier trouvé dans le dossier du projet: {csv_file}")
        else:
            print(f"❌ Fichier introuvable: {sys.argv[1]}")
            print(f"   Cherché aussi ici: {fallback}")
            print("\n💡 Astuce: va dans le dossier du projet puis relance:")
            print(f"   cd {script_dir}")
            print(f"   python3 import_csv_direct.py database.csv")
            sys.exit(1)
    
    print("🚀 Import CSV vers Supabase PulseLead")
    print("=" * 50)
    
    if not SUPABASE_URL or SUPABASE_URL.startswith('YOUR_') or not SUPABASE_KEY or SUPABASE_KEY.startswith('YOUR_'):
        print("❌ Configure d'abord les variables d'environnement:")
        print("  export SUPABASE_URL='https://xxxxx.supabase.co'")
        print("  export SUPABASE_SERVICE_ROLE_KEY='eyJhbGc...'")
        sys.exit(1)
    print("✅ Config Supabase OK")
    
    # Read CSV (plusieurs encodages au cas où)
    print(f"📄 Lecture du fichier: {csv_file}")
    data_to_insert = []
    encodings = ('utf-8-sig', 'utf-8', 'latin-1', 'cp1252', 'iso-8859-1')
    f = None
    for enc in encodings:
        try:
            f = open(csv_file, 'r', encoding=enc)
            first_line = f.readline()
            f.seek(0)
            break
        except (UnicodeDecodeError, UnicodeError):
            if f:
                f.close()
                f = None
            continue
    if f is None:
        print("❌ Impossible de lire le fichier (encodage non reconnu). Essaye UTF-8 ou Latin-1.")
        sys.exit(1)
    
    with f:
        delimiter = ';' if ';' in first_line else ','
        f.seek(0)
        reader = csv.DictReader(f, delimiter=delimiter)
        fieldnames = reader.fieldnames or []
        # Colonnes insensibles à la casse: nom normalisé (minuscule) -> nom réel dans le CSV
        col = {str(h).strip().lower(): str(h).strip() for h in fieldnames}
        def get(row, *candidates):
            for c in candidates:
                r = col.get(c.lower(), c)
                if r and r in row:
                    v = row.get(r, '')
                    return v if v is not None else ''
            return ''
        
        print(f"🔍 Séparateur: '{delimiter}'")
        print(f"📋 Colonnes ({len(fieldnames)}): {', '.join(fieldnames[:15])}{'...' if len(fieldnames) > 15 else ''}")
        
        for i, row in enumerate(reader, 1):
            if i % 10000 == 0:
                print(f"  📊 Lecture ligne {i}...")
            
            siret = (get(row, 'siret', 'SIRET') or '').strip()
            if not siret:
                continue
            siret = str(siret).replace('.0', '').split('.')[0]  # au cas où nombre
            
            lambert_x = (get(row, 'coordonneeLambertAbscisseEtablissement', 'coordonnee_lambert_x') or '').strip()
            lambert_y = (get(row, 'coordonneeLambertOrdonneeEtablissement', 'coordonnee_lambert_y') or '').strip()
            lat, lng = None, None
            lx, ly = safe_float(lambert_x), safe_float(lambert_y)
            if lx is not None and ly is not None:
                lat, lng = lambert93_to_wgs84(lx, ly)
            
            date_creation = parse_date((get(row, 'date_creation', 'dateCreation') or '').strip())
            siege_val = (get(row, 'siege', 'Siege') or '').strip().upper()
            est_siege = siege_val in ('VRAI', 'TRUE', '1', 'V', 'T', 'OUI')
            
            code_naf = (get(row, 'activitePrincipaleEtablissement', 'activite_principale', 'code_naf') or '').strip() or None
            naf_section, naf_division, naf_groupe, naf_classe = get_naf_hierarchy(code_naf)
            
            record = {
                'siret': siret,
                'nom': (get(row, 'entreprise', 'Entreprise', 'nom', 'nom_entreprise') or '').strip() or 'Entreprise sans nom',
                'date_creation': date_creation,
                'est_siege': est_siege,
                'categorie_juridique': (get(row, 'categorie_juridique', 'categorieJuridique') or '').strip() or None,
                'categorie_entreprise': (get(row, 'categorieEntreprise', 'categorie_entreprise') or '').strip() or 'PME',
                'complement_adresse': (get(row, 'complementAdresseEtablissement', 'complement_adresse') or '').strip() or None,
                'numero_voie': (get(row, 'numeroVoieEtablissement', 'numero_voie') or '').strip() or None,
                'type_voie': (get(row, 'typeVoieEtablissement', 'type_voie') or '').strip() or None,
                'libelle_voie': (get(row, 'libelleVoieEtablissement', 'libelle_voie') or '').strip() or None,
                'code_postal': (get(row, 'codePostalEtablissement', 'code_postal') or '').strip() or None,
                'ville': (get(row, 'libelleCommuneEtablissement', 'ville', 'commune') or '').strip() or None,
                'coordonnee_lambert_x': safe_float(lambert_x),
                'coordonnee_lambert_y': safe_float(lambert_y),
                'latitude': lat,
                'longitude': lng,
                'code_naf': code_naf,
                'naf_section': naf_section,
                'naf_division': naf_division,
                'naf_groupe': naf_groupe,
                'naf_classe': naf_classe,
                'adresse': ' '.join(filter(None, [
                    (get(row, 'numeroVoieEtablissement', 'numero_voie') or '').strip(),
                    (get(row, 'typeVoieEtablissement', 'type_voie') or '').strip(),
                    (get(row, 'libelleVoieEtablissement', 'libelle_voie') or '').strip()
                ])) or None
            }
            data_to_insert.append(record)
    
    if not data_to_insert:
        print("❌ Aucune ligne valide (il faut au moins une colonne 'siret' ou 'SIRET' avec des valeurs).")
        print("   Vérifie que ton CSV a un séparateur ; ou , et des en-têtes corrects.")
        sys.exit(1)
    print(f"✅ {len(data_to_insert)} lignes valides à importer")
    
    # Insert in batches (100 pour limiter la taille du payload et éviter 405)
    BATCH_SIZE = 100
    total_inserted = 0
    total_errors = 0
    
    print(f"\n📦 Import en batches de {BATCH_SIZE}...")
    
    for i in range(0, len(data_to_insert), BATCH_SIZE):
        batch = data_to_insert[i:i + BATCH_SIZE]
        batch_num = i // BATCH_SIZE + 1
        total_batches = (len(data_to_insert) + BATCH_SIZE - 1) // BATCH_SIZE
        
        print(f"  📤 Batch {batch_num}/{total_batches} ({len(batch)} records)...", end='')
        
        # Nettoyer pour JSON strict (évite erreur 405 côté Supabase)
        batch_clean = [sanitize_for_json(r) for r in batch]
        
        # Vérifier que le batch est bien sérialisable avant envoi
        try:
            json.dumps(batch_clean)
        except (TypeError, ValueError) as je:
            print(f" ❌ JSON invalide: {je}")
            total_errors += len(batch)
            continue
        
        try:
            # Envoi via REST PostgREST pour éviter erreur 405 "JSON could not be generated"
            upsert_batch_rest(SUPABASE_URL, SUPABASE_KEY, batch_clean)
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
