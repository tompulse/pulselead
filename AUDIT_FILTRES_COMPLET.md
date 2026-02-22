# 📊 AUDIT COMPLET DES FILTRES PULSE

Date: 2026-02-22

---

## 1. BACKEND / RPC SUPABASE

### 🔧 Fonctions RPC

#### **Fonction principale: `get_nouveaux_sites_filter_counts_dynamic`**

**Fichier:** `supabase/migrations/20260222_add_date_filter_to_rpc.sql`

**Paramètres acceptés:**
```sql
CREATE OR REPLACE FUNCTION get_nouveaux_sites_filter_counts_dynamic(
  p_naf_sections text[] DEFAULT NULL,      -- Ex: ['10', '11']
  p_naf_divisions text[] DEFAULT NULL,     -- Ex: ['4111', '4711']
  p_departments text[] DEFAULT NULL,       -- Ex: ['01', '75', '69']
  p_categories_juridiques text[] DEFAULT NULL,
  p_types_etablissement text[] DEFAULT NULL, -- Ex: ['siege', 'site']
  p_search_query text DEFAULT NULL,        -- Recherche textuelle
  p_date_from text DEFAULT NULL,           -- Format: 'YYYY-MM-DD'
  p_date_to text DEFAULT NULL              -- Format: 'YYYY-MM-DD'
)
```

**Calcul des filtres:**

1. **Dates:**
```sql
-- Parser le format DD/MM/YYYY en base vers YYYY-MM-DD en paramètre
AND (p_date_from IS NULL OR 
     TO_DATE(date_creation, 'DD/MM/YYYY') >= TO_DATE(p_date_from, 'YYYY-MM-DD'))
AND (p_date_to IS NULL OR 
     TO_DATE(date_creation, 'DD/MM/YYYY') <= TO_DATE(p_date_to, 'YYYY-MM-DD'))
```

2. **Départements:**
```sql
-- Normalisation avec format 01-09 (2 chiffres)
COALESCE(
  CASE 
    WHEN LENGTH(TRIM(departement)) = 2 THEN TRIM(departement)
    WHEN LENGTH(TRIM(departement)) = 1 THEN LPAD(TRIM(departement), 2, '0')
    ELSE NULL
  END,
  CASE 
    WHEN LENGTH(TRIM(code_postal)) = 4 THEN '0' || LEFT(TRIM(code_postal), 1)
    WHEN LENGTH(TRIM(code_postal)) >= 5 THEN LEFT(TRIM(code_postal), 2)
    ELSE NULL
  END
) as dept
```

3. **Secteurs NAF:**
```sql
-- Extraction et nettoyage des codes NAF
LEFT(REPLACE(REPLACE(code_naf, '.', ''), ' ', ''), 2) as naf_section
-- Ex: '47.11B' -> '47'
```

**Retour de la fonction:**
```json
{
  "nafSections": {"10": 150, "11": 80, "47": 320},
  "nafDivisions": {"4711": 120, "4719": 200},
  "departments": {"01": 45, "75": 890, "69": 230},
  "typesEtablissement": {"siege": 500, "site": 1200}
}
```

**Tri et pagination:**
- ❌ **Pas de tri** dans le RPC (uniquement des compteurs)
- ❌ **Pas de pagination** dans le RPC (retourne tous les compteurs)
- ✅ Le tri et la pagination sont gérés côté client

---

## 2. FRONTEND

### 📁 Architecture des fichiers

```
src/
├── services/
│   └── nouveauxSitesService.ts          # Service principal de fetch
├── hooks/
│   ├── useAvailableNouveauxSitesFilters.ts  # Hook RPC compteurs
│   └── useAvailableCategoriesCount.ts       # Compteurs catégories
├── components/dashboard/
│   ├── NafFilters.tsx                   # Composant filtres
│   └── NouveauxSitesListView.tsx       # Liste des prospects
└── views/
    └── ProspectsViewContainer.tsx       # Container principal
```

### 🔄 Flux de données

#### **1. Service: `nouveauxSitesService.ts`**

**Fonction principale:** `fetchNouveauxSites(filters, page, pageSize)`

**Construction des paramètres:**

```typescript
interface NouveauxSitesFilters {
  searchQuery?: string;
  nafSections?: string[];           // ['10', '11']
  nafDivisions?: string[];
  departments?: string[];           // ['01', '75']
  categoriesJuridiques?: string[];
  typesEtablissement?: string[];    // ['siege', 'site']
  dateCreationFrom?: string;        // 'YYYY-MM-DD'
  dateCreationTo?: string;          // 'YYYY-MM-DD'
  categories?: string[];            // Catégories détaillées
}
```

**Appel Supabase (filtres SQL):**
```typescript
let query = supabase
  .from('nouveaux_sites')
  .select('*', { count: 'exact' });

// Filtre NAF sections (SQL)
if (filters.nafSections?.length) {
  const conditions = filters.nafSections
    .map(section => `code_naf.like.${section}%`)
    .join(',');
  query = query.or(conditions);
}

// Filtre départements (SQL)
if (filters.departments?.length) {
  query = query.in('departement', filters.departments);
}

// Pagination
query = query.range(
  page * pageSize, 
  (page + 1) * pageSize - 1
);
```

**Filtres côté client:**
```typescript
// Filtre dates (côté client car format DD/MM/YYYY)
if (filters.dateCreationFrom || filters.dateCreationTo) {
  data = data.filter((row: any) => {
    const dateStr = row?.date_creation;
    // Parser DD/MM/YYYY vers Date
    const parts = String(dateStr).split('/');
    const [day, month, year] = parts;
    const rowDate = new Date(
      parseInt(year), 
      parseInt(month) - 1, 
      parseInt(day)
    );
    
    // Comparer avec filtres (format YYYY-MM-DD)
    if (filters.dateCreationFrom) {
      const fromDate = new Date(filters.dateCreationFrom);
      if (rowDate < fromDate) return false;
    }
    // ...
    return true;
  });
}
```

#### **2. Hook: `useAvailableNouveauxSitesFilters.ts`**

**Appel RPC avec dates:**
```typescript
const [contextualResult, globalResult] = await Promise.all([
  supabase.rpc('get_nouveaux_sites_filter_counts_dynamic', {
    p_naf_sections: filters.nafSections?.length ? filters.nafSections : null,
    p_naf_divisions: filters.nafDivisions?.length ? filters.nafDivisions : null,
    p_departments: filters.departments?.length ? filters.departments : null,
    p_types_etablissement: filters.typesEtablissement?.length ? filters.typesEtablissement : null,
    p_search_query: filters.searchQuery?.trim() || null,
    p_date_from: filters.dateCreationFrom || null,  // ✅ FORMAT: 'YYYY-MM-DD'
    p_date_to: filters.dateCreationTo || null       // ✅ FORMAT: 'YYYY-MM-DD'
  })
]);
```

#### **3. Composant: `NafFilters.tsx`**

**Formatage des dates:**
```typescript
import { format } from 'date-fns';

// Utilisateur sélectionne une date dans le Calendar
<Calendar
  mode="single"
  selected={filters.dateCreationFrom ? new Date(filters.dateCreationFrom) : undefined}
  onSelect={(date) => setFilters((prev: any) => ({ 
    ...prev, 
    dateCreationFrom: date ? format(date, "yyyy-MM-dd") : undefined  // ✅ Format ISO
  }))}
/>
```

**Sélection des départements:**
```typescript
// Liste des départements avec format 2 chiffres
const allDepartments = Object.keys(DEPARTMENT_NAMES); // ['01', '02', ..., '95']

// Toggle département
const handleDepartmentToggle = (dept: string) => {
  setFilters((prev: any) => {
    const current = prev.departments || [];
    return {
      ...prev,
      departments: current.includes(dept)
        ? current.filter((d: string) => d !== dept)
        : [...current, dept]
    };
  });
};
```

**Sélection des secteurs NAF:**
```typescript
// Via le composant CategoriesNafSimplifiees
<CategoriesNafSimplifiees
  selectedCategories={filters.categories || []}
  onCategoriesChange={(categories) => setFilters((prev: any) => ({
    ...prev,
    categories: categories,  // Ex: ['alimentaire-boulangerie', 'btp-maconnerie']
    // Les catégories sont converties en codes NAF dans le service
  }))}
/>
```

---

## 3. DONNÉES ATTENDUES

### 📋 Formats exacts

| Donnée | Format Backend (Base) | Format Frontend (Envoi) | Format RPC (Paramètre) |
|--------|----------------------|------------------------|----------------------|
| **Date création** | `DD/MM/YYYY`<br>Ex: `31/12/2025` | `YYYY-MM-DD`<br>Ex: `2025-12-31` | `YYYY-MM-DD`<br>Ex: `2025-12-31` |
| **Département** | 2 chiffres string<br>Ex: `01`, `75` | 2 chiffres string<br>Ex: `01`, `75` | Array de strings<br>Ex: `['01', '75']` |
| **Code NAF** | Avec point<br>Ex: `47.11B` | Nettoyé (sans point)<br>Ex: `4711` | Sections array<br>Ex: `['47']` |
| **Code postal** | 5 chiffres string<br>Ex: `01234` | Inchangé | Non utilisé (on filtre par département) |

### 🗺️ Mapping NAF → Secteurs

**Fichier:** `src/utils/simpleCategories.ts`

```typescript
export const SECTEUR_TO_NAF_SECTIONS: Record<string, string[]> = {
  'Alimentaire': ['10', '11'],
  'BTP & Construction': ['16', '23', '41', '42', '43'],
  'Automobile': ['29', '30', '45'],
  'Commerce & Distribution': ['46', '47'],
  'Hôtellerie & Restauration': ['55', '56'],
  'Transport & Logistique': ['49', '50', '51', '52', '53'],
  'Informatique & Digital': ['58', '59', '60', '61', '62', '63'],
  'Santé & Médical': ['86', '87', '88'],
  'Services personnels': ['95', '96'],
  'Autres': [tous les autres codes]
};
```

**Fonction de conversion:**
```typescript
// src/utils/simpleCategories.ts
export function getSecteurFromNaf(codeNaf: string): string {
  // Nettoyer le code NAF
  const cleanedNaf = codeNaf.replace(/[.\s]/g, '').trim();
  const section = cleanedNaf.substring(0, 2);  // Ex: '4711B' -> '47'
  
  for (const [secteur, sections] of Object.entries(SECTEUR_TO_NAF_SECTIONS)) {
    if (sections.includes(section)) {
      return secteur;
    }
  }
  return 'Autres';
}
```

### 📊 Catégories détaillées

**Fichier:** `src/utils/detailedCategories.ts`

Structure:
```typescript
interface DetailedCategory {
  key: string;              // 'alimentaire-boulangerie'
  label: string;            // 'Boulangerie'
  nafCodes: string[];       // ['10.11', '10.12', '10.13']
  icon: string;
  color: string;
}
```

Exemple:
```typescript
{
  key: 'alimentaire-boulangerie',
  label: 'Boulangerie',
  nafCodes: ['10.11', '10.12', '10.13'],
  icon: '🍞',
  color: 'amber'
}
```

---

## 4. PROCESSUS D'IMPORT ACTUEL

### 📥 Edge Function: `import-nouveaux-sites-csv`

**Fichier:** `supabase/functions/import-nouveaux-sites-csv/index.ts`

#### **Colonnes obligatoires:**

```typescript
{
  siret: string,              // ✅ OBLIGATOIRE - Clé unique
  nom: string,                // ✅ OBLIGATOIRE - Nom entreprise
  date_creation: string,      // ⚠️  RECOMMANDÉ (format DD/MM/YYYY)
  code_postal: string,        // ⚠️  RECOMMANDÉ (pour département)
  ville: string,              // ⚠️  RECOMMANDÉ
  code_naf: string,           // ⚠️  RECOMMANDÉ (pour secteur)
  latitude: number,           // ⚙️  OPTIONNEL (pour carte)
  longitude: number,          // ⚙️  OPTIONNEL (pour carte)
}
```

#### **Processus d'import:**

1. **Parsing des données:**
```typescript
const records = entreprises.map((row: any) => {
  const siret = row.siret?.toString().trim();
  const nom = row.Entreprise?.trim() || row.denominationUsuelleEtablissement?.trim();
  
  // Parser coordonnées Lambert 93 -> WGS84
  const lambertX = parseFloat(row.coordonneeLambertAbscisseEtablissement);
  const lambertY = parseFloat(row.coordonneeLambertOrdonneeEtablissement);
  const coords = lambert93ToWGS84(lambertX, lambertY);
  
  // Parser date DD/MM/YYYY
  const dateStr = row.dateCreationEtablissement;  // Ex: '31/12/2025'
  // ❌ CONSERVÉ en DD/MM/YYYY dans la base (pas de conversion)
  
  return {
    siret,
    nom,
    date_creation: dateStr,           // ✅ Format: DD/MM/YYYY
    code_postal: row.codePostalEtablissement,
    ville: row.libelleCommuneEtablissement,
    code_naf: row.activitePrincipaleEtablissement,  // ✅ Format: 47.11B
    latitude: coords?.lat || null,
    longitude: coords?.lng || null,
  };
});
```

2. **Insertion en base:**
```typescript
// Upsert par chunks de 100
const chunkSize = 100;
for (let i = 0; i < records.length; i += chunkSize) {
  const chunk = records.slice(i, i + chunkSize);
  
  const { error } = await supabase
    .from('nouveaux_sites')
    .upsert(chunk, {
      onConflict: 'siret',  // ✅ Mise à jour si SIRET existe déjà
      ignoreDuplicates: false
    });
}
```

#### **Colonnes automatiques:**

Ces colonnes sont calculées automatiquement:

1. **Département** (depuis code_postal):
```typescript
// Si pas de colonne departement, extrait depuis code_postal
// '01234' -> '01'
// '75001' -> '75'
```

2. **Secteur d'activité** (depuis code_naf):
```typescript
// getCategoryFromNaf('47.11B') -> 'Commerce & Distribution'
```

3. **Coordonnées GPS** (depuis Lambert 93):
```typescript
// lambert93ToWGS84(x, y) -> { lat, lng }
```

---

## 5. SCHÉMA DE LA TABLE `nouveaux_sites`

### 📊 Colonnes principales

```sql
CREATE TABLE nouveaux_sites (
  id BIGINT PRIMARY KEY,
  siret TEXT UNIQUE NOT NULL,
  nom TEXT NOT NULL,
  date_creation TEXT,              -- ⚠️  Format: DD/MM/YYYY
  code_postal TEXT,
  departement TEXT,                -- Format: 2 chiffres ('01', '75')
  commune TEXT,
  ville TEXT,
  adresse TEXT,
  numero_voie TEXT,
  type_voie TEXT,
  libelle_voie TEXT,
  code_naf TEXT,                   -- Format: '47.11B'
  naf_section TEXT,                -- Calculé: '47'
  naf_division TEXT,               -- Calculé: '4711'
  categorie_entreprise TEXT,
  categorie_juridique TEXT,
  categorie_detaillee TEXT,        -- Ex: 'Commerce & Distribution'
  siege TEXT,                      -- ⚠️  Format: 'VRAI'/'FAUX' (TEXT, pas BOOLEAN)
  est_siege BOOLEAN,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  coordonnee_lambert_x DOUBLE PRECISION,
  coordonnee_lambert_y DOUBLE PRECISION,
  archived TEXT,                   -- ⚠️  Format: 'true'/'false' (TEXT, pas BOOLEAN)
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP
);
```

### 🔑 Index importants

```sql
-- Index pour les filtres
CREATE INDEX idx_nouveaux_sites_code_naf ON nouveaux_sites(code_naf);
CREATE INDEX idx_nouveaux_sites_departement ON nouveaux_sites(departement);
CREATE INDEX idx_nouveaux_sites_code_postal ON nouveaux_sites(code_postal);
CREATE INDEX idx_nouveaux_sites_siret ON nouveaux_sites(siret);

-- Index pour la recherche
CREATE INDEX idx_nouveaux_sites_nom ON nouveaux_sites USING gin(nom gin_trgm_ops);
CREATE INDEX idx_nouveaux_sites_commune ON nouveaux_sites USING gin(commune gin_trgm_ops);
```

---

## 6. PROBLÈMES IDENTIFIÉS ET RÉSOLUS

### ✅ Corrections appliquées

| Problème | Solution | Fichiers modifiés |
|----------|----------|-------------------|
| **Dates non filtrées dans RPC** | Ajout paramètres `p_date_from/to` + `TO_DATE()` | `20260222_add_date_filter_to_rpc.sql` |
| **Départements 01-09 mal formatés** | `LPAD(..., 2, '0')` pour padding | `FIX_FILTRES_COMPLET.sql` |
| **Codes NAF avec points/espaces** | `REPLACE(REPLACE(code_naf, '.', ''), ' ', '')` | Tous les RPC |
| **Dates côté client** | Parser DD/MM/YYYY en JavaScript | `nouveauxSitesService.ts` |

### ⚠️  Points d'attention

1. **Format date_creation**: TOUJOURS en `DD/MM/YYYY` dans la base
2. **Type `archived`**: TEXT ('true'/'false'), pas BOOLEAN
3. **Type `siege`**: TEXT ('VRAI'/'FAUX'), pas BOOLEAN
4. **Département**: TOUJOURS 2 chiffres avec zéro devant

---

## 7. SCHÉMA COMPLET DU FLUX

```
┌─────────────────────────────────────────────────────────────────┐
│ UTILISATEUR                                                      │
│                                                                  │
│ Sélectionne:                                                     │
│ - Secteur: "Alimentaire"                                         │
│ - Département: "01 - Ain"                                        │
│ - Dates: 01/01/2025 → 31/01/2025                               │
└─────────────────┬───────────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────────┐
│ FRONTEND (NafFilters.tsx)                                        │
│                                                                  │
│ Formatage:                                                       │
│ - Secteur → ['10', '11'] (nafSections)                          │
│ - Département → ['01'] (departments)                             │
│ - Dates → dateCreationFrom: '2025-01-01'                        │
│          dateCreationTo: '2025-01-31'                           │
└─────────────────┬───────────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────────┐
│ SERVICE (nouveauxSitesService.ts)                                │
│                                                                  │
│ Appel Supabase:                                                  │
│ - .from('nouveaux_sites')                                        │
│ - .or('code_naf.like.10%,code_naf.like.11%')                   │
│ - .in('departement', ['01'])                                     │
│ - Filtre dates côté client (parse DD/MM/YYYY)                   │
└─────────────────┬───────────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────────┐
│ RPC (get_nouveaux_sites_filter_counts_dynamic)                   │
│                                                                  │
│ Calcule compteurs dynamiques:                                    │
│ - Filtre dates: TO_DATE(date_creation, 'DD/MM/YYYY')           │
│ - Filtre départements: LPAD avec format 01-09                   │
│ - Filtre NAF: LEFT(REPLACE(code_naf, '.', ''), 2)              │
│                                                                  │
│ Retourne: {nafSections, departments, ...}                        │
└─────────────────┬───────────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────────┐
│ AFFICHAGE                                                        │
│                                                                  │
│ - Liste prospects filtrés                                        │
│ - Compteurs mis à jour                                          │
│ - Total cohérent avec les filtres                               │
└─────────────────────────────────────────────────────────────────┘
```

---

## 8. CHECKLIST IMPORT DE DONNÉES

Pour que les filtres fonctionnent correctement:

- [ ] SIRET présent et unique
- [ ] Nom d'entreprise renseigné
- [ ] Date création au format **DD/MM/YYYY** (ex: `31/12/2025`)
- [ ] Code postal à 5 chiffres (ex: `01234`, pas `1234`)
- [ ] Code NAF avec point (ex: `47.11B`)
- [ ] Département au format 2 chiffres (ex: `01`, pas `1`)
- [ ] Coordonnées GPS (optionnel mais recommandé)
- [ ] Colonne `archived` = NULL ou `'false'` (TEXT)
- [ ] Colonne `siege` = `'VRAI'` ou `'FAUX'` (TEXT)

---

**Audit réalisé le 2026-02-22**
**Version: 2.0**
**Status: ✅ Tous les filtres opérationnels**
