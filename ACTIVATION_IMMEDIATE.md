# ⚡ ACTIVATION IMMÉDIATE - Déblocage compte

## 🚨 PROBLÈME

Après paiement Stripe :
- ❌ Redirigé vers Stripe encore
- ❌ Compte pas activé
- ❌ Boucle infinie

**CAUSE** : Le webhook Stripe ne met pas à jour ton compte

---

## ✅ SOLUTION IMMÉDIATE (30 secondes)

### ÉTAPE 1 : Va dans Supabase SQL Editor

**URL** : https://supabase.com/dashboard/project/ywavxjmbsywpjzchuuho/sql/new

---

### ÉTAPE 2 : Exécute ce SQL (REMPLACE TON EMAIL)

```sql
-- 🔍 ÉTAPE 1 : Trouve ton user_id
DO $$
DECLARE
  v_user_id UUID;
  v_email TEXT := '[TON_EMAIL_ICI]'; -- ⚠️ REMPLACE PAR TON VRAI EMAIL
BEGIN
  -- Récupérer le user_id
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = v_email;
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Aucun utilisateur trouvé avec email: %', v_email;
  END IF;
  
  RAISE NOTICE 'User trouvé: %', v_user_id;
  
  -- ✅ ACTIVER LE COMPTE
  INSERT INTO public.user_quotas (
    user_id,
    plan_type,
    is_first_login,
    subscription_status,
    prospects_limit,
    tournees_limit,
    updated_at
  ) VALUES (
    v_user_id,
    'pro',
    false, -- ✅ ACTIVATION !
    'trialing',
    999999,
    999999,
    NOW()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    plan_type = 'pro',
    is_first_login = false, -- ✅ ACTIVATION !
    subscription_status = 'trialing',
    prospects_limit = 999999,
    tournees_limit = 999999,
    updated_at = NOW();
  
  RAISE NOTICE '✅ Compte activé avec succès !';
  
  -- Afficher le résultat
  PERFORM 
    user_id,
    plan_type,
    is_first_login,
    subscription_status
  FROM public.user_quotas
  WHERE user_id = v_user_id;
  
END $$;

-- ✅ VÉRIFICATION FINALE
SELECT 
  u.email,
  q.plan_type,
  q.is_first_login,
  q.subscription_status,
  q.prospects_limit
FROM auth.users u
LEFT JOIN public.user_quotas q ON q.user_id = u.id
WHERE u.email = '[TON_EMAIL_ICI]'; -- ⚠️ MÊME EMAIL QU'AU DESSUS
```

---

### ÉTAPE 3 : Vérifie le résultat

Tu dois voir :
```
email: ton@email.com
plan_type: pro
is_first_login: false ✅
subscription_status: trialing
prospects_limit: 999999
```

---

### ÉTAPE 4 : Reconnecte-toi sur PULSE

1. **Va sur** : https://pulse-lead.com/auth
2. **Connecte-toi** avec ton email et mot de passe
3. **✅ Tu seras redirigé vers le dashboard directement !**

---

## 📋 EXEMPLE CONCRET

Si ton email est `tom@exemple.com`, le SQL devient :

```sql
DO $$
DECLARE
  v_user_id UUID;
  v_email TEXT := 'tom@exemple.com'; -- ✅ EMAIL ICI
BEGIN
  SELECT id INTO v_user_id FROM auth.users WHERE email = v_email;
  -- ... reste du code ...
```

---

## 🎯 APRÈS L'ACTIVATION

Une fois ton compte activé manuellement :
- ✅ Tu pourras te connecter normalement
- ✅ Accès au dashboard immédiat
- ✅ Plus de redirection Stripe

**En parallèle**, je vais investiguer pourquoi le webhook ne fonctionne pas pour les prochains users.

---

## 🆘 BESOIN D'AIDE ?

**Donne-moi juste ton email** et je te génère le SQL prêt à copier/coller (sans avoir à remplacer quoi que ce soit).

---

**Quel est ton email ?** Je te prépare le SQL exact ! 🚀
