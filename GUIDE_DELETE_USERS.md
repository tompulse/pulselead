# 🗑️ SUPPRIMER TOUS LES UTILISATEURS DE TEST

## 🎯 **OBJECTIF**

Supprimer tous les utilisateurs de test pour repartir sur une base propre avec le nouveau flux d'onboarding.

---

## ⚠️ **ATTENTION**

Cette procédure supprime **TOUS** les utilisateurs et leurs données :
- ✅ Users FREE (test)
- ✅ Quotas et prospects débloqués
- ✅ Tournées et CRM
- ⚠️ Users PRO (si tu en as de vrais, adapte la procédure)

---

## 📋 **PROCÉDURE COMPLÈTE**

### **ÉTAPE 1 : Supprimer les données utilisateurs (SQL)**

1. Va sur **Supabase Dashboard** → **SQL Editor**
2. Crée une **nouvelle requête**
3. Copie-colle ce SQL :

```sql
-- Supprimer toutes les données utilisateurs
DELETE FROM user_unlocked_prospects;
DELETE FROM user_quotas;
DELETE FROM user_subscriptions;
DELETE FROM tournees WHERE user_id IS NOT NULL;
DELETE FROM tournee_visites WHERE user_id IS NOT NULL;
DELETE FROM lead_interactions WHERE user_id IS NOT NULL;
DELETE FROM lead_statuts WHERE user_id IS NOT NULL;
```

4. Clique sur **"Run"** (Cmd+Enter)
5. Tu devrais voir `DELETE X` pour chaque table

---

### **ÉTAPE 2 : Supprimer les comptes utilisateurs**

Les comptes dans `auth.users` doivent être supprimés depuis le Dashboard.

#### **Option A : Supprimer UN PAR UN (si peu d'utilisateurs)**

1. Va sur **Supabase Dashboard** → **Authentication** → **Users**
2. Pour chaque utilisateur :
   - Clique sur les **3 points** (⋮) à droite
   - Clique sur **"Delete user"**
   - Confirme

#### **Option B : Supprimer EN MASSE (si beaucoup d'utilisateurs)**

1. Va sur **Supabase Dashboard** → **Authentication** → **Users**
2. Coche la case en haut à gauche pour **sélectionner tous les users**
3. Clique sur **"Delete selected users"**
4. Confirme la suppression

#### **Option C : Script Terminal (avancé)**

Si tu as Supabase CLI et beaucoup d'utilisateurs :

```bash
# Liste tous les users
supabase auth users list

# Supprimer un user (répète pour chaque ID)
supabase auth users delete <user-id>
```

---

### **ÉTAPE 3 : Vérification**

Retourne dans **SQL Editor** et vérifie que tout est bien supprimé :

```sql
-- Vérifier qu'il ne reste plus de données
SELECT COUNT(*) as remaining_quotas FROM user_quotas;
SELECT COUNT(*) as remaining_unlocked FROM user_unlocked_prospects;
SELECT COUNT(*) as remaining_subscriptions FROM user_subscriptions;

-- Vérifier les users restants
SELECT COUNT(*) as remaining_users FROM auth.users;
```

**Résultat attendu :**
```
remaining_quotas: 0
remaining_unlocked: 0
remaining_subscriptions: 0
remaining_users: 0
```

---

## 🚀 **APRÈS LE NETTOYAGE**

### **Le nouveau flux fonctionnera parfaitement :**

1. **User créé compte**
   - Email + password
   - Email de confirmation envoyé

2. **User clique sur lien de confirmation**
   - `SIGNED_IN` event déclenché
   - `is_first_login = true` détecté
   - ✅ **Redirection automatique vers `/plan-selection`**

3. **User choisit son plan**
   - FREE ou PRO (7j d'essai)
   - `is_first_login` → `false`
   - Redirection vers `/dashboard`

4. **Prochaines connexions**
   - `is_first_login = false` détecté
   - ✅ **Redirection directe vers `/dashboard`**

---

## 🔄 **ALTERNATIVE : Garder quelques users**

Si tu veux garder certains utilisateurs spécifiques :

### **1. Note leurs emails avant suppression**

```sql
SELECT email FROM auth.users;
```

### **2. Supprime tous les users sauf ceux-là**

Dans **Supabase Dashboard** → **Authentication** → **Users** :
- Coche uniquement les users à supprimer
- Laisse les autres décochés
- Clique sur **"Delete selected users"**

### **3. Force la re-sélection de plan pour les users gardés**

```sql
UPDATE user_quotas
SET is_first_login = true
WHERE user_id IN (
  SELECT id FROM auth.users
  WHERE email IN ('user1@example.com', 'user2@example.com')
);
```

---

## 📊 **STATISTIQUES AVANT SUPPRESSION**

Pour voir ce qui sera supprimé :

```sql
-- Nombre total d'utilisateurs
SELECT 
  COUNT(*) as total_users,
  COUNT(CASE WHEN q.plan_type = 'free' THEN 1 END) as users_free,
  COUNT(CASE WHEN q.plan_type = 'pro' THEN 1 END) as users_pro
FROM auth.users u
LEFT JOIN user_quotas q ON u.id = q.user_id;

-- Liste détaillée
SELECT 
  u.email,
  q.plan_type,
  q.unlocked_prospects_count,
  u.created_at
FROM auth.users u
LEFT JOIN user_quotas q ON u.id = q.user_id
ORDER BY u.created_at DESC;
```

---

## ⏱️ **TEMPS ESTIMÉ**

- **Étape 1** (SQL) : **30 secondes**
- **Étape 2** (Supprimer users) : **1-2 minutes** (selon le nombre)
- **Étape 3** (Vérification) : **30 secondes**

**Total : ~3 minutes** ⚡

---

## 💡 **CONSEIL**

Après le nettoyage, **teste immédiatement** :

1. Créé un nouveau compte avec un email jetable (temp-mail.org)
2. Confirme l'email
3. Vérifie que tu arrives bien sur `/plan-selection`
4. Choisis FREE
5. Vérifie que tu arrives sur le dashboard
6. Déconnecte et reconnecte
7. Vérifie que tu arrives directement sur le dashboard (sans repasser par plan-selection)

---

**Prêt à nettoyer ? C'est la solution la plus propre ! 🧹**
