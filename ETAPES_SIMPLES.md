# ✅ 3 ÉTAPES SIMPLES pour voir tes prospects dans PULSE

## 🎯 Tu as cette erreur : `column "id" does not exist`

**Cause :** Ta table CSV n'a pas de colonne `id` UUID (clé primaire de PULSE)

**Solution :** 3 scripts à exécuter dans **Supabase → SQL Editor**

---

## 📋 ÉTAPE 1 : Vérifier (30 sec)

Copie-colle ce script dans Supabase SQL Editor :

📄 **`VERIFY_TABLE_SIMPLE.sql`**

Ce script va te dire :
- ✅ Combien de lignes tu as
- ✅ Quelles colonnes existent
- ⚠️ Quelles colonnes manquent

**Résultat attendu :**
```
✅ Table existe | 57160 lignes
⚠️ id (UUID) MANQUANTE - À ajouter
⚠️ archived MANQUANTE - À ajouter
⚠️ random_order MANQUANTE - À ajouter
```

---

## 🔧 ÉTAPE 2 : Ajouter colonnes manquantes (1 min)

Copie-colle ce script :

📄 **`AJOUTER_COLONNES_MANQUANTES.sql`**

Ce script va **automatiquement** :
- ✅ Ajouter `id` (UUID, clé primaire)
- ✅ Ajouter `archived` (boolean, pour filtrer)
- ✅ Ajouter `random_order` (float, pour diversité)
- ✅ Ajouter `created_at`, `updated_at`
- ✅ Ajouter colonnes NAF (section, division, groupe, classe)
- ✅ Renommer colonnes si nécessaire (`entreprise` → `nom`, etc.)

**Messages attendus :**
```
✅ Colonne id ajoutée et définie comme clé primaire
✅ Colonne archived ajoutée
✅ Colonne random_order ajoutée
✅ Colonne created_at ajoutée
✅ Colonne updated_at ajoutée
✅ Colonnes NAF ajoutées
```

---

## ⚡ ÉTAPE 3 : Activer RLS et indexes (1 min)

Copie-colle ce script :

📄 **`FIX_TABLE_POUR_PULSE.sql`**

Ce script va :
- ✅ Activer le RLS (Row Level Security)
- ✅ Créer la policy pour utilisateurs authentifiés
- ✅ Créer 10 index pour la performance

**Messages attendus :**
```
✅ RLS activé
✅ Policy created
✅ 10 indexes created
```

---

## 🎉 ÉTAPE 4 : Tester (30 sec)

1. Rafraîchis ton app PULSE (Ctrl+F5)
2. Va dans **Prospects**
3. **Tu devrais voir tes 57 160 prospects !** 🎉

---

## 🆘 En cas de problème

### ❌ "Syntax error near..."
→ Copie-colle **tout le contenu** du fichier SQL (pas ligne par ligne)

### ❌ "Permission denied"
→ Assure-toi d'être connecté avec le compte admin Supabase

### ❌ "Relation already exists"
→ Normal, ça veut dire que c'est déjà fait ✅

### ❌ Prospects toujours pas visibles
→ Vérifie dans Supabase SQL Editor :
```sql
-- Compte les prospects actifs
SELECT COUNT(*) FROM nouveaux_sites WHERE archived = false;

-- Vérifie le RLS
SELECT * FROM pg_policies WHERE tablename = 'nouveaux_sites';
```

Si la 1ère requête donne 0, exécute :
```sql
UPDATE nouveaux_sites SET archived = false WHERE archived IS NULL;
```

---

## 📊 Vérification finale

```sql
-- Test complet en une commande
SELECT 
  COUNT(*) as total,
  COUNT(id) as avec_id,
  COUNT(CASE WHEN archived = false THEN 1 END) as actifs,
  (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'nouveaux_sites') as nb_policies
FROM nouveaux_sites;
```

**Résultat attendu :**
```
total: 57160
avec_id: 57160
actifs: 57160
nb_policies: 1 (ou plus)
```

Si tout correspond → **C'est bon !** 🎉

---

## ⏱️ Temps total : ~3 minutes

1. VERIFY_TABLE_SIMPLE.sql → 30 sec
2. AJOUTER_COLONNES_MANQUANTES.sql → 1 min
3. FIX_TABLE_POUR_PULSE.sql → 1 min
4. Rafraîchir PULSE → 30 sec

**C'est parti ! 🚀**
