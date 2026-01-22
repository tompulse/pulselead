#!/usr/bin/env python3
"""
🚀 SCRAPER INPI V2 - Adapté à la structure React du site
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
from selenium.common.exceptions import TimeoutException, NoSuchElementException
from webdriver_manager.chrome import ChromeDriverManager

# URL INPI avec tes filtres
URL = "https://data.inpi.fr/search?advancedSearch=%257B%2522checkboxes%2522%253A%257B%2522status%2522%253A%257B%2522order%2522%253A0%252C%2522searchField%2522%253A%255B%2522is_rad%2522%255D%252C%2522values%2522%253A%255B%257B%2522value%2522%253A%2522false%2522%252C%2522checked%2522%253Atrue%257D%252C%257B%2522value%2522%253A%2522true%2522%252C%2522checked%2522%253Afalse%257D%255D%257D%257D%252C%2522texts%2522%253A%257B%257D%252C%2522multipleSelects%2522%253A%257B%257D%252C%2522dates%2522%253A%257B%2522start_activity_date%2522%253A%257B%2522order%2522%253A15%252C%2522searchField%2522%253A%255B%2522idt_date_debut_activ%2522%255D%252C%2522startDate%2522%253A1767222000000%252C%2522endDate%2522%253A1774994340000%257D%257D%257D&displayStyle=List&filter=%257B%2522idt_cp_short%2522%253A%255B%252202%2522%252C%252203%2522%252C%252204%2522%252C%252205%2522%252C%252207%2522%252C%252208%2522%252C%252209%2522%252C%252210%2522%252C%252211%2522%252C%252212%2522%252C%252213%2522%252C%252214%2522%252C%252215%2522%252C%252216%2522%252C%252217%2522%252C%252218%2522%252C%252219%2522%252C%252220%2522%252C%252221%2522%252C%252222%2522%252C%252223%2522%252C%252224%2522%252C%252225%2522%252C%252226%2522%252C%252227%2522%252C%252228%2522%252C%252229%2522%252C%252230%2522%252C%252231%2522%252C%252232%2522%252C%252233%2522%252C%252234%2522%252C%252236%2522%252C%252235%2522%252C%252237%2522%252C%252238%2522%252C%252239%2522%252C%252240%2522%252C%252241%2522%252C%252242%2522%252C%252243%2522%252C%252244%2522%252C%252245%2522%252C%252246%2522%252C%252247%2522%252C%252248%2522%252C%252249%2522%252C%252250%2522%252C%252251%2522%252C%252252%2522%252C%252253%2522%252C%252254%2522%252C%252255%2522%252C%252256%2522%252C%252257%2522%252C%252258%2522%252C%252259%2522%252C%252260%2522%252C%252261%2522%252C%252262%2522%252C%252263%2522%252C%252264%2522%252C%252265%2522%252C%252266%2522%252C%252267%2522%252C%252268%2522%252C%252269%2522%252C%252270%2522%252C%252271%2522%252C%252272%2522%252C%252273%2522%252C%252274%2522%252C%252275%2522%252C%252276%2522%252C%252277%2522%252C%252278%2522%252C%252279%2522%252C%252280%2522%252C%252281%2522%252C%252282%2522%252C%252283%2522%252C%252284%2522%252C%252285%2522%252C%252286%2522%252C%252287%2522%252C%252288%2522%252C%252289%2522%252C%252290%2522%252C%252291%2522%252C%252292%2522%252C%252293%2522%252C%252294%2522%252C%252295%2522%252C%252201%2522%252C%252206%2522%255D%252C%2522idt_pm_code_form_jur%2522%253A%255B%25225499%2522%252C%25225710%2522%252C%25225485%2522%252C%25225785%2522%252C%25225202%2522%255D%252C%2522formality.content.formeExerciceActivitePrincipale%2522%253A%255B%2522ARTISANALE_REGLEMENTEE%2522%252C%2522COMMERCIALE%2522%252C%2522LIBERALE_REGLEMENTEE%2522%255D%257D&nbResultsPerPage=20&order=asc&page=1&q=&searchType=advanced&sort=relevance&type=companies"

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "data", "inpi_scrapes")
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Configuration
MAX_COMPANIES = 50  # Limite pour le test
WAIT_TIMEOUT = 20


def main():
    print("=" * 60)
    print("🚀 SCRAPER INPI V2")
    print("=" * 60)
    
    options = webdriver.ChromeOptions()
    options.add_argument("--window-size=1400,900")
    options.add_argument("--disable-blink-features=AutomationControlled")
    
    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=options)
    
    companies = []
    
    try:
        print(f"\n🌐 Chargement de la page INPI...")
        driver.get(URL)
        
        # Attendre que les résultats soient chargés
        print("⏳ Attente du chargement des résultats...")
        try:
            WebDriverWait(driver, WAIT_TIMEOUT).until(
                EC.presence_of_element_located((By.CSS_SELECTOR, ".result-list"))
            )
            print("✅ Résultats chargés!")
        except TimeoutException:
            print("⚠️  Timeout - essayons quand même...")
        
        time.sleep(3)  # Attente supplémentaire pour React
        
        # Trouver tous les éléments de résultat
        result_elements = driver.find_elements(By.CSS_SELECTOR, ".result-list")
        print(f"\n📊 {len(result_elements)} résultats trouvés sur cette page")
        
        if not result_elements:
            print("❌ Aucun résultat trouvé. Vérifions la page...")
            driver.save_screenshot(os.path.join(OUTPUT_DIR, "error_screenshot.png"))
            return
        
        # Pour chaque résultat, extraire les infos de base
        print("\n📥 Extraction des données de la liste...")
        
        for i, element in enumerate(result_elements[:MAX_COMPANIES]):
            try:
                company = {"scraped_at": datetime.now().isoformat()}
                
                # Extraire le texte complet de l'élément
                full_text = element.text
                lines = [l.strip() for l in full_text.split('\n') if l.strip()]
                
                # Parser les lignes
                # Structure typique: numéro, "Dénomination / Nom", NOM, "Début d'activité", DATE, "SIREN", NUMERO...
                for j, line in enumerate(lines):
                    if line == "Dénomination / Nom" and j + 1 < len(lines):
                        company['nom'] = lines[j + 1]
                    elif line == "Début d'activité" and j + 1 < len(lines):
                        company['date_creation'] = lines[j + 1]
                    elif line == "SIREN" and j + 1 < len(lines):
                        company['siren'] = lines[j + 1].replace(' ', '')
                    elif line == "Forme juridique" and j + 1 < len(lines):
                        company['forme_juridique'] = lines[j + 1]
                    elif line == "Siège" and j + 1 < len(lines):
                        company['adresse'] = lines[j + 1]
                
                # Si on n'a pas trouvé de structure, prendre le texte brut
                if not company.get('nom') and lines:
                    # Chercher un nom qui ressemble à une entreprise (tout en majuscules ou capitalisé)
                    for line in lines:
                        if line.isupper() and len(line) > 2 and not line.isdigit():
                            company['nom'] = line
                            break
                
                if company.get('nom') or company.get('siren'):
                    companies.append(company)
                    print(f"   [{i+1}] {company.get('nom', 'N/A')[:40]} - SIREN: {company.get('siren', 'N/A')}")
                
            except Exception as e:
                print(f"   ⚠️ Erreur ligne {i}: {e}")
                continue
        
        print(f"\n✅ {len(companies)} entreprises extraites de la liste")
        
        # Maintenant, aller chercher les détails de chaque entreprise
        if companies:
            print("\n🔍 Récupération des détails (dirigeants, adresses)...")
            print("   Cela va prendre quelques minutes...\n")
            
            for i, company in enumerate(companies[:20]):  # Limiter à 20 pour les détails
                try:
                    # Retourner à la page de recherche si nécessaire
                    if "search" not in driver.current_url:
                        driver.get(URL)
                        time.sleep(3)
                        WebDriverWait(driver, WAIT_TIMEOUT).until(
                            EC.presence_of_element_located((By.CSS_SELECTOR, ".result-list"))
                        )
                    
                    # Trouver l'élément cliquable correspondant
                    clickable_elements = driver.find_elements(By.CSS_SELECTOR, ".results-without-actions.pointer")
                    
                    if i < len(clickable_elements):
                        print(f"   [{i+1}/20] {company.get('nom', 'N/A')[:35]}...", end=" ", flush=True)
                        
                        # Scroller vers l'élément
                        driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", clickable_elements[i])
                        time.sleep(0.5)
                        
                        # Cliquer pour ouvrir les détails
                        clickable_elements[i].click()
                        time.sleep(3)
                        
                        # Extraire les détails de la page
                        page_text = driver.find_element(By.TAG_NAME, "body").text
                        
                        # Chercher le SIREN/SIRET
                        siren_match = re.search(r'SIREN[:\s]*(\d{3}\s?\d{3}\s?\d{3})', page_text)
                        if siren_match:
                            company['siren'] = siren_match.group(1).replace(' ', '')
                        
                        siret_match = re.search(r'SIRET[:\s]*(\d{14}|\d{3}\s?\d{3}\s?\d{3}\s?\d{5})', page_text)
                        if siret_match:
                            company['siret'] = siret_match.group(1).replace(' ', '')
                        
                        # Chercher le dirigeant
                        dirigeant_patterns = [
                            r'(?:Dirigeant|Gérant|Président|Représentant)[:\s]*([A-ZÀÂÄÉÈÊËÏÎÔÙÛÜŸŒÆ][a-zàâäéèêëïîôùûüÿœæ]+(?:\s+[A-ZÀÂÄÉÈÊËÏÎÔÙÛÜŸŒÆ][a-zàâäéèêëïîôùûüÿœæ]+)+)',
                            r'(?:Dirigeant|Gérant|Président)[:\s]*([A-Z][A-Z\s\-]+)',
                        ]
                        
                        for pattern in dirigeant_patterns:
                            dirigeant_match = re.search(pattern, page_text)
                            if dirigeant_match:
                                company['dirigeant'] = dirigeant_match.group(1).strip()
                                break
                        
                        # Chercher l'adresse
                        addr_match = re.search(r'Adresse[:\s]*(.+?)(?:\n|Code postal)', page_text, re.IGNORECASE)
                        if addr_match:
                            company['adresse'] = addr_match.group(1).strip()
                        
                        # Chercher le code postal
                        cp_match = re.search(r'(\d{5})\s+([A-ZÀÂÄÉÈÊËÏÎÔÙÛÜŸŒÆ\-\s]+?)(?:\n|$)', page_text)
                        if cp_match:
                            company['code_postal'] = cp_match.group(1)
                            company['ville'] = cp_match.group(2).strip()
                        
                        # Code NAF
                        naf_match = re.search(r'(?:NAF|APE)[:\s]*(\d{2}\.\d{2}[A-Z])', page_text)
                        if naf_match:
                            company['code_naf'] = naf_match.group(1)
                        
                        print(f"✓ Dirigeant: {company.get('dirigeant', 'N/A')[:25]}")
                        
                        # Retourner en arrière
                        driver.back()
                        time.sleep(2)
                    
                except Exception as e:
                    print(f"⚠️ Erreur: {e}")
                    # Retourner à la page de recherche
                    driver.get(URL)
                    time.sleep(3)
                    continue
        
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
                        "total": len(companies),
                        "with_dirigeant": sum(1 for c in companies if c.get('dirigeant'))
                    },
                    "companies": companies
                }, f, ensure_ascii=False, indent=2)
            
            print(f"\n📄 Fichier sauvegardé: {output_path}")
            
            # Stats
            print(f"\n{'='*60}")
            print("📊 RÉSUMÉ")
            print(f"{'='*60}")
            print(f"   Total entreprises: {len(companies)}")
            print(f"   Avec SIREN: {sum(1 for c in companies if c.get('siren'))}")
            print(f"   Avec dirigeant: {sum(1 for c in companies if c.get('dirigeant'))}")
            print(f"   Avec adresse: {sum(1 for c in companies if c.get('adresse') or c.get('code_postal'))}")
            print(f"{'='*60}")
        else:
            print("\n⚠️ Aucune entreprise extraite")
        
        print("\n🔒 Fermeture du navigateur dans 5 secondes...")
        time.sleep(5)
        driver.quit()
        print("✅ Terminé!")


if __name__ == "__main__":
    main()
