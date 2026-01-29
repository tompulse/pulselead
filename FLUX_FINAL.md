# 🎯 FLUX FINAL - PRO & FREE

## 📋 RÉSUMÉ

**99% des CTA** → PRO (7j gratuits)  
**1 CTA (pricing)** → FREE

---

## 🚀 FLUX PRO (PAR DÉFAUT)

```
CTA Landing → /auth → Inscription → Email → Login → Stripe → Dashboard PRO
```

### Détails :
1. **Tous les CTA "Essayer 7j gratuits"** → `/auth` (sans paramètre)
2. **Inscription** → Email de confirmation envoyé
3. **Confirmation email** → Retour sur `/auth`
4. **Login** → Vérifie si plan actif :
   - Si **pas de plan** → Redirige vers **Stripe Payment Link**
   - Si **plan actif** → Dashboard
5. **Stripe** → Paiement → Webhook crée plan PRO → Redirige vers `/checkout-success`
6. **Dashboard PRO** → Accès complet illimité

---

## 🎁 FLUX FREE (1 SEUL CTA)

```
CTA FREE (pricing) → /auth?plan=free → Inscription → Email → Login → Dashboard FREE
```

### Détails :
1. **CTA "Commencer gratuitement"** (pricing) → `/auth?plan=free`
2. **Inscription** → Email de confirmation
3. **Confirmation email** → Retour sur `/auth?plan=free`
4. **Login** → Détecte `?plan=free` :
   - Appelle `activate_free_plan()`
   - Crée quotas FREE (30 prospects, 2 tournées)
   - Redirige vers **Dashboard FREE**
5. **Dashboard FREE** → Accès limité

---

## 🔧 FICHIERS MODIFIÉS

### 1. **Auth.tsx**
```typescript
// Après login :
if (selectedPlan === 'free') {
  // Activer FREE → dashboard
  await supabase.rpc('activate_free_plan', { p_user_id });
  navigate('/dashboard');
} else {
  // PRO par défaut → Stripe
  window.location.href = STRIPE_PAYMENT_LINK_PRO;
}
```

### 2. **LandingPage.tsx**
- ✅ Tous les CTA → `/auth` (PRO)
- ✅ 1 CTA pricing → `/auth?plan=free`

### 3. **Dashboard.tsx**
- ✅ Bloque si pas de plan valide
- ✅ Si PRO sans paiement → redirige vers Stripe

### 4. **App.tsx**
- ✅ Supprimé route `/plan-selection`

### 5. **SUPPRIMÉS**
- ❌ `PlanSelection.tsx` (plus nécessaire)
- ❌ `FreeConfirmation.tsx` (plus nécessaire)

---

## 🧪 TEST COMPLET

### AVANT DE TESTER

1. **Nettoie la DB** :
   ```sql
   DELETE FROM user_unlocked_prospects;
   DELETE FROM user_subscriptions;
   DELETE FROM user_quotas;
   DELETE FROM auth.users;
   ```

2. **Vide cache** : `Cmd+Shift+R`

3. **Ferme tous les onglets**

---

### TEST 1 : Flux PRO

1. Va sur `http://localhost:8080`
2. Clique "Essayer 7j GRATUIT" (n'importe quel CTA)
3. Inscris-toi
4. Confirme email
5. Login
6. **✅ Tu DOIS aller sur Stripe**
7. Vérifie Supabase : `SELECT * FROM user_quotas;` → **VIDE**
8. Paye sur Stripe (carte test `4242 4242 4242 4242`)
9. **✅ Webhook crée plan PRO**
10. **✅ Tu arrives sur dashboard PRO**

---

### TEST 2 : Flux FREE

1. Nettoie DB
2. Va sur `http://localhost:8080`
3. **Scroll jusqu'à la section pricing**
4. Clique "Commencer gratuitement" (dans le card FREE)
5. Inscris-toi
6. Confirme email
7. Login
8. **✅ Plan FREE créé automatiquement**
9. **✅ Tu arrives sur dashboard FREE**
10. Vérifie Supabase :
    ```sql
    SELECT * FROM user_quotas;  -- plan_type='free'
    SELECT * FROM user_subscriptions;  -- plan_type='free', status='active'
    ```

---

### TEST 3 : Retour arrière depuis Stripe

1. Nettoie DB
2. Inscris-toi (CTA PRO)
3. Login → va sur Stripe
4. **Clique retour arrière (←)**
5. **✅ Tu reviens sur `/auth`**
6. Login à nouveau
7. **✅ Tu repars sur Stripe** (car pas de plan actif)

---

## ✅ RÉSULTAT ATTENDU

- ✅ **PRO** : 99% des CTA → Stripe → Dashboard PRO
- ✅ **FREE** : 1 CTA pricing → Dashboard FREE direct
- ✅ **Aucun plan** créé avant paiement Stripe
- ✅ **Pas d'erreur** au retour depuis Stripe
- ✅ **Pas de /plan-selection** (supprimé)

---

## 🔑 CONFIGURATION STRIPE

**Assure-toi que** :
1. `VITE_STRIPE_PAYMENT_LINK_PRO` est défini dans `.env`
2. Le webhook Stripe appelle `activate_pro_plan()` après paiement réussi
3. Le `client_reference_id` est bien le `user_id`

---

Bon courage ! 💪
