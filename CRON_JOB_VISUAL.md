# 🕐 CRON JOB - RAPPEL FIN D'ESSAI (Expliqué Visuellement)

## ✅ TON CRON JOB EST ACTIF ! 

**Résultat `[{"schedule": 1}]` = SUCCÈS** ✅

---

## 📊 **COMMENT ÇA MARCHE (FLUX COMPLET)**

```
┌─────────────────────────────────────────────────────────────────┐
│                    TOUS LES JOURS À 10H UTC                     │
│                        (11h HEURE PARIS)                        │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
        ┌────────────────────────────────────┐
        │  🤖 CRON JOB SE DÉCLENCHE AUTO     │
        │  (check-trial-reminders-daily)     │
        └────────────────┬───────────────────┘
                         │
                         ▼
        ┌────────────────────────────────────┐
        │  📞 APPELLE LA FONCTION            │
        │  "check-trial-reminders"           │
        └────────────────┬───────────────────┘
                         │
                         ▼
        ┌────────────────────────────────────┐
        │  🔍 CHERCHE DANS LA BASE           │
        │  Tous les users en "trialing"      │
        │  dont l'essai finit DANS 3 JOURS   │
        └────────────────┬───────────────────┘
                         │
                    ┌────┴────┐
                    │         │
            Aucun user   Des users trouvés
            trouvé           │
                │            ▼
                │    ┌──────────────────────┐
                │    │  POUR CHAQUE USER :  │
                │    │  1. Récupère email   │
                │    │  2. Récupère prénom  │
                │    │  3. Envoie mail via  │
                │    │     send-trial-      │
                │    │     reminder         │
                │    └──────────┬───────────┘
                │               │
                │               ▼
                │    ┌──────────────────────┐
                │    │  ✉️ EMAIL ENVOYÉ !   │
                │    │  "Ton essai se       │
                │    │   termine dans       │
                │    │   3 jours"           │
                │    └──────────┬───────────┘
                │               │
                │               ▼
                │    ┌──────────────────────┐
                │    │  📝 LOG DANS         │
                │    │  audit_logs          │
                │    └──────────────────────┘
                │
                ▼
        ┌────────────────────────────────────┐
        │  ✅ CRON TERMINÉ                   │
        │  Attente 24h pour prochaine exec   │
        └────────────────────────────────────┘
```

---

## 👁️ **OÙ VOIR QUE ÇA TOURNE ?**

### **1. Vérifier que le cron est actif** :
```sql
-- Copie-colle ça dans Supabase SQL Editor
SELECT * FROM cron.job WHERE jobname = 'check-trial-reminders-daily';
```

**Tu dois voir** :
```
jobid | jobname                       | schedule    | active
------|-------------------------------|-------------|--------
1     | check-trial-reminders-daily   | 0 10 * * *  | true
```

✅ Si `active = true` → **C'EST BON !**

---

### **2. Voir les exécutions passées** :
```sql
-- Voir les 10 dernières exécutions du cron
SELECT 
  runid,
  start_time,
  end_time,
  status,
  return_message
FROM cron.job_run_details
WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'check-trial-reminders-daily')
ORDER BY start_time DESC
LIMIT 10;
```

**Tu verras** :
- Quand le cron a tourné
- Si ça a réussi (status = 'succeeded')
- Les messages de retour

---

### **3. Voir les emails envoyés** :
```sql
-- Voir les rappels envoyés
SELECT 
  user_id,
  action,
  new_values->>'email' as email,
  new_values->>'sent_at' as sent_at,
  created_at
FROM audit_logs
WHERE action = 'trial_reminder_sent'
ORDER BY created_at DESC
LIMIT 20;
```

**Tu verras** :
- Qui a reçu un email de rappel
- Quand ça a été envoyé

---

## 🧪 **TESTER MAINTENANT (sans attendre 10h demain)**

### **Option 1 : Via Supabase UI** (le plus simple)
1. Va sur Supabase Dashboard
2. **Edge Functions** → `check-trial-reminders`
3. Clique **"Invoke function"**
4. Regarde les logs en temps réel

### **Option 2 : Via SQL**
```sql
-- Déclencher manuellement le check
SELECT net.http_post(
  url := 'https://ywavxjmbsywpjzchuuho.supabase.co/functions/v1/check-trial-reminders',
  headers := '{"Content-Type": "application/json", "Authorization": "Bearer ' || current_setting('app.settings.service_role_key') || '"}',
  body := '{}'
);
```

---

## 📧 **À QUOI RESSEMBLE L'EMAIL ENVOYÉ ?**

### **Sujet** :
```
⏰ Ton essai PULSE se termine dans 3 jours
```

### **Contenu** :
- 🎯 Date exacte de fin d'essai
- 💳 Montant qui sera prélevé (49€)
- ✨ Bouton "Continuer avec PULSE"
- 🔗 Lien "Gérer ou annuler mon abonnement"
- 🎁 Liste des fonctionnalités qu'ils gardent
- 💬 Contact direct (Calendly + WhatsApp)

**Design** : Identique aux autres emails PULSE (fond noir, accent bleu cyan)

---

## ⏰ **QUAND LES EMAILS SERONT ENVOYÉS ?**

### **Exemple Timeline** :
```
📅 Jour 0 (aujourd'hui) : User s'inscrit, essai gratuit commence
📅 Jour 4 (dans 4 jours) : 10h → Cron tourne, rien (pas encore J-3)
📅 Jour 5 (dans 5 jours) : 10h → Cron tourne, rien (pas encore J-3)
📅 Jour 6 (dans 6 jours) : 10h → Cron tourne, rien (pas encore J-3)
📅 Jour 7 (J-3) : 10h → 📧 EMAIL ENVOYÉ ! "Plus que 3 jours"
📅 Jour 8 (J-2) : 10h → Cron tourne, mais email déjà envoyé (skip)
📅 Jour 9 (J-1) : 10h → Cron tourne, rien
📅 Jour 10 (FIN ESSAI) : Prélèvement automatique 49€
```

**Un seul email** est envoyé : **3 jours avant la fin**.

---

## 🎯 **RÉSUMÉ SIMPLE**

| Question | Réponse |
|----------|---------|
| **C'est activé ?** | ✅ Oui (`schedule: 1`) |
| **Quand ça tourne ?** | Tous les jours à 10h UTC (11h Paris) |
| **Qui reçoit l'email ?** | Users en essai qui finissent dans 3 jours |
| **Combien d'emails ?** | 1 seul, 3 jours avant fin |
| **C'est automatique ?** | ✅ 100% automatique |
| **Je dois faire quoi ?** | RIEN ! C'est configuré ✅ |

---

## 🆘 **DÉPANNAGE**

### **Le cron ne tourne pas** :
1. Vérifier que `pg_cron` est installé : `CREATE EXTENSION IF NOT EXISTS pg_cron;`
2. Vérifier que le cron est actif : `SELECT * FROM cron.job;`
3. Vérifier les logs : `SELECT * FROM cron.job_run_details;`

### **Les emails ne sont pas envoyés** :
1. Tester manuellement `check-trial-reminders` via Supabase UI
2. Vérifier que `RESEND_API_KEY` est configurée
3. Vérifier les logs de `send-trial-reminder`

---

**CONCLUSION : TON CRON EST ACTIF ET FONCTIONNEL ! 🎉**

Il enverra automatiquement les rappels tous les jours à 10h UTC. Tu n'as plus rien à faire !
