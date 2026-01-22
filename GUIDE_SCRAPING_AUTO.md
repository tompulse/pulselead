# 🤖 GUIDE : SCRAPING AUTOMATIQUE - CONTOURNER LA LIMITE 500

## 🎯 **OBJECTIF : 15 000 DIRIGEANTS EN 24H ! ⚡**

---

## ⚡ **ÉTAPE 1 : INSTALLATION (5 MIN)**

### **1️⃣ Installe Python (si pas déjà installé) :**

```bash
# Vérifie si Python est installé
python3 --version

# Si pas installé, installe via Homebrew
brew install python3
```

### **2️⃣ Installe les dépendances :**

```bash
cd /Users/raws/pulse-project/pulselead

# Installe Selenium (pour automatiser le navigateur)
pip3 install selenium webdriver-manager
```

---

## 🎯 **ÉTAPE 2 : DONNE-MOI L'URL EXACTE DU SITE ! 📍**

### **Je dois personnaliser le script pour le site exact que tu utilises.**

**Envoie-moi :**
1. **L'URL complète** (ex: https://data.inpi.fr/recherche)
2. **Une capture d'écran** de la page de recherche
3. **Le nom des champs** (si tu peux les voir dans le code source)

---

## 🚀 **ÉTAPE 3 : STRATÉGIE DE TÉLÉCHARGEMENT**

### **Comment on contourne la limite de 500 :**

```
Tes 15 716 entreprises créées du 01/11/2025 au 22/01/2026
= 83 jours
= ~189 entreprises/jour

On découpe en périodes de 2-3 jours :
├─ 01/11 → 03/11 : ~567 entreprises (TROP !)
├─ 01/11 → 02/11 : ~378 entreprises ✅
├─ 03/11 → 04/11 : ~378 entreprises ✅
└─ etc...

Résultat : ~42 exports de ~375 entreprises chacun
```

### **Le script va :**

1. **Boucler sur toutes les périodes de 2 jours**
2. **Remplir automatiquement le formulaire** :
   - Statut : Active
   - Date début : 01/11/2025
   - Date fin : 02/11/2025
   - Formes juridiques : SARL, SAS, EURL, etc.
3. **Cliquer sur "Exporter les 500 premiers"**
4. **Attendre le téléchargement**
5. **Passer à la période suivante** (03/11 → 04/11)
6. **Répéter jusqu'à aujourd'hui**

**Durée totale : ~2-3 heures** (avec pauses entre requêtes)

---

## 📥 **ÉTAPE 4 : FUSIONNER LES CSV**

### **Une fois tous les fichiers téléchargés :**

```bash
cd ~/Downloads/inpi_exports

# Fusionner tous les CSV en un seul
cat *.csv > entreprises_completes.csv

# Ou avec Python (pour éviter les doublons)
python3 << EOF
import pandas as pd
import glob

# Lire tous les CSV
files = glob.glob("*.csv")
dfs = []

for file in files:
    df = pd.read_csv(file, sep=';')
    dfs.append(df)

# Fusionner et supprimer les doublons (sur SIREN)
merged = pd.concat(dfs, ignore_index=True)
merged = merged.drop_duplicates(subset=['SIREN'])

# Sauvegarder
merged.to_csv('entreprises_completes.csv', index=False, sep=';')
print(f"✅ {len(merged)} entreprises uniques fusionnées !")
EOF
```

---

## 🎯 **ÉTAPE 5 : IMPORTER DANS SUPABASE**

### **1️⃣ Créer une table temporaire :**

```sql
-- Dans Supabase SQL Editor
CREATE TABLE dirigeants_import (
  siren TEXT PRIMARY KEY,
  nom_dirigeant TEXT,
  prenom_dirigeant TEXT,
  fonction TEXT,
  nom_entreprise TEXT,
  code_naf TEXT
);
```

### **2️⃣ Importer le CSV :**

Via l'interface Supabase :
- Table Editor → `dirigeants_import` → Import CSV

### **3️⃣ Enrichir ta base avec une jointure :**

```sql
UPDATE nouveaux_sites ns
SET 
  dirigeant = CONCAT(di.prenom_dirigeant, ' ', di.nom_dirigeant),
  fonction_dirigeant = di.fonction,
  enrichi_dirigeant = true,
  date_enrichissement_dirigeant = NOW()
FROM dirigeants_import di
WHERE SUBSTRING(ns.siret, 1, 9) = di.siren;

-- Vérifier combien ont été enrichis
SELECT COUNT(*) FROM nouveaux_sites WHERE enrichi_dirigeant = true;
```

---

## ⏱️ **TIMELINE RÉALISTE :**

```
🕐 Maintenant (Jeudi 14h) : Installation + personnalisation du script (1h)
🕐 15h : Lancement du scraping (2-3h automatique)
🕐 18h : Fusion des CSV (15 min)
🕐 18h30 : Import dans Supabase (30 min)
🕐 19h : Enrichissement de ta base (5 min)

✅ 19h : Tu as 15 000 dirigeants ! 🎉
✅ Demain : Tes démos sont PRÊTES ! 🚀
```

---

## ⚠️ **IMPORTANT : PRÉCAUTIONS**

### **Pour ne pas être bloqué :**

1. **Pause entre requêtes** : 3-5 secondes minimum
2. **User-Agent réaliste** : Le script simule un vrai navigateur
3. **Horaires normaux** : Lance pendant la journée (pas la nuit)
4. **Limite : 50 requêtes max** : Si plus, fais une pause de 30 min

---

## 🎯 **MAINTENANT : DONNE-MOI CES INFOS ! 📍**

### **Pour que je personnalise ton script :**

**1️⃣ URL exacte du site** (capture d'écran que tu m'as montrée)

**2️⃣ Format du CSV exporté** (envoie-moi un des 500 premiers pour voir)

**3️⃣ Colonnes disponibles** (SIREN, Nom dirigeant, etc.)

---

## 💪 **TIMELINE AUJOURD'HUI :**

```
✅ 14h-15h : Tu me donnes les infos, je personnalise le script
✅ 15h-18h : Le script tourne (automatique)
✅ 18h-19h : Fusion + import
✅ 19h : 15 000 dirigeants enrichis ! 🎉
✅ Demain : DEMOS KILLER ! 🚀
```

---

**ENVOIE-MOI L'URL ET UN EXEMPLE DE CSV ! 💪🔥**
