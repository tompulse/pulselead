#!/usr/bin/env python3
"""
Script d'import automatique CSV → Supabase
Usage: python3 import_csv_automatique.py public/nouveaux-sites.csv
"""

import csv
import os
import sys
from supabase import create_client, Client

# Configuration
SUPABASE_URL = os.getenv("SUPABASE_URL", "https://xvggbkivkdshbdvtvheo.supabase.co")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

if not SUPABASE_KEY:
    print("❌ ERREUR: export SUPABASE_SERVICE_KEY='...'")
    sys.exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# NAF mapping
NAF_SECTIONS = {
    "01": "A", "02": "A", "03": "A",
    "05": "B", "06": "B", "07": "B", "08": "B", "09": "B",
    "10": "C", "11": "C", "12": "C", "13": "C", "14": "C", "15": "C",
    "16": "C", "17": "C", "18": "C", "19": "C", "20": "C", "21": "C",
    "22": "C", "23": "C", "24": "C", "25": "C", "26": "C", "27": "C",
    "28": "C", "29": "C", "30": "C", "31": "C", "32": "C", "33": "C",
    "35": "D",
    "36": "E", "37": "E", "38": "E", "39": "E",
    "41": "F", "42": "F", "43": "F",
    "45": "G", "46": "G", "47": "G",
    "49": "H", "50": "H", "51": "H", "52": "H", "53": "H",
    "55": "I", "56": "I",
    "58": "J", "59": "J", "60": "J", "61": "J", "62": "J", "63": "J",
    "64": "K", "65": "K", "66": "K",
    "68": "L",
    "69": "M", "70": "M", "71": "M", "72": "M", "73": "M", "74": "M", "75": "M",
    "77": "N", "78": "N", "79": "N", "80": "N", "81": "N", "82": "N",
    "84": "O",
    "85": "P",
    "86": "Q", "87": "Q", "88": "Q",
    "90": "R", "91": "R", "92": "R", "93": "R",
    "94": "S", "95": "S", "96": "S",
}

def parse_row(row):
    """Parse une ligne CSV et retourne un dict Supabase"""
    siret = row.get('siret', '').strip()
    if not siret or len(siret) < 14:
        return None
    
    # Nom
    nom = row.get('Entreprise', '').strip() or row.get('denominationUsuelleEtablissement', '').strip()
    if not nom:
        nom_famille = row.get('nomUniteLegale', '').strip()
        prenom = row.get('prenom1UniteLegale', '').strip()
        nom = f"{prenom} {nom_famille}".strip() if prenom else nom_famille
    if not nom:
        nom = f"Entreprise {siret[:9]}"
    
    # Date (DD/MM/YYYY → YYYY-MM-DD)
    date_str = row.get('dateCreationEtablissement', '').strip()
    date_creation = None
    if date_str:
        parts = date_str.split('/')
        if len(parts) == 3:
            date_creation = f"{parts[2]}-{parts[1]}-{parts[0]}"
    
    # Coordonnées Lambert → GPS
    lambert_x = row.get('coordonneeLambertAbscisseEtablissement', '').strip()
    lambert_y = row.get('coordonneeLambertOrdonneeEtablissement', '').strip()
    lat, lng = None, None
    if lambert_x and lambert_y:
        try:
            x = float(lambert_x)
            y = float(lambert_y)
            lat = 42.0 + (y - 6200000) / 111000
            lng = 3.0 + (x - 700000) / 75000
        except:
            pass
    
    # Code NAF + hiérarchie complète
    code_naf = row.get('activitePrincipaleEtablissement', '').strip()
    naf_section, naf_division, naf_groupe, naf_classe = None, None, None, None
    if code_naf and len(code_naf) >= 2:
        naf_prefix = code_naf[:2]
        naf_section = NAF_SECTIONS.get(naf_prefix)
        naf_division = code_naf[:2]
        naf_groupe = code_naf[:4] if len(code_naf) >= 4 else None
        naf_classe = code_naf[:5] if len(code_naf) >= 5 else None
    
    # Catégorie entreprise
    cat = row.get('categorieEntreprise', '').strip()
    categorie = 'PME'
    if cat == 'GE': categorie = 'GE'
    elif cat in ['ET', 'ETI']: categorie = 'ETI'
    
    # Adresse
    numero = row.get('numeroVoieEtablissement', '').strip()
    type_v = row.get('typeVoieEtablissement', '').strip()
    libelle = row.get('libelleVoieEtablissement', '').strip()
    complement = row.get('complementAdresseEtablissement', '').strip()
    code_postal = row.get('codePostalEtablissement', '').strip()
    ville = row.get('libelleCommuneEtablissement', '').strip()
    
    adresse_parts = [complement, numero, type_v, libelle]
    adresse = ' '.join([p for p in adresse_parts if p]).strip()[:500]
    
    return {
        "siret": siret,
        "nom": nom[:255],
        "date_creation": date_creation,
        "est_siege": row.get('etablissementSiege', '').strip().upper() in ['VRAI', 'TRUE', '1'],
        "categorie_juridique": row.get('categorieJuridique', '').strip() or 'Non spécifié',
        "categorie_entreprise": categorie,
        "complement_adresse": complement[:255] if complement else None,
        "numero_voie": numero or None,
        "type_voie": type_v or None,
        "libelle_voie": libelle[:255] if libelle else None,
        "code_postal": code_postal or None,
        "ville": ville[:255] if ville else None,
        "coordonnee_lambert_x": float(lambert_x) if lambert_x else None,
        "coordonnee_lambert_y": float(lambert_y) if lambert_y else None,
        "latitude": lat,
        "longitude": lng,
        "code_naf": code_naf or None,
        "naf_section": naf_section,
        "naf_division": naf_division,
        "naf_groupe": naf_groupe,
        "naf_classe": naf_classe,
        "adresse": adresse or None,
        "archived": False
    }

def main(csv_path):
    print("="*60)
    print("🚀 IMPORT AUTOMATIQUE CSV → SUPABASE")
    print("="*60)
    print(f"📁 Fichier: {csv_path}\n")
    
    if not os.path.exists(csv_path):
        print(f"❌ Fichier introuvable: {csv_path}")
        sys.exit(1)
    
    # Détection encodage
    encodings = ['utf-8', 'iso-8859-1', 'windows-1252']
    f = None
    for enc in encodings:
        try:
            f = open(csv_path, 'r', encoding=enc)
            next(csv.DictReader(f, delimiter=';'))
            f.seek(0)
            print(f"✓ Encodage détecté: {enc}")
            break
        except:
            if f: f.close()
            continue
    
    if not f:
        print("❌ Impossible de lire le CSV")
        sys.exit(1)
    
    # Phase 1: Import
    print("\n📥 PHASE 1: Import des entreprises...")
    reader = csv.DictReader(f, delimiter=';')
    batch = []
    sirets_csv = set()
    imported = 0
    errors = 0
    
    for i, row in enumerate(reader, 1):
        entreprise = parse_row(row)
        if entreprise:
            batch.append(entreprise)
            sirets_csv.add(entreprise['siret'])
            
            if len(batch) >= 100:
                try:
                    supabase.table("nouveaux_sites").upsert(batch, on_conflict="siret").execute()
                    imported += len(batch)
                    print(f"   ✓ {imported} importées...")
                    batch = []
                except Exception as e:
                    print(f"   ❌ Erreur: {e}")
                    errors += len(batch)
                    batch = []
        else:
            errors += 1
    
    # Dernier batch
    if batch:
        try:
            supabase.table("nouveaux_sites").upsert(batch, on_conflict="siret").execute()
            imported += len(batch)
        except Exception as e:
            print(f"   ❌ Erreur finale: {e}")
            errors += len(batch)
    
    f.close()
    
    # Phase 2: Archivage
    print(f"\n🗄️  PHASE 2: Archivage des entreprises absentes...")
    try:
        result = supabase.table("nouveaux_sites").select("siret").eq("archived", False).execute()
        sirets_db = {row["siret"] for row in result.data}
        sirets_to_archive = sirets_db - sirets_csv
        
        if sirets_to_archive:
            from datetime import datetime
            archive_batch = []
            for siret in sirets_to_archive:
                archive_batch.append({
                    "siret": siret,
                    "archived": True,
                    "date_archive": datetime.now().isoformat()
                })
                if len(archive_batch) >= 100:
                    supabase.table("nouveaux_sites").upsert(archive_batch, on_conflict="siret").execute()
                    archive_batch = []
            if archive_batch:
                supabase.table("nouveaux_sites").upsert(archive_batch, on_conflict="siret").execute()
            print(f"   ✓ {len(sirets_to_archive)} archivées")
        else:
            print(f"   ✓ Aucune à archiver")
    except Exception as e:
        print(f"   ⚠️  Erreur archivage: {e}")
    
    # Résumé
    print("\n" + "="*60)
    print("📊 RÉSUMÉ")
    print("="*60)
    print(f"✅ Importées: {imported}")
    print(f"🗄️  Archivées: {len(sirets_to_archive) if 'sirets_to_archive' in locals() else 0}")
    print(f"❌ Erreurs: {errors}")
    print("="*60)
    print("\n✅ TERMINÉ ! Les données sont visibles dans l'app.")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python3 import_csv_automatique.py public/nouveaux-sites.csv")
        sys.exit(1)
    
    main(sys.argv[1])
