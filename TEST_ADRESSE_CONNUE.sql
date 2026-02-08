-- 🔍 TEST avec une adresse connue pour vérifier si le décalage vient des données

-- Tester avec la Tour Eiffel (adresse très connue)
-- Coordonnées correctes de la Tour Eiffel: 48.858370, 2.294481

SELECT 
  id,
  nom,
  adresse,
  ville,
  code_postal,
  latitude,
  longitude,
  -- Calculer la distance par rapport aux vraies coordonnées de la Tour Eiffel
  CASE 
    WHEN adresse ILIKE '%tour eiffel%' OR adresse ILIKE '%champ de mars%' THEN
      CONCAT(
        'Distance: ',
        ROUND(
          SQRT(
            POW((latitude - 48.858370) * 111.32, 2) + 
            POW((longitude - 2.294481) * 111.32 * COS(RADIANS(latitude)), 2)
          ) * 1000
        )::text,
        ' mètres'
      )
    ELSE 'N/A'
  END as precision_check
FROM nouveaux_sites
WHERE (adresse ILIKE '%tour eiffel%' OR adresse ILIKE '%champ de mars%')
  AND latitude IS NOT NULL
  AND longitude IS NOT NULL
LIMIT 5;

-- Quelques adresses parisiennes connues pour test
SELECT 
  nom,
  adresse,
  code_postal,
  ville,
  latitude,
  longitude
FROM nouveaux_sites
WHERE code_postal LIKE '75%'
  AND latitude IS NOT NULL
  AND longitude IS NOT NULL
  AND adresse IS NOT NULL
  AND (
    adresse ILIKE '%avenue des champs%'
    OR adresse ILIKE '%notre dame%'
    OR adresse ILIKE '%arc de triomphe%'
    OR adresse ILIKE '%place de la concorde%'
    OR adresse ILIKE '%louvre%'
  )
LIMIT 10;

-- ✅ Testez ces coordonnées sur Google Maps pour voir si elles sont précises
-- Si elles sont décalées sur Google Maps aussi, c'est un problème de données
-- Si elles sont bonnes sur Google Maps mais décalées dans votre app, c'est un problème de code
