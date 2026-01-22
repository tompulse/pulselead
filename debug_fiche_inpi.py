#!/usr/bin/env python3
"""
Debug : affiche le contenu d'une fiche entreprise INPI
"""

import time
import os
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "data", "inpi_scrapes")

# URL d'une fiche entreprise (prend celle du résultat)
FICHE_URL = "https://data.inpi.fr/entreprises/999239007"

def main():
    print("🔍 Debug fiche entreprise INPI\n")
    
    options = webdriver.ChromeOptions()
    options.add_argument("--window-size=1400,900")
    
    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=options)
    
    try:
        print(f"🌐 Chargement: {FICHE_URL}")
        driver.get(FICHE_URL)
        time.sleep(5)
        
        # Screenshot
        screenshot_path = os.path.join(OUTPUT_DIR, "debug_fiche.png")
        driver.save_screenshot(screenshot_path)
        print(f"📸 Screenshot: {screenshot_path}")
        
        # HTML
        html_path = os.path.join(OUTPUT_DIR, "debug_fiche.html")
        with open(html_path, 'w', encoding='utf-8') as f:
            f.write(driver.page_source)
        print(f"📄 HTML: {html_path}")
        
        # Texte de la page
        body_text = driver.find_element(By.TAG_NAME, "body").text
        
        print("\n" + "=" * 70)
        print("📝 CONTENU TEXTE DE LA PAGE (premiers 3000 caractères)")
        print("=" * 70)
        print(body_text[:3000])
        print("\n" + "=" * 70)
        
        # Chercher des éléments spécifiques
        print("\n🔎 Éléments trouvés:")
        
        # Titres
        for tag in ['h1', 'h2', 'h3']:
            elements = driver.find_elements(By.TAG_NAME, tag)
            for el in elements:
                if el.text.strip():
                    print(f"   <{tag}>: {el.text.strip()[:60]}")
        
        # Sections avec des classes intéressantes
        for cls in ['dirigeant', 'representant', 'identite', 'siege', 'activite']:
            elements = driver.find_elements(By.XPATH, f"//*[contains(@class, '{cls}')]")
            for el in elements[:3]:
                text = el.text.strip()[:100]
                if text:
                    print(f"   .{cls}: {text}")
        
        input("\n⏸️ Appuie sur ENTRÉE pour fermer...")
        
    finally:
        driver.quit()

if __name__ == "__main__":
    main()
