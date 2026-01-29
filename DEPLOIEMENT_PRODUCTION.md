# 🚀 DÉPLOIEMENT PRODUCTION

## ✅ CHECKLIST AVANT DÉPLOIEMENT

### 1️⃣ CONFIGURATION STRIPE

#### A. Payment Link PRO
1. Va sur **Stripe Dashboard** → **Payment Links**
2. Crée un **Payment Link** avec :
   - **Produit** : PULSE PRO - 29€/mois
   - **Essai gratuit** : 7 jours
   - **Collecte email** : Activé
3. **Copie l'URL** du Payment Link (ex: `https://buy.stripe.com/xxxxx`)

#### B. Webhook
1. **Stripe Dashboard** → **Developers** → **Webhooks**
2. **+ Add endpoint**
3. **URL** : `https://TON_DOMAINE.com/functions/v1/stripe-webhook`
4. **Events** à écouter :
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. **Copie le Signing Secret** (ex: `whsec_xxxxx`)

---

### 2️⃣ VARIABLES D'ENVIRONNEMENT

#### Dans ton `.env` (local) ou **Vercel/Netlify** (production) :

```env
# Stripe
VITE_STRIPE_PAYMENT_LINK_PRO=https://buy.stripe.com/xxxxx
STRIPE_SECRET_KEY=sk_live_xxxxx (ou sk_test_xxxxx)
STRIPE_WEBHOOK_SECRET=whsec_xxxxx

# Supabase (déjà configuré)
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxxxx
```

---

### 3️⃣ SUPABASE - URL DE REDIRECTION

1. **Supabase Dashboard** → **Authentication** → **URL Configuration**
2. **Site URL** : `https://TON_DOMAINE.com`
3. **Redirect URLs** (ajoute toutes ces lignes) :
   ```
   https://TON_DOMAINE.com
   https://TON_DOMAINE.com/auth
   https://TON_DOMAINE.com/email-confirmed
   https://TON_DOMAINE.com/dashboard
   https://TON_DOMAINE.com/checkout-success
   ```

---

### 4️⃣ CODE - MISE À JOUR DES URLs

#### A. Auth.tsx (ligne 299)
Remplace :
```typescript
emailRedirectTo: `${window.location.origin}/auth`
```

Par :
```typescript
emailRedirectTo: `https://TON_DOMAINE.com/auth`
```

#### B. Stripe Config (src/config/stripe.ts)
Vérifie que les URLs sont correctes :
```typescript
SUCCESS_URL: `${window.location.origin}/checkout-success?trial=true`,
CANCEL_URL: `${window.location.origin}/?checkout=cancelled`,
```

✅ Ça devrait fonctionner tel quel (utilise `window.location.origin`)

---

### 5️⃣ WEBHOOK STRIPE (Supabase Edge Function)

#### Vérifie que le webhook existe :
```bash
# Liste les functions
ls supabase/functions/
```

#### Si le webhook `stripe-webhook` existe :
```typescript
// supabase/functions/stripe-webhook/index.ts
// Doit appeler activate_pro_plan() après paiement réussi

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@14.21.0'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
})

serve(async (req) => {
  const signature = req.headers.get('stripe-signature')
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')
  
  try {
    const body = await req.text()
    const event = stripe.webhooks.constructEvent(body, signature!, webhookSecret!)
    
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object
      const userId = session.client_reference_id
      
      // Appeler activate_pro_plan()
      // Code ici...
    }
    
    return new Response('OK', { status: 200 })
  } catch (err) {
    return new Response(`Webhook Error: ${err.message}`, { status: 400 })
  }
})
```

---

### 6️⃣ DÉPLOIEMENT

#### Option A : Vercel (Recommandé)
```bash
# Installe Vercel CLI
npm i -g vercel

# Deploy
vercel

# Configure les variables d'environnement
vercel env add VITE_STRIPE_PAYMENT_LINK_PRO
vercel env add STRIPE_SECRET_KEY
vercel env add STRIPE_WEBHOOK_SECRET

# Redeploy avec les variables
vercel --prod
```

#### Option B : Netlify
```bash
# Installe Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy --prod

# Configure les variables d'environnement dans Netlify UI
# Site settings → Environment variables
```

---

### 7️⃣ APRÈS DÉPLOIEMENT

#### A. Teste le flux PRO
1. Va sur `https://TON_DOMAINE.com`
2. Clique "Essayer 7j GRATUIT"
3. Inscris-toi → confirme email → login
4. **✅ Tu DOIS aller sur Stripe**
5. Paye avec carte test : `4242 4242 4242 4242`
6. **✅ Webhook crée le plan PRO**
7. **✅ Tu arrives sur dashboard PRO**

#### B. Teste le flux FREE
1. Va sur `https://TON_DOMAINE.com`
2. Scroll jusqu'au pricing
3. Clique "Commencer gratuitement"
4. Inscris-toi → confirme → login
5. **✅ Dashboard FREE s'affiche**

---

### 8️⃣ VÉRIFICATIONS FINALES

#### Dans Supabase :
```sql
-- Vérifier les plans créés
SELECT * FROM user_quotas ORDER BY created_at DESC LIMIT 10;
SELECT * FROM user_subscriptions ORDER BY created_at DESC LIMIT 10;
```

#### Dans Stripe Dashboard :
- **Customers** → Vérifie que les clients sont créés
- **Subscriptions** → Vérifie que les abonnements PRO sont actifs
- **Webhooks** → Vérifie que les webhooks sont reçus (pas d'erreurs)

---

## ⚠️ PROBLÈMES COURANTS

### Webhook ne fonctionne pas
- Vérifie que `STRIPE_WEBHOOK_SECRET` est correct
- Vérifie dans Stripe Dashboard → Webhooks → Recent events
- Teste le webhook avec Stripe CLI :
  ```bash
  stripe listen --forward-to https://TON_DOMAINE.com/functions/v1/stripe-webhook
  ```

### Redirection email ne marche pas
- Vérifie que l'URL est dans **Supabase → Authentication → Redirect URLs**
- Vérifie que `emailRedirectTo` utilise la bonne URL de production

### Variables d'environnement manquantes
- Sur Vercel : `vercel env ls`
- Sur Netlify : Site settings → Environment variables

---

## 📝 TON NOM DE DOMAINE

**Remplace partout** `TON_DOMAINE.com` par ton vrai domaine (ex: `pulselead.fr`)

---

Bon déploiement ! 🚀
