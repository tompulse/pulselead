# ✅ NOUVEAU FLUX - Choix Plan après Connexion

## 🎯 Flux Corrigé

```
1. Inscription → Email envoyé
   ↓
2. Clic lien email → Page "Email confirmé ✅"
   ↓
3. Connexion avec email/password
   ↓
4. ⭐ REDIRECTION AUTOMATIQUE → Page "Choisir votre plan"
   ↓
5. Choix FREE → Dashboard (30 prospects, 2 tournées)
   OU
   Choix PRO → Stripe → Dashboard (illimité)
```

## 📝 Changements Faits

### 1. Code TypeScript Modifié

#### `src/pages/EmailConfirmed.tsx`
- ❌ Ne crée PLUS de quotas automatiquement
- ✅ Affiche juste "Email confirmé"
- ✅ Bouton "Se connecter"

#### `src/pages/Dashboard.tsx`
- ✅ Vérifie si user_quotas existe
- ✅ Si pas de quotas OU is_first_login = true → Redirection vers /plan-selection

#### `src/pages/PlanSelection.tsx`
- ✅ Si is_first_login = false → Redirection vers dashboard
- ✅ Sinon → Affiche choix FREE/PRO
- ✅ Bouton FREE → appelle activate_free_plan()
- ✅ Bouton PRO → appelle activate_pro_plan()

### 2. SQL Modifié

#### `FIX_FLUX_CHOIX_PLAN.sql`
- ✅ Trigger complètement désactivé (ne crée plus rien automatiquement)
- ✅ activate_free_plan() crée quotas avec is_first_login = false
- ✅ activate_pro_plan() créé (nouveau) pour le plan PRO

## 🚀 Comment Tester

### Étape 1 : Exécuter le Script SQL

```sql
-- Dans Supabase SQL Editor
-- Copie TOUT le contenu de FIX_FLUX_CHOIX_PLAN.sql
-- Exécute
```

**Important** : Si tu as un compte test existant, décommente ces lignes dans le script :

```sql
DELETE FROM user_unlocked_prospects 
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'ton@email.com');

DELETE FROM user_subscriptions 
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'ton@email.com');

DELETE FROM user_quotas 
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'ton@email.com');
```

### Étape 2 : Tester le Flux

#### A. Supprimer ton compte test (si tu as déjà testé)

```sql
DELETE FROM auth.users WHERE email = 'ton@email.com';
```

#### B. S'inscrire

1. Ouvre navigateur incognito
2. Va sur pulse-lead.com
3. Inscris-toi avec un email
4. ✅ **Attendu** : Toast "Vérifiez votre boîte mail !"

#### C. Confirmer l'email

1. Ouvre ta boîte mail
2. Clique sur le lien
3. ✅ **Attendu** : Page "Email confirmé ✅"
4. ✅ **PAS de création automatique de plan**

#### D. Se connecter

1. Clique "Se connecter"
2. Entre email + password
3. ✅ **Attendu** : Redirection AUTOMATIQUE vers `/plan-selection`

#### E. Page Choix de Plan

1. ✅ **Tu vois** : Page avec 2 plans (FREE et PRO)
2. ✅ **Titre** : "Bienvenue sur PULSE"
3. ✅ **Sous-titre** : "Choisissez votre plan pour commencer"

#### F. Choisir FREE

1. Clique "Commencer gratuitement"
2. ✅ **Attendu** : 
   - Toast "🎉 Bienvenue sur PULSE FREE !"
   - Redirection vers `/dashboard`
   - Header : "30 prospects | 2 tournées"

#### G. OU Choisir PRO

1. Clique "🚀 Essayer 7 jours GRATUITEMENT"
2. ✅ **Attendu** :
   - Toast "Redirection vers le paiement..."
   - Redirection vers Stripe
   - Après paiement → Dashboard

## 🔍 Vérifications

### Vérifier qu'aucun plan n'est créé automatiquement

```sql
-- Après inscription MAIS avant choix de plan
SELECT * FROM user_quotas WHERE user_id = 'TON_USER_ID';
-- Doit retourner 0 lignes

SELECT * FROM user_subscriptions WHERE user_id = 'TON_USER_ID';
-- Doit retourner 0 lignes
```

### Vérifier que le plan est créé après le choix

```sql
-- Après avoir cliqué "Commencer gratuitement"
SELECT * FROM user_quotas WHERE user_id = 'TON_USER_ID';
-- Doit afficher :
-- plan_type = 'free'
-- is_first_login = false
-- prospects_unlocked_count = 0
-- tournees_created_count = 0

SELECT * FROM user_subscriptions WHERE user_id = 'TON_USER_ID';
-- Doit afficher :
-- plan_type = 'free'
-- subscription_status = 'active'
```

## 🐛 Dépannage

### Problème 1 : Plan créé automatiquement

**Solution** : Réexécute `FIX_FLUX_CHOIX_PLAN.sql` pour désactiver le trigger

### Problème 2 : Redirection directe vers dashboard (pas de choix)

**Solution** :
```sql
-- Force is_first_login à true pour revoir le choix
UPDATE user_quotas 
SET is_first_login = true 
WHERE user_id = 'TON_USER_ID';
```

### Problème 3 : Erreur "activate_pro_plan is not defined"

**Solution** : Réexécute `FIX_FLUX_CHOIX_PLAN.sql` pour créer la fonction

### Problème 4 : Page choix de plan ne s'affiche pas

**Vérifier** :
```sql
-- Vérifier que les quotas n'existent pas
SELECT * FROM user_quotas WHERE user_id = 'TON_USER_ID';

-- Si elles existent, les supprimer
DELETE FROM user_subscriptions WHERE user_id = 'TON_USER_ID';
DELETE FROM user_quotas WHERE user_id = 'TON_USER_ID';
```

## ✅ Checklist Finale

- [ ] Script `FIX_FLUX_CHOIX_PLAN.sql` exécuté
- [ ] Compte test supprimé
- [ ] Inscription testée
- [ ] Email confirmé
- [ ] Connexion → Redirection vers page choix
- [ ] Page choix affiche FREE et PRO
- [ ] Choix FREE → Dashboard avec quotas
- [ ] Vérification DB : is_first_login = false

## 🎯 Résultat Final

**Flux utilisateur parfait** :
```
Inscription → Email → Confirmation → Connexion → CHOIX PLAN → Dashboard
```

**Pas de création automatique** :
- ✅ Trigger désactivé
- ✅ EmailConfirmed ne crée rien
- ✅ L'utilisateur DOIT choisir son plan

---

## 👉 EXÉCUTE ÇA MAINTENANT

1. Ouvre Supabase SQL Editor
2. Copie `FIX_FLUX_CHOIX_PLAN.sql`
3. Exécute
4. Teste l'inscription complète

**Temps : 2 minutes**
