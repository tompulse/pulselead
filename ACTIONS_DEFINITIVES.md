# ⚡ ACTIONS DÉFINITIVES - Régler TOUS les Problèmes

## 🎯 RÉSUMÉ DE L'AUDIT

**Système actuel** : 80% fonctionnel  
**Bugs critiques** : 2 (noms de colonnes + trigger)  
**Temps de correction** : 17 minutes  

---

## 🔥 PROBLÈMES IDENTIFIÉS

### 1. Noms de Colonnes Incohérents ⚠️ CRITIQUE
- **DB** : `tournees_created_count`
- **Code** : cherchait `tournees_created_this_month`
- **Impact** : Système de quotas bloqué

### 2. Trigger Automatique ⚠️ CRITIQUE
- Crée plan FREE automatiquement
- Bloque l'inscription avec "Database error"
- Empêche le choix FREE/PRO

### 3. RLS Trop Restrictif
- Bloque les insertions dans user_quotas
- Permissions insuffisantes

---

## ✅ ACTIONS À FAIRE (17 MINUTES)

### PHASE 1 : SQL (5 min) ⚡ PRIORITÉ 1

#### A. Script 1 - Colonnes

```bash
# 1. Ouvre Supabase Dashboard → SQL Editor
# 2. Copie TOUT le fichier FIX_COLONNE_TOURNEES.sql
# 3. Exécute
# 4. Vérifie : "✅ SCRIPT TERMINÉ - Cache refresh"
```

**Ce script fait** :
- ✅ Supprime anciennes colonnes
- ✅ Ajoute bonnes colonnes
- ✅ Recrée TOUTES les fonctions SQL
- ✅ Force refresh cache

#### B. Script 2 - Trigger & Choix Plan

```bash
# 1. Dans le même SQL Editor
# 2. Copie TOUT le fichier FIX_FLUX_CHOIX_PLAN.sql
# 3. ⚠️ IMPORTANT : Décommente lignes 22-35 si tu as un compte test
# 4. Exécute
# 5. Vérifie : "✅ Trigger désactivé"
```

**Ce script fait** :
- ✅ Désactive trigger initialize_user_quota
- ✅ Crée activate_pro_plan()
- ✅ Met à jour activate_free_plan()
- ✅ (Optionnel) Supprime ton compte test

#### C. Script 3 - RLS (si problèmes persistent)

```bash
# Seulement si tu as encore des erreurs
# Copie FIX_FINAL_RADICAL.sql et exécute
```

---

### PHASE 2 : Configuration (2 min)

#### A. URLs Supabase

```
1. Supabase Dashboard → Authentication → URL Configuration
2. Ajoute dans Redirect URLs :
   - https://pulse-lead.com/email-confirmed
   - https://pulse-lead.com/auth
   - https://pulse-lead.com/dashboard
```

#### B. Vérifier Stripe

```
1. Stripe Dashboard → Payment Links
2. Vérifie le lien existe et fonctionne
3. Prix : 49€/mois
4. Trial : 7 jours
```

#### C. Vérifier Webhook Stripe

```
1. Stripe Dashboard → Developers → Webhooks
2. Endpoint : https://[TON_PROJET].supabase.co/functions/v1/stripe-webhook
3. Événements :
   - checkout.session.completed ✅
   - customer.subscription.updated ✅
   - customer.subscription.deleted ✅
   - invoice.paid ✅
```

---

### PHASE 3 : Tests (10 min)

#### Test 1 : Supprimer Compte Test

```sql
-- Dans Supabase SQL Editor
DELETE FROM auth.users WHERE email = 'ton@email.com';
```

#### Test 2 : Inscription FREE

```
1. ✅ Inscription avec nouvel email
2. ✅ Confirmation email
3. ✅ Page "Email confirmé ✅"
4. ✅ Connexion
5. ✅ Redirection automatique → /plan-selection
6. ✅ Clic "Commencer gratuitement"
7. ✅ Dashboard avec "30 prospects | 2 tournées"
```

#### Test 3 : Vérifier DB

```sql
-- Après avoir choisi FREE
SELECT * FROM user_quotas WHERE user_id = (SELECT id FROM auth.users WHERE email = 'ton@email.com');
-- Doit afficher :
-- plan_type = 'free'
-- is_first_login = false
-- prospects_unlocked_count = 0
-- tournees_created_count = 0

SELECT * FROM user_subscriptions WHERE user_id = (SELECT id FROM auth.users WHERE email = 'ton@email.com');
-- Doit afficher :
-- plan_type = 'free'
-- subscription_status = 'active'
```

#### Test 4 : Déblocage Prospect

```
1. Va dans "Nouveaux Sites"
2. Clique sur une entreprise
3. Clique "Débloquer ce prospect"
4. ✅ Infos dévoilées
5. ✅ Compteur : "1/30 prospects"
```

#### Test 5 : Inscription PRO (Optionnel)

```
1. Crée un autre compte
2. Choisis "Essayer 7 jours GRATUIT"
3. ✅ Redirection Stripe
4. CB test : 4242 4242 4242 4242
5. ✅ Dashboard "Prospects illimités"
```

---

## 📋 CHECKLIST FINALE

### SQL
- [ ] FIX_COLONNE_TOURNEES.sql exécuté sans erreur
- [ ] FIX_FLUX_CHOIX_PLAN.sql exécuté sans erreur
- [ ] Compte test supprimé

### Configuration
- [ ] URLs de redirection ajoutées dans Supabase
- [ ] Stripe Payment Link vérifié
- [ ] Webhook Stripe configuré

### Tests
- [ ] Nouvelle inscription OK
- [ ] Email confirmé OK
- [ ] Connexion → Page choix plan OK
- [ ] Choix FREE → Dashboard OK
- [ ] Quotas affichés (30/2) OK
- [ ] Déblocage prospect OK

### Vérification DB
- [ ] user_quotas créé après choix
- [ ] is_first_login = false après choix
- [ ] Bonnes colonnes (prospects_unlocked_count, tournees_created_count)

---

## 🎯 FLUX FINAL

```
INSCRIPTION
    ↓
Email confirmation
    ↓
Page "Email confirmé ✅"
    ↓
Connexion
    ↓
⭐ PAGE CHOIX FREE/PRO ⭐
    ↓           ↓
  FREE         PRO
    ↓           ↓
Dashboard    Stripe → Dashboard
```

---

## 🐛 SI PROBLÈME

### "Database error"
```
→ Réexécute FIX_FLUX_CHOIX_PLAN.sql
```

### "Column not found"
```
→ Réexécute FIX_COLONNE_TOURNEES.sql
```

### "activate_pro_plan not defined"
```
→ Réexécute FIX_FLUX_CHOIX_PLAN.sql
```

### Boucle de redirection
```sql
UPDATE user_quotas SET is_first_login = false WHERE user_id = 'TON_ID';
```

### Pas de page de choix
```sql
-- Vérifie :
SELECT * FROM user_quotas WHERE user_id = 'TON_ID';
-- Si existe, supprime :
DELETE FROM user_quotas WHERE user_id = 'TON_ID';
```

---

## 📊 APRÈS CORRECTION

**Ce qui va fonctionner** :
- ✅ Inscription sans erreur
- ✅ Confirmation email
- ✅ Choix FREE ou PRO après connexion
- ✅ Quotas FREE (30 prospects, 2 tournées)
- ✅ Paiement PRO avec Stripe
- ✅ Webhook Stripe pour activation PRO

**Ce qui ne va plus bugger** :
- ❌ Plus de "Database error saving new user"
- ❌ Plus de "Column not found"
- ❌ Plus de plan FREE créé automatiquement
- ❌ Plus de boucle de redirection

---

## ⏱️ TEMPS TOTAL : 17 MINUTES

- SQL : 5 min
- Config : 2 min
- Tests : 10 min

---

## 👉 COMMENCE MAINTENANT

### ÉTAPE 1
Ouvre `FIX_COLONNE_TOURNEES.sql` et exécute dans Supabase

### ÉTAPE 2
Ouvre `FIX_FLUX_CHOIX_PLAN.sql` et exécute dans Supabase

### ÉTAPE 3
Supprime ton compte test et réinscris-toi

---

**🚀 APRÈS ÇA, TOUT VA FONCTIONNER !**

Pour plus de détails, lis `AUDIT_COMPLET_SYSTEME.md` (10 min de lecture)
