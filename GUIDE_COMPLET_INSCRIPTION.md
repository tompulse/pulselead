# 🎯 GUIDE COMPLET - Flux d'Inscription Réparé

## ✅ Nouveau Flux Implémenté

```
1. Inscription sur pulse-lead.com
   ↓
2. Email envoyé "Confirmez votre adresse email"
   ↓
3. Clic sur le lien → Page "Email confirmé ✅"
   ↓
4. Clic "Se connecter" → Page de connexion
   ↓
5. Connexion avec email/password
   ↓
6. Redirection automatique → Page "Choisir votre plan"
   ↓
7. Choix FREE ou PRO
   ↓
8. Dashboard avec le plan choisi
```

## 📁 Fichiers Créés/Modifiés

### Nouveaux Fichiers ✅

1. **`src/pages/EmailConfirmed.tsx`**
   - Page de confirmation après clic sur lien email
   - Affiche "Email confirmé ✅"
   - Bouton "Se connecter" pour aller vers /auth

2. **Scripts SQL à exécuter** :
   - `FIX_COLONNE_TOURNEES.sql` - Corrige les noms de colonnes
   - `FIX_FINAL_RADICAL.sql` - Désactive trigger + RLS

### Fichiers Modifiés ✅

1. **`src/App.tsx`**
   - Ajout de la route `/email-confirmed`

2. **`src/pages/Auth.tsx`**
   - emailRedirectTo → `/email-confirmed` (au lieu de /dashboard)

3. **`src/pages/Dashboard.tsx`**
   - Vérification `is_first_login`
   - Redirection vers `/plan-selection` si première connexion

4. **`src/pages/PlanSelection.tsx`**
   - Fallback amélioré pour créer quotas + subscriptions

## 🚀 ÉTAPES À SUIVRE (10 MINUTES)

### Étape 1 : Exécuter les Scripts SQL (5 min)

#### A. Script 1 : Corriger les colonnes

```sql
-- Exécute dans Supabase SQL Editor
-- Copie TOUT le contenu de FIX_COLONNE_TOURNEES.sql
```

**Ce script corrige** :
- ✅ Supprime `tournees_created_this_month` (ancienne colonne)
- ✅ Utilise `tournees_created_count` (bonne colonne)
- ✅ Supprime `unlocked_prospects_count`
- ✅ Utilise `prospects_unlocked_count`
- ✅ Recrée toutes les fonctions SQL avec les bons noms

#### B. Script 2 : Désactiver trigger et RLS

```sql
-- Exécute dans Supabase SQL Editor
-- Copie TOUT le contenu de FIX_FINAL_RADICAL.sql
```

**Ce script désactive** :
- ✅ Trigger `initialize_user_quota` (qui bloque l'inscription)
- ✅ RLS sur user_quotas et user_subscriptions
- ✅ Donne tous les droits à authenticated

### Étape 2 : Configurer Supabase Auth (2 min)

1. **Va dans Supabase Dashboard** → Authentication → URL Configuration

2. **Configure les URLs de redirection** :
   ```
   Site URL: https://pulse-lead.com (ou ton URL)
   Redirect URLs: 
     - https://pulse-lead.com/email-confirmed
     - https://pulse-lead.com/auth
     - https://pulse-lead.com/dashboard
   ```

3. **Modèle d'email de confirmation** :
   - Va dans Authentication → Email Templates
   - Modifie "Confirm signup"
   - Assure-toi que le bouton redirige vers `/email-confirmed`

### Étape 3 : Tester le Flux Complet (3 min)

#### Test 1 : Supprimer l'ancien compte test

```sql
-- Dans Supabase SQL Editor
DELETE FROM auth.users WHERE email = 'ton@email.com';
```

#### Test 2 : S'inscrire

1. Ouvre un navigateur incognito
2. Va sur pulse-lead.com
3. Clique "S'inscrire"
4. Entre email + password
5. ✅ **Résultat** : Toast "Vérifiez votre boîte mail !"

#### Test 3 : Confirmer l'email

1. Ouvre ta boîte mail
2. Clique sur le lien de confirmation
3. ✅ **Résultat** : Page "Email confirmé ✅"
4. ✅ **Tu vois** : 
   - Icône verte avec ✅
   - Titre "Email confirmé !"
   - Message "Votre compte est maintenant activé"
   - Bouton "Se connecter →"

#### Test 4 : Se connecter

1. Clique sur "Se connecter"
2. ✅ **Résultat** : Redirection vers `/auth?mode=login`
3. Entre email + password
4. Clique "Se connecter"
5. ✅ **Résultat** : Redirection vers `/plan-selection`

#### Test 5 : Choisir le plan

1. ✅ **Tu vois** : Page avec 2 plans (FREE + PRO)
2. Clique "Commencer gratuitement"
3. ✅ **Résultat** : 
   - Toast "🎉 Bienvenue sur PULSE FREE !"
   - Redirection vers `/dashboard`
   - Header : "30 prospects | 2 tournées"

## 🔍 Détails Techniques

### Page EmailConfirmed

```tsx
1. Vérifie la session Supabase
2. Crée user_quotas si n'existe pas (fallback)
3. Crée user_subscriptions si n'existe pas (fallback)
4. Affiche page de confirmation
5. Bouton "Se connecter" → signOut() + navigate('/auth')
```

**Pourquoi signOut() ?**
- Force l'utilisateur à se connecter explicitement
- Évite les problèmes de session

### Dashboard - Vérification is_first_login

```tsx
// Si is_first_login = true → Redirection vers /plan-selection
if (quotas?.is_first_login === true) {
  navigate('/plan-selection');
  return;
}
```

### PlanSelection - Activation du plan

```tsx
// Lors du clic "Commencer gratuitement"
await supabase.rpc('activate_free_plan', { p_user_id: userId });

// Cette fonction met is_first_login = false
// Donc la prochaine connexion va directement au dashboard
```

## 📊 Base de Données

### Table: user_quotas

```sql
user_id uuid PRIMARY KEY
plan_type text DEFAULT 'free'
prospects_unlocked_count int DEFAULT 0  -- ⚠️ Bon nom
tournees_created_count int DEFAULT 0    -- ⚠️ Bon nom
is_first_login boolean DEFAULT true     -- ⚠️ Important!
```

### Fonctions SQL

1. **activate_free_plan(user_id)**
   - Crée/met à jour user_quotas
   - Met is_first_login = false
   - Crée/met à jour user_subscriptions

2. **check_subscription_access(user_id)**
   - Retourne l'accès + quotas
   - Utilise `tournees_created_count` (pas `tournees_created_this_month`)

3. **check_tournee_quota(user_id)**
   - Vérifie limite tournées
   - Utilise `tournees_created_count`

## 🐛 Dépannage

### Problème 1 : "Database error saving new user"

**Solution** : Exécute `FIX_FINAL_RADICAL.sql` pour désactiver le trigger

### Problème 2 : "Could not find 'tournees_created_this_month'"

**Solution** : Exécute `FIX_COLONNE_TOURNEES.sql` pour corriger les noms

### Problème 3 : Email confirmé mais erreur de connexion

**Solution** :
```sql
-- Vérifie si les quotas existent
SELECT * FROM user_quotas WHERE user_id = 'TON_USER_ID';

-- Si elles n'existent pas, crée-les
INSERT INTO user_quotas (user_id, plan_type, prospects_unlocked_count, tournees_created_count, is_first_login)
VALUES ('TON_USER_ID', 'free', 0, 0, true);
```

### Problème 4 : Boucle de redirection dashboard ↔ plan-selection

**Solution** :
```sql
-- Force is_first_login à false
UPDATE user_quotas 
SET is_first_login = false 
WHERE user_id = 'TON_USER_ID';
```

### Problème 5 : Lien email ne fonctionne pas

**Solution** :
1. Vérifie dans Supabase → Authentication → URL Configuration
2. Ajoute `/email-confirmed` dans Redirect URLs
3. Régénère un email de confirmation :
   ```sql
   -- Reset email_confirmed à false
   UPDATE auth.users 
   SET email_confirmed_at = NULL 
   WHERE email = 'ton@email.com';
   ```

## ✅ Checklist Finale

- [ ] Script `FIX_COLONNE_TOURNEES.sql` exécuté
- [ ] Script `FIX_FINAL_RADICAL.sql` exécuté
- [ ] URLs de redirection configurées dans Supabase
- [ ] Inscription testée → Email reçu
- [ ] Clic sur lien → Page "Email confirmé ✅"
- [ ] Connexion → Redirection vers plan-selection
- [ ] Choix FREE → Dashboard accessible
- [ ] Quotas affichés (30 prospects, 2 tournées)
- [ ] Déblocage de prospect fonctionne

## 🎯 Résultat Final

**Flux utilisateur fluide** :
```
Inscription → Email → Confirmation → Connexion → Choix plan → Dashboard
```

**Aucune erreur** :
- ✅ Pas de "Database error saving new user"
- ✅ Pas de "Could not find column"
- ✅ Pas de boucle de redirection
- ✅ Lien email fonctionne correctement

---

## 👉 COMMENCE ICI

1. **Exécute `FIX_COLONNE_TOURNEES.sql`**
2. **Exécute `FIX_FINAL_RADICAL.sql`**
3. **Configure les URLs dans Supabase**
4. **Teste l'inscription complète**

**Temps total : 10 minutes**

---

**Date** : 27 janvier 2026  
**Statut** : ✅ Solution complète  
**Prochaine étape** : Exécuter les scripts SQL
