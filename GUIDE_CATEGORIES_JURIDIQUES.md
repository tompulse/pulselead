# 📋 Guide : Structure des Catégories Juridiques INSEE

## 📊 Structure Hiérarchique (3 niveaux)

Votre système utilise la **classification officielle INSEE** (Septembre 2022) avec 3 niveaux :

### Niveau I - 1 chiffre (10 catégories principales)

| Code | Label | Type |
|------|-------|------|
| **0** | Organisme de placement collectif | Placement collectif |
| **1** | Entrepreneur individuel | Auto-entrepreneur, freelance |
| **2** | Groupement de droit privé non doté de personnalité morale | Indivision, société de fait |
| **3** | Personne morale de droit étranger | Société étrangère |
| **4** | Personne morale de droit public commercial | Établissement public |
| **5** | Société commerciale | **SARL, SAS, SA, SNC** ⭐ |
| **6** | Autre personne morale immatriculée au RCS | GIE, coopératives, société civile |
| **7** | Personne morale et organisme droit administratif | Collectivités, établissements publics |
| **8** | Organisme privé spécialisé | Sécurité sociale, mutuelles |
| **9** | Groupement de droit privé | Associations, fondations |

### Niveau II - 2 chiffres (Sous-catégories)

Exemples pour le **niveau 5** (Sociétés commerciales) :
- **51** : Société coopérative commerciale
- **52** : Société en nom collectif (SNC)
- **53** : Société en commandite
- **54** : SARL et variantes ⭐
- **55** : SA à conseil d'administration
- **56** : SA à directoire
- **57** : SAS ⭐
- **58** : Société européenne

### Niveau III - 4 chiffres (Codes détaillés)

**Exemples populaires** :

| Code | Label | Utilisation |
|------|-------|-------------|
| **5470** | SPFPL SARL | Professions libérales |
| **5485** | SELARL | Exercice libéral |
| **5499** | SARL (sans autre indication) | SARL classique ⭐ |
| **5710** | SAS | SAS classique ⭐ |
| **5785** | SELAS | SAS exercice libéral |
| **5510** | SA nationale | SA classique |
| **6540** | SCI | Société civile immobilière ⭐ |

---

## 🗄️ Stockage dans la Base de Données

### Table : `nouveaux_sites`

```sql
CREATE TABLE public.nouveaux_sites (
  id UUID PRIMARY KEY,
  siret TEXT UNIQUE NOT NULL,
  nom TEXT NOT NULL,
  categorie_juridique TEXT,  -- ⬅️ Stocke le code 4 chiffres (ex: "5470")
  date_creation DATE,
  code_naf TEXT,
  code_postal TEXT,
  ...
);
```

### Exemple de données :

| SIRET | Nom | categorie_juridique | Interprétation |
|-------|-----|---------------------|----------------|
| 12345678900012 | ACME SARL | **5499** | SARL classique |
| 98765432100023 | PULSE SAS | **5710** | SAS |
| 11122233344455 | CABINET XYZ | **5485** | SELARL |
| 55566677788899 | IMMOBILIER ABC | **6540** | SCI |

---

## 🔄 Comment Ajouter de Nouvelles Données (Chaque Semaine)

### Méthode 1 : Via l'API Edge Function (Recommandé)

Vous avez déjà une fonction : `import-nouveaux-sites-csv`

**URL** : `https://[VOTRE-PROJECT].supabase.co/functions/v1/import-nouveaux-sites-csv`

**Format CSV attendu** :

```csv
siret,nom,date_creation,est_siege,categorie_juridique,code_naf,adresse,code_postal,ville,latitude,longitude
12345678900012,ACME SARL,2024-01-15,true,5499,62.01Z,"10 rue de Paris",75001,Paris,48.8566,2.3522
98765432100023,PULSE SAS,2024-01-20,true,5710,62.02Z,"20 avenue Victor Hugo",69001,Lyon,45.7640,4.8357
```

**Appel API** :

```bash
curl -X POST \
  'https://[VOTRE-PROJECT].supabase.co/functions/v1/import-nouveaux-sites-csv' \
  -H 'Authorization: Bearer [VOTRE_ANON_KEY]' \
  -H 'Content-Type: application/json' \
  -d '{
    "entreprises": [
      {
        "siret": "12345678900012",
        "nom": "ACME SARL",
        "categorieJuridiqueUniteLegale": "5499",
        "activitePrincipaleEtablissement": "62.01Z",
        "codePostalEtablissement": "75001",
        "libelleCommuneEtablissement": "Paris",
        ...
      }
    ]
  }'
```

### Méthode 2 : Import SQL Direct

**Fichier** : `import-nouveaux-sites.sql`

```sql
-- Insertion de nouvelles entreprises
INSERT INTO public.nouveaux_sites (
  siret,
  nom,
  date_creation,
  categorie_juridique,  -- ⬅️ Code 4 chiffres
  code_naf,
  adresse,
  code_postal,
  ville,
  latitude,
  longitude
) VALUES
  ('12345678900012', 'ACME SARL', '2024-01-15', '5499', '62.01Z', '10 rue de Paris', '75001', 'Paris', 48.8566, 2.3522),
  ('98765432100023', 'PULSE SAS', '2024-01-20', '5710', '62.02Z', '20 avenue Victor Hugo', '69001', 'Lyon', 45.7640, 4.8357),
  ('11122233344455', 'CABINET XYZ', '2024-01-25', '5485', '69.20Z', '5 boulevard Saint-Germain', '75005', 'Paris', 48.8534, 2.3488)
ON CONFLICT (siret) DO UPDATE SET
  nom = EXCLUDED.nom,
  categorie_juridique = EXCLUDED.categorie_juridique,
  date_creation = EXCLUDED.date_creation,
  updated_at = now();
```

**Exécution** :

```bash
# Via psql
psql -h [HOST] -U postgres -d postgres -f import-nouveaux-sites.sql

# Ou via Supabase Dashboard
# SQL Editor → Coller le SQL → Run
```

### Méthode 3 : Script TypeScript Automatisé

**Créer** : `scripts/import-weekly-data.ts`

```typescript
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as csv from 'csv-parser';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function importWeeklyData(csvFilePath: string) {
  const results: any[] = [];
  
  fs.createReadStream(csvFilePath)
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', async () => {
      console.log(`📊 ${results.length} entreprises à importer`);
      
      for (const row of results) {
        const { error } = await supabase
          .from('nouveaux_sites')
          .upsert({
            siret: row.siret,
            nom: row.nom,
            categorie_juridique: row.categorie_juridique, // ⬅️ Code 4 chiffres
            code_naf: row.code_naf,
            code_postal: row.code_postal,
            ville: row.ville,
            latitude: parseFloat(row.latitude),
            longitude: parseFloat(row.longitude),
            date_creation: row.date_creation,
          }, {
            onConflict: 'siret'
          });
        
        if (error) console.error(`❌ Erreur ${row.siret}:`, error);
        else console.log(`✅ ${row.nom} importé`);
      }
    });
}

// Utilisation
importWeeklyData('./data/nouvelles-entreprises-semaine-05.csv');
```

**Exécution** :

```bash
npm install csv-parser
ts-node scripts/import-weekly-data.ts
```

---

## 📁 Workflow Hebdomadaire Recommandé

### 1. Préparation des données (Lundi)

1. Téléchargez les nouvelles entreprises INSEE
2. Formatez en CSV avec ces colonnes **obligatoires** :
   - `siret` (14 chiffres)
   - `nom` (raison sociale)
   - `categorie_juridique` (**4 chiffres** - ex: 5499, 5710, 6540)
   - `code_naf` (ex: 62.01Z)
   - `code_postal`
   - `ville`
   - `latitude` / `longitude` (optionnel mais recommandé)
   - `date_creation` (format: YYYY-MM-DD)

### 2. Validation (Lundi)

```bash
# Vérifier les codes juridiques
cat nouvelles-entreprises.csv | cut -d',' -f5 | sort | uniq

# ✅ Tous les codes doivent être dans cette liste :
# 5195, 5202, 5203, 5306, 5307, 5308, 5309, 5370, 5385, 5410, 5415,
# 5443, 5451, 5453, 5455, 5458, 5459, 5460, 5470, 5485, 5498, 5499,
# 5505, 5510, 5515, 5543, 5551, 5552, 5553, 5555, 5558, 5559, 5560,
# 5570, 5585, 5599, 5605, 5610, 5615, 5643, 5651, 5652, 5653, 5655,
# 5658, 5659, 5660, 5670, 5685, 5699, 5710, 5770, 5785, 5800, 6210,
# 6220, 6511, 6558, 6560, 6561, 6562, 6563, 6564, 6565, 6566, 6567,
# 6568, 6569, 6571, 6572, 6573, 6574, 6575, 6576, 6577, 6578, 6585,
# 6589, 6901
```

### 3. Import (Lundi soir)

```bash
# Méthode au choix
ts-node scripts/import-weekly-data.ts
# OU
psql -f import-semaine-05.sql
```

### 4. Vérification (Mardi matin)

```sql
-- Compter les nouvelles entrées
SELECT 
  DATE(created_at) as date_import,
  COUNT(*) as nombre
FROM nouveaux_sites
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY DATE(created_at)
ORDER BY date_import DESC;

-- Vérifier les catégories juridiques
SELECT 
  categorie_juridique,
  COUNT(*) as nombre
FROM nouveaux_sites
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY categorie_juridique
ORDER BY nombre DESC;
```

---

## ⚠️ Points Importants

### ✅ Codes Validés pour B2B

Votre whitelist B2B accepte **79 codes** (voir `b2bLegalCategoryWhitelist.ts`) :

- Toutes les sociétés commerciales (5xxx)
- Sociétés civiles professionnelles (65xx)
- GIE (62xx)

### ❌ Codes à Exclure

- **1xxx** : Entrepreneurs individuels (sauf si B2C)
- **7xxx** : Administration publique
- **8xxx** : Mutuelles, sécurité sociale
- **9xxx** : Associations, fondations

### 🔄 Mise à Jour des Codes

Si l'INSEE ajoute de nouveaux codes :

1. Modifiez `/src/utils/categoriesJuridiques.ts`
2. Ajoutez dans `CATEGORIES_JURIDIQUES_NIVEAU_III`
3. Ajoutez dans `b2bLegalCategoryWhitelist.ts` si B2B

---

## 📞 Besoin d'Aide ?

- **Documentation INSEE** : https://www.insee.fr/fr/information/2028129
- **Classification officielle** : Septembre 2022
- **Fichiers sources** : `/src/utils/categoriesJuridiques.ts`

Prêt pour vos imports hebdomadaires ! 🚀
