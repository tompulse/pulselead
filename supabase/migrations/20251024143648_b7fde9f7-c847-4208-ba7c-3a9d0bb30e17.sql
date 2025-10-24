-- ÉTAPE 1 : Suppression des entreprises sans activité renseignée (4,676 entreprises)
DELETE FROM entreprises
WHERE activite IS NULL OR activite = 'Non renseigné' OR activite = '';

-- ÉTAPE 2 : Suppression des entreprises avec codes postaux invalides (134 entreprises)
DELETE FROM entreprises
WHERE code_postal IS NOT NULL 
  AND (LENGTH(code_postal) != 5 OR code_postal !~ '^[0-9]{5}$');

-- ÉTAPE 3 : Harmonisation des formes juridiques vers les formes courtes
UPDATE entreprises SET forme_juridique = 'SAS' 
WHERE forme_juridique IN (
  'Société par actions simplifiée',
  'Société par Actions Simplifiée',
  'Société par actions simplifiée (à associé unique)',
  'Société par actions simplifiée à capital variable',
  'Société par actions simplifiée à capital variable (à associé unique)'
);

UPDATE entreprises SET forme_juridique = 'SARL'
WHERE forme_juridique IN (
  'Société à responsabilité limitée',
  'Société à Responsabilité Limitée',
  'Société à responsabilité limitée (à associé unique)',
  'Société à responsabilité limitée à capital variable',
  'Société à responsabilité limitée d''un Etat membre de la CE ou partie à l''accord sur l''Espace économique européen',
  'Société à responsabilité limitée d''un Etat non membre de la CE ou non partie à l''accord sur l''Espace économique européen'
);

UPDATE entreprises SET forme_juridique = 'SCI'
WHERE forme_juridique IN (
  'Société Civile Immobilière',
  'Société civile immobilière',
  'Société civile immobilière de construction vente',
  'Société civile immobilière à capital variable',
  'Société Civile Immobilière à Capital Variable'
);

UPDATE entreprises SET forme_juridique = 'SC'
WHERE forme_juridique IN (
  'Société civile',
  'Société Civile',
  'Société civile de construction vente',
  'Société civile de construction-vente',
  'Société civile de moyens',
  'Société Civile de Moyens',
  'Société civile d''exploitation agricole',
  'Société Civile d''Exploitation Agricole',
  'Société civile d''attribution',
  'Société civile de portefeuille',
  'Société civile à capital variable'
);

UPDATE entreprises SET forme_juridique = 'SNC'
WHERE forme_juridique IN (
  'Société en Nom Collectif',
  'Société en nom collectif'
);

UPDATE entreprises SET forme_juridique = 'EARL'
WHERE forme_juridique IN (
  'Exploitation agricole à responsabilité limitée',
  'Exploitation Agricole à Responsabilité Limitée',
  'Exploitation agricole à responsabilité limitée (à associé unique)'
);

UPDATE entreprises SET forme_juridique = 'SELARL'
WHERE forme_juridique IN (
  'Société d''exercice libéral à responsabilité limitée',
  'Société d''Exercice Libéral à Responsabilité Limitée',
  'Société d''exercice libéral à responsabilité limitée (à associé unique)'
);

UPDATE entreprises SET forme_juridique = 'SELAS'
WHERE forme_juridique IN (
  'Société d''exercice libéral par actions simplifiée',
  'Société d''Exercice Libéral par Actions Simplifiée'
);

UPDATE entreprises SET forme_juridique = 'GFA'
WHERE forme_juridique IN (
  'Groupement foncier agricole',
  'Groupement Foncier Agricole'
);

UPDATE entreprises SET forme_juridique = 'GF'
WHERE forme_juridique IN (
  'Groupement forestier',
  'Groupement Forestier'
);

UPDATE entreprises SET forme_juridique = 'GIE'
WHERE forme_juridique = 'Groupement d''intérêt économique';

UPDATE entreprises SET forme_juridique = 'SA'
WHERE forme_juridique IN (
  'Société anonyme',
  'Société anonyme à conseil d''administration'
);

UPDATE entreprises SET forme_juridique = 'SCA'
WHERE forme_juridique = 'Société en commandite par actions';

UPDATE entreprises SET forme_juridique = 'SCS'
WHERE forme_juridique = 'Société en commandite simple';