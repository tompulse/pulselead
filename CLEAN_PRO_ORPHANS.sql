-- =====================================================
-- 🧹 NETTOYER LES PLANS PRO ORPHELINS
-- =====================================================
-- Ce script supprime les plans PRO créés sans paiement actif

-- Supprimer les plans PRO sans subscription active/trialing
DELETE FROM user_quotas
WHERE plan_type = 'pro'
AND user_id IN (
  SELECT uq.user_id
  FROM user_quotas uq
  LEFT JOIN user_subscriptions us ON uq.user_id = us.user_id
  WHERE uq.plan_type = 'pro'
  AND (us.subscription_status IS NULL OR us.subscription_status NOT IN ('active', 'trialing'))
);

-- Supprimer les subscriptions PRO inactives
DELETE FROM user_subscriptions
WHERE plan_type = 'pro'
AND subscription_status NOT IN ('active', 'trialing');

-- Voir le résultat
SELECT 
  'Plans PRO restants' AS status,
  COUNT(*) AS count
FROM user_quotas
WHERE plan_type = 'pro';
