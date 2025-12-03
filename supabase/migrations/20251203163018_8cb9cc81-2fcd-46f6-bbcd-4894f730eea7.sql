-- Ajouter les colonnes NAF officielles
ALTER TABLE public.nouveaux_sites 
ADD COLUMN IF NOT EXISTS naf_section TEXT,
ADD COLUMN IF NOT EXISTS naf_division TEXT;

-- Créer un index pour les filtres
CREATE INDEX IF NOT EXISTS idx_nouveaux_sites_naf_section ON public.nouveaux_sites(naf_section);
CREATE INDEX IF NOT EXISTS idx_nouveaux_sites_naf_division ON public.nouveaux_sites(naf_division);

-- Mettre à jour les sections et divisions basées sur code_naf existant
UPDATE public.nouveaux_sites
SET 
  naf_division = SUBSTRING(REGEXP_REPLACE(code_naf, '[^0-9]', '', 'g'), 1, 2),
  naf_section = CASE 
    WHEN SUBSTRING(REGEXP_REPLACE(code_naf, '[^0-9]', '', 'g'), 1, 2) IN ('01', '02', '03') THEN 'A'
    WHEN SUBSTRING(REGEXP_REPLACE(code_naf, '[^0-9]', '', 'g'), 1, 2) BETWEEN '05' AND '09' THEN 'B'
    WHEN SUBSTRING(REGEXP_REPLACE(code_naf, '[^0-9]', '', 'g'), 1, 2) BETWEEN '10' AND '33' THEN 'C'
    WHEN SUBSTRING(REGEXP_REPLACE(code_naf, '[^0-9]', '', 'g'), 1, 2) = '35' THEN 'D'
    WHEN SUBSTRING(REGEXP_REPLACE(code_naf, '[^0-9]', '', 'g'), 1, 2) BETWEEN '36' AND '39' THEN 'E'
    WHEN SUBSTRING(REGEXP_REPLACE(code_naf, '[^0-9]', '', 'g'), 1, 2) BETWEEN '41' AND '43' THEN 'F'
    WHEN SUBSTRING(REGEXP_REPLACE(code_naf, '[^0-9]', '', 'g'), 1, 2) BETWEEN '45' AND '47' THEN 'G'
    WHEN SUBSTRING(REGEXP_REPLACE(code_naf, '[^0-9]', '', 'g'), 1, 2) BETWEEN '49' AND '53' THEN 'H'
    WHEN SUBSTRING(REGEXP_REPLACE(code_naf, '[^0-9]', '', 'g'), 1, 2) BETWEEN '55' AND '56' THEN 'I'
    WHEN SUBSTRING(REGEXP_REPLACE(code_naf, '[^0-9]', '', 'g'), 1, 2) BETWEEN '58' AND '63' THEN 'J'
    WHEN SUBSTRING(REGEXP_REPLACE(code_naf, '[^0-9]', '', 'g'), 1, 2) BETWEEN '64' AND '66' THEN 'K'
    WHEN SUBSTRING(REGEXP_REPLACE(code_naf, '[^0-9]', '', 'g'), 1, 2) = '68' THEN 'L'
    WHEN SUBSTRING(REGEXP_REPLACE(code_naf, '[^0-9]', '', 'g'), 1, 2) BETWEEN '69' AND '75' THEN 'M'
    WHEN SUBSTRING(REGEXP_REPLACE(code_naf, '[^0-9]', '', 'g'), 1, 2) BETWEEN '77' AND '82' THEN 'N'
    WHEN SUBSTRING(REGEXP_REPLACE(code_naf, '[^0-9]', '', 'g'), 1, 2) = '84' THEN 'O'
    WHEN SUBSTRING(REGEXP_REPLACE(code_naf, '[^0-9]', '', 'g'), 1, 2) = '85' THEN 'P'
    WHEN SUBSTRING(REGEXP_REPLACE(code_naf, '[^0-9]', '', 'g'), 1, 2) BETWEEN '86' AND '88' THEN 'Q'
    WHEN SUBSTRING(REGEXP_REPLACE(code_naf, '[^0-9]', '', 'g'), 1, 2) BETWEEN '90' AND '93' THEN 'R'
    WHEN SUBSTRING(REGEXP_REPLACE(code_naf, '[^0-9]', '', 'g'), 1, 2) BETWEEN '94' AND '96' THEN 'S'
    WHEN SUBSTRING(REGEXP_REPLACE(code_naf, '[^0-9]', '', 'g'), 1, 2) BETWEEN '97' AND '98' THEN 'T'
    WHEN SUBSTRING(REGEXP_REPLACE(code_naf, '[^0-9]', '', 'g'), 1, 2) = '99' THEN 'U'
    ELSE NULL
  END
WHERE code_naf IS NOT NULL;