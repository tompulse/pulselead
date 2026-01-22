#!/usr/bin/env python3
"""
🚀 SCRAPER INPI PRO - Version complète avec pagination
- Clique sur chaque entreprise pour les détails
- Change de page automatiquement jusqu'à la fin
- Récupère les dirigeants, adresses, SIREN, etc.
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
from selenium.common.exceptions import (
    TimeoutException, 
    StaleElementReferenceException,
    NoSuchElementException,
    ElementClickInterceptedException
)
from webdriver_manager.chrome import ChromeDriverManager

# =============================================================================
# CONFIGURATION
# =============================================================================

# URL INPI avec tous tes filtres
URL = "https://data.inpi.fr/search?advancedSearch=%257B%2522checkboxes%2522%253A%257B%2522status%2522%253A%257B%2522order%2522%253A0%252C%2522searchField%2522%253A%255B%2522is_rad%2522%255D%252C%2522values%2522%253A%255B%257B%2522value%2522%253A%2522false%2522%252C%2522checked%2522%253Atrue%257D%252C%257B%2522value%2522%253A%2522true%2522%252C%2522checked%2522%253Afalse%257D%255D%257D%257D%252C%2522texts%2522%253A%257B%257D%252C%2522multipleSelects%2522%253A%257B%257D%252C%2522dates%2522%253A%257B%2522start_activity_date%2522%253A%257B%2522order%2522%253A15%252C%2522searchField%2522%253A%255B%2522idt_date_debut_activ%2522%255D%252C%2522startDate%2522%253A1767222000000%252C%2522endDate%2522%253A1774994340000%257D%257D%257D&displayStyle=List&filter=%257B%2522idt_cp_short%2522%253A%255B%252202%2522%252C%252203%2522%252C%252204%2522%252C%252205%2522%252C%252207%2522%252C%252208%2522%252C%252209%2522%252C%252210%2522%252C%252211%2522%252C%252212%2522%252C%252213%2522%252C%252214%2522%252C%252215%2522%252C%252216%2522%252C%252217%2522%252C%252218%2522%252C%252219%2522%252C%252220%2522%252C%252221%2522%252C%252222%2522%252C%252223%2522%252C%252224%2522%252C%252225%2522%252C%252226%2522%252C%252227%2522%252C%252228%2522%252C%252229%2522%252C%252230%2522%252C%252231%2522%252C%252232%2522%252C%252233%2522%252C%252234%2522%252C%252236%2522%252C%252235%2522%252C%252237%2522%252C%252238%2522%252C%252239%2522%252C%252240%2522%252C%252241%2522%252C%252242%2522%252C%252243%2522%252C%252244%2522%252C%252245%2522%252C%252246%2522%252C%252247%2522%252C%252248%2522%252C%252249%2522%252C%252250%2522%252C%252251%2522%252C%252252%2522%252C%252253%2522%252C%252254%2522%252C%252255%2522%252C%252256%2522%252C%252257%2522%252C%252258%2522%252C%252259%2522%252C%252260%2522%252C%252261%2522%252C%252262%2522%252C%252263%2522%252C%252264%2522%252C%252265%2522%252C%252266%2522%252C%252267%2522%252C%252268%2522%252C%252269%2522%252C%252270%2522%252C%252271%2522%252C%252272%2522%252C%252273%2522%252C%252274%2522%252C%252275%2522%252C%252276%2522%252C%252277%2522%252C%252278%2522%252C%252279%2522%252C%252280%2522%252C%252281%2522%252C%252282%2522%252C%252283%2522%252C%252284%2522%252C%252285%2522%252C%252286%2522%252C%252287%2522%252C%252288%2522%252C%252289%2522%252C%252290%2522%252C%252291%2522%252C%252292%2522%252C%252293%2522%252C%252294%2522%252C%252295%2522%252C%252201%2522%252C%252206%2522%255D%252C%2522idt_pm_code_form_jur%2522%253A%255B%25225499%2522%252C%25225710%2522%252C%25225485%2522%252C%25225785%2522%252C%25225202%2522%255D%252C%2522formality.content.formeExerciceActivitePrincipale%2522%253A%255B%2522ARTISANALE_REGLEMENTEE%2522%252C%2522COMMERCIALE%2522%252C%2522LIBERALE_REGLEMENTEE%2522%255D%257D&nbResultsPerPage=20&order=asc&page=PAGE_NUM&q=&searchType=advanced&sort=relevance&type=companies"

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "data", "inpi_scrapes")
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Limites (mettre None pour tout scraper)
MAX_PAGES = None  # None = toutes les pages
MAX_COMPANIES = None  # None = toutes les entreprises

# Timing (en secondes)
WAIT_PAGE_LOAD = 5
WAIT_AFTER_CLICK = 3
WAIT_BETWEEN_COMPANIES = 1


class INPIScraperPro:
    def __init__(self):
        self.driver = None
        self.companies = []
        self.current_page = 1
        self.total_pages = None
        self.errors = []
        
    def setup(self):
        """Configure Chrome"""
        print("🔧 Configuration de Chrome...")
        
        options = webdriver.ChromeOptions()
        options.add_argument("--window-size=1500,900")
        options.add_argument("--disable-blink-features=AutomationControlled")
        options.add_experimental_option("excludeSwitches", ["enable-automation"])
        
        service = Service(ChromeDriverManager().install())
        self.driver = webdriver.Chrome(service=service, options=options)
        self.driver.implicitly_wait(10)
        
        print("✅ Chrome prêt!")
    
    def get_page_url(self, page_num):
        """Génère l'URL pour une page donnée"""
        return URL.replace("page=PAGE_NUM", f"page={page_num}").replace("page=1", f"page={page_num}")
    
    def wait_for_results(self):
        """Attend que les résultats soient chargés"""
        try:
            WebDriverWait(self.driver, 15).until(
                EC.presence_of_element_located((By.CSS_SELECTOR, ".result-list, .results-without-actions"))
            )
            time.sleep(WAIT_PAGE_LOAD)
            return True
        except TimeoutException:
            return False
    
    def get_total_results(self):
        """Récupère le nombre total de résultats"""
        try:
            # Chercher le texte "X résultats" ou similaire
            text = self.driver.find_element(By.TAG_NAME, "body").text
            match = re.search(r'(\d[\d\s]*)\s*(?:résultat|entreprise)', text, re.IGNORECASE)
            if match:
                total = int(match.group(1).replace(' ', ''))
                self.total_pages = (total // 20) + 1
                return total
        except:
            pass
        return None
    
    def get_clickable_results(self):
        """Récupère la liste des éléments cliquables"""
        selectors = [
            ".results-without-actions.pointer",
            ".result-list .pointer",
            "[class*='result'] .pointer",
            ".d-flex.flex-column.results-without-actions"
        ]
        
        for selector in selectors:
            elements = self.driver.find_elements(By.CSS_SELECTOR, selector)
            if elements:
                return elements
        
        return []
    
    def extract_details(self):
        """Extrait les détails de la fiche entreprise"""
        company = {}
        
        try:
            time.sleep(WAIT_AFTER_CLICK)
            page_text = self.driver.find_element(By.TAG_NAME, "body").text
            
            # ===== SIREN =====
            siren_match = re.search(r'SIREN\s*[:\s]*(\d[\d\s]{7,10}\d)', page_text)
            if siren_match:
                company['siren'] = re.sub(r'\s', '', siren_match.group(1))
            
            # ===== SIRET =====
            siret_match = re.search(r'SIRET\s*[:\s]*(\d[\d\s]{12,16}\d)', page_text)
            if siret_match:
                company['siret'] = re.sub(r'\s', '', siret_match.group(1))
            
            # ===== NOM =====
            # Essayer plusieurs patterns
            nom_patterns = [
                r'(?:Dénomination|Raison sociale)\s*[:\s]*\n?\s*([A-Z][A-Z0-9\s\-\'\.&]+)',
                r'^([A-Z][A-Z0-9\s\-\'\.&]{2,50})$'
            ]
            for pattern in nom_patterns:
                match = re.search(pattern, page_text, re.MULTILINE)
                if match and len(match.group(1).strip()) > 2:
                    company['nom'] = match.group(1).strip()
                    break
            
            # ===== DATE CREATION =====
            date_match = re.search(r'(?:Début d\'activité|Date.+création)[:\s]*(\d{2}/\d{2}/\d{4})', page_text)
            if date_match:
                company['date_creation'] = date_match.group(1)
            
            # ===== FORME JURIDIQUE =====
            forme_patterns = [
                r'(?:Forme juridique)\s*[:\s]*\n?\s*([A-Za-zÀ-ÿ\s\-]+?)(?:\n|Activité|Capital|SIREN)',
                r'(SAS|SARL|SASU|EURL|SA|SNC|SELARL|SELAS)(?:\s|$)'
            ]
            for pattern in forme_patterns:
                match = re.search(pattern, page_text)
                if match:
                    company['forme_juridique'] = match.group(1).strip()
                    break
            
            # ===== ADRESSE =====
            addr_match = re.search(r'(?:Adresse|Siège social)\s*[:\s]*\n?\s*(.+?)(?:\d{5})', page_text, re.DOTALL)
            if addr_match:
                addr = addr_match.group(1).replace('\n', ' ').strip()
                company['adresse'] = re.sub(r'\s+', ' ', addr)[:200]
            
            # ===== CODE POSTAL + VILLE =====
            cp_match = re.search(r'(\d{5})\s+([A-ZÀÂÄÉÈÊËÏÎÔÙÛÜŸŒÆ][A-ZÀÂÄÉÈÊËÏÎÔÙÛÜŸŒÆa-zàâäéèêëïîôùûüÿœæ\-\s]{2,30})', page_text)
            if cp_match:
                company['code_postal'] = cp_match.group(1)
                company['ville'] = cp_match.group(2).strip().split('\n')[0]
            
            # ===== CODE NAF =====
            naf_match = re.search(r'(?:NAF|APE)[:\s]*(\d{2}\.?\d{2}[A-Z])', page_text)
            if naf_match:
                company['code_naf'] = naf_match.group(1)
            
            # ===== CAPITAL =====
            capital_match = re.search(r'Capital[:\s]*([\d\s,\.]+)\s*(?:€|EUR|euros?)', page_text, re.IGNORECASE)
            if capital_match:
                capital = capital_match.group(1).replace(' ', '').replace(',', '.')
                company['capital'] = capital
            
            # ===== DIRIGEANT (LE PLUS IMPORTANT!) =====
            dirigeant_patterns = [
                # Prénom Nom classique
                r'(?:Dirigeant|Gérant|Président|Représentant)\s*[:\s]+([A-ZÀÂÄÉÈÊËÏÎÔÙÛÜŸŒÆ][a-zàâäéèêëïîôùûüÿœæ]+\s+[A-ZÀÂÄÉÈÊËÏÎÔÙÛÜŸŒÆ][A-Za-zàâäéèêëïîôùûüÿœæ\-]+)',
                # NOM Prénom
                r'(?:Dirigeant|Gérant|Président)\s*[:\s]+([A-Z][A-Z\-]+\s+[A-ZÀÂÄÉÈÊËÏÎÔÙÛÜŸŒÆ][a-zàâäéèêëïîôùûüÿœæ]+)',
                # Tout en majuscules
                r'(?:Dirigeant|Gérant|Président)\s*[:\s]+([A-Z][A-Z\s\-]{3,40})',
                # Après un saut de ligne
                r'(?:Dirigeant|Gérant|Président|Mandataire)\s*\n\s*([A-ZÀÂÄÉÈÊËÏÎÔÙÛÜŸŒÆ][a-zàâäéèêëïîôùûüÿœæA-Z\s\-]{3,40})',
            ]
            
            for pattern in dirigeant_patterns:
                match = re.search(pattern, page_text)
                if match:
                    dirigeant = match.group(1).strip()
                    dirigeant = re.sub(r'\s+', ' ', dirigeant)
                    # Filtrer les faux positifs
                    if (len(dirigeant) > 4 and 
                        not any(x in dirigeant.lower() for x in ['siège', 'activité', 'capital', 'société', 'établissement'])):
                        company['dirigeant'] = dirigeant
                        break
            
            # ===== FONCTION DIRIGEANT =====
            for fonction in ['Président', 'Gérant', 'Directeur général', 'PDG', 'Administrateur']:
                if fonction in page_text:
                    company['fonction_dirigeant'] = fonction
                    break
            
            # URL de la fiche
            company['url_fiche'] = self.driver.current_url
            
        except Exception as e:
            self.errors.append(str(e))
        
        return company
    
    def click_next_page(self):
        """Clique sur la page suivante"""
        try:
            # Chercher le bouton "page suivante"
            next_selectors = [
                "//a[contains(@aria-label, 'suivante') or contains(@aria-label, 'Next')]",
                "//button[contains(@aria-label, 'suivante')]",
                "//a[contains(@class, 'page-link') and contains(text(), '›')]",
                "//li[contains(@class, 'next')]/a",
                "//a[contains(@class, 'next')]",
                f"//a[contains(@href, 'page={self.current_page + 1}')]"
            ]
            
            for selector in next_selectors:
                try:
                    next_btn = self.driver.find_element(By.XPATH, selector)
                    if next_btn.is_displayed() and next_btn.is_enabled():
                        self.driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", next_btn)
                        time.sleep(0.5)
                        next_btn.click()
                        self.current_page += 1
                        return True
                except:
                    continue
            
            # Si pas de bouton, modifier l'URL directement
            self.current_page += 1
            new_url = self.get_page_url(self.current_page)
            self.driver.get(new_url)
            return True
            
        except Exception as e:
            print(f"⚠️ Erreur pagination: {e}")
            return False
    
    def has_next_page(self):
        """Vérifie s'il y a une page suivante"""
        try:
            # Vérifier si on est sur la dernière page
            page_text = self.driver.find_element(By.TAG_NAME, "body").text
            
            # Si "Aucun résultat" ou liste vide
            if "Aucun résultat" in page_text or "0 résultat" in page_text:
                return False
            
            # Vérifier les éléments de pagination
            pagination = self.driver.find_elements(By.CSS_SELECTOR, ".pagination, [class*='page']")
            if pagination:
                # Chercher si le bouton "next" est désactivé
                disabled_next = self.driver.find_elements(By.CSS_SELECTOR, ".next.disabled, .page-item.disabled:last-child")
                if disabled_next:
                    return False
            
            # Si on a défini un max de pages
            if MAX_PAGES and self.current_page >= MAX_PAGES:
                return False
            
            # Vérifier qu'il y a des résultats sur cette page
            results = self.get_clickable_results()
            if not results:
                return False
            
            return True
            
        except:
            return False
    
    def scrape_page(self):
        """Scrape une page de résultats"""
        scraped_on_page = 0
        
        # Récupérer les éléments cliquables
        results = self.get_clickable_results()
        total_on_page = len(results)
        
        print(f"\n   📋 {total_on_page} résultats sur cette page")
        
        for i in range(total_on_page):
            # Vérifier la limite
            if MAX_COMPANIES and len(self.companies) >= MAX_COMPANIES:
                print(f"\n🛑 Limite de {MAX_COMPANIES} entreprises atteinte!")
                return scraped_on_page
            
            try:
                # Re-récupérer les éléments (ils changent après navigation)
                results = self.get_clickable_results()
                
                if i >= len(results):
                    break
                
                element = results[i]
                
                # Récupérer le nom pour l'affichage
                try:
                    nom_preview = element.text.split('\n')[0][:35]
                except:
                    nom_preview = f"Entreprise {i+1}"
                
                print(f"   [{i+1}/{total_on_page}] {nom_preview}...", end=" ", flush=True)
                
                # Scroller et cliquer
                self.driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", element)
                time.sleep(0.3)
                
                try:
                    element.click()
                except ElementClickInterceptedException:
                    self.driver.execute_script("arguments[0].click();", element)
                
                # Extraire les détails
                company = self.extract_details()
                company['scraped_at'] = datetime.now().isoformat()
                
                if company.get('nom') or company.get('siren'):
                    self.companies.append(company)
                    scraped_on_page += 1
                    
                    dirigeant = company.get('dirigeant', 'N/A')[:20]
                    siren = company.get('siren', 'N/A')
                    print(f"✓ {siren} | {dirigeant}")
                else:
                    print("⚠️ Données insuffisantes")
                
                # Retourner à la liste
                self.driver.back()
                time.sleep(WAIT_BETWEEN_COMPANIES)
                self.wait_for_results()
                
            except StaleElementReferenceException:
                print("⚠️ Élément obsolète, on continue...")
                self.driver.get(self.get_page_url(self.current_page))
                time.sleep(WAIT_PAGE_LOAD)
                self.wait_for_results()
                continue
                
            except Exception as e:
                print(f"⚠️ {str(e)[:40]}")
                self.driver.get(self.get_page_url(self.current_page))
                time.sleep(WAIT_PAGE_LOAD)
                continue
        
        return scraped_on_page
    
    def run(self):
        """Lance le scraping complet"""
        print("=" * 70)
        print("🚀 SCRAPER INPI PRO - Scraping complet avec pagination")
        print("=" * 70)
        
        self.setup()
        start_time = datetime.now()
        
        try:
            # Charger la première page
            print(f"\n🌐 Chargement de la page 1...")
            self.driver.get(self.get_page_url(1))
            
            if not self.wait_for_results():
                print("❌ Impossible de charger les résultats")
                return
            
            # Récupérer le total
            total = self.get_total_results()
            if total:
                print(f"📊 Total estimé: {total} entreprises ({self.total_pages} pages)")
            
            # Boucle sur les pages
            while True:
                print(f"\n{'='*70}")
                print(f"📄 PAGE {self.current_page}" + (f"/{self.total_pages}" if self.total_pages else ""))
                print(f"{'='*70}")
                
                # Scraper cette page
                scraped = self.scrape_page()
                print(f"\n   ✅ {scraped} entreprises scrapées sur cette page")
                print(f"   📈 Total: {len(self.companies)} entreprises")
                
                # Vérifier limite
                if MAX_COMPANIES and len(self.companies) >= MAX_COMPANIES:
                    break
                
                # Page suivante ?
                if not self.has_next_page():
                    print("\n🏁 Dernière page atteinte!")
                    break
                
                print(f"\n➡️ Passage à la page {self.current_page + 1}...")
                if not self.click_next_page():
                    break
                
                time.sleep(WAIT_PAGE_LOAD)
                if not self.wait_for_results():
                    print("⚠️ Échec chargement page suivante")
                    break
            
        except KeyboardInterrupt:
            print("\n\n⚠️ Arrêt manuel (Ctrl+C)")
        
        except Exception as e:
            print(f"\n❌ Erreur: {e}")
            import traceback
            traceback.print_exc()
        
        finally:
            # Calculer la durée
            duration = datetime.now() - start_time
            
            # Sauvegarder
            self.save_results(duration)
            
            print("\n🔒 Fermeture du navigateur...")
            time.sleep(2)
            self.driver.quit()
    
    def save_results(self, duration):
        """Sauvegarde les résultats"""
        if not self.companies:
            print("\n⚠️ Aucune entreprise à sauvegarder")
            return
        
        timestamp = datetime.now().strftime("%Y-%m-%d_%H%M%S")
        output_path = os.path.join(OUTPUT_DIR, f"inpi_pro_{timestamp}.json")
        
        # Stats
        stats = {
            "total": len(self.companies),
            "with_siren": sum(1 for c in self.companies if c.get('siren')),
            "with_siret": sum(1 for c in self.companies if c.get('siret')),
            "with_dirigeant": sum(1 for c in self.companies if c.get('dirigeant')),
            "with_adresse": sum(1 for c in self.companies if c.get('code_postal')),
            "pages_scraped": self.current_page,
            "duration_seconds": int(duration.total_seconds()),
            "errors": len(self.errors)
        }
        
        # Sauvegarder JSON
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump({
                "metadata": {
                    "scraped_at": timestamp,
                    **stats
                },
                "companies": self.companies
            }, f, ensure_ascii=False, indent=2)
        
        # Sauvegarder aussi en CSV
        csv_path = output_path.replace('.json', '.csv')
        import csv
        if self.companies:
            keys = set()
            for c in self.companies:
                keys.update(c.keys())
            keys = sorted(keys)
            
            with open(csv_path, 'w', newline='', encoding='utf-8') as f:
                writer = csv.DictWriter(f, fieldnames=keys, delimiter=';')
                writer.writeheader()
                writer.writerows(self.companies)
        
        # Afficher le résumé
        print("\n" + "=" * 70)
        print("📊 RÉSUMÉ FINAL")
        print("=" * 70)
        print(f"   📄 Fichier JSON: {output_path}")
        print(f"   📄 Fichier CSV:  {csv_path}")
        print(f"   ⏱️  Durée: {int(duration.total_seconds() // 60)}min {int(duration.total_seconds() % 60)}s")
        print(f"   📚 Pages scrapées: {self.current_page}")
        print(f"   🏢 Total entreprises: {stats['total']}")
        print(f"   🔢 Avec SIREN: {stats['with_siren']}")
        print(f"   👤 Avec dirigeant: {stats['with_dirigeant']}")
        print(f"   📍 Avec adresse: {stats['with_adresse']}")
        print("=" * 70)
        
        # Exemple
        if self.companies:
            print("\n📋 Exemple de données:")
            ex = self.companies[0]
            for k in ['nom', 'siren', 'dirigeant', 'code_postal', 'ville', 'forme_juridique']:
                if ex.get(k):
                    print(f"   {k}: {ex[k]}")


if __name__ == "__main__":
    scraper = INPIScraperPro()
    scraper.run()
