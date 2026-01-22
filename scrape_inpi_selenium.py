#!/usr/bin/env python3
"""
Script Selenium pour automatiser les exports INPI
Du 01/01/2026 au 22/01/2026 (23 exports)

INSTALLATION :
    pip3 install selenium webdriver-manager

USAGE :
    python3 scrape_inpi_selenium.py
"""

import time
import os
from datetime import datetime, timedelta
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager

# Configuration
START_DATE = datetime(2026, 1, 1)
END_DATE = datetime(2026, 1, 22)
DOWNLOAD_DIR = os.path.expanduser("~/Downloads/inpi_exports_auto")
os.makedirs(DOWNLOAD_DIR, exist_ok=True)

def setup_driver():
    """Configure Chrome avec les options de téléchargement"""
    chrome_options = webdriver.ChromeOptions()
    
    # Options pour le téléchargement automatique
    prefs = {
        "download.default_directory": DOWNLOAD_DIR,
        "download.prompt_for_download": False,
        "download.directory_upgrade": True,
        "safebrowsing.enabled": False
    }
    chrome_options.add_experimental_option("prefs", prefs)
    
    # Ne pas être en headless pour voir ce qui se passe
    # chrome_options.add_argument("--headless")  # Décommenter pour mode invisible
    
    # Installe et lance ChromeDriver automatiquement
    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=chrome_options)
    
    return driver

def configure_filters_once(driver):
    """Configure les filtres INPI (à faire une seule fois)"""
    print("🔧 Configuration des filtres INPI...")
    
    # Va sur la page de recherche
    driver.get("https://data.inpi.fr/search")
    time.sleep(3)
    
    # Clique sur "Recherche avancée"
    try:
        advanced_btn = WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Recherche avancée') or contains(text(), 'Advanced')]"))
        )
        advanced_btn.click()
        print("✅ Recherche avancée activée")
        time.sleep(2)
    except Exception as e:
        print(f"⚠️  Recherche avancée déjà active ou introuvable : {e}")
    
    # NOTE : Les filtres doivent être configurés MANUELLEMENT la première fois
    # car l'interface data.inpi.fr est complexe et change souvent
    print("\n⚠️  CONFIGURATION MANUELLE REQUISE :")
    print("1. Configure les filtres dans le navigateur qui s'est ouvert :")
    print("   - Statut : Active")
    print("   - Forme juridique : SARL, SAS, SASU, SELARL, SELAS, SNC")
    print("   - Départements : TOUS (y compris Paris)")
    print("   - Nature : COMMERCIALE, ARTISANALE, etc.")
    print("2. NE METS PAS DE DATE pour l'instant")
    print("3. Appuie sur ENTRÉE ici quand c'est fait...")
    input()
    
    print("✅ Filtres configurés !")

def export_for_date(driver, date_str, batch_num):
    """Exporte les données pour une date donnée"""
    print(f"\n📥 Batch {batch_num}/23 : {date_str}")
    
    try:
        # Trouve le champ de date (adapter selon l'interface réelle)
        # OPTION 1 : Si c'est un input texte
        date_input_start = driver.find_element(By.ID, "date_debut_activite_min")  # À adapter
        date_input_end = driver.find_element(By.ID, "date_debut_activite_max")    # À adapter
        
        # Efface et remplit les dates
        date_input_start.clear()
        date_input_start.send_keys(date_str)
        
        date_input_end.clear()
        date_input_end.send_keys(date_str)
        
        print(f"   Date définie : {date_str}")
        time.sleep(1)
        
        # Clique sur "Rechercher"
        search_btn = driver.find_element(By.XPATH, "//button[contains(text(), 'Rechercher') or contains(text(), 'Search')]")
        search_btn.click()
        print("   Recherche lancée...")
        time.sleep(5)  # Attendre les résultats
        
        # Clique sur "Exporter"
        export_btn = WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Exporter') or contains(text(), 'Export')]"))
        )
        export_btn.click()
        print("   Export lancé...")
        
        # Sélectionne CSV si nécessaire
        try:
            csv_btn = WebDriverWait(driver, 5).until(
                EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'CSV') or @data-format='csv']"))
            )
            csv_btn.click()
            print("   Format CSV sélectionné")
        except:
            print("   Format CSV déjà sélectionné ou direct")
        
        # Attendre le téléchargement
        print("   Téléchargement en cours...")
        time.sleep(10)  # Ajuster selon la vitesse de connexion
        
        print(f"✅ Export {batch_num}/23 terminé")
        return True
        
    except Exception as e:
        print(f"❌ Erreur : {e}")
        print("⚠️  Tentative de continuer...")
        return False

def main():
    print("=" * 80)
    print("🤖 SCRAPING AUTOMATIQUE INPI AVEC SELENIUM")
    print("=" * 80)
    print(f"📅 Période : 01/01/2026 → 22/01/2026 (23 exports)")
    print(f"📁 Dossier : {DOWNLOAD_DIR}")
    print("=" * 80)
    
    # Lance Chrome
    driver = setup_driver()
    
    try:
        # Configure les filtres (une seule fois)
        configure_filters_once(driver)
        
        # Pour chaque jour
        current_date = START_DATE
        batch_num = 1
        
        while current_date <= END_DATE:
            date_str = current_date.strftime("%d/%m/%Y")
            
            # Export
            success = export_for_date(driver, date_str, batch_num)
            
            if not success:
                print(f"⚠️  Échec pour {date_str}, continuer quand même ? (y/n)")
                if input().lower() != 'y':
                    break
            
            # Pause entre les exports
            time.sleep(3)
            
            # Prochain jour
            current_date += timedelta(days=1)
            batch_num += 1
        
        print("\n" + "=" * 80)
        print("🎉 TERMINÉ !")
        print(f"📁 Fichiers dans : {DOWNLOAD_DIR}")
        print("=" * 80)
        
        # Garde le navigateur ouvert 10 secondes
        time.sleep(10)
        
    except KeyboardInterrupt:
        print("\n⚠️  Arrêt manuel")
    
    finally:
        driver.quit()
        print("🔒 Navigateur fermé")

if __name__ == "__main__":
    # ATTENTION : data.inpi.fr a une interface complexe
    # Ce script nécessite peut-être des ajustements selon l'interface réelle
    print("\n⚠️  IMPORTANT :")
    print("Ce script est un TEMPLATE qui nécessite des ajustements")
    print("car l'interface data.inpi.fr peut changer.")
    print("\nContinuer quand même ? (y/n)")
    
    if input().lower() == 'y':
        main()
    else:
        print("❌ Annulé")
