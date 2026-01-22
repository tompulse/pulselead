#!/usr/bin/env python3
"""
🚀 SCRAPER INPI - Version CLICK
Clique sur chaque entreprise pour récupérer les détails complets
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
from selenium.webdriver.common.action_chains import ActionChains
from selenium.common.exceptions import TimeoutException, StaleElementReferenceException
from webdriver_manager.chrome import ChromeDriverManager

# URL INPI
URL = "https://data.inpi.fr/search?advancedSearch=%257B%2522checkboxes%2522%253A%257B%2522status%2522%253A%257B%2522order%2522%253A0%252C%2522searchField%2522%253A%255B%2522is_rad%2522%255D%252C%2522values%2522%253A%255B%257B%2522value%2522%253A%2522false%2522%252C%2522checked%2522%253Atrue%257D%252C%257B%2522value%2522%253A%2522true%2522%252C%2522checked%2522%253Afalse%257D%255D%257D%257D%252C%2522texts%2522%253A%257B%257D%252C%2522multipleSelects%2522%253A%257B%257D%252C%2522dates%2522%253A%257B%2522start_activity_date%2522%253A%257B%2522order%2522%253A15%252C%2522searchField%2522%253A%255B%2522idt_date_debut_activ%2522%255D%252C%2522startDate%2522%253A1767222000000%252C%2522endDate%2522%253A1774994340000%257D%257D%257D&displayStyle=List&filter=%257B%2522idt_cp_short%2522%253A%255B%252202%2522%252C%252203%2522%252C%252204%2522%252C%252205%2522%252C%252207%2522%252C%252208%2522%252C%252209%2522%252C%252210%2522%252C%252211%2522%252C%252212%2522%252C%252213%2522%252C%252214%2522%252C%252215%2522%252C%252216%2522%252C%252217%2522%252C%252218%2522%252C%252219%2522%252C%252220%2522%252C%252221%2522%252C%252222%2522%252C%252223%2522%252C%252224%2522%252C%252225%2522%252C%252226%2522%252C%252227%2522%252C%252228%2522%252C%252229%2522%252C%252230%2522%252C%252231%2522%252C%252232%2522%252C%252233%2522%252C%252234%2522%252C%252236%2522%252C%252235%2522%252C%252237%2522%252C%252238%2522%252C%252239%2522%252C%252240%2522%252C%252241%2522%252C%252242%2522%252C%252243%2522%252C%252244%2522%252C%252245%2522%252C%252246%2522%252C%252247%2522%252C%252248%2522%252C%252249%2522%252C%252250%2522%252C%252251%2522%252C%252252%2522%252C%252253%2522%252C%252254%2522%252C%252255%2522%252C%252256%2522%252C%252257%2522%252C%252258%2522%252C%252259%2522%252C%252260%2522%252C%252261%2522%252C%252262%2522%252C%252263%2522%252C%252264%2522%252C%252265%2522%252C%252266%2522%252C%252267%2522%252C%252268%2522%252C%252269%2522%252C%252270%2522%252C%252271%2522%252C%252272%2522%252C%252273%2522%252C%252274%2522%252C%252275%2522%252C%252276%2522%252C%252277%2522%252C%252278%2522%252C%252279%2522%252C%252280%2522%252C%252281%2522%252C%252282%2522%252C%252283%2522%252C%252284%2522%252C%252285%2522%252C%252286%2522%252C%252287%2522%252C%252288%2522%252C%252289%2522%252C%252290%2522%252C%252291%2522%252C%252292%2522%252C%252293%2522%252C%252294%2522%252C%252295%2522%252C%252201%2522%252C%252206%2522%255D%252C%2522idt_pm_code_form_jur%2522%253A%255B%25225499%2522%252C%25225710%2522%252C%25225485%2522%252C%25225785%2522%252C%25225202%2522%255D%252C%2522formality.content.formeExerciceActivitePrincipale%2522%253A%255B%2522ARTISANALE_REGLEMENTEE%2522%252C%2522COMMERCIALE%2522%252C%2522LIBERALE_REGLEMENTEE%2522%255D%257D&nbResultsPerPage=20&order=asc&page=1&q=&searchType=advanced&sort=relevance&type=companies"

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "data", "inpi_scrapes")
os.makedirs(OUTPUT_DIR, exist_ok=True)

MAX_COMPANIES = 20  # Pour le test


def extract_company_details(driver):
    """Extrait les détails d'une fiche entreprise"""
    company = {}
    
    time.sleep(2)  # Attendre le chargement
    
    try:
        page_text = driver.find_element(By.TAG_NAME, "body").text
        page_html = driver.page_source
        
        # SIREN
        siren_match = re.search(r'SIREN\s*[:\s]*(\d[\d\s]{7,10}\d)', page_text)
        if siren_match:
            company['siren'] = siren_match.group(1).replace(' ', '').replace('\n', '')
        
        # SIRET  
        siret_match = re.search(r'SIRET\s*[:\s]*(\d[\d\s]{12,16}\d)', page_text)
        if siret_match:
            company['siret'] = siret_match.group(1).replace(' ', '').replace('\n', '')
        
        # Nom / Dénomination
        denom_match = re.search(r'(?:Dénomination|Raison sociale)[:\s]*([A-Z][A-Z0-9\s\-\'\.]+)', page_text)
        if denom_match:
            company['nom'] = denom_match.group(1).strip()
        
        # Date début activité
        date_match = re.search(r'(?:Début d\'activité|Date de création)[:\s]*(\d{2}/\d{2}/\d{4})', page_text)
        if date_match:
            company['date_creation'] = date_match.group(1)
        
        # Forme juridique
        forme_match = re.search(r'(?:Forme juridique)[:\s]*([A-Z][A-Za-zÀ-ÿ\s\-]+?)(?:\n|Activité|Capital)', page_text)
        if forme_match:
            company['forme_juridique'] = forme_match.group(1).strip()
        
        # Adresse - plusieurs patterns
        addr_patterns = [
            r'(?:Adresse|Siège)[:\s]*(\d+[^,\n]+)',
            r'(\d+\s+(?:rue|avenue|boulevard|place|chemin|allée|impasse)[^,\n]+)',
        ]
        for pattern in addr_patterns:
            addr_match = re.search(pattern, page_text, re.IGNORECASE)
            if addr_match:
                company['adresse'] = addr_match.group(1).strip()
                break
        
        # Code postal et ville
        cp_ville_match = re.search(r'(\d{5})\s+([A-ZÀÂÄÉÈÊËÏÎÔÙÛÜŸŒÆ][A-ZÀÂÄÉÈÊËÏÎÔÙÛÜŸŒÆa-zàâäéèêëïîôùûüÿœæ\-\s]+)', page_text)
        if cp_ville_match:
            company['code_postal'] = cp_ville_match.group(1)
            company['ville'] = cp_ville_match.group(2).strip().split('\n')[0]
        
        # Code NAF/APE
        naf_match = re.search(r'(?:Code NAF|APE|Activité principale)[:\s]*(\d{2}\.?\d{2}[A-Z]?)', page_text)
        if naf_match:
            company['code_naf'] = naf_match.group(1)
        
        # Capital
        capital_match = re.search(r'Capital[:\s]*([\d\s,\.]+)\s*(?:€|EUR)', page_text)
        if capital_match:
            company['capital'] = capital_match.group(1).replace(' ', '').replace(',', '.')
        
        # ===== DIRIGEANT =====
        # C'est le plus important ! Plusieurs patterns à tester
        
        dirigeant_patterns = [
            # Pattern 1: "Dirigeant : Prénom NOM"
            r'(?:Dirigeant|Gérant|Président|Représentant légal)\s*[:\s]+([A-ZÀÂÄÉÈÊËÏÎÔÙÛÜŸŒÆ][a-zàâäéèêëïîôùûüÿœæ]+(?:\s+[A-ZÀÂÄÉÈÊËÏÎÔÙÛÜŸŒÆ][a-zàâäéèêëïîôùûüÿœæA-Z\-]+)+)',
            # Pattern 2: "NOM Prénom" après Dirigeant
            r'(?:Dirigeant|Gérant|Président)\s*[:\s]+([A-Z][A-Z\-]+\s+[A-ZÀ-Ÿ][a-zà-ÿ]+)',
            # Pattern 3: Tout en majuscules
            r'(?:Dirigeant|Gérant|Président)\s*[:\s]+([A-Z][A-Z\s\-]{3,30})',
        ]
        
        for pattern in dirigeant_patterns:
            match = re.search(pattern, page_text)
            if match:
                dirigeant = match.group(1).strip()
                # Nettoyer
                dirigeant = re.sub(r'\s+', ' ', dirigeant)
                if len(dirigeant) > 3 and not any(x in dirigeant.lower() for x in ['siège', 'activité', 'capital']):
                    company['dirigeant'] = dirigeant
                    break
        
        # Si pas trouvé, chercher dans une section spécifique
        if not company.get('dirigeant'):
            # Chercher une section "Représentants" ou similaire
            repr_section = re.search(r'(?:Représentant|Dirigeant|Mandataire)s?\s*(?:légaux?)?\s*[:\n](.+?)(?:Établissement|Activité|$)', page_text, re.DOTALL | re.IGNORECASE)
            if repr_section:
                section_text = repr_section.group(1)[:200]
                # Chercher un nom dans cette section
                name_match = re.search(r'([A-ZÀÂÄÉÈÊËÏÎÔÙÛÜŸŒÆ][a-zàâäéèêëïîôùûüÿœæ]+(?:\s+[A-ZÀÂÄÉÈÊËÏÎÔÙÛÜŸŒÆ][a-zàâäéèêëïîôùûüÿœæA-Z\-]+)+)', section_text)
                if name_match:
                    company['dirigeant'] = name_match.group(1).strip()
        
        # Fonction du dirigeant
        fonction_match = re.search(r'(Président|Gérant|Directeur général|PDG|Administrateur)', page_text)
        if fonction_match:
            company['fonction_dirigeant'] = fonction_match.group(1)
        
    except Exception as e:
        print(f"      Erreur extraction: {e}")
    
    return company


def main():
    print("=" * 60)
    print("🚀 SCRAPER INPI - VERSION CLICK")
    print(f"📊 Max entreprises: {MAX_COMPANIES}")
    print("=" * 60)
    
    options = webdriver.ChromeOptions()
    options.add_argument("--window-size=1400,900")
    options.add_argument("--disable-blink-features=AutomationControlled")
    
    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=options)
    driver.implicitly_wait(10)
    
    companies = []
    
    try:
        print(f"\n🌐 Chargement de la page de recherche...")
        driver.get(URL)
        
        print("⏳ Attente du chargement (10s)...")
        time.sleep(10)
        
        # Vérifier qu'on a des résultats
        results = driver.find_elements(By.CSS_SELECTOR, ".result-list, .results-without-actions")
        print(f"📊 {len(results)} éléments de résultat trouvés")
        
        if not results:
            # Essayer un autre sélecteur
            results = driver.find_elements(By.XPATH, "//div[contains(@class, 'pointer')]")
            print(f"   (Alternative: {len(results)} éléments 'pointer')")
        
        # Boucle sur chaque entreprise
        for i in range(min(MAX_COMPANIES, 20)):  # 20 résultats par page max
            try:
                print(f"\n[{i+1}/{MAX_COMPANIES}] ", end="", flush=True)
                
                # Recharger la liste des éléments cliquables (ils changent après navigation)
                clickable = driver.find_elements(By.CSS_SELECTOR, ".results-without-actions.pointer")
                
                if i >= len(clickable):
                    print("Fin des résultats sur cette page")
                    break
                
                # Récupérer le nom avant de cliquer
                try:
                    nom_element = clickable[i].find_element(By.CSS_SELECTOR, ".title-result-bloc, .content-result-bloc")
                    nom_preview = nom_element.text.split('\n')[0][:40] if nom_element.text else f"Entreprise {i+1}"
                except:
                    nom_preview = f"Entreprise {i+1}"
                
                print(f"{nom_preview}...", end=" ", flush=True)
                
                # Scroller vers l'élément
                driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", clickable[i])
                time.sleep(0.5)
                
                # Cliquer
                try:
                    clickable[i].click()
                except:
                    # Si le clic normal échoue, utiliser JavaScript
                    driver.execute_script("arguments[0].click();", clickable[i])
                
                time.sleep(3)  # Attendre le chargement de la fiche
                
                # Vérifier qu'on est bien sur une page de détail
                current_url = driver.current_url
                if '/entreprise/' in current_url or 'company' in current_url:
                    print("📄 Fiche ouverte!", end=" ", flush=True)
                
                # Extraire les détails
                company = extract_company_details(driver)
                company['scraped_at'] = datetime.now().isoformat()
                company['url'] = current_url
                
                if company.get('nom') or company.get('siren'):
                    companies.append(company)
                    dirigeant_info = company.get('dirigeant', 'N/A')[:25]
                    print(f"✓ Dirigeant: {dirigeant_info}")
                else:
                    print("⚠️ Pas d'infos")
                
                # Retourner à la liste
                driver.back()
                time.sleep(2)
                
                # Attendre que la liste se recharge
                WebDriverWait(driver, 10).until(
                    EC.presence_of_element_located((By.CSS_SELECTOR, ".result-list, .results-without-actions"))
                )
                
            except StaleElementReferenceException:
                print("⚠️ Element obsolète, rechargement...")
                driver.get(URL)
                time.sleep(5)
                continue
                
            except Exception as e:
                print(f"⚠️ Erreur: {str(e)[:50]}")
                # Retourner à la page de recherche
                driver.get(URL)
                time.sleep(5)
                continue
        
    except Exception as e:
        print(f"\n❌ Erreur fatale: {e}")
        import traceback
        traceback.print_exc()
        
    finally:
        # Sauvegarder
        if companies:
            timestamp = datetime.now().strftime("%Y-%m-%d_%H%M%S")
            output_path = os.path.join(OUTPUT_DIR, f"inpi_click_{timestamp}.json")
            
            with open(output_path, 'w', encoding='utf-8') as f:
                json.dump({
                    "metadata": {
                        "scraped_at": timestamp,
                        "total": len(companies),
                        "with_dirigeant": sum(1 for c in companies if c.get('dirigeant')),
                        "with_siren": sum(1 for c in companies if c.get('siren'))
                    },
                    "companies": companies
                }, f, ensure_ascii=False, indent=2)
            
            print(f"\n{'='*60}")
            print(f"📄 Fichier: {output_path}")
            print(f"{'='*60}")
            print(f"📊 RÉSUMÉ")
            print(f"   Total: {len(companies)}")
            print(f"   Avec SIREN: {sum(1 for c in companies if c.get('siren'))}")
            print(f"   Avec dirigeant: {sum(1 for c in companies if c.get('dirigeant'))}")
            print(f"   Avec adresse: {sum(1 for c in companies if c.get('code_postal'))}")
            print(f"{'='*60}")
            
            # Afficher un exemple
            if companies:
                print("\n📋 Exemple de données extraites:")
                example = companies[0]
                for key, value in example.items():
                    if key != 'scraped_at' and key != 'url':
                        print(f"   {key}: {value}")
        else:
            print("\n⚠️ Aucune entreprise extraite")
        
        print("\n🔒 Fermeture dans 3 secondes...")
        time.sleep(3)
        driver.quit()
        print("✅ Terminé!")


if __name__ == "__main__":
    main()
