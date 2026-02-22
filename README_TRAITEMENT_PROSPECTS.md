# 🚀 Traitement des 9000 Nouveaux Prospects

## Vue d'ensemble

Suite à l'ajout de 9000 nouveaux prospects, ces scripts permettent de:
- ✅ Corriger les codes postaux (4 chiffres → 5 chiffres avec 0 devant)
- 📍 Géocoder les adresses (latitude/longitude)
- 🏢 Assigner les secteurs d'activité selon le code NAF
- 📅 Valider les dates de création

---

## 🎯 Méthode Recommandée: SQL (RAPIDE)

Pour traiter **tous les prospects en quelques secondes** directement dans la base de données:

### Étape 1: Ajouter la colonne secteur_activite

```bash
psql $DATABASE_URL -f ADD_SECTEUR_ACTIVITE_COLUMN.sql
```

### Étape 2: Corriger les codes postaux

```bash
psql $DATABASE_URL -f FIX_CODES_POSTAUX.sql
```

### Étape 3: Assigner les secteurs d'activité

```bash
psql $DATABASE_URL -f UPDATE_ALL_SECTEURS.sql
```

### Résultat

Tous les prospects auront:
- ✅ Code postal corrigé (01234 au lieu de 1234)
- ✅ Secteur d'activité assigné selon code NAF
- 📊 Statistiques affichées

---

## 🐍 Méthode Alternative: Python (AVEC GÉOCODAGE)

Si vous voulez **aussi géocoder** les adresses (ajouter latitude/longitude):

### Prérequis

```bash
pip install supabase requests
```

### Configuration

```bash
export SUPABASE_URL="https://ywavxjmbsywpjzchuuho.supabase.co"
export SUPABASE_SERVICE_KEY="votre_service_role_key"
```

Optionnel (pour géocodage Mapbox direct):
```bash
export MAPBOX_TOKEN="votre_token_mapbox"
```

### Exécution

```bash
python3 process_new_prospects.py
```

### Ce que fait le script Python

1. **Récupère les prospects** par batches de 100
2. **Corrige les codes postaux** (4 chiffres → 5 chiffres)
3. **Valide les dates** de création
4. **Assigne le secteur** d'activité selon NAF
5. **Géocode les adresses** via Mapbox ou Edge Function Supabase
6. **Met à jour** chaque prospect dans la base

---

## 📊 Secteurs d'Activité (Mapping NAF)

Le système attribue automatiquement un secteur selon le code NAF:

| Secteur | Sections NAF | Exemples |
|---------|--------------|----------|
| **Alimentaire** | 10, 11 | Boulangeries, Brasseries |
| **BTP & Construction** | 16, 23, 41, 42, 43 | Maçonnerie, Électricité, Plomberie |
| **Automobile** | 29, 30, 45 | Garages, Concessionnaires |
| **Commerce & Distribution** | 46, 47 | Supermarchés, Commerce de détail |
| **Hôtellerie & Restauration** | 55, 56 | Hôtels, Restaurants |
| **Transport & Logistique** | 49, 50, 51, 52, 53 | Transport routier, Entreposage |
| **Informatique & Digital** | 58-63 | Dev logiciels, Hébergement web |
| **Santé & Médical** | 86, 87, 88 | Médecins, EHPAD, Action sociale |
| **Services personnels** | 95, 96 | Coiffeurs, Réparation |
| **Autres** | Tout le reste | Industries diverses, Services B2B |

---

## ✅ Vérifications

### Vérifier les codes postaux corrigés

```sql
SELECT 
    code_postal,
    COUNT(*) as nombre,
    MIN(commune) as exemple_commune
FROM nouveaux_sites
WHERE code_postal LIKE '0%'
  AND (archived IS NULL OR archived != 'true')
GROUP BY code_postal
ORDER BY code_postal
LIMIT 20;
```

### Vérifier les secteurs assignés

```sql
SELECT 
    secteur_activite,
    COUNT(*) as nombre_prospects,
    ROUND(100.0 * COUNT(*) / (SELECT COUNT(*) FROM nouveaux_sites WHERE archived IS NULL OR archived != 'true'), 2) as pourcentage
FROM nouveaux_sites
WHERE (archived IS NULL OR archived != 'true')
GROUP BY secteur_activite
ORDER BY nombre_prospects DESC;
```

### Vérifier le géocodage

```sql
SELECT 
    'Total prospects' as info,
    COUNT(*) as total,
    COUNT(CASE WHEN latitude IS NOT NULL AND longitude IS NOT NULL THEN 1 END) as avec_gps,
    COUNT(CASE WHEN latitude IS NULL OR longitude IS NULL THEN 1 END) as sans_gps,
    ROUND(100.0 * COUNT(CASE WHEN latitude IS NOT NULL THEN 1 END) / COUNT(*), 2) as pourcentage_geocode
FROM nouveaux_sites
WHERE (archived IS NULL OR archived != 'true');
```

---

## 🎯 Workflow Complet Recommandé

```bash
# 1. Ajouter la colonne secteur (si pas déjà fait)
psql $DATABASE_URL -f ADD_SECTEUR_ACTIVITE_COLUMN.sql

# 2. Corriger les codes postaux en SQL (instantané)
psql $DATABASE_URL -f FIX_CODES_POSTAUX.sql

# 3. Assigner les secteurs en SQL (instantané)
psql $DATABASE_URL -f UPDATE_ALL_SECTEURS.sql

# 4. Géocoder avec Python (si nécessaire, prend du temps)
export SUPABASE_SERVICE_KEY="votre_key"
python3 process_new_prospects.py
```

---

## 📝 Notes Importantes

### Codes Postaux
- Les codes à **4 chiffres** sont automatiquement corrigés avec un **0 devant**
- Exemple: `1234` → `01234` (département Ain)
- Les codes à **5 chiffres** restent inchangés
- Les codes invalides sont nettoyés (caractères non numériques supprimés)

### Géocodage
- Utilise **Mapbox Geocoding API** (si token configuré)
- Sinon utilise **l'Edge Function Supabase** `geocode-entreprise`
- Limite: **50 requêtes/seconde** (Mapbox)
- Le script ajoute une pause de 0.1s entre chaque requête
- Seules les adresses **en France métropolitaine** sont validées (lat: 41-51.5, lng: -5.5-10)

### Dates
- Format attendu: `DD/MM/YYYY` ou `YYYY-MM-DD`
- Les dates invalides sont ignorées
- Années acceptées: **1800-2026**

### Performance
- **SQL**: Traite **tous les prospects en quelques secondes** ⚡
- **Python**: Environ **10 prospects/seconde** avec géocodage 🐌
- Pour 9000 prospects: SQL = 5 sec, Python = 15 minutes

---

## 🆘 Dépannage

### Erreur "SUPABASE_SERVICE_KEY non définie"
```bash
export SUPABASE_SERVICE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Erreur "Module 'supabase' non installé"
```bash
pip install supabase requests
```

### Géocodage ne fonctionne pas
- Vérifier que l'Edge Function `geocode-entreprise` existe
- Ou configurer `MAPBOX_TOKEN`

### Database connection failed
- Vérifier que `$DATABASE_URL` est défini
- Utiliser la connection string Supabase

---

## 📧 Support

Pour toute question, vérifier les logs SQL ou Python pour identifier les erreurs.
