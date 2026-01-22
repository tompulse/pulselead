#!/usr/bin/env python3
"""
Script pour télécharger automatiquement les données Data INPI par lots
Contourne la limite de 500 résultats en découpant par périodes
"""

import time
from datetime import datetime, timedelta
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
import os

# Configuration
START_DATE = datetime(2025, 12, 1)  # 1er décembre 2025
END_DATE = datetime(2026, 1, 22)  # 22 janvier 2026
DAYS_PER_BATCH = 1  # 1 jour par export (pour rester sous 500)
DOWNLOAD_DIR = os.path.expanduser("~/Downloads/inpi_exports")

# Stats
TOTAL_EXPECTED = 27685  # Nombre total d'entreprises attendues
EXPORTS_NEEDED = (END_DATE - START_DATE).days  # ~53 exports

# URL du portail (À ADAPTER selon le site exact)
BASE_URL = "https://data.inpi.fr/"  # URL à adapter selon le vrai site

# Créer le dossier de téléchargement
os.makedirs(DOWNLOAD_DIR, exist_ok=True)

def setup_driver():
    """Configure le driver Chrome avec téléchargement automatique"""
    chrome_options = Options()
    
    # Téléchargement automatique sans popup
    prefs = {
        "download.default_directory": DOWNLOAD_DIR,
        "download.prompt_for_download": False,
        "download.directory_upgrade": True,
        "safebrowsing.enabled": True
    }
    chrome_options.add_experimental_option("prefs", prefs)
    
    # Mode headless (sans interface) - décommenter pour accélérer
    # chrome_options.add_argument("--headless")
    
    driver = webdriver.Chrome(options=chrome_options)
    return driver

def download_batch(driver, start_date, end_date, batch_num):
    """Télécharge un lot d'entreprises pour une période donnée"""
    
    print(f"\n📥 Batch {batch_num}: {start_date.strftime('%d/%m/%Y')} → {end_date.strftime('%d/%m/%Y')}")
    
    try:
        # Aller sur la page de recherche
        driver.get(BASE_URL)
        time.sleep(2)
        
        # TODO: Adapter ces sélecteurs selon le vrai site
        # Exemple de sélection des filtres :
        
        # 1. Statut : Active
        # status_checkbox = driver.find_element(By.ID, "status_active")
        # status_checkbox.click()
        
        # 2. Date de début
        # date_input = driver.find_element(By.ID, "date_debut")
        # date_input.clear()
        # date_input.send_keys(start_date.strftime("%d/%m/%Y"))
        
        # 3. Date de fin
        # date_fin_input = driver.find_element(By.ID, "date_fin")
        # date_fin_input.clear()
        # date_fin_input.send_keys(end_date.strftime("%d/%m/%Y"))
        
        # 4. Formes juridiques (SAS, SARL, etc.)
        # sarl_checkbox = driver.find_element(By.ID, "forme_sarl")
        # sarl_checkbox.click()
        # ... autres formes juridiques
        
        # 5. Lancer la recherche
        # search_button = driver.find_element(By.ID, "search_button")
        # search_button.click()
        # time.sleep(3)
        
        # 6. Cliquer sur "Exporter les 500 premiers"
        # export_button = driver.find_element(By.XPATH, "//button[contains(text(), 'Exporter')]")
        # export_button.click()
        
        print(f"✅ Export {batch_num} déclenché !")
        
        # Attendre que le téléchargement soit terminé
        time.sleep(5)
        
        return True
        
    except Exception as e:
        print(f"❌ Erreur lors du batch {batch_num}: {str(e)}")
        return False

def main():
    """Fonction principale"""
    
    print("🚀 Démarrage du téléchargement automatique Data INPI")
    print(f"📅 Période : {START_DATE.strftime('%d/%m/%Y')} → {END_DATE.strftime('%d/%m/%Y')}")
    print(f"📦 Dossier de destination : {DOWNLOAD_DIR}")
    print("-" * 60)
    
    # Setup driver
    driver = setup_driver()
    
    try:
        current_date = START_DATE
        batch_num = 1
        successful_downloads = 0
        
        # Boucle sur toutes les périodes
        while current_date < END_DATE:
            # Calculer la fin de la période
            period_end = min(current_date + timedelta(days=DAYS_PER_BATCH), END_DATE)
            
            # Télécharger le batch
            success = download_batch(driver, current_date, period_end, batch_num)
            
            if success:
                successful_downloads += 1
            
            # Passer à la période suivante
            current_date = period_end + timedelta(days=1)
            batch_num += 1
            
            # Pause entre les requêtes (important pour ne pas être bloqué)
            time.sleep(3)
        
        print("\n" + "=" * 60)
        print(f"✅ Téléchargement terminé !")
        print(f"📊 {successful_downloads} fichiers téléchargés")
        print(f"📁 Fichiers dans : {DOWNLOAD_DIR}")
        print("=" * 60)
        
    except KeyboardInterrupt:
        print("\n⚠️ Arrêt manuel du script")
    
    finally:
        driver.quit()
        print("🔚 Driver fermé")

if __name__ == "__main__":
    # IMPORTANT : Avant d'exécuter ce script :
    # 1. Installe les dépendances : pip install selenium webdriver-manager
    # 2. Adapte BASE_URL avec l'URL exacte du site
    # 3. Adapte les sélecteurs CSS/XPath selon le site
    # 4. Teste avec DAYS_PER_BATCH = 30 d'abord (moins de requêtes)
    
    print("⚠️  ATTENTION : Ce script doit être adapté au site exact !")
    print("⚠️  Donne-moi l'URL exacte du site pour que je personnalise le script")
    print()
    
    # Décommenter pour lancer :
    # main()
