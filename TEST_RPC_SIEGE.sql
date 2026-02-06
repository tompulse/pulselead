-- 🧪 Test de la RPC pour les sièges

SELECT get_nouveaux_sites_filter_counts_dynamic(
  NULL, NULL, NULL, NULL, NULL, NULL, NULL
) -> 'typesEtablissement';
