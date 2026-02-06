-- 🎲 Créer une fonction pour mélanger les prospects avec diversité

CREATE OR REPLACE FUNCTION public.get_nouveaux_sites_random_diverse(
  p_limit INTEGER DEFAULT 100,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id BIGINT,
  nom TEXT,
  siret TEXT,
  code_postal TEXT,
  code_naf TEXT,
  naf_section TEXT,
  ville TEXT,
  adresse TEXT,
  numero_voie TEXT,
  type_voie TEXT,
  libelle_voie TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  date_creation DATE,
  categorie_entreprise TEXT,
  categorie_juridique TEXT,
  est_siege BOOLEAN,
  archived BOOLEAN,
  complement_adresse TEXT,
  coordonnee_lambert_x DOUBLE PRECISION,
  coordonnee_lambert_y DOUBLE PRECISION,
  naf_division TEXT,
  naf_groupe TEXT,
  naf_classe TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE SQL
STABLE
AS $$
  WITH ranked AS (
    SELECT 
      *,
      -- Utiliser un hash déterministe de l'ID pour un ordre stable mais varié
      MD5(id::TEXT) as random_hash,
      -- ROW_NUMBER par département pour alterner
      ROW_NUMBER() OVER (PARTITION BY LEFT(code_postal, 2) ORDER BY MD5(id::TEXT)) as dept_rank,
      -- ROW_NUMBER par NAF pour alterner
      ROW_NUMBER() OVER (PARTITION BY naf_section ORDER BY MD5(id::TEXT)) as naf_rank
    FROM nouveaux_sites
    WHERE archived = false
  )
  SELECT 
    id, nom, siret, code_postal, code_naf, naf_section, ville, adresse,
    numero_voie, type_voie, libelle_voie, latitude, longitude, date_creation,
    categorie_entreprise, categorie_juridique, est_siege, archived,
    complement_adresse, coordonnee_lambert_x, coordonnee_lambert_y,
    naf_division, naf_groupe, naf_classe, created_at, updated_at
  FROM ranked
  ORDER BY 
    -- Alterner départements et NAF pour maximiser la diversité
    (dept_rank + naf_rank),
    random_hash
  LIMIT p_limit
  OFFSET p_offset;
$$;
