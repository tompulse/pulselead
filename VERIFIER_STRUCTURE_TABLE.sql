-- Vérifier la structure réelle de la table nouveaux_sites
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'nouveaux_sites'
ORDER BY ordinal_position;
