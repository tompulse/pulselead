#!/usr/bin/env python3
"""
Script DEBUG pour analyser la structure du site INPI
"""

import time
import os
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager

# URL INPI
URL = "https://data.inpi.fr/search?advancedSearch=%257B%2522checkboxes%2522%253A%257B%2522status%2522%253A%257B%2522order%2522%253A0%252C%2522searchField%2522%253A%255B%2522is_rad%2522%255D%252C%2522values%2522%253A%255B%257B%2522value%2522%253A%2522false%2522%252C%2522checked%2522%253Atrue%257D%252C%257B%2522value%2522%253A%2522true%2522%252C%2522checked%2522%253Afalse%257D%255D%257D%257D%252C%2522texts%2522%253A%257B%257D%252C%2522multipleSelects%2522%253A%257B%257D%252C%2522dates%2522%253A%257B%2522start_activity_date%2522%253A%257B%2522order%2522%253A15%252C%2522searchField%2522%253A%255B%2522idt_date_debut_activ%2522%255D%252C%2522startDate%2522%253A1767222000000%252C%2522endDate%2522%253A1774994340000%257D%257D%257D&displayStyle=List&filter=%257B%2522idt_cp_short%2522%253A%255B%252202%2522%252C%252203%2522%252C%252204%2522%252C%252205%2522%252C%252207%2522%252C%252208%2522%252C%252209%2522%252C%252210%2522%252C%252211%2522%252C%252212%2522%252C%252213%2522%252C%252214%2522%252C%252215%2522%252C%252216%2522%252C%252217%2522%252C%252218%2522%252C%252219%2522%252C%252220%2522%252C%252221%2522%252C%252222%2522%252C%252223%2522%252C%252224%2522%252C%252225%2522%252C%252226%2522%252C%252227%2522%252C%252228%2522%252C%252229%2522%252C%252230%2522%252C%252231%2522%252C%252232%2522%252C%252233%2522%252C%252234%2522%252C%252236%2522%252C%252235%2522%252C%252237%2522%252C%252238%2522%252C%252239%2522%252C%252240%2522%252C%252241%2522%252C%252242%2522%252C%252243%2522%252C%252244%2522%252C%252245%2522%252C%252246%2522%252C%252247%2522%252C%252248%2522%252C%252249%2522%252C%252250%2522%252C%252251%2522%252C%252252%2522%252C%252253%2522%252C%252254%2522%252C%252255%2522%252C%252256%2522%252C%252257%2522%252C%252258%2522%252C%252259%2522%252C%252260%2522%252C%252261%2522%252C%252262%2522%252C%252263%2522%252C%252264%2522%252C%252265%2522%252C%252266%2522%252C%252267%2522%252C%252268%2522%252C%252269%2522%252C%252270%2522%252C%252271%2522%252C%252272%2522%252C%252273%2522%252C%252274%2522%252C%252275%2522%252C%252276%2522%252C%252277%2522%252C%252278%2522%252C%252279%2522%252C%252280%2522%252C%252281%2522%252C%252282%2522%252C%252283%2522%252C%252284%2522%252C%252285%2522%252C%252286%2522%252C%252287%2522%252C%252288%2522%252C%252289%2522%252C%252290%2522%252C%252291%2522%252C%252292%2522%252C%252293%2522%252C%252294%2522%252C%252295%2522%252C%252201%2522%252C%252206%2522%255D%252C%2522idt_pm_code_form_jur%2522%253A%255B%25225499%2522%252C%25225710%2522%252C%25225485%2522%252C%25225785%2522%252C%25225202%2522%255D%252C%2522formality.content.formeExerciceActivitePrincipale%2522%253A%255B%2522ARTISANALE_REGLEMENTEE%2522%252C%2522COMMERCIALE%2522%252C%2522LIBERALE_REGLEMENTEE%2522%255D%257D&nbResultsPerPage=20&order=asc&page=1&q=&searchType=advanced&sort=relevance&type=companies"

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "data", "inpi_scrapes")
os.makedirs(OUTPUT_DIR, exist_ok=True)

def main():
    print("=" * 60)
    print("🔍 DEBUG INPI - Analyse de la page")
    print("=" * 60)
    
    options = webdriver.ChromeOptions()
    options.add_argument("--window-size=1400,900")
    
    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=options)
    
    try:
        print("\n🌐 Chargement de la page...")
        driver.get(URL)
        
        print("⏳ Attente 15 secondes pour le chargement complet...")
        time.sleep(15)
        
        print(f"\n📄 Titre: {driver.title}")
        print(f"📍 URL: {driver.current_url[:100]}...")
        
        # Screenshot
        screenshot_path = os.path.join(OUTPUT_DIR, "debug_screenshot.png")
        driver.save_screenshot(screenshot_path)
        print(f"\n📸 Screenshot sauvegardé: {screenshot_path}")
        
        # Sauvegarder HTML
        html_path = os.path.join(OUTPUT_DIR, "debug_page.html")
        with open(html_path, 'w', encoding='utf-8') as f:
            f.write(driver.page_source)
        print(f"📄 HTML sauvegardé: {html_path}")
        
        # Analyser la structure
        print("\n" + "=" * 60)
        print("🔎 ANALYSE DE LA STRUCTURE")
        print("=" * 60)
        
        # Tous les liens
        all_links = driver.find_elements(By.TAG_NAME, "a")
        print(f"\n📎 Total liens <a>: {len(all_links)}")
        
        # Liens intéressants
        interesting_links = []
        for link in all_links:
            href = link.get_attribute('href') or ''
            text = link.text.strip()[:50]
            if any(x in href.lower() for x in ['entreprise', 'company', 'siren', 'siret']):
                interesting_links.append((href, text))
        
        print(f"   Liens 'entreprise/company': {len(interesting_links)}")
        for href, text in interesting_links[:5]:
            print(f"      - {text}: {href[:80]}")
        
        # Chercher des patterns de classe CSS
        print("\n🎨 Classes CSS intéressantes:")
        
        patterns = ['result', 'item', 'card', 'list', 'company', 'entreprise', 'row', 'entry']
        for pattern in patterns:
            elements = driver.find_elements(By.XPATH, f"//*[contains(@class, '{pattern}')]")
            if elements:
                print(f"   .{pattern}: {len(elements)} éléments")
                # Afficher le premier
                if elements:
                    first = elements[0]
                    classes = first.get_attribute('class')
                    print(f"      Ex: <{first.tag_name} class='{classes[:60]}...'>")
        
        # Chercher des data attributes
        print("\n📊 Data attributes:")
        data_elements = driver.find_elements(By.XPATH, "//*[@data-siren or @data-siret or @data-id]")
        print(f"   Éléments avec data-siren/siret/id: {len(data_elements)}")
        
        # Chercher du texte SIREN
        print("\n🔢 Recherche de SIREN dans le texte...")
        body_text = driver.find_element(By.TAG_NAME, "body").text
        import re
        sirens = re.findall(r'\b\d{9}\b', body_text)
        sirets = re.findall(r'\b\d{14}\b', body_text)
        print(f"   SIREN (9 chiffres) trouvés: {len(set(sirens))}")
        print(f"   SIRET (14 chiffres) trouvés: {len(set(sirets))}")
        
        if sirens:
            print(f"   Exemples SIREN: {list(set(sirens))[:5]}")
        
        # Chercher des éléments avec du contenu texte ressemblant à des noms d'entreprise
        print("\n🏢 Recherche d'éléments de liste...")
        
        # Chercher les ul/li
        lists = driver.find_elements(By.TAG_NAME, "ul")
        print(f"   Listes <ul>: {len(lists)}")
        
        # Chercher les tables
        tables = driver.find_elements(By.TAG_NAME, "table")
        print(f"   Tables <table>: {len(tables)}")
        
        # Chercher les divs avec beaucoup de texte
        print("\n📝 Divs avec contenu substantiel:")
        divs = driver.find_elements(By.TAG_NAME, "div")
        content_divs = []
        for div in divs:
            text = div.text.strip()
            if len(text) > 100 and len(text) < 1000:
                classes = div.get_attribute('class') or ''
                if any(x in classes.lower() for x in ['result', 'item', 'list', 'content']):
                    content_divs.append((classes, text[:100]))
        
        print(f"   Divs avec contenu (100-1000 chars): {len(content_divs)}")
        for classes, text in content_divs[:3]:
            print(f"      [{classes[:40]}]: {text[:60]}...")
        
        print("\n" + "=" * 60)
        print("💡 Regarde le screenshot et le fichier HTML pour plus de détails")
        print(f"   📸 {screenshot_path}")
        print(f"   📄 {html_path}")
        print("=" * 60)
        
        input("\n⏸️  Appuie sur ENTRÉE pour fermer le navigateur...")
        
    finally:
        driver.quit()
        print("✅ Terminé!")

if __name__ == "__main__":
    main()
