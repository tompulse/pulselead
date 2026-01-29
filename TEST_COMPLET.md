# 🧪 TEST COMPLET - Flux FREE et PRO

## ⚠️ AVANT DE TESTER

### 1. Nettoie la DB
Exécute dans Supabase SQL Editor :
```sql
DELETE FROM user_unlocked_prospects;
DELETE FROM user_subscriptions;
DELETE FROM user_quotas;
DELETE FROM auth.users;
```

### 2. Vide cache navigateur
`Cmd+Shift+R` (3-4 fois)

### 3. Ferme TOUS les onglets localhost

---

## ✅ TEST 1 : Flux FREE

1. Va sur `http://localhost:8080/auth`
2. Inscris-toi avec un nouvel email
3. Confirme email
4. Login
5. **✅ Tu arrives sur `/plan-selection`**
6. Clique "Commencer gratuitement"
7. **✅ Toast "Bienvenue sur PULSE FREE"**
8. **✅ Redirigé vers `/dashboard` FREE actif**

**Vérifie dans Supabase** :
```sql
SELECT * FROM user_quotas;  -- plan_type='free', is_first_login=false
SELECT * FROM user_subscriptions;  -- plan_type='free', subscription_status='active'
```

---

## ✅ TEST 2 : Flux PRO (retour arrière depuis Stripe)

1. Nettoie DB (script ci-dessus)
2. Inscris-toi → confirme → login
3. **✅ Tu arrives sur `/plan-selection`**
4. Clique "Accéder au PRO"
5. **✅ Tu vas sur Stripe**
6. **Vérifie dans Supabase** :
   ```sql
   SELECT * FROM user_quotas;  -- Doit être VIDE
   SELECT * FROM user_subscriptions;  -- Doit être VIDE
   ```
7. **Clique sur le bouton retour (←) du navigateur**
8. **✅ Tu reviens sur `/plan-selection`** (PAS de dashboard, PAS d'erreur)
9. **Vérifie dans Supabase** :
   ```sql
   SELECT * FROM user_quotas;  -- Doit TOUJOURS être VIDE
   ```
10. Clique "Commencer gratuitement"
11. **✅ Tu arrives sur dashboard FREE actif**

---

## ✅ TEST 3 : Flux PRO (paiement complet)

1. Nettoie DB
2. Inscris-toi → confirme → login → `/plan-selection`
3. Clique "Accéder au PRO"
4. Sur Stripe, carte test : `4242 4242 4242 4242`
5. **✅ Webhook crée le plan PRO**
6. **✅ Tu arrives sur dashboard PRO actif**

**Vérifie dans Supabase** :
```sql
SELECT * FROM user_quotas;  -- plan_type='pro'
SELECT * FROM user_subscriptions;  -- subscription_status='trialing' ou 'active'
```

---

## ❌ Ce qui NE doit PLUS arriver

- ❌ Plan FREE créé automatiquement sans clic sur le bouton
- ❌ Plan PRO créé avant le paiement Stripe
- ❌ Dashboard "Inactif" accessible
- ❌ Erreur quand on revient de Stripe
- ❌ Redirection vers dashboard FREE après retour de Stripe

---

## 🐛 Si problème

1. Ouvre console (Cmd+Option+J)
2. Copie TOUS les logs `[PLAN SELECTION]` et `[DASHBOARD]`
3. Copie le résultat de :
   ```sql
   SELECT * FROM user_quotas;
   SELECT * FROM user_subscriptions;
   ```
