# 🔧 Correction du type UUID pour les tournées

## ❌ Problème

Erreur lors de l'optimisation des tournées :
```
invalid input syntax for type bigint: "715b0f33-84a0-4ca7-8cc6-eedebd4f8abf"
```

**Cause :** Les colonnes `entreprises_ids` et `ordre_optimise` de la table `tournees` ont été converties en `BIGINT[]` par erreur, alors que les IDs de la table `nouveaux_sites` sont des `UUID`.

## ✅ Solution

Exécuter la migration qui reconvertit les colonnes en `UUID[]`.

### Étape 1 : Aller dans Supabase SQL Editor

1. Ouvrir votre projet Supabase
2. Aller dans **SQL Editor** (dans le menu gauche)
3. Cliquer sur **New Query**

### Étape 2 : Copier et exécuter le script

Copier le contenu du fichier `supabase/migrations/20260210000001_fix_tournees_uuid_type.sql` et l'exécuter dans l'éditeur SQL.

**OU** directement copier ce script :

```sql
-- Corriger le type des colonnes entreprises_ids et ordre_optimise dans tournees
-- Les IDs de nouveaux_sites sont des UUID, pas des BIGINT

BEGIN;

-- Vérifier le type actuel
DO $$ 
DECLARE
    current_type text;
BEGIN
    SELECT data_type INTO current_type
    FROM information_schema.columns 
    WHERE table_name = 'tournees' 
    AND column_name = 'entreprises_ids';
    
    RAISE NOTICE 'Type actuel de entreprises_ids: %', current_type;
END $$;

-- Supprimer les tournées avec des IDs invalides (si elles existent)
DELETE FROM public.tournees 
WHERE entreprises_ids IS NOT NULL 
AND EXISTS (
    SELECT 1 FROM unnest(entreprises_ids::text[]) AS id
    WHERE id !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
);

-- Convertir les colonnes en UUID[]
ALTER TABLE public.tournees 
    ALTER COLUMN entreprises_ids TYPE UUID[] USING entreprises_ids::text[]::UUID[];

ALTER TABLE public.tournees 
    ALTER COLUMN ordre_optimise TYPE UUID[] USING ordre_optimise::text[]::UUID[];

COMMIT;

-- Vérifier
SELECT column_name, data_type
FROM information_schema.columns 
WHERE table_name = 'tournees' 
AND column_name IN ('entreprises_ids', 'ordre_optimise');
```

### Étape 3 : Vérifier le résultat

Après l'exécution, vous devriez voir dans les résultats :

```
column_name       | data_type
------------------|-----------
entreprises_ids   | ARRAY
ordre_optimise    | ARRAY
```

Les deux colonnes doivent être de type `ARRAY` (contenant des UUID).

### Étape 4 : Tester

1. Retourner sur l'application
2. Sélectionner des prospects
3. Essayer de créer/optimiser une tournée
4. ✅ Cela devrait fonctionner maintenant !

## 📝 Note importante

⚠️ Cette migration supprime les tournées existantes qui contiennent des IDs invalides (non-UUID). Si vous avez des tournées importantes, faites une sauvegarde avant d'exécuter.

## 🔍 Vérification supplémentaire

Si le problème persiste, vérifier que la table `nouveaux_sites` a bien des IDs de type UUID :

```sql
SELECT column_name, data_type, udt_name
FROM information_schema.columns 
WHERE table_name = 'nouveaux_sites' 
AND column_name = 'id';
```

Résultat attendu : `data_type = uuid`

## ✅ Résultat

Après cette correction, vous pourrez créer et optimiser des tournées sans erreur ! 🚀
