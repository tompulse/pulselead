-- Ajouter les colonnes naf_groupe et naf_classe
ALTER TABLE nouveaux_sites 
ADD COLUMN IF NOT EXISTS naf_groupe TEXT,
ADD COLUMN IF NOT EXISTS naf_classe TEXT;

-- Peupler les nouvelles colonnes depuis code_naf
UPDATE nouveaux_sites SET
  naf_groupe = SUBSTRING(code_naf, 1, 4),
  naf_classe = SUBSTRING(code_naf, 1, 5)
WHERE code_naf IS NOT NULL AND (naf_groupe IS NULL OR naf_classe IS NULL);

-- Créer des index pour les performances
CREATE INDEX IF NOT EXISTS idx_nouveaux_sites_naf_groupe ON nouveaux_sites(naf_groupe);
CREATE INDEX IF NOT EXISTS idx_nouveaux_sites_naf_classe ON nouveaux_sites(naf_classe);

-- Mettre à jour la fonction pour inclure les 5 niveaux
CREATE OR REPLACE FUNCTION public.get_nouveaux_sites_filter_counts_v2()
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT jsonb_build_object(
    'nafSections', COALESCE((
      SELECT jsonb_object_agg(naf_section, cnt) 
      FROM (
        SELECT naf_section, COUNT(*)::int as cnt 
        FROM nouveaux_sites 
        WHERE naf_section IS NOT NULL 
        GROUP BY naf_section
      ) s
    ), '{}'::jsonb),
    'nafDivisions', COALESCE((
      SELECT jsonb_object_agg(naf_division, cnt)
      FROM (
        SELECT naf_division, COUNT(*)::int as cnt 
        FROM nouveaux_sites 
        WHERE naf_division IS NOT NULL 
        GROUP BY naf_division
      ) d
    ), '{}'::jsonb),
    'nafGroupes', COALESCE((
      SELECT jsonb_object_agg(naf_groupe, cnt)
      FROM (
        SELECT naf_groupe, COUNT(*)::int as cnt 
        FROM nouveaux_sites 
        WHERE naf_groupe IS NOT NULL 
        GROUP BY naf_groupe
      ) g
    ), '{}'::jsonb),
    'nafClasses', COALESCE((
      SELECT jsonb_object_agg(naf_classe, cnt)
      FROM (
        SELECT naf_classe, COUNT(*)::int as cnt 
        FROM nouveaux_sites 
        WHERE naf_classe IS NOT NULL 
        GROUP BY naf_classe
      ) c
    ), '{}'::jsonb),
    'nafSousClasses', COALESCE((
      SELECT jsonb_object_agg(code_naf, cnt)
      FROM (
        SELECT code_naf, COUNT(*)::int as cnt 
        FROM nouveaux_sites 
        WHERE code_naf IS NOT NULL 
        GROUP BY code_naf
      ) sc
    ), '{}'::jsonb),
    'departments', COALESCE((
      SELECT jsonb_object_agg(dept, cnt)
      FROM (
        SELECT SUBSTRING(code_postal, 1, 2) as dept, COUNT(*)::int as cnt 
        FROM nouveaux_sites 
        WHERE code_postal IS NOT NULL 
        GROUP BY SUBSTRING(code_postal, 1, 2)
      ) p
    ), '{}'::jsonb),
    'taillesEntreprise', COALESCE((
      SELECT jsonb_object_agg(categorie_entreprise, cnt)
      FROM (
        SELECT categorie_entreprise, COUNT(*)::int as cnt 
        FROM nouveaux_sites 
        WHERE categorie_entreprise IS NOT NULL 
        GROUP BY categorie_entreprise
      ) t
    ), '{}'::jsonb)
  );
$$;