# 📋 Guide d'import CSV manuel dans Supabase

## 🎯 3 méthodes pour importer ton CSV de 57k lignes

---

## ✅ **MÉTHODE 1 : Interface Supabase (RECOMMANDÉ - Le plus simple)**

### Étape par étape :

1. **Ouvre Supabase Dashboard**
   ```
   https://supabase.com/dashboard
   ```

2. **Sélectionne ton projet PulseLead**

3. **Va dans Table Editor**
   - Menu gauche → **Table Editor**
   - Clique sur la table `nouveaux_sites`

4. **Ouvre le menu d'import**
   - Clique sur le bouton **"Insert"** en haut
   - Sélectionne **"Import data from CSV"**
   
   OU
   
   - Clique sur les **3 points ⋮** en haut à droite de la table
   - Sélectionne **"Import data from CSV"**

5. **Sélectionne ton fichier**
   - Choisis `database.csv`
   - Supabase détecte automatiquement les colonnes

6. **Mappe les colonnes** (si popup de mapping)
   
   **CSV → Table Supabase:**
   ```
   siret                                    → siret
   entreprise                               → nom
   date_creation                            → date_creation
   siege                                    → est_siege
   categorie_juridique                      → categorie_juridique
   categorieEntreprise                      → categorie_entreprise
   complementAdresseEtablissement           → complement_adresse
   numeroVoieEtablissement                  → numero_voie
   typeVoieEtablissement                    → type_voie
   libelleVoieEtablissement                 → libelle_voie
   codePostalEtablissement                  → code_postal
   libelleCommuneEtablissement              → ville
   coordonneeLambertAbscisseEtablissement   → coordonnee_lambert_x
   coordonneeLambertOrdonneeEtablissement   → coordonnee_lambert_y
   activitePrincipaleEtablissement          → code_naf
   ```

7. **Lance l'import**
   - Clique sur **"Import"**
   - ⏳ Patiente (peut prendre 2-5 minutes pour 57k lignes)
   - ✅ C'est fait !

---

## 🐍 **MÉTHODE 2 : Script Python (Recommandé si l'interface Supabase timeout)**

### Prérequis :
```bash
pip install supabase
```

### Configuration :

1. **Récupère tes credentials Supabase**
   - Va sur Supabase Dashboard → Settings → API
   - Copie :
     - `Project URL` (https://xxxxx.supabase.co)
     - `service_role` key (commence par `eyJhbGc...`)

2. **Configure les variables d'environnement**
   ```bash
   export SUPABASE_URL="https://xxxxx.supabase.co"
   export SUPABASE_SERVICE_ROLE_KEY="eyJhbGc..."
   ```

3. **Lance le script**
   ```bash
   python3 import_csv_direct.py database.csv
   ```

### Ce que fait le script :
- ✅ Parse ton CSV avec les bons délimiteurs
- ✅ Convertit Lambert 93 → WGS84 (lat/lng)
- ✅ Parse les dates DD/MM/YYYY → YYYY-MM-DD
- ✅ Gère "VRAI"/"FAUX" → true/false
- ✅ Extrait la hiérarchie NAF (section, division, groupe, classe)
- ✅ Import en batches de 200 pour éviter les timeouts
- ✅ Continue même si un batch échoue
- ✅ Affiche la progression en temps réel

**Avantages :**
- 🚀 Plus rapide que l'interface Supabase
- 📊 Logs détaillés de la progression
- 🔄 Retry automatique en cas d'erreur
- 💾 Pas de limitation de taille

---

## 🔧 **MÉTHODE 3 : SQL Direct (Pour les gros fichiers)**

### Préparation du CSV pour SQL

1. **Ouvre ton CSV dans Excel/LibreOffice**

2. **Ajoute ces colonnes calculées** (si manquantes) :
   - `latitude` → Laisse vide (sera calculé par trigger)
   - `longitude` → Laisse vide (sera calculé par trigger)
   - `naf_section`, `naf_division`, `naf_groupe`, `naf_classe` → Laisse vides

3. **Sauvegarde en CSV UTF-8**

4. **Va sur Supabase → SQL Editor**

5. **Exécute ce script** pour préparer l'import :
   ```sql
   -- Désactiver les triggers temporairement pour accélérer l'import
   ALTER TABLE nouveaux_sites DISABLE TRIGGER ALL;
   ```

6. **Utilise l'outil COPY de PostgreSQL**
   ```sql
   COPY nouveaux_sites (
     siret,
     nom,
     date_creation,
     est_siege,
     categorie_juridique,
     categorie_entreprise,
     complement_adresse,
     numero_voie,
     type_voie,
     libelle_voie,
     code_postal,
     ville,
     coordonnee_lambert_x,
     coordonnee_lambert_y,
     code_naf
   )
   FROM '/path/to/database.csv'
   WITH (FORMAT csv, HEADER true, DELIMITER ';');
   ```

7. **Réactive les triggers**
   ```sql
   ALTER TABLE nouveaux_sites ENABLE TRIGGER ALL;
   ```

8. **Lance le calcul des coordonnées** (si besoin)
   ```sql
   -- Script de conversion Lambert → WGS84 pour toutes les lignes
   -- (À créer si nécessaire)
   ```

---

## 🆘 **Dépannage**

### Erreur "Timeout"
→ Utilise la **MÉTHODE 2 (Script Python)** avec batches de 100 au lieu de 200

### Erreur "Column not found"
→ Vérifie le mapping des colonnes (voir section Méthode 1)

### Erreur "Invalid date format"
→ Le script Python gère ça automatiquement, ou utilise la Méthode 1

### Import bloqué à X%
→ Rafraîchis la page et vérifie combien de lignes sont déjà importées :
```sql
SELECT COUNT(*) FROM nouveaux_sites;
```

### Coordonnées GPS manquantes
→ Normal, elles seront calculées après l'import via un trigger ou script

---

## 📊 **Vérification post-import**

```sql
-- Compter les lignes importées
SELECT COUNT(*) as total FROM nouveaux_sites;

-- Vérifier les données
SELECT * FROM nouveaux_sites LIMIT 10;

-- Vérifier les coordonnées GPS
SELECT 
  COUNT(*) as total,
  COUNT(latitude) as avec_coords,
  COUNT(*) - COUNT(latitude) as sans_coords
FROM nouveaux_sites;

-- Vérifier les doublons SIRET
SELECT siret, COUNT(*) as count
FROM nouveaux_sites
GROUP BY siret
HAVING COUNT(*) > 1;
```

---

## 🎯 **Quelle méthode choisir ?**

| Situation | Méthode recommandée |
|-----------|---------------------|
| Moins de 10k lignes | **Méthode 1** (Interface) |
| 10k-50k lignes | **Méthode 2** (Script Python) |
| Plus de 50k lignes | **Méthode 2** (Script Python) |
| Fichier > 10 MB | **Méthode 2** (Script Python) |
| Erreur timeout | **Méthode 2** (Script Python) |
| Pas Python installé | **Méthode 1** (Interface) |

---

## ✅ **Résumé rapide**

**Le plus simple :** Interface Supabase (Méthode 1)  
**Le plus fiable :** Script Python (Méthode 2)  
**Le plus rapide :** SQL Direct (Méthode 3) - pour experts

Ton fichier fait **6.8 MB avec 57k lignes** → Je recommande **Méthode 2 (Script Python)** 🐍
