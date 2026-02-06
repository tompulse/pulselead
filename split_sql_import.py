#!/usr/bin/env python3
"""
Divise un gros fichier SQL en plusieurs petits fichiers
pour import dans Supabase SQL Editor
"""

import sys
import re

def split_sql_file(input_file, chunk_size=500):
    """Divise le fichier SQL en morceaux de chunk_size lignes"""
    
    print(f"📂 Lecture de {input_file}...")
    
    with open(input_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Extraire le header (jusqu'à VALUES)
    header_match = re.search(r'(.*?VALUES\s*)', content, re.DOTALL)
    if not header_match:
        print("❌ Erreur: Format SQL invalide")
        return
    
    header = header_match.group(1)
    
    # Extraire le footer (ON CONFLICT...)
    footer_match = re.search(r'(ON CONFLICT.*)', content, re.DOTALL)
    footer = footer_match.group(1) if footer_match else ""
    
    # Extraire toutes les lignes VALUES
    values_section = content[len(header):len(content)-len(footer)]
    
    # Séparer chaque ligne de valeur (terminée par ),)
    value_lines = re.findall(r'\([^)]+\),?', values_section)
    
    total_lines = len(value_lines)
    num_chunks = (total_lines + chunk_size - 1) // chunk_size
    
    print(f"📊 {total_lines} entreprises à importer")
    print(f"✂️ Division en {num_chunks} fichiers de max {chunk_size} lignes")
    
    base_name = input_file.replace('_import.sql', '')
    
    for i in range(num_chunks):
        start_idx = i * chunk_size
        end_idx = min((i + 1) * chunk_size, total_lines)
        chunk_lines = value_lines[start_idx:end_idx]
        
        # Construire le fichier
        output_file = f"{base_name}_part{i+1}_of_{num_chunks}.sql"
        
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(f"-- Partie {i+1}/{num_chunks}\n")
            f.write(f"-- Lignes {start_idx+1} à {end_idx}\n\n")
            f.write(header + "\n")
            
            # Écrire les valeurs
            for j, line in enumerate(chunk_lines):
                # Retirer la virgule finale de la dernière ligne
                if j == len(chunk_lines) - 1:
                    line = line.rstrip(',')
                f.write("  " + line + "\n")
            
            f.write("\n" + footer)
        
        print(f"✅ Créé: {output_file} ({end_idx - start_idx} lignes)")
    
    print(f"\n🎉 Division terminée!")
    print(f"\n📋 Instructions:")
    print(f"   1. Ouvrir Supabase SQL Editor")
    print(f"   2. Exécuter chaque fichier dans l'ordre:")
    for i in range(num_chunks):
        print(f"      - {base_name}_part{i+1}_of_{num_chunks}.sql")
    print(f"   3. Attendre que chaque requête se termine avant la suivante")

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: python3 split_sql_import.py fichier_import.sql [taille_chunk]")
        print("\nExemple:")
        print('  python3 split_sql_import.py "data base 24 janv au 6 février_import.sql" 500')
        sys.exit(1)
    
    input_file = sys.argv[1]
    chunk_size = int(sys.argv[2]) if len(sys.argv) > 2 else 500
    
    try:
        split_sql_file(input_file, chunk_size)
    except FileNotFoundError:
        print(f"❌ Erreur: Fichier '{input_file}' non trouvé")
    except Exception as e:
        print(f"❌ Erreur: {e}")
        import traceback
        traceback.print_exc()
