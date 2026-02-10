# 🔧 FIX DÉPARTEMENTS - À EXÉCUTER DANS SUPABASE

## Problème résolu

Le filtre département ne montrait que 5 prospects pour le département 01 au lieu de tous les prospects de l'Ain.

**Cause:** Le filtre était appliqué côté client après avoir chargé seulement 10,000 résultats.

**Solution:** Filtrage en SQL directement avec une colonne `departement` indexée.

---

## ⚡ ÉTAPE OBLIGATOIRE - Exécuter la migration SQL

### 1. Ouvre Supabase SQL Editor

1. Va sur [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Sélectionne ton projet PULSE
3. Clique sur **SQL Editor** dans le menu gauche
4. Clique sur **New Query**

### 2. Copie-colle et exécute

Copie tout le contenu du fichier:
```
supabase/migrations/20260209000002_add_department_function.sql
```

Puis clique sur **Run** (ou `Ctrl+Enter`)

### 3. Vérifie le résultat

Tu devrais voir:
```
Success. No rows returned
```

---

## ✅ Ce que fait cette migration:

1. **Crée une fonction** `get_departement_from_cp()` qui extrait le département du code postal
2. **Ajoute une colonne** `departement` dans `nouveaux_sites`
3. **Popule la colonne** pour toutes les 57k lignes existantes
4. **Crée un index** pour les performances
5. **Ajoute un trigger** qui auto-remplit `departement` lors des futurs INSERT/UPDATE

---

## 🎯 Résultat

**Avant:**
- Département 01 → 5 prospects ❌
- Filtrage côté client (lent)

**Après:**
- Département 01 → TOUS les prospects de l'Ain ✅
- Filtrage SQL direct (instantané)
- Gère automatiquement les codes postaux à 4 ou 5 chiffres

---

## 🚀 Test

1. Rafraîchis PULSE (`F5`)
2. Clique sur **Filtres**
3. Sélectionne **"01 - Ain"**
4. Tu devrais voir TOUS les prospects du département 01 s'afficher instantanément

---

**Temps d'exécution:** ~30 secondes (dépend du nombre de lignes à populer)
**À exécuter:** UNE SEULE FOIS
