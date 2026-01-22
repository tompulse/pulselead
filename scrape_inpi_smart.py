#!/usr/bin/env python3
"""
Script Selenium intelligent pour INPI
Utilise ton URL avec tous les filtres déjà configurés
Change seulement la date

INSTALLATION :
    pip3 install selenium webdriver-manager

USAGE :
    python3 scrape_inpi_smart.py
"""

import time
import os
from datetime import datetime, timedelta
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.keys import Keys
from webdriver_manager.chrome import ChromeDriverManager
import json
from urllib.parse import quote

# Configuration
START_DATE = datetime(2026, 1, 1)
END_DATE = datetime(2026, 1, 22)
DOWNLOAD_DIR = os.path.expanduser("~/Downloads/inpi_exports_auto")
os.makedirs(DOWNLOAD_DIR, exist_ok=True)

# TON URL DE BASE (avec tous tes filtres)
BASE_URL = "https://data.inpi.fr/search?advancedSearch=%257B%2522checkboxes%2522%253A%257B%2522status%2522%253A%257B%2522order%2522%253A0%252C%2522searchField%2522%253A%255B%2522is_rad%2522%255D%252C%2522values%2522%253A%255B%257B%2522value%2522%253A%2522false%2522%252C%2522checked%2522%253Atrue%257D%252C%257B%2522value%2522%253A%2522true%2522%252C%2522checked%2522%253Afalse%257D%255D%257D%257D%252C%2522texts%2522%253A%257B%257D%252C%2522multipleSelects%2522%253A%257B%257D%252C%2522dates%2522%253A%257B%2522start_activity_date%2522%253A%257B%2522order%2522%253A15%252C%2522searchField%2522%253A%255B%2522idt_date_debut_activ%2522%255D%252C%2522startDate%2522%253APLACEHOLDER_START%252C%2522endDate%2522%253APLACEHOLDER_END%257D%257D%257D&displayStyle=List&filter=%257B%2522idt_pm_code_form_jur%2522%253A%255B%25225499%2522%252C%25225710%2522%252C%25225485%2522%252C%25225785%2522%252C%25223220%2522%252C%25225202%2522%255D%252C%2522idt_cp_short%2522%253A%255B%252202%2522%252C%252204%2522%252C%252205%2522%252C%252206%2522%252C%252207%2522%252C%252208%2522%252C%252209%2522%252C%252210%2522%252C%252211%2522%252C%252212%2522%252C%252213%2522%252C%252214%2522%252C%252215%2522%252C%252216%2522%252C%252217%2522%252C%252218%2522%252C%252219%2522%252C%252221%2522%252C%252222%2522%252C%252223%2522%252C%252224%2522%252C%252225%2522%252C%252226%2522%252C%252227%2522%252C%252228%2522%252C%252229%2522%252C%252230%2522%252C%252231%2522%252C%252232%2522%252C%252233%2522%252C%252234%2522%252C%252235%2522%252C%252236%2522%252C%252237%2522%252C%252238%2522%252C%252239%2522%252C%252240%2522%252C%252241%2522%252C%252242%2522%252C%252243%2522%252C%252244%2522%252C%252245%2522%252C%252246%2522%252C%252247%2522%252C%252248%2522%252C%252249%2522%252C%252250%2522%252C%252251%2522%252C%252252%2522%252C%252253%2522%252C%252254%2522%252C%252255%2522%252C%252256%2522%252C%252257%2522%252C%252258%2522%252C%252259%2522%252C%252260%2522%252C%252261%2522%252C%252262%2522%252C%252263%2522%252C%252264%2522%252C%252265%2522%252C%252266%2522%252C%252267%2522%252C%252268%2522%252C%252269%2522%252C%252270%2522%252C%252271%2522%252C%252272%2522%252C%252273%2522%252C%252274%2522%252C%252275%2522%252C%252276%2522%252C%252277%2522%252C%252278%2522%252C%252279%2522%252C%252280%2522%252C%252281%2522%252C%252282%2522%252C%252283%2522%252C%252284%2522%252C%252285%2522%252C%252290%2522%252C%252289%2522%252C%252288%2522%252C%252287%2522%252C%252286%2522%252C%252291%2522%252C%252292%2522%252C%252295%2522%252C%252294%2522%252C%252293%2522%252C%252203%2522%252C%252201%2522%255D%252C%2522formality.content.formeExerciceActivitePrincipale%2522%253A%255B%2522COMMERCIALE%2522%252C%2522ARTISANALE%2522%252C%2522ARTISANALE_REGLEMENTEE%2522%252C%2522LIBERALE_REGLEMENTEE%2522%255D%257D&nbResultsPerPage=20&order=asc&page=1&q=&searchType=advanced&sort=relevance&type=companies"

def date_to_timestamp(date):
    """Convertit une date en timestamp milliseconds"""
    return int(date.timestamp() * 1000)

def setup_driver():
    """Configure Chrome"""
    chrome_options = webdriver.ChromeOptions()
    
    prefs = {
        "download.default_directory": DOWNLOAD_DIR,
        "download.prompt_for_download": False,
        "download.directory_upgrade": True,
        "safebrowsing.enabled": False
    }
    chrome_options.add_experimental_option("prefs", prefs)
    
    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=chrome_options)
    driver.maximize_window()
    
    return driver

def export_for_date(driver, current_date, batch_num):
    """Exporte pour une date donnée"""
    date_str = current_date.strftime("%d/%m/%Y")
    print(f"\n📥 Batch {batch_num}/23 : {date_str}")
    
    try:
        # Timestamp pour minuit le jour donné
        start_timestamp = date_to_timestamp(current_date)
        # Timestamp pour 23h59 le même jour
        end_timestamp = date_to_timestamp(current_date + timedelta(days=1) - timedelta(seconds=1))
        
        # Construit l'URL avec la date
        url = BASE_URL.replace("PLACEHOLDER_START", str(start_timestamp))
        url = url.replace("PLACEHOLDER_END", str(end_timestamp))
        
        print(f"   Navigation vers l'URL...")
        driver.get(url)
        
        # Attendre que la page charge
        time.sleep(5)
        
        # Attendre les résultats
        print(f"   Attente des résultats...")
        WebDriverWait(driver, 20).until(
            EC.presence_of_element_located((By.TAG_NAME, "body"))
        )
        time.sleep(3)
        
        # Cherche et clique sur le bouton Export
        print(f"   Recherche du bouton Export...")
        
        # Essayer plusieurs sélecteurs possibles
        export_clicked = False
        
        # Sélecteur 1 : Bouton avec texte "Exporter"
        try:
            export_btn = driver.find_element(By.XPATH, "//button[contains(text(), 'Exporter')]")
            export_btn.click()
            export_clicked = True
            print(f"   ✅ Bouton Export cliqué")
        except:
            pass
        
        # Sélecteur 2 : Icône export
        if not export_clicked:
            try:
                export_btn = driver.find_element(By.CSS_SELECTOR, "[data-testid='export-button']")
                export_btn.click()
                export_clicked = True
                print(f"   ✅ Bouton Export cliqué (CSS)")
            except:
                pass
        
        if not export_clicked:
            print(f"   ⚠️  Bouton Export introuvable, export manuel requis")
            print(f"   Clique sur 'Exporter' manuellement, puis appuie sur ENTRÉE...")
            input()
        
        time.sleep(2)
        
        # Clique sur CSV si menu apparaît
        try:
            csv_btn = driver.find_element(By.XPATH, "//button[contains(text(), 'CSV')]")
            csv_btn.click()
            print(f"   ✅ Format CSV sélectionné")
        except:
            print(f"   CSV déjà sélectionné ou téléchargement direct")
        
        # Attendre le téléchargement
        print(f"   ⏳ Téléchargement en cours...")
        time.sleep(15)  # Ajuster selon connexion
        
        print(f"✅ Export {batch_num}/23 terminé")
        return True
        
    except Exception as e:
        print(f"❌ Erreur : {e}")
        print(f"⚠️  Continue manuellement ? (y/n)")
        if input().lower() == 'y':
            print("Fais l'export manuellement, puis appuie sur ENTRÉE...")
            input()
            return True
        return False

def main():
    print("=" * 80)
    print("🤖 SCRAPING INTELLIGENT INPI (URL + SELENIUM)")
    print("=" * 80)
    print(f"📅 Période : 01/01/2026 → 22/01/2026")
    print(f"📊 23 exports automatiques")
    print(f"📁 Dossier : {DOWNLOAD_DIR}")
    print("=" * 80)
    
    driver = setup_driver()
    
    try:
        current_date = START_DATE
        batch_num = 1
        
        while current_date <= END_DATE:
            success = export_for_date(driver, current_date, batch_num)
            
            if not success:
                print("⚠️  Arrêter ? (y/n)")
                if input().lower() == 'y':
                    break
            
            # Petite pause
            time.sleep(2)
            
            current_date += timedelta(days=1)
            batch_num += 1
        
        print("\n" + "=" * 80)
        print("🎉 TOUS LES EXPORTS TERMINÉS !")
        print(f"📁 Fichiers dans : {DOWNLOAD_DIR}")
        print("=" * 80)
        
        time.sleep(5)
        
    except KeyboardInterrupt:
        print("\n⚠️  Arrêt manuel (Ctrl+C)")
    
    finally:
        print("🔒 Fermeture du navigateur dans 10 secondes...")
        time.sleep(10)
        driver.quit()

if __name__ == "__main__":
    main()
