# 🔄 FORCER LA SÉLECTION DE PLAN POUR LES USERS EXISTANTS

## 🎯 **OBJECTIF**

Forcer tous les utilisateurs FREE existants (inscrits avant le fix) à choisir leur plan lors de leur prochaine connexion.

---

## 📋 **PROCÉDURE SUPABASE**

### **1. Ouvrir Supabase SQL Editor**

1. Va sur [supabase.com](https://supabase.com)
2. Sélectionne ton projet **PULSE**
3. Dans le menu de gauche, clique sur **"SQL Editor"**

### **2. Créer une nouvelle requête**

1. Clic sur **"New query"**
2. Copie-colle le contenu du fichier `FORCE_PLAN_SELECTION.sql`

### **3. Exécuter la requête**

1. Clic sur **"Run"** (ou `Cmd+Enter`)
2. Tu vas voir 3 résultats :

#### **Résultat 1 : Liste des utilisateurs FREE**
```
user_id | plan_type | is_first_login | created_at
--------|-----------|----------------|------------
abc123  | free      | false          | 2026-01-27
def456  | free      | false          | 2026-01-27
...
```
➡️ Ce sont les utilisateurs qui seront affectés

#### **Résultat 2 : Confirmation de l'UPDATE**
```
UPDATE X
```
➡️ `X` = Nombre d'utilisateurs mis à jour (devrait être ~10)

#### **Résultat 3 : Vérification finale**
```
total_users_a_reselectionner
----------------------------
10
```
➡️ Confirmation que tous les utilisateurs FREE ont maintenant `is_first_login = true`

---

## ✅ **CE QUI VA SE PASSER**

### **Pour chaque utilisateur FREE existant :**

1. **Avant** : `is_first_login = false` → Accès direct au dashboard
2. **Après** : `is_first_login = true` → Redirection vers `/plan-selection`

### **À leur prochaine connexion :**

1. User entre email + password
2. `SIGNED_IN` event déclenché
3. `useEffect` détecte `is_first_login = true`
4. ✅ **Redirection automatique vers `/plan-selection`**
5. User choisit **FREE** ou **PRO** (avec 7j d'essai)
6. `is_first_login` → `false`
7. Accès au dashboard avec le plan choisi

---

## 🎯 **UTILISATEURS NON AFFECTÉS**

Les utilisateurs suivants **NE SERONT PAS** affectés :
- ✅ Utilisateurs **PRO** (déjà payants)
- ✅ Utilisateurs en **trial** (période d'essai en cours)
- ✅ Nouveaux utilisateurs (inscrits après le fix)

---

## 🔍 **VÉRIFICATION MANUELLE (optionnel)**

Si tu veux vérifier manuellement un utilisateur spécifique :

```sql
-- Chercher un utilisateur par email
SELECT 
  u.email,
  q.plan_type,
  q.is_first_login
FROM auth.users u
JOIN user_quotas q ON u.id = q.user_id
WHERE u.email = 'email@example.com';
```

---

## ⚠️ **IMPORTANT**

- Cette opération est **réversible** (tu peux remettre `is_first_login = false` si besoin)
- Les utilisateurs ne perdent **aucune donnée** (prospects débloqués, tournées, CRM)
- Ils doivent juste **re-choisir** leur plan (FREE ou PRO)
- C'est une **bonne opportunité** pour les pousser vers le plan PRO avec l'essai gratuit de 7 jours

---

## 🚀 **APRÈS L'UPDATE**

Communique avec tes utilisateurs (email, notification) :

**Exemple de message :**

> 🎉 **Nouvelle version de PULSE !**
> 
> Nous avons ajouté un nouveau plan PRO avec 7 jours d'essai gratuit.
> À votre prochaine connexion, choisissez le plan qui vous convient :
> - **FREE** : 30 prospects débloqués, 2 tournées/mois
> - **PRO** : Prospects illimités, tournées illimitées (7j gratuits !)

---

## 📊 **STATISTIQUES UTILES**

Pour voir la répartition de tes utilisateurs :

```sql
SELECT 
  plan_type,
  COUNT(*) as nombre_users
FROM user_quotas
GROUP BY plan_type;
```

Pour voir combien vont être re-dirigés :

```sql
SELECT 
  COUNT(*) as users_a_rediriger
FROM user_quotas
WHERE plan_type = 'free' 
  AND is_first_login = false;
```

---

**Questions ? Lance le script et ping-moi si besoin ! 🚀**
