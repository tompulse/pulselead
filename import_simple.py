#!/usr/bin/env python3
"""
Import ULTRA SIMPLE via l'API Supabase
Utilise les variables d'environnement déjà configurées
"""

import os
import csv
import sys
from urllib.request import Request, urlopen
import json
import time
import ssl

def import_csv_to_supabase(csv_file):
    """Import direct du CSV vers Supabase"""
    
    # Récupérer les credentials depuis les variables d'environnement
    supabase_url = os.getenv('VITE_SUPABASE_URL')
    supabase_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
    
    if not supabase_url or not supabase_key:
        print("❌ Variables d'environnement manquantes!")
        print("\n🔑 Il faut la clé SERVICE_ROLE (pas anon) pour contourner le RLS")
        print("\nVa sur Supabase Dashboard > Project Settings > API")
        print("Copie la clé 'service_role' (section 'Project API keys')")
        print("\n")
        supabase_url = input("SUPABASE_URL: ").strip()
        supabase_key = input("SERVICE_ROLE_KEY (commence par eyJ...): ").strip()
    
    print(f"\n✅ URL Supabase: {supabase_url[:30]}...")
    print(f"✅ Clé API: {supabase_key[:20]}...")
    
    # Lire le CSV
    print(f"\n📂 Lecture de {csv_file}...")
    
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
    
    print(f"✅ {len(data)} lignes à importer")
    
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
        
        # IMPORTANT: Tous les enregistrements doivent avoir EXACTEMENT les mêmes clés
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
    
    # Import par batch de 100
    batch_size = 100
    total_batches = (len(records) + batch_size - 1) // batch_size
    imported = 0
    errors = 0
    
    print(f"\n🚀 Import en {total_batches} lots de {batch_size}...")
    
    url = f"{supabase_url}/rest/v1/nouveaux_sites"
    
    # Créer un contexte SSL qui ignore la vérification (pour macOS)
    ssl_context = ssl.create_default_context()
    ssl_context.check_hostname = False
    ssl_context.verify_mode = ssl.CERT_NONE
    
    for i in range(0, len(records), batch_size):
        batch = records[i:i + batch_size]
        batch_num = (i // batch_size) + 1
        
        # Préparer la requête
        headers = {
            'apikey': supabase_key,
            'Authorization': f'Bearer {supabase_key}',
            'Content-Type': 'application/json',
            'Prefer': 'resolution=merge-duplicates'
        }
        
        data_json = json.dumps(batch).encode('utf-8')
        
        try:
            req = Request(url, data=data_json, headers=headers, method='POST')
            response = urlopen(req, timeout=30, context=ssl_context)
            response_data = response.read().decode('utf-8')
            
            imported += len(batch)
            print(f"  ✅ Lot {batch_num}/{total_batches} : {len(batch)} insérés (Total: {imported}/{len(records)})")
            
        except Exception as e:
            errors += len(batch)
            
            # Debug complet
            print(f"\n  ❌ Lot {batch_num}/{total_batches} - ERREUR:")
            print(f"     Type: {type(e).__name__}")
            print(f"     Message: {str(e)}")
            
            # Si c'est une HTTPError, lire le corps de la réponse
            if hasattr(e, 'fp') and e.fp:
                try:
                    error_body = e.fp.read().decode('utf-8')
                    print(f"     Réponse: {error_body[:300]}")
                except:
                    pass
            
            # Afficher les headers de la requête pour debug
            if batch_num == 1:
                print(f"\n     🔍 Debug première requête:")
                print(f"     URL: {url}")
                print(f"     Headers: apikey={supabase_key[:20]}...")
                print(f"     Premier record: {json.dumps(batch[0], indent=2)[:500]}")
            
            print()  # Ligne vide
        
        time.sleep(0.5)  # Pause pour éviter rate limiting
    
    print(f"\n🎉 Import terminé!")
    print(f"   ✅ {imported} importés")
    if errors > 0:
        print(f"   ❌ {errors} erreurs")
    
    print(f"\n📊 Vérification:")
    print(f"   Allez sur: {supabase_url.replace('https://', 'https://supabase.com/dashboard/project/')}")
    print(f"   Ou sur votre app: /nouveaux-sites")

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: python3 import_simple.py 'votre_fichier.csv'")
        sys.exit(1)
    
    csv_file = sys.argv[1]
    import_csv_to_supabase(csv_file)
