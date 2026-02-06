# 🚀 Import Pas à Pas - Votre Base de Données

Vous avez **6640 nouvelles entreprises** à importer !

Fichier : `data base 24 janv au 6 février.csv`

---

## 📋 Étape 1 : Convertir CSV → SQL

Dans le terminal Cursor (en bas, ou `Cmd + J`), exécutez :

```bash
python3 convert_csv_to_sql.py "data base 24 janv au 6 février.csv"
```

✅ **Résultat attendu** :
```
✅ Conversion terminée!
   6640 lignes traitées
   Fichier SQL généré: data base 24 janv au 6 février_import.sql
```

---

## 📋 Étape 2 : Ouvrir le fichier SQL généré

Le fichier `data base 24 janv au 6 février_import.sql` est créé automatiquement.

1. **Ouvrez-le** dans Cursor
2. **Copiez tout** le contenu (`Cmd + A` puis `Cmd + C`)

---

## 📋 Étape 3 : Importer dans Supabase

### 3a. Connexion à Supabase
1. Ouvrez votre navigateur
2. Allez sur https://supabase.com/dashboard
3. Sélectionnez votre projet **PulseLead**

### 3b. SQL Editor
1. Dans le menu gauche, cliquez sur **"SQL Editor"**
2. Cliquez sur **"New query"**
3. **Collez** tout le contenu du fichier SQL
4. Cliquez sur **"Run"** (ou `Cmd + Enter`)

⏱️ **Temps estimé** : 1-2 minutes pour 6640 entreprises

✅ **Résultat attendu** :
```
Successfully run. x rows returned
```

---

## 📋 Étape 4 : Vérification

Dans le SQL Editor, exécutez cette requête :

```sql
-- Vérifier l'import
SELECT 
  COUNT(*) as total_importe,
  COUNT(DISTINCT categorie_juridique) as nb_categories,
  COUNT(CASE WHEN latitude IS NOT NULL THEN 1 END) as avec_gps,
  COUNT(CASE WHEN code_naf IS NOT NULL THEN 1 END) as avec_naf,
  MIN(created_at) as premier_import,
  MAX(created_at) as dernier_import
FROM nouveaux_sites
WHERE created_at >= NOW() - INTERVAL '10 minutes';

-- Top 10 catégories juridiques importées
SELECT 
  categorie_juridique,
  COUNT(*) as nombre
FROM nouveaux_sites
WHERE created_at >= NOW() - INTERVAL '10 minutes'
GROUP BY categorie_juridique
ORDER BY nombre DESC
LIMIT 10;
```

---

## 🎯 Étape 5 : Intégration Automatique avec PulseLead

### ✨ Ce qui se passe automatiquement :

#### 1. **Calcul des codes NAF** (Instantané)
Les colonnes suivantes sont **automatiquement calculées** par un trigger PostgreSQL :

```sql
naf_section   → '6' de '62.01Z'
naf_division  → '62' de '62.01Z'
naf_groupe    → '620' de '62.01Z'
naf_classe    → '6201' de '62.01Z'
```

➡️ **Résultat** : Les **filtres par secteur NAF** dans votre interface fonctionnent immédiatement !

#### 2. **Conversion des coordonnées GPS** (Déjà dans votre CSV)
Vos coordonnées Lambert sont déjà présentes → Elles seront converties en lat/lng

➡️ **Résultat** : La **carte interactive** affiche les entreprises immédiatement !

#### 3. **Indexation pour la recherche** (Automatique)
Les index suivants accélèrent les filtres :
- Index sur `categorie_juridique` ✅
- Index sur `code_postal` ✅
- Index sur `code_naf` ✅
- Index sur `naf_section`, `naf_division` ✅
- Index géographique (latitude, longitude) ✅

➡️ **Résultat** : Les **filtres sont rapides** même avec 6640 nouvelles entreprises !

#### 4. **Fonction de filtrage dynamique** (Déjà configurée)
La fonction `get_nouveaux_sites_aggregated_counts` calcule automatiquement :
- ✅ Compteurs par secteur NAF
- ✅ Compteurs par département
- ✅ Compteurs par taille d'entreprise
- ✅ Compteurs par catégorie juridique
- ✅ Compteurs par type d'établissement (siège/site)

➡️ **Résultat** : Vos **filtres interactifs** affichent les bons nombres !

---

## 🎨 Comment vos données apparaissent dans l'interface

### Sur la page `/nouveaux-sites` :

1. **Carte interactive** 🗺️
   - Affiche les 6640 nouvelles entreprises avec des marqueurs
   - Clusterisation automatique
   - Clic sur un marqueur → Fiche entreprise

2. **Panneau de filtres** 🎛️
   - **Secteur d'activité** : Basé sur `naf_section` (auto-calculé)
   - **Code NAF** : Basé sur `naf_division`, `naf_groupe` (auto-calculé)
   - **Département** : Basé sur `code_postal`
   - **Taille** : Basé sur `categorie_entreprise` (GE, ETI, PME)
   - **Forme juridique** : Basé sur `categorie_juridique`
   - **Type** : Basé sur `est_siege` (Siège/Site)

3. **Liste d'entreprises** 📋
   - Affiche les résultats filtrés
   - Pagination automatique
   - Tri par date de création, nom, etc.

4. **Recherche textuelle** 🔍
   - Recherche dans `nom` et `ville`
   - Recherche instantanée

---

## ✅ Checklist Finale

Après l'import, vérifiez :

- [ ] Le nombre total d'entreprises a augmenté de 6640
- [ ] Les filtres NAF affichent les nouvelles catégories
- [ ] La carte affiche les nouveaux marqueurs
- [ ] Les compteurs de filtres sont corrects
- [ ] La recherche trouve les nouvelles entreprises
- [ ] Les fiches entreprises s'affichent correctement

---

## 🔧 Résolution de Problèmes

### Erreur : "duplicate key value violates unique constraint"
➡️ Certains SIRET existent déjà → C'est normal, ils sont mis à jour (UPSERT)

### Coordonnées GPS manquantes
➡️ Vérifiez que `coordonnee_lambert_x` et `coordonnee_lambert_y` sont bien remplies

### Les filtres ne montrent pas les nouvelles données
➡️ Rafraîchissez la page (`Cmd + R`) ou videz le cache

### Erreur SQL lors de l'import
➡️ Vérifiez les logs et envoyez-moi le message d'erreur exact

---

## 🎉 C'est tout !

Une fois l'import terminé :

1. **Allez sur** : https://votre-app.vercel.app/nouveaux-sites
2. **Les 6640 entreprises** apparaissent automatiquement
3. **Tous les filtres** fonctionnent immédiatement
4. **La carte** affiche les nouveaux emplacements
5. **La recherche** trouve les nouvelles entreprises

**Aucune autre action nécessaire !** 🚀

Tout est déjà configuré pour fonctionner automatiquement grâce à :
- ✅ Les triggers PostgreSQL
- ✅ Les index de performance
- ✅ Les fonctions d'agrégation
- ✅ Les composants React configurés

---

Besoin d'aide pour une étape ? Dites-moi où vous en êtes ! 💪
