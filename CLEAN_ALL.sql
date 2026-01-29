-- NETTOYER TOUTES LES DONNÉES DE TEST
DELETE FROM user_unlocked_prospects;
DELETE FROM user_subscriptions;
DELETE FROM user_quotas;
DELETE FROM auth.users;

-- VÉRIFIER
SELECT 'user_quotas' as table_name, COUNT(*) as count FROM user_quotas
UNION ALL
SELECT 'user_subscriptions', COUNT(*) FROM user_subscriptions
UNION ALL
SELECT 'auth.users', COUNT(*) FROM auth.users;
