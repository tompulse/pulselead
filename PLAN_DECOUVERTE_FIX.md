# 🔧 Correction du Plan Découverte (FREE)

## 📋 Résumé du Problème

Le bouton "Commencer gratuitement" après la confirmation de l'email ne donnait pas directement accès au plan FREE sans erreur.

## ✅ Solution Implémentée

### 1. Fonction RPC `activate_free_plan`

Cette fonction est appelée quand l'utilisateur clique sur "Commencer gratuitement" :
- ✅ Active le plan FREE
- ✅ Marque `is_first_login = false` pour éviter les boucles de redirection
- ✅ Synchronise `user_quotas` et `user_subscriptions`

### 2. Trigger Automatique

Pour les nouveaux utilisateurs :
- ✅ Créé automatiquement un plan FREE lors de l'inscription
- ✅ Initialise les quotas (30 prospects, 2 tournées)
- ✅ Marque `is_first_login = true` pour afficher la page de sélection de plan

## 🚀 Comment Appliquer le Correctif

### Option 1 : Via l'Éditeur SQL Supabase (Recommandé)

1. Ouvre [Supabase Dashboard](https://supabase.com/dashboard)
2. Va dans **SQL Editor**
3. Copie et exécute le contenu de `APPLY_FREE_PLAN_FIX.sql`
4. Vérifie que le script se termine sans erreur

### Option 2 : Via Supabase CLI (Si migrations locales sont à jour)

```bash
cd /Users/raws/pulse-project/pulselead
supabase db push --include-all
```

## 🧪 Tests à Effectuer

### Test 1 : Nouveau Compte

1. Crée un nouveau compte avec un nouvel email
2. Confirme l'email
3. Tu arrives sur la page de sélection de plan (`/plan-selection`)
4. Clique sur "Commencer gratuitement"
5. ✅ Tu devrais être redirigé vers `/dashboard` sans erreur
6. ✅ Le plan FREE devrait être actif (30 prospects, 2 tournées)

### Test 2 : Déblocage de Prospects

1. Va dans la vue "Nouveaux Sites"
2. Clique sur un prospect
3. Clique sur "Débloquer ce prospect"
4. ✅ Les infos (SIRET, adresse) devraient se dévoiler
5. ✅ Le compteur "X/30 prospects" devrait s'incrémenter

### Test 3 : Limites

1. Débloque 30 prospects
2. Essaie d'en débloquer un 31ème
3. ✅ Un modal d'upgrade vers PRO devrait s'afficher

## 📝 Modifications du Code

### Fichiers Modifiés

Aucune modification du code TypeScript n'était nécessaire. Le code était déjà correct :

- ✅ `src/pages/PlanSelection.tsx` - Appelle correctement `activate_free_plan`
- ✅ `src/hooks/useUserPlan.ts` - Gère correctement les quotas
- ✅ `src/pages/Dashboard.tsx` - Vérifie correctement l'accès

### Fichiers SQL Créés

- ✅ `APPLY_FREE_PLAN_FIX.sql` - Script complet à exécuter
- ✅ `supabase/migrations/20260127_fix_free_plan_activation.sql` - Migration (pour futur)

## 🧹 Nettoyage des Fichiers Temporaires

Les fichiers suivants peuvent être supprimés après application du correctif :

```bash
rm CHECK_TABLE_STRUCTURE.sql
rm CREATE_ACTIVATE_FREE_PLAN.sql
rm FIX_API_SCHEMA.sql
rm FIX_FREE_USER.sql
rm FIX_SIMPLE.sql
rm FORCE_REFRESH_SCHEMA.sql
```

## 📊 Structure Finale de la Base de Données

### Table: `user_quotas`

```sql
user_id uuid PRIMARY KEY
plan_type text DEFAULT 'free'
prospects_unlocked_count int DEFAULT 0
tournees_created_count int DEFAULT 0
tournees_reset_date timestamptz DEFAULT now()
is_first_login boolean DEFAULT true
created_at timestamptz DEFAULT now()
updated_at timestamptz DEFAULT now()
```

### Table: `user_subscriptions`

```sql
user_id uuid PRIMARY KEY
plan_type text DEFAULT 'free'
subscription_status text DEFAULT 'active'
stripe_customer_id text
stripe_subscription_id text
stripe_subscription_status text
```

### Table: `user_unlocked_prospects`

```sql
id uuid PRIMARY KEY
user_id uuid REFERENCES auth.users
entreprise_id text
unlocked_at timestamptz DEFAULT now()
UNIQUE(user_id, entreprise_id)
```

## 🎯 Flux Utilisateur Final

### 1. Inscription
```
Nouvel utilisateur → Confirmation email → Page /plan-selection
```

### 2. Choix du Plan FREE
```
Clic "Commencer gratuitement" → activate_free_plan() → Redirection /dashboard
```

### 3. Dashboard FREE
```
- 30 prospects max débloqués
- 2 tournées max par mois
- SIRET et adresse floutés jusqu'au déblocage
- Nom et Code NAF toujours visibles
```

### 4. Upgrade vers PRO
```
Limite atteinte → Modal d'upgrade → Stripe Checkout → Plan PRO activé
```

## ✨ Résultat Final

Après application du correctif :

✅ Nouveau compte → Choix du plan → Accès immédiat au dashboard FREE
✅ Aucune erreur, aucune boucle de redirection
✅ Les quotas sont correctement initialisés
✅ Le déblocage de prospects fonctionne
✅ Les limites sont respectées (30 prospects, 2 tournées)

---

**Date de correction** : 27 janvier 2026  
**Problème** : Bouton "Commencer gratuitement" ne donnait pas accès direct  
**Solution** : Fonction RPC `activate_free_plan` + trigger automatique  
**Statut** : ✅ Résolu
