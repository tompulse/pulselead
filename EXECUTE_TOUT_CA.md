# ⚡ EXÉCUTE TOUT ÇA - Checklist Complète

## 🎯 Objectif Final

Flux d'inscription qui fonctionne :
```
Inscription → Email → Page "Confirmé ✅" → Connexion → Choix FREE/PRO → Dashboard
```

---

## ✅ ÉTAPE 1 : SQL (5 minutes)

### A. Script 1 - Colonnes

1. Ouvre Supabase Dashboard → SQL Editor
2. Copie **TOUT** `FIX_COLONNE_TOURNEES.sql`
3. Exécute
4. Vérifie : "✅ SCRIPT TERMINÉ - Cache refresh et colonnes corrigées"

### B. Script 2 - Trigger + RLS

1. Dans le même SQL Editor
2. Copie **TOUT** `FIX_FINAL_RADICAL.sql`
3. Exécute
4. Vérifie : "✅ Trigger désactivé"

---

## ✅ ÉTAPE 2 : Configuration Supabase (2 minutes)

### A. URLs de Redirection

1. Supabase Dashboard → **Authentication** → **URL Configuration**

2. Ajoute ces URLs dans **Redirect URLs** :
   ```
   https://pulse-lead.com/email-confirmed
   https://pulse-lead.com/auth
   https://pulse-lead.com/dashboard
   
   (OU si local :)
   http://localhost:5173/email-confirmed
   http://localhost:5173/auth
   http://localhost:5173/dashboard
   ```

3. Clique **Save**

### B. Template Email (optionnel)

1. Authentication → **Email Templates**
2. Clique **Confirm signup**
3. Vérifie que `{{ .ConfirmationURL }}` est présent

---

## ✅ ÉTAPE 3 : Test (3 minutes)

### 1. Nettoyer

```sql
-- Dans Supabase SQL Editor
-- Remplace par ton email de test
DELETE FROM auth.users WHERE email = 'test@example.com';
```

### 2. S'inscrire

1. Ouvre navigateur incognito
2. Va sur pulse-lead.com (ou localhost:5173)
3. Clique "S'inscrire"
4. Entre email + password
5. ✅ **Attendu** : Toast "Vérifiez votre boîte mail !"

### 3. Confirmer Email

1. Ouvre ta boîte mail
2. Clique sur le lien
3. ✅ **Attendu** : Page avec ✅ "Email confirmé !"

### 4. Se Connecter

1. Clique "Se connecter"
2. Entre email + password
3. ✅ **Attendu** : Redirection vers page "Choisir votre plan"

### 5. Choisir FREE

1. Clique "Commencer gratuitement"
2. ✅ **Attendu** : 
   - Toast "🎉 Bienvenue sur PULSE FREE !"
   - Dashboard avec "30 prospects | 2 tournées"

---

## 🐛 Si Problème

### Erreur "Database error"
→ Réexécute `FIX_FINAL_RADICAL.sql`

### Erreur "tournees_created_this_month"
→ Réexécute `FIX_COLONNE_TOURNEES.sql`

### Lien email ne marche pas
→ Vérifie URLs de redirection dans Supabase

### Boucle de redirection
```sql
UPDATE user_quotas SET is_first_login = false WHERE user_id = 'TON_ID';
```

---

## 📋 Checklist Rapide

- [ ] `FIX_COLONNE_TOURNEES.sql` exécuté
- [ ] `FIX_FINAL_RADICAL.sql` exécuté
- [ ] URLs configurées dans Supabase
- [ ] Inscription testée
- [ ] Email confirmé
- [ ] Connexion OK
- [ ] Choix plan OK
- [ ] Dashboard accessible

---

## ⏱️ Temps Total : 10 minutes

1. SQL : 5 min
2. Config : 2 min
3. Test : 3 min

---

## 👉 COMMENCE MAINTENANT

**Étape 1 :** Ouvre Supabase SQL Editor  
**Étape 2 :** Exécute `FIX_COLONNE_TOURNEES.sql`  
**Étape 3 :** Exécute `FIX_FINAL_RADICAL.sql`  
**Étape 4 :** Configure les URLs  
**Étape 5 :** Teste l'inscription

**C'EST PARTI ! 🚀**
