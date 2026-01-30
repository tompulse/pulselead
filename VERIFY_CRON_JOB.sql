-- =====================================================
-- VÉRIFIER QUE LE CRON JOB EST ACTIF
-- =====================================================

-- 1. Voir tous les cron jobs actifs
SELECT 
  jobid,
  jobname,
  schedule,
  command,
  active
FROM cron.job
WHERE jobname = 'check-trial-reminders-daily';

-- Si tu vois une ligne avec active = true, c'est bon ! ✅

-- =====================================================
-- COMMENT ÇA FONCTIONNE ?
-- =====================================================

-- Le cron job s'exécute automatiquement TOUS LES JOURS à 10h UTC (11h Paris)
-- 
-- FLUX :
-- 1. Cron job se déclenche à 10h UTC
-- 2. Appelle la fonction "check-trial-reminders"
-- 3. Cette fonction cherche tous les users en "trialing" qui finissent dans 3 jours
-- 4. Pour chacun, envoie un email via "send-trial-reminder"
-- 5. Log le résultat dans "audit_logs"

-- =====================================================
-- TESTER MANUELLEMENT (sans attendre 10h demain)
-- =====================================================

-- Si tu veux tester MAINTENANT sans attendre le cron :
-- 1. Va sur Supabase Dashboard
-- 2. Edge Functions → check-trial-reminders
-- 3. Clique "Invoke function"
-- 4. Regarde les logs pour voir ce qui se passe

-- OU via SQL (appel direct) :
SELECT net.http_post(
  url := 'https://ywavxjmbsywpjzchuuho.supabase.co/functions/v1/check-trial-reminders',
  headers := '{"Content-Type": "application/json", "Authorization": "Bearer ' || current_setting('app.settings.service_role_key') || '"}',
  body := '{}'
);

-- =====================================================
-- VOIR LES LOGS D'EXÉCUTION DU CRON
-- =====================================================

-- Si le cron a déjà tourné, voir les logs :
SELECT * FROM cron.job_run_details
WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'check-trial-reminders-daily')
ORDER BY start_time DESC
LIMIT 10;

-- =====================================================
-- SUPPRIMER LE CRON (si besoin)
-- =====================================================

-- Si tu veux le supprimer :
-- SELECT cron.unschedule('check-trial-reminders-daily');
