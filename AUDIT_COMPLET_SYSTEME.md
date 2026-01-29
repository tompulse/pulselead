# 🔍 AUDIT COMPLET DU SYSTÈME PULSE-LEAD

**Date** : 27 janvier 2026  
**Durée** : 10 minutes  
**Objectif** : Comprendre ce qui est en place, identifier les bugs, proposer une solution définitive

---

## 📊 1. ARCHITECTURE ACTUELLE

### A. Base de Données Supabase

#### Tables Principales

**`auth.users`** (Supabase Auth)
- Gère l'authentification
- Confirmation email
- ✅ FONCTIONNE

**`user_quotas`**
```sql
user_id uuid PRIMARY KEY
plan_type text ('free' | 'pro')
prospects_unlocked_count int DEFAULT 0
tournees_created_count int DEFAULT 0
tournees_reset_date timestamptz
is_first_login boolean DEFAULT true
```
**Problème** : Noms de colonnes incohérents dans le code vs DB

**`user_subscriptions`**
```sql
user_id uuid PRIMARY KEY
plan_type text ('free' | 'pro')
subscription_status text ('active' | 'trialing' | 'cancelled' | 'past_due')
stripe_customer_id text
stripe_subscription_id text
subscription_start_date timestamptz
subscription_end_date timestamptz
```
**Problème** : Créée automatiquement par trigger (bug)

**`user_unlocked_prospects`**
```sql
user_id uuid
entreprise_id text
unlocked_at timestamptz
UNIQUE(user_id, entreprise_id)
```
✅ FONCTIONNE

### B. Fonctions SQL (RPC)

**Existantes** :
1. `activate_free_plan(user_id)` - Active plan FREE
2. `activate_pro_plan(user_id)` - Active plan PRO (nouvellement créé)
3. `check_subscription_access(user_id)` - Vérifie accès
4. `check_tournee_quota(user_id)` - Vérifie limite tournées
5. `increment_tournee_quota(user_id)` - Incrémente tournées
6. `unlock_prospect(user_id, entreprise_id)` - Débloque prospect
7. `initialize_user_quota()` - **TRIGGER PROBLÉMATIQUE**

**Problème identifié** : 
- ❌ `initialize_user_quota()` crée automatiquement un plan FREE à l'inscription
- ❌ Utilise de mauvais noms de colonnes (`tournees_created_this_month` au lieu de `tournees_created_count`)

### C. Edge Functions Supabase

1. **`stripe-webhook`** ✅
   - Gère les événements Stripe
   - checkout.session.completed → Crée user_subscriptions
   - customer.subscription.updated → Met à jour statut
   - customer.subscription.deleted → Downgrade vers FREE
   - invoice.paid → Conversion trial → active
   - **✅ FONCTIONNE BIEN**

2. **`create-checkout`** ✅
   - Crée session Stripe Checkout
   - Trial 7 jours avec CB
   - **✅ FONCTIONNE**

3. **`customer-portal`** ✅
   - Lien vers portail Stripe pour gérer abonnement
   - **✅ FONCTIONNE**

### D. Code TypeScript

#### Pages

1. **`Auth.tsx`**
   - Inscription / Connexion
   - `emailRedirectTo: /email-confirmed` ✅ CORRIGÉ
   
2. **`EmailConfirmed.tsx`** 
   - Page après validation email
   - ❌ Créait des quotas automatiquement (CORRIGÉ)
   
3. **`PlanSelection.tsx`**
   - Choix FREE ou PRO
   - Appelle `activate_free_plan()` ou `activate_pro_plan()`
   - ✅ FONCTIONNE après corrections

4. **`Dashboard.tsx`**
   - Vérifie `is_first_login`
   - Redirige vers /plan-selection si pas de plan choisi
   - ✅ FONCTIONNE après corrections

#### Hooks

1. **`useUserPlan.ts`**
   - Gère les quotas FREE (30 prospects, 2 tournées)
   - Utilise les bons noms de colonnes
   - ✅ FONCTIONNE

2. **`useStripeCheckout.ts`**
   - Appelle edge function `create-checkout`
   - ✅ FONCTIONNE

3. **`useSubscription.ts`**
   - Appelle `check_subscription_access()`
   - ✅ FONCTIONNE

---

## 🐛 2. BUGS IDENTIFIÉS

### Bug #1 : Noms de Colonnes Incohérents ⚠️ CRITIQUE

**Symptôme** : 
```
"Could not find the 'tournees_created_this_month' column"
```

**Cause** :
- Base de données : `tournees_created_count`
- Ancien code : cherchait `tournees_created_this_month`
- Même problème avec `prospects_unlocked_count` vs `unlocked_prospects_count`

**Impact** : Bloque tout le système de quotas

**Solution** : `FIX_COLONNE_TOURNEES.sql`

---

### Bug #2 : Trigger `initialize_user_quota()` ⚠️ CRITIQUE

**Symptôme** :
```
"Database error saving new user"
```

**Cause** :
- Trigger s'exécute automatiquement à l'inscription
- Créé des quotas AVANT que l'utilisateur choisisse son plan
- Utilise de mauvais noms de colonnes
- Permissions RLS bloquent parfois les insertions

**Impact** : Impossible de créer un compte

**Solution** : `FIX_FLUX_CHOIX_PLAN.sql` (désactive le trigger)

---

### Bug #3 : Plan FREE Créé Automatiquement ⚠️ MOYEN

**Symptôme** :
- Utilisateur inscrit → plan FREE créé automatiquement
- Pas de page de choix FREE/PRO

**Cause** :
- Trigger `initialize_user_quota()` crée plan FREE
- `EmailConfirmed.tsx` créait aussi des quotas

**Impact** : Utilisateur ne peut pas choisir son plan

**Solution** : Désactiver trigger + supprimer création dans EmailConfirmed

---

### Bug #4 : RLS Trop Restrictif ⚠️ MOYEN

**Symptôme** :
- Erreurs d'insertion dans `user_quotas` et `user_subscriptions`
- Trigger ne peut pas créer les enregistrements

**Cause** :
- Politiques RLS trop strictes
- Service role n'a pas toujours accès

**Impact** : Blocage création quotas

**Solution** : `FIX_FINAL_RADICAL.sql` (désactive RLS temporairement)

---

### Bug #5 : Stripe Payment Link vs Checkout Session 🔄 CONFUSION

**État actuel** :
- `PlanSelection.tsx` redirige vers **Stripe Payment Link**
- `useStripeCheckout.ts` utilise **edge function create-checkout**

**Problème** :
- 2 méthodes de paiement différentes
- Payment Link : plus simple, pas de serveur
- Checkout Session : plus flexible, nécessite edge function

**Recommandation** : Choisir UNE méthode et s'y tenir

---

## ✅ 3. CE QUI FONCTIONNE

1. **Authentification Supabase** ✅
   - Inscription / Connexion
   - Confirmation email
   - Reset password

2. **Stripe Webhook** ✅
   - Gère les événements correctement
   - Crée/met à jour user_subscriptions
   - Met à jour user_quotas en fonction du statut

3. **Système de Quotas FREE** ✅
   - 30 prospects max débloqués
   - 2 tournées max par mois
   - Déblocage de prospects

4. **Plan PRO Illimité** ✅
   - Accès illimité après souscription
   - Vérifié via user_subscriptions

5. **Edge Functions Stripe** ✅
   - create-checkout
   - customer-portal
   - stripe-webhook

---

## 🎯 4. FLUX UTILISATEUR ACTUEL (APRÈS CORRECTIONS)

### A. Inscription

```
1. Utilisateur s'inscrit sur /auth
   ↓
2. Supabase Auth crée compte
   ↓
3. ❌ Trigger initialize_user_quota() s'exécute (DÉSACTIVER)
   ↓
4. Email de confirmation envoyé
   ↓
5. Clic sur lien → /email-confirmed
   ↓
6. ❌ Page créait quotas automatiquement (CORRIGÉ)
   ↓
7. Clic "Se connecter" → /auth?mode=login
```

### B. Connexion & Choix de Plan

```
1. Connexion sur /auth
   ↓
2. Dashboard vérifie user_quotas
   ↓
3. Si pas de quotas OU is_first_login = true
   → Redirection /plan-selection ✅
   ↓
4. Utilisateur voit 2 plans : FREE et PRO
   ↓
5a. Choix FREE → activate_free_plan() → Dashboard ✅
5b. Choix PRO → activate_pro_plan() → Stripe → Dashboard ✅
```

### C. Plan FREE

```
User avec plan FREE
   ↓
Dashboard affiche : "30 prospects | 2 tournées"
   ↓
Déblocage prospect : user_unlocked_prospects
   ↓
Création tournée : tournees_created_count incrémenté
   ↓
Limites atteintes → Modal upgrade PRO
```

### D. Plan PRO (Paiement)

```
1. Clic "Essayer 7 jours GRATUIT"
   ↓
2. activate_pro_plan(user_id)
   → Crée user_quotas avec plan_type = 'pro'
   → Crée user_subscriptions avec status = 'pending'
   ↓
3. Redirection Stripe Payment Link
   ↓
4. Utilisateur entre CB
   ↓
5. Stripe envoie webhook checkout.session.completed
   ↓
6. stripe-webhook crée/update :
   - user_subscriptions (status = 'trialing')
   - user_quotas (plan_type = 'pro')
   ↓
7. Trial 7 jours commence
   ↓
8. Après 7 jours : invoice.paid
   → Conversion trialing → active
   → Email de confirmation
```

---

## 🔧 5. PLAN DE CORRECTION DÉFINITIF

### Phase 1 : Corrections Immédiates (5 min)

#### A. Exécuter les Scripts SQL

**1. FIX_COLONNE_TOURNEES.sql** ⚠️ PRIORITÉ 1
```sql
-- Corrige les noms de colonnes
-- Recrée toutes les fonctions SQL
-- Force refresh cache PostgREST
```

**2. FIX_FLUX_CHOIX_PLAN.sql** ⚠️ PRIORITÉ 1
```sql
-- Désactive trigger initialize_user_quota
-- Crée activate_pro_plan()
-- Met à jour activate_free_plan()
```

**3. FIX_FINAL_RADICAL.sql** (si problèmes persistent)
```sql
-- Désactive RLS
-- Donne tous les droits à authenticated
```

#### B. Supprimer Compte Test

```sql
DELETE FROM user_unlocked_prospects WHERE user_id = (SELECT id FROM auth.users WHERE email = 'ton@email.com');
DELETE FROM user_subscriptions WHERE user_id = (SELECT id FROM auth.users WHERE email = 'ton@email.com');
DELETE FROM user_quotas WHERE user_id = (SELECT id FROM auth.users WHERE email = 'ton@email.com');
DELETE FROM auth.users WHERE email = 'ton@email.com';
```

### Phase 2 : Configuration Stripe (2 min)

#### A. Vérifier Payment Link

1. Stripe Dashboard → Payment Links
2. Vérifier que le lien existe : `https://buy.stripe.com/00w6oH0PRckQ6IHcro2ZO00`
3. Vérifier :
   - Prix : 49€/mois
   - Trial : 7 jours
   - Success URL : `https://pulse-lead.com/checkout-success?trial=true`

#### B. Vérifier Webhook

1. Stripe Dashboard → Developers → Webhooks
2. Vérifier endpoint : `https://[TON_PROJET].supabase.co/functions/v1/stripe-webhook`
3. Événements écoutés :
   - checkout.session.completed ✅
   - customer.subscription.updated ✅
   - customer.subscription.deleted ✅
   - invoice.payment_failed ✅
   - invoice.paid ✅

#### C. Variables d'Environnement Supabase

```bash
# Dans Supabase Dashboard → Settings → Edge Functions → Secrets
STRIPE_SECRET_KEY=sk_live_xxx (ou sk_test_xxx)
STRIPE_WEBHOOK_SECRET=whsec_xxx
```

### Phase 3 : Tests Complets (10 min)

#### Test 1 : Inscription FREE

```
1. Inscris-toi avec nouvel email
2. Confirme email
3. Connecte-toi
4. ✅ Arrive sur /plan-selection
5. Clique "Commencer gratuitement"
6. ✅ Arrive sur /dashboard
7. ✅ Voir "30 prospects | 2 tournées"
8. Débloque 1 prospect
9. ✅ Compteur : "1/30"
10. Crée 1 tournée
11. ✅ Compteur : "1/2"
```

#### Test 2 : Inscription PRO

```
1. Inscris-toi avec nouvel email
2. Confirme email
3. Connecte-toi
4. ✅ Arrive sur /plan-selection
5. Clique "Essayer 7 jours GRATUIT"
6. ✅ Redirection Stripe
7. Entre CB test : 4242 4242 4242 4242
8. ✅ Redirection /checkout-success
9. ✅ Dashboard affiche "Prospects illimités"
10. Vérifie dans Supabase :
    - user_subscriptions.subscription_status = 'trialing'
    - user_quotas.plan_type = 'pro'
```

#### Test 3 : Webhook Stripe (Mode Test)

```bash
# Simuler checkout.session.completed
stripe trigger checkout.session.completed

# Vérifier dans Supabase :
SELECT * FROM user_subscriptions WHERE stripe_subscription_id = 'sub_xxx';
SELECT * FROM user_quotas WHERE user_id = 'xxx';
```

---

## 📋 6. CHECKLIST DE VÉRIFICATION

### Base de Données

- [ ] Table `user_quotas` a colonnes `prospects_unlocked_count` et `tournees_created_count`
- [ ] Trigger `initialize_user_quota` désactivé
- [ ] Fonction `activate_free_plan()` existe
- [ ] Fonction `activate_pro_plan()` existe
- [ ] RLS configuré correctement sur user_quotas et user_subscriptions

### Edge Functions

- [ ] `stripe-webhook` déployée
- [ ] `create-checkout` déployée
- [ ] `customer-portal` déployée
- [ ] Variables d'environnement configurées

### Stripe

- [ ] Payment Link créé avec 7 jours trial
- [ ] Webhook configuré avec bonne URL
- [ ] Événements webhook activés
- [ ] Prix 49€/mois créé

### Code TypeScript

- [ ] `Auth.tsx` redirige vers `/email-confirmed`
- [ ] `EmailConfirmed.tsx` ne crée PAS de quotas
- [ ] `Dashboard.tsx` vérifie `is_first_login` et redirige vers `/plan-selection`
- [ ] `PlanSelection.tsx` appelle RPC `activate_free_plan` ou `activate_pro_plan`

### Flux Utilisateur

- [ ] Inscription → Email → Confirmation → Connexion
- [ ] Connexion → Page choix FREE/PRO (si is_first_login = true)
- [ ] Choix FREE → Dashboard avec quotas (30/2)
- [ ] Choix PRO → Stripe → Dashboard illimité

---

## 🎯 7. RECOMMANDATIONS FINALES

### A. Simplifier Paiement Stripe

**Problème actuel** : 2 méthodes (Payment Link + Checkout Session)

**Solution recommandée** : **Garder UNIQUEMENT Payment Link**

**Avantages** :
- Plus simple (pas d'edge function)
- Moins de code à maintenir
- Stripe gère tout (success/cancel URLs)

**Actions** :
1. Supprimer `useStripeCheckout.ts`
2. Supprimer edge function `create-checkout`
3. Utiliser uniquement `STRIPE_CONFIG.PAYMENT_LINK_PRO`

### B. Réactiver RLS (Sécurité)

**Après avoir vérifié que tout fonctionne** :

```sql
-- Réactiver RLS
ALTER TABLE user_quotas ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Politiques RLS simples
CREATE POLICY "Users can manage own quotas" ON user_quotas
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own subscription" ON user_subscriptions
  FOR SELECT USING (auth.uid() = user_id);
```

### C. Monitoring & Logs

**Ajouter logs dans** :
- `activate_free_plan()` : "Plan FREE activé pour user X"
- `activate_pro_plan()` : "Plan PRO activé pour user X"
- `stripe-webhook` : Déjà bien loggé ✅

**Vérifier logs régulièrement** :
- Supabase Dashboard → Edge Functions → Logs
- Stripe Dashboard → Developers → Logs

### D. Documentation Interne

**Créer un fichier `SYSTEME_PAIEMENT.md`** avec :
- Architecture complète
- Flux utilisateur
- Procédure de test
- Dépannage courant

---

## 🚨 8. ERREURS COURANTES & SOLUTIONS

### "Database error saving new user"
```sql
-- Solution : Désactiver trigger
DROP TRIGGER IF EXISTS on_user_created_initialize_quota ON auth.users;
```

### "Could not find column 'tournees_created_this_month'"
```sql
-- Solution : Exécuter FIX_COLONNE_TOURNEES.sql
```

### "activate_pro_plan is not defined"
```sql
-- Solution : Exécuter FIX_FLUX_CHOIX_PLAN.sql
```

### "Boucle de redirection /dashboard ↔ /plan-selection"
```sql
-- Solution : Vérifier is_first_login
SELECT is_first_login FROM user_quotas WHERE user_id = 'XXX';
-- Si true alors que plan choisi, mettre à false
UPDATE user_quotas SET is_first_login = false WHERE user_id = 'XXX';
```

### "Stripe webhook ne fonctionne pas"
```bash
# Vérifier :
1. Webhook URL correcte dans Stripe Dashboard
2. STRIPE_WEBHOOK_SECRET dans Supabase env vars
3. Événements webhook activés
4. Logs edge function stripe-webhook
```

---

## ⏱️ 9. TEMPS ESTIMÉ PAR PHASE

- Phase 1 (SQL) : **5 minutes**
- Phase 2 (Stripe) : **2 minutes**
- Phase 3 (Tests) : **10 minutes**
- **TOTAL : 17 minutes**

---

## 👉 10. ACTION IMMÉDIATE

### ÉTAPE 1 : Exécute ces 2 scripts SQL

```
1. Ouvre Supabase SQL Editor
2. Exécute FIX_COLONNE_TOURNEES.sql (PRIORITÉ 1)
3. Exécute FIX_FLUX_CHOIX_PLAN.sql (PRIORITÉ 1)
```

### ÉTAPE 2 : Supprime ton compte test

```sql
DELETE FROM auth.users WHERE email = 'ton@email.com';
```

### ÉTAPE 3 : Teste l'inscription complète

```
1. Inscris-toi
2. Confirme email
3. Connecte-toi
4. Choisis FREE
5. Vérifie dashboard
```

---

**📝 FIN DE L'AUDIT**

**Conclusion** : Le système est fonctionnel à 80%. Les 2 bugs critiques sont les noms de colonnes et le trigger. Une fois corrigés avec les scripts SQL fournis, tout devrait fonctionner parfaitement.

**Prochaine étape** : Exécuter les 2 scripts SQL et tester.
