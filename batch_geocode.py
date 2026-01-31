#!/usr/bin/env python3
"""
Script pour régéocoder tous les sites avec coordonnées invalides
Usage: python3 batch_geocode.py
"""

import os
import time
import requests
from supabase import create_client, Client

# Configuration
SUPABASE_URL = os.getenv("SUPABASE_URL", "https://ywavxjmbsywpjzchuuho.supabase.co")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY")  # Utiliser la service_role key

if not SUPABASE_KEY:
    print("❌ SUPABASE_SERVICE_KEY non définie")
    print("Définissez-la avec: export SUPABASE_SERVICE_KEY='votre_cle'")
    exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def geocode_site(site_id: int, adresse: str, ville: str, code_postal: str) -> dict:
    """Géocode un site via l'edge function"""
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
        
        if response.get("error"):
            return {"success": False, "error": response["error"]}
        
        data = response.get("data", {})
        if data.get("latitude") and data.get("longitude"):
            return {
                "success": True,
                "latitude": data["latitude"],
                "longitude": data["longitude"]
            }
        
        return {"success": False, "error": "Pas de coordonnées"}
    
    except Exception as e:
        return {"success": False, "error": str(e)}

def get_sites_to_geocode(limit: int = 100):
    """Récupère les sites à géocoder"""
    response = supabase.table("nouveaux_sites").select("*").or_(
        "latitude.is.null,longitude.is.null,latitude.lt.41,latitude.gt.51,longitude.lt.-5,longitude.gt.10"
    ).limit(limit).execute()
    
    return response.data

def update_site_coordinates(site_id: int, latitude: float, longitude: float):
    """Met à jour les coordonnées d'un site"""
    supabase.table("nouveaux_sites").update({
        "latitude": latitude,
        "longitude": longitude
    }).eq("id", site_id).execute()

def main():
    print("🚀 Début du géocodage massif...")
    
    # Récupérer tous les sites à géocoder
    sites = get_sites_to_geocode(limit=1000)
    total = len(sites)
    
    print(f"📊 {total} sites à géocoder")
    
    success_count = 0
    error_count = 0
    
    for i, site in enumerate(sites, 1):
        site_id = site["id"]
        nom = site["nom"]
        
        # Construire l'adresse
        adresse_parts = []
        if site.get("numero_voie"):
            adresse_parts.append(str(site["numero_voie"]))
        if site.get("type_voie"):
            adresse_parts.append(site["type_voie"])
        if site.get("libelle_voie"):
            adresse_parts.append(site["libelle_voie"])
        
        adresse = " ".join(adresse_parts) if adresse_parts else site.get("adresse", "")
        ville = site.get("ville", "")
        code_postal = site.get("code_postal", "")
        
        if not ville and not adresse:
            print(f"⏭️  [{i}/{total}] {nom} - Pas assez d'infos")
            error_count += 1
            continue
        
        print(f"🔍 [{i}/{total}] {nom} ({ville or adresse[:30]}...)  ", end="", flush=True)
        
        # Géocoder
        result = geocode_site(site_id, adresse, ville, code_postal)
        
        if result["success"]:
            update_site_coordinates(site_id, result["latitude"], result["longitude"])
            print(f"✅ {result['latitude']:.4f}, {result['longitude']:.4f}")
            success_count += 1
        else:
            print(f"❌ {result.get('error', 'Erreur inconnue')}")
            error_count += 1
        
        # Rate limiting (50 req/sec max Mapbox)
        time.sleep(0.1)
    
    print(f"\n📊 Résumé:")
    print(f"   ✅ Géocodés avec succès: {success_count}")
    print(f"   ❌ Échecs: {error_count}")
    print(f"   📍 Total: {total}")

if __name__ == "__main__":
    main()
