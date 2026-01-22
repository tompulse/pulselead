#!/usr/bin/env python3
"""
Script de fusion des CSV INPI et croisement avec la BDD

USAGE:
    python3 merge_inpi_csvs.py
"""

import os
import csv
import glob
from collections import defaultdict

# ==========================================
# CONFIGURATION
# ==========================================
DOWNLOAD_DIR = os.path.expanduser("~/Downloads/inpi_exports")
OUTPUT_FILE = os.path.join(DOWNLOAD_DIR, "INPI_MERGED_FINAL.csv")
MATCH_FILE = os.path.join(DOWNLOAD_DIR, "NOUVEAUX_DIRIGEANTS_TROUVES.csv")

# ==========================================
# 1. FUSIONNER TOUS LES CSV
# ==========================================
def merge_csvs():
    print("🔄 Fusion des CSV INPI...")
    
    csv_files = sorted(glob.glob(os.path.join(DOWNLOAD_DIR, "inpi_export_*.csv")))
    
    if not csv_files:
        print(f"❌ Aucun fichier CSV trouvé dans {DOWNLOAD_DIR}")
        return None
    
    print(f"📁 {len(csv_files)} fichiers CSV trouvés")
    
    all_rows = []
    seen_sirens = set()
    
    for i, csv_file in enumerate(csv_files, 1):
        print(f"   Traitement {i}/{len(csv_files)} : {os.path.basename(csv_file)}")
        
        try:
            with open(csv_file, 'r', encoding='utf-8') as f:
                # Sauter les 2 premières lignes (métadonnées)
                f.readline()
                f.readline()
                
                reader = csv.DictReader(f, delimiter=';')
                
                for row in reader:
                    siren = row.get('SIREN', '').strip().replace("'", "")
                    
                    # Éviter les doublons
                    if siren and siren not in seen_sirens:
                        seen_sirens.add(siren)
                        all_rows.append(row)
        
        except Exception as e:
            print(f"   ⚠️  Erreur : {e}")
    
    print(f"\n✅ {len(all_rows)} entreprises uniques fusionnées")
    
    # Sauvegarder le CSV fusionné
    if all_rows:
        with open(OUTPUT_FILE, 'w', encoding='utf-8', newline='') as f:
            writer = csv.DictWriter(f, fieldnames=all_rows[0].keys(), delimiter=';')
            writer.writeheader()
            writer.writerows(all_rows)
        
        print(f"📄 Fichier fusionné : {OUTPUT_FILE}")
    
    return all_rows

# ==========================================
# 2. EXTRAIRE SIREN + REPRÉSENTANTS
# ==========================================
def extract_dirigeants(all_rows):
    print("\n🔍 Extraction des SIREN + Représentants...")
    
    dirigeants_map = {}
    found_count = 0
    missing_count = 0
    
    for row in all_rows:
        siren = row.get('SIREN', '').strip().replace("'", "")
        representants = row.get('Représentants', '').strip()
        nom_entreprise = row.get('Dénomination / Nom', '').strip().replace('"', '')
        
        if siren:
            if representants:
                dirigeants_map[siren] = {
                    'siren': siren,
                    'nom_entreprise': nom_entreprise,
                    'representants': representants
                }
                found_count += 1
            else:
                missing_count += 1
    
    print(f"✅ {found_count} entreprises avec représentant")
    print(f"❌ {missing_count} entreprises sans représentant")
    print(f"📊 Taux de couverture : {(found_count / len(all_rows) * 100):.1f}%")
    
    return dirigeants_map

# ==========================================
# 3. LIRE LA BDD EXPORTÉE (si disponible)
# ==========================================
def load_existing_prospects():
    """
    Charge les SIREN de ta BDD existante
    Tu peux exporter ta table 'nouveaux_sites' en CSV depuis Supabase
    """
    print("\n📋 Chargement de ta BDD existante...")
    
    # Chercher un export de ta BDD
    bdd_file = os.path.join(DOWNLOAD_DIR, "export_bdd_prospects.csv")
    
    if not os.path.exists(bdd_file):
        print(f"⚠️  Fichier BDD non trouvé : {bdd_file}")
        print("   Exporte ta table 'nouveaux_sites' depuis Supabase SQL Editor :")
        print("   COPY (SELECT siren, nom FROM nouveaux_sites) TO STDOUT WITH CSV HEADER;")
        return None
    
    existing_sirens = {}
    
    with open(bdd_file, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            siren = row.get('siren', '').strip()
            nom = row.get('nom', '').strip()
            if siren:
                existing_sirens[siren] = nom
    
    print(f"✅ {len(existing_sirens)} prospects chargés depuis ta BDD")
    return existing_sirens

# ==========================================
# 4. CROISER ET TROUVER LES NOUVEAUX GÉRANTS
# ==========================================
def cross_reference(dirigeants_map, existing_sirens):
    print("\n🔗 Croisement INPI × BDD...")
    
    if not existing_sirens:
        print("⚠️  Pas de BDD chargée, impossible de croiser")
        return []
    
    matches = []
    
    for siren, data in dirigeants_map.items():
        if siren in existing_sirens:
            matches.append({
                'siren': siren,
                'nom_entreprise': data['nom_entreprise'],
                'nom_bdd': existing_sirens[siren],
                'representants_inpi': data['representants']
            })
    
    print(f"✅ {len(matches)} correspondances trouvées !")
    
    # Sauvegarder les correspondances
    if matches:
        with open(MATCH_FILE, 'w', encoding='utf-8', newline='') as f:
            writer = csv.DictWriter(f, fieldnames=matches[0].keys())
            writer.writeheader()
            writer.writerows(matches)
        
        print(f"📄 Fichier de correspondances : {MATCH_FILE}")
        print(f"\n🎯 TU PEUX MAINTENANT IMPORTER CES {len(matches)} NOMS DE GÉRANTS DANS TA BDD !")
    
    return matches

# ==========================================
# SCRIPT PRINCIPAL
# ==========================================
def main():
    print("=" * 80)
    print("🔄 FUSION ET CROISEMENT DES DONNÉES INPI")
    print("=" * 80)
    
    # 1. Fusionner les CSV
    all_rows = merge_csvs()
    
    if not all_rows:
        return
    
    # 2. Extraire les dirigeants
    dirigeants_map = extract_dirigeants(all_rows)
    
    # 3. Charger ta BDD existante
    existing_sirens = load_existing_prospects()
    
    # 4. Croiser
    if existing_sirens:
        matches = cross_reference(dirigeants_map, existing_sirens)
        
        if matches:
            print("\n" + "=" * 80)
            print("✅ TERMINÉ ! VOICI LES STATS FINALES :")
            print("=" * 80)
            print(f"📊 Total entreprises INPI : {len(all_rows)}")
            print(f"✅ Avec représentant : {len(dirigeants_map)}")
            print(f"🔗 Correspondances avec ta BDD : {len(matches)}")
            print(f"💰 Économie Pappers : {len(matches) * 0.08:.2f}€")
            print("=" * 80)
    else:
        print("\n💡 PROCHAINE ÉTAPE :")
        print("   1. Exporte ta table 'nouveaux_sites' depuis Supabase")
        print("   2. Sauvegarde-la dans : ~/Downloads/inpi_exports/export_bdd_prospects.csv")
        print("   3. Relance ce script !")

if __name__ == "__main__":
    main()
