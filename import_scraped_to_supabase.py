#!/usr/bin/env python3
"""
=============================================================================
📥 IMPORT DES DONNÉES SCRAPÉES VERS SUPABASE
=============================================================================
Importe les fichiers JSON/CSV générés par le scraper INPI dans Supabase

INSTALLATION :
    pip3 install supabase python-dotenv

USAGE :
    python3 import_scraped_to_supabase.py data/inpi_scrapes/inpi_export_2026-01-22.json
    python3 import_scraped_to_supabase.py data/inpi_scrapes/inpi_export_2026-01-22.csv
    python3 import_scraped_to_supabase.py --all  # Importe tous les fichiers non importés

CONFIGURATION :
    Créer un fichier .env avec :
    SUPABASE_URL=https://xxxxx.supabase.co
    SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
"""

import os
import sys
import json
import csv
import re
import argparse
from datetime import datetime
from typing import List, Dict, Optional
import logging

try:
    from supabase import create_client, Client
    from dotenv import load_dotenv
except ImportError:
    print("❌ Packages manquants. Exécuter: pip3 install supabase python-dotenv")
    sys.exit(1)

# Configuration du logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Charger les variables d'environnement
load_dotenv()

SUPABASE_URL = os.getenv("VITE_SUPABASE_URL") or os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY") or os.getenv("VITE_SUPABASE_ANON_KEY")

# Mapping des codes formes juridiques INPI vers les nôtres
FORME_JURIDIQUE_MAPPING = {
    "5499": "SARL",
    "5710": "SAS", 
    "5485": "SELARL",
    "5785": "SELAS",
    "5202": "SA",
    "3220": "SNC",
    "5720": "SASU",
    "SARL": "5499",
    "SAS": "5710",
    "SASU": "5720",
    "SA": "5202",
    "SNC": "3220",
    "SELARL": "5485",
    "SELAS": "5785"
}

# Répertoire des fichiers scrapés
SCRAPE_DIR = os.path.join(os.path.dirname(__file__), "data", "inpi_scrapes")


class SupabaseImporter:
    """Importateur vers Supabase"""
    
    def __init__(self):
        if not SUPABASE_URL or not SUPABASE_KEY:
            raise ValueError("❌ Variables SUPABASE_URL et SUPABASE_SERVICE_KEY requises dans .env")
        
        self.client: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
        self.stats = {
            "total": 0,
            "inserted": 0,
            "updated": 0,
            "errors": 0,
            "skipped": 0
        }
    
    def parse_date(self, date_str: str) -> Optional[str]:
        """Convertit une date au format YYYY-MM-DD"""
        if not date_str:
            return None
        
        # Essayer différents formats
        formats = [
            "%d/%m/%Y",
            "%Y-%m-%d",
            "%d-%m-%Y",
            "%Y/%m/%d"
        ]
        
        for fmt in formats:
            try:
                d = datetime.strptime(date_str, fmt)
                return d.strftime("%Y-%m-%d")
            except:
                continue
        
        return None
    
    def extract_code_postal_ville(self, adresse: str) -> tuple:
        """Extrait le code postal et la ville d'une adresse"""
        if not adresse:
            return None, None
        
        # Pattern: 5 chiffres suivis de la ville
        match = re.search(r'(\d{5})\s+([A-ZÀÂÄÉÈÊËÏÎÔÙÛÜŸŒÆ\-\s]+)', adresse.upper())
        if match:
            return match.group(1), match.group(2).strip().replace(' FRANCE', '').strip()
        
        return None, None
    
    def clean_siren(self, siren: str) -> Optional[str]:
        """Nettoie le SIREN (9 chiffres)"""
        if not siren:
            return None
        
        # Retirer tout ce qui n'est pas un chiffre
        clean = re.sub(r'\D', '', str(siren))
        
        # Si c'est un SIRET (14 chiffres), prendre les 9 premiers
        if len(clean) == 14:
            return clean[:9]
        elif len(clean) == 9:
            return clean
        
        return None
    
    def clean_siret(self, siret: str) -> Optional[str]:
        """Nettoie le SIRET (14 chiffres)"""
        if not siret:
            return None
        
        clean = re.sub(r'\D', '', str(siret))
        
        if len(clean) == 14:
            return clean
        
        return None
    
    def get_departement(self, code_postal: str) -> Optional[str]:
        """Extrait le département du code postal"""
        if not code_postal or len(code_postal) < 2:
            return None
        
        # Cas spéciaux pour DOM-TOM
        if code_postal.startswith('97') or code_postal.startswith('98'):
            return code_postal[:3]
        
        return code_postal[:2]
    
    def transform_company(self, raw: Dict) -> Dict:
        """Transforme les données scrapées au format Supabase"""
        
        # Extraire code postal et ville si pas déjà présents
        code_postal = raw.get('code_postal')
        ville = raw.get('ville')
        
        if not code_postal and raw.get('adresse_complete'):
            code_postal, ville = self.extract_code_postal_ville(raw.get('adresse_complete'))
        if not code_postal and raw.get('adresse'):
            code_postal, ville = self.extract_code_postal_ville(raw.get('adresse'))
        
        # SIRET / SIREN
        siret = self.clean_siret(raw.get('siret'))
        siren = self.clean_siren(raw.get('siren'))
        
        # Si on a un SIREN mais pas de SIRET, construire un SIRET avec le NIC générique
        if siren and not siret:
            siret = siren + "00010"  # NIC par défaut pour le siège
        
        # Département
        departement = self.get_departement(code_postal)
        
        # Forme juridique
        forme_juridique = raw.get('forme_juridique', '')
        
        # Adresse formatée
        adresse = raw.get('adresse_complete') or raw.get('adresse') or ''
        
        return {
            "siret": siret,
            "siren": siren,
            "nom": raw.get('nom', '').strip()[:255] if raw.get('nom') else None,
            "dirigeant": raw.get('dirigeant', '').strip()[:255] if raw.get('dirigeant') else None,
            "fonction_dirigeant": raw.get('fonction_dirigeant', '').strip()[:100] if raw.get('fonction_dirigeant') else None,
            "adresse": adresse[:500] if adresse else None,
            "code_postal": code_postal,
            "ville": ville[:100] if ville else None,
            "departement": departement,
            "code_naf": raw.get('code_naf', '').strip()[:10] if raw.get('code_naf') else None,
            "activite": raw.get('activite', '').strip()[:500] if raw.get('activite') else None,
            "forme_juridique": forme_juridique[:100] if forme_juridique else None,
            "categorie_juridique": FORME_JURIDIQUE_MAPPING.get(forme_juridique.upper().replace(' ', '')) if forme_juridique else None,
            "date_creation": self.parse_date(raw.get('date_creation')),
            "capital": float(raw.get('capital').replace(',', '.')) if raw.get('capital') and raw.get('capital').replace(',', '.').replace('.', '').isdigit() else None,
            "est_siege": True,  # Par défaut depuis INPI
            "source": "INPI_SCRAPING",
            "enrichi_dirigeant": True if raw.get('dirigeant') else False,
            "date_enrichissement_dirigeant": datetime.now().isoformat() if raw.get('dirigeant') else None
        }
    
    def check_exists(self, siret: str) -> bool:
        """Vérifie si un SIRET existe déjà"""
        if not siret:
            return False
        
        try:
            result = self.client.table('nouveaux_sites').select('id').eq('siret', siret).limit(1).execute()
            return len(result.data) > 0
        except:
            return False
    
    def import_company(self, company: Dict, update_existing: bool = False) -> str:
        """Importe une entreprise dans Supabase"""
        try:
            transformed = self.transform_company(company)
            
            # Vérifier les champs obligatoires
            if not transformed.get('siret') and not transformed.get('nom'):
                self.stats["skipped"] += 1
                return "skipped"
            
            # Vérifier si existe
            if transformed.get('siret') and self.check_exists(transformed['siret']):
                if update_existing:
                    # Update
                    self.client.table('nouveaux_sites').update(transformed).eq('siret', transformed['siret']).execute()
                    self.stats["updated"] += 1
                    return "updated"
                else:
                    self.stats["skipped"] += 1
                    return "skipped"
            
            # Insert
            self.client.table('nouveaux_sites').insert(transformed).execute()
            self.stats["inserted"] += 1
            return "inserted"
            
        except Exception as e:
            logger.error(f"❌ Erreur import {company.get('nom', '?')}: {e}")
            self.stats["errors"] += 1
            return "error"
    
    def import_from_json(self, filepath: str, update_existing: bool = False):
        """Importe depuis un fichier JSON"""
        logger.info(f"📂 Lecture de {filepath}...")
        
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        companies = data.get('companies', data) if isinstance(data, dict) else data
        
        if not companies:
            logger.warning("⚠️  Aucune entreprise dans le fichier")
            return
        
        logger.info(f"📊 {len(companies)} entreprises à importer...")
        
        for i, company in enumerate(companies, 1):
            self.stats["total"] += 1
            self.import_company(company, update_existing)
            
            if i % 50 == 0:
                logger.info(f"   Progress: {i}/{len(companies)} ({self.stats['inserted']} inserted, {self.stats['skipped']} skipped)")
        
        self.print_stats()
    
    def import_from_csv(self, filepath: str, update_existing: bool = False):
        """Importe depuis un fichier CSV"""
        logger.info(f"📂 Lecture de {filepath}...")
        
        companies = []
        with open(filepath, 'r', encoding='utf-8') as f:
            # Détecter le délimiteur
            first_line = f.readline()
            delimiter = ';' if ';' in first_line else ','
            f.seek(0)
            
            reader = csv.DictReader(f, delimiter=delimiter)
            companies = list(reader)
        
        if not companies:
            logger.warning("⚠️  Aucune entreprise dans le fichier")
            return
        
        logger.info(f"📊 {len(companies)} entreprises à importer...")
        
        for i, company in enumerate(companies, 1):
            self.stats["total"] += 1
            self.import_company(company, update_existing)
            
            if i % 50 == 0:
                logger.info(f"   Progress: {i}/{len(companies)} ({self.stats['inserted']} inserted, {self.stats['skipped']} skipped)")
        
        self.print_stats()
    
    def import_all_pending(self, update_existing: bool = False):
        """Importe tous les fichiers non encore importés"""
        if not os.path.exists(SCRAPE_DIR):
            logger.error(f"❌ Répertoire inexistant: {SCRAPE_DIR}")
            return
        
        # Lister les fichiers JSON
        files = [f for f in os.listdir(SCRAPE_DIR) if f.endswith('.json')]
        
        if not files:
            logger.warning("⚠️  Aucun fichier JSON trouvé")
            return
        
        logger.info(f"📁 {len(files)} fichiers trouvés")
        
        for filename in sorted(files):
            filepath = os.path.join(SCRAPE_DIR, filename)
            logger.info(f"\n{'='*60}")
            logger.info(f"📥 Import de {filename}")
            self.stats = {"total": 0, "inserted": 0, "updated": 0, "errors": 0, "skipped": 0}
            self.import_from_json(filepath, update_existing)
    
    def print_stats(self):
        """Affiche les statistiques"""
        logger.info("\n" + "=" * 50)
        logger.info("📊 RÉSUMÉ IMPORT")
        logger.info("=" * 50)
        logger.info(f"   Total traité  : {self.stats['total']}")
        logger.info(f"   ✅ Insérés    : {self.stats['inserted']}")
        logger.info(f"   🔄 Mis à jour : {self.stats['updated']}")
        logger.info(f"   ⏭️  Ignorés   : {self.stats['skipped']}")
        logger.info(f"   ❌ Erreurs    : {self.stats['errors']}")
        logger.info("=" * 50)


def main():
    parser = argparse.ArgumentParser(description="Import des données INPI scrapées vers Supabase")
    parser.add_argument("file", nargs='?', help="Fichier JSON ou CSV à importer")
    parser.add_argument("--all", action="store_true", help="Importer tous les fichiers du dossier")
    parser.add_argument("--update", action="store_true", help="Mettre à jour les entreprises existantes")
    
    args = parser.parse_args()
    
    print("=" * 60)
    print("📥 IMPORT SUPABASE - DONNÉES INPI SCRAPÉES")
    print("=" * 60)
    
    try:
        importer = SupabaseImporter()
        
        if args.all:
            importer.import_all_pending(update_existing=args.update)
        elif args.file:
            if args.file.endswith('.json'):
                importer.import_from_json(args.file, update_existing=args.update)
            elif args.file.endswith('.csv'):
                importer.import_from_csv(args.file, update_existing=args.update)
            else:
                logger.error("❌ Format non supporté. Utiliser .json ou .csv")
        else:
            parser.print_help()
            
    except Exception as e:
        logger.error(f"❌ Erreur: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
