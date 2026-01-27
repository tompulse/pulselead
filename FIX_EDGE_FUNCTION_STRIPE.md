# 🔧 FIX EDGE FUNCTION STRIPE (GUIDE COMPLET)

## ❌ **PROBLÈME**

L'Edge Function `create-checkout` échoue → User ne peut pas accéder à Stripe

---

## ✅ **SOLUTION : Vérifier + Déployer l'Edge Function**

### **ÉTAPE 1 : Vérifier les Variables d'Environnement**

1. Va sur **[Supabase Dashboard](https://supabase.com/dashboard)**
2. Projet **PULSE** → **Edge Functions** (dans le menu gauche)
3. Clic sur **"Secrets"** ou **"Edge Function Secrets"**
4. Vérifie que `STRIPE_SECRET_KEY` existe :
   - ✅ **Si elle existe** : Passe à l'étape 2
   - ❌ **Si elle n'existe pas** : Crée-la avec ta clé secrète Stripe

#### Comment créer `STRIPE_SECRET_KEY` :

1. Va sur **[Stripe Dashboard](https://dashboard.stripe.com/apikeys)**
2. Copie ta **Secret key** (commence par `sk_live_...` ou `sk_test_...`)
3. Retourne sur **Supabase** → **Edge Functions** → **Secrets**
4. Clic **"New secret"**
5. Name: `STRIPE_SECRET_KEY`
6. Value: `sk_test_...` (ou `sk_live_...`)
7. Save

---

### **ÉTAPE 2 : Déployer l'Edge Function**

#### **Option A : Via Supabase CLI (Recommandé)**

```bash
# 1. Installer Supabase CLI (si pas déjà fait)
brew install supabase/tap/supabase

# 2. Login
supabase login

# 3. Link ton projet
supabase link --project-ref VOTRE_PROJECT_REF

# 4. Déployer create-checkout
supabase functions deploy create-checkout
```

**Résultat attendu** :
```
Deploying create-checkout...
✓ create-checkout deployed successfully
```

#### **Option B : Via GitHub Actions (Automatique)**

Si tu as déjà un workflow GitHub Actions configuré, l'Edge Function se déploie automatiquement à chaque push.

Vérifie dans **GitHub** → **Actions** que le dernier workflow s'est bien terminé.

---

### **ÉTAPE 3 : Vérifier que l'Edge Function fonctionne**

#### **Dans Supabase Dashboard** :

1. **Edge Functions** → **create-checkout**
2. Clic sur **"Logs"**
3. Tu devrais voir les logs récents (même si vides, c'est bon signe)
4. Si tu vois "Function not found" → L'Edge Function n'est pas déployée (retourne à Étape 2)

#### **Test manuel dans Supabase SQL Editor** :

```sql
-- Vérifier que l'Edge Function est accessible
SELECT * FROM pg_catalog.pg_proc WHERE proname = 'invoke';
```

Si aucune erreur, c'est bon.

---

### **ÉTAPE 4 : Tester le Flow Complet**

1. **Supprime les users de test** dans **Supabase** → **Authentication** → **Users**
2. Va sur **https://pulse-lead.com**
3. Clic **"Essayer 7j GRATUIT"**
4. Créé compte → Confirme email
5. Tu arrives sur **Dashboard**
6. Tu devrais voir un toast : **"⏳ Redirection automatique..."**
7. Après 1-2 secondes :
   - ✅ **Succès** : Redirect vers Stripe checkout
   - ❌ **Échec** : Toast "Redirection manuelle requise"

---

## 🔍 **DEBUG : Si ça ne marche toujours pas**

### **Vérifier les logs de l'Edge Function**

1. **Supabase** → **Edge Functions** → **create-checkout** → **Logs**
2. Cherche les erreurs :
   - `STRIPE_SECRET_KEY is not set` → Manque la variable d'environnement
   - `Authentication error` → Problème de token
   - `No priceId provided` → Bug dans le code (contacte-moi)
   - `Function not found` → Edge Function pas déployée

### **Vérifier dans Console Browser**

1. Ouvre **Chrome DevTools** (F12)
2. Va sur **Console**
3. Reproduis le problème (créé compte PRO → confirme email)
4. Cherche les logs :
   - `[DASHBOARD] Checkout response:` → Voir l'erreur exacte
   - `[DASHBOARD] Checkout error:` → Détails de l'erreur

### **Commandes de diagnostic**

```bash
# Vérifier que l'Edge Function existe localement
ls -la supabase/functions/create-checkout/

# Vérifier le contenu
cat supabase/functions/create-checkout/index.ts

# Re-déployer en forçant
supabase functions deploy create-checkout --no-verify-jwt
```

---

## 🎯 **FLOW ACTUEL (APRÈS FIX)**

```
User signup (PRO) → Email → Clic lien
    ↓
Auth.tsx:
  - Crée quotas (plan_type='pro')
  - Redirect → /dashboard
    ↓
Dashboard.tsx:
  - Détecte PRO sans subscription
  - Toast "Redirection automatique..."
  - Appel create-checkout Edge Function
    ↓
    ├─ Succès → window.location.href = Stripe URL ✅
    └─ Échec → Toast "Redirection manuelle" + Bouton manuel ✅
```

---

## 📞 **SI BLOQUÉ**

1. Envoie-moi les **logs de l'Edge Function** (Supabase → Edge Functions → create-checkout → Logs)
2. Envoie-moi la **console browser** (F12 → Console → Screenshot)
3. Dis-moi à quelle étape ça bloque

---

**APPLIQUE CES ÉTAPES ET RETESTE ! 🚀**
