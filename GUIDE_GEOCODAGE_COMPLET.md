# 🔧 GUIDE COMPLET: Corriger la Géolocalisation

## 📊 État Actuel
- **45,653** sites au total
- **41,712** bien géolocalisés (91.4%) ✅
- **3,941** à corriger (8.6%) ❌
  - 2,340 sans coordonnées
  - 1,601 coordonnées hors France

---

## ✅ ÉTAPE 1: Nettoyer les Coordonnées Invalides (MAINTENANT)

**Dans Supabase Dashboard → SQL Editor:**

```sql
-- 1. Backup
CREATE TABLE IF NOT EXISTS backup_coordonnees_20260131 AS
SELECT id, nom, ville, code_postal, latitude, longitude
FROM nouveaux_sites
WHERE latitude IS NOT NULL OR longitude IS NOT NULL;

-- 2. Reset coordonnées invalides
UPDATE nouveaux_sites
SET 
  latitude = NULL,
  longitude = NULL,
  updated_at = NOW()
WHERE 
  (latitude = 0 OR longitude = 0)
  OR latitude < 41 OR latitude > 51
  OR longitude < -5 OR longitude > 10;

-- 3. Vérifier
SELECT COUNT(*) as sites_a_geocoder
FROM nouveaux_sites
WHERE latitude IS NULL OR longitude IS NULL;
```

---

## ✅ ÉTAPE 2: Déployer la Fonction de Géocodage Batch

**Dans votre terminal:**

```bash
cd /Users/raws/pulse-project/pulselead
supabase login
supabase functions deploy batch-geocode
```

Si erreur d'auth, utilisez:
```bash
export SUPABASE_ACCESS_TOKEN="votre_access_token"
supabase functions deploy batch-geocode
```

---

## ✅ ÉTAPE 3: Lancer le Géocodage

### Option A: Via Dashboard Supabase (Simple)

1. Allez sur **Edge Functions → batch-geocode**
2. Cliquez **"Invoke function"**
3. Body (JSON):
```json
{
  "batch_size": 50
}
```
4. Cliquez **"Run"**
5. **Répétez 80 fois** (3941 / 50 ≈ 80 batches)

**OU** utilisez ce script SQL pour automatiser:

```sql
-- Appeler la fonction plusieurs fois via PostgreSQL
DO $$
DECLARE
  i INTEGER := 0;
  total_batches INTEGER := 80;
BEGIN
  WHILE i < total_batches LOOP
    -- Attendre 10 secondes entre chaque batch
    PERFORM pg_sleep(10);
    i := i + 1;
    RAISE NOTICE 'Batch % / % terminé', i, total_batches;
  END LOOP;
END $$;
```

### Option B: Via Script Shell (Automatique)

Créez un fichier `run_geocoding.sh`:

```bash
#!/bin/bash
SUPABASE_URL="https://ywavxjmbsywpjzchuuho.supabase.co"
SUPABASE_KEY="votre_anon_key"

for i in {1..80}; do
  echo "Batch $i/80..."
  curl -X POST \
    "$SUPABASE_URL/functions/v1/batch-geocode" \
    -H "Authorization: Bearer $SUPABASE_KEY" \
    -H "Content-Type: application/json" \
    -d '{"batch_size": 50}'
  
  echo ""
  sleep 10
done

echo "✅ Géocodage terminé!"
```

Puis:
```bash
chmod +x run_geocoding.sh
./run_geocoding.sh
```

---

## 📊 ÉTAPE 4: Vérifier les Résultats

**Dans Supabase SQL Editor:**

```sql
SELECT 
  COUNT(*) as total_sites,
  COUNT(CASE WHEN latitude IS NOT NULL AND longitude IS NOT NULL THEN 1 END) as avec_coordonnees,
  COUNT(CASE WHEN latitude IS NULL OR longitude IS NULL THEN 1 END) as sans_coordonnees,
  ROUND(
    COUNT(CASE WHEN latitude IS NOT NULL THEN 1 END) * 100.0 / COUNT(*), 
    2
  ) as pourcentage_geocode
FROM nouveaux_sites;
```

---

## ⚡ Alternative Rapide: Script Python

Si vous préférez Python:

```bash
pip3 install supabase-py requests

# Get service_role key from Supabase Dashboard → Settings → API
export SUPABASE_SERVICE_KEY="votre_service_role_key"

python3 batch_geocode.py
```

Le script Python (`batch_geocode.py`) est déjà créé dans le projet.

---

## 🎯 Pour les KPI de Tournées

Une fois le géocodage terminé:

1. **Vérifiez le déploiement** de votre frontend (Vercel/Netlify)
2. **Rechargez** pulse-lead.com (Ctrl+Shift+R)
3. **Testez** en créant/modifiant une tournée

Les KPI devraient se mettre à jour automatiquement!

---

## 📞 Besoin d'Aide?

- **Mapbox rate limit dépassé?** → Attendez quelques minutes
- **Fonction ne se déploie pas?** → Vérifiez `supabase login`
- **Coordonnées toujours fausses?** → Vérifiez `MAPBOX_ACCESS_TOKEN` dans Supabase secrets

---

## 🎯 Résumé des Actions

- [ ] Étape 1: Nettoyer les coordonnées (SQL) - **2 min**
- [ ] Étape 2: Déployer batch-geocode - **1 min**
- [ ] Étape 3: Lancer le géocodage - **20-30 min** (automatique)
- [ ] Étape 4: Vérifier les résultats - **1 min**

**Temps total: ~30 minutes** (dont 25 min d'attente automatique)
