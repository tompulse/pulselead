# 📥 Guide d'Import CSV - Nouveaux Sites

## 🎯 Structure CSV Exacte Attendue

Votre fichier CSV doit contenir ces colonnes **avec les noms EXACTS** suivants :

### ✅ Colonnes Obligatoires

| Nom de la colonne | Type | Exemple | Description |
|-------------------|------|---------|-------------|
| `siret` | Texte (14 chiffres) | `12345678900012` | **OBLIGATOIRE** - Identifiant unique |
| `Entreprise` OU `denominationUsuelleEtablissement` | Texte | `ACME SARL` | **OBLIGATOIRE** - Nom de l'entreprise |
| `codePostalEtablissement` | Texte (5 chiffres) | `75001` | Code postal |
| `libelleCommuneEtablissement` | Texte | `PARIS` | Nom de la ville |

### 📋 Colonnes Recommandées

| Nom de la colonne | Type | Exemple | Description |
|-------------------|------|---------|-------------|
| `categorieJuridiqueUniteLegale` | Texte (4 chiffres) | `5499` | **IMPORTANT** - Code juridique INSEE |
| `activitePrincipaleEtablissement` | Texte | `62.01Z` | Code NAF de l'établissement |
| `activitePrincipaleUniteLegale` | Texte | `62.01Z` | Code NAF de l'unité légale (fallback) |
| `dateCreationEtablissement` | Date (DD/MM/YYYY) | `15/01/2024` | Date de création |
| `etablissementSiege` | Texte | `VRAI` ou `FAUX` | Est-ce le siège social ? |
| `categorieEntreprise` | Texte | `PME` | Taille : GE, ETI, PME |

### 🗺️ Colonnes pour l'Adresse Complète

| Nom de la colonne | Type | Exemple | Description |
|-------------------|------|---------|-------------|
| `numeroVoieEtablissement` | Texte | `10` | Numéro de rue |
| `typeVoieEtablissement` | Texte | `RUE` | Type (RUE, AVE, BD, etc.) |
| `libelleVoieEtablissement` | Texte | `DE PARIS` | Nom de la voie |
| `complementAdresseEtablissement` | Texte | `Bâtiment A` | Complément |

### 📍 Colonnes pour la Géolocalisation

| Nom de la colonne | Type | Exemple | Description |
|-------------------|------|---------|-------------|
| `coordonneeLambertAbscisseEtablissement` | Nombre | `652432.5` | Coordonnée Lambert X |
| `coordonneeLambertOrdonneeEtablissement` | Nombre | `6862432.1` | Coordonnée Lambert Y |

> ⚠️ **Important** : Les coordonnées Lambert 93 seront **automatiquement converties** en latitude/longitude WGS84.

---

## 📄 Exemple de Fichier CSV Complet

```csv
siret,Entreprise,categorieJuridiqueUniteLegale,activitePrincipaleEtablissement,codePostalEtablissement,libelleCommuneEtablissement,numeroVoieEtablissement,typeVoieEtablissement,libelleVoieEtablissement,dateCreationEtablissement,etablissementSiege,categorieEntreprise,coordonneeLambertAbscisseEtablissement,coordonneeLambertOrdonneeEtablissement
12345678900012,ACME SARL,5499,62.01Z,75001,PARIS,10,RUE,DE PARIS,15/01/2024,VRAI,PME,652432.5,6862432.1
98765432100023,PULSE SAS,5710,62.02Z,69001,LYON,20,AVE,VICTOR HUGO,20/01/2024,VRAI,PME,842123.4,6518765.2
11122233344455,CABINET XYZ SELARL,5485,69.20Z,75005,PARIS,5,BD,SAINT GERMAIN,25/01/2024,VRAI,PME,652890.3,6862123.7
```

---

## 📄 Exemple Minimal (Colonnes Obligatoires Uniquement)

Si vous n'avez pas toutes les données, le minimum requis :

```csv
siret,Entreprise,categorieJuridiqueUniteLegale,activitePrincipaleEtablissement,codePostalEtablissement,libelleCommuneEtablissement
12345678900012,ACME SARL,5499,62.01Z,75001,PARIS
98765432100023,PULSE SAS,5710,62.02Z,69001,LYON
11122233344455,CABINET XYZ,5485,69.20Z,75005,PARIS
```

---

## 🚀 Méthodes d'Import

### Méthode 1️⃣ : Via l'API Edge Function (Recommandée)

**URL** : `https://[VOTRE-PROJECT].supabase.co/functions/v1/import-nouveaux-sites-csv`

**Exemple avec curl** :

```bash
curl -X POST \
  'https://YOUR_PROJECT.supabase.co/functions/v1/import-nouveaux-sites-csv' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "entreprises": [
      {
        "siret": "12345678900012",
        "Entreprise": "ACME SARL",
        "categorieJuridiqueUniteLegale": "5499",
        "activitePrincipaleEtablissement": "62.01Z",
        "codePostalEtablissement": "75001",
        "libelleCommuneEtablissement": "PARIS",
        "numeroVoieEtablissement": "10",
        "typeVoieEtablissement": "RUE",
        "libelleVoieEtablissement": "DE PARIS",
        "dateCreationEtablissement": "15/01/2024",
        "etablissementSiege": "VRAI",
        "categorieEntreprise": "PME",
        "coordonneeLambertAbscisseEtablissement": 652432.5,
        "coordonneeLambertOrdonneeEtablissement": 6862432.1
      }
    ],
    "batchIndex": 0,
    "totalBatches": 1
  }'
```

**Import par lot** (recommandé pour > 1000 entreprises) :

```javascript
// Script Node.js pour import par lots
const fs = require('fs');
const csv = require('csv-parser');

const BATCH_SIZE = 500;
let batch = [];
let batchIndex = 0;

fs.createReadStream('nouveaux-sites.csv')
  .pipe(csv())
  .on('data', (row) => {
    batch.push(row);
    
    if (batch.length >= BATCH_SIZE) {
      sendBatch(batch, batchIndex);
      batch = [];
      batchIndex++;
    }
  })
  .on('end', () => {
    if (batch.length > 0) {
      sendBatch(batch, batchIndex);
    }
  });

async function sendBatch(entreprises, index) {
  const response = await fetch(
    'https://YOUR_PROJECT.supabase.co/functions/v1/import-nouveaux-sites-csv',
    {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer YOUR_ANON_KEY',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        entreprises,
        batchIndex: index,
        totalBatches: Math.ceil(totalRows / BATCH_SIZE)
      })
    }
  );
  
  const result = await response.json();
  console.log(`Batch ${index}: ${result.inserted} insérés`);
}
```

### Méthode 2️⃣ : Import SQL Direct

**Créer un fichier** : `import-nouveaux-sites.sql`

```sql
INSERT INTO public.nouveaux_sites (
  siret,
  nom,
  categorie_juridique,
  code_naf,
  code_postal,
  ville,
  adresse,
  numero_voie,
  type_voie,
  libelle_voie,
  date_creation,
  est_siege,
  categorie_entreprise,
  latitude,
  longitude
) VALUES
  ('12345678900012', 'ACME SARL', '5499', '62.01Z', '75001', 'PARIS', '10 RUE DE PARIS', '10', 'RUE', 'DE PARIS', '2024-01-15', true, 'PME', 48.8566, 2.3522),
  ('98765432100023', 'PULSE SAS', '5710', '62.02Z', '69001', 'LYON', '20 AVE VICTOR HUGO', '20', 'AVE', 'VICTOR HUGO', '2024-01-20', true, 'PME', 45.7640, 4.8357),
  ('11122233344455', 'CABINET XYZ', '5485', '69.20Z', '75005', 'PARIS', '5 BD SAINT GERMAIN', '5', 'BD', 'SAINT GERMAIN', '2024-01-25', true, 'PME', 48.8534, 2.3488)
ON CONFLICT (siret) DO UPDATE SET
  nom = EXCLUDED.nom,
  categorie_juridique = EXCLUDED.categorie_juridique,
  code_naf = EXCLUDED.code_naf,
  updated_at = now();
```

**Exécution** via Supabase Dashboard :
1. Ouvrir **SQL Editor**
2. Coller votre SQL
3. Cliquer sur **Run**

---

## 🔄 Traitement Automatique

### Ce qui est fait automatiquement par l'import :

✅ **Conversion des coordonnées** : Lambert 93 → WGS84 (lat/lng)  
✅ **Reconstruction de l'adresse** : Concaténation des éléments d'adresse  
✅ **Catégorie détaillée** : Dérivée du code NAF (BTP, Transport, etc.)  
✅ **Validation** : SIRET obligatoire, coordonnées dans les limites France  
✅ **Upsert** : Mise à jour si SIRET existe déjà  
✅ **Calcul NAF** : naf_section, naf_division, naf_groupe, naf_classe (automatique via trigger)

### Ce qui est calculé après l'import (via migrations) :

```sql
-- Les colonnes NAF sont automatiquement calculées
naf_section = SUBSTRING(code_naf FROM 1 FOR 1)      -- ex: '6' de '62.01Z'
naf_division = SUBSTRING(code_naf FROM 1 FOR 2)     -- ex: '62' de '62.01Z'
naf_groupe = SUBSTRING(code_naf FROM 1 FOR 3)       -- ex: '620' de '62.01Z'
naf_classe = SUBSTRING(code_naf FROM 1 FOR 4)       -- ex: '6201' de '62.01Z'
```

---

## ✅ Checklist de Validation Avant Import

- [ ] Le fichier est encodé en **UTF-8**
- [ ] Les SIRET font **exactement 14 chiffres**
- [ ] Les codes postaux font **exactement 5 chiffres**
- [ ] Les codes juridiques sont **4 chiffres** parmi [les 79 codes valides](./codes_juridiques_insee.txt)
- [ ] Les codes NAF sont au format **XX.XXX** (ex: 62.01Z)
- [ ] Les dates sont au format **DD/MM/YYYY** (ex: 15/01/2024)
- [ ] `etablissementSiege` est soit **"VRAI"** soit **"FAUX"**
- [ ] Pas de doublons de SIRET dans le fichier
- [ ] Les coordonnées Lambert sont valides (X: 100000-1300000, Y: 6000000-7200000)

---

## 🛠️ Script de Validation CSV (Python)

```python
import pandas as pd

def validate_csv(filepath):
    df = pd.read_csv(filepath, dtype=str)
    errors = []
    
    # Vérification colonnes obligatoires
    required = ['siret', 'Entreprise']
    for col in required:
        if col not in df.columns:
            errors.append(f"❌ Colonne manquante : {col}")
    
    # Validation SIRET
    invalid_siret = df[~df['siret'].str.match(r'^\d{14}$', na=False)]
    if not invalid_siret.empty:
        errors.append(f"❌ {len(invalid_siret)} SIRET invalides (doivent être 14 chiffres)")
    
    # Validation code postal
    if 'codePostalEtablissement' in df.columns:
        invalid_cp = df[~df['codePostalEtablissement'].str.match(r'^\d{5}$', na=False)]
        if not invalid_cp.empty:
            errors.append(f"⚠️ {len(invalid_cp)} codes postaux invalides")
    
    # Validation catégorie juridique
    valid_codes = ['5195','5202','5203','5306','5307','5308','5309','5370','5385',
                   '5410','5415','5443','5451','5453','5455','5458','5459','5460',
                   '5470','5485','5498','5499','5505','5510','5515','5543','5551',
                   '5552','5553','5555','5558','5559','5560','5570','5585','5599',
                   '5605','5610','5615','5643','5651','5652','5653','5655','5658',
                   '5659','5660','5670','5685','5699','5710','5770','5785','5800',
                   '6210','6220','6511','6558','6560','6561','6562','6563','6564',
                   '6565','6566','6567','6568','6569','6571','6572','6573','6574',
                   '6575','6576','6577','6578','6585','6589','6901']
    
    if 'categorieJuridiqueUniteLegale' in df.columns:
        invalid_cat = df[~df['categorieJuridiqueUniteLegale'].isin(valid_codes)]
        if not invalid_cat.empty:
            errors.append(f"⚠️ {len(invalid_cat)} catégories juridiques non reconnues")
    
    # Rapport
    if errors:
        print("\n".join(errors))
        return False
    else:
        print(f"✅ Fichier valide : {len(df)} lignes")
        return True

# Utilisation
validate_csv('nouveaux-sites.csv')
```

---

## 📊 Vérification Post-Import

Après l'import, exécutez cette requête SQL pour vérifier :

```sql
-- Statistiques globales
SELECT 
  COUNT(*) as total_sites,
  COUNT(DISTINCT categorie_juridique) as nb_codes_juridiques,
  COUNT(CASE WHEN latitude IS NOT NULL THEN 1 END) as avec_coordonnees,
  COUNT(CASE WHEN code_naf IS NOT NULL THEN 1 END) as avec_naf,
  COUNT(CASE WHEN date_creation IS NOT NULL THEN 1 END) as avec_date
FROM nouveaux_sites
WHERE created_at >= NOW() - INTERVAL '1 hour';

-- Top 10 catégories juridiques importées
SELECT 
  categorie_juridique,
  COUNT(*) as nombre
FROM nouveaux_sites
WHERE created_at >= NOW() - INTERVAL '1 hour'
GROUP BY categorie_juridique
ORDER BY nombre DESC
LIMIT 10;
```

---

## 🆘 Troubleshooting

### Erreur : "duplicate key value violates unique constraint"
➡️ **Solution** : Un SIRET existe déjà. L'import fait un `UPSERT` automatique (mise à jour).

### Erreur : "No valid records to insert"
➡️ **Solution** : Vérifiez que `siret` et `Entreprise` (ou `denominationUsuelleEtablissement`) sont bien remplis.

### Coordonnées NULL dans la base
➡️ **Solution** : Les coordonnées Lambert étaient invalides ou hors limites France métropolitaine.

### Catégorie juridique = "Non spécifié"
➡️ **Solution** : Le code n'était pas dans la colonne `categorieJuridiqueUniteLegale` ou était invalide.

---

## 📞 Support

Pour toute question sur l'import :
- Voir le guide complet : `GUIDE_CATEGORIES_JURIDIQUES.md`
- Liste des codes valides : `codes_juridiques_insee.txt`
- Fonction d'import : `supabase/functions/import-nouveaux-sites-csv/index.ts`

✨ **Prêt pour vos imports hebdomadaires !**
