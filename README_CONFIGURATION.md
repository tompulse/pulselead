# 🎯 Configuration Table nouveaux_sites - 3 ÉTAPES

## ⚡ Temps total : 3 minutes

Ta table CSV est importée, maintenant on la configure pour PULSE !

---

## 📋 ÉTAPE 1 : Vérifier (30 secondes)

Va sur **Supabase → SQL Editor** et exécute :

```sql
-- Copie-colle tout le contenu de:
ETAPE_1_VERIFIER.sql
```

**Ce script va :**
- ✅ Compter tes lignes
- ✅ Lister toutes les colonnes
- ✅ Montrer un aperçu des données
- ✅ Te dire ce qui manque

**Résultat attendu :**
```
1️⃣ total_lignes: 57160
2️⃣ Liste de tes colonnes actuelles
3️⃣ Aperçu de 3 lignes
7️⃣ Résumé: ❌ À AJOUTER pour id, archived, random_order
```

---

## 🔧 ÉTAPE 2 : Ajouter colonnes (1 minute)

Exécute :

```sql
-- Copie-colle tout le contenu de:
ETAPE_2_AJOUTER_COLONNES.sql
```

**Ce script va automatiquement :**
- ✅ Ajouter `id` (UUID, clé primaire)
- ✅ Ajouter `archived` (boolean)
- ✅ Ajouter `random_order` (float)
- ✅ Renommer `entreprise` → `nom`
- ✅ Convertir `siege` → `est_siege` (boolean)

**Messages attendus :**
```
✅ Colonne id ajoutée et définie comme clé primaire
✅ Colonne archived ajoutée
✅ Colonne random_order ajoutée
✅ Colonne entreprise renommée en nom
✅ Colonne siege convertie en est_siege (boolean)
```

---

## ⚡ ÉTAPE 3 : RLS et Indexes (1 minute)

Exécute :

```sql
-- Copie-colle tout le contenu de:
ETAPE_3_RLS_INDEXES.sql
```

**Ce script va :**
- ✅ Activer le RLS (Row Level Security)
- ✅ Créer policy pour utilisateurs authentifiés
- ✅ Créer 8 indexes pour la performance

**Messages attendus :**
```
✅ RLS activé
✅ Policy créée pour authenticated users
✅ Index archived créé
✅ Index random_order créé
✅ Index siret créé
... (8 indexes au total)
🎉 TABLE PRÊTE! Rafraîchis PULSE et va dans Prospects
```

---

## 🎉 ÉTAPE 4 : Tester PULSE (30 secondes)

1. **Rafraîchis** ton app PULSE (Ctrl+F5 ou Cmd+R)
2. **Connecte-toi** avec ton compte
3. Va dans **Prospects**
4. **BOOM ! Tes 57 160 prospects sont là !** 🚀

---

## 🔍 Vérification rapide

Si tu veux vérifier que tout est OK :

```sql
-- Test final en une commande
SELECT 
  COUNT(*) as total,
  COUNT(id) as avec_id,
  COUNT(CASE WHEN archived = false THEN 1 END) as actifs,
  (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'nouveaux_sites') as nb_policies,
  (SELECT COUNT(*) FROM pg_indexes WHERE tablename = 'nouveaux_sites') as nb_indexes
FROM nouveaux_sites;
```

**Résultat attendu :**
```
total: 57160
avec_id: 57160
actifs: 57160
nb_policies: 1 ou +
nb_indexes: 8 ou +
```

Si tout correspond → **C'est parfait !** ✅

---

## 🆘 En cas de problème

### ❌ "Syntax error"
→ Assure-toi de copier **TOUT le contenu** du fichier SQL

### ❌ "Permission denied"
→ Tu dois être connecté avec le compte **admin** Supabase

### ❌ Prospects pas visibles dans PULSE
→ Vérifie que RLS est activé :
```sql
SELECT * FROM pg_policies WHERE tablename = 'nouveaux_sites';
```
Si rien → Re-exécute ETAPE_3_RLS_INDEXES.sql

### ❌ Chargement lent
→ Vérifie les indexes :
```sql
SELECT COUNT(*) FROM pg_indexes WHERE tablename = 'nouveaux_sites';
```
Si < 5 → Re-exécute ETAPE_3_RLS_INDEXES.sql

---

## 📊 Filtres disponibles dans PULSE

Une fois configuré, tu pourras filtrer par :
- 🔍 Recherche (nom, SIRET, ville)
- 📍 Département / Code postal
- 🏢 Code NAF (activité)
- 📅 Date de création
- 🏛️ Forme juridique
- 📏 Taille entreprise

---

## 🎯 Résumé ultra-rapide

1. `ETAPE_1_VERIFIER.sql` → Voir ce qui manque
2. `ETAPE_2_AJOUTER_COLONNES.sql` → Ajouter colonnes
3. `ETAPE_3_RLS_INDEXES.sql` → RLS + indexes
4. Rafraîchir PULSE → **Prospects visibles !**

**Temps total : 3 minutes ⏱️**

---

## ✅ Checklist finale

Avant de tester PULSE :

- [ ] ETAPE_1 exécutée → Colonnes listées
- [ ] ETAPE_2 exécutée → Messages ✅ verts
- [ ] ETAPE_3 exécutée → RLS activé + indexes créés
- [ ] Vérification SQL → 57160 lignes, policies OK
- [ ] PULSE rafraîchi (Ctrl+F5)

Si toutes les cases sont cochées → **GO ! 🚀**

---

**Lance ETAPE_1_VERIFIER.sql maintenant et copie-colle le résultat ici !**
