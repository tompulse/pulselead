# 🎯 VOIR TES PROSPECTS DANS PULSE - 1 COMMANDE

## ⚡ Solution ultra-rapide : 1 minute

Tu as l'erreur **"e.siret.replace is not a function"** ? 

C'est parce que la colonne `siret` est de type NUMBER au lieu de TEXT.

---

## ✅ SOLUTION EN 1 COMMANDE (60 secondes)

### 1. Va sur Supabase

https://supabase.com/dashboard → Ton projet → **SQL Editor**

### 2. Copie-colle CE script :

📄 **`FIX_TOUT_EN_1_COMMANDE.sql`**

Copie **TOUT** le contenu et clique sur **Run** ▶️

### 3. Attends 30 secondes

Tu verras plein de messages :
```
✅ siret converti en TEXT
✅ Colonnes PULSE ajoutées
✅ RLS activé
✅ 7 indexes créés
🎉 C'EST PRÊT!
```

### 4. Rafraîchis PULSE

**Ctrl+F5** (ou Cmd+R sur Mac)

### 5. Va dans Prospects

**🎉 Tes 57 160 prospects sont là !**

---

## 🔍 Ce que fait le script

**PARTIE 1 :** Convertit `siret` en TEXT (fix l'erreur)  
**PARTIE 2 :** Ajoute colonnes PULSE (`id`, `archived`, `random_order`)  
**PARTIE 3 :** Renomme colonnes (`entreprise` → `nom`)  
**PARTIE 4 :** Active RLS (sécurité)  
**PARTIE 5 :** Crée 7 indexes (performance)  

---

## 🆘 Si ça ne marche toujours pas

### Vérifier que le script a bien fonctionné

```sql
-- Vérifier type de siret
SELECT pg_typeof(siret) FROM nouveaux_sites LIMIT 1;
-- Doit afficher: "text"

-- Compter les prospects actifs
SELECT COUNT(*) FROM nouveaux_sites WHERE archived = false;
-- Doit afficher: ~57160

-- Vérifier RLS
SELECT COUNT(*) FROM pg_policies WHERE tablename = 'nouveaux_sites';
-- Doit afficher: 1 ou plus
```

Si tout est OK mais PULSE plante encore :
1. **Vide le cache navigateur** (Ctrl+Shift+Delete)
2. **Ferme et rouvre PULSE**
3. **Reconnecte-toi**

---

## 📁 Autres scripts disponibles

Si tu préfères faire étape par étape :
- `ETAPE_1_VERIFIER.sql` → Voir ce qui manque
- `ETAPE_2_AJOUTER_COLONNES.sql` → Ajouter colonnes
- `ETAPE_3_RLS_INDEXES.sql` → RLS + indexes

Mais **`FIX_TOUT_EN_1_COMMANDE.sql`** fait tout d'un coup ! 🚀

---

## ✅ Checklist rapide

- [ ] Script `FIX_TOUT_EN_1_COMMANDE.sql` exécuté
- [ ] Messages ✅ verts affichés
- [ ] PULSE rafraîchi (Ctrl+F5)
- [ ] Cache navigateur vidé (si besoin)
- [ ] Section Prospects ouverte

Si tout est coché → **Tes prospects sont là !** 🎉

---

## 🎯 TL;DR (Résumé 10 secondes)

1. Supabase → SQL Editor
2. Exécute `FIX_TOUT_EN_1_COMMANDE.sql`
3. Rafraîchis PULSE
4. **Prospects visibles !** ✅

**Temps total : 1 minute** ⏱️
