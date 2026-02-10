# 🔍 Diagnostic Complet - Architecture Filtres & Prospects

## Problèmes identifiés:

### 1. ❌ Villes ne s'affichent pas sur les cartes
**Cause probable:** La colonne `ville` n'est pas remplie dans la table `nouveaux_sites`

### 2. ❌ Recherche par ville ne fonctionne pas
**État:** La recherche cherche bien dans `ville` (ligne 86 du service), MAIS si la colonne est vide, ça ne trouve rien

### 3. ❌ Filtres NAF ne fonctionnent pas
**État:** En cours de correction avec double filtrage sections + divisions

---

## ✅ Solutions à implémenter:

### Solution 1: Ajouter/Populer la colonne `ville`
Si la colonne `ville` n'existe pas ou est vide, on doit la créer/populer depuis les données existantes.

### Solution 2: Vérifier que toutes les colonnes existent
- `ville` ✅
- `code_postal` ✅  
- `naf_section` ✅
- `naf_division` ✅
- `departement` ✅ (à créer via migration)

### Solution 3: Architecture cohérente
**Filtrage:**
- Départements → SQL direct (via colonne `departement`)
- NAF → SQL direct (sections + divisions)
- Recherche → Client-side (multi-colonnes: nom, ville, code_postal, siret, etc.)

**Affichage:**
- Nom entreprise
- Ville + Code postal
- Secteur NAF
- SIRET
- Date création

---

## 📋 Actions requises:

1. **Exécuter migration département** (déjà créée)
2. **Vérifier que `ville` existe dans la table**
3. **Si `ville` est vide, la populer depuis les données CSV**
4. **Tester recherche + filtres**

---

## 🎯 Résultat attendu:

✅ Villes visibles sur toutes les cartes  
✅ Recherche par ville fonctionnelle  
✅ Recherche par code postal fonctionnelle  
✅ Filtres départements fonctionnels  
✅ Filtres NAF fonctionnels  
✅ Architecture cohérente et fluide
