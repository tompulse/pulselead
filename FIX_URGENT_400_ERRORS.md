# 🔥 FIX URGENT - Erreur 400 sur toutes les requêtes

## Problème
Les IDs sont des **BIGINT** (integers) mais les colonnes attendent des **UUID**.
Cela vient de la migration de Lovable à Cursor.

## Solution IMMÉDIATE

### 1. Allez sur Supabase Dashboard SQL Editor
https://supabase.com/dashboard/project/ywavxjmbsywpjzchuuho/sql/new

### 2. Exécutez ce SQL (COPIEZ-COLLEZ TOUT):

```sql
-- FIX 1: Tournees
BEGIN;

ALTER TABLE public.tournees DROP CONSTRAINT IF EXISTS tournees_entreprises_ids_fkey;

ALTER TABLE public.tournees 
  ALTER COLUMN entreprises_ids TYPE BIGINT[] USING entreprises_ids::text::BIGINT[],
  ALTER COLUMN ordre_optimise TYPE BIGINT[] USING ordre_optimise::text::BIGINT[];

COMMIT;

-- FIX 2: Lead Statuts
BEGIN;

DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'lead_statuts' 
    AND column_name = 'entreprise_id' 
    AND data_type = 'uuid'
  ) THEN
    ALTER TABLE public.lead_statuts 
      ALTER COLUMN entreprise_id TYPE BIGINT USING entreprise_id::text::BIGINT;
  END IF;
END $$;

COMMIT;

-- FIX 3: Lead Interactions
BEGIN;

DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'lead_interactions' 
    AND column_name = 'entreprise_id' 
    AND data_type = 'uuid'
  ) THEN
    ALTER TABLE public.lead_interactions 
      ALTER COLUMN entreprise_id TYPE BIGINT USING entreprise_id::text::BIGINT;
  END IF;
END $$;

COMMIT;

-- Vérification
SELECT 
  table_name, 
  column_name, 
  data_type 
FROM information_schema.columns 
WHERE table_name IN ('tournees', 'lead_statuts', 'lead_interactions')
AND column_name IN ('entreprises_ids', 'ordre_optimise', 'entreprise_id')
ORDER BY table_name, column_name;
```

### 3. Cliquez sur "Run" ou appuyez sur Ctrl+Enter

### 4. Rechargez votre application

**TOUT DEVRAIT FONCTIONNER** ✅

---

## Alternative si vous préférez le terminal:

```bash
supabase login
cd /Users/raws/pulse-project/pulselead
supabase db push
```

---

## Après le fix:

- ✅ Tournées: fonctionneront
- ✅ Lead statuts: fonctionneront
- ✅ Lead interactions: fonctionneront

Temps estimé: **30 secondes** ⚡
