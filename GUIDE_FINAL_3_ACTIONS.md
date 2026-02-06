# ✅ GUIDE FINAL: 3 Actions à Faire

## 🎯 ACTIONS À FAIRE MAINTENANT

### 1️⃣ Vérifier la Qualité GPS (2 min)

**Dans Supabase Dashboard → SQL Editor:**

```sql
-- Exécutez tout le contenu de VERIFY_GPS_QUALITY.sql
-- Ça va vous montrer:
-- - Statistiques globales
-- - Coordonnées par département
-- - Sites avec coordonnées suspectes
-- - Vérification spécifique Paris
-- - Sites avec coordonnées identiques
```

Ouvrez `VERIFY_GPS_QUALITY.sql` et exécutez tout.

**Dites-moi les résultats!** Notamment:
- Combien de sites avec coordonnées identiques?
- Les coordonnées de Paris sont-elles cohérentes?

---

### 2️⃣ Ajouter la Colonne updated_at (1 min)

**Dans Supabase Dashboard → SQL Editor:**

```sql
-- Ajouter les colonnes updated_at et triggers
ALTER TABLE tournees ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE nouveaux_sites ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_tournees_updated_at ON tournees;
CREATE TRIGGER update_tournees_updated_at
    BEFORE UPDATE ON tournees
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_nouveaux_sites_updated_at ON nouveaux_sites;
CREATE TRIGGER update_nouveaux_sites_updated_at
    BEFORE UPDATE ON nouveaux_sites
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

---

### 3️⃣ Attendre le Déploiement et Tester (5 min)

**Le code est poussé sur GitHub.** Attendez 2-3 minutes que le build se termine.

Puis:

1. **Rechargez pulse-lead.com** (Ctrl+Shift+R)
2. **Ouvrez une tournée existante**
3. **Supprimez un prospect**
4. **Observez:**
   - ✅ Les KPI (distance/temps) se mettent à jour instantanément
   - ✅ Un toast "KPI mis à jour: XX km • XX min" apparaît
   - ✅ La carte se met à jour

---

## 🧪 Test Complet

Pour vérifier que tout fonctionne:

```sql
-- 1. Créer une tournée de test
INSERT INTO tournees (user_id, nom, date_planifiee, entreprises_ids, ordre_optimise, statut)
SELECT 
  'YOUR_USER_ID',
  'Test Recalcul KPI',
  CURRENT_DATE + 1,
  ARRAY(SELECT id FROM nouveaux_sites WHERE latitude IS NOT NULL LIMIT 5),
  ARRAY(SELECT id FROM nouveaux_sites WHERE latitude IS NOT NULL LIMIT 5),
  'planifiee'
RETURNING id;

-- 2. Vérifier qu'elle s'affiche
-- 3. Supprimer un site via l'UI
-- 4. Vérifier que les KPI se recalculent
```

---

## 📊 Checklist Finale

- [ ] **GPS vérifié** avec `VERIFY_GPS_QUALITY.sql`
- [ ] **Colonne updated_at** ajoutée sur tournees et nouveaux_sites
- [ ] **Triggers created** pour auto-update
- [ ] **Code déployé** (GitHub push réussi ✅)
- [ ] **Frontend rechargé** sur pulse-lead.com
- [ ] **Test suppression** → KPI se recalculent ✅

---

## 🎯 Résultat Attendu

Quand vous supprimez un prospect d'une tournée:

1. ⚡ **Suppression instantanée** du prospect de la liste
2. 🔄 **"Recalcul en cours..."** apparaît brièvement
3. ✅ **Toast vert:** "KPI mis à jour: 45.2 km • 78 min"
4. 📊 **Les chiffres en haut** se mettent à jour automatiquement:
   - Arrêts: 6 → 5
   - Distance: 52.3 → 45.2 km
   - Durée: 1h23 → 1h18
5. 🗺️ **La carte** se redessine avec le nouvel itinéraire

---

## ⚠️ Si Ça Ne Marche Toujours Pas

**Ouvrez la console (F12) et regardez:**
- Erreurs rouges?
- Logs `[TourneeDetail]`?
- Erreur 401 sur `calculate-routes`?

**Dites-moi ce que vous voyez!**

---

## 📞 Prochaine Étape

**FAITES L'ACTION 1 (vérification GPS) et donnez-moi les résultats.**

Je vous dirai ensuite si vous devez supprimer d'autres sites mal géolocalisés.
