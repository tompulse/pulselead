# 🔄 MIGRATION USER TRIAL - 30 JOURS OFFERTS

## 📋 **CONTEXTE**

Suite à la migration du SaaS depuis Lovable vers une infrastructure propre, ton user trial doit recréer son compte.

**BONNE NOUVELLE :** Tu lui offres **30 jours gratuits** pour compenser la migration + il aura accès à la **nouvelle feature d'enrichissement des dirigeants** ! 🎉

---

## ✅ **ÉTAPE 1 : Supprimer l'ancien abonnement Stripe**

1. Va sur **https://dashboard.stripe.com/customers**
2. Cherche le client : `cus_Tofn1d6TzKUvo5` (ou cherche par email)
3. Clique sur "Actions" → **"Supprimer le client"**
4. ✅ Confirme la suppression
5. **Résultat :** Aucun débit ne sera effectué

---

## ✅ **ÉTAPE 2 : Le user recrée son compte**

### Message à envoyer au user :

```
Salut [Prénom] !

Suite à la migration technique du SaaS, je t'offre 30 jours d'accès gratuit pour compenser la recréation de ton compte ! 🎁

En bonus, tu auras accès à la nouvelle feature que tu as demandée : 
🔥 Enrichissement automatique des noms de dirigeants en 2 secondes !

Voici comment faire :

1. Va sur : http://localhost:8080/
   (Ou l'URL de production quand elle sera prête)

2. Clique sur "S'inscrire"

3. Utilise ton email habituel : [son email]

4. Crée un mot de passe

5. Valide ton email

6. Dis-moi quand c'est fait, j'active ton accès gratuit de 30 jours ! ✅

Merci pour ta patience ! 🚀
```

---

## ✅ **ÉTAPE 3 : Activer l'accès gratuit 30 jours**

Une fois que le user a créé son compte :

### 1. Va sur le dashboard Supabase

**https://supabase.com/dashboard/project/ywavxjmbsywpjzchuuho**

### 2. Va dans "SQL Editor"

Clique sur "New query"

### 3. Exécute ce script SQL

```sql
-- ========================================
-- DONNER 30 JOURS GRATUITS AU USER TRIAL
-- ========================================

-- ÉTAPE 1 : Vérifier que le user existe
SELECT id, email, created_at 
FROM auth.users 
WHERE email = 'EMAIL_DU_USER@example.com';  -- ← REMPLACE PAR SON EMAIL

-- Si tu vois son user_id, continue avec la suite :

-- ÉTAPE 2 : Créer l'abonnement actif (30 jours gratuits)
INSERT INTO public.user_subscriptions (
  user_id, 
  subscription_status, 
  subscription_plan, 
  subscription_start_date, 
  subscription_end_date,
  created_at,
  updated_at
)
SELECT 
  id,
  'active',
  'monthly',
  NOW(),
  NOW() + INTERVAL '30 days',
  NOW(),
  NOW()
FROM auth.users
WHERE email = 'EMAIL_DU_USER@example.com'  -- ← REMPLACE PAR SON EMAIL
ON CONFLICT (user_id) DO UPDATE SET
  subscription_status = 'active',
  subscription_plan = 'monthly',
  subscription_start_date = NOW(),
  subscription_end_date = NOW() + INTERVAL '30 days',
  updated_at = NOW();

-- ÉTAPE 3 : Vérifier que ça a marché
SELECT 
  u.email,
  us.subscription_status,
  us.subscription_plan,
  us.subscription_start_date,
  us.subscription_end_date
FROM auth.users u
JOIN user_subscriptions us ON us.user_id = u.id
WHERE u.email = 'EMAIL_DU_USER@example.com';  -- ← REMPLACE PAR SON EMAIL
```

### 4. Résultat attendu

Tu devrais voir :
```
email: son_email@example.com
subscription_status: active
subscription_plan: monthly
subscription_start_date: 2026-01-22 ...
subscription_end_date: 2026-02-21 ...
```

✅ **C'est bon ! Il a 30 jours d'accès !**

---

## ✅ **ÉTAPE 4 : Importer ses prospects (si nécessaire)**

Si le user avait des prospects dans l'ancien système :

### Option A : Il les réimporte via l'interface
- Dashboard → Bouton "Importer"
- Upload CSV/Excel
- 5 minutes max

### Option B : Tu les importes via SQL
Si tu as un export de la table `nouveaux_sites` de l'ancien projet, je peux te préparer un script d'import.

---

## 🎁 **BONUS : Tester l'enrichissement dirigeant**

Une fois connecté, le user peut tester la nouvelle feature :

1. Va dans **"Prospects"**
2. Clique sur **une entreprise**
3. Onglet **"Infos"**
4. Scroll jusqu'à **"👤 DIRIGEANT"**
5. Clique sur **"Trouver le gérant"**
6. **BOOM !** Le nom du dirigeant apparaît en 2-3 secondes ! 🔥

---

## 📊 **COÛT PAPPERS**

- **1 crédit = 1 enrichissement**
- **1 000 crédits = 9€ HT**
- On enrichit **1 seule fois** par entreprise (flag dans la BDD)
- Exemple : 100 prospects enrichis = 9€/mois

---

## 🚀 **APRÈS LES 30 JOURS GRATUITS**

Le user peut :
- **Mettre sa carte** via le portail Stripe (bouton dans le dashboard)
- **Continuer avec l'abonnement mensuel à 79€/mois**

---

## 📞 **SUPPORT**

Si problème :
1. Vérifie que l'app tourne : http://localhost:8080/
2. Vérifie le `.env` : doit pointer vers `ywavxjmbsywpjzchuuho`
3. Vérifie les logs de la Edge Function dans Supabase Dashboard
4. Check que la clé API Pappers est valide : https://www.pappers.fr/api

---

## 🎯 **RÉSUMÉ**

✅ User recrée son compte (même email, pas de problème)  
✅ Tu lui donnes 30 jours gratuits (script SQL)  
✅ Il teste l'enrichissement dirigeant  
✅ Il est bluffé et devient client payant ! 💰

---

**Bonne chance pour demain ! 🔥**
