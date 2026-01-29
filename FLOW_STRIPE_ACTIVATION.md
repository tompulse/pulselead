# 🎯 FLOW COMPLET - ACTIVATION APRÈS PAIEMENT STRIPE

**Date**: 29 janvier 2026  
**Système**: Activation automatique du compte PRO après paiement Stripe

---

## 📊 SCHÉMA DU FLOW

```
┌─────────────────┐
│  1. INSCRIPTION │
│    /auth        │
└────────┬────────┘
         │ User crée compte Supabase
         │ is_first_login = true
         │ plan_type = null
         ↓
┌─────────────────┐
│  2. REDIRECTION │
│     STRIPE      │
└────────┬────────┘
         │ window.location.href
         │ + client_reference_id (user_id)
         │ + prefilled_email
         ↓
┌─────────────────┐
│  3. PAIEMENT    │
│     STRIPE      │
└────────┬────────┘
         │ User entre CB
         │ Paiement validé
         ↓
    ┌────┴────┐
    │         │
    ↓         ↓
┌─────┐  ┌────────┐
│  4a │  │   4b   │
│ SUC │  │WEBHOOK │
│CESS │  │ STRIPE │
│ URL │  │        │
└──┬──┘  └───┬────┘
   │         │
   │         │ checkout.session.completed
   │         │ → Récupère client_reference_id
   │         │ → Update user_quotas:
   │         │    is_first_login = false
   │         │    plan_type = 'pro'
   │         │    subscription_status = 'trialing'
   │         │
   │         ↓
   │    [COMPTE ACTIVÉ]
   │         │
   │         │
   ↓ Poll toutes les 2s
[DÉTECTE is_first_login = false]
   │
   ↓
┌──────────────────┐
│  5. REDIRECTION  │
│    /dashboard    │
└──────────────────┘
```

---

## 🔄 DÉTAIL DU FLOW

### **Étape 1 : Inscription** (`/auth`)

```typescript
// L'utilisateur crée son compte
const { data, error } = await supabase.auth.signUp({
  email,
  password,
});

// Trigger database : create_user_quotas_on_signup
// Crée automatiquement user_quotas avec:
{
  user_id: user.id,
  plan_type: null,
  is_first_login: true,
  prospects_unlocked: 0,
  prospects_limit: 0,
  tournees_created: 0,
  tournees_limit: 0
}
```

**État** : Compte créé mais pas activé ❌

---

### **Étape 2 : Redirection Stripe**

```typescript
// Auth.tsx ou LandingPage.tsx
const paymentUrl = `${STRIPE_PAYMENT_LINK}?client_reference_id=${userId}&prefilled_email=${email}`;
window.location.href = paymentUrl;
```

**Paramètres passés** :
- `client_reference_id` : UUID Supabase de l'utilisateur
- `prefilled_email` : Email de l'utilisateur

---

### **Étape 3 : Paiement Stripe**

User remplit le formulaire Stripe :
- Carte bancaire : `4242 4242 4242 4242` (test)
- Date : Futur (ex: 12/26)
- CVC : 123

**7 jours d'essai gratuit** commencent immédiatement.

---

### **Étape 4a : Success URL** (`/checkout-success`)

```typescript
// CheckoutSuccess.tsx
useEffect(() => {
  // 1. Récupérer la session utilisateur
  const { data: { session } } = await supabase.auth.getSession();
  
  // 2. Poll toutes les 2 secondes
  const pollInterval = setInterval(async () => {
    const { data: quotas } = await supabase
      .from('user_quotas')
      .select('plan_type, is_first_login')
      .eq('user_id', session.user.id)
      .single();
    
    // 3. Si activé → Redirection
    if (quotas.is_first_login === false && quotas.plan_type) {
      clearInterval(pollInterval);
      navigate('/dashboard');
    }
  }, 2000);
  
  // 4. Timeout après 30s
  setTimeout(() => {
    clearInterval(pollInterval);
    navigate('/dashboard'); // Redirige quand même
  }, 30000);
}, []);
```

**État** : ⏳ Attente de l'activation par le webhook

---

### **Étape 4b : Webhook Stripe** (Supabase Edge Function)

```typescript
// supabase/functions/stripe-webhook/index.ts

// Event: checkout.session.completed
const session = event.data.object;
const userId = session.client_reference_id; // UUID Supabase
const customerId = session.customer;
const subscriptionId = session.subscription;

// Activation du compte
await supabase
  .from('user_quotas')
  .update({
    plan_type: 'pro',
    is_first_login: false,
    stripe_customer_id: customerId,
    stripe_subscription_id: subscriptionId,
    subscription_status: 'trialing', // ou 'active'
    prospects_limit: 999999,
    tournees_limit: 999999,
  })
  .eq('user_id', userId);
```

**État** : ✅ Compte activé !

---

### **Étape 5 : Dashboard** (`/dashboard`)

```typescript
// ProtectedRoute.tsx vérifie :
const { data: quotas } = await supabase
  .from('user_quotas')
  .select('plan_type, is_first_login')
  .eq('user_id', userId)
  .single();

// Conditions d'accès :
const isValid = quotas &&
               !error &&
               quotas.plan_type &&
               quotas.is_first_login === false;

if (!isValid) {
  // Redirige vers Stripe
  window.location.href = paymentUrl;
}
```

**État** : ✅ Accès complet au dashboard PRO

---

## 🎯 AVANTAGES DE CE SYSTÈME

### ✅ **Activation automatique**
- Pas d'intervention manuelle
- Webhook Stripe gère tout
- User voit son compte actif en quelques secondes

### ✅ **Expérience fluide**
- CheckoutSuccess affiche un loader animé
- Poll intelligent (toutes les 2s)
- Timeout de sécurité (30s max)
- Redirection automatique vers /dashboard

### ✅ **Sécurité**
- `client_reference_id` lie Stripe ↔ Supabase
- Webhook sécurisé avec signature
- Double vérification (Success URL + ProtectedRoute)
- Impossible d'accéder au dashboard sans activation

### ✅ **Fallback**
- Si webhook prend du temps → Poll attend
- Si timeout → Redirige quand même (le webhook activera après)
- Si erreur → Affiche message + bouton connexion

---

## 🧪 TESTS À FAIRE

### **Test 1 : Flow complet nominal**
1. Inscription sur `/auth`
2. Paiement Stripe (carte test)
3. Vérifie que CheckoutSuccess affiche le loader
4. Vérifie que tu es redirigé vers `/dashboard` automatiquement
5. Vérifie que le dashboard s'affiche (pas de redirection Stripe)

### **Test 2 : Webhook lent**
1. Même flow mais webhook prend 10-15 secondes
2. CheckoutSuccess doit attendre et afficher le loader
3. Dès que webhook termine → Redirection

### **Test 3 : Timeout**
1. Désactive temporairement le webhook (pour tester)
2. CheckoutSuccess attend 30s
3. Après 30s → Redirige vers /dashboard
4. Réactive le webhook → Il activera le compte après

### **Test 4 : Accès direct au dashboard**
1. Avant paiement, tape `/dashboard` dans l'URL
2. Vérifie redirection vers Stripe
3. Après paiement, tape `/dashboard`
4. Vérifie accès autorisé

---

## 🔧 CONFIGURATION STRIPE REQUISE

### **Dans le Payment Link Stripe** :
1. Success URL : `https://pulse-lead.com/checkout-success?trial=true`
2. Cancel URL : `https://pulse-lead.com/?checkout=cancelled`
3. Activer "Collect customer ID"

### **Dans Stripe Dashboard > Webhooks** :
1. URL : `https://[PROJECT].supabase.co/functions/v1/stripe-webhook`
2. Events :
   - `checkout.session.completed` ✅
   - `customer.subscription.created` ✅
   - `customer.subscription.updated` ✅
   - `customer.subscription.deleted` ✅
   - `invoice.payment_succeeded` ✅
   - `invoice.payment_failed` ✅

---

## 📊 LOGS À VÉRIFIER

### **Console navigateur** :
```
[CHECKOUT SUCCESS] User session found: xxx-xxx-xxx
[CHECKOUT SUCCESS] Poll quotas: { plan_type: null, is_first_login: true }
[CHECKOUT SUCCESS] Poll quotas: { plan_type: 'pro', is_first_login: false }
[CHECKOUT SUCCESS] ✅ Account activated! Redirecting to dashboard...
```

### **Supabase Edge Functions** :
```
[STRIPE WEBHOOK] Received event: checkout.session.completed
[STRIPE WEBHOOK] User ID: xxx-xxx-xxx
[STRIPE WEBHOOK] Activating PRO plan...
[STRIPE WEBHOOK] ✅ User quotas updated successfully
```

---

## 🎯 RÉSULTAT

**Flow ultra-fluide** :
1. User s'inscrit → 5 secondes
2. User paie sur Stripe → 30 secondes
3. Webhook active le compte → 2-5 secondes
4. Redirection auto dashboard → Immédiat

**Temps total** : ~40-50 secondes de l'inscription au dashboard actif ⚡

**Expérience** : Aucune friction, tout est automatique ! 🚀
