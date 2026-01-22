#!/usr/bin/env python3
"""
=============================================================================
🚀 SCRAPER INPI COMPLET AVEC SELENIUM
=============================================================================
Script intelligent pour extraire les entreprises depuis data.inpi.fr
Récupère les infos détaillées incluant les dirigeants

INSTALLATION :
    pip3 install selenium webdriver-manager requests python-dotenv

USAGE :
    python3 scrape_inpi_complet.py                    # Mode interactif
    python3 scrape_inpi_complet.py --url "URL_INPI"   # Avec URL personnalisée
    python3 scrape_inpi_complet.py --headless         # Mode invisible
    python3 scrape_inpi_complet.py --limit 100        # Limite le nombre

EXPORT :
    - JSON : data/inpi_export_YYYY-MM-DD.json
    - CSV  : data/inpi_export_YYYY-MM-DD.csv
"""

import os
import sys
import json
import csv
import time
import argparse
import re
from datetime import datetime, timedelta
from urllib.parse import unquote, quote
from typing import List, Dict, Optional
import logging

# Selenium imports
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.common.exceptions import (
    TimeoutException, 
    NoSuchElementException,
    StaleElementReferenceException,
    ElementClickInterceptedException
)

try:
    from webdriver_manager.chrome import ChromeDriverManager
except ImportError:
    print("❌ webdriver-manager non installé. Exécuter: pip3 install webdriver-manager")
    sys.exit(1)

# Configuration du logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('scrape_inpi.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# =============================================================================
# CONFIGURATION
# =============================================================================

# URL par défaut (celle fournie par l'utilisateur)
DEFAULT_URL = "https://data.inpi.fr/search?advancedSearch=%257B%2522checkboxes%2522%253A%257B%2522status%2522%253A%257B%2522order%2522%253A0%252C%2522searchField%2522%253A%255B%2522is_rad%2522%255D%252C%2522values%2522%253A%255B%257B%2522value%2522%253A%2522false%2522%252C%2522checked%2522%253Atrue%257D%252C%257B%2522value%2522%253A%2522true%2522%252C%2522checked%2522%253Afalse%257D%255D%257D%257D%252C%2522texts%2522%253A%257B%257D%252C%2522multipleSelects%2522%253A%257B%257D%252C%2522dates%2522%253A%257B%2522start_activity_date%2522%253A%257B%2522order%2522%253A15%252C%2522searchField%2522%253A%255B%2522idt_date_debut_activ%2522%255D%252C%2522startDate%2522%253A1767222000000%252C%2522endDate%2522%253A1774994340000%257D%257D%257D&displayStyle=List&filter=%257B%2522idt_cp_short%2522%253A%255B%252202%2522%252C%252203%2522%252C%252204%2522%252C%252205%2522%252C%252207%2522%252C%252208%2522%252C%252209%2522%252C%252210%2522%252C%252211%2522%252C%252212%2522%252C%252213%2522%252C%252214%2522%252C%252215%2522%252C%252216%2522%252C%252217%2522%252C%252218%2522%252C%252219%2522%252C%252220%2522%252C%252221%2522%252C%252222%2522%252C%252223%2522%252C%252224%2522%252C%252225%2522%252C%252226%2522%252C%252227%2522%252C%252228%2522%252C%252229%2522%252C%252230%2522%252C%252231%2522%252C%252232%2522%252C%252233%2522%252C%252234%2522%252C%252236%2522%252C%252235%2522%252C%252237%2522%252C%252238%2522%252C%252239%2522%252C%252240%2522%252C%252241%2522%252C%252242%2522%252C%252243%2522%252C%252244%2522%252C%252245%2522%252C%252246%2522%252C%252247%2522%252C%252248%2522%252C%252249%2522%252C%252250%2522%252C%252251%2522%252C%252252%2522%252C%252253%2522%252C%252254%2522%252C%252255%2522%252C%252256%2522%252C%252257%2522%252C%252258%2522%252C%252259%2522%252C%252260%2522%252C%252261%2522%252C%252262%2522%252C%252263%2522%252C%252264%2522%252C%252265%2522%252C%252266%2522%252C%252267%2522%252C%252268%2522%252C%252269%2522%252C%252270%2522%252C%252271%2522%252C%252272%2522%252C%252273%2522%252C%252274%2522%252C%252275%2522%252C%252276%2522%252C%252277%2522%252C%252278%2522%252C%252279%2522%252C%252280%2522%252C%252281%2522%252C%252282%2522%252C%252283%2522%252C%252284%2522%252C%252285%2522%252C%252286%2522%252C%252287%2522%252C%252288%2522%252C%252289%2522%252C%252290%2522%252C%252291%2522%252C%252292%2522%252C%252293%2522%252C%252294%2522%252C%252295%2522%252C%252201%2522%252C%252206%2522%255D%252C%2522idt_pm_code_form_jur%2522%253A%255B%25225499%2522%252C%25225710%2522%252C%25225485%2522%252C%25225785%2522%252C%25225202%2522%255D%252C%2522formality.content.formeExerciceActivitePrincipale%2522%253A%255B%2522ARTISANALE_REGLEMENTEE%2522%252C%2522COMMERCIALE%2522%252C%2522LIBERALE_REGLEMENTEE%2522%255D%257D&nbResultsPerPage=20&order=asc&page=1&q=&searchType=advanced&sort=relevance&type=companies"

# Dossier de sortie
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "data", "inpi_scrapes")
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Délais (en secondes)
PAGE_LOAD_WAIT = 5
ELEMENT_WAIT = 10
BETWEEN_REQUESTS = 1.5  # Pour éviter le rate limiting
BETWEEN_PAGES = 2


class INPIScraper:
    """Scraper INPI avec Selenium"""
    
    def __init__(self, headless: bool = False, timeout: int = 30):
        self.headless = headless
        self.timeout = timeout
        self.driver = None
        self.scraped_data: List[Dict] = []
        self.errors: List[Dict] = []
        self.stats = {
            "pages_scraped": 0,
            "companies_found": 0,
            "companies_with_details": 0,
            "errors": 0,
            "start_time": None,
            "end_time": None
        }
    
    def setup_driver(self):
        """Configure et lance Chrome"""
        logger.info("🚀 Configuration de Chrome...")
        
        chrome_options = Options()
        
        if self.headless:
            chrome_options.add_argument("--headless=new")
        
        # Options pour éviter la détection
        chrome_options.add_argument("--disable-blink-features=AutomationControlled")
        chrome_options.add_argument("--disable-infobars")
        chrome_options.add_argument("--disable-extensions")
        chrome_options.add_argument("--disable-gpu")
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--window-size=1920,1080")
        chrome_options.add_argument("--user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
        
        # Préférences
        chrome_options.add_experimental_option("excludeSwitches", ["enable-automation"])
        chrome_options.add_experimental_option("useAutomationExtension", False)
        
        # Lancement
        service = Service(ChromeDriverManager().install())
        self.driver = webdriver.Chrome(service=service, options=chrome_options)
        self.driver.implicitly_wait(ELEMENT_WAIT)
        
        # Masquer webdriver
        self.driver.execute_cdp_cmd("Page.addScriptToEvaluateOnNewDocument", {
            "source": """
                Object.defineProperty(navigator, 'webdriver', {get: () => undefined});
            """
        })
        
        logger.info("✅ Chrome configuré avec succès")
    
    def wait_for_element(self, by: By, value: str, timeout: int = None) -> Optional[any]:
        """Attend qu'un élément soit présent"""
        try:
            return WebDriverWait(self.driver, timeout or self.timeout).until(
                EC.presence_of_element_located((by, value))
            )
        except TimeoutException:
            return None
    
    def wait_for_clickable(self, by: By, value: str, timeout: int = None) -> Optional[any]:
        """Attend qu'un élément soit cliquable"""
        try:
            return WebDriverWait(self.driver, timeout or self.timeout).until(
                EC.element_to_be_clickable((by, value))
            )
        except TimeoutException:
            return None
    
    def safe_click(self, element, retries: int = 3):
        """Clique sur un élément avec retry"""
        for attempt in range(retries):
            try:
                self.driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", element)
                time.sleep(0.3)
                element.click()
                return True
            except (ElementClickInterceptedException, StaleElementReferenceException) as e:
                if attempt < retries - 1:
                    time.sleep(0.5)
                    continue
                logger.warning(f"⚠️  Click échoué après {retries} tentatives: {e}")
                return False
        return False
    
    def get_total_results(self) -> int:
        """Récupère le nombre total de résultats"""
        try:
            # Chercher le compteur de résultats
            selectors = [
                "//span[contains(@class, 'results-count')]",
                "//div[contains(@class, 'total-results')]",
                "//*[contains(text(), 'résultat')]",
                "//span[contains(text(), 'entreprise')]"
            ]
            
            for selector in selectors:
                try:
                    element = self.driver.find_element(By.XPATH, selector)
                    text = element.text
                    # Extraire le nombre
                    numbers = re.findall(r'[\d\s]+', text)
                    if numbers:
                        return int(numbers[0].replace(' ', ''))
                except:
                    continue
            
            return 0
        except Exception as e:
            logger.warning(f"⚠️  Impossible de récupérer le total: {e}")
            return 0
    
    def get_companies_on_page(self) -> List[Dict]:
        """Récupère les entreprises de la page courante"""
        companies = []
        
        try:
            # Attendre que la liste se charge
            time.sleep(PAGE_LOAD_WAIT)
            
            # Sélecteurs possibles pour les cartes d'entreprises
            card_selectors = [
                "//div[contains(@class, 'company-card')]",
                "//div[contains(@class, 'result-item')]",
                "//article[contains(@class, 'search-result')]",
                "//div[contains(@class, 'list-item')]",
                "//a[contains(@href, '/entreprise/')]",
                "//div[@data-testid='company-result']"
            ]
            
            cards = []
            for selector in card_selectors:
                try:
                    cards = self.driver.find_elements(By.XPATH, selector)
                    if cards:
                        logger.info(f"   📦 {len(cards)} éléments trouvés avec: {selector}")
                        break
                except:
                    continue
            
            if not cards:
                # Fallback : chercher tous les liens vers des entreprises
                links = self.driver.find_elements(By.XPATH, "//a[contains(@href, '/entreprise/')]")
                if links:
                    logger.info(f"   🔗 {len(links)} liens entreprises trouvés")
                    for link in links:
                        try:
                            href = link.get_attribute('href')
                            text = link.text.strip()
                            if href and '/entreprise/' in href:
                                siren = href.split('/entreprise/')[-1].split('?')[0].split('/')[0]
                                companies.append({
                                    "siren": siren,
                                    "nom": text or "Nom inconnu",
                                    "url_detail": href,
                                    "scraped_at": datetime.now().isoformat()
                                })
                        except:
                            continue
            else:
                # Parser les cartes
                for card in cards:
                    try:
                        company = self.parse_company_card(card)
                        if company:
                            companies.append(company)
                    except Exception as e:
                        logger.warning(f"   ⚠️  Erreur parsing carte: {e}")
                        continue
            
            logger.info(f"   ✅ {len(companies)} entreprises extraites de cette page")
            
        except Exception as e:
            logger.error(f"❌ Erreur récupération entreprises: {e}")
            self.stats["errors"] += 1
        
        return companies
    
    def parse_company_card(self, card) -> Optional[Dict]:
        """Parse une carte d'entreprise"""
        try:
            company = {
                "scraped_at": datetime.now().isoformat()
            }
            
            # Chercher le lien vers les détails
            try:
                link = card.find_element(By.XPATH, ".//a[contains(@href, '/entreprise/')]")
                company["url_detail"] = link.get_attribute('href')
                company["siren"] = company["url_detail"].split('/entreprise/')[-1].split('?')[0].split('/')[0]
            except:
                pass
            
            # Nom de l'entreprise
            name_selectors = [
                ".//h2", ".//h3", ".//h4",
                ".//*[contains(@class, 'name')]",
                ".//*[contains(@class, 'title')]",
                ".//strong", ".//b"
            ]
            for sel in name_selectors:
                try:
                    name_el = card.find_element(By.XPATH, sel)
                    if name_el.text.strip():
                        company["nom"] = name_el.text.strip()
                        break
                except:
                    continue
            
            # Adresse
            try:
                addr_el = card.find_element(By.XPATH, ".//*[contains(@class, 'address') or contains(@class, 'location')]")
                company["adresse"] = addr_el.text.strip()
            except:
                pass
            
            # Forme juridique
            try:
                form_el = card.find_element(By.XPATH, ".//*[contains(text(), 'SAS') or contains(text(), 'SARL') or contains(text(), 'SASU') or contains(text(), 'SNC')]")
                company["forme_juridique"] = form_el.text.strip()
            except:
                pass
            
            # Date
            try:
                date_el = card.find_element(By.XPATH, ".//*[contains(@class, 'date')]")
                company["date_creation"] = date_el.text.strip()
            except:
                pass
            
            if company.get("siren") or company.get("nom"):
                return company
            
            return None
            
        except Exception as e:
            logger.warning(f"⚠️  Erreur parsing: {e}")
            return None
    
    def get_company_details(self, company: Dict) -> Dict:
        """Récupère les détails d'une entreprise (dirigeant, etc.)"""
        if not company.get("url_detail"):
            return company
        
        try:
            logger.info(f"      🔍 Détails pour {company.get('nom', company.get('siren', '?'))[:30]}...")
            
            # Ouvrir dans un nouvel onglet
            original_window = self.driver.current_window_handle
            self.driver.execute_script(f"window.open('{company['url_detail']}', '_blank');")
            
            # Basculer vers le nouvel onglet
            self.driver.switch_to.window(self.driver.window_handles[-1])
            time.sleep(BETWEEN_REQUESTS)
            
            # Attendre le chargement
            self.wait_for_element(By.TAG_NAME, "body", timeout=10)
            time.sleep(2)
            
            # === EXTRACTION DES DONNÉES ===
            
            # Dirigeant / Représentants
            dirigeant_selectors = [
                "//h3[contains(text(), 'Représentant')]/following-sibling::*",
                "//div[contains(@class, 'representant')]",
                "//section[contains(@class, 'dirigeant')]",
                "//*[contains(text(), 'Dirigeant')]/following-sibling::*",
                "//*[contains(text(), 'Gérant')]/following-sibling::*",
                "//*[contains(text(), 'Président')]/following-sibling::*",
                "//div[contains(@class, 'managers')]//li",
                "//ul[contains(@class, 'representants')]//li"
            ]
            
            for sel in dirigeant_selectors:
                try:
                    elements = self.driver.find_elements(By.XPATH, sel)
                    for el in elements:
                        text = el.text.strip()
                        if text and len(text) > 3:
                            # Nettoyer le nom (enlever titres comme "M." "Mme" etc.)
                            dirigeant = re.sub(r'^(M\.|Mme|Mr|Mrs|Monsieur|Madame)\s*', '', text)
                            # Prendre la première ligne si plusieurs
                            dirigeant = dirigeant.split('\n')[0].strip()
                            if dirigeant and not any(x in dirigeant.lower() for x in ['représentant', 'dirigeant', 'gérant']):
                                company["dirigeant"] = dirigeant
                                break
                    if company.get("dirigeant"):
                        break
                except:
                    continue
            
            # Fonction du dirigeant
            fonction_selectors = [
                "//*[contains(text(), 'Président')]",
                "//*[contains(text(), 'Gérant')]",
                "//*[contains(text(), 'Directeur')]",
                "//*[contains(text(), 'PDG')]"
            ]
            for sel in fonction_selectors:
                try:
                    el = self.driver.find_element(By.XPATH, sel)
                    text = el.text.strip()
                    for fonction in ["Président", "Gérant", "Directeur Général", "PDG", "Directeur"]:
                        if fonction.lower() in text.lower():
                            company["fonction_dirigeant"] = fonction
                            break
                    if company.get("fonction_dirigeant"):
                        break
                except:
                    continue
            
            # SIREN/SIRET
            try:
                siret_el = self.driver.find_element(By.XPATH, "//*[contains(text(), 'SIRET') or contains(text(), 'siret')]")
                text = siret_el.text
                siret_match = re.search(r'\d{14}', text)
                if siret_match:
                    company["siret"] = siret_match.group()
            except:
                pass
            
            # Adresse complète
            addr_selectors = [
                "//address",
                "//*[contains(@class, 'address')]",
                "//div[contains(@class, 'siege')]",
                "//*[contains(text(), 'Siège')]/following-sibling::*"
            ]
            for sel in addr_selectors:
                try:
                    el = self.driver.find_element(By.XPATH, sel)
                    addr = el.text.strip()
                    if addr and len(addr) > 10:
                        company["adresse_complete"] = addr
                        
                        # Extraire code postal et ville
                        cp_match = re.search(r'(\d{5})\s+([A-ZÀÂÄÉÈÊËÏÎÔÙÛÜŸŒÆ\-\s]+)', addr)
                        if cp_match:
                            company["code_postal"] = cp_match.group(1)
                            company["ville"] = cp_match.group(2).strip()
                        break
                except:
                    continue
            
            # Code NAF
            try:
                naf_el = self.driver.find_element(By.XPATH, "//*[contains(text(), 'NAF') or contains(text(), 'APE')]")
                text = naf_el.text
                naf_match = re.search(r'\d{2}\.\d{2}[A-Z]', text)
                if naf_match:
                    company["code_naf"] = naf_match.group()
            except:
                pass
            
            # Activité
            try:
                activite_el = self.driver.find_element(By.XPATH, "//*[contains(text(), 'Activité')]/following-sibling::*")
                company["activite"] = activite_el.text.strip()[:500]
            except:
                pass
            
            # Capital
            try:
                capital_el = self.driver.find_element(By.XPATH, "//*[contains(text(), 'Capital')]")
                text = capital_el.text
                capital_match = re.search(r'([\d\s,\.]+)\s*€', text)
                if capital_match:
                    company["capital"] = capital_match.group(1).replace(' ', '').replace(',', '.')
            except:
                pass
            
            # Date de création
            try:
                date_el = self.driver.find_element(By.XPATH, "//*[contains(text(), 'Immatriculation') or contains(text(), 'Création') or contains(text(), 'début')]")
                text = date_el.text
                date_match = re.search(r'(\d{2}/\d{2}/\d{4})', text)
                if date_match:
                    company["date_creation"] = date_match.group(1)
            except:
                pass
            
            self.stats["companies_with_details"] += 1
            
        except Exception as e:
            logger.warning(f"      ⚠️  Erreur détails: {e}")
            self.errors.append({
                "siren": company.get("siren"),
                "error": str(e),
                "timestamp": datetime.now().isoformat()
            })
        
        finally:
            # Fermer l'onglet et revenir
            try:
                if len(self.driver.window_handles) > 1:
                    self.driver.close()
                    self.driver.switch_to.window(original_window)
            except:
                pass
        
        return company
    
    def go_to_next_page(self) -> bool:
        """Va à la page suivante"""
        try:
            # Chercher le bouton "page suivante"
            next_selectors = [
                "//button[contains(@aria-label, 'Next') or contains(@aria-label, 'Suivant')]",
                "//a[contains(@aria-label, 'Next') or contains(@aria-label, 'Suivant')]",
                "//button[contains(text(), 'Suivant')]",
                "//a[contains(text(), 'Suivant')]",
                "//button[contains(@class, 'next')]",
                "//a[contains(@class, 'next')]",
                "//*[@rel='next']",
                "//li[contains(@class, 'next')]/a",
                "//button[contains(@class, 'pagination')]//span[contains(text(), '>')]/.."
            ]
            
            for selector in next_selectors:
                try:
                    next_btn = self.driver.find_element(By.XPATH, selector)
                    if next_btn.is_enabled() and next_btn.is_displayed():
                        if self.safe_click(next_btn):
                            time.sleep(BETWEEN_PAGES)
                            return True
                except:
                    continue
            
            # Sinon, essayer de modifier l'URL avec page=N+1
            current_url = self.driver.current_url
            if 'page=' in current_url:
                current_page = int(re.search(r'page=(\d+)', current_url).group(1))
                new_url = re.sub(r'page=\d+', f'page={current_page + 1}', current_url)
                self.driver.get(new_url)
                time.sleep(BETWEEN_PAGES)
                return True
            
            return False
            
        except Exception as e:
            logger.warning(f"⚠️  Erreur navigation: {e}")
            return False
    
    def scrape(self, url: str, limit: int = None, get_details: bool = True):
        """Lance le scraping"""
        self.stats["start_time"] = datetime.now()
        
        try:
            self.setup_driver()
            
            logger.info(f"🌐 Navigation vers l'URL...")
            self.driver.get(url)
            time.sleep(PAGE_LOAD_WAIT)
            
            # Récupérer le total
            total = self.get_total_results()
            if total:
                logger.info(f"📊 Total estimé: {total} entreprises")
            
            page = 1
            total_scraped = 0
            
            while True:
                logger.info(f"\n📄 Page {page}...")
                
                # Récupérer les entreprises de cette page
                companies = self.get_companies_on_page()
                
                if not companies:
                    logger.info("   ⚠️  Aucune entreprise sur cette page, fin du scraping")
                    break
                
                # Récupérer les détails si demandé
                for i, company in enumerate(companies):
                    if limit and total_scraped >= limit:
                        logger.info(f"🛑 Limite atteinte ({limit})")
                        break
                    
                    if get_details:
                        company = self.get_company_details(company)
                    
                    self.scraped_data.append(company)
                    total_scraped += 1
                    self.stats["companies_found"] = total_scraped
                    
                    # Afficher la progression
                    if total_scraped % 10 == 0:
                        logger.info(f"   📈 Progression: {total_scraped} entreprises scraped")
                    
                    time.sleep(BETWEEN_REQUESTS / 2)
                
                if limit and total_scraped >= limit:
                    break
                
                self.stats["pages_scraped"] = page
                
                # Page suivante
                if not self.go_to_next_page():
                    logger.info("   ℹ️  Plus de pages disponibles")
                    break
                
                page += 1
                
                # Pause entre les pages
                time.sleep(BETWEEN_PAGES)
            
            self.stats["end_time"] = datetime.now()
            
        except KeyboardInterrupt:
            logger.info("\n⚠️  Arrêt manuel (Ctrl+C)")
        
        except Exception as e:
            logger.error(f"❌ Erreur fatale: {e}")
            self.stats["errors"] += 1
        
        finally:
            if self.driver:
                self.driver.quit()
            
            # Sauvegarder les données
            self.save_results()
    
    def save_results(self):
        """Sauvegarde les résultats"""
        if not self.scraped_data:
            logger.warning("⚠️  Aucune donnée à sauvegarder")
            return
        
        timestamp = datetime.now().strftime("%Y-%m-%d_%H%M%S")
        
        # JSON
        json_path = os.path.join(OUTPUT_DIR, f"inpi_export_{timestamp}.json")
        with open(json_path, 'w', encoding='utf-8') as f:
            json.dump({
                "metadata": {
                    "scraped_at": timestamp,
                    "total_companies": len(self.scraped_data),
                    "stats": {
                        **self.stats,
                        "start_time": self.stats["start_time"].isoformat() if self.stats["start_time"] else None,
                        "end_time": self.stats["end_time"].isoformat() if self.stats["end_time"] else None,
                        "duration_seconds": (self.stats["end_time"] - self.stats["start_time"]).total_seconds() if self.stats["start_time"] and self.stats["end_time"] else None
                    }
                },
                "companies": self.scraped_data,
                "errors": self.errors
            }, f, ensure_ascii=False, indent=2)
        logger.info(f"📄 JSON sauvegardé: {json_path}")
        
        # CSV
        csv_path = os.path.join(OUTPUT_DIR, f"inpi_export_{timestamp}.csv")
        if self.scraped_data:
            # Collecter toutes les clés
            all_keys = set()
            for company in self.scraped_data:
                all_keys.update(company.keys())
            
            # Ordre préféré des colonnes
            preferred_order = ['siren', 'siret', 'nom', 'dirigeant', 'fonction_dirigeant', 
                            'adresse_complete', 'code_postal', 'ville', 'code_naf', 
                            'activite', 'forme_juridique', 'capital', 'date_creation']
            fieldnames = [k for k in preferred_order if k in all_keys] + \
                        [k for k in sorted(all_keys) if k not in preferred_order]
            
            with open(csv_path, 'w', newline='', encoding='utf-8') as f:
                writer = csv.DictWriter(f, fieldnames=fieldnames, delimiter=';')
                writer.writeheader()
                writer.writerows(self.scraped_data)
            logger.info(f"📊 CSV sauvegardé: {csv_path}")
        
        # Statistiques finales
        logger.info("\n" + "=" * 60)
        logger.info("📈 STATISTIQUES FINALES")
        logger.info("=" * 60)
        logger.info(f"   Pages scrapées     : {self.stats['pages_scraped']}")
        logger.info(f"   Entreprises        : {self.stats['companies_found']}")
        logger.info(f"   Avec détails       : {self.stats['companies_with_details']}")
        logger.info(f"   Avec dirigeant     : {sum(1 for c in self.scraped_data if c.get('dirigeant'))}")
        logger.info(f"   Erreurs            : {self.stats['errors']}")
        if self.stats["start_time"] and self.stats["end_time"]:
            duration = (self.stats["end_time"] - self.stats["start_time"]).total_seconds()
            logger.info(f"   Durée              : {int(duration // 60)}m {int(duration % 60)}s")
        logger.info("=" * 60)
        
        return json_path, csv_path


def main():
    parser = argparse.ArgumentParser(description="Scraper INPI avec Selenium")
    parser.add_argument("--url", type=str, default=DEFAULT_URL, help="URL INPI à scraper")
    parser.add_argument("--headless", action="store_true", help="Mode sans interface graphique")
    parser.add_argument("--limit", type=int, help="Nombre max d'entreprises à scraper")
    parser.add_argument("--no-details", action="store_true", help="Ne pas récupérer les détails (plus rapide)")
    parser.add_argument("--timeout", type=int, default=30, help="Timeout en secondes")
    
    args = parser.parse_args()
    
    print("=" * 60)
    print("🚀 SCRAPER INPI COMPLET")
    print("=" * 60)
    print(f"📁 Output: {OUTPUT_DIR}")
    print(f"🔧 Headless: {args.headless}")
    print(f"📊 Limite: {args.limit or 'Aucune'}")
    print(f"🔍 Détails: {'Non' if args.no_details else 'Oui'}")
    print("=" * 60)
    
    scraper = INPIScraper(headless=args.headless, timeout=args.timeout)
    scraper.scrape(
        url=args.url,
        limit=args.limit,
        get_details=not args.no_details
    )


if __name__ == "__main__":
    main()
