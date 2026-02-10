# 🚨 FIX: Erreur "e.siret.replace is not a function"

## 🔍 Cause de l'erreur

```
e.siret.replace is not a function
```

**Problème :** La colonne `siret` dans ta table Supabase est de type **NUMBER** (bigint, numeric, integer) au lieu de **TEXT**.

Le code JavaScript PULSE essaie de faire `siret.replace()` (fonction string) mais `siret` est un nombre → **ERREUR** ❌

---

## ✅ SOLUTION RAPIDE (30 secondes)

Va sur **Supabase → SQL Editor** et exécute :

### Option 1 : Script rapide (RECOMMANDÉ)

```sql
-- Copie-colle tout le contenu de:
FIX_COLONNES_TEXT.sql
```

Ce script va :
- ✅ Convertir `siret` en TEXT
- ✅ Convertir `code_postal` en TEXT
- ✅ Convertir `code_naf` en TEXT
- ✅ Vérifier que tout est OK

---

### Option 2 : Commande unique

Si tu veux juste fix le siret rapidement :

```sql
-- Convertir siret en TEXT
ALTER TABLE nouveaux_sites ALTER COLUMN siret TYPE TEXT USING siret::TEXT;

-- Vérifier
SELECT pg_typeof(siret) FROM nouveaux_sites LIMIT 1;
-- Doit afficher: "text"
```

---

## 🎯 Après le fix

1. **Rafraîchis PULSE** (Ctrl+F5 ou Cmd+R)
2. **Va dans Prospects**
3. **L'erreur devrait disparaître !** ✅

---

## 🔍 Vérifier que c'est bien corrigé

```sql
-- Vérifier le type de siret
SELECT 
  column_name,
  data_type,
  CASE 
    WHEN data_type IN ('text', 'character varying') THEN '✅ OK'
    ELSE '❌ Encore un nombre'
  END as status
FROM information_schema.columns
WHERE table_name = 'nouveaux_sites' 
  AND column_name = 'siret';
```

**Résultat attendu :**
```
column_name: siret
data_type: text
status: ✅ OK
```

---

## 🆘 Si l'erreur persiste

### 1. Vider le cache du navigateur
```
Chrome: Ctrl+Shift+Delete → Vider le cache
Firefox: Ctrl+Shift+Delete → Vider le cache
Safari: Cmd+Option+E
```

### 2. Re-vérifier le type de colonne
```sql
SELECT pg_typeof(siret) FROM nouveaux_sites LIMIT 1;
```

Si ça affiche `bigint` ou `numeric` au lieu de `text` :
→ Re-exécute `FIX_COLONNES_TEXT.sql`

### 3. Vérifier d'autres colonnes
```sql
-- Vérifier tous les types
SELECT 
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name = 'nouveaux_sites'
  AND column_name IN ('siret', 'code_postal', 'code_naf');
```

Toutes doivent être `text` ou `character varying`.

---

## 📋 Pourquoi cette erreur ?

Quand tu importes un CSV dans Supabase, il essaie de deviner le type des colonnes :
- Si toutes les valeurs ressemblent à des nombres → Il crée une colonne NUMBER
- MAIS le SIRET est un **identifiant textuel**, pas un nombre mathématique

**Solution :** Forcer le type TEXT pour les colonnes qui sont des identifiants.

---

## ✅ Prévention pour futurs imports

Quand tu importes un CSV dans Supabase :
1. **Spécifie explicitement** que `siret` doit être TEXT
2. Idem pour `code_postal` (peut commencer par 0)
3. Idem pour `code_naf` (peut contenir des lettres)

Ou utilise les scripts automatiques fournis qui gèrent tout ça ! 🎯

---

## 🎉 Résumé ultra-rapide

```sql
-- Copie-colle dans Supabase SQL Editor:
ALTER TABLE nouveaux_sites ALTER COLUMN siret TYPE TEXT USING siret::TEXT;
```

Puis **Ctrl+F5** dans PULSE → **Prospects devrait marcher !** 🚀
