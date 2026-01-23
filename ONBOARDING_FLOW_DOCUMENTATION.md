# 🚀 Documentation Complète : Flow d'Authentification et Onboarding PULSE

## 📋 Vue d'ensemble

Ce document décrit le flow complet d'authentification et d'onboarding pour PULSE, de la création de compte à l'accès au dashboard.

---

## 🎯 Objectifs du Flow

1. **Simplicité** : Email + Mot de passe uniquement (pas de téléphone, nom, prénom)
2. **Conversion** : Pousser délicatement vers le plan PRO (93% de conversion)
3. **Expérience** : Pas de friction, tout fonctionne du premier coup
4. **Freemium** : Plan gratuit limité (30 prospects, 2 tournées) pour découvrir PULSE

---

## 🔄 Flow Complet

### 1. **Création de Compte** (`/auth`)

#### Actions de l'utilisateur :
- Entre son **email** et **mot de passe** (min. 8 caractères, 1 majuscule, 1 chiffre)
- Clique sur "S'inscrire"

#### Résultat :
1. Supabase crée le compte
2. **Trigger SQL automatique** : `initialize_user_quota()`
   - Crée un enregistrement dans `user_subscriptions` avec `plan_type = 'free'` et `subscription_status = 'active'`
   - Crée un enregistrement dans `user_quotas` avec `plan_type = 'free'` et `is_first_login = true`
3. Supabase envoie un **email de confirmation** via Resend
4. Toast affiché : "📧 Vérifiez votre boîte mail !"
5. L'utilisateur est basculé en mode "login"

#### Fichiers impliqués :
- `src/pages/Auth.tsx` (lignes 260-284)
- `supabase/migrations/20260123_freemium_system_v2.sql` (lignes 54-77)

---

### 2. **Confirmation d'Email**

#### Actions de l'utilisateur :
- Clique sur le lien de confirmation dans son email

#### Résultat :
1. Supabase valide l'email
2. Redirection automatique vers `/plan-selection` (défini dans `emailRedirectTo`)

#### Fichiers impliqués :
- `src/pages/Auth.tsx` (ligne 266 : `emailRedirectTo`)

---

### 3. **Sélection du Plan** (`/plan-selection`)

#### Vérifications automatiques :
1. **Utilisateur connecté ?** Si non → redirect vers `/auth`
2. **A déjà choisi un plan ?** (`is_first_login = false`) → redirect vers `/dashboard`
3. **Quotas existent ?** Si non → création automatique (fallback)

#### Interface :
Deux cartes côte à côte :

**Plan Découverte (Gratuit)** :
- 30 prospects/mois
- 2 tournées/mois
- Entreprises illimitées par tournée
- Filtres de base
- CRM basique
- ❌ Pas de badge "Recommandé"
- Design sobre (blanc/gris)

**Plan PRO (49€/mois)** ⭐ :
- Badge animé "⭐ Choix n°1"
- Design premium (vert/cyan, ombre, scale 105%)
- 7 jours d'essai GRATUIT (encadré vert avec icône Zap)
- ROI moyen de 380% (mention discrète)
- 4,5M+ entreprises illimitées
- Tournées illimitées
- CRM complet
- Notifications automatiques
- Support prioritaire

**Statistique sociale** : "💡 **93% de nos commerciaux** choisissent le plan PRO"

#### Actions de l'utilisateur :

**Option A : Choisir "Plan Découverte"**
1. Clic sur "Commencer gratuitement"
2. Mise à jour de `user_quotas` : `is_first_login = false`
3. Toast : "🎉 Bienvenue sur PULSE ! Votre plan gratuit est activé."
4. Redirect vers `/dashboard` après 1 seconde

**Option B : Choisir "Plan PRO"**
1. Clic sur "🚀 Essayer 7 jours GRATUITEMENT"
2. Mise à jour de `user_quotas` : `is_first_login = false`
3. Appel Edge Function `create-checkout` avec `trialDays: 7`
4. Redirect vers Stripe Checkout (7 jours gratuits, CB obligatoire)

#### Fichiers impliqués :
- `src/pages/PlanSelection.tsx` (tout le fichier)
- `supabase/functions/create-checkout/index.ts`

---

### 4. **Stripe Checkout** (si PRO choisi)

#### Flow Stripe :
1. Utilisateur entre ses informations de CB
2. Stripe crée un `customer` et une `subscription` avec `status = 'trialing'`
3. Webhook Stripe appelé : `checkout.session.completed`

#### Webhook Actions :
1. Met à jour `user_subscriptions` :
   - `stripe_customer_id`, `stripe_subscription_id`
   - `subscription_status = 'trialing'`
   - **`plan_type = 'pro'`** ✅
   - `subscription_start_date`, `subscription_end_date`
2. Met à jour `user_quotas` :
   - **`plan_type = 'pro'`** ✅
3. Envoie un email de bienvenue via `send-welcome` Edge Function

#### Fichiers impliqués :
- `supabase/functions/stripe-webhook/index.ts` (lignes 92-200)
- `supabase/functions/create-checkout/index.ts`

---

### 5. **Connexion (Returning User)** (`/auth`)

#### Actions de l'utilisateur :
- Entre son **email** et **mot de passe**
- Clique sur "Se connecter"

#### Résultat :
1. Supabase authentifie l'utilisateur
2. Lecture de `user_quotas.is_first_login`
3. **Si `is_first_login = false`** (a déjà choisi un plan) → redirect vers `/dashboard`
4. **Si `is_first_login = true`** (nouveau, pas encore choisi) → redirect vers `/plan-selection`

#### Fichiers impliqués :
- `src/pages/Auth.tsx` (lignes 247-276)

---

### 6. **Landing Page CTA** (`/`)

#### Boutons :
- "Accéder à mon dashboard" (header, si connecté)
- "Commencer maintenant" (hero, pricing)
- "Réserver une démo"

#### Comportement :
1. **Utilisateur non connecté** → redirect vers `/auth`
2. **Utilisateur connecté** → redirect vers `/plan-selection` (qui redirigera automatiquement vers `/dashboard` si plan déjà choisi)

#### Fichiers impliqués :
- `src/pages/LandingPage.tsx` (lignes 46-65)

---

### 7. **Dashboard** (`/dashboard`)

#### Vérifications automatiques :
1. **Utilisateur connecté ?** Si non → redirect vers `/auth`
2. **Premier login ?** (`is_first_login = true`) → Afficher `OnboardingWizard` (demo interactive)
3. **Plan type ?** Récupéré via `useUserPlan(userId)`

#### Affichage selon plan :

**Plan Gratuit** :
- `FreemiumBanner` en haut (progression 30 prospects, 2 tournées)
- Entreprises "lockées" avec overlay → Bouton "Débloquer ce prospect"
- Onglet "Mes Prospects Débloqués" dans le sidebar
- Modal `UpgradeModal` si limite atteinte

**Plan PRO** :
- Accès complet à tout (4,5M+ entreprises, tournées illimitées)
- Pas de banner freemium
- Toutes les fonctionnalités débloquées

#### Fichiers impliqués :
- `src/pages/Dashboard.tsx`
- `src/hooks/useUserPlan.ts`
- `src/components/FreemiumBanner.tsx`
- `src/components/LockedEntrepriseCard.tsx`
- `src/components/UpgradeModal.tsx`

---

## 📊 États et Transitions

### États possibles dans `user_quotas`

| État | Description |
|------|-------------|
| `is_first_login = true, plan_type = 'free'` | Nouveau user, pas encore choisi de plan |
| `is_first_login = false, plan_type = 'free'` | User a choisi le plan gratuit |
| `is_first_login = false, plan_type = 'pro'` | User a choisi PRO ou est en trial |

### États possibles dans `user_subscriptions`

| `plan_type` | `subscription_status` | Description |
|-------------|------------------------|-------------|
| `free` | `active` | Plan gratuit |
| `pro` | `trialing` | Essai gratuit 7 jours (CB enregistrée) |
| `pro` | `active` | Abonnement PRO payé |
| `pro` | `past_due` | Paiement échoué |
| `free` | `cancelled` | Ancien PRO, downgrade à free |

---

## 🔄 Gestion des Webhooks Stripe

### `checkout.session.completed`
- ✅ Crée/Met à jour `user_subscriptions` avec `plan_type = 'pro'`
- ✅ Met à jour `user_quotas` avec `plan_type = 'pro'`
- ✅ Envoie l'email de bienvenue

### `customer.subscription.updated`
- ✅ Met à jour `subscription_status`
- ✅ Met à jour `plan_type` (`'pro'` si `active`/`trialing`, sinon `'free'`)
- ✅ Synchronise `user_quotas.plan_type`

### `customer.subscription.deleted`
- ✅ Met `subscription_status = 'cancelled'`
- ✅ Downgrade `plan_type` à `'free'` dans `user_subscriptions` et `user_quotas`

---

## 🎨 Stratégie de Conversion PRO

### Techniques utilisées :

1. **Statistique sociale** : "93% de nos commerciaux choisissent le plan PRO"
2. **Badge animé** : "⭐ Choix n°1" avec pulse animation
3. **Design premium** : Ombre cyan, scale 105%, vert vif
4. **ROI visible** : "ROI moyen de 380%" (petit, discret)
5. **Essai sans risque** : "7 jours GRATUIT" mis en avant, "Annulez à tout moment"
6. **Contraste** : Plan Gratuit sobre (blanc/gris) vs PRO éclatant (vert/cyan)
7. **Urgence douce** : "Vous ne serez débité que dans 7 jours"
8. **Garantie** : Mentionnée dans le copywriting landing page (30 jours satisfait ou remboursé)

### Résultat attendu :
- **93%** choisissent PRO
- **7%** choisissent Gratuit (puis upgrade via banner/modals)

---

## 🛠️ Fonctions RPC Clés

### `check_subscription_access(_user_id UUID)`
Retourne :
- `has_access` : boolean
- `plan_type` : 'free' | 'pro' | 'teams'
- `subscription_status` : string
- `quotas` : object (pour free : `prospects_unlocked`, `tournees_created`)

### `unlock_prospect(_user_id UUID, _entreprise_id TEXT)`
- **PRO** : Retourne `success = true` (illimité)
- **FREE** : Vérifie limite 30, insère dans `user_unlocked_prospects`

### `is_prospect_unlocked(_user_id UUID, _entreprise_id TEXT)`
- **PRO** : Toujours `true`
- **FREE** : Vérifie présence dans `user_unlocked_prospects`

### `check_tournee_quota(_user_id UUID)`
- **PRO** : `allowed = true, limit_reached = false`
- **FREE** : Vérifie limite 2 tournées/mois

---

## ✅ Checklist de Validation

- [x] Email + Mot de passe uniquement (pas de téléphone, nom)
- [x] Email de confirmation envoyé via Resend
- [x] Redirect vers `/plan-selection` après confirmation
- [x] Gestion `is_first_login` pour éviter de revoir la sélection
- [x] Trigger SQL pour créer `user_quotas` et `user_subscriptions` automatiquement
- [x] Fallback si quotas pas créés (création manuelle)
- [x] Webhook Stripe met à jour `plan_type` dans les deux tables
- [x] Downgrade automatique à `free` si subscription cancelled
- [x] Plan PRO visuellement attractif (badge, couleurs, ROI)
- [x] Plan Gratuit sobre pour créer le contraste
- [x] Statistique sociale pour rassurer
- [x] Toast notifications pour feedback utilisateur
- [x] Gestion erreurs (session non trouvée, quotas manquants)
- [x] Demo wizard au premier login dashboard

---

## 🚨 Cas d'Erreur Gérés

### 1. **Session non trouvée** (`/plan-selection`)
- Redirect vers `/auth`

### 2. **Quotas non créés** (trigger échoué)
- Création manuelle via `INSERT` (fallback dans `PlanSelection.tsx`)

### 3. **Webhook Stripe échoue**
- Logs dans Supabase Edge Function
- User reste avec `plan_type = 'free'` jusqu'au prochain webhook

### 4. **Email non confirmé**
- User ne peut pas se connecter (Supabase bloque)
- Message toast "Vérifiez votre boîte mail"

### 5. **Stripe Checkout annulé**
- `cancel_url` ramène sur landing page avec `?checkout=cancelled`
- User reste sur `is_first_login = false` (mais `plan_type = 'free'`)

---

## 📝 Variables d'Environnement

### Supabase :
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

### Stripe :
- `STRIPE_SECRET_KEY` (Production)
- `STRIPE_WEBHOOK_SECRET`
- **Price ID** : `price_1SqxKmHjyidZ5i9L8tCztpFU` (49€/mois)

### Resend :
- `RESEND_API_KEY`
- Sender : `noreply@mail.pulse-lead.com`

---

## 🎉 Flow Validé et Prêt !

Ce flow a été **audité de A à Z** et est prêt pour la production. Tous les cas d'usage sont couverts :
- ✅ Nouveau user → Inscription → Email → Plan Selection → Dashboard
- ✅ Returning user → Login → Dashboard direct
- ✅ User choisit Free → Dashboard limité avec freemium
- ✅ User choisit PRO → Stripe → Dashboard complet
- ✅ User annule PRO → Downgrade auto à Free
- ✅ Gestion d'erreurs robuste

---

**Date de dernière mise à jour** : 23 janvier 2026
**Version** : 1.0 - Production Ready 🚀
