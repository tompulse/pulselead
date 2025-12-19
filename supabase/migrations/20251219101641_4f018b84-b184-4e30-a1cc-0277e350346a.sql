-- Créer une fonction PostgreSQL pour convertir Lambert93 vers WGS84
CREATE OR REPLACE FUNCTION public.lambert93_to_wgs84(x_lambert DOUBLE PRECISION, y_lambert DOUBLE PRECISION)
RETURNS TABLE(lat DOUBLE PRECISION, lng DOUBLE PRECISION)
LANGUAGE plpgsql
IMMUTABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  n CONSTANT DOUBLE PRECISION := 0.7256077650532670;
  c CONSTANT DOUBLE PRECISION := 11754255.426096;
  xs CONSTANT DOUBLE PRECISION := 700000;
  ys CONSTANT DOUBLE PRECISION := 12655612.049876;
  e CONSTANT DOUBLE PRECISION := 0.08181919106;
  lambda0 CONSTANT DOUBLE PRECISION := 3 * PI() / 180;
  
  dx DOUBLE PRECISION;
  dy DOUBLE PRECISION;
  R DOUBLE PRECISION;
  gamma DOUBLE PRECISION;
  lambda DOUBLE PRECISION;
  L DOUBLE PRECISION;
  phi DOUBLE PRECISION;
  e_sin_phi DOUBLE PRECISION;
  i INTEGER;
BEGIN
  -- Validation des coordonnées Lambert 93
  IF x_lambert IS NULL OR y_lambert IS NULL OR x_lambert = 0 OR y_lambert = 0 THEN
    RETURN;
  END IF;
  
  IF x_lambert < 100000 OR x_lambert > 1300000 OR y_lambert < 6000000 OR y_lambert > 7200000 THEN
    RETURN;
  END IF;

  dx := x_lambert - xs;
  dy := ys - y_lambert;  -- ys - y pour avoir la bonne direction
  R := SQRT(dx * dx + dy * dy);
  gamma := ATAN2(dx, dy);
  lambda := lambda0 + gamma / n;
  L := -LN(R / c) / n;
  
  -- Latitude isométrique inverse
  phi := 2 * ATAN(EXP(L)) - PI() / 2;
  
  -- Itérations pour affiner phi
  FOR i IN 1..10 LOOP
    e_sin_phi := e * SIN(phi);
    phi := 2 * ATAN(POWER((1 + e_sin_phi) / (1 - e_sin_phi), e / 2) * EXP(L)) - PI() / 2;
  END LOOP;

  lat := phi * 180 / PI();
  lng := lambda * 180 / PI();
  
  -- Validation France métropolitaine
  IF lat < 41 OR lat > 51.5 OR lng < -5.5 OR lng > 10 THEN
    RETURN;
  END IF;
  
  RETURN NEXT;
END;
$$;

-- Recalculer toutes les coordonnées latitude/longitude à partir des coordonnées Lambert
UPDATE nouveaux_sites ns
SET 
  latitude = conv.lat,
  longitude = conv.lng
FROM (
  SELECT 
    id,
    (lambert93_to_wgs84(coordonnee_lambert_x, coordonnee_lambert_y)).lat AS lat,
    (lambert93_to_wgs84(coordonnee_lambert_x, coordonnee_lambert_y)).lng AS lng
  FROM nouveaux_sites
  WHERE coordonnee_lambert_x IS NOT NULL 
    AND coordonnee_lambert_y IS NOT NULL
    AND coordonnee_lambert_x != 0
    AND coordonnee_lambert_y != 0
) AS conv
WHERE ns.id = conv.id
  AND conv.lat IS NOT NULL 
  AND conv.lng IS NOT NULL;