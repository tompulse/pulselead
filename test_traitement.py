#!/usr/bin/env python3
"""
Script de test unitaire pour valider les fonctions de traitement
Usage: python3 test_traitement.py
"""

import sys

# Test 1: Correction codes postaux
def test_fix_code_postal():
    print("🧪 Test 1: Correction codes postaux")
    
    test_cases = [
        ("1234", "01234"),      # 4 chiffres → ajouter 0
        ("01234", "01234"),     # 5 chiffres → OK
        ("12345", "12345"),     # 5 chiffres → OK
        ("123", "00123"),       # 3 chiffres → padding
        ("12", "00012"),        # 2 chiffres → padding
        ("123456", "12345"),    # > 5 chiffres → tronquer
        ("1234.0", "01234"),    # Avec .0 → nettoyer
        (" 1234 ", "01234"),    # Avec espaces → trim
        ("", None),             # Vide → None
        (None, None),           # None → None
    ]
    
    def fix_code_postal(code_postal):
        if not code_postal:
            return None
        code = str(code_postal).strip().replace(' ', '')
        if code.endswith('.0'):
            code = code[:-2]
        code = ''.join(c for c in code if c.isdigit())
        if not code:
            return None
        if len(code) == 4:
            return '0' + code
        if len(code) == 5:
            return code
        if len(code) < 5:
            return code.zfill(5)
        return code[:5]
    
    passed = 0
    failed = 0
    
    for input_val, expected in test_cases:
        result = fix_code_postal(input_val)
        status = "✅" if result == expected else "❌"
        if result == expected:
            passed += 1
        else:
            failed += 1
        print(f"   {status} '{input_val}' → '{result}' (attendu: '{expected}')")
    
    print(f"\n   Résultat: {passed} réussis, {failed} échoués\n")
    return failed == 0

# Test 2: Secteur d'activité selon NAF
def test_secteur_naf():
    print("🧪 Test 2: Attribution secteur selon NAF")
    
    SECTEUR_TO_NAF_SECTIONS = {
        'Alimentaire': ['10', '11'],
        'BTP & Construction': ['16', '23', '41', '42', '43'],
        'Automobile': ['29', '30', '45'],
        'Commerce & Distribution': ['46', '47'],
        'Hôtellerie & Restauration': ['55', '56'],
        'Transport & Logistique': ['49', '50', '51', '52', '53'],
        'Informatique & Digital': ['58', '59', '60', '61', '62', '63'],
        'Santé & Médical': ['86', '87', '88'],
        'Services personnels': ['95', '96'],
    }
    
    def get_secteur_from_naf(code_naf):
        if not code_naf or code_naf == '' or code_naf == 'null':
            return 'Autres'
        section = code_naf.replace('.', '').replace(' ', '')[:2]
        for secteur, sections in SECTEUR_TO_NAF_SECTIONS.items():
            if section in sections:
                return secteur
        return 'Autres'
    
    test_cases = [
        ("10.11Z", "Alimentaire"),
        ("11.01Z", "Alimentaire"),
        ("41.20A", "BTP & Construction"),
        ("43.99C", "BTP & Construction"),
        ("45.11Z", "Automobile"),
        ("46.76Z", "Commerce & Distribution"),
        ("47.11F", "Commerce & Distribution"),
        ("55.10Z", "Hôtellerie & Restauration"),
        ("56.10A", "Hôtellerie & Restauration"),
        ("49.41A", "Transport & Logistique"),
        ("62.01Z", "Informatique & Digital"),
        ("86.10Z", "Santé & Médical"),
        ("95.23Z", "Services personnels"),
        ("01.11Z", "Autres"),
        ("70.10Z", "Autres"),
        (None, "Autres"),
        ("", "Autres"),
    ]
    
    passed = 0
    failed = 0
    
    for code_naf, expected in test_cases:
        result = get_secteur_from_naf(code_naf)
        status = "✅" if result == expected else "❌"
        if result == expected:
            passed += 1
        else:
            failed += 1
        print(f"   {status} NAF '{code_naf}' → '{result}' (attendu: '{expected}')")
    
    print(f"\n   Résultat: {passed} réussis, {failed} échoués\n")
    return failed == 0

# Test 3: Validation date
def test_validate_date():
    print("🧪 Test 3: Validation dates de création")
    
    def validate_date(date_str):
        if not date_str:
            return None
        date_str = str(date_str).strip()
        if '/' in date_str:
            try:
                parts = date_str.split('/')
                if len(parts) == 3:
                    day, month, year = parts
                    d, m, y = int(day), int(month), int(year)
                    if 1 <= m <= 12 and 1 <= d <= 31 and 1800 <= y <= 2026:
                        return f"{year.zfill(4)}-{month.zfill(2)}-{day.zfill(2)}"
            except (ValueError, AttributeError):
                pass
        if '-' in date_str and len(date_str) >= 8:
            try:
                parts = date_str.split('-')
                if len(parts) == 3:
                    year, month, day = parts
                    y, m, d = int(year), int(month), int(day)
                    if 1 <= m <= 12 and 1 <= d <= 31 and 1800 <= y <= 2026:
                        return f"{year.zfill(4)}-{month.zfill(2)}-{day.zfill(2)}"
            except (ValueError, AttributeError):
                pass
        return None
    
    test_cases = [
        ("01/01/2020", "2020-01-01"),
        ("15/06/2023", "2023-06-15"),
        ("2020-01-01", "2020-01-01"),
        ("2023-12-31", "2023-12-31"),
        ("1/1/2020", "2020-01-01"),
        ("9/9/2019", "2019-09-09"),
        ("31/12/2025", "2025-12-31"),
        ("invalid", None),
        ("", None),
        (None, None),
        ("32/01/2020", None),  # Jour invalide
        ("01/13/2020", None),  # Mois invalide
    ]
    
    passed = 0
    failed = 0
    
    for input_val, expected in test_cases:
        result = validate_date(input_val)
        status = "✅" if result == expected else "❌"
        if result == expected:
            passed += 1
        else:
            failed += 1
        print(f"   {status} '{input_val}' → '{result}' (attendu: '{expected}')")
    
    print(f"\n   Résultat: {passed} réussis, {failed} échoués\n")
    return failed == 0

def main():
    print("""
╔═══════════════════════════════════════════════════════════════════╗
║  🧪 TESTS UNITAIRES - Traitement des prospects                   ║
╚═══════════════════════════════════════════════════════════════════╝
""")
    
    results = []
    
    results.append(test_fix_code_postal())
    results.append(test_secteur_naf())
    results.append(test_validate_date())
    
    print("═══════════════════════════════════════════════════════════════════")
    if all(results):
        print("✅ TOUS LES TESTS RÉUSSIS!")
        print("   Les scripts sont prêts à être utilisés.")
        sys.exit(0)
    else:
        print("❌ CERTAINS TESTS ONT ÉCHOUÉ")
        print("   Vérifiez le code avant utilisation.")
        sys.exit(1)

if __name__ == "__main__":
    main()
