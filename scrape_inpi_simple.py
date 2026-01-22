#!/usr/bin/env python3
"""
Script SIMPLE pour scraper INPI
Version allégée et robuste
"""

import time
import os
import json
import re
from datetime import datetime
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager

# URL INPI avec tes filtres
URL = "https://data.inpi.fr/search?advancedSearch=%257B%2522checkboxes%2522%253A%257B%2522status%2522%253A%257B%2522order%2522%253A0%252C%2522searchField%2522%253A%255B%2522is_rad%2522%255D%252C%2522values%2522%253A%255B%257B%2522value%2522%253A%2522false%2522%252C%2522checked%2522%253Atrue%257D%252C%257B%2522value%2522%253A%2522true%2522%252C%2522checked%2522%253Afalse%257D%255D%257D%257D%252C%2522texts%2522%253A%257B%257D%252C%2522multipleSelects%2522%253A%257B%257D%252C%2522dates%2522%253A%257B%2522start_activity_date%2522%253A%257B%2522order%2522%253A15%252C%2522searchField%2522%253A%255B%2522idt_date_debut_activ%2522%255D%252C%2522startDate%2522%253A1767222000000%252C%2522endDate%2522%253A1774994340000%257D%257D%257D&displayStyle=List&filter=%257B%2522idt_cp_short%2522%253A%255B%252202%2522%252C%252203%2522%252C%252204%2522%252C%252205%2522%252C%252207%2522%252C%252208%2522%252C%252209%2522%252C%252210%2522%252C%252211%2522%252C%252212%2522%252C%252213%2522%252C%252214%2522%252C%252215%2522%252C%252216%2522%252C%252217%2522%252C%252218%2522%252C%252219%2522%252C%252220%2522%252C%252221%2522%252C%252222%2522%252C%252223%2522%252C%252224%2522%252C%252225%2522%252C%252226%2522%252C%252227%2522%252C%252228%2522%252C%252229%2522%252C%252230%2522%252C%252231%2522%252C%252232%2522%252C%252233%2522%252C%252234%2522%252C%252236%2522%252C%252235%2522%252C%252237%2522%252C%252238%2522%252C%252239%2522%252C%252240%2522%252C%252241%2522%252C%252242%2522%252C%252243%2522%252C%252244%2522%252C%252245%2522%252C%252246%2522%252C%252247%2522%252C%252248%2522%252C%252249%2522%252C%252250%2522%252C%252251%2522%252C%252252%2522%252C%252253%2522%252C%252254%2522%252C%252255%2522%252C%252256%2522%252C%252257%2522%252C%252258%2522%252C%252259%2522%252C%252260%2522%252C%252261%2522%252C%252262%2522%252C%252263%2522%252C%252264%2522%252C%252265%2522%252C%252266%2522%252C%252267%2522%252C%252268%2522%252C%252269%2522%252C%252270%2522%252C%252271%2522%252C%252272%2522%252C%252273%2522%252C%252274%2522%252C%252275%2522%252C%252276%2522%252C%252277%2522%252C%252278%2522%252C%252279%2522%252C%252280%2522%252C%252281%2522%252C%252282%2522%252C%252283%2522%252C%252284%2522%252C%252285%2522%252C%252286%2522%252C%252287%2522%252C%252288%2522%252C%252289%2522%252C%252290%2522%252C%252291%2522%252C%252292%2522%252C%252293%2522%252C%252294%2522%252C%252295%2522%252C%252201%2522%252C%252206%2522%255D%252C%2522idt_pm_code_form_jur%2522%253A%255B%25225499%2522%252C%25225710%2522%252C%25225485%2522%252C%25225785%2522%252C%25225202%2522%255D%252C%2522formality.content.formeExerciceActivitePrincipale%2522%253A%255B%2522ARTISANALE_REGLEMENTEE%2522%252C%2522COMMERCIALE%2522%252C%2522LIBERALE_REGLEMENTEE%2522%255D%257D&nbResultsPerPage=20&order=asc&page=1&q=&searchType=advanced&sort=relevance&type=companies"

# Dossier de sortie
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "data", "inpi_scrapes")
os.makedirs(OUTPUT_DIR, exist_ok=True)

def main():
    print("=" * 60)
    print("🚀 SCRAPER INPI SIMPLE")
    print("=" * 60)
    
    # Configuration Chrome
    print("\n📦 Configuration de Chrome...")
    options = webdriver.ChromeOptions()
    options.add_argument("--disable-blink-features=AutomationControlled")
    options.add_argument("--window-size=1400,900")
    
    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=options)
    
    companies = []
    
    try:
        # Charger la page
        print(f"\n🌐 Chargement de la page INPI...")
        driver.get(URL)
        
        print("⏳ Attente du chargement (10 secondes)...")
        time.sleep(10)
        
        # Afficher le titre de la page
        print(f"📄 Page chargée: {driver.title}")
        
        # Chercher le nombre de résultats
        print("\n🔍 Recherche des résultats...")
        
        # Attendre que la page soit chargée
        time.sleep(5)
        
        # Prendre une capture d'écran pour debug
        screenshot_path = os.path.join(OUTPUT_DIR, "debug_screenshot.png")
        driver.save_screenshot(screenshot_path)
        print(f"📸 Screenshot sauvegardé: {screenshot_path}")
        
        # Afficher le HTML de la page pour debug
        print("\n🔎 Analyse de la page...")
        
        # Chercher tous les liens vers des entreprises
        links = driver.find_elements(By.XPATH, "//a[contains(@href, '/entreprise/')]")
        print(f"   Liens entreprises trouvés: {len(links)}")
        
        # Chercher des éléments de liste
        list_items = driver.find_elements(By.XPATH, "//div[contains(@class, 'result')]")
        print(f"   Éléments 'result': {len(list_items)}")
        
        # Chercher des cartes
        cards = driver.find_elements(By.XPATH, "//article | //div[contains(@class, 'card')]")
        print(f"   Cartes/articles: {len(cards)}")
        
        # Si on trouve des liens entreprises, les extraire
        if links:
            print(f"\n✅ {len(links)} entreprises trouvées!")
            print("\n📥 Extraction des données...")
            
            # Limiter à 50 pour le test
            max_companies = min(50, len(links))
            
            for i, link in enumerate(links[:max_companies]):
                try:
                    href = link.get_attribute('href')
                    text = link.text.strip()
                    
                    if href and '/entreprise/' in href:
                        siren = href.split('/entreprise/')[-1].split('?')[0].split('/')[0]
                        
                        company = {
                            "siren": siren,
                            "nom": text if text else f"Entreprise {siren}",
                            "url": href,
                            "scraped_at": datetime.now().isoformat()
                        }
                        companies.append(company)
                        
                        if (i + 1) % 10 == 0:
                            print(f"   {i + 1}/{max_companies} extraites...")
                            
                except Exception as e:
                    print(f"   ⚠️ Erreur ligne {i}: {e}")
                    continue
            
            print(f"\n✅ {len(companies)} entreprises extraites de la liste")
            
            # Maintenant, aller chercher les détails de chaque entreprise
            print("\n🔍 Récupération des détails (dirigeants, adresses)...")
            
            for i, company in enumerate(companies[:20]):  # Limiter à 20 pour les détails
                try:
                    print(f"   [{i+1}/20] {company['nom'][:40]}...")
                    
                    # Ouvrir la page de l'entreprise
                    driver.get(company['url'])
                    time.sleep(3)
                    
                    # Chercher le dirigeant
                    dirigeant_selectors = [
                        "//div[contains(text(), 'Dirigeant')]/following-sibling::*",
                        "//span[contains(text(), 'Dirigeant')]/following-sibling::*",
                        "//*[contains(@class, 'dirigeant')]",
                        "//*[contains(@class, 'representant')]",
                        "//h3[contains(text(), 'Représentant')]/following-sibling::*",
                    ]
                    
                    for sel in dirigeant_selectors:
                        try:
                            el = driver.find_element(By.XPATH, sel)
                            if el.text.strip():
                                company['dirigeant'] = el.text.strip().split('\n')[0]
                                break
                        except:
                            continue
                    
                    # Chercher l'adresse
                    addr_selectors = [
                        "//address",
                        "//*[contains(@class, 'address')]",
                        "//*[contains(@class, 'adresse')]",
                    ]
                    
                    for sel in addr_selectors:
                        try:
                            el = driver.find_element(By.XPATH, sel)
                            if el.text.strip():
                                company['adresse'] = el.text.strip()
                                # Extraire code postal
                                cp_match = re.search(r'(\d{5})', el.text)
                                if cp_match:
                                    company['code_postal'] = cp_match.group(1)
                                break
                        except:
                            continue
                    
                    # Chercher le SIRET
                    try:
                        page_text = driver.find_element(By.TAG_NAME, "body").text
                        siret_match = re.search(r'\b(\d{14})\b', page_text)
                        if siret_match:
                            company['siret'] = siret_match.group(1)
                    except:
                        pass
                    
                except Exception as e:
                    print(f"      ⚠️ Erreur détails: {e}")
                    continue
        
        else:
            print("\n⚠️ Aucun lien entreprise trouvé sur la page")
            print("\n💡 Le site INPI a peut-être une structure différente.")
            print("   Regarde le screenshot pour voir ce qui s'affiche.")
            
            # Sauvegarder le HTML pour debug
            html_path = os.path.join(OUTPUT_DIR, "debug_page.html")
            with open(html_path, 'w', encoding='utf-8') as f:
                f.write(driver.page_source)
            print(f"   HTML sauvegardé: {html_path}")
        
    except Exception as e:
        print(f"\n❌ Erreur: {e}")
        import traceback
        traceback.print_exc()
    
    finally:
        # Sauvegarder les résultats
        if companies:
            timestamp = datetime.now().strftime("%Y-%m-%d_%H%M%S")
            output_path = os.path.join(OUTPUT_DIR, f"inpi_export_{timestamp}.json")
            
            with open(output_path, 'w', encoding='utf-8') as f:
                json.dump({
                    "metadata": {
                        "scraped_at": timestamp,
                        "total": len(companies)
                    },
                    "companies": companies
                }, f, ensure_ascii=False, indent=2)
            
            print(f"\n📄 Fichier sauvegardé: {output_path}")
            
            # Stats
            with_dirigeant = sum(1 for c in companies if c.get('dirigeant'))
            print(f"\n📊 RÉSUMÉ:")
            print(f"   Total entreprises: {len(companies)}")
            print(f"   Avec dirigeant: {with_dirigeant}")
        
        print("\n🔒 Fermeture du navigateur dans 5 secondes...")
        time.sleep(5)
        driver.quit()
        print("✅ Terminé!")

if __name__ == "__main__":
    main()
