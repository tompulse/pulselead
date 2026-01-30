# 🔒 GUIDE ACTIVATION RLS (Row Level Security)

**Date**: 30 janvier 2026  
**Urgence**: 🔥 CRITIQUE - Problème de sécurité

---

## 🚨 PROBLÈME

**RLS (Row Level Security) n'est PAS activé** sur 4 tables alors que des policies existent.

❌ **Risque** : Les policies ne sont PAS appliquées !  
❌ **Conséquence** : Les données sont accessibles sans restriction !

---

## ✅ SOLUTION

Activer RLS sur chaque table avec le fichier SQL `ENABLE_RLS.sql`

---

## 📋 ÉTAPES D'ACTIVATION

### **Option 1 : Via Supabase Dashboard (Recommandé)**

1. **Va sur Supabase Dashboard** :
   ```
   https://supabase.com/dashboard/project/[PROJECT_ID]/editor
   ```

2. **Clique sur "SQL Editor"** (à gauche)

3. **Copie-colle le contenu de `ENABLE_RLS.sql`**

4. **Clique "Run"** ▶️

5. **Vérifie que ça retourne** :
   ```
   ✅ ALTER TABLE (pour chaque table)
   ```

6. **Scroll en bas** pour voir la vérification :
   ```
   | tablename              | rls_enabled |
   |------------------------|-------------|
   | nouveaux_sites         | true        |
   | user_subscriptions     | true        |
   | user_quotas            | true        |
   | user_unlocked_prospects| true        |
   ```

---

### **Option 2 : Via CLI Supabase (Avancé)**

Si tu as Supabase CLI installé :

```bash
cd /Users/raws/pulse-project/pulselead
supabase db reset
```

OU

```bash
psql -h [DB_HOST] -U postgres -d postgres -f ENABLE_RLS.sql
```

---

## 🔍 VÉRIFICATION POST-ACTIVATION

### **1. Dans Supabase Dashboard**

1. Va sur **Database** > **Tables**
2. Clique sur chaque table
3. Vérifie que **"RLS enabled"** est ✅ (vert)

---

### **2. Via SQL**

Exécute dans le SQL Editor :

```sql
SELECT 
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
    AND tablename IN (
        'nouveaux_sites',
        'user_subscriptions',
        'user_quotas',
        'user_unlocked_prospects'
    );
```

**Résultat attendu** : Tous `rls_enabled = true` ✅

---

## 📊 TABLES CONCERNÉES

### **1. nouveaux_sites**
- **Policies existantes** : 2
  - Allow admins to manage nouveaux_sites
  - Allow authenticated users to read nouveaux_sites
- **Impact** : Protège la liste des entreprises

### **2. user_subscriptions**
- **Policies existantes** : 5
  - Admins can update subscription status
  - Admins can view all subscriptions
  - Users can insert their own subscription
  - Users can only view own subscription
  - Users can update their own subscription
- **Impact** : Protège les données d'abonnement Stripe

### **3. user_quotas**
- **Policies existantes** : À vérifier (probablement déjà créées)
- **Impact** : Protège les quotas utilisateurs (plan, limits)

### **4. user_unlocked_prospects**
- **Policies existantes** : 2
  - Enable all for authenticated users on own unlocked
  - Enable all for service role unlocked
- **Impact** : Protège les prospects débloqués par utilisateur

---

## ⚠️ IMPORTANT

### **Avant activation RLS** :
- ❌ Les policies sont ignorées
- ❌ Toutes les données sont accessibles
- ❌ N'importe qui peut lire/modifier

### **Après activation RLS** :
- ✅ Les policies sont appliquées
- ✅ Seules les données autorisées sont accessibles
- ✅ Sécurité au niveau ligne active

---

## 🧪 TEST POST-ACTIVATION

### **Test 1 : Connexion user normal**

```javascript
// Dans ton app, connecte-toi en tant qu'user normal
const { data, error } = await supabase
  .from('user_quotas')
  .select('*');

// ✅ Doit retourner UNIQUEMENT ses propres quotas
// ❌ Ne doit PAS voir les quotas des autres users
```

### **Test 2 : Lecture nouveaux_sites**

```javascript
// User authentifié
const { data, error } = await supabase
  .from('nouveaux_sites')
  .select('*')
  .limit(10);

// ✅ Doit fonctionner (lecture autorisée)
```

### **Test 3 : Modification user_subscriptions**

```javascript
// User normal essaie de modifier l'abonnement d'un autre
const { data, error } = await supabase
  .from('user_subscriptions')
  .update({ subscription_status: 'active' })
  .eq('user_id', 'autre-user-id');

// ✅ Doit échouer (policy bloque)
// ❌ Ne peut modifier QUE son propre abonnement
```

---

## 🎯 ORDRE D'EXÉCUTION

1. **Copie `ENABLE_RLS.sql`**
2. **Va sur Supabase Dashboard > SQL Editor**
3. **Colle et exécute**
4. **Vérifie les résultats**
5. **Teste l'app**

---

## 📞 SI PROBLÈME

### **Erreur : "permission denied"**

➡️ Tu n'as pas les droits admin sur la DB

**Solution** : Utilise le compte owner du projet Supabase

---

### **Erreur : "relation does not exist"**

➡️ Le nom de la table est incorrect

**Solution** : Vérifie les noms de tables dans Supabase Dashboard

---

### **App ne fonctionne plus après activation**

➡️ Les policies bloquent les requêtes légitimes

**Solution** :
1. Vérifie que les policies existent bien
2. Vérifie que les policies autorisent les cas d'usage
3. Ajoute des policies manquantes si nécessaire

---

## ✅ CHECKLIST

- [ ] Fichier `ENABLE_RLS.sql` exécuté
- [ ] Aucune erreur retournée
- [ ] Vérification SQL : tous `rls_enabled = true`
- [ ] Dashboard Supabase : RLS vert sur chaque table
- [ ] Test app : connexion fonctionne
- [ ] Test app : lecture données fonctionne
- [ ] Test app : user ne voit que ses données
- [ ] Erreurs Supabase Linter disparues

---

**Exécute `ENABLE_RLS.sql` maintenant dans Supabase SQL Editor !** 🚀

Une fois fait, vérifie que les erreurs Supabase ont disparu.
