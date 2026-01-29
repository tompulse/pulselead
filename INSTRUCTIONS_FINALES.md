# 🎯 Instructions Finales - Plan Découverte Réparé

## ✅ Ce qui a été fait

1. **Migration SQL créée** : `supabase/migrations/20260127_fix_free_plan_activation.sql`
2. **Script SQL d'application** : `APPLY_FREE_PLAN_FIX.sql` (à exécuter manuellement)
3. **Documentation** : `PLAN_DECOUVERTE_FIX.md` (guide complet)
4. **Nettoyage** : Suppression des fichiers SQL temporaires

## 🚀 Étapes Suivantes (À FAIRE MAINTENANT)

### Étape 1 : Appliquer le correctif SQL

**Option A : Via l'éditeur SQL Supabase (RECOMMANDÉ)**

1. Ouvre [Supabase Dashboard](https://supabase.com/dashboard)
2. Va dans **SQL Editor**
3. Copie le contenu du fichier `APPLY_FREE_PLAN_FIX.sql`
4. Colle-le dans l'éditeur
5. Clique sur "Run" (Exécuter)
6. Vérifie qu'il n'y a pas d'erreur

**Option B : Via Supabase CLI (si tu veux)**

```bash
# Fix la migration qui a des problèmes d'abord
cd /Users/raws/pulse-project/pulselead

# Ensuite applique toutes les migrations
supabase db push --include-all
```

### Étape 2 : Tester le flux complet

#### Test avec un nouveau compte

1. **Ouvre un navigateur en mode incognito**
2. **Va sur ton app** (localhost ou prod)
3. **Inscris-toi avec un nouvel email**
4. **Confirme l'email**
5. **Tu arrives sur `/plan-selection`**
6. **Clique sur "Commencer gratuitement"**
7. ✅ **Tu dois arriver sur `/dashboard` sans erreur**
8. ✅ **Tu vois "30 prospects" et "2 tournées" dans le header**

#### Test du déblocage de prospects

1. **Va dans "Nouveaux Sites"**
2. **Clique sur une entreprise**
3. **Le SIRET et l'adresse sont floutés avec un cadenas 🔒**
4. **Clique sur "Débloquer ce prospect"**
5. ✅ **Les infos se dévoilent**
6. ✅ **Le compteur passe à "1/30 prospects"**

#### Test des limites

1. **Débloque 30 prospects** (ou simule en modifiant la DB)
2. **Essaie d'en débloquer un 31ème**
3. ✅ **Un modal d'upgrade vers PRO s'affiche**

### Étape 3 : Commit et push

Une fois que tout fonctionne :

```bash
git add .
git commit -m "fix: réparer le plan découverte FREE - accès direct après confirmation email"
git push origin main
```

## 📁 Fichiers Créés

- ✅ `APPLY_FREE_PLAN_FIX.sql` - Script SQL à exécuter
- ✅ `PLAN_DECOUVERTE_FIX.md` - Documentation complète
- ✅ `INSTRUCTIONS_FINALES.md` - Ce fichier
- ✅ `supabase/migrations/20260127_fix_free_plan_activation.sql` - Migration

## 🗑️ Fichiers Supprimés

- ❌ `CHECK_TABLE_STRUCTURE.sql`
- ❌ `CREATE_ACTIVATE_FREE_PLAN.sql`
- ❌ `FIX_API_SCHEMA.sql`
- ❌ `FIX_FREE_USER.sql`
- ❌ `FIX_SIMPLE.sql`
- ❌ `FORCE_REFRESH_SCHEMA.sql`

## 🎯 Résultat Final Attendu

### Flux Utilisateur

```
1. Inscription → Confirmation email
   ↓
2. Redirection vers /plan-selection
   ↓
3. Clic "Commencer gratuitement"
   ↓
4. ✅ Redirection vers /dashboard (sans erreur!)
   ↓
5. Plan FREE actif (30 prospects, 2 tournées)
```

### Interface Dashboard

```
┌─────────────────────────────────────────────────┐
│ 📊 PULSE                          30/30 | 2/2   │
├─────────────────────────────────────────────────┤
│                                                 │
│  Nouveaux Sites                                 │
│  ┌───────────────────────────────────────┐     │
│  │ 🏢 Entreprise ABC                     │     │
│  │ 📍 Adresse: ████████ 🔒 (Verrouillé)  │     │
│  │ 🔢 SIRET: ████████ 🔒 (Verrouillé)   │     │
│  │ 📋 Code NAF: 47.11B (visible)         │     │
│  │ [Débloquer ce prospect]               │     │
│  └───────────────────────────────────────┘     │
│                                                 │
└─────────────────────────────────────────────────┘
```

## 🐛 En cas de Problème

### Problème : La fonction `activate_free_plan` n'existe pas

**Solution** : Exécute `APPLY_FREE_PLAN_FIX.sql` dans l'éditeur SQL Supabase

### Problème : Boucle de redirection entre `/plan-selection` et `/dashboard`

**Solution** : Vérifie que `is_first_login = false` après le clic sur "Commencer gratuitement"

```sql
-- Dans Supabase SQL Editor
SELECT user_id, plan_type, is_first_login 
FROM user_quotas 
WHERE user_id = 'TON_USER_ID';

-- Si is_first_login est toujours true, fixe-le :
UPDATE user_quotas 
SET is_first_login = false 
WHERE user_id = 'TON_USER_ID';
```

### Problème : Les quotas ne s'incrémentent pas

**Solution** : Vérifie les noms de colonnes

```sql
-- Vérifier la structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'user_quotas';

-- Tu dois voir :
-- prospects_unlocked_count (int)
-- tournees_created_count (int)
```

## 📞 Support

Si tu as des problèmes :

1. Vérifie les logs dans la console du navigateur (F12)
2. Vérifie les logs dans Supabase Dashboard > Logs
3. Consulte `PLAN_DECOUVERTE_FIX.md` pour plus de détails

## ✨ C'est Tout !

Une fois le script SQL exécuté, le plan découverte devrait fonctionner parfaitement. 🎉

---

**Prochaine étape** : Exécuter `APPLY_FREE_PLAN_FIX.sql` dans Supabase SQL Editor
