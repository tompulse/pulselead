-- Normalise les codes postaux sur 5 chiffres (corrige les départements 01-09)
-- 1) Backfill des lignes existantes
UPDATE public.nouveaux_sites
SET code_postal = lpad(code_postal, 5, '0')
WHERE code_postal IS NOT NULL
  AND code_postal ~ '^[0-9]{4}$';

-- 2) Trigger pour garantir la normalisation sur les futurs imports
CREATE OR REPLACE FUNCTION public.normalize_code_postal_5()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.code_postal IS NOT NULL THEN
    NEW.code_postal := btrim(NEW.code_postal);

    -- Si 4 chiffres (ex: 1000), on pad en 5 (01000)
    IF NEW.code_postal ~ '^[0-9]{4}$' THEN
      NEW.code_postal := lpad(NEW.code_postal, 5, '0');
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_normalize_code_postal_5 ON public.nouveaux_sites;
CREATE TRIGGER trg_normalize_code_postal_5
BEFORE INSERT OR UPDATE OF code_postal
ON public.nouveaux_sites
FOR EACH ROW
EXECUTE FUNCTION public.normalize_code_postal_5();