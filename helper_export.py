#!/usr/bin/env python3
"""
Helper script pour faciliter les exports manuels
Génère les dates à copier-coller dans le formulaire
"""

from datetime import datetime, timedelta

START_DATE = datetime(2025, 12, 1)
END_DATE = datetime(2026, 1, 22)

print("📅 LISTE DES PÉRIODES À EXPORTER")
print("=" * 60)
print()
print("Copie-colle ces dates dans le formulaire :")
print()

current_date = START_DATE
batch_num = 1

while current_date <= END_DATE:
    date_str = current_date.strftime("%d/%m/%Y")
    print(f"Batch {batch_num:02d} : Début = {date_str} | Fin = {date_str}")
    
    current_date += timedelta(days=1)
    batch_num += 1

print()
print("=" * 60)
print(f"✅ TOTAL : {batch_num - 1} exports à faire")
print("⏱️  Temps estimé : 2-3 heures (en faisant 1 export toutes les 3 min)")
print()
print("💡 ASTUCE : Ouvre 2 onglets en parallèle pour aller plus vite !")
