# 🚀 DÉPLOIEMENT PRIX 49€ - GUIDE RAPIDE

## ✅ MODIFICATIONS EFFECTUÉES

Tous les prix ont été mis à jour de **79€ → 49€/mois** dans :

### **Edge Functions** :
- ✅ `send-welcome` (mail de bienvenue)
- ✅ `send-trial-reminder` (mail rappel J-3)
- ✅ `send-payment-confirmation` (mail confirmation paiement)

### **Documentation** :
- ✅ `EMAIL_RAPPEL_FIN_ESSAI_DETAIL.md`
- ✅ `CRON_JOB_VISUAL.md`
- ✅ `test-email-rappel.html`
- ✅ `MIGRATION_USER_TRIAL.md`
- ✅ `PAPPERS_INTEGRATION.md`

---

## 🔥 **ÉTAPE OBLIGATOIRE : DÉPLOYER LES FONCTIONS**

Les fonctions Edge Functions ont été modifiées et **doivent être redéployées** pour que le nouveau prix soit actif.

### **COMMANDE À EXÉCUTER** :

```bash
cd /Users/raws/pulse-project/pulselead
supabase functions deploy send-welcome send-trial-reminder send-payment-confirmation
```

---

## 📋 **VÉRIFICATIONS POST-DÉPLOIEMENT**

### **1. Vérifier que les fonctions sont bien déployées** :
```bash
# Voir la liste des fonctions déployées
supabase functions list
```

Tu devrais voir :
```
send-welcome                    | ✓ Deployed
send-trial-reminder             | ✓ Deployed
send-payment-confirmation       | ✓ Deployed
```

---

### **2. Tester l'email de rappel avec le nouveau prix** :

1. Va sur **Supabase Dashboard** → **Edge Functions**
2. Clique sur `send-trial-reminder`
3. **Invoke function** avec :
```json
{
  "email": "tomiolovpro@gmail.com",
  "firstName": "Tom",
  "trialEndDate": "2026-02-05T00:00:00Z",
  "amountAfterTrial": 49
}
```
4. Vérifie ta boîte mail → Tu devrais voir **49€/mois** au lieu de 79€ ! ✅

---

### **3. Tester l'email de bienvenue avec le nouveau prix** :

1. Supabase Dashboard → **Edge Functions** → `send-welcome`
2. **Invoke function** avec :
```json
{
  "userId": "test-user-id",
  "email": "tomiolovpro@gmail.com",
  "trialEnd": "2026-02-05T00:00:00Z",
  "firstName": "Tom",
  "amountAfterTrial": 49
}
```
3. Vérifie ta boîte mail → Tu devrais voir **49€/mois** ! ✅

---

### **4. Tester l'email de confirmation paiement** :

1. Supabase Dashboard → **Edge Functions** → `send-payment-confirmation`
2. **Invoke function** avec :
```json
{
  "email": "tomiolovpro@gmail.com",
  "firstName": "Tom",
  "amountPaid": 49,
  "nextPaymentDate": "2026-03-05T00:00:00Z"
}
```
3. Vérifie ta boîte mail → Tu devrais voir **49€** ! ✅

---

## 🎯 **RÉSUMÉ**

| Élément | Statut | Action requise |
|---------|--------|----------------|
| **Code modifié** | ✅ | Aucune (fait) |
| **Git commit & push** | ✅ | Aucune (fait) |
| **Déploiement fonctions** | ⚠️ | **À FAIRE** (voir commande ci-dessus) |
| **Tests emails** | ⚠️ | **À FAIRE** (voir instructions ci-dessus) |

---

## ⚠️ **IMPORTANT : STRIPE**

**N'oublie pas de mettre à jour le prix dans Stripe !**

1. Va sur **Stripe Dashboard** → https://dashboard.stripe.com
2. **Products** → Clique sur **"PULSE PRO"**
3. Vérifie que le prix mensuel est bien **49€**
4. Si ce n'est pas le cas, modifie-le ou crée un nouveau prix à 49€
5. Mets à jour l'URL du Payment Link avec le nouveau prix
6. Remplace `VITE_STRIPE_PAYMENT_LINK_PRO` dans `.env` si nécessaire

---

## 🧪 **TEST COMPLET**

Pour tester le parcours complet avec le nouveau prix :

1. Créer un nouveau compte test
2. Confirmer l'email
3. Être redirigé vers Stripe
4. Payer 0€ (essai gratuit)
5. Recevoir l'email de bienvenue avec **49€/mois** ✅
6. Attendre J-3 (ou tester manuellement)
7. Recevoir l'email de rappel avec **49€/mois** ✅
8. Fin de l'essai → Prélèvement automatique **49€** ✅
9. Recevoir l'email de confirmation avec **49€** ✅

---

**DERNIÈRE MISE À JOUR** : 30 janvier 2026  
**COMMIT** : `0c0fd17` - "fix: Mise à jour du prix de 79€ à 49€/mois"

---

**CONCLUSION : TOUT EST PRÊT ! IL SUFFIT DE DÉPLOYER LES FONCTIONS ! 🚀**
