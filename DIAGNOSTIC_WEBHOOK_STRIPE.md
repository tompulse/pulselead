# 🔍 DIAGNOSTIC : Webhook Stripe & Email Bienvenue

## 🚨 PROBLÈMES CONSTATÉS

### 1️⃣ Connexion en boucle
- Tu te connectes → redirigé vers Stripe
- Tu paies (0€) → reviens au dashboard
- Dashboard redirige vers Stripe encore
- **BOUCLE INFINIE**

### 2️⃣ Pas de mail "Bienvenue sur PULSE"
- Après paiement, aucun email de bienvenue reçu
- Le mail devrait arriver en 2-10 secondes

---

## 🔎 CAUSES RACINES

### Cause principale : **WEBHOOK STRIPE NON CONFIGURÉ**

Le webhook Stripe est crucial car il :
- ✅ Active ton compte (`is_first_login: false`)
- ✅ Enregistre ta subscription dans la DB
- ✅ Envoie le mail de bienvenue

**Si le webhook ne fonctionne pas** :
- ❌ Compte jamais activé → boucle Stripe infinie
- ❌ Aucun mail envoyé
- ❌ Dashboard ne détecte jamais l'activation

---

## ✅ SOLUTION : 3 ÉTAPES

### ÉTAPE 1 : Vérifier le webhook dans Stripe Dashboard

1. **Va sur** : https://dashboard.stripe.com/test/webhooks
2. **Vérifie** : Y a-t-il un webhook configuré ?
3. **URL attendue** : `https://[ton-projet].supabase.co/functions/v1/stripe-webhook`

**Si aucun webhook n'existe** → C'EST LE PROBLÈME ! ⬇️

---

### ÉTAPE 2 : Créer le webhook Stripe

#### A. Récupère ton URL Supabase

```bash
# Dans ton terminal
cd /Users/raws/pulse-project/pulselead
supabase status
```

Tu devrais voir :
```
API URL: https://[PROJECT_ID].supabase.co
```

#### B. Va sur Stripe Dashboard

1. **Ouvre** : https://dashboard.stripe.com/test/webhooks
2. **Clique** : "+ Add endpoint"
3. **Endpoint URL** : 
   ```
   https://[PROJECT_ID].supabase.co/functions/v1/stripe-webhook
   ```
4. **Description** : `PULSE Production Webhook`
5. **Events to send** : Sélectionne ces événements :
   - ✅ `checkout.session.completed`
   - ✅ `customer.subscription.updated`
   - ✅ `customer.subscription.deleted`
   - ✅ `invoice.paid`
   - ✅ `invoice.payment_failed`

6. **Clique** : "Add endpoint"

#### C. Récupère le Signing Secret

Une fois le webhook créé :
1. **Clique** sur le webhook que tu viens de créer
2. **Copie** le "Signing secret" (commence par `whsec_...`)
3. **Garde-le** pour l'étape suivante

---

### ÉTAPE 3 : Configurer les secrets Supabase

#### A. Ajoute le Webhook Secret

```bash
# Dans ton terminal
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_[ton_secret_ici]
```

#### B. Vérifie les autres secrets

```bash
# Liste tous les secrets
supabase secrets list
```

Tu DOIS avoir :
- ✅ `STRIPE_SECRET_KEY` (sk_test_...)
- ✅ `STRIPE_WEBHOOK_SECRET` (whsec_...)
- ✅ `RESEND_API_KEY` (re_...)

**Si `RESEND_API_KEY` manque** :
1. Va sur https://resend.com/api-keys
2. Crée une nouvelle clé API
3. Configure-la :
   ```bash
   supabase secrets set RESEND_API_KEY=re_[ta_cle_ici]
   ```

---

### ÉTAPE 4 : Déployer les fonctions

```bash
# Déploie stripe-webhook
supabase functions deploy stripe-webhook

# Déploie send-welcome
supabase functions deploy send-welcome
```

---

## 🧪 TESTER LA CONFIGURATION

### Test 1 : Webhook reçoit les événements

1. **Va sur** : https://dashboard.stripe.com/test/webhooks
2. **Clique** sur ton webhook
3. **Onglet** : "Events"
4. **Fais un paiement test** sur PULSE
5. **Vérifie** : Tu dois voir `checkout.session.completed` avec statut `✅ Succeeded`

**Si `❌ Failed`** :
- Vérifie l'URL du webhook
- Vérifie que `stripe-webhook` est déployé

---

### Test 2 : Compte activé dans DB

Après un paiement test, va dans Supabase :

1. **Table Editor** → `user_quotas`
2. **Cherche** ton user_id
3. **Vérifie** :
   - `is_first_login` = **false** ✅
   - `plan_type` = **'pro'** ✅
   - `subscription_status` = **'trialing'** ✅

**Si `is_first_login` = true** → Le webhook n'a pas mis à jour la DB !

---

### Test 3 : Mail reçu

1. **Vérifie** ta boîte mail (et spam)
2. **Cherche** : "🚀 Bienvenue sur PULSE - Ton essai gratuit a commencé !"

**Si aucun mail** :
- Vérifie les logs de `send-welcome` dans Supabase Functions
- Vérifie que `RESEND_API_KEY` est configuré

---

## 📊 VÉRIFIER LES LOGS

### Logs du webhook Stripe

```bash
# Voir les logs en temps réel
supabase functions logs stripe-webhook --tail
```

Ou dans Supabase Dashboard :
1. **Functions** → `stripe-webhook`
2. **Onglet** : "Logs"
3. **Cherche** : `[STRIPE-WEBHOOK]`

---

### Logs de send-welcome

```bash
supabase functions logs send-welcome --tail
```

Tu devrais voir :
```
[SEND-WELCOME] Sending welcome email - {"userId":"...", "email":"..."}
[SEND-WELCOME] Email sent successfully - {"emailId":"..."}
```

---

## 🎯 CHECKLIST FINALE

- [ ] Webhook Stripe créé sur https://dashboard.stripe.com/test/webhooks
- [ ] URL webhook = `https://[PROJECT].supabase.co/functions/v1/stripe-webhook`
- [ ] Events sélectionnés : `checkout.session.completed`, etc.
- [ ] `STRIPE_WEBHOOK_SECRET` configuré dans Supabase secrets
- [ ] `RESEND_API_KEY` configuré dans Supabase secrets
- [ ] `stripe-webhook` déployé (`supabase functions deploy stripe-webhook`)
- [ ] `send-welcome` déployé (`supabase functions deploy send-welcome`)
- [ ] Test paiement : webhook reçoit l'événement (statut ✅ Succeeded)
- [ ] Test DB : `is_first_login = false` après paiement
- [ ] Test email : mail "Bienvenue sur PULSE" reçu

---

## 🔧 SI ÇA NE MARCHE TOUJOURS PAS

### Solution de secours : Activation manuelle

Si le webhook tarde trop ou ne fonctionne pas, je peux créer un script SQL pour activer manuellement les comptes après paiement.

**Dis-moi simplement** : "Active mon compte manuellement" avec ton email, et je créerai le script.

---

## 💡 RÉSUMÉ

**AVANT (cassé)** :
```
Paies Stripe → Webhook ❌ → Compte pas activé → Boucle infinie
```

**APRÈS (avec webhook configuré)** :
```
Paies Stripe → Webhook ✅ → Compte activé + Mail envoyé → Dashboard PRO ✅
```

---

## 📞 AIDE URGENTE

Si tu es bloqué, envoie-moi :
1. Screenshot de https://dashboard.stripe.com/test/webhooks
2. Screenshot de Supabase Functions (déployées ou non)
3. Résultat de `supabase secrets list`

Je te débloquerai immédiatement ! 🚀
