# 🔧 FIX: Problème de géolocalisation et KPI

## 🔴 Problèmes identifiés

1. **Coordonnées GPS invalides:**
   - Sites en Espagne au lieu de France
   - Sites à Paris géolocalisés à 200km
   - Coordonnées hors France métropolitaine

2. **KPI ne se mettent pas à jour:**
   - Nécessite déploiement du code corrigé

---

## ✅ SOLUTION ÉTAPE PAR ÉTAPE

### 1. Diagnostic de la Base de Données

**Dans Supabase Dashboard SQL Editor, exécutez:**

```sql
-- Voir l'étendue du problème
SELECT 
  COUNT(*) as total_sites,
  COUNT(CASE WHEN latitude IS NULL OR longitude IS NULL THEN 1 END) as sans_coordonnees,
  COUNT(CASE WHEN latitude < 41 OR latitude > 51 OR longitude < -5 OR longitude > 10 THEN 1 END) as hors_france
FROM nouveaux_sites;
```

### 2. Nettoyer les Coordonnées Invalides

**Exécutez le script `FIX_GPS_COORDINATES.sql`:**

```bash
# OU copiez-collez dans Supabase SQL Editor
```

Ce script va:
- ✅ Créer un backup des coordonnées actuelles
- ✅ Réinitialiser toutes les coordonnées hors France à NULL
- ✅ Lister les sites à régéocoder

### 3. Régéocoder les Sites

**Option A: Via Script Python (Recommandé pour grand volume)**

```bash
# Installer les dépendances
pip3 install supabase-py requests

# Définir la clé service_role (Dashboard → Settings → API)
export SUPABASE_SERVICE_KEY="votre_service_role_key"

# Lancer le géocodage
python3 batch_geocode.py
```

**Option B: Via Edge Function (Pour petits volumes)**

Dans le Dashboard, créez une fonction qui appelle `geocode-entreprise` pour chaque site.

### 4. Vérifier les Résultats

```sql
-- Après géocodage
SELECT 
  COUNT(*) as total,
  COUNT(CASE WHEN latitude BETWEEN 41 AND 51 
             AND longitude BETWEEN -5 AND 10 THEN 1 END) as coordonnees_valides_france,
  ROUND(
    COUNT(CASE WHEN latitude BETWEEN 41 AND 51 
               AND longitude BETWEEN -5 AND 10 THEN 1 END) * 100.0 / COUNT(*), 
    2
  ) as pourcentage_valide
FROM nouveaux_sites
WHERE latitude IS NOT NULL AND longitude IS NOT NULL;
```

---

## 📋 Fichiers Créés

1. **CHECK_GPS_QUALITY.sql** - Diagnostic des coordonnées
2. **FIX_GPS_COORDINATES.sql** - Nettoyage et réinitialisation
3. **BATCH_GEOCODE.sql** - Fonctions SQL pour géocodage
4. **batch_geocode.py** - Script Python pour géocodage massif

---

## ⚠️ Limites Mapbox

- **Gratuit:** 100,000 requêtes/mois
- **Rate limit:** ~600 req/min
- Le script Python inclut un délai de 0.1s entre requêtes

---

## 🎯 Pour les KPI de Tournées

Le code de recalcul automatique des KPI est déjà poussé sur GitHub.

**Vérifiez que le déploiement est terminé:**
- Vercel: https://vercel.com/dashboard
- Netlify: https://app.netlify.com/

Puis rechargez pulse-lead.com (Ctrl+Shift+R)

---

## 🆘 Si Problème

**Coordonnées toujours invalides après géocodage:**
- Vérifiez que `MAPBOX_ACCESS_TOKEN` est bien configuré dans Supabase
- Testez manuellement: `https://api.mapbox.com/geocoding/v5/mapbox.places/Paris,%20France.json?access_token=VOTRE_TOKEN&country=FR`

**Script Python ne marche pas:**
- Vérifiez `SUPABASE_SERVICE_KEY` (pas l'anon key!)
- Dashboard → Settings → API → service_role key (secret)
