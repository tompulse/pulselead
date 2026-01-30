# 📧 GUIDE COMPLET - EMAILS AUTOMATIQUES PULSE

## ✅ EMAILS ACTIFS ET FONCTIONNELS

### 1. **Mail de Bienvenue après Inscription** ✅
- **Fonction** : `send-welcome`
- **Déclenchement** : Après paiement Stripe 0€ (essai gratuit)
- **Événement webhook** : `checkout.session.completed` + status `trialing`
- **Contenu** :
  - Bienvenue personnalisée (prénom si disponible)
  - Date de fin d'essai
  - Montant qui sera prélevé après essai
  - Guide des premiers pas (3 étapes)
  - Bouton "Accéder à mon tableau de bord"
  - Liens démo + WhatsApp
- **ÉTAT** : ✅ **ACTIF** (vient d'être réactivé)

---

### 2. **Mail de Confirmation de Paiement + Bienvenue PRO** ✅
- **Fonction** : `send-payment-confirmation`
- **Déclenchement** : Premier prélèvement réussi (fin essai)
- **Événement webhook** : `invoice.paid` + conversion `trialing` → `active`
- **Contenu** :
  - Célébration bienvenue dans la famille PULSE
  - Confirmation du montant payé
  - Date prochain prélèvement
  - Liste complète des fonctionnalités PRO incluses
  - Bouton "Accéder à mon espace"
  - Lien vers espace sécurité
- **ÉTAT** : ✅ **ACTIF ET FONCTIONNEL**

---

## ⚠️ À CONFIGURER

### 3. **Mail de Rappel 3 jours avant Fin d'Essai** ⚠️
- **Fonctions** : 
  - `send-trial-reminder` (envoie le mail)
  - `check-trial-reminders` (cron job quotidien)
- **Contenu** :
  - Rappel fin essai dans 3 jours
  - Date exacte de prélèvement
  - Montant qui sera débité
  - Bouton "Continuer avec PULSE"
  - Lien "Gérer ou annuler mon abonnement"
  - Liste des fonctionnalités qu'ils gardent
  - Contact direct (Calendly + WhatsApp)
- **ÉTAT** : ⚠️ **FONCTION EXISTE, CRON JOB À CONFIGURER**

#### 🔧 **Configuration du Cron Job :**

1. **Aller sur Supabase Dashboard** → SQL Editor
2. **Exécuter ce SQL** :

```sql
-- Activer l'extension pg_cron si pas déjà fait
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Créer le cron job qui s'exécute tous les jours à 10h (UTC)
SELECT cron.schedule(
  'check-trial-reminders-daily',
  '0 10 * * *', -- Tous les jours à 10h UTC (11h Paris)
  $$
    SELECT net.http_post(
      url := 'https://ywavxjmbsywpjzchuuho.supabase.co/functions/v1/check-trial-reminders',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer ' || current_setting('app.settings.service_role_key') || '"}',
      body := '{}'
    );
  $$
);

-- Vérifier que le cron job est actif
SELECT * FROM cron.job WHERE jobname = 'check-trial-reminders-daily';
```

3. **Alternative** : Via Supabase UI
   - Dashboard → Database → Cron Jobs
   - Créer nouveau job
   - Schedule : `0 10 * * *` (tous les jours à 10h)
   - SQL : Appel à la fonction `check-trial-reminders`

---

### 4. **Factures Stripe Automatiques** ⚠️
- **Gérées par** : Stripe (pas par nos fonctions)
- **Contenu** : Facture PDF + récapitulatif

#### 🔧 **Configuration Stripe :**

1. **Aller sur Stripe Dashboard** → [https://dashboard.stripe.com](https://dashboard.stripe.com)
2. **Settings → Customer emails**
3. **Activer** :
   - ✅ "Email customer on successful payment" (Facture envoyée automatiquement)
   - ✅ "Email customer on failed payment"
   - ✅ "Email invoice to customer" (pour les abonnements)
4. **Personnaliser** :
   - Logo PULSE
   - Couleur de marque (#00BFFF)
   - Informations de contact

---

## 📊 RÉCAPITULATIF DES EMAILS

| Email | Déclencheur | Timing | Statut |
|-------|-------------|--------|--------|
| 1. Bienvenue essai | Paiement Stripe 0€ | Immédiat | ✅ **ACTIF** |
| 2. Rappel fin essai | 3 jours avant fin | J-3 | ⚠️ **À CONFIGURER** |
| 3. Confirmation paiement | Premier prélèvement | Immédiat | ✅ **ACTIF** |
| 4. Facture Stripe | Chaque prélèvement | Immédiat | ⚠️ **À VÉRIFIER** |

---

## 🚀 ACTIONS IMMÉDIATES

### ✅ **FAIT** :
1. Mail de bienvenue réactivé dans le webhook

### 🔧 **À FAIRE MAINTENANT** :

1. **Configurer le cron job pour les rappels de fin d'essai** :
   - Exécuter le SQL ci-dessus dans Supabase
   - Vérifier que le cron job est actif

2. **Vérifier les paramètres d'email Stripe** :
   - Se connecter au Dashboard Stripe
   - Activer l'envoi automatique des factures
   - Personnaliser les emails avec le logo PULSE

3. **Déployer le webhook mis à jour** :
   ```bash
   cd /Users/raws/pulse-project/pulselead
   supabase functions deploy stripe-webhook
   ```

4. **Tester le flux complet** :
   - Créer un compte test
   - Passer par Stripe (essai gratuit)
   - Vérifier réception du mail de bienvenue
   - Attendre 3 jours pour le rappel (ou modifier le cron pour test)

---

## 📝 NOTES IMPORTANTES

- **RESEND_API_KEY** : Vérifier qu'elle est bien configurée dans Supabase Secrets
- **Tous les emails** sont envoyés depuis `noreply@mail.pulse-lead.com`
- **Domaine** : S'assurer que `mail.pulse-lead.com` est configuré dans Resend
- **Logs** : Tous les envois d'emails sont loggés dans la console Supabase Edge Functions

---

## 🆘 DÉPANNAGE

### Mail de bienvenue ne s'envoie pas :
1. Vérifier que `RESEND_API_KEY` est configurée
2. Vérifier les logs du webhook : Dashboard → Edge Functions → stripe-webhook
3. Tester manuellement : Dashboard → Edge Functions → send-welcome → Invoke

### Rappels de fin d'essai ne s'envoient pas :
1. Vérifier que le cron job est actif : `SELECT * FROM cron.job;`
2. Vérifier les logs de `check-trial-reminders`
3. Tester manuellement la fonction

### Factures Stripe non reçues :
1. Vérifier les paramètres Stripe → Customer emails
2. Vérifier le spam de l'email test
3. Vérifier que l'email client est correct dans Stripe

---

**DERNIÈRE MISE À JOUR** : 30 janvier 2026
**STATUS** : 2/4 emails actifs, 2/4 à configurer
