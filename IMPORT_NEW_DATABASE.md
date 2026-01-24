# 📦 IMPORT NOUVELLE BASE DE DONNÉES

**Date**: 24 janvier 2026  
**Période**: 1er décembre 2025 - 24 janvier 2026  
**Source**: CSV `nouveaux-sites.csv` (45 669 entreprises)

---

## ✅ CE QUI A ÉTÉ FAIT

### 1. 📊 Analyse du CSV

| Métrique | Valeur |
|----------|--------|
| **Total entreprises** | 45 669 |
| **Sans géocodage** | 2 330 (5,1%) |
| **Département le + représenté** | 75 (Paris) - 4 525 entreprises |
| **Catégories entreprise** | PME (38 660), ETI (1 020), GE (525) |
| **Sections NAF** | Toutes sections A à Z |

### 2. 🔧 Migration SQL créée

**Fichier**: `supabase/migrations/20260124_add_new_database_columns.sql`

Ajoute les colonnes manquantes :
- `section_naf` (TEXT) : Section NAF lettre A-Z
- `categorie_entreprise` (TEXT) : PME, ETI ou GE

### 3. 🐍 Script Python d'import

**Fichier**: `import_new_database.py`

Fonctionnalités :
- ✅ Backup automatique table `entreprises` → `entreprises_backup`
- ✅ Géocodage automatique des 2 330 adresses manquantes (API Data Gouv gratuite)
- ✅ Conversion coordonnées Lambert 93 → GPS
- ✅ Import par batch (100 entreprises à la fois)
- ✅ Upsert sur conflit SIRET (pas de doublons)
- ✅ Stats et progression en temps réel

---

## 🚀 PROCÉDURE D'IMPORT

### Étape 1: Appliquer la migration SQL

**Dans Supabase SQL Editor** :

```sql
-- Ajout colonnes section_naf et categorie_entreprise
ALTER TABLE public.entreprises 
ADD COLUMN IF NOT EXISTS section_naf TEXT,
ADD COLUMN IF NOT EXISTS categorie_entreprise TEXT CHECK (categorie_entreprise IN ('PME', 'ETI', 'GE'));

-- Index pour les nouveaux filtres
CREATE INDEX IF NOT EXISTS idx_entreprises_section_naf ON public.entreprises(section_naf);
CREATE INDEX IF NOT EXISTS idx_entreprises_categorie_entreprise ON public.entreprises(categorie_entreprise);
CREATE INDEX IF NOT EXISTS idx_entreprises_filters ON public.entreprises(code_postal, section_naf, categorie_entreprise, date_demarrage);

-- Commentaires
COMMENT ON COLUMN public.entreprises.section_naf IS 'Section NAF (lettre A-Z selon la nomenclature INSEE)';
COMMENT ON COLUMN public.entreprises.categorie_entreprise IS 'Catégorie d''entreprise selon l''effectif: PME, ETI ou GE';
```

### Étape 2: Installer dépendances Python

```bash
cd /Users/raws/pulse-project/pulselead
pip3 install supabase requests python-dateutil
```

### Étape 3: Exporter la service_role_key

**Dans Supabase Dashboard** → Settings → API :

```bash
export SUPABASE_SERVICE_KEY='eyJ...'  # Ta service_role_key (pas anon key)
```

### Étape 4: Lancer l'import

```bash
python3 import_new_database.py
```

**Durée estimée** : 10-15 minutes (avec géocodage)

---

## ⚠️ POINTS D'ATTENTION

### 1. Relation avec tournées/CRM

**Question** : Si je supprime une entreprise de la DB, est-elle supprimée des tournées/actions CRM ?

**Réponse** :
- ✅ **Tournées** : NON - Les IDs sont stockés en array (`entreprises_ids`), l'entreprise reste dans la tournée même si supprimée de la DB
- ❌ **CRM Actions** : OUI - `ON DELETE CASCADE` sur `lead_interactions` et `tournee_visites`

**Mais dans ton cas** : Tu vas **remplacer** les données, pas supprimer des entreprises. L'upsert se fait sur `SIRET` donc :
- Si SIRET existe → **UPDATE** (données rafraîchies)
- Si SIRET nouveau → **INSERT** (nouvelle entreprise)

→ **Aucun risque pour les données utilisateurs !**

### 2. Filtres dynamiques

Les filtres sont déjà configurés pour être **100% dynamiques** :
- ✅ Aucun département/catégorie à 0 n'est affiché si aucune entreprise
- ✅ Double compteur (contextuel / global) pour l'UX
- ✅ Fonction RPC `get_nouveaux_sites_filter_counts_dynamic`

**⚠️ MAIS** : Cette fonction pointe vers la table `nouveaux_sites`, pas `entreprises` !

### 3. Migration nécessaire des RPC functions

**TODO après import** : Créer/modifier les RPC functions pour pointer vers `entreprises` avec les bonnes colonnes (`section_naf`, `categorie_entreprise`).

---

## 📝 APRÈS L'IMPORT

### 1. Vérifier les données

```sql
-- Compter les entreprises importées
SELECT COUNT(*) FROM entreprises WHERE date_demarrage >= '2025-12-01';

-- Vérifier les géolocalisations
SELECT 
  COUNT(*) as total,
  COUNT(latitude) as geocoded,
  ROUND(COUNT(latitude) * 100.0 / COUNT(*), 2) as pct_geocoded
FROM entreprises
WHERE date_demarrage >= '2025-12-01';

-- Vérifier les catégories
SELECT categorie_entreprise, COUNT(*) 
FROM entreprises 
WHERE date_demarrage >= '2025-12-01'
GROUP BY categorie_entreprise;

-- Vérifier les sections NAF
SELECT section_naf, COUNT(*) 
FROM entreprises 
WHERE date_demarrage >= '2025-12-01'
GROUP BY section_naf 
ORDER BY section_naf;
```

### 2. Supprimer le backup (si tout OK)

```sql
DROP TABLE IF EXISTS public.entreprises_backup CASCADE;
```

### 3. Tester les filtres

- [ ] Départements : affichage correct, compteurs OK
- [ ] Catégories entreprise (PME, ETI, GE) : filtres fonctionnels
- [ ] Sections NAF : hiérarchie complète
- [ ] Carte : géolocalisation affichée
- [ ] Recherche : fonctionne sur nom/adresse/SIRET

---

## 🎨 AUTO-AUDIT UX/UI

### Desktop (>1280px)
- [ ] Landing page : sections alternées (Hero → Features → Social Proof → Pricing → FAQ)
- [ ] Pricing : badges "PLUS POPULAIRE" fixés, hauteur réduite, copywriting optimisé
- [ ] Dashboard : accès fluide après sélection plan (Free/PRO)
- [ ] Filtres : affichage cohérent, pas de catégories vides

### Tablet (768px - 1280px)
- [ ] Navigation responsive
- [ ] Cards adaptées (2 colonnes)
- [ ] Formulaires centrés
- [ ] Sidebar collapsible

### Mobile (<768px)
- [ ] Menu hamburger
- [ ] Cards 1 colonne
- [ ] CTAs pleine largeur
- [ ] Pricing stacked verticalement
- [ ] Filtres dans drawer/modal

---

## 🐛 PROBLÈMES CONNUS

### 1. Dashboard pas accessible après sélection plan

**Symptôme** : "Oups, une erreur est survenue" après clic sur plan FREE/PRO

**Cause** : Code orphelin référençant `OnboardingWizard` et `showWizard` (composants supprimés)

**Fix** : ✅ Corrigé dans commit `af810c8` (19h36)

### 2. RPC functions pointent vers `nouveaux_sites`

**Symptôme** : Après import dans `entreprises`, les filtres ne fonctionnent pas

**Cause** : Hooks `useAvailableNouveauxSitesFilters` et RPC `get_nouveaux_sites_filter_counts_dynamic` pointent vers la mauvaise table

**Fix** : À faire après import → Créer nouvelle RPC ou modifier pour unifier les tables

---

## 🎯 PROCHAINES ÉTAPES

1. ✅ Appliquer migration SQL (colonnes `section_naf`, `categorie_entreprise`)
2. ✅ Lancer script Python `import_new_database.py`
3. ⏳ Vérifier les données dans Supabase (SQL checks)
4. ⏳ Créer/modifier RPC functions pour unifier `entreprises` et `nouveaux_sites`
5. ⏳ Tester filtres frontend (départements, NAF, catégories entreprise)
6. ⏳ Auto-audit UX/UI (Desktop, Tablet, Mobile)
7. ⏳ Deploy final sur Render

---

## 💡 NOTES TECHNIQUES

### Géocodage API Data Gouv

- **URL** : `https://api-adresse.data.gouv.fr/search/`
- **Gratuite** : Oui, sans limite (rate limiting soft: 1 req/100ms)
- **Précision** : ~95% pour adresses complètes

### Conversion Lambert 93 → GPS

- **Projection** : RGF93 / Lambert-93 (EPSG:2154)
- **Output** : WGS84 (EPSG:4326)
- **Précision** : ±10m pour France métropolitaine

### Catégories entreprise

| Catégorie | Effectifs | CSV Code |
|-----------|-----------|----------|
| PME | < 250 | PM, PME |
| ETI | 250 - 4 999 | ET, ETI |
| GE | ≥ 5 000 | GE |

### Sections NAF

Mapping code NAF (XX.XXZ) → Section lettre (A-Z) :
- **A** : Agriculture (01-03)
- **C** : Industrie manufacturière (10-33)
- **F** : Construction (41-43)
- **G** : Commerce (45-47)
- **J** : Information & communication (58-63)
- *... etc (voir script Python)*

---

**Questions ?** Ping @raws
