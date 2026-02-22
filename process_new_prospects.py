#!/usr/bin/env python3
"""
Script de traitement des 9000 nouveaux prospects
- Correction des codes postaux (4 chiffres → 0 + 4 chiffres)
- Géocodage (latitude/longitude)
- Attribution secteur d'activité selon code NAF
- Validation date de création

Usage: python3 process_new_prospects.py
"""

import os
import sys
import time
import json
import math
import requests
from datetime import datetime
from typing import Optional, Tuple, Dict, List

try:
    from supabase import create_client, Client
except ImportError:
    print("❌ Module 'supabase' non installé")
    print("   Installe-le avec: pip install supabase")
    sys.exit(1)

# Configuration
SUPABASE_URL = os.getenv("SUPABASE_URL", "https://ywavxjmbsywpjzchuuho.supabase.co")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

if not SUPABASE_KEY:
    print("❌ SUPABASE_SERVICE_KEY non définie")
    print("   Définissez-la avec: export SUPABASE_SERVICE_KEY='votre_cle'")
    sys.exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Mappage NAF sections vers secteurs d'activité
SECTEUR_TO_NAF_SECTIONS = {
    'Alimentaire': ['10', '11'],
    'BTP & Construction': ['16', '23', '41', '42', '43'],
    'Automobile': ['29', '30', '45'],
    'Commerce & Distribution': ['46', '47'],
    'Hôtellerie & Restauration': ['55', '56'],
    'Transport & Logistique': ['49', '50', '51', '52', '53'],
    'Informatique & Digital': ['58', '59', '60', '61', '62', '63'],
    'Santé & Médical': ['86', '87', '88'],
    'Services personnels': ['95', '96'],
    'Autres': ['01', '02', '03', '05', '06', '07', '08', '09', '12', '13', '14', 
               '15', '17', '18', '19', '20', '21', '22', '24', '25', '26', '27', 
               '28', '31', '32', '33', '35', '36', '37', '38', '39', '64', '65', 
               '66', '68', '69', '70', '71', '72', '73', '74', '75', '77', '78', 
               '79', '80', '81', '82', '84', '85', '90', '91', '92', '93', '94', 
               '97', '98', '99']
}

def get_secteur_from_naf(code_naf: Optional[str]) -> str:
    """Détermine le secteur d'activité selon le code NAF"""
    if not code_naf or code_naf == '' or code_naf == 'null':
        return 'Autres'
    
    # Extraire les 2 premiers chiffres (section NAF)
    section = code_naf.replace('.', '').replace(' ', '')[:2]
    
    for secteur, sections in SECTEUR_TO_NAF_SECTIONS.items():
        if section in sections:
            return secteur
    
    return 'Autres'

def fix_code_postal(code_postal: Optional[str]) -> Optional[str]:
    """Corrige les codes postaux: 4 chiffres → 0 + 4 chiffres"""
    if not code_postal:
        return None
    
    # Nettoyer le code postal
    code = str(code_postal).strip().replace(' ', '')
    
    # Si c'est un nombre avec .0, enlever le .0
    if code.endswith('.0'):
        code = code[:-2]
    
    # Garder uniquement les chiffres
    code = ''.join(c for c in code if c.isdigit())
    
    if not code:
        return None
    
    # Si 4 chiffres, ajouter un 0 devant
    if len(code) == 4:
        return '0' + code
    
    # Si 5 chiffres, c'est bon
    if len(code) == 5:
        return code
    
    # Si 3 chiffres ou moins, ajouter des 0 devant
    if len(code) < 5:
        return code.zfill(5)
    
    # Si plus de 5 chiffres, garder les 5 premiers
    return code[:5]

def validate_date(date_str: Optional[str]) -> Optional[str]:
    """Valide et formate la date de création (retourne YYYY-MM-DD ou None)"""
    if not date_str:
        return None
    
    date_str = str(date_str).strip()
    
    # Format DD/MM/YYYY
    if '/' in date_str:
        try:
            parts = date_str.split('/')
            if len(parts) == 3:
                day, month, year = parts
                # Valider les valeurs
                d, m, y = int(day), int(month), int(year)
                if 1 <= m <= 12 and 1 <= d <= 31 and 1800 <= y <= 2026:
                    return f"{year.zfill(4)}-{month.zfill(2)}-{day.zfill(2)}"
        except (ValueError, AttributeError):
            pass
    
    # Format YYYY-MM-DD (déjà bon)
    if '-' in date_str and len(date_str) >= 8:
        try:
            parts = date_str.split('-')
            if len(parts) == 3:
                year, month, day = parts
                y, m, d = int(year), int(month), int(day)
                if 1 <= m <= 12 and 1 <= d <= 31 and 1800 <= y <= 2026:
                    return f"{year.zfill(4)}-{month.zfill(2)}-{day.zfill(2)}"
        except (ValueError, AttributeError):
            pass
    
    return None

def geocode_address(adresse: str, ville: str, code_postal: str) -> Tuple[Optional[float], Optional[float]]:
    """Géocode une adresse via Mapbox Geocoding API"""
    if not ville and not adresse:
        return None, None
    
    # Construire la requête d'adresse
    query_parts = []
    if adresse:
        query_parts.append(adresse)
    if code_postal:
        query_parts.append(code_postal)
    if ville:
        query_parts.append(ville)
    
    query = ', '.join(query_parts) + ', France'
    
    # Token Mapbox (à configurer)
    mapbox_token = os.getenv("MAPBOX_TOKEN")
    if not mapbox_token:
        # Essayer d'utiliser l'edge function Supabase à la place
        try:
            response = supabase.functions.invoke(
                "geocode-entreprise",
                invoke_options={
                    "body": {
                        "adresse": adresse,
                        "ville": ville,
                        "code_postal": code_postal
                    }
                }
            )
            
            data = response.data if hasattr(response, 'data') else response.get("data", {})
            if data and data.get("latitude") and data.get("longitude"):
                return data["latitude"], data["longitude"]
        except Exception as e:
            print(f"      ⚠️ Géocodage échoué: {e}")
        return None, None
    
    # Utiliser Mapbox directement
    try:
        url = f"https://api.mapbox.com/geocoding/v5/mapbox.places/{requests.utils.quote(query)}.json"
        params = {
            'access_token': mapbox_token,
            'country': 'FR',
            'limit': 1
        }
        
        response = requests.get(url, params=params, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            if data.get('features') and len(data['features']) > 0:
                coords = data['features'][0]['geometry']['coordinates']
                longitude, latitude = coords[0], coords[1]
                
                # Vérifier que c'est en France métropolitaine
                if 41 <= latitude <= 51.5 and -5.5 <= longitude <= 10:
                    return latitude, longitude
    except Exception as e:
        print(f"      ⚠️ Erreur Mapbox: {e}")
    
    return None, None

def get_new_prospects(batch_size: int = 100) -> List[Dict]:
    """Récupère les prospects récemment ajoutés (sans latitude ou avec code postal à corriger)"""
    try:
        # Chercher les prospects sans coordonnées ou avec code postal à 4 chiffres
        response = supabase.table("nouveaux_sites") \
            .select("*") \
            .or_("latitude.is.null,longitude.is.null") \
            .order("id", desc=True) \
            .limit(batch_size) \
            .execute()
        
        return response.data if response.data else []
    except Exception as e:
        print(f"❌ Erreur lors de la récupération: {e}")
        return []

def update_prospect(prospect_id: int, updates: Dict) -> bool:
    """Met à jour un prospect"""
    try:
        supabase.table("nouveaux_sites") \
            .update(updates) \
            .eq("id", prospect_id) \
            .execute()
        return True
    except Exception as e:
        print(f"      ❌ Erreur mise à jour: {e}")
        return False

def main():
    print("=" * 70)
    print("🚀 TRAITEMENT DES 9000 NOUVEAUX PROSPECTS")
    print("=" * 70)
    print()
    
    # Statistiques
    stats = {
        'total': 0,
        'code_postal_fixed': 0,
        'geocoded': 0,
        'secteur_assigned': 0,
        'date_fixed': 0,
        'errors': 0
    }
    
    batch_num = 1
    
    while True:
        print(f"\n📦 Batch {batch_num} - Récupération de 100 prospects...")
        
        prospects = get_new_prospects(batch_size=100)
        
        if not prospects:
            print("✅ Aucun prospect à traiter dans ce batch.")
            break
        
        print(f"   Trouvé: {len(prospects)} prospects")
        
        for i, prospect in enumerate(prospects, 1):
            prospect_id = prospect['id']
            nom = prospect.get('nom', 'Sans nom')[:40]
            
            print(f"\n   [{i}/{len(prospects)}] {nom} (ID: {prospect_id})")
            
            updates = {}
            changes = []
            
            # 1. Correction code postal
            code_postal = prospect.get('code_postal')
            if code_postal:
                fixed_cp = fix_code_postal(code_postal)
                if fixed_cp and fixed_cp != code_postal:
                    updates['code_postal'] = fixed_cp
                    changes.append(f"Code postal: {code_postal} → {fixed_cp}")
                    stats['code_postal_fixed'] += 1
            
            # 2. Validation date de création
            date_creation = prospect.get('date_creation')
            if date_creation:
                validated_date = validate_date(date_creation)
                if validated_date and validated_date != date_creation:
                    updates['date_creation'] = validated_date
                    changes.append(f"Date: {date_creation} → {validated_date}")
                    stats['date_fixed'] += 1
            
            # 3. Attribution secteur d'activité
            code_naf = prospect.get('code_naf')
            current_secteur = prospect.get('secteur_activite')
            if code_naf:
                secteur = get_secteur_from_naf(code_naf)
                # Mettre à jour seulement si différent ou manquant
                if not current_secteur or current_secteur != secteur:
                    updates['secteur_activite'] = secteur
                    naf_section = code_naf.replace('.', '').replace(' ', '')[:2]
                    changes.append(f"Secteur: {secteur} (NAF: {naf_section})")
                    stats['secteur_assigned'] += 1
            
            # 4. Géocodage
            latitude = prospect.get('latitude')
            longitude = prospect.get('longitude')
            
            # Géocoder si pas de coordonnées ou si coordonnées invalides
            need_geocoding = (
                not latitude or 
                not longitude or 
                latitude < 41 or latitude > 51.5 or 
                longitude < -5.5 or longitude > 10
            )
            
            if need_geocoding:
                adresse = prospect.get('adresse', '')
                ville = prospect.get('ville', '')
                cp = updates.get('code_postal', prospect.get('code_postal', ''))
                
                if ville or adresse:
                    print(f"      🔍 Géocodage: {adresse}, {cp} {ville}")
                    lat, lng = geocode_address(adresse, ville, cp)
                    
                    if lat and lng:
                        updates['latitude'] = lat
                        updates['longitude'] = lng
                        changes.append(f"GPS: {lat:.4f}, {lng:.4f}")
                        stats['geocoded'] += 1
                    else:
                        changes.append("GPS: Échec géocodage")
            
            # Appliquer les mises à jour
            if updates:
                if update_prospect(prospect_id, updates):
                    for change in changes:
                        print(f"      ✅ {change}")
                    stats['total'] += 1
                else:
                    stats['errors'] += 1
            else:
                print(f"      ⏭️  Aucune modification nécessaire")
        
        batch_num += 1
        
        # Pause pour éviter de surcharger l'API
        time.sleep(0.5)
        
        # Limite de sécurité: arrêter après 100 batches (10000 prospects)
        if batch_num > 100:
            print("\n⚠️ Limite de 100 batches atteinte (sécurité)")
            break
    
    print("\n" + "=" * 70)
    print("📊 RÉSUMÉ DU TRAITEMENT")
    print("=" * 70)
    print(f"✅ Prospects traités:       {stats['total']}")
    print(f"📮 Codes postaux corrigés:  {stats['code_postal_fixed']}")
    print(f"📍 Adresses géocodées:      {stats['geocoded']}")
    print(f"🏢 Secteurs assignés:       {stats['secteur_assigned']}")
    print(f"📅 Dates validées:          {stats['date_fixed']}")
    print(f"❌ Erreurs:                 {stats['errors']}")
    print("=" * 70)

if __name__ == "__main__":
    main()
