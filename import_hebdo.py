#!/usr/bin/env python3
"""
🚀 IMPORT HEBDOMADAIRE - 1 COMMANDE
Usage: python3 import_hebdo.py public/nouveaux-sites.csv
"""
import csv, sys, os

if len(sys.argv) < 2:
    print("Usage: python3 import_hebdo.py public/nouveaux-sites.csv")
    sys.exit(1)

csv_file = sys.argv[1]
if not os.path.exists(csv_file):
    print(f"❌ Fichier introuvable: {csv_file}")
    sys.exit(1)

print("="*60)
print("🚀 CONVERSION CSV → SUPABASE")
print("="*60)

NAF = {"01":"A","02":"A","03":"A","05":"B","06":"B","07":"B","08":"B","09":"B",
       "10":"C","11":"C","12":"C","13":"C","14":"C","15":"C","16":"C","17":"C",
       "18":"C","19":"C","20":"C","21":"C","22":"C","23":"C","24":"C","25":"C",
       "26":"C","27":"C","28":"C","29":"C","30":"C","31":"C","32":"C","33":"C",
       "35":"D","36":"E","37":"E","38":"E","39":"E","41":"F","42":"F","43":"F",
       "45":"G","46":"G","47":"G","49":"H","50":"H","51":"H","52":"H","53":"H",
       "55":"I","56":"I","58":"J","59":"J","60":"J","61":"J","62":"J","63":"J",
       "64":"K","65":"K","66":"K","68":"L","69":"M","70":"M","71":"M","72":"M",
       "73":"M","74":"M","75":"M","77":"N","78":"N","79":"N","80":"N","81":"N",
       "82":"N","84":"O","85":"P","86":"Q","87":"Q","88":"Q","90":"R","91":"R",
       "92":"R","93":"R","94":"S","95":"S","96":"S"}

# Auto-detect encoding
f = None
for enc in ['utf-8', 'iso-8859-1', 'windows-1252']:
    try:
        f = open(csv_file, 'r', encoding=enc)
        next(csv.DictReader(f, delimiter=';'))
        f.seek(0)
        print(f"✓ Encodage: {enc}")
        break
    except:
        if f: f.close()

if not f:
    print("❌ Impossible de lire le CSV")
    sys.exit(1)

reader = csv.DictReader(f, delimiter=';')
out = open('IMPORT_SUPABASE.csv', 'w', encoding='utf-8', newline='')
writer = csv.DictWriter(out, fieldnames=[
    'siret','nom','date_creation','est_siege','categorie_juridique',
    'categorie_entreprise','complement_adresse','numero_voie','type_voie',
    'libelle_voie','code_postal','ville','coordonnee_lambert_x',
    'coordonnee_lambert_y','latitude','longitude','code_naf',
    'naf_section','naf_division','naf_groupe','naf_classe','adresse','archived'])
writer.writeheader()

count = 0
for row in reader:
    siret = row.get('siret','').strip()
    if not siret or len(siret) < 14: continue
    
    nom = row.get('Entreprise','').strip() or row.get('denominationUsuelleEtablissement','').strip()
    if not nom:
        nf = row.get('nomUniteLegale','').strip()
        p = row.get('prenom1UniteLegale','').strip()
        nom = f"{p} {nf}".strip() if p else nf
    nom = nom or f"Entreprise {siret[:9]}"
    
    ds = row.get('dateCreationEtablissement','').strip()
    date_creation = ''
    if ds:
        parts = ds.split('/')
        if len(parts) == 3: date_creation = f"{parts[2]}-{parts[1]}-{parts[0]}"
    
    lx = row.get('coordonneeLambertAbscisseEtablissement','').strip()
    ly = row.get('coordonneeLambertOrdonneeEtablissement','').strip()
    lat, lng = '', ''
    if lx and ly:
        try:
            lat = str(42.0 + (float(ly) - 6200000) / 111000)
            lng = str(3.0 + (float(lx) - 700000) / 75000)
        except: pass
    
    code_naf = row.get('activitePrincipaleEtablissement','').strip()
    naf_section, naf_division, naf_groupe, naf_classe = '','','',''
    if code_naf and len(code_naf) >= 2:
        naf_section = NAF.get(code_naf[:2],'')
        naf_division = code_naf[:2]
        naf_groupe = code_naf[:4] if len(code_naf) >= 4 else ''
        naf_classe = code_naf[:5] if len(code_naf) >= 5 else ''
    
    cat = row.get('categorieEntreprise','').strip()
    categorie = 'PME'
    if cat == 'GE': categorie = 'GE'
    elif cat in ['ET','ETI']: categorie = 'ETI'
    
    writer.writerow({
        'siret': siret,
        'nom': nom[:255],
        'date_creation': date_creation,
        'est_siege': 'true' if row.get('etablissementSiege','').upper() in ['VRAI','TRUE','1'] else 'false',
        'categorie_juridique': row.get('categorieJuridique','').strip() or 'Non spécifié',
        'categorie_entreprise': categorie,
        'complement_adresse': row.get('complementAdresseEtablissement','').strip()[:255],
        'numero_voie': row.get('numeroVoieEtablissement','').strip(),
        'type_voie': row.get('typeVoieEtablissement','').strip(),
        'libelle_voie': row.get('libelleVoieEtablissement','').strip()[:255],
        'code_postal': row.get('codePostalEtablissement','').strip(),
        'ville': row.get('libelleCommuneEtablissement','').strip()[:255],
        'coordonnee_lambert_x': lx,
        'coordonnee_lambert_y': ly,
        'latitude': lat,
        'longitude': lng,
        'code_naf': code_naf,
        'naf_section': naf_section,
        'naf_division': naf_division,
        'naf_groupe': naf_groupe,
        'naf_classe': naf_classe,
        'adresse': f"{row.get('complementAdresseEtablissement','')} {row.get('numeroVoieEtablissement','')} {row.get('typeVoieEtablissement','')} {row.get('libelleVoieEtablissement','')}".strip()[:500],
        'archived': 'false'
    })
    count += 1
    if count % 5000 == 0: print(f"✓ {count} converties...")

f.close()
out.close()

print(f"\n✅ {count} entreprises converties !")
print(f"📁 Fichier: IMPORT_SUPABASE.csv")
print("\n" + "="*60)
print("📤 ÉTAPE 2: IMPORT DANS SUPABASE")
print("="*60)
print("\n1. Ouvre https://supabase.com/dashboard/project/xvggbkivkdshbdvtvheo/editor")
print("2. Table 'nouveaux_sites' → Bouton 'Insert'")
print("3. 'Import data from CSV'")
print("4. Upload: IMPORT_SUPABASE.csv")
print("5. ✅ Coche 'Replace existing data'")
print("6. Clique 'Import'")
print("\n✅ FAIT ! Les données seront visibles dans l'app.")
