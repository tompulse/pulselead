-- Vérifier les VRAIS noms de colonnes (sensibles à la casse)
SELECT 
  column_name,
  data_type,
  character_maximum_length,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'nouveaux_sites'
ORDER BY ordinal_position;
