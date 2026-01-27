# 🔧 FIX: Erreur "Failed to send a request to the Edge Function"

## 🎯 **PROBLÈME**

Lors du clic sur "Plan PRO", l'erreur suivante apparaît :
```
Erreur de paiement
Failed to send a request to the Edge Function
```

---

## 🔍 **CAUSES POSSIBLES**

1. ❌ L'Edge Function `create-checkout` n'est pas déployée sur Supabase
2. ❌ Variables d'environnement manquantes (`STRIPE_SECRET_KEY`)
3. ❌ Permissions insuffisantes

---

## ✅ **SOLUTION 1 : VÉRIFIER LE DÉPLOIEMENT**

### **1. Va sur Supabase Dashboard**

1. Ouvre [supabase.com](https://supabase.com)
2. Sélectionne ton projet **PULSE**
3. Dans le menu de gauche, clique sur **"Edge Functions"**

### **2. Vérifie si `create-checkout` existe**

Tu dois voir une fonction nommée **`create-checkout`** dans la liste.

#### **SI ELLE EXISTE** ✅
- Passe à la Solution 2 (Variables d'environnement)

#### **SI ELLE N'EXISTE PAS** ❌
- Tu dois la déployer (voir Solution 3)

---

## ✅ **SOLUTION 2 : VÉRIFIER LES VARIABLES D'ENVIRONNEMENT**

### **1. Dans Supabase Dashboard**

1. Va dans **"Edge Functions"**
2. Clique sur **`create-checkout`**
3. Clique sur **"Secrets"** (ou "Environment Variables")

### **2. Vérifie que ces variables existent :**

| Variable | Valeur | Description |
|----------|--------|-------------|
| `STRIPE_SECRET_KEY` | `sk_live_...` ou `sk_test_...` | Clé secrète Stripe |
| `SUPABASE_URL` | Automatique | URL de ton projet Supabase |
| `SUPABASE_ANON_KEY` | Automatique | Clé publique Supabase |

### **3. Si `STRIPE_SECRET_KEY` manque :**

1. Va sur [dashboard.stripe.com](https://dashboard.stripe.com)
2. Clique sur **"Developers"** → **"API keys"**
3. Copie ta **"Secret key"** (commence par `sk_test_...` ou `sk_live_...`)
4. Retourne sur Supabase Edge Functions
5. Ajoute un nouveau secret : `STRIPE_SECRET_KEY` = ta clé copiée
6. **Sauvegarde**

---

## ✅ **SOLUTION 3 : DÉPLOYER L'EDGE FUNCTION**

Si l'Edge Function n'existe pas sur Supabase, tu dois la déployer.

### **Option A : Depuis ton terminal (recommandé)**

```bash
# 1. Va dans le dossier du projet
cd /Users/raws/pulse-project/pulselead

# 2. Déploie la fonction
supabase functions deploy create-checkout

# 3. Définir le secret Stripe
supabase secrets set STRIPE_SECRET_KEY=sk_test_TON_SECRET_KEY_ICI
```

### **Option B : Redéployer toutes les fonctions**

```bash
# Déployer toutes les Edge Functions d'un coup
supabase functions deploy
```

---

## ✅ **SOLUTION 4 : VÉRIFICATION RAPIDE (SI SUPABASE CLI N'EST PAS INSTALLÉ)**

Si tu n'as pas Supabase CLI installé, voici une solution de contournement :

### **1. Vérifie manuellement dans Supabase Dashboard**

1. Va dans **Edge Functions**
2. Clique sur **"Deploy new function"**
3. Upload le fichier `supabase/functions/create-checkout/index.ts`
4. Nomme-la **`create-checkout`**
5. Sauvegarde

### **2. Configure les secrets**

- Ajoute `STRIPE_SECRET_KEY` comme expliqué dans Solution 2

---

## 🔍 **VÉRIFICATION FINALE**

Pour tester si l'Edge Function fonctionne :

1. Va sur **Supabase Dashboard** → **Edge Functions**
2. Clique sur **`create-checkout`**
3. Clique sur **"Invoke"** (bouton test)
4. Dans le body, mets :
```json
{
  "priceId": "price_1SqxKmHjyidZ5i9L8tCztpFU"
}
```
5. Clique sur **"Execute"**

### **Résultat attendu :**
- ✅ **200 OK** avec une URL Stripe : Tout fonctionne !
- ❌ **500 Error** avec "STRIPE_SECRET_KEY is not set" : Ajoute le secret
- ❌ **404 Not Found** : L'Edge Function n'est pas déployée

---

## 🚀 **APRÈS LE FIX**

1. Retourne sur **https://pulse-lead.com/plan-selection**
2. Clique sur **"Essayer 7 jours GRATUITEMENT"**
3. Tu dois être redirigé vers **Stripe Checkout** ✅

---

## ⚠️ **IMPORTANT : PRICE ID**

Vérifie que le Price ID dans le code correspond à ton abonnement Stripe à **49€/mois** :

1. Va sur [dashboard.stripe.com](https://dashboard.stripe.com)
2. **Products** → Ton produit PULSE
3. Copie le **Price ID** (commence par `price_...`)
4. Si différent de `price_1SqxKmHjyidZ5i9L8tCztpFU`, modifie dans :
   - `src/pages/PlanSelection.tsx` ligne 193
   - `src/components/dashboard/SubscriptionManagement.tsx`

---

## 📊 **LOGS POUR DÉBUG**

Si l'erreur persiste, consulte les logs :

1. **Supabase Dashboard** → **Edge Functions** → **`create-checkout`**
2. Clique sur **"Logs"**
3. Cherche les erreurs récentes
4. Envoie-moi les logs si besoin

---

**Commence par vérifier la Solution 2 (variables d'environnement), c'est souvent ça ! 🎯**
