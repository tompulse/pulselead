# ⚡ ACTION IMMÉDIATE - Réparer "Database error saving new user"

## 🎯 Problème Actuel

❌ **"Erreur de connexion - Database error saving new user"** lors de l'inscription

## ✅ Solution en 2 Étapes (3 minutes)

### Étape 1 : Exécuter le Script SQL (2 min)

1. **Ouvre Supabase Dashboard**
   ```
   https://supabase.com/dashboard
   ```

2. **Va dans SQL Editor** (menu gauche)

3. **Copie TOUT le contenu** du fichier `FIX_SIMPLE_TRIGGER.sql`

4. **Colle dans l'éditeur et clique "Run"**

5. **Vérifie le résultat** :
   ```
   ✅ "Trigger désactivé - Les quotas seront créés par activate_free_plan()"
   ✅ "RLS configuré pour permettre toutes les opérations"
   ```

---

### Étape 2 : Tester l'Inscription (1 min)

1. **Supprime l'utilisateur test** (si erreur avant)
   ```sql
   -- Exécute dans SQL Editor si tu avais essayé avant
   DELETE FROM auth.users WHERE email = 'test@example.com';
   ```

2. **Ouvre un navigateur incognito**

3. **Va sur ton app et inscris-toi**

4. **✅ Résultat attendu** :
   - Inscription réussie (pas d'erreur!)
   - Redirection vers `/plan-selection`
   - Tu vois les 2 plans

5. **Clique "Commencer gratuitement"**

6. **✅ Résultat attendu** :
   - Redirection vers `/dashboard`
   - Toast "🎉 Bienvenue sur PULSE FREE !"
   - Header : "30 prospects | 2 tournées"

---

## 🔧 Ce Qui a Été Fait

### Code TypeScript Modifié ✅
- `src/pages/PlanSelection.tsx`
- Fallback renforcé pour créer les quotas côté client
- Gestion d'erreurs améliorée

### Scripts SQL Créés ✅
- `FIX_SIMPLE_TRIGGER.sql` - **À EXÉCUTER EN PREMIER**
- `FIX_DATABASE_ERROR.sql` - Alternative (si problème)
- `SOLUTION_ERREUR_DATABASE.md` - Documentation complète

---

## 🐛 Si Problème Persiste

### Erreur "activate_free_plan is not defined"

```sql
-- Exécute AUSSI ce script
-- (contenu de APPLY_FREE_PLAN_FIX.sql)
```

### Erreur "Permission denied"

```sql
-- Désactive RLS complètement
ALTER TABLE user_quotas DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions DISABLE ROW LEVEL SECURITY;
```

### Aucune des solutions ne marche

1. Envoie-moi les logs de la console (F12)
2. Envoie-moi le message d'erreur complet
3. Vérifie les logs Supabase (Dashboard > Logs)

---

## 📋 Checklist Rapide

- [ ] Script `FIX_SIMPLE_TRIGGER.sql` exécuté
- [ ] Inscription testée sans erreur
- [ ] Dashboard accessible
- [ ] Quotas affichés (30 prospects, 2 tournées)

---

## 👉 COMMENCE ICI

**1. Ouvre `FIX_SIMPLE_TRIGGER.sql`**  
**2. Copie tout le contenu**  
**3. Exécute dans Supabase SQL Editor**  
**4. Teste l'inscription**

**Temps total : 3 minutes**

---

**Fichiers importants** :
- ✅ `FIX_SIMPLE_TRIGGER.sql` - **COMMENCE PAR CELUI-CI**
- 📖 `SOLUTION_ERREUR_DATABASE.md` - Documentation détaillée
- 🔧 `FIX_DATABASE_ERROR.sql` - Solution alternative
