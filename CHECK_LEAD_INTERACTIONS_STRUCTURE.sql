-- Vérifier la structure de lead_interactions
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'lead_interactions'
ORDER BY ordinal_position;

-- Vérifier les données
SELECT * FROM lead_interactions LIMIT 5;
