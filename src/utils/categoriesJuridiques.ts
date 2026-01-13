// Mapping des catégories juridiques selon la classification INSEE (Septembre 2022)
// Niveau I (1 chiffre), Niveau II (2 chiffres), Niveau III (4 chiffres)

// Niveau I - Catégories principales (premier chiffre)
export const CATEGORIES_JURIDIQUES_NIVEAU_I: Record<string, { label: string; type: string }> = {
  '0': {
    label: 'Organisme de placement collectif en valeurs mobilières sans personnalité morale',
    type: 'Placement collectif'
  },
  '1': {
    label: 'Entrepreneur individuel',
    type: 'Auto-entrepreneur, freelance'
  },
  '2': {
    label: 'Groupement de droit privé non doté de la personnalité morale',
    type: 'Indivision, société de fait'
  },
  '3': {
    label: 'Personne morale de droit étranger',
    type: 'Société étrangère'
  },
  '4': {
    label: 'Personne morale de droit public soumise au droit commercial',
    type: 'Établissement public industriel'
  },
  '5': {
    label: 'Société commerciale',
    type: 'SARL, SAS, SA, SNC'
  },
  '6': {
    label: 'Autre personne morale immatriculée au RCS',
    type: 'GIE, coopératives, société civile'
  },
  '7': {
    label: 'Personne morale et organisme soumis au droit administratif',
    type: 'Collectivités, établissements publics'
  },
  '8': {
    label: 'Organisme privé spécialisé',
    type: 'Sécurité sociale, mutuelles, syndicats'
  },
  '9': {
    label: 'Groupement de droit privé',
    type: 'Associations, fondations'
  }
};

// Niveau II - Sous-catégories (2 chiffres)
export const CATEGORIES_JURIDIQUES_NIVEAU_II: Record<string, { label: string; parent: string }> = {
  '00': { label: 'Organisme de placement collectif en valeurs mobilières sans personnalité morale', parent: '0' },
  '10': { label: 'Entrepreneur individuel', parent: '1' },
  '21': { label: 'Indivision', parent: '2' },
  '22': { label: 'Société créée de fait', parent: '2' },
  '23': { label: 'Société en participation', parent: '2' },
  '24': { label: 'Fiducie', parent: '2' },
  '27': { label: 'Paroisse hors zone concordataire', parent: '2' },
  '28': { label: 'Assujetti unique à la TVA', parent: '2' },
  '29': { label: 'Autre groupement de droit privé non doté de la personnalité morale', parent: '2' },
  '31': { label: 'Personne morale de droit étranger, immatriculée au RCS', parent: '3' },
  '32': { label: 'Personne morale de droit étranger, non immatriculée au RCS', parent: '3' },
  '41': { label: 'Etablissement public ou régie à caractère industriel ou commercial', parent: '4' },
  '51': { label: 'Société coopérative commerciale particulière', parent: '5' },
  '52': { label: 'Société en nom collectif', parent: '5' },
  '53': { label: 'Société en commandite', parent: '5' },
  '54': { label: 'Société à responsabilité limitée (SARL)', parent: '5' },
  '55': { label: 'Société anonyme à conseil d\'administration', parent: '5' },
  '56': { label: 'Société anonyme à directoire', parent: '5' },
  '57': { label: 'Société par actions simplifiée', parent: '5' },
  '58': { label: 'Société européenne', parent: '5' },
  '61': { label: 'Caisse d\'épargne et de prévoyance', parent: '6' },
  '62': { label: 'Groupement d\'intérêt économique', parent: '6' },
  '63': { label: 'Société coopérative agricole', parent: '6' },
  '64': { label: 'Société d\'assurance mutuelle', parent: '6' },
  '65': { label: 'Société civile', parent: '6' },
  '69': { label: 'Autre personne morale de droit privé inscrite au registre du commerce et des sociétés', parent: '6' },
  '71': { label: 'Administration de l\'état', parent: '7' },
  '72': { label: 'Collectivité territoriale', parent: '7' },
  '73': { label: 'Etablissement public administratif', parent: '7' },
  '74': { label: 'Autre personne morale de droit public administratif', parent: '7' },
  '81': { label: 'Organisme gérant un régime de protection sociale à adhésion obligatoire', parent: '8' },
  '82': { label: 'Organisme mutualiste', parent: '8' },
  '83': { label: 'Comité d\'entreprise', parent: '8' },
  '84': { label: 'Organisme professionnel', parent: '8' },
  '85': { label: 'Organisme de retraite à adhésion non obligatoire', parent: '8' },
  '91': { label: 'Syndicat de propriétaires', parent: '9' },
  '92': { label: 'Association loi 1901 ou assimilé', parent: '9' },
  '93': { label: 'Fondation', parent: '9' },
  '99': { label: 'Autre personne morale de droit privé', parent: '9' }
};

// Niveau III - Codes détaillés (4 chiffres) - Classification INSEE Septembre 2022
export const CATEGORIES_JURIDIQUES_NIVEAU_III: Record<string, { label: string; parent: string }> = {
  // 0 - OPCVM
  '0000': { label: 'Organisme de placement collectif en valeurs mobilières sans personnalité morale', parent: '00' },
  
  // 1 - Entrepreneur individuel
  '1000': { label: 'Entrepreneur individuel', parent: '10' },
  
  // 2 - Groupement droit privé non doté de personnalité morale
  '2110': { label: 'Indivision entre personnes physiques', parent: '21' },
  '2120': { label: 'Indivision avec personne morale', parent: '21' },
  '2210': { label: 'Société créée de fait entre personnes physiques', parent: '22' },
  '2220': { label: 'Société créée de fait avec personne morale', parent: '22' },
  '2310': { label: 'Société en participation entre personnes physiques', parent: '23' },
  '2320': { label: 'Société en participation avec personne morale', parent: '23' },
  '2385': { label: 'Société en participation de professions libérales', parent: '23' },
  '2400': { label: 'Fiducie', parent: '24' },
  '2700': { label: 'Paroisse hors zone concordataire', parent: '27' },
  '2800': { label: 'Assujetti unique à la TVA', parent: '28' },
  '2900': { label: 'Autre groupement de droit privé non doté de la personnalité morale', parent: '29' },
  
  // 3 - Personne morale de droit étranger
  '3110': { label: 'Représentation ou agence commerciale d\'état ou organisme public étranger immatriculé au RCS', parent: '31' },
  '3120': { label: 'Société commerciale étrangère immatriculée au RCS', parent: '31' },
  '3205': { label: 'Organisation internationale', parent: '32' },
  '3210': { label: 'État, collectivité ou établissement public étranger', parent: '32' },
  '3220': { label: 'Société étrangère non immatriculée au RCS', parent: '32' },
  '3290': { label: 'Autre personne morale de droit étranger', parent: '32' },
  
  // 4 - Personne morale droit public commercial
  '4110': { label: 'Établissement public national à caractère industriel ou commercial doté d\'un comptable public', parent: '41' },
  '4120': { label: 'Établissement public national à caractère industriel ou commercial non doté d\'un comptable public', parent: '41' },
  '4130': { label: 'Exploitant public', parent: '41' },
  '4140': { label: 'Établissement public local à caractère industriel ou commercial', parent: '41' },
  '4150': { label: 'Régie d\'une collectivité locale à caractère industriel ou commercial', parent: '41' },
  '4160': { label: 'Institution Banque de France', parent: '41' },
  
  // 51 - Société coopérative commerciale particulière
  '5191': { label: 'Société de caution mutuelle', parent: '51' },
  '5192': { label: 'Société coopérative de banque populaire', parent: '51' },
  '5193': { label: 'Caisse de crédit maritime mutuel', parent: '51' },
  '5194': { label: 'Caisse (fédérale) de crédit mutuel', parent: '51' },
  '5195': { label: 'Association coopérative inscrite (droit local Alsace Moselle)', parent: '51' },
  '5196': { label: 'Caisse d\'épargne et de prévoyance à forme coopérative', parent: '51' },
  
  // 52 - SNC
  '5202': { label: 'Société en nom collectif', parent: '52' },
  '5203': { label: 'Société en nom collectif coopérative', parent: '52' },
  
  // 53 - Société en commandite
  '5306': { label: 'Société en commandite simple', parent: '53' },
  '5307': { label: 'Société en commandite simple coopérative', parent: '53' },
  '5308': { label: 'Société en commandite par actions', parent: '53' },
  '5309': { label: 'Société en commandite par actions coopérative', parent: '53' },
  '5310': { label: 'Société en libre partenariat (SLP)', parent: '53' },
  '5370': { label: 'Société de Participations Financières de Profession Libérale Société en commandite par actions (SPFPL SCA)', parent: '53' },
  '5385': { label: 'Société d\'exercice libéral en commandite par actions', parent: '53' },
  
  // 54 - SARL
  '5410': { label: 'SARL nationale', parent: '54' },
  '5415': { label: 'SARL d\'économie mixte', parent: '54' },
  '5422': { label: 'SARL immobilière pour le commerce et l\'industrie (SICOMI)', parent: '54' },
  '5426': { label: 'SARL immobilière de gestion', parent: '54' },
  '5430': { label: 'SARL d\'aménagement foncier et d\'équipement rural (SAFER)', parent: '54' },
  '5431': { label: 'SARL mixte d\'intérêt agricole (SMIA)', parent: '54' },
  '5432': { label: 'SARL d\'intérêt collectif agricole (SICA)', parent: '54' },
  '5442': { label: 'SARL d\'attribution', parent: '54' },
  '5443': { label: 'SARL coopérative de construction', parent: '54' },
  '5451': { label: 'SARL coopérative de consommation', parent: '54' },
  '5453': { label: 'SARL coopérative artisanale', parent: '54' },
  '5454': { label: 'SARL coopérative d\'intérêt maritime', parent: '54' },
  '5455': { label: 'SARL coopérative de transport', parent: '54' },
  '5458': { label: 'SARL coopérative de production (SCOP)', parent: '54' },
  '5459': { label: 'SARL union de sociétés coopératives', parent: '54' },
  '5460': { label: 'Autre SARL coopérative', parent: '54' },
  '5470': { label: 'Société de Participations Financières de Profession Libérale Société à responsabilité limitée (SPFPL SARL)', parent: '54' },
  '5485': { label: 'Société d\'exercice libéral à responsabilité limitée', parent: '54' },
  '5499': { label: 'Société à responsabilité limitée (sans autre indication)', parent: '54' },
  
  // 55 - SA à conseil d'administration
  '5505': { label: 'SA à participation ouvrière à conseil d\'administration', parent: '55' },
  '5510': { label: 'SA nationale à conseil d\'administration', parent: '55' },
  '5515': { label: 'SA d\'économie mixte à conseil d\'administration', parent: '55' },
  '5520': { label: 'Fonds à forme sociétale à conseil d\'administration', parent: '55' },
  '5522': { label: 'SA immobilière pour le commerce et l\'industrie (SICOMI) à conseil d\'administration', parent: '55' },
  '5525': { label: 'SA immobilière d\'investissement à conseil d\'administration', parent: '55' },
  '5530': { label: 'SA d\'aménagement foncier et d\'équipement rural (SAFER) à conseil d\'administration', parent: '55' },
  '5531': { label: 'Société anonyme mixte d\'intérêt agricole (SMIA) à conseil d\'administration', parent: '55' },
  '5532': { label: 'SA d\'intérêt collectif agricole (SICA) à conseil d\'administration', parent: '55' },
  '5542': { label: 'SA d\'attribution à conseil d\'administration', parent: '55' },
  '5543': { label: 'SA coopérative de construction à conseil d\'administration', parent: '55' },
  '5546': { label: 'SA de HLM à conseil d\'administration', parent: '55' },
  '5547': { label: 'SA coopérative de production de HLM à conseil d\'administration', parent: '55' },
  '5548': { label: 'SA de crédit immobilier à conseil d\'administration', parent: '55' },
  '5551': { label: 'SA coopérative de consommation à conseil d\'administration', parent: '55' },
  '5552': { label: 'SA coopérative de commerçants-détaillants à conseil d\'administration', parent: '55' },
  '5553': { label: 'SA coopérative artisanale à conseil d\'administration', parent: '55' },
  '5554': { label: 'SA coopérative (d\'intérêt) maritime à conseil d\'administration', parent: '55' },
  '5555': { label: 'SA coopérative de transport à conseil d\'administration', parent: '55' },
  '5558': { label: 'SA coopérative de production (SCOP) à conseil d\'administration', parent: '55' },
  '5559': { label: 'SA union de sociétés coopératives à conseil d\'administration', parent: '55' },
  '5560': { label: 'Autre SA coopérative à conseil d\'administration', parent: '55' },
  '5570': { label: 'Société de Participations Financières de Profession Libérale Société anonyme à conseil d\'administration (SPFPL SA à conseil d\'administration)', parent: '55' },
  '5585': { label: 'Société d\'exercice libéral à forme anonyme à conseil d\'administration', parent: '55' },
  '5599': { label: 'SA à conseil d\'administration (s.a.i.)', parent: '55' },
  
  // 56 - SA à directoire
  '5605': { label: 'SA à participation ouvrière à directoire', parent: '56' },
  '5610': { label: 'SA nationale à directoire', parent: '56' },
  '5615': { label: 'SA d\'économie mixte à directoire', parent: '56' },
  '5620': { label: 'Fonds à forme sociétale à directoire', parent: '56' },
  '5622': { label: 'SA immobilière pour le commerce et l\'industrie (SICOMI) à directoire', parent: '56' },
  '5625': { label: 'SA immobilière d\'investissement à directoire', parent: '56' },
  '5630': { label: 'Safer anonyme à directoire', parent: '56' },
  '5631': { label: 'SA mixte d\'intérêt agricole (SMIA)', parent: '56' },
  '5632': { label: 'SA d\'intérêt collectif agricole (SICA)', parent: '56' },
  '5642': { label: 'SA d\'attribution à directoire', parent: '56' },
  '5643': { label: 'SA coopérative de construction à directoire', parent: '56' },
  '5646': { label: 'SA de HLM à directoire', parent: '56' },
  '5647': { label: 'Société coopérative de production de HLM anonyme à directoire', parent: '56' },
  '5648': { label: 'SA de crédit immobilier à directoire', parent: '56' },
  '5651': { label: 'SA coopérative de consommation à directoire', parent: '56' },
  '5652': { label: 'SA coopérative de commerçants-détaillants à directoire', parent: '56' },
  '5653': { label: 'SA coopérative artisanale à directoire', parent: '56' },
  '5654': { label: 'SA coopérative d\'intérêt maritime à directoire', parent: '56' },
  '5655': { label: 'SA coopérative de transport à directoire', parent: '56' },
  '5658': { label: 'SA coopérative de production (SCOP) à directoire', parent: '56' },
  '5659': { label: 'SA union de sociétés coopératives à directoire', parent: '56' },
  '5660': { label: 'Autre SA coopérative à directoire', parent: '56' },
  '5670': { label: 'Société de Participations Financières de Profession Libérale Société anonyme à Directoire (SPFPL SA à directoire)', parent: '56' },
  '5685': { label: 'Société d\'exercice libéral à forme anonyme à directoire', parent: '56' },
  '5699': { label: 'SA à directoire (s.a.i.)', parent: '56' },
  
  // 57 - SAS
  '5710': { label: 'SAS, société par actions simplifiée', parent: '57' },
  '5770': { label: 'Société de Participations Financières de Profession Libérale Société par actions simplifiée (SPFPL SAS)', parent: '57' },
  '5785': { label: 'Société d\'exercice libéral par action simplifiée', parent: '57' },
  
  // 58 - Société européenne
  '5800': { label: 'Société européenne', parent: '58' },
  
  // 61 - Caisse d'épargne
  '6100': { label: 'Caisse d\'Épargne et de Prévoyance', parent: '61' },
  
  // 62 - GIE
  '6210': { label: 'Groupement européen d\'intérêt économique (GEIE)', parent: '62' },
  '6220': { label: 'Groupement d\'intérêt économique (GIE)', parent: '62' },
  
  // 63 - Société coopérative agricole
  '6316': { label: 'Coopérative d\'utilisation de matériel agricole en commun (CUMA)', parent: '63' },
  '6317': { label: 'Société coopérative agricole', parent: '63' },
  '6318': { label: 'Union de sociétés coopératives agricoles', parent: '63' },
  
  // 64 - Société d'assurance mutuelle
  '6411': { label: 'Société d\'assurance à forme mutuelle', parent: '64' },
  
  // 65 - Société civile
  '6511': { label: 'Sociétés Interprofessionnelles de Soins Ambulatoires', parent: '65' },
  '6521': { label: 'Société civile de placement collectif immobilier (SCPI)', parent: '65' },
  '6532': { label: 'Société civile d\'intérêt collectif agricole (SICA)', parent: '65' },
  '6533': { label: 'Groupement agricole d\'exploitation en commun (GAEC)', parent: '65' },
  '6534': { label: 'Groupement foncier agricole', parent: '65' },
  '6535': { label: 'Groupement agricole foncier', parent: '65' },
  '6536': { label: 'Groupement forestier', parent: '65' },
  '6537': { label: 'Groupement pastoral', parent: '65' },
  '6538': { label: 'Groupement foncier et rural', parent: '65' },
  '6539': { label: 'Société civile foncière', parent: '65' },
  '6540': { label: 'Société civile immobilière', parent: '65' },
  '6541': { label: 'Société civile immobilière de construction-vente', parent: '65' },
  '6542': { label: 'Société civile d\'attribution', parent: '65' },
  '6543': { label: 'Société civile coopérative de construction', parent: '65' },
  '6544': { label: 'Société civile immobilière d\' accession progressive à la propriété', parent: '65' },
  '6551': { label: 'Société civile coopérative de consommation', parent: '65' },
  '6554': { label: 'Société civile coopérative d\'intérêt maritime', parent: '65' },
  '6558': { label: 'Société civile coopérative entre médecins', parent: '65' },
  '6560': { label: 'Autre société civile coopérative', parent: '65' },
  '6561': { label: 'SCP d\'avocats', parent: '65' },
  '6562': { label: 'SCP d\'avocats aux conseils', parent: '65' },
  '6563': { label: 'SCP d\'avoués d\'appel', parent: '65' },
  '6564': { label: 'SCP d\'huissiers', parent: '65' },
  '6565': { label: 'SCP de notaires', parent: '65' },
  '6566': { label: 'SCP de commissaires-priseurs', parent: '65' },
  '6567': { label: 'SCP de greffiers de tribunal de commerce', parent: '65' },
  '6568': { label: 'SCP de conseils juridiques', parent: '65' },
  '6569': { label: 'SCP de commissaires aux comptes', parent: '65' },
  '6571': { label: 'SCP de médecins', parent: '65' },
  '6572': { label: 'SCP de dentistes', parent: '65' },
  '6573': { label: 'SCP d\'infirmiers', parent: '65' },
  '6574': { label: 'SCP de masseurs-kinésithérapeutes', parent: '65' },
  '6575': { label: 'SCP de directeurs de laboratoire d\'analyse médicale', parent: '65' },
  '6576': { label: 'SCP de vétérinaires', parent: '65' },
  '6577': { label: 'SCP de géomètres experts', parent: '65' },
  '6578': { label: 'SCP d\'architectes', parent: '65' },
  '6585': { label: 'Autre société civile professionnelle', parent: '65' },
  '6589': { label: 'Société civile de moyens', parent: '65' },
  '6595': { label: 'Caisse locale de crédit mutuel', parent: '65' },
  '6596': { label: 'Caisse de crédit agricole mutuel', parent: '65' },
  '6597': { label: 'Société civile d\'exploitation agricole', parent: '65' },
  '6598': { label: 'Exploitation agricole à responsabilité limitée', parent: '65' },
  '6599': { label: 'Autre société civile', parent: '65' },
  
  // 69 - Autre personne morale privée RCS
  '6901': { label: 'Autre personne de droit privé inscrite au registre du commerce et des sociétés', parent: '69' },
  
  // 71 - Administration de l'État
  '7111': { label: 'Autorité constitutionnelle', parent: '71' },
  '7112': { label: 'Autorité administrative ou publique indépendante', parent: '71' },
  '7113': { label: 'Ministère', parent: '71' },
  '7120': { label: 'Service central d\'un ministère', parent: '71' },
  '7150': { label: 'Service du ministère de la Défense', parent: '71' },
  '7160': { label: 'Service déconcentré à compétence nationale d\'un ministère (hors Défense)', parent: '71' },
  '7171': { label: 'Service déconcentré de l\'État à compétence (inter) régionale', parent: '71' },
  '7172': { label: 'Service déconcentré de l\'État à compétence (inter) départementale', parent: '71' },
  '7179': { label: '(Autre) Service déconcentré de l\'État à compétence territoriale', parent: '71' },
  '7190': { label: 'Ecole nationale non dotée de la personnalité morale', parent: '71' },
  
  // 72 - Collectivité territoriale
  '7210': { label: 'Commune et commune nouvelle', parent: '72' },
  '7220': { label: 'Département', parent: '72' },
  '7225': { label: 'Collectivité et territoire d\'Outre Mer', parent: '72' },
  '7229': { label: '(Autre) Collectivité territoriale', parent: '72' },
  '7230': { label: 'Région', parent: '72' },
  
  // 73 - Établissement public administratif
  '7312': { label: 'Commune associée et commune déléguée', parent: '73' },
  '7313': { label: 'Section de commune', parent: '73' },
  '7314': { label: 'Ensemble urbain', parent: '73' },
  '7321': { label: 'Association syndicale autorisée', parent: '73' },
  '7322': { label: 'Association foncière urbaine', parent: '73' },
  '7323': { label: 'Association foncière de remembrement', parent: '73' },
  '7331': { label: 'Établissement public local d\'enseignement', parent: '73' },
  '7340': { label: 'Pôle métropolitain', parent: '73' },
  '7341': { label: 'Secteur de commune', parent: '73' },
  '7342': { label: 'District urbain', parent: '73' },
  '7343': { label: 'Communauté urbaine', parent: '73' },
  '7344': { label: 'Métropole', parent: '73' },
  '7345': { label: 'Syndicat intercommunal à vocation multiple (SIVOM)', parent: '73' },
  '7346': { label: 'Communauté de communes', parent: '73' },
  '7347': { label: 'Communauté de villes', parent: '73' },
  '7348': { label: 'Communauté d\'agglomération', parent: '73' },
  '7349': { label: 'Autre établissement public local de coopération non spécialisé ou entente', parent: '73' },
  '7351': { label: 'Institution interdépartementale ou entente', parent: '73' },
  '7352': { label: 'Institution interrégionale ou entente', parent: '73' },
  '7353': { label: 'Syndicat intercommunal à vocation unique (SIVU)', parent: '73' },
  '7354': { label: 'Syndicat mixte fermé', parent: '73' },
  '7355': { label: 'Syndicat mixte ouvert', parent: '73' },
  '7356': { label: 'Commission syndicale pour la gestion des biens indivis des communes', parent: '73' },
  '7357': { label: 'Pôle d\'équilibre territorial et rural (PETR)', parent: '73' },
  '7361': { label: 'Centre communal d\'action sociale', parent: '73' },
  '7362': { label: 'Caisse des écoles', parent: '73' },
  '7363': { label: 'Caisse de crédit municipal', parent: '73' },
  '7364': { label: 'Établissement d\'hospitalisation', parent: '73' },
  '7365': { label: 'Syndicat inter hospitalier', parent: '73' },
  '7366': { label: 'Établissement public local social et médico-social', parent: '73' },
  '7367': { label: 'Centre Intercommunal d\'action sociale (CIAS)', parent: '73' },
  '7371': { label: 'Office public d\'habitation à loyer modéré (OPHLM)', parent: '73' },
  '7372': { label: 'Service départemental d\'incendie et de secours (SDIS)', parent: '73' },
  '7373': { label: 'Établissement public local culturel', parent: '73' },
  '7378': { label: 'Régie d\'une collectivité locale à caractère administratif', parent: '73' },
  '7379': { label: '(Autre) Établissement public administratif local', parent: '73' },
  '7381': { label: 'Organisme consulaire', parent: '73' },
  '7382': { label: 'Établissement public national ayant fonction d\'administration centrale', parent: '73' },
  '7383': { label: 'Établissement public national à caractère scientifique culturel et professionnel', parent: '73' },
  '7384': { label: 'Autre établissement public national d\'enseignement', parent: '73' },
  '7385': { label: 'Autre établissement public national administratif à compétence territoriale limitée', parent: '73' },
  '7389': { label: 'Établissement public national à caractère administratif', parent: '73' },
  
  // 74 - Autre personne morale droit public administratif
  '7410': { label: 'Groupement d\'intérêt public (GIP)', parent: '74' },
  '7430': { label: 'Établissement public des cultes d\'Alsace-Lorraine', parent: '74' },
  '7450': { label: 'Etablissement public administratif, cercle et foyer dans les armées', parent: '74' },
  '7470': { label: 'Groupement de coopération sanitaire à gestion publique', parent: '74' },
  '7490': { label: 'Autre personne morale de droit administratif', parent: '74' },
  
  // 81 - Régime protection sociale obligatoire
  '8110': { label: 'Régime général de la Sécurité Sociale', parent: '81' },
  '8120': { label: 'Régime spécial de Sécurité Sociale', parent: '81' },
  '8130': { label: 'Institution de retraite complémentaire', parent: '81' },
  '8140': { label: 'Mutualité sociale agricole', parent: '81' },
  '8150': { label: 'Régime maladie des non-salariés non agricoles', parent: '81' },
  '8160': { label: 'Régime vieillesse ne dépendant pas du régime général de la Sécurité Sociale', parent: '81' },
  '8170': { label: 'Régime d\'assurance chômage', parent: '81' },
  '8190': { label: 'Autre régime de prévoyance sociale', parent: '81' },
  
  // 82 - Organisme mutualiste
  '8210': { label: 'Mutuelle', parent: '82' },
  '8250': { label: 'Assurance mutuelle agricole', parent: '82' },
  '8290': { label: 'Autre organisme mutualiste', parent: '82' },
  
  // 83 - Comité d'entreprise
  '8310': { label: 'Comité social économique d\'entreprise', parent: '83' },
  '8311': { label: 'Comité social économique d\'établissement', parent: '83' },
  
  // 84 - Organisme professionnel
  '8410': { label: 'Syndicat de salariés', parent: '84' },
  '8420': { label: 'Syndicat patronal', parent: '84' },
  '8450': { label: 'Ordre professionnel ou assimilé', parent: '84' },
  '8470': { label: 'Centre technique industriel ou comité professionnel du développement économique', parent: '84' },
  '8490': { label: 'Autre organisme professionnel', parent: '84' },
  
  // 85 - Organisme de retraite non obligatoire
  '8510': { label: 'Institution de prévoyance', parent: '85' },
  '8520': { label: 'Institution de retraite supplémentaire', parent: '85' },
  
  // 91 - Syndicat de propriétaires
  '9110': { label: 'Syndicat de copropriété', parent: '91' },
  '9150': { label: 'Association syndicale libre', parent: '91' },
  
  // 92 - Association loi 1901
  '9210': { label: 'Association non déclarée', parent: '92' },
  '9220': { label: 'Association déclarée', parent: '92' },
  '9221': { label: 'Association déclarée d\'insertion par l\'économique', parent: '92' },
  '9222': { label: 'Association intermédiaire', parent: '92' },
  '9223': { label: 'Groupement d\'employeurs', parent: '92' },
  '9224': { label: 'Association d\'avocats à responsabilité professionnelle individuelle', parent: '92' },
  '9230': { label: 'Association déclarée, reconnue d\'utilité publique', parent: '92' },
  '9240': { label: 'Congrégation', parent: '92' },
  '9260': { label: 'Association de droit local (Bas-Rhin, Haut-Rhin et Moselle)', parent: '92' },
  
  // 93 - Fondation
  '9300': { label: 'Fondation', parent: '93' },
  
  // 99 - Autre personne morale droit privé
  '9900': { label: 'Autre personne morale de droit privé', parent: '99' },
  '9970': { label: 'Groupement de coopération sanitaire à gestion privée', parent: '99' }
};

// Mapping des anciens codes aux nouveaux pour compatibilité
export const CATEGORIES_JURIDIQUES = CATEGORIES_JURIDIQUES_NIVEAU_I;

// Obtenir la catégorie principale à partir du code complet (ex: "5499" → "5")
export function getCategorieJuridiqueGroupe(codeComplet: string | null): string | null {
  if (!codeComplet || codeComplet.length === 0) return null;
  const premier = codeComplet.charAt(0);
  if (CATEGORIES_JURIDIQUES_NIVEAU_I[premier]) return premier;
  return null;
}

// Obtenir le label niveau I
export function getCategorieJuridiqueLabel(groupe: string): string {
  return CATEGORIES_JURIDIQUES_NIVEAU_I[groupe]?.label || 'Autre';
}

// Obtenir le type court niveau I
export function getCategorieJuridiqueType(groupe: string): string {
  return CATEGORIES_JURIDIQUES_NIVEAU_I[groupe]?.type || 'Non classifié';
}

// Obtenir le label niveau II (2 chiffres)
export function getCategorieJuridiqueNiveauIILabel(code: string): string {
  return CATEGORIES_JURIDIQUES_NIVEAU_II[code]?.label || 'Autre';
}

// Obtenir le label niveau III (4 chiffres)
export function getCategorieJuridiqueNiveauIIILabel(code: string): string {
  return CATEGORIES_JURIDIQUES_NIVEAU_III[code]?.label || 
         getCategorieJuridiqueNiveauIILabel(code.substring(0, 2));
}

// Fonction pour obtenir le label approprié selon la longueur du code
export function getCategorieJuridiqueFullLabel(code: string | null): string {
  if (!code) return 'Non spécifié';
  
  const codeTrimmed = code.trim();
  
  if (codeTrimmed.length === 4) {
    return CATEGORIES_JURIDIQUES_NIVEAU_III[codeTrimmed]?.label || 
           getCategorieJuridiqueNiveauIILabel(codeTrimmed.substring(0, 2));
  }
  if (codeTrimmed.length === 2) {
    return CATEGORIES_JURIDIQUES_NIVEAU_II[codeTrimmed]?.label || 'Autre';
  }
  if (codeTrimmed.length === 1) {
    return CATEGORIES_JURIDIQUES_NIVEAU_I[codeTrimmed]?.label || 'Autre';
  }
  
  return 'Non classifié';
}

// Obtenir les sous-catégories niveau II pour un groupe niveau I
export function getSubCategoriesNiveauII(groupeNiveauI: string): Record<string, { label: string; parent: string }> {
  const result: Record<string, { label: string; parent: string }> = {};
  for (const [code, data] of Object.entries(CATEGORIES_JURIDIQUES_NIVEAU_II)) {
    if (data.parent === groupeNiveauI) {
      result[code] = data;
    }
  }
  return result;
}

// Obtenir les sous-catégories niveau III pour un groupe niveau II
export function getSubCategoriesNiveauIII(groupeNiveauII: string): Record<string, { label: string; parent: string }> {
  const result: Record<string, { label: string; parent: string }> = {};
  for (const [code, data] of Object.entries(CATEGORIES_JURIDIQUES_NIVEAU_III)) {
    if (data.parent === groupeNiveauII) {
      result[code] = data;
    }
  }
  return result;
}
