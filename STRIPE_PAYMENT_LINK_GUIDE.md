# 🚀 GUIDE : Créer le Stripe Payment Link PRO

## 🎯 **OBJECTIF**

Créer un Payment Link Stripe pour le plan PRO (49€/mois, 7j gratuits) et l'intégrer dans PULSE.

---

## 📋 **ÉTAPE 1 : Créer le Payment Link dans Stripe**

### **1. Connecte-toi à Stripe Dashboard**

- **Mode TEST** : https://dashboard.stripe.com/test/payment-links
- **Mode LIVE** : https://dashboard.stripe.com/payment-links

### **2. Clic "New payment link"**

### **3. Configure le produit**

**Product details** :
- Name: `PULSE PRO - Abonnement mensuel`
- Description (optionnel): `Prospection B2B illimitée · Tournées IA · CRM terrain`
- **Price** :
  - Amount: `49` EUR
  - Billing period: **Monthly** (Recurring)

### **4. Configure l'essai gratuit** ⚠️ **IMPORTANT**

**Free trial** :
- ✅ **Enable free trial**
- Duration: **7 days**
- ✅ **Require payment method** (CB obligatoire)

### **5. Informations collectées**

**Collect customer information** :
- ✅ **Email address** (Required)
- ⬜ Name (Optional)
- ⬜ Phone (Non)
- ⬜ Address (Non)

### **6. Après le paiement**

**After payment** :
- **Success page** : 
  ```
  https://pulse-lead.com/checkout-success?session_id={CHECKOUT_SESSION_ID}
  ```
- **Cancel page** (optionnel) :
  ```
  https://pulse-lead.com/?checkout=cancelled
  ```

### **7. Texte personnalisé (optionnel)**

**Custom text** :
- **Submit button text** : `🚀 Commencer mon essai gratuit`
- **Description** :
  ```
  Commencez votre essai gratuit de 7 jours. Aucun débit immédiat. 
  Annulez à tout moment. Après 7 jours : 49€/mois sans engagement.
  ```

### **8. Options avancées**

**Settings** :
- ✅ **Allow promotion codes** (Codes promo activés)
- **Customer creation** : Always (Créer customer à chaque fois)

### **9. Sauvegarde et copie le lien**

Clic **"Create link"**

Tu obtiens un lien comme :
```
https://buy.stripe.com/test_xxxxxxxxxxxxx
```

**📋 COPIE CE LIEN !**

---

## 📋 **ÉTAPE 2 : Configurer le lien dans PULSE**

### **Option A : Via Variable d'Environnement (RECOMMANDÉ)**

1. Crée/modifie le fichier `.env` à la racine du projet :
   ```bash
   # Stripe Payment Link (PRO plan with 7-day trial)
   VITE_STRIPE_PAYMENT_LINK_PRO=https://buy.stripe.com/test_xxxxxxxxxxxxx
   ```

2. **Sur Render** :
   - Va sur **Render Dashboard** → Ton service **pulselead**
   - **Environment** → **Environment Variables**
   - Ajoute :
     - Key: `VITE_STRIPE_PAYMENT_LINK_PRO`
     - Value: `https://buy.stripe.com/test_xxxxxxxxxxxxx`
   - **Save**

### **Option B : Directement dans le code**

Modifie `src/config/stripe.ts` :

```typescript
export const STRIPE_CONFIG = {
  // PRO Plan Payment Link (7-day free trial)
  PAYMENT_LINK_PRO: 'https://buy.stripe.com/test_xxxxxxxxxxxxx', // ← Ton lien ici
  
  PRO_PRICE_ID: 'price_1SqxKmHjyidZ5i9L8tCztpFU',
  SUCCESS_URL: `${window.location.origin}/checkout-success?trial=true`,
  CANCEL_URL: `${window.location.origin}/?checkout=cancelled`,
} as const;
```

---

## 📋 **ÉTAPE 3 : Configurer le Webhook Stripe**

### **1. Va sur Stripe Dashboard → Webhooks**

- **Mode TEST** : https://dashboard.stripe.com/test/webhooks
- **Mode LIVE** : https://dashboard.stripe.com/webhooks

### **2. Clic "Add endpoint"**

### **3. Configure l'endpoint**

**Endpoint URL** :
```
https://YOUR_SUPABASE_PROJECT.supabase.co/functions/v1/stripe-webhook
```

Remplace `YOUR_SUPABASE_PROJECT` par ton Project Ref Supabase.

**Events to send** :
- ✅ `checkout.session.completed`
- ✅ `customer.subscription.updated`
- ✅ `customer.subscription.deleted`
- ✅ `invoice.payment_failed`
- ✅ `invoice.paid`

### **4. Copie le Webhook Secret**

Après création, tu obtiens un **Signing secret** :
```
whsec_xxxxxxxxxxxxx
```

### **5. Ajoute le secret dans Supabase**

1. **Supabase Dashboard** → Ton projet → **Edge Functions** → **Secrets**
2. Clic **"New secret"**
3. Name: `STRIPE_WEBHOOK_SECRET`
4. Value: `whsec_xxxxxxxxxxxxx`
5. **Save**

---

## 🧪 **ÉTAPE 4 : TESTER LE FLOW COMPLET**

### **Test 1 : Vérifier le Payment Link**

1. Ouvre le Payment Link dans un nouvel onglet :
   ```
   https://buy.stripe.com/test_xxxxxxxxxxxxx
   ```

2. Vérifie que :
   - ✅ Prix affiché : **49€/mois**
   - ✅ Message : **"7-day free trial"** visible
   - ✅ Formulaire demande email + CB

### **Test 2 : Simuler un paiement (Mode TEST)**

1. Va sur le Payment Link (mode TEST)
2. Email : `test@pulse-lead.com`
3. Numéro de CB TEST Stripe :
   - **4242 4242 4242 4242**
   - Date : n'importe (futur)
   - CVC : 123
4. Clic **"Subscribe"** ou **"Commencer mon essai gratuit"**

5. ✅ **Résultat attendu** :
   - Redirect vers `/checkout-success?session_id=cs_test_xxx`
   - Page affiche : "🎉 Paiement réussi !"
   - Formulaire de création de compte visible

### **Test 3 : Créer le compte**

1. Sur `/checkout-success`, entre :
   - Email : `test@pulse-lead.com` (même que Stripe)
   - Password : `TestPass123`
2. Clic **"🚀 Créer mon compte PRO"**

3. ✅ **Résultat attendu** :
   - Toast : "🎉 Compte créé !"
   - Email de confirmation reçu
   - Après confirmation → Dashboard PRO

### **Test 4 : Vérifier le webhook**

1. **Supabase** → **Edge Functions** → **stripe-webhook** → **Logs**
2. Cherche :
   ```
   [STRIPE-WEBHOOK] Checkout completed
   [STRIPE-WEBHOOK] Found existing user by email
   [STRIPE-WEBHOOK] Subscription saved
   ```

3. **Supabase** → **Table Editor** → **user_subscriptions**
4. Vérifie qu'une ligne existe avec :
   - `subscription_status`: `trialing`
   - `plan_type`: `pro`
   - `subscription_start_date`: Date d'aujourd'hui
   - `subscription_end_date`: Date +7 jours

---

## 🎯 **FLOW FINAL (RÉSUMÉ)**

```
User clique CTA PRO sur landing
  ↓
Redirect Stripe Payment Link
  ↓
User entre email + CB
  ↓
Paiement réussi (7j gratuits activés)
  ↓
Redirect /checkout-success
  ↓
User créé son compte (email pré-rempli)
  ↓
Confirmation email → Dashboard PRO ✅
```

---

## 🔍 **DEBUG (si problème)**

### **Problème 1 : Payment Link ne charge pas**

- Vérifie que tu es en **mode TEST** sur Stripe Dashboard
- Vérifie que le lien est bien copié intégralement

### **Problème 2 : Redirect après paiement ne fonctionne pas**

- Vérifie le **Success URL** dans Stripe Payment Link settings :
  ```
  https://pulse-lead.com/checkout-success?session_id={CHECKOUT_SESSION_ID}
  ```
- Le paramètre `{CHECKOUT_SESSION_ID}` doit être exact (avec les accolades)

### **Problème 3 : Webhook ne reçoit pas les events**

1. **Stripe Dashboard** → **Webhooks** → Ton endpoint
2. Vérifie le **Status** : doit être **Active**
3. Clic sur l'endpoint → **Send test webhook**
4. Vérifie les logs dans **Supabase Edge Functions**

### **Problème 4 : User créé son compte mais reste en FREE**

- Vérifie que l'**email** utilisé pour le paiement Stripe est **exactement le même** que celui du compte Supabase
- Vérifie les logs du webhook :
  ```
  [STRIPE-WEBHOOK] Found existing user by email
  ```

---

## 📊 **MODE LIVE (PRODUCTION)**

Quand tu es prêt à passer en production :

1. **Stripe Dashboard** → Passe en **LIVE mode**
2. Crée un **nouveau Payment Link** (identique, mais en mode LIVE)
3. Copie le nouveau lien (commence par `https://buy.stripe.com/live_...`)
4. Mets à jour la variable :
   - `VITE_STRIPE_PAYMENT_LINK_PRO` avec le lien LIVE
5. Crée un **nouveau Webhook endpoint** en mode LIVE
6. Copie le **Webhook Secret** LIVE
7. Mets à jour dans Supabase :
   - `STRIPE_WEBHOOK_SECRET` avec le secret LIVE

---

**🚀 ENVOIE-MOI LE PAYMENT LINK TEST ET JE FINALISE L'INTÉGRATION !**
