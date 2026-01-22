#!/usr/bin/env python3
"""
🧪 TEST : Ratio dirigeants visibles vs RGPD
Compte sur 20 entreprises combien ont un nom de dirigeant
"""

import time
import os
import re
from datetime import datetime
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.service import Service
from selenium.common.exceptions import TimeoutException, StaleElementReferenceException
from webdriver_manager.chrome import ChromeDriverManager

URL = "https://data.inpi.fr/search?advancedSearch=%257B%2522checkboxes%2522%253A%257B%2522status%2522%253A%257B%2522order%2522%253A0%252C%2522searchField%2522%253A%255B%2522is_rad%2522%255D%252C%2522values%2522%253A%255B%257B%2522value%2522%253A%2522false%2522%252C%2522checked%2522%253Atrue%257D%252C%257B%2522value%2522%253A%2522true%2522%252C%2522checked%2522%253Afalse%257D%255D%257D%257D%252C%2522texts%2522%253A%257B%257D%252C%2522multipleSelects%2522%253A%257B%257D%252C%2522dates%2522%253A%257B%2522start_activity_date%2522%253A%257B%2522order%2522%253A15%252C%2522searchField%2522%253A%255B%2522idt_date_debut_activ%2522%255D%252C%2522startDate%2522%253A1767222000000%252C%2522endDate%2522%253A1774994340000%257D%257D%257D&displayStyle=List&filter=%257B%2522idt_cp_short%2522%253A%255B%252202%2522%252C%252203%2522%252C%252204%2522%252C%252205%2522%252C%252207%2522%252C%252208%2522%252C%252209%2522%252C%252210%2522%252C%252211%2522%252C%252212%2522%252C%252213%2522%252C%252214%2522%252C%252215%2522%252C%252216%2522%252C%252217%2522%252C%252218%2522%252C%252219%2522%252C%252220%2522%252C%252221%2522%252C%252222%2522%252C%252223%2522%252C%252224%2522%252C%252225%2522%252C%252226%2522%252C%252227%2522%252C%252228%2522%252C%252229%2522%252C%252230%2522%252C%252231%2522%252C%252232%2522%252C%252233%2522%252C%252234%2522%252C%252236%2522%252C%252235%2522%252C%252237%2522%252C%252238%2522%252C%252239%2522%252C%252240%2522%252C%252241%2522%252C%252242%2522%252C%252243%2522%252C%252244%2522%252C%252245%2522%252C%252246%2522%252C%252247%2522%252C%252248%2522%252C%252249%2522%252C%252250%2522%252C%252251%2522%252C%252252%2522%252C%252253%2522%252C%252254%2522%252C%252255%2522%252C%252256%2522%252C%252257%2522%252C%252258%2522%252C%252259%2522%252C%252260%2522%252C%252261%2522%252C%252262%2522%252C%252263%2522%252C%252264%2522%252C%252265%2522%252C%252266%2522%252C%252267%2522%252C%252268%2522%252C%252269%2522%252C%252270%2522%252C%252271%2522%252C%252272%2522%252C%252273%2522%252C%252274%2522%252C%252275%2522%252C%252276%2522%252C%252277%2522%252C%252278%2522%252C%252279%2522%252C%252280%2522%252C%252281%2522%252C%252282%2522%252C%252283%2522%252C%252284%2522%252C%252285%2522%252C%252286%2522%252C%252287%2522%252C%252288%2522%252C%252289%2522%252C%252290%2522%252C%252291%2522%252C%252292%2522%252C%252293%2522%252C%252294%2522%252C%252295%2522%252C%252201%2522%252C%252206%2522%255D%252C%2522idt_pm_code_form_jur%2522%253A%255B%25225499%2522%252C%25225710%2522%252C%25225485%2522%252C%25225785%2522%252C%25225202%2522%255D%252C%2522formality.content.formeExerciceActivitePrincipale%2522%253A%255B%2522ARTISANALE_REGLEMENTEE%2522%252C%2522COMMERCIALE%2522%252C%2522LIBERALE_REGLEMENTEE%2522%255D%257D&nbResultsPerPage=20&order=asc&page=1&q=&searchType=advanced&sort=relevance&type=companies"


def main():
    print("=" * 70)
    print("🧪 TEST RATIO DIRIGEANTS - 20 entreprises")
    print("=" * 70)
    
    options = webdriver.ChromeOptions()
    options.add_argument("--window-size=1500,900")
    options.add_argument("--disable-blink-features=AutomationControlled")
    
    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=options)
    driver.implicitly_wait(10)
    
    results = []
    
    try:
        print("\n🌐 Chargement de la page...")
        driver.get(URL)
        
        WebDriverWait(driver, 15).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, ".result-list, .results-without-actions"))
        )
        time.sleep(5)
        
        print("✅ Page chargée\n")
        print("-" * 70)
        
        for i in range(20):
            try:
                # Récupérer les éléments
                elements = driver.find_elements(By.CSS_SELECTOR, ".results-without-actions.pointer")
                if i >= len(elements):
                    break
                
                # Cliquer
                element = elements[i]
                driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", element)
                time.sleep(0.3)
                element.click()
                time.sleep(3)
                
                # Analyser la page
                text = driver.find_element(By.TAG_NAME, "body").text
                
                # Infos de base
                denom_match = re.search(r'Dénomination\s*\n\s*([A-Z][A-Z0-9\s\-\'\.&]+)', text)
                denomination = denom_match.group(1).strip()[:40] if denom_match else "?"
                
                # Vérifier RGPD
                has_rgpd = "opposé à la mise à disposition" in text or "fins de prospection" in text
                
                # Chercher le dirigeant
                dirigeant = None
                fonction = None
                
                # Section Gestion et Direction
                gestion_match = re.search(r'Gestion et Direction\s*\n(.+?)(?:Établissements|Bénéficiaires|$)', text, re.DOTALL)
                
                if gestion_match:
                    section = gestion_match.group(1)
                    
                    # Nom du dirigeant
                    nom_patterns = [
                        r'Nom, Prénom\(s\)\s*\n\s*([A-ZÀÂÄÉÈÊËÏÎÔÙÛÜŸŒÆ][A-Za-zÀ-ÿ\s\-]+)',
                        r'\n([A-Z][A-Z\-]+\s+[A-ZÀÂÄÉÈÊËÏÎÔÙÛÜŸŒÆ][a-zà-ÿ]+)\s*\n',
                    ]
                    
                    for pattern in nom_patterns:
                        match = re.search(pattern, section)
                        if match:
                            nom = match.group(1).strip()
                            # Filtrer faux positifs
                            if (len(nom) > 3 and 
                                not any(x in nom.lower() for x in ['qualité', 'date', 'commune', 'naissance', 'opposé', 'rgpd', 'gérant', 'président'])):
                                dirigeant = nom
                                break
                    
                    # Fonction
                    for f in ['Gérant', 'Président', 'Directeur général', 'Administrateur']:
                        if f in section:
                            fonction = f
                            break
                
                # Résultat
                result = {
                    'num': i + 1,
                    'denomination': denomination,
                    'dirigeant': dirigeant,
                    'fonction': fonction,
                    'rgpd': has_rgpd
                }
                results.append(result)
                
                # Affichage
                status = ""
                if dirigeant:
                    status = f"✅ {dirigeant[:25]} ({fonction or '?'})"
                elif has_rgpd:
                    status = "🔒 RGPD - Données protégées"
                else:
                    status = "❓ Pas de dirigeant trouvé"
                
                print(f"[{i+1:2}/20] {denomination[:30]:30} → {status}")
                
                # Retour
                driver.back()
                time.sleep(2)
                WebDriverWait(driver, 10).until(
                    EC.presence_of_element_located((By.CSS_SELECTOR, ".result-list"))
                )
                
            except StaleElementReferenceException:
                driver.get(URL)
                time.sleep(3)
                continue
            except Exception as e:
                print(f"[{i+1:2}/20] ⚠️ Erreur: {str(e)[:40]}")
                driver.get(URL)
                time.sleep(3)
                continue
        
        # Stats finales
        total = len(results)
        with_dirigeant = sum(1 for r in results if r['dirigeant'])
        with_rgpd = sum(1 for r in results if r['rgpd'])
        without_both = sum(1 for r in results if not r['dirigeant'] and not r['rgpd'])
        
        print("\n" + "=" * 70)
        print("📊 RÉSULTATS DU TEST")
        print("=" * 70)
        print(f"\n   Total analysé:           {total}")
        print(f"   ✅ Avec nom dirigeant:    {with_dirigeant} ({with_dirigeant*100//total}%)")
        print(f"   🔒 RGPD (protégé):        {with_rgpd} ({with_rgpd*100//total}%)")
        print(f"   ❓ Ni l'un ni l'autre:    {without_both} ({without_both*100//total}%)")
        print()
        print("=" * 70)
        
        # Liste des dirigeants trouvés
        if with_dirigeant > 0:
            print("\n👤 Dirigeants trouvés:")
            for r in results:
                if r['dirigeant']:
                    print(f"   • {r['dirigeant']} ({r['fonction'] or '?'}) - {r['denomination'][:25]}")
        
        print("\n" + "=" * 70)
        
    except Exception as e:
        print(f"❌ Erreur: {e}")
        import traceback
        traceback.print_exc()
    
    finally:
        print("\n🔒 Fermeture...")
        time.sleep(2)
        driver.quit()
        print("✅ Terminé!")


if __name__ == "__main__":
    main()
