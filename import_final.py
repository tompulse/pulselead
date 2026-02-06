#!/usr/bin/env python3
"""
Import FINAL - Utilise supabase-py pour un import fiable
"""

import csv
import sys

def import_csv(csv_file, supabase_url, service_key):
    """Import avec la vraie lib supabase-py"""
    
    try:
        from supabase import create_client, Client
    except ImportError:
        print("❌ Bibliothèque supabase manquante!")
        print("\nInstallation:")
        print("  pip3 install supabase")
        print("\nPuis relancez ce script")
        sys.exit(1)
    
    print(f"✅ Connexion à Supabase...")
    supabase: Client = create_client(supabase_url, service_key)
    
    # Lire le CSV
    print(f"📂 Lecture de {csv_file}...")
    
    encodings = ['utf-8', 'latin-1', 'iso-8859-1', 'cp1252']
    data = None
    
    for encoding in encodings:
        try:
            with open(csv_file, 'r', encoding=encoding) as f:
                first_line = f.readline()
                delimiter = ';' if ';' in first_line else ('\t' if '\t' in first_line else ',')
                f.seek(0)
                reader = csv.DictReader(f, delimiter=delimiter)
                data = list(reader)
            print(f"✅ Encodage: {encoding}, Séparateur: '{delimiter}'")
            break
        except:
            continue
    
    if not data:
        print("❌ Impossible de lire le fichier")
        return
    
    print(f"✅ {len(data)} lignes à traiter")
    
    # Préparer les données
    records = []
    for i, row in enumerate(data, 1):
        siret = row.get('siret', '').strip()
        nom = row.get('Entreprise', '').strip()
        
        if not siret or len(siret) != 14 or not nom:
            continue
        
        # Conversion date
        date_str = row.get('date_creation', '')
        date_creation = None
        if date_str:
            try:
                parts = date_str.split('/')
                if len(parts) == 3:
                    date_creation = f"{parts[2]}-{parts[1]}-{parts[0]}"
            except:
                pass
        
        # Conversion booléen
        siege_str = row.get('siege', '').strip().upper()
        est_siege = siege_str in ['VRAI', 'TRUE', '1', 'OUI']
        
        # Coordonnées Lambert
        lambert_x = None
        lambert_y = None
        try:
            lambert_x_str = row.get('coordonnee_lambert_x', '').strip()
            lambert_y_str = row.get('coordonnee_lambert_y', '').strip()
            if lambert_x_str and lambert_y_str:
                lambert_x = float(lambert_x_str)
                lambert_y = float(lambert_y_str)
        except:
            pass
        
        record = {
            'siret': siret,
            'nom': nom,
            'date_creation': date_creation,
            'est_siege': est_siege,
            'categorie_juridique': row.get('categorie_juridique', '').strip() or None,
            'categorie_entreprise': row.get('categorie_entreprise', '').strip() or None,
            'complement_adresse': row.get('complement_adresse', '').strip() or None,
            'numero_voie': row.get('numero_voie', '').strip() or None,
            'type_voie': row.get('type_voie', '').strip() or None,
            'libelle_voie': row.get('libelle_voie', '').strip() or None,
            'code_postal': row.get('code_postal', '').strip() or None,
            'ville': row.get('ville', '').strip() or None,
            'code_naf': row.get('code_naf', '').strip() or None,
            'coordonnee_lambert_x': lambert_x,
            'coordonnee_lambert_y': lambert_y,
        }
        
        records.append(record)
    
    print(f"✅ {len(records)} enregistrements valides")
    
    # Import par batch
    batch_size = 100
    total_batches = (len(records) + batch_size - 1) // batch_size
    imported = 0
    errors = 0
    
    print(f"\n🚀 Import en {total_batches} lots de {batch_size}...")
    
    for i in range(0, len(records), batch_size):
        batch = records[i:i + batch_size]
        batch_num = (i // batch_size) + 1
        
        try:
            # Upsert avec supabase-py
            result = supabase.table('nouveaux_sites').upsert(
                batch,
                on_conflict='siret'
            ).execute()
            
            imported += len(batch)
            print(f"  ✅ Lot {batch_num}/{total_batches} : {len(batch)} insérés (Total: {imported}/{len(records)})")
            
        except Exception as e:
            errors += len(batch)
            print(f"  ❌ Lot {batch_num}/{total_batches} : {str(e)[:200]}")
    
    print(f"\n🎉 Import terminé!")
    print(f"   ✅ {imported} importés")
    if errors > 0:
        print(f"   ❌ {errors} erreurs")

if __name__ == '__main__':
    if len(sys.argv) < 4:
        print("Usage: python3 import_final.py 'fichier.csv' 'SUPABASE_URL' 'SERVICE_ROLE_KEY'")
        print("\nExemple:")
        print("  python3 import_final.py 'data.csv' 'https://xxx.supabase.co' 'eyJxxx...'")
        sys.exit(1)
    
    csv_file = sys.argv[1]
    supabase_url = sys.argv[2]
    service_key = sys.argv[3]
    
    import_csv(csv_file, supabase_url, service_key)
