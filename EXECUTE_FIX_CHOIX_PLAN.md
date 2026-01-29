# ⚡ EXÉCUTE ÇA - Fix Choix de Plan

## 🎯 Ce Qui Change

**AVANT** : Plan FREE créé automatiquement ❌  
**MAINTENANT** : Tu choisis FREE ou PRO après la connexion ✅

## 📋 Étapes (2 MINUTES)

### 1. Exécute le Script SQL

1. Ouvre Supabase Dashboard → SQL Editor
2. Copie **TOUT** le contenu de `FIX_FLUX_CHOIX_PLAN.sql`
3. **IMPORTANT** : Si tu as un compte test, décommente les lignes 22-35 et remplace par ton email
4. Exécute
5. ✅ Vérifie : "✅ Trigger désactivé"

### 2. Supprime Ton Compte Test

```sql
-- Si tu as déjà un compte de test
DELETE FROM auth.users WHERE email = 'ton@email.com';
```

### 3. Teste le Nouveau Flux

1. **Inscris-toi** avec un nouvel email
2. **Confirme** l'email (clic sur lien)
3. **Connecte-toi** avec email/password
4. ✅ **Tu arrives sur** : Page "Choisir votre plan"
5. **Clique** "Commencer gratuitement"
6. ✅ **Tu arrives sur** : Dashboard avec "30 prospects | 2 tournées"

---

## ✅ Résultat Attendu

```
Inscription → Email → Confirmation 
    ↓
Connexion 
    ↓
⭐ PAGE CHOIX FREE/PRO (NOUVEAU!)
    ↓
Dashboard
```

---

## 🐛 Si Problème

### "activate_pro_plan is not defined"
→ Réexécute `FIX_FLUX_CHOIX_PLAN.sql`

### "Pas de page de choix"
→ Supprime les quotas :
```sql
DELETE FROM user_quotas WHERE user_id = 'TON_ID';
```

---

## 👉 ACTION IMMÉDIATE

1. **Ouvre** `FIX_FLUX_CHOIX_PLAN.sql`
2. **Décommente** lignes 22-35 si tu as un compte test
3. **Exécute** dans Supabase SQL Editor
4. **Teste** l'inscription

**C'EST PARTI ! 🚀**
