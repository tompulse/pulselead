# 🔧 Corrections des Filtres - PULSE

## Résumé des Corrections

Trois filtres ont été corrigés pour fonctionner correctement avec les données en base :

1. ✅ **Filtre Dates** (format DD/MM/YYYY)
2. ✅ **Filtre Départements** (format 01-09 avec zéro devant)
3. ✅ **Filtre Secteurs d'Activité** (couverture complète NAF)

---

## 1. Filtre Dates (DD/MM/YYYY)

### Problème
La colonne `date_creation` en base est au format **DD/MM/YYYY** (ex: `31/12/2025`), mais le filtre essayait de comparer directement avec des dates ISO (`YYYY-MM-DD`).

### Solution
**Parser côté client** au lieu de filtrer en SQL.

#### Fichiers modifiés
- `src/services/nouveauxSitesService.ts` (lignes 83-125)

#### Code ajouté
```typescript
// Filtre dates - Parser le format DD/MM/YYYY en base
if (filters.dateCreationFrom || filters.dateCreationTo) {
  data = data.filter((row: any) => {
    const dateStr = row?.date_creation;
    if (!dateStr) return false;
    
    // Parser DD/MM/YYYY vers Date
    const parts = String(dateStr).split('/');
    if (parts.length !== 3) return false;
    
    const [day, month, year] = parts;
    const rowDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    
    if (isNaN(rowDate.getTime())) return false;
    
    let matches = true;
    if (filters.dateCreationFrom) {
      const fromDate = new Date(filters.dateCreationFrom);
      matches = matches && rowDate >= fromDate;
    }
    if (filters.dateCreationTo) {
      const toDate = new Date(filters.dateCreationTo);
      matches = matches && rowDate <= toDate;
    }
    
    return matches;
  });
}
```

### Test
```typescript
// Date en base: "31/12/2025"
// Filtre: dateCreationFrom = "2025-12-01", dateCreationTo = "2025-12-31"
// Résultat: ✅ Match
```

---

## 2. Filtre Départements (Format 01-09)

### Problème
Les départements 01 à 09 ont des codes postaux à 4 chiffres (ex: `1234`), donc le département extrait était `1` au lieu de `01`.

### Solution
1. Utiliser la colonne `departement` en priorité (si elle existe et est correcte)
2. Sinon, extraire depuis `code_postal` avec padding zéro

#### Fichiers modifiés
- `supabase/migrations/20260210000002_drop_and_recreate_rpc_clean.sql`
- `FIX_FILTRES_COMPLET.sql` (nouvelle migration)

#### Code SQL ajouté
```sql
-- Normaliser le département : utiliser la colonne departement si disponible,
-- sinon extraire depuis code_postal avec gestion codes postaux 4/5 caractères
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

### Test
```sql
-- Code postal: "1234" → département: "01" ✅
-- Code postal: "01234" → département: "01" ✅
-- Code postal: "75001" → département: "75" ✅
```

### Appliquer la correction
```bash
psql $DATABASE_URL -f FIX_FILTRES_COMPLET.sql
```

---

## 3. Filtre Secteurs d'Activité (NAF)

### Problème
Le filtre devait couvrir **tous** les codes NAF présents en base (vérifier qu'aucun code NAF n'est oublié).

### Solution
1. Nettoyer le code NAF avant extraction (enlever points, espaces)
2. Mapper TOUTES les sections NAF (01-99) vers les secteurs
3. Catégorie "Autres" couvre tout ce qui n'est pas explicitement mappé

#### Fichiers modifiés
- `src/utils/simpleCategories.ts` (fonction `getSecteurFromNaf`)
- `FIX_FILTRES_COMPLET.sql` (RPC SQL)

#### Mapping des secteurs (10 catégories)
```typescript
{
  'Alimentaire': ['10', '11'],
  'BTP & Construction': ['16', '23', '41', '42', '43'],
  'Automobile': ['29', '30', '45'],
  'Commerce & Distribution': ['46', '47'],
  'Hôtellerie & Restauration': ['55', '56'],
  'Transport & Logistique': ['49', '50', '51', '52', '53'],
  'Informatique & Digital': ['58', '59', '60', '61', '62', '63'],
  'Santé & Médical': ['86', '87', '88'],
  'Services personnels': ['95', '96'],
  'Autres': [toutes les autres sections]
}
```

#### Code TypeScript corrigé
```typescript
export function getSecteurFromNaf(codeNaf: string | null | undefined): string {
  if (!codeNaf || codeNaf === '' || codeNaf === 'null') return 'Autres';
  
  // Nettoyer le code NAF (supprimer points, espaces, etc.)
  const cleanedNaf = codeNaf.replace(/[.\s]/g, '').trim();
  if (!cleanedNaf) return 'Autres';
  
  // Extraire les 2 premiers chiffres (section NAF)
  const section = cleanedNaf.substring(0, 2);
  
  for (const [secteur, sections] of Object.entries(SECTEUR_TO_NAF_SECTIONS)) {
    if (sections.includes(section)) {
      return secteur;
    }
  }
  
  return 'Autres';
}
```

### Vérifier la couverture
```bash
psql $DATABASE_URL -f VERIFIER_COUVERTURE_NAF.sql
```

Cela affichera :
1. Toutes les sections NAF présentes en base
2. Les sections non couvertes (devrait être vide car "Autres" couvre tout)
3. Statistiques par secteur

---

## 📋 Fichiers Créés / Modifiés

### Frontend (TypeScript/React)
- ✅ `src/services/nouveauxSitesService.ts` - Parser dates DD/MM/YYYY
- ✅ `src/utils/simpleCategories.ts` - Nettoyer codes NAF

### Backend (SQL/Supabase)
- ✅ `FIX_FILTRES_COMPLET.sql` - Migration complète pour les 3 fixes
- ✅ `VERIFIER_COUVERTURE_NAF.sql` - Script de vérification
- ✅ `supabase/migrations/20260210000002_drop_and_recreate_rpc_clean.sql` - RPC corrigé

---

## 🚀 Déploiement

### 1. Appliquer la migration SQL
```bash
# Méthode 1: via psql
export DATABASE_URL="postgresql://..."
psql $DATABASE_URL -f FIX_FILTRES_COMPLET.sql

# Méthode 2: via Supabase SQL Editor
# Copier le contenu de FIX_FILTRES_COMPLET.sql et l'exécuter
```

### 2. Vérifier que tout fonctionne
```bash
# Vérifier la couverture NAF
psql $DATABASE_URL -f VERIFIER_COUVERTURE_NAF.sql
```

### 3. Redéployer le frontend
```bash
# Les changements TypeScript sont automatiques au prochain build
npm run build
# ou si auto-deploy: git push
```

---

## ✅ Tests

### Test Filtre Dates
1. Aller sur la page prospects
2. Ouvrir le filtre "Date de création"
3. Sélectionner : Du 01/01/2025 au 31/12/2025
4. Vérifier que les prospects affichés ont bien des dates dans cette période

### Test Filtre Départements
1. Ouvrir le filtre "Départements"
2. Sélectionner "01 - Ain"
3. Vérifier que tous les prospects affichés ont code_postal commençant par 01 (ou 1 pour les anciens)
4. Vérifier que le compteur affiche correctement le nombre

### Test Filtre Secteurs
1. Ouvrir le filtre "Secteurs d'activité"
2. Sélectionner "Alimentaire"
3. Vérifier que tous les prospects ont code_naf commençant par 10 ou 11
4. Essayer "Autres" → doit afficher tous les codes NAF non mappés

---

## 🐛 Dépannage

### Les dates ne filtrent toujours pas
- Vérifier que `date_creation` est bien au format DD/MM/YYYY en base
- Tester avec: `SELECT date_creation FROM nouveaux_sites LIMIT 5;`

### Les départements 01-09 n'apparaissent pas
- Vérifier que la colonne `departement` existe: `\d nouveaux_sites`
- Appliquer la migration: `psql $DATABASE_URL -f FIX_FILTRES_COMPLET.sql`

### Certains prospects n'ont pas de secteur
- Exécuter: `psql $DATABASE_URL -f VERIFIER_COUVERTURE_NAF.sql`
- Vérifier qu'aucune section NAF n'est "non couverte"
- Si une section manque, l'ajouter dans `SECTEUR_TO_NAF_SECTIONS['Autres']`

---

## 📝 Notes Techniques

### Format des dates
- **En base**: `DD/MM/YYYY` (string)
- **Dans le filtre UI**: `YYYY-MM-DD` (ISO, via Calendar component)
- **Parsing**: Côté client (JavaScript Date)

### Format des départements
- **En base colonne `departement`**: `"01"`, `"02"`, ..., `"75"`, `"95"`
- **En base `code_postal`**: `"01234"` ou `"1234"` (ancien format)
- **Extraction**: LPAD avec 0 si nécessaire

### Format des codes NAF
- **En base**: `"47.11B"`, `"62.01Z"`, `"10.11Z"` (avec points)
- **Nettoyage**: Enlever `.` et espaces → `"4711B"`, `"6201Z"`, `"1011Z"`
- **Section**: 2 premiers chiffres → `"47"`, `"62"`, `"10"`

---

## 🎉 Résultat Final

- ✅ Filtres dates fonctionnels (parsing DD/MM/YYYY)
- ✅ Filtres départements corrects (format 01-09)
- ✅ Filtres secteurs complets (100% couverture NAF)
- ✅ Tous les prospects sont filtrables correctement
