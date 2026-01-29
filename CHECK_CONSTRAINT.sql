-- Vérifier la contrainte sur subscription_status
SELECT 
    conname AS constraint_name,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'user_subscriptions'::regclass
AND conname LIKE '%subscription_status%';
