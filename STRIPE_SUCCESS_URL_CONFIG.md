# 🎯 CONFIGURATION STRIPE - SUCCESS URL

**Date**: 29 janvier 2026  
**Objectif**: Rediriger automatiquement vers le dashboard après paiement Stripe

---

## 🚨 PROBLÈME ACTUEL

Après avoir payé sur Stripe :
- ❌ L'utilisateur reste sur la page Stripe "Paiement réussi"
- ❌ Pas de redirection automatique vers `/checkout-success`
- ❌ Pas d'email de bienvenue envoyé

---

## ✅ SOLUTION

Il faut configurer la **Success URL** dans le Payment Link Stripe.

---

## 📋 ÉTAPES DE CONFIGURATION

### **1. Aller sur Stripe Dashboard**

Lien : https://dashboard.stripe.com/test/payment-links

**OU**

https://dashboard.stripe.com/payment-links (mode live)

---

### **2. Trouver le Payment Link PRO**

- Recherche le Payment Link qui correspond à ton plan PRO (49€/mois + 7j gratuit)
- Note : Le Payment Link commence par `plink_...`

---

### **3. Modifier le Payment Link**

1. Clique sur le Payment Link
2. Clique "Edit Payment Link" (ou "⋯" > "Edit")
3. Scroll jusqu'à "After Payment"

---

### **4. Configurer la Success URL**

Dans la section **"After Payment"** :

#### **Success URL** :
```
https://pulse-lead.com/checkout-success
```

**OU si tu es en local/dev** :
```
http://localhost:5173/checkout-success
```

#### **Cancel URL (optionnel)** :
```
https://pulse-lead.com/?checkout=cancelled
```

---

### **5. Activer "Pass customer data"**

Dans les options avancées, **activer** :

✅ **"Pass checkout session data"**
- Coche cette option pour que Stripe envoie l'ID de session dans l'URL

Cela permettra à `/checkout-success` de récupérer les infos du paiement.

---

### **6. Sauvegarder**

Clique "Save" ou "Update Payment Link"

---

## 🧪 TESTER LA CONFIGURATION

### **Test 1 : Vérifier la Success URL**

1. Va sur ton Payment Link Stripe (l'URL commence par `buy.stripe.com/...`)
2. Remplis le formulaire avec une **carte test** :
   ```
   Carte: 4242 4242 4242 4242
   Date: 12/26
   CVC: 123
   ```
3. Valide le paiement
4. **Vérifie que tu es automatiquement redirigé vers** :
   ```
   https://pulse-lead.com/checkout-success?session_id=cs_test_...
   ```

---

### **Test 2 : Vérifier le webhook**

1. Va sur Stripe Dashboard > Developers > Webhooks
2. Vérifie que le webhook est configuré :
   ```
   URL: https://[PROJECT].supabase.co/functions/v1/stripe-webhook
   Events: checkout.session.completed, customer.subscription.*
   ```
3. Après un paiement test, vérifie les logs du webhook :
   - Clique sur l'événement `checkout.session.completed`
   - Vérifie que la réponse est `200 OK`

---

### **Test 3 : Vérifier l'email de bienvenue**

1. Après un paiement test
2. Va sur Resend Dashboard (ou ton provider d'email)
3. Vérifie qu'un email "🚀 Bienvenue sur PULSE" a été envoyé

---

## 🔧 VARIABLES D'ENVIRONNEMENT

Vérifie que ces variables sont bien configurées dans Supabase :

### **Supabase Edge Functions > Secrets** :

```bash
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
RESEND_API_KEY=re_...
```

### **Frontend (.env)** :

```bash
VITE_STRIPE_PAYMENT_LINK_PRO=https://buy.stripe.com/...
```

---

## 📊 FLOW COMPLET APRÈS CONFIGURATION

```
1. User clique "Essayer 7j gratuit"
   ↓
2. Redirigé vers Stripe Payment Link
   ↓
3. Remplit formulaire + Carte
   ↓
4. Valide paiement (0€ pour essai)
   ↓
5. Stripe redirige vers /checkout-success ✅
   ↓
6. Webhook Stripe appelé en parallèle
   ↓ checkout.session.completed
   ↓ Met is_first_login = false
   ↓ Envoie email de bienvenue 📧
   ↓
7. CheckoutSuccess poll user_quotas
   ↓ Détecte is_first_login = false
   ↓
8. Redirection automatique vers /dashboard ✅
   ↓
9. Dashboard PRO accessible 🎉
```

**Temps total** : 5-10 secondes après validation Stripe

---

## 🐛 DEBUG

### **Si la redirection ne marche pas** :

1. **Vérifie la Success URL dans Stripe** :
   - Dashboard > Payment Links > [Ton lien] > After Payment
   - Doit être : `https://pulse-lead.com/checkout-success`

2. **Vérifie les logs Stripe** :
   - Dashboard > Developers > Events
   - Cherche `checkout.session.completed`
   - Vérifie que l'événement a été envoyé au webhook

3. **Vérifie les logs Supabase** :
   - Dashboard > Edge Functions > stripe-webhook > Logs
   - Cherche : `[STRIPE-WEBHOOK] Checkout completed`
   - Vérifie : `User quotas updated to 'pro' and account activated`

4. **Vérifie la console navigateur (F12)** :
   - Doit afficher :
     ```
     [CHECKOUT SUCCESS] Poll quotas: { plan_type: 'pro', is_first_login: false }
     [CHECKOUT SUCCESS] ✅ Account activated! Redirecting to dashboard...
     ```

---

### **Si l'email n'est pas envoyé** :

1. **Vérifie RESEND_API_KEY** :
   - Supabase Dashboard > Edge Functions > Secrets
   - Doit commencer par `re_...`

2. **Vérifie les logs send-welcome** :
   - Dashboard > Edge Functions > send-welcome > Logs
   - Cherche : `Sending welcome email`

3. **Vérifie Resend Dashboard** :
   - https://resend.com/emails
   - Regarde si l'email apparaît (envoyé ou en file d'attente)

---

## ✅ CHECKLIST FINALE

Avant de tester :

- [ ] Success URL configurée dans Payment Link Stripe
- [ ] Cancel URL configurée (optionnel)
- [ ] "Pass checkout session data" activé
- [ ] Webhook Stripe configuré avec URL Supabase
- [ ] Webhook écoute `checkout.session.completed`
- [ ] Variables d'environnement Stripe configurées
- [ ] Variables d'environnement Resend configurées
- [ ] Code webhook mis à jour (is_first_login = false)
- [ ] Edge Functions déployées sur Supabase

---

## 🎁 RÉSULTAT ATTENDU

Après avoir configuré la Success URL :

1. ✅ User paie sur Stripe (0€ essai)
2. ✅ Redirigé automatiquement vers `/checkout-success`
3. ✅ Page affiche "Activation en cours..."
4. ✅ Webhook active le compte (2-5s)
5. ✅ Redirection automatique vers `/dashboard`
6. ✅ Email de bienvenue reçu 📧
7. ✅ Dashboard PRO accessible immédiatement

**Expérience** : Ultra-fluide, zéro friction ! 🚀

---

## 📞 SUPPORT

Si ça ne marche toujours pas après avoir tout configuré :

1. Envoie-moi les **logs Stripe** (Dashboard > Developers > Events)
2. Envoie-moi les **logs Supabase** (Edge Functions > stripe-webhook)
3. Envoie-moi les **logs console** navigateur (F12)

Je t'aiderai à débugger ! 💪
