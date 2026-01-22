#!/usr/bin/env python3
"""
🚀 SCRAPER INPI FINAL - Version optimisée
Extrait toutes les données des fiches entreprises INPI
"""

import time
import os
import json
import csv
import re
from datetime import datetime
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.service import Service
from selenium.common.exceptions import (
    TimeoutException, 
    StaleElementReferenceException,
    ElementClickInterceptedException
)
from webdriver_manager.chrome import ChromeDriverManager

# =============================================================================
# CONFIGURATION
# =============================================================================

URL_BASE = "https://data.inpi.fr/search?advancedSearch=%257B%2522checkboxes%2522%253A%257B%2522status%2522%253A%257B%2522order%2522%253A0%252C%2522searchField%2522%253A%255B%2522is_rad%2522%255D%252C%2522values%2522%253A%255B%257B%2522value%2522%253A%2522false%2522%252C%2522checked%2522%253Atrue%257D%252C%257B%2522value%2522%253A%2522true%2522%252C%2522checked%2522%253Afalse%257D%255D%257D%257D%252C%2522texts%2522%253A%257B%257D%252C%2522multipleSelects%2522%253A%257B%257D%252C%2522dates%2522%253A%257B%2522start_activity_date%2522%253A%257B%2522order%2522%253A15%252C%2522searchField%2522%253A%255B%2522idt_date_debut_activ%2522%255D%252C%2522startDate%2522%253A1767222000000%252C%2522endDate%2522%253A1774994340000%257D%257D%257D&displayStyle=List&filter=%257B%2522idt_cp_short%2522%253A%255B%252202%2522%252C%252203%2522%252C%252204%2522%252C%252205%2522%252C%252207%2522%252C%252208%2522%252C%252209%2522%252C%252210%2522%252C%252211%2522%252C%252212%2522%252C%252213%2522%252C%252214%2522%252C%252215%2522%252C%252216%2522%252C%252217%2522%252C%252218%2522%252C%252219%2522%252C%252220%2522%252C%252221%2522%252C%252222%2522%252C%252223%2522%252C%252224%2522%252C%252225%2522%252C%252226%2522%252C%252227%2522%252C%252228%2522%252C%252229%2522%252C%252230%2522%252C%252231%2522%252C%252232%2522%252C%252233%2522%252C%252234%2522%252C%252236%2522%252C%252235%2522%252C%252237%2522%252C%252238%2522%252C%252239%2522%252C%252240%2522%252C%252241%2522%252C%252242%2522%252C%252243%2522%252C%252244%2522%252C%252245%2522%252C%252246%2522%252C%252247%2522%252C%252248%2522%252C%252249%2522%252C%252250%2522%252C%252251%2522%252C%252252%2522%252C%252253%2522%252C%252254%2522%252C%252255%2522%252C%252256%2522%252C%252257%2522%252C%252258%2522%252C%252259%2522%252C%252260%2522%252C%252261%2522%252C%252262%2522%252C%252263%2522%252C%252264%2522%252C%252265%2522%252C%252266%2522%252C%252267%2522%252C%252268%2522%252C%252269%2522%252C%252270%2522%252C%252271%2522%252C%252272%2522%252C%252273%2522%252C%252274%2522%252C%252275%2522%252C%252276%2522%252C%252277%2522%252C%252278%2522%252C%252279%2522%252C%252280%2522%252C%252281%2522%252C%252282%2522%252C%252283%2522%252C%252284%2522%252C%252285%2522%252C%252286%2522%252C%252287%2522%252C%252288%2522%252C%252289%2522%252C%252290%2522%252C%252291%2522%252C%252292%2522%252C%252293%2522%252C%252294%2522%252C%252295%2522%252C%252201%2522%252C%252206%2522%255D%252C%2522idt_pm_code_form_jur%2522%253A%255B%25225499%2522%252C%25225710%2522%252C%25225485%2522%252C%25225785%2522%252C%25225202%2522%255D%252C%2522formality.content.formeExerciceActivitePrincipale%2522%253A%255B%2522ARTISANALE_REGLEMENTEE%2522%252C%2522COMMERCIALE%2522%252C%2522LIBERALE_REGLEMENTEE%2522%255D%257D&nbResultsPerPage=20&order=asc&page=PAGE_NUM&q=&searchType=advanced&sort=relevance&type=companies"

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "data", "inpi_scrapes")
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Limites (None = pas de limite)
MAX_PAGES = None      # Nombre max de pages
MAX_COMPANIES = None  # Nombre max d'entreprises


def extract_field(text, pattern, group=1):
    """Extrait un champ avec une regex"""
    match = re.search(pattern, text, re.IGNORECASE | re.DOTALL)
    if match:
        return match.group(group).strip()
    return None


def extract_company_data(driver):
    """Extrait toutes les données d'une fiche entreprise"""
    company = {}
    
    try:
        time.sleep(2)
        text = driver.find_element(By.TAG_NAME, "body").text
        
        # ===== IDENTITÉ =====
        
        # Dénomination
        denom = extract_field(text, r'Dénomination\s*\n\s*([A-Z][A-Z0-9\s\-\'\.&]+?)(?:\n|SIREN)')
        if denom:
            company['denomination'] = denom.strip()
        
        # SIREN
        siren = extract_field(text, r'SIREN\s*(?:\(siège\))?\s*\n?\s*(\d{3}\s?\d{3}\s?\d{3})')
        if siren:
            company['siren'] = siren.replace(' ', '')
        
        # SIRET (établissement principal)
        siret = extract_field(text, r'Siret\s*\n?\s*(\d{14}|\d{3}\s?\d{3}\s?\d{3}\s?\d{5})')
        if siret:
            company['siret'] = siret.replace(' ', '')
        
        # ===== DATES =====
        
        # Date immatriculation
        date_immat = extract_field(text, r"Date d'immatriculation au RNE\s*\n?\s*(\d{2}/\d{2}/\d{4})")
        if date_immat:
            company['date_immatriculation'] = date_immat
        
        # Début d'activité
        date_debut = extract_field(text, r"Début d'activité\s*\n?\s*(\d{2}/\d{2}/\d{4})")
        if date_debut:
            company['date_debut_activite'] = date_debut
        
        # ===== FORME JURIDIQUE =====
        
        forme = extract_field(text, r'Forme juridique\s*\n?\s*([A-Za-zÀ-ÿ\s\-\(\)\']+?)(?:\n|Associé|Activité)')
        if forme:
            company['forme_juridique'] = forme.strip()
        
        # Nature activité
        nature = extract_field(text, r"Nature de l'activité principale\s*\n?\s*([A-Za-zÀ-ÿ\s]+)")
        if nature:
            company['nature_activite'] = nature.strip()
        
        # ===== CODE APE =====
        
        ape = extract_field(text, r'Code APE\s*\n?\s*(\d{4}[A-Z]\s*-\s*[^\n]+)')
        if ape:
            company['code_ape'] = ape.strip()
            # Extraire juste le code
            code_match = re.match(r'(\d{4}[A-Z])', ape)
            if code_match:
                company['code_naf'] = code_match.group(1)
        
        # ===== CAPITAL =====
        
        capital = extract_field(text, r'Capital social\s*\n?\s*([\d\s]+)\s*EUR')
        if capital:
            company['capital'] = capital.replace(' ', '')
        
        # ===== ADRESSE DU SIÈGE =====
        
        adresse = extract_field(text, r'Adresse du siège\s*\n?\s*(.+?)(?:\n\s*Données validées|\n\s*Gestion)')
        if adresse:
            adresse_clean = adresse.replace('\n', ' ').strip()
            company['adresse_siege'] = adresse_clean
            
            # Extraire code postal et ville
            cp_match = re.search(r'(\d{5})\s+([A-Za-zÀ-ÿ\s\-]+?)(?:\s+FRANCE|$)', adresse_clean)
            if cp_match:
                company['code_postal'] = cp_match.group(1)
                company['ville'] = cp_match.group(2).strip()
                company['departement'] = cp_match.group(1)[:2]
        
        # ===== DIRIGEANT (Gestion et Direction) =====
        
        # Vérifier si RGPD (opposition à la prospection)
        if "opposé à la mise à disposition" in text or "RGPD" in text or "prospection" in text.lower():
            company['dirigeant_rgpd'] = True
        
        # Chercher la section "Gestion et Direction"
        gestion_section = extract_field(text, r'Gestion et Direction\s*\n(.+?)(?:Établissements|Bénéficiaires|$)', 1)
        
        if gestion_section:
            # Nom, Prénom(s) - plusieurs patterns
            dirigeant_patterns = [
                r'Nom, Prénom\(s\)\s*\n?\s*([A-ZÀÂÄÉÈÊËÏÎÔÙÛÜŸŒÆ][A-Za-zÀ-ÿ\s\-]+)',
                r'Nom,\s*Prénom\s*\n?\s*([A-ZÀÂÄÉÈÊËÏÎÔÙÛÜŸŒÆ][A-Za-zÀ-ÿ\s\-]+)',
                r'\n([A-Z][A-Z\-]+\s+[A-ZÀ-ÿ][a-zà-ÿ]+)\s*\n\s*(?:Gérant|Président|Directeur)'
            ]
            
            for pattern in dirigeant_patterns:
                dirigeant = extract_field(gestion_section, pattern)
                if dirigeant and len(dirigeant) > 3:
                    # Filtrer les faux positifs
                    if not any(x in dirigeant.lower() for x in ['qualité', 'date', 'commune', 'naissance', 'opposé', 'rgpd']):
                        company['dirigeant'] = dirigeant.strip()
                        break
            
            # Qualité (Gérant, Président, etc.)
            qualite = extract_field(gestion_section, r'Qualité\s*\n?\s*([A-Za-zÀ-ÿ\s\-]+?)(?:\n|Date)')
            if qualite and len(qualite) < 50:
                company['fonction_dirigeant'] = qualite.strip()
            
            # Date de naissance
            date_naiss = extract_field(gestion_section, r'Date de naissance \(mm/aaaa\)\s*\n?\s*(\d{2}/\d{4})')
            if date_naiss:
                company['dirigeant_date_naissance'] = date_naiss
            
            # Commune de résidence
            commune = extract_field(gestion_section, r'Commune de résidence\s*\n?\s*([A-Za-zÀ-ÿ\s\-]+)')
            if commune and len(commune) < 50:
                company['dirigeant_commune'] = commune.strip()
        
        # ===== ÉTABLISSEMENT PRINCIPAL =====
        
        # Nom commercial
        nom_commercial = extract_field(text, r'Nom commercial\s*\n?\s*([A-Z][A-Z0-9\s\-\'\.&]+)')
        if nom_commercial:
            company['nom_commercial'] = nom_commercial.strip()
        
        # Activité principale (description)
        activite_desc = extract_field(text, r'Activité principale\s*\n?\s*([A-Za-zÀ-ÿ][^\n]+)')
        if activite_desc and len(activite_desc) > 10:
            company['activite_description'] = activite_desc[:500]
        
        # Adresse établissement (si différente du siège)
        adresse_etab = extract_field(text, r'Adresse\s*\n?\s*((?:RUE|AVENUE|BOULEVARD|CHEMIN|PLACE|IMPASSE)[^\n]+\n\d{5}[^\n]+)')
        if adresse_etab:
            company['adresse_etablissement'] = adresse_etab.replace('\n', ' ').strip()
        
        # URL de la fiche
        company['url_fiche'] = driver.current_url
        
    except Exception as e:
        print(f"⚠️ Erreur extraction: {e}")
    
    return company


def get_page_url(page_num):
    """Génère l'URL pour une page"""
    return URL_BASE.replace("page=PAGE_NUM", f"page={page_num}")


def main():
    print("=" * 70)
    print("🚀 SCRAPER INPI FINAL")
    print("=" * 70)
    
    # Setup Chrome
    print("\n🔧 Configuration Chrome...")
    options = webdriver.ChromeOptions()
    options.add_argument("--window-size=1500,900")
    options.add_argument("--disable-blink-features=AutomationControlled")
    
    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=options)
    driver.implicitly_wait(10)
    
    companies = []
    current_page = 1
    start_time = datetime.now()
    
    try:
        while True:
            # Vérifier limite pages
            if MAX_PAGES and current_page > MAX_PAGES:
                print(f"\n🛑 Limite de {MAX_PAGES} pages atteinte")
                break
            
            print(f"\n{'='*70}")
            print(f"📄 PAGE {current_page}")
            print(f"{'='*70}")
            
            # Charger la page
            url = get_page_url(current_page)
            driver.get(url)
            
            # Attendre les résultats
            try:
                WebDriverWait(driver, 15).until(
                    EC.presence_of_element_located((By.CSS_SELECTOR, ".result-list, .results-without-actions"))
                )
                time.sleep(3)
            except TimeoutException:
                print("⚠️ Timeout - fin du scraping")
                break
            
            # Récupérer les éléments cliquables
            results = driver.find_elements(By.CSS_SELECTOR, ".results-without-actions.pointer")
            
            if not results:
                results = driver.find_elements(By.CSS_SELECTOR, ".result-list .pointer, [class*='result'] .pointer")
            
            if not results:
                print("🏁 Plus de résultats - fin du scraping")
                break
            
            print(f"   📋 {len(results)} entreprises sur cette page\n")
            
            # Scraper chaque entreprise
            for i in range(len(results)):
                # Vérifier limite entreprises
                if MAX_COMPANIES and len(companies) >= MAX_COMPANIES:
                    print(f"\n🛑 Limite de {MAX_COMPANIES} entreprises atteinte")
                    break
                
                try:
                    # Re-récupérer les éléments (rafraîchis après navigation)
                    results = driver.find_elements(By.CSS_SELECTOR, ".results-without-actions.pointer")
                    if not results:
                        results = driver.find_elements(By.CSS_SELECTOR, ".result-list .pointer")
                    
                    if i >= len(results):
                        break
                    
                    element = results[i]
                    
                    # Nom pour l'affichage
                    try:
                        preview = element.text.split('\n')[0][:30]
                    except:
                        preview = f"Entreprise {i+1}"
                    
                    print(f"   [{i+1}/{len(results)}] {preview}...", end=" ", flush=True)
                    
                    # Scroller et cliquer
                    driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", element)
                    time.sleep(0.3)
                    
                    try:
                        element.click()
                    except:
                        driver.execute_script("arguments[0].click();", element)
                    
                    # Extraire les données
                    company = extract_company_data(driver)
                    company['scraped_at'] = datetime.now().isoformat()
                    
                    if company.get('siren') or company.get('denomination'):
                        companies.append(company)
                        
                        # Affichage
                        nom = company.get('denomination', 'N/A')[:20]
                        siren = company.get('siren', 'N/A')
                        dirigeant = company.get('dirigeant', '-')[:20]
                        ville = company.get('ville', '-')[:15]
                        print(f"✓ {siren} | {dirigeant} | {ville}")
                    else:
                        print("⚠️ Pas de données")
                    
                    # Retour à la liste
                    driver.back()
                    time.sleep(1.5)
                    
                    # Attendre rechargement
                    WebDriverWait(driver, 10).until(
                        EC.presence_of_element_located((By.CSS_SELECTOR, ".result-list, .results-without-actions"))
                    )
                    time.sleep(1)
                    
                except StaleElementReferenceException:
                    print("⚠️ Élément obsolète")
                    driver.get(get_page_url(current_page))
                    time.sleep(3)
                    continue
                    
                except Exception as e:
                    print(f"⚠️ {str(e)[:40]}")
                    driver.get(get_page_url(current_page))
                    time.sleep(3)
                    continue
            
            # Vérifier si on doit continuer
            if MAX_COMPANIES and len(companies) >= MAX_COMPANIES:
                break
            
            # Page suivante
            print(f"\n   ✅ Page {current_page} terminée - {len(companies)} total")
            current_page += 1
            
            # Petite pause entre les pages
            time.sleep(2)
    
    except KeyboardInterrupt:
        print("\n\n⚠️ Arrêt manuel (Ctrl+C)")
    
    except Exception as e:
        print(f"\n❌ Erreur: {e}")
        import traceback
        traceback.print_exc()
    
    finally:
        duration = datetime.now() - start_time
        
        # Sauvegarder
        if companies:
            timestamp = datetime.now().strftime("%Y-%m-%d_%H%M%S")
            
            # JSON
            json_path = os.path.join(OUTPUT_DIR, f"inpi_final_{timestamp}.json")
            with open(json_path, 'w', encoding='utf-8') as f:
                json.dump({
                    "metadata": {
                        "scraped_at": timestamp,
                        "total": len(companies),
                        "with_siren": sum(1 for c in companies if c.get('siren')),
                        "with_dirigeant": sum(1 for c in companies if c.get('dirigeant')),
                        "with_ville": sum(1 for c in companies if c.get('ville')),
                        "pages_scraped": current_page,
                        "duration_seconds": int(duration.total_seconds())
                    },
                    "companies": companies
                }, f, ensure_ascii=False, indent=2)
            
            # CSV
            csv_path = os.path.join(OUTPUT_DIR, f"inpi_final_{timestamp}.csv")
            keys = ['siren', 'siret', 'denomination', 'dirigeant', 'fonction_dirigeant', 'dirigeant_rgpd',
                    'adresse_siege', 'code_postal', 'ville', 'departement',
                    'forme_juridique', 'code_naf', 'code_ape', 'capital',
                    'date_debut_activite', 'nom_commercial', 'activite_description', 'url_fiche']
            
            with open(csv_path, 'w', newline='', encoding='utf-8') as f:
                writer = csv.DictWriter(f, fieldnames=keys, delimiter=';', extrasaction='ignore')
                writer.writeheader()
                writer.writerows(companies)
            
            # Résumé
            with_dirigeant = sum(1 for c in companies if c.get('dirigeant'))
            with_rgpd = sum(1 for c in companies if c.get('dirigeant_rgpd'))
            
            print("\n" + "=" * 70)
            print("📊 RÉSUMÉ FINAL")
            print("=" * 70)
            print(f"   📄 JSON: {json_path}")
            print(f"   📄 CSV:  {csv_path}")
            print(f"   ⏱️  Durée: {int(duration.total_seconds() // 60)}min {int(duration.total_seconds() % 60)}s")
            print(f"   📚 Pages: {current_page}")
            print(f"   🏢 Entreprises: {len(companies)}")
            print(f"   🔢 Avec SIREN: {sum(1 for c in companies if c.get('siren'))}")
            print(f"   👤 Avec dirigeant: {with_dirigeant}")
            print(f"   🔒 RGPD (pas de dirigeant): {with_rgpd}")
            print(f"   📍 Avec ville: {sum(1 for c in companies if c.get('ville'))}")
            print("=" * 70)
            
            # Exemple
            if companies:
                print("\n📋 Exemple de données extraites:")
                ex = companies[0]
                for k in ['denomination', 'siren', 'dirigeant', 'fonction_dirigeant', 'ville', 'code_postal', 'forme_juridique', 'code_naf']:
                    if ex.get(k):
                        print(f"   {k}: {ex[k]}")
        else:
            print("\n⚠️ Aucune entreprise extraite")
        
        print("\n🔒 Fermeture...")
        time.sleep(2)
        driver.quit()
        print("✅ Terminé!")


if __name__ == "__main__":
    main()
