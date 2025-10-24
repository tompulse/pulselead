-- Suppression des entreprises au format "NOM, Prénom" (auto-entrepreneurs sans nom d'entreprise)
-- Cette suppression concerne environ 24,515 entreprises

DELETE FROM entreprises
WHERE nom ~ '^[A-Z\-'']+,\s+[A-Z]'
  AND nom !~ '(SARL|SAS|SASU|EURL|SCI|SA|SELARL|SNC|GIE|SCOP|SCP|SEL|SELAFA|SELCA|SELAS|EARL|GAEC|SCEA|SCM|Association|Syndicat|Fondation|Commune|Mairie|Prefecture|Ministere|Direction|Service|Office|Agence|Centre|Institut|Hopital|Clinique|Cabinet|Societe|Entreprise|Etablissement|Corporation|Compagnie|Cooperative|Mutuelle|Chambre|Union|Federation|Confederation|Groupement|Collectif|Comite|Commission|Conseil|Delegation|Departement|Region|Arrondissement|Canton|Quartier)';