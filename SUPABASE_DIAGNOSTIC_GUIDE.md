# 🔧 Guide Diagnostic Supabase - PULSE

## 🚨 Problème : "Erreur" lors du clic sur plan FREE/PRO

### Cause Probable
Les **RLS Policies** manquent sur les tables `user_quotas` et `user_unlocked_prospects`, empêchant les utilisateurs authentifiés de mettre à jour leurs propres données.

---

## ✅ Solution : Appliquer la migration RLS

### Étape 1 : Vérifier que la migration existe
```bash
ls -la supabase/migrations/20260123_fix_rls_policies.sql
```

### Étape 2 : Appliquer manuellement dans Supabase Dashboard

1. **Aller sur Supabase Dashboard** : https://supabase.com/dashboard
2. **Sélectionner le projet PULSE**
3. **Aller dans : SQL Editor** (icône dans sidebar)
4. **Copier-coller le contenu de `supabase/migrations/20260123_fix_rls_policies.sql`**
5. **Cliquer sur "Run"**

---

## 🔍 Diagnostic Complet

### 1. Vérifier que les tables existent

```sql
-- Dans SQL Editor Supabase
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('user_quotas', 'user_unlocked_prospects', 'user_subscriptions');
```

**Résultat attendu** : 3 lignes (user_quotas, user_unlocked_prospects, user_subscriptions)

---

### 2. Vérifier que RLS est activé

```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('user_quotas', 'user_unlocked_prospects');
```

**Résultat attendu** : 
- `user_quotas` → `rowsecurity = true`
- `user_unlocked_prospects` → `rowsecurity = true`

---

### 3. Vérifier les policies existantes

```sql
SELECT schemaname, tablename, policyname, permissive, roles, cmd 
FROM pg_policies 
WHERE tablename IN ('user_quotas', 'user_unlocked_prospects')
ORDER BY tablename, policyname;
```

**Résultat attendu** : Plusieurs policies pour chaque table :
- `Users can view own quotas` (SELECT)
- `Users can update own quotas` (UPDATE)
- `Users can insert own quotas` (INSERT)
- `Service role can manage all quotas` (ALL)

---

### 4. Vérifier les permissions GRANT

```sql
SELECT grantee, table_schema, table_name, privilege_type
FROM information_schema.role_table_grants
WHERE table_name IN ('user_quotas', 'user_unlocked_prospects')
  AND grantee IN ('authenticated', 'service_role')
ORDER BY table_name, grantee;
```

**Résultat attendu** : 
- `authenticated` a `SELECT`, `UPDATE`, `INSERT` sur `user_quotas`
- `service_role` a `ALL` sur tout

---

### 5. Tester une requête UPDATE (depuis JS console)

**Dans la console navigateur (F12) sur pulse-lead.com** :

```javascript
// Get current user
const { data: { session } } = await supabase.auth.getSession();
console.log('User ID:', session?.user?.id);

// Try to update quotas
const { data, error } = await supabase
  .from('user_quotas')
  .update({ is_first_login: false })
  .eq('user_id', session?.user?.id)
  .select();

console.log('Update result:', { data, error });
```

**Résultat attendu** : `data` contient l'enregistrement mis à jour, `error` est null

---

## 🛠️ Si les policies manquent, exécuter ceci

```sql
-- =====================================================
-- FIX RLS POLICIES - user_quotas et user_unlocked_prospects
-- =====================================================

-- 1. Enable RLS on user_quotas
ALTER TABLE user_quotas ENABLE ROW LEVEL SECURITY;

-- 2. Enable RLS on user_unlocked_prospects
ALTER TABLE user_unlocked_prospects ENABLE ROW LEVEL SECURITY;

-- 3. Drop existing policies if they conflict
DROP POLICY IF EXISTS "Users can view own quotas" ON user_quotas;
DROP POLICY IF EXISTS "Users can update own quotas" ON user_quotas;
DROP POLICY IF EXISTS "Users can insert own quotas" ON user_quotas;
DROP POLICY IF EXISTS "Service role can manage all quotas" ON user_quotas;

DROP POLICY IF EXISTS "Users can view own unlocked prospects" ON user_unlocked_prospects;
DROP POLICY IF EXISTS "Users can insert own unlocked prospects" ON user_unlocked_prospects;
DROP POLICY IF EXISTS "Service role can manage all unlocked prospects" ON user_unlocked_prospects;

-- 4. Policies for user_quotas
CREATE POLICY "Users can view own quotas" ON user_quotas
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own quotas" ON user_quotas
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own quotas" ON user_quotas
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 5. Policies for user_unlocked_prospects
CREATE POLICY "Users can view own unlocked prospects" ON user_unlocked_prospects
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own unlocked prospects" ON user_unlocked_prospects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 6. Grant permissions to authenticated users
GRANT SELECT, UPDATE, INSERT ON user_quotas TO authenticated;
GRANT SELECT, INSERT ON user_unlocked_prospects TO authenticated;

-- 7. Grant all permissions to service_role
GRANT ALL ON user_quotas TO service_role;
GRANT ALL ON user_unlocked_prospects TO service_role;
```

---

## 📊 Vérifier que le trigger fonctionne

```sql
-- Vérifier que le trigger existe
SELECT 
  trigger_name, 
  event_manipulation, 
  event_object_table, 
  action_statement 
FROM information_schema.triggers 
WHERE trigger_name = 'on_user_created_initialize_quota';
```

**Résultat attendu** : 1 ligne avec `trigger_name = on_user_created_initialize_quota`

---

## 🧪 Test End-to-End

### 1. Créer un compte test
- Aller sur https://pulse-lead.com
- S'inscrire avec un nouvel email (ex: `test+123@example.com`)
- Confirmer l'email

### 2. Vérifier que les quotas ont été créés

```sql
-- Dans SQL Editor (remplacer USER_ID par l'ID du user test)
SELECT * FROM user_quotas WHERE user_id = 'USER_ID';
SELECT * FROM user_subscriptions WHERE user_id = 'USER_ID';
```

**Résultat attendu** :
- `user_quotas` : `plan_type = 'free'`, `is_first_login = true`
- `user_subscriptions` : `plan_type = 'free'`, `subscription_status = 'active'`

### 3. Cliquer sur "Plan Découverte (Gratuit)"

**Résultat attendu** :
- Toast : "🎉 Bienvenue sur PULSE !"
- Redirect vers `/dashboard` après 1 seconde

### 4. Vérifier que `is_first_login` a été mis à false

```sql
SELECT is_first_login FROM user_quotas WHERE user_id = 'USER_ID';
```

**Résultat attendu** : `is_first_login = false`

---

## 🚀 Si tout fonctionne

✅ Les migrations sont appliquées  
✅ Les RLS policies sont actives  
✅ Les utilisateurs peuvent choisir leur plan  
✅ Le flow d'onboarding fonctionne de bout en bout  

**→ PULSE est prêt pour la production !** 🎉

---

## 🆘 Si ça ne fonctionne toujours pas

### Logs à vérifier :

1. **Console navigateur (F12)** : Chercher les logs `[PLAN SELECTION]` et `[FREE PLAN]`
2. **Supabase Dashboard → Logs → Postgres Logs** : Chercher les erreurs RLS
3. **Supabase Dashboard → Logs → API Logs** : Chercher les requêtes échouées

### Erreurs courantes :

| Erreur | Cause | Solution |
|--------|-------|----------|
| `new row violates row-level security policy` | RLS activé mais policy manquante | Appliquer migration RLS |
| `permission denied for table user_quotas` | GRANT manquant | `GRANT SELECT, UPDATE, INSERT ON user_quotas TO authenticated;` |
| `relation "user_quotas" does not exist` | Migration freemium pas appliquée | Appliquer `20260123_freemium_system_v2.sql` |
| `null value in column "user_id" violates not-null constraint` | Session expirée | Se reconnecter |

---

## 📝 Checklist Finale

- [ ] Migration `20260123_freemium_system_v2.sql` appliquée
- [ ] Migration `20260123_fix_rls_policies.sql` appliquée
- [ ] Tables `user_quotas` et `user_unlocked_prospects` existent
- [ ] RLS activé sur ces tables
- [ ] Policies créées (SELECT, UPDATE, INSERT pour authenticated)
- [ ] GRANT appliqués (authenticated et service_role)
- [ ] Trigger `on_user_created_initialize_quota` actif
- [ ] Test : Création compte → Email → Plan Selection → Clic FREE → Dashboard

**Si tous les points sont cochés → PULSE fonctionne ! 🚀**

---

**Date** : 23 janvier 2026  
**Version** : 1.0 - Production Diagnostic Guide
