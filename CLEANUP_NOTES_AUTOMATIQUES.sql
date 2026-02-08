-- Nettoyer les notes automatiques "Depuis tournée"
UPDATE lead_interactions
SET notes = NULL
WHERE notes LIKE '%Depuis tournée%';

-- Vérifier le résultat
SELECT 
  COUNT(*) as total_interactions,
  COUNT(*) FILTER (WHERE notes IS NOT NULL) as avec_notes,
  COUNT(*) FILTER (WHERE notes IS NULL) as sans_notes
FROM lead_interactions;
