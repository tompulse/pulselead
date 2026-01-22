#!/usr/bin/env python3
"""
Script d'automatisation du téléchargement des données INPI
Contourne la limite de 500 exports en découpant par période

USAGE:
    python3 scrape_data_inpi_auto.py
"""

import time
import os
import requests
from datetime import datetime, timedelta
import json

# ==========================================
# CONFIGURATION
# ==========================================
START_DATE = datetime(2025, 12, 1)  # 1er décembre 2025
END_DATE = datetime(2026, 1, 22)   # 22 janvier 2026
DAYS_PER_BATCH = 1                  # 1 jour par export (pour rester sous 500)
DOWNLOAD_DIR = os.path.expanduser("~/Downloads/inpi_exports")
TOTAL_EXPECTED = 27685

# Créer le dossier de téléchargement
os.makedirs(DOWNLOAD_DIR, exist_ok=True)

# Base URL de l'API INPI
API_BASE_URL = "https://data.inpi.fr/api/companies/export"

# Filtres (extraits de ton URL)
FILTERS = {
    "idt_pm_code_form_jur": ["5499", "5710", "5485", "5785", "3220", "5202"],
    "idt_cp_short": [
        "02", "04", "05", "06", "07", "08", "09", "10", "11", "12", "13", "14", 
        "15", "16", "17", "18", "19", "21", "22", "23", "24", "25", "26", "27", 
        "28", "29", "30", "31", "32", "33", "34", "35", "36", "37", "38", "39", 
        "40", "41", "42", "43", "44", "45", "46", "47", "48", "49", "50", "51", 
        "52", "53", "54", "55", "56", "57", "58", "59", "60", "61", "62", "63", 
        "64", "65", "66", "67", "68", "69", "70", "71", "72", "73", "74", "75", 
        "76", "77", "78", "79", "80", "81", "82", "83", "84", "85", "90", "89", 
        "88", "87", "86", "91", "92", "95", "94", "93", "03", "01"
    ],
    "formality.content.formeExerciceActivitePrincipale": [
        "COMMERCIALE", "ARTISANALE", "ARTISANALE_REGLEMENTEE", "LIBERALE_REGLEMENTEE"
    ]
}

# ==========================================
# FONCTION : Télécharger un export
# ==========================================
def download_export(start_date_str, end_date_str, batch_num):
    """
    Télécharge un export CSV pour une période donnée
    """
    print(f"\n📥 Batch {batch_num:02d} : {start_date_str} → {end_date_str}")
    
    # Construire le timestamp de début (minuit)
    start_timestamp = int(datetime.strptime(start_date_str, "%d/%m/%Y").timestamp() * 1000)
    
    # Construire le filtre de date
    date_filter = {
        "idt_date_debut_activ": {
            "from": start_timestamp,
            "to": start_timestamp + (86400000 * DAYS_PER_BATCH)  # +1 jour en millisecondes
        }
    }
    
    # Fusionner avec les autres filtres
    full_filter = {**FILTERS, **date_filter}
    
    # Construire les paramètres de la requête
    payload = {
        "filter": json.dumps(full_filter),
        "searchType": "advanced",
        "nbResultsPerPage": 500,  # Maximum autorisé
        "page": 1,
        "format": "csv"  # Format CSV
    }
    
    headers = {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
        "Accept": "text/csv,application/csv",
        "Referer": "https://data.inpi.fr/"
    }
    
    try:
        # Faire la requête
        response = requests.post(API_BASE_URL, data=payload, headers=headers, timeout=60)
        
        if response.status_code == 200:
            # Sauvegarder le fichier
            filename = f"inpi_export_{start_date_str.replace('/', '-')}.csv"
            filepath = os.path.join(DOWNLOAD_DIR, filename)
            
            with open(filepath, 'wb') as f:
                f.write(response.content)
            
            # Compter les lignes (approximatif)
            line_count = len(response.content.decode('utf-8', errors='ignore').split('\n')) - 4  # -4 pour l'en-tête
            
            print(f"✅ Téléchargé : {filename} ({line_count} entreprises)")
            return line_count
        else:
            print(f"❌ Erreur HTTP {response.status_code} : {response.text[:200]}")
            return 0
            
    except Exception as e:
        print(f"❌ Erreur : {e}")
        return 0

# ==========================================
# SCRIPT PRINCIPAL
# ==========================================
def main():
    print("=" * 80)
    print("🚀 TÉLÉCHARGEMENT AUTOMATIQUE DES DONNÉES INPI")
    print("=" * 80)
    print(f"📅 Période : {START_DATE.strftime('%d/%m/%Y')} → {END_DATE.strftime('%d/%m/%Y')}")
    print(f"📊 Total attendu : {TOTAL_EXPECTED} entreprises")
    print(f"📁 Dossier : {DOWNLOAD_DIR}")
    print("=" * 80)
    
    current_date = START_DATE
    batch_num = 1
    total_downloaded = 0
    
    while current_date <= END_DATE:
        # Calculer la date de fin du batch
        end_date = current_date + timedelta(days=DAYS_PER_BATCH - 1)
        if end_date > END_DATE:
            end_date = END_DATE
        
        # Formater les dates
        start_date_str = current_date.strftime("%d/%m/%Y")
        end_date_str = end_date.strftime("%d/%m/%Y")
        
        # Télécharger
        count = download_export(start_date_str, end_date_str, batch_num)
        total_downloaded += count
        
        # Pause pour ne pas surcharger le serveur
        time.sleep(2)
        
        # Prochaine période
        current_date += timedelta(days=DAYS_PER_BATCH)
        batch_num += 1
    
    print("\n" + "=" * 80)
    print(f"✅ TERMINÉ !")
    print(f"📊 Total téléchargé : {total_downloaded} entreprises")
    print(f"📁 Fichiers dans : {DOWNLOAD_DIR}")
    print("=" * 80)
    
    print("\n🔄 PROCHAINE ÉTAPE : Fusion des CSV")
    print("   Exécute : python3 merge_inpi_csvs.py")

if __name__ == "__main__":
    main()
