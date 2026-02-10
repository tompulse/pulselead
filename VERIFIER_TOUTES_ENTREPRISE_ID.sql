-- Vérifier TOUTES les colonnes entreprise_id dans la base
SELECT 
  table_name,
  column_name,
  data_type,
  udt_name
FROM information_schema.columns
WHERE column_name LIKE '%entreprise%id%'
  AND table_schema = 'public'
ORDER BY table_name, column_name;
