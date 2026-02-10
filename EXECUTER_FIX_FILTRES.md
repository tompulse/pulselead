# 🔧 CORRECTION DES FILTRES - MODE D'EMPLOI

## 🎯 Problème résolu

Vos filtres affichaient des nombres trop faibles car la fonction RPC utilisait des **colonnes qui n'existent pas** dans votre table `nouveaux_sites`.

## ✅ Corrections apportées

### Avant (❌ FAUX)
```sql
-- Utilisait des colonnes inexistantes
naf_section, naf_division, naf_groupe, naf_classe  -- N'EXISTENT PAS
categorie_juridique                                -- N'EXISTE PAS
est_siege (boolean)                                -- N'EXISTE PAS
archived (boolean)                                 -- N'EXISTE PAS
ville                                              -- N'EXISTE PAS
entreprise                                         -- N'EXISTE PAS
-- Excluait départements 97 et 98                  -- ERREUR
```

### Après (✅ CORRECT)
```sql
-- Extrait depuis les VRAIES colonnes
LEFT(code_naf, 2) as naf_section    -- Extrait depuis code_naf
LEFT(code_naf, 4) as naf_division   -- Extrait depuis code_naf
siege (text)                        -- Avec UPPER(siege) IN ('VRAI', 'TRUE'...)
archived (text)                     -- Avec archived != 'true'
commune                             -- Au lieu de ville
nom                                 -- Au lieu de entreprise
-- Inclut TOUS les départements     -- Y compris 97 (1,840 prospects)
```

## 📝 Étape 1 : Exécuter la migration

Dans l'éditeur SQL de Supabase, exécutez le fichier :

```
supabase/migrations/20260210000001_fix_rpc_real_columns.sql
```

Ou copiez-collez tout le contenu du fichier directement.

## ✅ Étape 2 : Vérifier que ça fonctionne

Exécutez cette requête de test :

```sql
SELECT get_nouveaux_sites_filter_counts_dynamic(
  NULL, -- naf_sections
  NULL, -- naf_divisions
  NULL, -- departments
  NULL, -- categories_juridiques
  NULL, -- types_etablissement
  NULL  -- search_query
);
```

**Vous devriez voir :**
- `nafSections` avec tous vos codes (56, 45, 47, 49, 85, 46, etc.)
- `departments` avec TOUS vos départements (75, 93, 13, 69, **97**, etc.)
- `typesEtablissement` avec siege/site
- Un total qui correspond à vos **57,160 prospects**

## 🎉 Résultat attendu

Une fois la migration exécutée, vos filtres dans l'interface vont afficher les **VRAIS nombres** :

- **Section NAF 56** : ~5,596+ prospects
- **Département 75** : ~7,186 prospects
- **Département 97** : ~1,840 prospects (qui était exclu avant !)
- Etc.

## ⚠️ Si vous avez des erreurs

Si la migration échoue, vérifiez :
1. Que vous êtes bien connecté à Supabase
2. Que vous avez les permissions d'exécution
3. Partagez-moi l'erreur exacte pour que je corrige

## 🚀 Prêt !

Une fois exécuté, rafraîchissez votre application et les filtres devraient afficher les bons nombres !
