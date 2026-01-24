#!/usr/bin/env python3
"""
Script d'import de la nouvelle base de données entreprises (1er déc 2025 - 24 jan 2026)
Avec géocodage automatique des adresses manquantes
Import dans la table 'nouveaux_sites' (utilisée par l'app)
"""

import csv
import os
import sys
import time
from datetime import datetime
from typing import Dict, Optional, Tuple
import requests
from supabase import create_client, Client

# Configuration Supabase
SUPABASE_URL = os.getenv("SUPABASE_URL", "https://xvggbkivkdshbdvtvheo.supabase.co")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY")  # Utiliser la service_role_key

if not SUPABASE_KEY:
    print("❌ ERREUR: Variable d'environnement SUPABASE_SERVICE_KEY manquante")
    print("   Export: export SUPABASE_SERVICE_KEY='eyJ...'")
    sys.exit(1)

# Init Supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Catégories entreprises normalisées
CATEGORIES_MAP = {
    "PM": "PME",
    "ET": "ETI", 
    "GE": "GE",
    "PME": "PME",
    "ETI": "ETI",
}

# Sections NAF (lettres) pour filtres
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


def geocode_address(address: str, postal_code: str, city: str) -> Optional[Tuple[float, float]]:
    """
    Géocode une adresse avec l'API Adresse Data Gouv (gratuite, sans limite)
    Retourne (latitude, longitude) ou None
    """
    if not address and not city:
        return None
    
    # Construction requête
    query_parts = []
    if address:
        query_parts.append(address)
    if postal_code:
        query_parts.append(postal_code)
    if city:
        query_parts.append(city)
    
    query = " ".join(query_parts).strip()
    if not query:
        return None
    
    try:
        url = "https://api-adresse.data.gouv.fr/search/"
        params = {
            "q": query,
            "limit": 1,
            "autocomplete": 0
        }
        
        response = requests.get(url, params=params, timeout=5)
        response.raise_for_status()
        
        data = response.json()
        if data.get("features"):
            coords = data["features"][0]["geometry"]["coordinates"]
            # API retourne [lng, lat], on inverse
            return (coords[1], coords[0])
        
    except Exception as e:
        print(f"⚠️  Géocodage échoué pour '{query[:50]}...': {e}")
    
    return None


def lambert_to_gps(x: float, y: float) -> Optional[Tuple[float, float]]:
    """
    Convertit coordonnées Lambert 93 (x, y) en GPS (lat, lng)
    Utilise une approximation simple suffisante pour la France métropolitaine
    """
    # Constantes Lambert 93 -> WGS84
    n = 0.7256077650
    c = 11754255.426
    xs = 700000.0
    ys = 12655612.050
    e = 0.0818191910428
    
    # Formules de conversion approximatives
    r = ((x - xs) ** 2 + (c - (y - ys)) ** 2) ** 0.5
    gamma = 2 * ((c - (y - ys)) / r)
    
    # Latitude
    lat_iso = -1/n * (r/c) ** (1/n)
    lat = 2 * (0.78539816339 - 0.5 * lat_iso)
    
    # Longitude
    lng = gamma / n + 0.04079234433
    
    # Conversion radians -> degrés
    lat = lat * 180 / 3.141592653589793
    lng = lng * 180 / 3.141592653589793
    
    # Vérification cohérence France
    if 41 <= lat <= 51 and -5 <= lng <= 10:
        return (lat, lng)
    
    return None


def parse_csv_row(row: Dict[str, str]) -> Optional[Dict]:
    """
    Parse une ligne CSV et retourne un dict prêt pour Supabase
    """
    try:
        siret = row.get("siret", "").strip()
        if not siret or len(siret) < 14:
            return None
        
        # Récupération coordonnées
        lat, lng = None, None
        
        # 1. Essayer coordonnées Lambert si présentes
        lambert_x = row.get("coordonneeLambertAbscisseEtablissement", "").strip()
        lambert_y = row.get("coordonneeLambertOrdonneeEtablissement", "").strip()
        
        if lambert_x and lambert_y:
            try:
                x = float(lambert_x)
                y = float(lambert_y)
                coords = lambert_to_gps(x, y)
                if coords:
                    lat, lng = coords
            except (ValueError, TypeError):
                pass
        
        # 2. Si pas de coordonnées, on ne géocode pas (on garde NULL)
        # L'utilisateur veut garder seulement les entreprises déjà géocodées
        
        # 3. Construction adresse complète pour stockage
        complement = row.get("complementAdresseEtablissement", "").strip()
        numero = row.get("numeroVoieEtablissement", "").strip()
        type_voie = row.get("typeVoieEtablissement", "").strip()
        libelle_voie = row.get("libelleVoieEtablissement", "").strip()
        code_postal = row.get("codePostalEtablissement", "").strip()
        commune = row.get("libelleCommuneEtablissement", "").strip()
        
        address_parts = []
        if complement:
            address_parts.append(complement)
        if numero:
            address_parts.append(numero)
        if type_voie:
            address_parts.append(type_voie)
        if libelle_voie:
            address_parts.append(libelle_voie)
        if code_postal:
            address_parts.append(code_postal)
        if commune:
            address_parts.append(commune)
        
        adresse_complete = " ".join(address_parts).strip()
        
        # Nom entreprise (plusieurs champs possibles)
        nom = row.get("Entreprise", "").strip()
        if not nom:
            nom = row.get("denominationUsuelleEtablissement", "").strip()
        if not nom:
            nom = row.get("enseigne1Etablissement", "").strip()
        if not nom:
            # Nom de famille + prénom pour les entrepreneurs individuels
            nom_famille = row.get("nomUniteLegale", "").strip()
            prenom = row.get("prenom1UniteLegale", "").strip()
            if nom_famille:
                nom = f"{prenom} {nom_famille}".strip() if prenom else nom_famille
        
        if not nom:
            nom = f"Entreprise {siret[:9]}"
        
        # Code NAF et section
        code_naf = row.get("activitePrincipaleEtablissement", "").strip()
        section_naf = None
        if code_naf:
            # Extraire les 2 premiers chiffres pour déterminer la section
            naf_prefix = code_naf[:2]
            section_naf = NAF_SECTIONS.get(naf_prefix)
        
        # Catégorie entreprise (PME, ETI, GE)
        categorie_raw = row.get("categorieEntreprise", "").strip()
        categorie = CATEGORIES_MAP.get(categorie_raw, "PME")
        
        # Date de création
        date_creation_str = row.get("dateCreationEtablissement", "").strip()
        date_creation = None
        if date_creation_str:
            try:
                # Format DD/MM/YYYY
                date_creation = datetime.strptime(date_creation_str, "%d/%m/%Y").date()
            except ValueError:
                pass
        
        # Construction objet Supabase
        entreprise = {
            "siret": siret,
            "nom": nom[:255],  # Limite longueur
            "adresse": adresse_complete[:500] if adresse_complete else None,
            "code_postal": code_postal if code_postal else None,
            "latitude": lat,
            "longitude": lng,
            "code_naf": code_naf if code_naf else None,
            "section_naf": section_naf,
            "categorie_entreprise": categorie,
            "statut": "creation",  # Toutes les entreprises de ce CSV sont des créations
            "date_demarrage": date_creation,
            "enrichi": False,
        }
        
        return entreprise
        
    except Exception as e:
        print(f"❌ Erreur parsing ligne: {e}")
        return None


def backup_old_table():
    """
    Backup de l'ancienne table nouveaux_sites
    """
    print("\n📦 BACKUP: Création table nouveaux_sites_backup...")
    
    try:
        # Via SQL direct (nécessite service_role)
        sql = """
        -- Drop backup si existe
        DROP TABLE IF EXISTS public.nouveaux_sites_backup CASCADE;
        
        -- Créer backup
        CREATE TABLE public.nouveaux_sites_backup AS 
        SELECT * FROM public.nouveaux_sites;
        
        -- Compter
        SELECT COUNT(*) as count FROM public.nouveaux_sites_backup;
        """
        
        result = supabase.rpc("exec_sql", {"query": sql}).execute()
        print(f"✅ Backup créé: {result.data} lignes sauvegardées")
        
    except Exception as e:
        print(f"⚠️  Backup échoué (continuera quand même): {e}")


def import_to_supabase(csv_path: str, batch_size: int = 100):
    """
    Import le CSV dans Supabase avec géocodage automatique et système d'archivage
    - Les entreprises du CSV sont marquées archived=false (actives)
    - Les entreprises absentes du CSV sont marquées archived=true (archivées)
    """
    print(f"\n🚀 IMPORT: Lecture {csv_path}...")
    
    # Stats
    total = 0
    imported = 0
    geocoded = 0
    errors = 0
    archived_count = 0
    
    batch = []
    sirets_in_csv = set()
    
    try:
        # PHASE 1: Import des entreprises du CSV (marquées comme actives)
        print("\n📥 PHASE 1: Import des nouvelles entreprises...")
        # Essayer plusieurs encodages (CSV souvent en ISO-8859-1 ou Windows-1252)
        encodings = ['utf-8', 'iso-8859-1', 'windows-1252', 'cp1252']
        f = None
        reader = None
        
        for enc in encodings:
            try:
                f = open(csv_path, 'r', encoding=enc)
                reader = csv.DictReader(f, delimiter=';')
                # Test lecture première ligne
                next(reader)
                # Reset au début
                f.seek(0)
                reader = csv.DictReader(f, delimiter=';')
                print(f"   ✓ Encodage détecté: {enc}")
                break
            except (UnicodeDecodeError, StopIteration):
                if f:
                    f.close()
                continue
        
        if not reader:
            print("❌ ERREUR: Impossible de détecter l'encodage du CSV")
            sys.exit(1)
        
        with f:
            
            for i, row in enumerate(reader, 1):
                total += 1
                
                # Parse row
                entreprise = parse_csv_row(row)
                if not entreprise:
                    errors += 1
                    continue
                
                # Marquer comme active (non archivée)
                entreprise["archived"] = False
                entreprise["date_archive"] = None
                
                # Tracking géocodage
                if entreprise.get("latitude") and entreprise.get("longitude"):
                    geocoded += 1
                
                # Tracking SIRETs pour phase 2
                sirets_in_csv.add(entreprise["siret"])
                
                batch.append(entreprise)
                
                # Import par batch
                if len(batch) >= batch_size:
                    try:
                        supabase.table("nouveaux_sites").upsert(
                            batch, 
                            on_conflict="siret"
                        ).execute()
                        imported += len(batch)
                        print(f"   ✓ {imported}/{total} entreprises importées ({geocoded} géocodées, {errors} erreurs)")
                    except Exception as e:
                        print(f"   ❌ Erreur batch: {e}")
                        errors += len(batch)
                    
                    batch = []
                
                # Feedback tous les 5000
                if i % 5000 == 0:
                    print(f"   📊 Progression: {i} lignes traitées...")
            
            # Dernier batch
            if batch:
                try:
                    supabase.table("nouveaux_sites").upsert(
                        batch, 
                        on_conflict="siret"
                    ).execute()
                    imported += len(batch)
                    print(f"   ✓ {imported}/{total} entreprises importées (dernier batch)")
                except Exception as e:
                    print(f"   ❌ Erreur dernier batch: {e}")
                    errors += len(batch)
        
        # PHASE 2: Archiver les entreprises absentes du CSV
        print(f"\n🗄️  PHASE 2: Archivage des entreprises absentes du nouveau CSV...")
        print(f"   SIRETs dans le CSV: {len(sirets_in_csv)}")
        
        try:
            # Récupérer tous les SIRETs actuellement en DB (non archivés)
            result = supabase.table("nouveaux_sites").select("siret").eq("archived", False).execute()
            sirets_in_db = {row["siret"] for row in result.data}
            print(f"   SIRETs actifs en DB: {len(sirets_in_db)}")
            
            # Identifier les SIRETs à archiver (en DB mais pas dans le CSV)
            sirets_to_archive = sirets_in_db - sirets_in_csv
            archived_count = len(sirets_to_archive)
            
            if archived_count > 0:
                print(f"   ⚠️  {archived_count} entreprises à archiver...")
                
                # Archiver par batch
                archive_batch = []
                for siret in sirets_to_archive:
                    archive_batch.append({
                        "siret": siret,
                        "archived": True,
                        "date_archive": datetime.now().isoformat()
                    })
                    
                    if len(archive_batch) >= batch_size:
                        supabase.table("nouveaux_sites").upsert(
                            archive_batch,
                            on_conflict="siret"
                        ).execute()
                        archive_batch = []
                
                # Dernier batch archivage
                if archive_batch:
                    supabase.table("nouveaux_sites").upsert(
                        archive_batch,
                        on_conflict="siret"
                    ).execute()
                
                print(f"   ✅ {archived_count} entreprises archivées")
            else:
                print(f"   ✅ Aucune entreprise à archiver")
                
        except Exception as e:
            print(f"   ⚠️  Erreur lors de l'archivage: {e}")
        
        # Résumé
        print("\n" + "="*60)
        print("📊 RÉSUMÉ IMPORT")
        print("="*60)
        print(f"Total lignes CSV:          {total}")
        print(f"✅ Importées avec succès:  {imported}")
        print(f"🗺️  Géocodées:             {geocoded} ({geocoded*100/total:.1f}%)")
        print(f"🗄️  Archivées:             {archived_count}")
        print(f"❌ Erreurs:                {errors}")
        print(f"✓ Taux de succès:          {imported*100/total:.1f}%")
        print("="*60)
        
    except Exception as e:
        print(f"\n❌ ERREUR FATALE: {e}")
        sys.exit(1)


def update_filters_stats():
    """
    Met à jour les stats pour les filtres dynamiques
    """
    print("\n🎛️  MISE À JOUR: Statistiques filtres...")
    
    try:
        # Compter par département
        result = supabase.rpc("get_department_stats").execute()
        print(f"   ✓ Départements: {len(result.data)} avec entreprises")
        
        # Compter par section NAF
        result = supabase.rpc("get_naf_section_stats").execute()
        print(f"   ✓ Sections NAF: {len(result.data)} avec entreprises")
        
        # Compter par catégorie
        result = supabase.rpc("get_category_stats").execute()
        print(f"   ✓ Catégories: {len(result.data)} avec entreprises")
        
    except Exception as e:
        print(f"   ⚠️  Impossible de mettre à jour les stats (fonction RPC manquante?): {e}")


if __name__ == "__main__":
    print("="*60)
    print("🚀 PULSE - Import nouvelle base de données entreprises")
    print("   Période: 1er décembre 2025 - 24 janvier 2026")
    print("="*60)
    
    csv_path = "public/nouveaux-sites.csv"
    
    if not os.path.exists(csv_path):
        print(f"❌ ERREUR: Fichier {csv_path} introuvable")
        sys.exit(1)
    
    print(f"\n📁 Fichier: {csv_path}")
    print(f"📊 Taille: {os.path.getsize(csv_path) / 1024 / 1024:.2f} MB")
    
    # Confirmation
    print("\n⚠️  ATTENTION: Cette opération va:")
    print("   1. Créer un backup de la table nouveaux_sites actuelle")
    print("   2. Importer ~45 000 nouvelles entreprises")
    print("   3. Convertir les coordonnées Lambert 93 en GPS")
    print("   4. Archiver les entreprises absentes du nouveau CSV")
    print("   5. Durée estimée: 3-5 minutes")
    
    response = input("\n✋ Continuer? (oui/non): ").lower().strip()
    if response not in ["oui", "yes", "y", "o"]:
        print("❌ Import annulé")
        sys.exit(0)
    
    # Backup
    backup_old_table()
    
    # Import
    start_time = time.time()
    import_to_supabase(csv_path, batch_size=100)
    duration = time.time() - start_time
    
    print(f"\n⏱️  Durée totale: {duration/60:.1f} minutes")
    
    # Update stats
    update_filters_stats()
    
    print("\n✅ IMPORT TERMINÉ!")
    print("\n📝 Prochaines étapes:")
    print("   1. Vérifier les données dans Supabase")
    print("   2. Tester les filtres frontend")
    print("   3. Vérifier la carte (géolocalisation)")
    print("   4. Supprimer la backup si tout est OK")
