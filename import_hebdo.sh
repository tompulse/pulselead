#!/bin/bash
#
# 🚀 IMPORT HEBDOMADAIRE AUTOMATIQUE
# Usage: ./import_hebdo.sh public/nouveaux-sites.csv
#

CSV_FILE="${1:-public/nouveaux-sites.csv}"

if [ ! -f "$CSV_FILE" ]; then
    echo "❌ Fichier introuvable: $CSV_FILE"
    exit 1
fi

echo "============================================================"
echo "🚀 IMPORT AUTOMATIQUE → SUPABASE"
echo "============================================================"
echo "📁 Fichier: $CSV_FILE"
echo ""

# Étape 1: Convertir CSV
echo "📊 Conversion du CSV..."
python3 << 'PYTHON_SCRIPT'
import csv
import sys

NAF_SECTIONS = {
    "01": "A", "02": "A", "03": "A",
    "05": "B", "06": "B", "07": "B", "08": "B", "09": "B",
    "10": "C", "11": "C", "12": "C", "13": "C", "14": "C", "15": "C",
    "16": "C", "17": "C", "18": "C", "19": "C", "20": "C", "21": "C",
    "22": "C", "23": "C", "24": "C", "25": "C", "26": "C", "27": "C",
    "28": "C", "29": "C", "30": "C", "31": "C", "32": "C", "33": "C",
    "35": "D", "36": "E", "37": "E", "38": "E", "39": "E",
    "41": "F", "42": "F", "43": "F",
    "45": "G", "46": "G", "47": "G",
    "49": "H", "50": "H", "51": "H", "52": "H", "53": "H",
    "55": "I", "56": "I",
    "58": "J", "59": "J", "60": "J", "61": "J", "62": "J", "63": "J",
    "64": "K", "65": "K", "66": "K",
    "68": "L",
    "69": "M", "70": "M", "71": "M", "72": "M", "73": "M", "74": "M", "75": "M",
    "77": "N", "78": "N", "79": "N", "80": "N", "81": "N", "82": "N",
    "84": "O",
    "85": "P",
    "86": "Q", "87": "Q", "88": "Q",
    "90": "R", "91": "R", "92": "R", "93": "R",
    "94": "S", "95": "S", "96": "S",
}

csv_file = sys.argv[1]

# Auto-detect encoding
encodings = ['utf-8', 'iso-8859-1', 'windows-1252']
f = None
for enc in encodings:
    try:
        f = open(csv_file, 'r', encoding=enc)
        next(csv.DictReader(f, delimiter=';'))
        f.seek(0)
        break
    except:
        if f: f.close()
        continue

if not f:
    print("❌ Impossible de lire le CSV")
    sys.exit(1)

reader = csv.DictReader(f, delimiter=';')

with open('.import_temp.csv', 'w', encoding='utf-8', newline='') as out:
    fieldnames = ['siret', 'nom', 'date_creation', 'est_siege', 'categorie_juridique',
                  'categorie_entreprise', 'complement_adresse', 'numero_voie', 'type_voie',
                  'libelle_voie', 'code_postal', 'ville', 'coordonnee_lambert_x',
                  'coordonnee_lambert_y', 'latitude', 'longitude', 'code_naf',
                  'naf_section', 'naf_division', 'naf_groupe', 'naf_classe',
                  'adresse', 'archived']
    writer = csv.DictWriter(out, fieldnames=fieldnames)
    writer.writeheader()
    
    count = 0
    for row in reader:
        siret = row.get('siret', '').strip()
        if not siret or len(siret) < 14:
            continue
        
        nom = row.get('Entreprise', '').strip() or row.get('denominationUsuelleEtablissement', '').strip()
        if not nom:
            nom_f = row.get('nomUniteLegale', '').strip()
            prenom = row.get('prenom1UniteLegale', '').strip()
            nom = f"{prenom} {nom_f}".strip() if prenom else nom_f
        nom = nom or f"Entreprise {siret[:9]}"
        
        date_str = row.get('dateCreationEtablissement', '').strip()
        date_creation = ''
        if date_str:
            parts = date_str.split('/')
            if len(parts) == 3:
                date_creation = f"{parts[2]}-{parts[1]}-{parts[0]}"
        
        lx = row.get('coordonneeLambertAbscisseEtablissement', '').strip()
        ly = row.get('coordonneeLambertOrdonneeEtablissement', '').strip()
        lat, lng = '', ''
        if lx and ly:
            try:
                lat = str(42.0 + (float(ly) - 6200000) / 111000)
                lng = str(3.0 + (float(lx) - 700000) / 75000)
            except:
                pass
        
        code_naf = row.get('activitePrincipaleEtablissement', '').strip()
        naf_section, naf_division, naf_groupe, naf_classe = '', '', '', ''
        if code_naf and len(code_naf) >= 2:
            naf_section = NAF_SECTIONS.get(code_naf[:2], '')
            naf_division = code_naf[:2]
            naf_groupe = code_naf[:4] if len(code_naf) >= 4 else ''
            naf_classe = code_naf[:5] if len(code_naf) >= 5 else ''
        
        cat = row.get('categorieEntreprise', '').strip()
        categorie = 'PME'
        if cat == 'GE': categorie = 'GE'
        elif cat in ['ET', 'ETI']: categorie = 'ETI'
        
        writer.writerow({
            'siret': siret,
            'nom': nom[:255],
            'date_creation': date_creation,
            'est_siege': 'true' if row.get('etablissementSiege', '').upper() in ['VRAI', 'TRUE', '1'] else 'false',
            'categorie_juridique': row.get('categorieJuridique', '').strip() or 'Non spécifié',
            'categorie_entreprise': categorie,
            'complement_adresse': row.get('complementAdresseEtablissement', '').strip()[:255],
            'numero_voie': row.get('numeroVoieEtablissement', '').strip(),
            'type_voie': row.get('typeVoieEtablissement', '').strip(),
            'libelle_voie': row.get('libelleVoieEtablissement', '').strip()[:255],
            'code_postal': row.get('codePostalEtablissement', '').strip(),
            'ville': row.get('libelleCommuneEtablissement', '').strip()[:255],
            'coordonnee_lambert_x': lx,
            'coordonnee_lambert_y': ly,
            'latitude': lat,
            'longitude': lng,
            'code_naf': code_naf,
            'naf_section': naf_section,
            'naf_division': naf_division,
            'naf_groupe': naf_groupe,
            'naf_classe': naf_classe,
            'adresse': f"{row.get('complementAdresseEtablissement', '')} {row.get('numeroVoieEtablissement', '')} {row.get('typeVoieEtablissement', '')} {row.get('libelleVoieEtablissement', '')}".strip()[:500],
            'archived': 'false'
        })
        count += 1

print(f"✅ {count} entreprises converties")
f.close()
PYTHON_SCRIPT "$CSV_FILE"

if [ $? -ne 0 ]; then
    echo "❌ Erreur de conversion"
    exit 1
fi

echo ""
echo "============================================================"
echo "📤 IMPORT DANS SUPABASE"
echo "============================================================"
echo ""
echo "🔗 Ouvre: https://supabase.com/dashboard/project/xvggbkivkdshbdvtvheo/editor"
echo ""
echo "1️⃣  Table 'nouveaux_sites'"
echo "2️⃣  Bouton 'Insert' → 'Import data from CSV'"
echo "3️⃣  Upload le fichier: .import_temp.csv"
echo "4️⃣  ✅ Coche 'Replace existing data'"
echo "5️⃣  Clique 'Import'"
echo ""
echo "✅ Fichier prêt: $(pwd)/.import_temp.csv"
echo ""
echo "============================================================"

# Keep temp file for inspection
echo "💡 Fichier temporaire conservé pour vérification"
echo "   Pour le supprimer: rm .import_temp.csv"
