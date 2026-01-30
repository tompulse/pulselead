# ⚡ DÉPLOIEMENT RAPIDE - Webhook Stripe & Email

## 🎯 OBJECTIF

Faire fonctionner :
- ✅ Activation automatique du compte après paiement Stripe
- ✅ Envoi du mail "Bienvenue sur PULSE"
- ✅ Redirection vers dashboard sans boucle

---

## 🚀 DÉPLOIEMENT EN 5 MINUTES

### 1️⃣ Déploie les fonctions Supabase

```bash
cd /Users/raws/pulse-project/pulselead

# Déploie le webhook Stripe (AVEC LOGS AMÉLIORÉS)
supabase functions deploy stripe-webhook

# Déploie l'envoi d'email de bienvenue
supabase functions deploy send-welcome
```

**Attends** que chaque déploiement affiche : `✅ Deployed function`

---

### 2️⃣ Configure le webhook dans Stripe

#### A. Récupère ton URL Supabase

```bash
supabase status
```

Tu verras :
```
API URL: https://abcdefgh.supabase.co
```

Ton **webhook URL** sera :
```
https://abcdefgh.supabase.co/functions/v1/stripe-webhook
```

#### B. Crée le webhook dans Stripe

1. **Ouvre** : https://dashboard.stripe.com/test/webhooks
2. **Clique** : "+ Add endpoint"
3. **Endpoint URL** : Colle ton URL webhook ci-dessus
4. **Events** : Sélectionne :
   - `checkout.session.completed` ✅
   - `customer.subscription.updated` ✅
   - `customer.subscription.deleted` ✅
   - `invoice.paid` ✅
   - `invoice.payment_failed` ✅
5. **Clique** : "Add endpoint"

#### C. Copie le Signing Secret

1. **Clique** sur le webhook que tu viens de créer
2. **Section** "Signing secret"
3. **Clique** : "Reveal" puis copie le secret (`whsec_...`)

---

### 3️⃣ Configure les secrets Supabase

```bash
# Configure le webhook secret
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_[TON_SECRET_ICI]

# Vérifie tous les secrets
supabase secrets list
```

Tu DOIS voir :
- ✅ `STRIPE_SECRET_KEY`
- ✅ `STRIPE_WEBHOOK_SECRET`
- ✅ `RESEND_API_KEY`

**Si `RESEND_API_KEY` manque** :
```bash
# Va sur https://resend.com/api-keys et crée une clé
supabase secrets set RESEND_API_KEY=re_[TA_CLE_ICI]
```

---

### 4️⃣ TEST COMPLET

#### Test 1 : Paiement

1. **Inscris-toi** avec un nouveau compte
2. **Confirme** ton email
3. **Va sur Stripe** et paie (carte test : `4242 4242 4242 4242`)
4. **Vérifie** : Tu dois être redirigé vers le dashboard

#### Test 2 : Webhook reçu

1. **Va sur** : https://dashboard.stripe.com/test/webhooks
2. **Clique** sur ton webhook
3. **Onglet** : "Events"
4. **Vérifie** : `checkout.session.completed` avec statut `✅ Succeeded`

**Si `❌ Failed`** :
- Vérifie l'URL du webhook (doit finir par `/functions/v1/stripe-webhook`)
- Vérifie que `stripe-webhook` est déployé

#### Test 3 : Logs Supabase

```bash
# Voir les logs en temps réel
supabase functions logs stripe-webhook --tail
```

Après un paiement, tu DOIS voir :
```
[STRIPE-WEBHOOK] 🎉 Checkout completed
[STRIPE-WEBHOOK] 🔍 Looking for user
[STRIPE-WEBHOOK] ✅ Found existing user by email
[STRIPE-WEBHOOK] ✅ User identified
[STRIPE-WEBHOOK] 📦 Retrieving subscription from Stripe
[STRIPE-WEBHOOK] 💳 Subscription retrieved
[STRIPE-WEBHOOK] 💾 Upserting user_subscriptions
[STRIPE-WEBHOOK] ✅ Subscription saved successfully
[STRIPE-WEBHOOK] 🔄 Updating user_quotas to activate account
[STRIPE-WEBHOOK] ✅ User quotas updated to 'pro' and account ACTIVATED
[STRIPE-WEBHOOK] 📧 Checking if welcome email should be sent
[STRIPE-WEBHOOK] 🎯 Trial detected, preparing welcome email
[STRIPE-WEBHOOK] 📨 Invoking send-welcome function
[STRIPE-WEBHOOK] ✅ Welcome email function invoked successfully
```

**Si tu vois des `❌ ERROR`** : Copie-moi les logs !

#### Test 4 : Email reçu

1. **Vérifie** ta boîte mail (et spam)
2. **Cherche** : "🚀 Bienvenue sur PULSE - Ton essai gratuit a commencé !"

---

## 🆘 SI ÇA NE MARCHE PAS

### Option A : Vérifier les logs send-welcome

```bash
supabase functions logs send-welcome --tail
```

Tu dois voir :
```
[SEND-WELCOME] Sending welcome email - {"userId":"...", "email":"..."}
[SEND-WELCOME] Email sent successfully - {"emailId":"..."}
```

**Si tu vois** `RESEND_API_KEY not configured` :
→ Configure la clé Resend (voir étape 3️⃣)

---

### Option B : Activation manuelle

Si le webhook ne fonctionne vraiment pas après tout ça :

1. **Ouvre** : https://supabase.com/dashboard/project/[TON_PROJECT]/editor
2. **Copie/colle** le script `ACTIVATION_MANUELLE_COMPTE.sql`
3. **Remplace** `[TON_EMAIL_ICI]` par ton email
4. **Exécute** le script
5. **Reconnecte-toi** sur PULSE

---

## ⚠️ ERREURS COURANTES

### Erreur : "Invalid signature"
- **Cause** : `STRIPE_WEBHOOK_SECRET` incorrect
- **Fix** : Re-copie le signing secret depuis Stripe Dashboard

### Erreur : "No user found"
- **Cause** : L'email Stripe ne correspond à aucun compte Supabase
- **Fix** : Assure-toi d'utiliser le même email pour signup ET Stripe

### Erreur : "Function not found"
- **Cause** : `stripe-webhook` ou `send-welcome` pas déployé
- **Fix** : Re-déploie avec `supabase functions deploy [nom]`

---

## 📞 BESOIN D'AIDE ?

Envoie-moi :
1. Screenshot de https://dashboard.stripe.com/test/webhooks
2. Résultat de `supabase secrets list`
3. Logs du webhook : `supabase functions logs stripe-webhook --tail`

Je te débloquerai en 2 minutes ! 🚀
