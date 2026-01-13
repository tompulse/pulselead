// Mapping des catégories juridiques selon la classification INSEE (Septembre 2022)
// Niveau I (1 chiffre), Niveau II (2 chiffres), Niveau III (4 chiffres)

// Niveau I - Catégories principales (premier chiffre)
export const CATEGORIES_JURIDIQUES_NIVEAU_I: Record<string, { label: string; type: string }> = {
  '0': {
    label: 'OPCVM sans personnalité morale',
    type: 'Placement collectif'
  },
  '1': {
    label: 'Entrepreneur individuel',
    type: 'Auto-entrepreneur, freelance'
  },
  '2': {
    label: 'Groupement droit privé non doté de personnalité morale',
    type: 'Indivision, société de fait'
  },
  '3': {
    label: 'Personne morale de droit étranger',
    type: 'Société étrangère'
  },
  '4': {
    label: 'Personne morale droit public commercial',
    type: 'Établissement public industriel'
  },
  '5': {
    label: 'Société commerciale',
    type: 'SARL, SAS, SA, SNC'
  },
  '6': {
    label: 'Autre personne morale RCS',
    type: 'GIE, coopératives, société civile'
  },
  '7': {
    label: 'Personne morale droit administratif',
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
  '00': { label: 'OPCVM sans personnalité morale', parent: '0' },
  '10': { label: 'Entrepreneur individuel', parent: '1' },
  '21': { label: 'Indivision', parent: '2' },
  '22': { label: 'Société créée de fait', parent: '2' },
  '23': { label: 'Société en participation', parent: '2' },
  '24': { label: 'Fiducie', parent: '2' },
  '27': { label: 'Paroisse hors zone concordataire', parent: '2' },
  '28': { label: 'Assujetti unique à la TVA', parent: '2' },
  '29': { label: 'Autre groupement droit privé non personnalité morale', parent: '2' },
  '31': { label: 'Personne morale étrangère immatriculée RCS', parent: '3' },
  '32': { label: 'Personne morale étrangère non immatriculée RCS', parent: '3' },
  '41': { label: 'Établissement public industriel ou commercial', parent: '4' },
  '51': { label: 'Société coopérative commerciale particulière', parent: '5' },
  '52': { label: 'Société en nom collectif (SNC)', parent: '5' },
  '53': { label: 'Société en commandite', parent: '5' },
  '54': { label: 'SARL', parent: '5' },
  '55': { label: 'SA à conseil d\'administration', parent: '5' },
  '56': { label: 'SA à directoire', parent: '5' },
  '57': { label: 'SAS', parent: '5' },
  '58': { label: 'Société européenne', parent: '5' },
  '61': { label: 'Caisse d\'épargne et de prévoyance', parent: '6' },
  '62': { label: 'GIE', parent: '6' },
  '63': { label: 'Société coopérative agricole', parent: '6' },
  '64': { label: 'Société d\'assurance mutuelle', parent: '6' },
  '65': { label: 'Société civile', parent: '6' },
  '69': { label: 'Autre personne morale privée RCS', parent: '6' },
  '71': { label: 'Administration de l\'État', parent: '7' },
  '72': { label: 'Collectivité territoriale', parent: '7' },
  '73': { label: 'Établissement public administratif', parent: '7' },
  '74': { label: 'Autre personne morale droit public administratif', parent: '7' },
  '81': { label: 'Organisme régime protection sociale obligatoire', parent: '8' },
  '82': { label: 'Organisme mutualiste', parent: '8' },
  '83': { label: 'Comité d\'entreprise', parent: '8' },
  '84': { label: 'Organisme professionnel', parent: '8' },
  '85': { label: 'Organisme retraite non obligatoire', parent: '8' },
  '91': { label: 'Syndicat de propriétaires', parent: '9' },
  '92': { label: 'Association loi 1901', parent: '9' },
  '93': { label: 'Fondation', parent: '9' },
  '99': { label: 'Autre personne morale droit privé', parent: '9' }
};

// Niveau III - Codes détaillés (4 chiffres)
export const CATEGORIES_JURIDIQUES_NIVEAU_III: Record<string, { label: string; parent: string }> = {
  '0000': { label: 'OPCVM sans personnalité morale', parent: '00' },
  '1000': { label: 'Entrepreneur individuel', parent: '10' },
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
  '2900': { label: 'Autre groupement droit privé non personnalité morale', parent: '29' },
  '3110': { label: 'Représentation/agence commerciale d\'État étranger RCS', parent: '31' },
  '3120': { label: 'Société commerciale étrangère RCS', parent: '31' },
  '3205': { label: 'Organisation internationale', parent: '32' },
  '3210': { label: 'État, collectivité ou établissement public étranger', parent: '32' },
  '3220': { label: 'Société étrangère non RCS', parent: '32' },
  '3290': { label: 'Autre personne morale droit étranger', parent: '32' },
  '4110': { label: 'EPIC national avec comptable public', parent: '41' },
  '4120': { label: 'EPIC national sans comptable public', parent: '41' },
  '4130': { label: 'Exploitant public', parent: '41' },
  '4140': { label: 'EPIC local', parent: '41' },
  '4150': { label: 'Régie locale industrielle/commerciale', parent: '41' },
  '4160': { label: 'Institution Banque de France', parent: '41' },
  '5191': { label: 'Société de caution mutuelle', parent: '51' },
  '5192': { label: 'Société coopérative de banque populaire', parent: '51' },
  '5193': { label: 'Caisse de crédit maritime mutuel', parent: '51' },
  '5194': { label: 'Caisse (fédérale) de crédit mutuel', parent: '51' },
  '5195': { label: 'Association coopérative inscrite (Alsace Moselle)', parent: '51' },
  '5196': { label: 'Caisse d\'épargne forme coopérative', parent: '51' },
  '5202': { label: 'SNC', parent: '52' },
  '5203': { label: 'SNC coopérative', parent: '52' },
  '5306': { label: 'Société en commandite simple', parent: '53' },
  '5307': { label: 'Société en commandite simple coopérative', parent: '53' },
  '5308': { label: 'SCA', parent: '53' },
  '5309': { label: 'SCA coopérative', parent: '53' },
  '5310': { label: 'Société en libre partenariat (SLP)', parent: '53' },
  '5370': { label: 'SPFPL SCA', parent: '53' },
  '5385': { label: 'SELCA', parent: '53' },
  '5410': { label: 'SARL nationale', parent: '54' },
  '5415': { label: 'SARL d\'économie mixte', parent: '54' },
  '5422': { label: 'SARL SICOMI', parent: '54' },
  '5426': { label: 'SARL immobilière de gestion', parent: '54' },
  '5430': { label: 'SAFER SARL', parent: '54' },
  '5431': { label: 'SMIA SARL', parent: '54' },
  '5432': { label: 'SICA SARL', parent: '54' },
  '5442': { label: 'SARL d\'attribution', parent: '54' },
  '5443': { label: 'SARL coopérative de construction', parent: '54' },
  '5451': { label: 'SARL coopérative de consommation', parent: '54' },
  '5453': { label: 'SARL coopérative artisanale', parent: '54' },
  '5454': { label: 'SARL coopérative d\'intérêt maritime', parent: '54' },
  '5455': { label: 'SARL coopérative de transport', parent: '54' },
  '5458': { label: 'SCOP SARL', parent: '54' },
  '5459': { label: 'SARL union de sociétés coopératives', parent: '54' },
  '5460': { label: 'Autre SARL coopérative', parent: '54' },
  '5470': { label: 'SPFPL SARL', parent: '54' },
  '5485': { label: 'SELARL', parent: '54' },
  '5499': { label: 'SARL', parent: '54' },
  '5505': { label: 'SA participation ouvrière CA', parent: '55' },
  '5510': { label: 'SA nationale CA', parent: '55' },
  '5515': { label: 'SA économie mixte CA', parent: '55' },
  '5520': { label: 'Fonds forme sociétale CA', parent: '55' },
  '5522': { label: 'SA SICOMI CA', parent: '55' },
  '5525': { label: 'SA immobilière investissement CA', parent: '55' },
  '5530': { label: 'SAFER SA CA', parent: '55' },
  '5531': { label: 'SMIA SA CA', parent: '55' },
  '5532': { label: 'SICA SA CA', parent: '55' },
  '5542': { label: 'SA d\'attribution CA', parent: '55' },
  '5543': { label: 'SA coopérative construction CA', parent: '55' },
  '5546': { label: 'SA HLM CA', parent: '55' },
  '5547': { label: 'SA coopérative HLM CA', parent: '55' },
  '5548': { label: 'SA crédit immobilier CA', parent: '55' },
  '5551': { label: 'SA coopérative consommation CA', parent: '55' },
  '5552': { label: 'SA coopérative commerçants-détaillants CA', parent: '55' },
  '5553': { label: 'SA coopérative artisanale CA', parent: '55' },
  '5554': { label: 'SA coopérative maritime CA', parent: '55' },
  '5555': { label: 'SA coopérative transport CA', parent: '55' },
  '5558': { label: 'SCOP SA CA', parent: '55' },
  '5559': { label: 'SA union sociétés coopératives CA', parent: '55' },
  '5560': { label: 'Autre SA coopérative CA', parent: '55' },
  '5570': { label: 'SPFPL SA CA', parent: '55' },
  '5585': { label: 'SELAS CA', parent: '55' },
  '5599': { label: 'SA CA', parent: '55' },
  '5605': { label: 'SA participation ouvrière directoire', parent: '56' },
  '5610': { label: 'SA nationale directoire', parent: '56' },
  '5615': { label: 'SA économie mixte directoire', parent: '56' },
  '5620': { label: 'Fonds forme sociétale directoire', parent: '56' },
  '5622': { label: 'SA SICOMI directoire', parent: '56' },
  '5625': { label: 'SA immobilière investissement directoire', parent: '56' },
  '5630': { label: 'SAFER SA directoire', parent: '56' },
  '5631': { label: 'SMIA SA directoire', parent: '56' },
  '5632': { label: 'SICA SA directoire', parent: '56' },
  '5642': { label: 'SA attribution directoire', parent: '56' },
  '5643': { label: 'SA coopérative construction directoire', parent: '56' },
  '5646': { label: 'SA HLM directoire', parent: '56' },
  '5647': { label: 'SA coopérative HLM directoire', parent: '56' },
  '5648': { label: 'SA crédit immobilier directoire', parent: '56' },
  '5651': { label: 'SA coopérative consommation directoire', parent: '56' },
  '5652': { label: 'SA coopérative commerçants-détaillants directoire', parent: '56' },
  '5653': { label: 'SA coopérative artisanale directoire', parent: '56' },
  '5654': { label: 'SA coopérative maritime directoire', parent: '56' },
  '5655': { label: 'SA coopérative transport directoire', parent: '56' },
  '5658': { label: 'SCOP SA directoire', parent: '56' },
  '5659': { label: 'SA union sociétés coopératives directoire', parent: '56' },
  '5660': { label: 'Autre SA coopérative directoire', parent: '56' },
  '5670': { label: 'SPFPL SA directoire', parent: '56' },
  '5685': { label: 'SELAS directoire', parent: '56' },
  '5699': { label: 'SA directoire', parent: '56' },
  '5710': { label: 'SAS', parent: '57' },
  '5770': { label: 'SPFPL SAS', parent: '57' },
  '5785': { label: 'SELAS', parent: '57' },
  '5800': { label: 'Société européenne', parent: '58' },
  '6100': { label: 'Caisse d\'Épargne et de Prévoyance', parent: '61' },
  '6210': { label: 'GEIE', parent: '62' },
  '6220': { label: 'GIE', parent: '62' },
  '6316': { label: 'CUMA', parent: '63' },
  '6317': { label: 'Société coopérative agricole', parent: '63' },
  '6318': { label: 'Union sociétés coopératives agricoles', parent: '63' },
  '6411': { label: 'Société d\'assurance forme mutuelle', parent: '64' },
  '6511': { label: 'SISA', parent: '65' },
  '6521': { label: 'SCPI', parent: '65' },
  '6532': { label: 'SICA civile', parent: '65' },
  '6533': { label: 'GAEC', parent: '65' },
  '6534': { label: 'Groupement foncier agricole', parent: '65' },
  '6535': { label: 'Groupement agricole foncier', parent: '65' },
  '6536': { label: 'Groupement forestier', parent: '65' },
  '6537': { label: 'Groupement pastoral', parent: '65' },
  '6538': { label: 'Groupement foncier et rural', parent: '65' },
  '6539': { label: 'Société civile foncière', parent: '65' },
  '6540': { label: 'SCI', parent: '65' },
  '6541': { label: 'SCI construction-vente', parent: '65' },
  '6542': { label: 'Société civile d\'attribution', parent: '65' },
  '6543': { label: 'Société civile coopérative construction', parent: '65' },
  '6544': { label: 'SCI accession progressive propriété', parent: '65' },
  '6551': { label: 'Société civile coopérative consommation', parent: '65' },
  '6554': { label: 'Société civile coopérative maritime', parent: '65' },
  '6558': { label: 'Société civile coopérative médecins', parent: '65' },
  '6560': { label: 'Autre société civile coopérative', parent: '65' },
  '6561': { label: 'SCP d\'avocats', parent: '65' },
  '6562': { label: 'SCP d\'avocats aux conseils', parent: '65' },
  '6563': { label: 'SCP d\'avoués d\'appel', parent: '65' },
  '6564': { label: 'SCP d\'huissiers', parent: '65' },
  '6565': { label: 'SCP de notaires', parent: '65' },
  '6566': { label: 'SCP de commissaires-priseurs', parent: '65' },
  '6567': { label: 'SCP de greffiers tribunal commerce', parent: '65' },
  '6568': { label: 'SCP de conseils juridiques', parent: '65' },
  '6569': { label: 'SCP de commissaires aux comptes', parent: '65' },
  '6571': { label: 'SCP de médecins', parent: '65' },
  '6572': { label: 'SCP de dentistes', parent: '65' },
  '6573': { label: 'SCP d\'infirmiers', parent: '65' },
  '6574': { label: 'SCP de masseurs-kinésithérapeutes', parent: '65' },
  '6575': { label: 'SCP directeurs laboratoire', parent: '65' },
  '6576': { label: 'SCP de vétérinaires', parent: '65' },
  '6577': { label: 'SCP de géomètres experts', parent: '65' },
  '6578': { label: 'SCP d\'architectes', parent: '65' },
  '6585': { label: 'Autre SCP', parent: '65' },
  '6589': { label: 'SCM', parent: '65' },
  '6595': { label: 'Caisse locale crédit mutuel', parent: '65' },
  '6596': { label: 'Caisse crédit agricole mutuel', parent: '65' },
  '6597': { label: 'SCEA', parent: '65' },
  '6598': { label: 'EARL', parent: '65' },
  '6599': { label: 'Autre société civile', parent: '65' },
  '6901': { label: 'Autre personne privée RCS', parent: '69' },
  '7111': { label: 'Autorité constitutionnelle', parent: '71' },
  '7112': { label: 'Autorité administrative indépendante', parent: '71' },
  '7113': { label: 'Ministère', parent: '71' },
  '7120': { label: 'Service central ministère', parent: '71' },
  '7150': { label: 'Service ministère Défense', parent: '71' },
  '7160': { label: 'Service déconcentré national', parent: '71' },
  '7171': { label: 'Service déconcentré régional', parent: '71' },
  '7172': { label: 'Service déconcentré départemental', parent: '71' },
  '7179': { label: 'Autre service déconcentré territorial', parent: '71' },
  '7190': { label: 'École nationale sans personnalité morale', parent: '71' },
  '7210': { label: 'Commune', parent: '72' },
  '7220': { label: 'Département', parent: '72' },
  '7225': { label: 'Collectivité Outre Mer', parent: '72' },
  '7229': { label: 'Autre collectivité territoriale', parent: '72' },
  '7230': { label: 'Région', parent: '72' },
  '7312': { label: 'Commune associée/déléguée', parent: '73' },
  '7313': { label: 'Section de commune', parent: '73' },
  '7314': { label: 'Ensemble urbain', parent: '73' },
  '7321': { label: 'Association syndicale autorisée', parent: '73' },
  '7322': { label: 'Association foncière urbaine', parent: '73' },
  '7323': { label: 'Association foncière remembrement', parent: '73' },
  '7331': { label: 'EPLE', parent: '73' },
  '7340': { label: 'Pôle métropolitain', parent: '73' },
  '7341': { label: 'Secteur de commune', parent: '73' },
  '7342': { label: 'District urbain', parent: '73' },
  '7343': { label: 'Communauté urbaine', parent: '73' },
  '7344': { label: 'Métropole', parent: '73' },
  '7345': { label: 'SIVOM', parent: '73' },
  '7346': { label: 'Communauté de communes', parent: '73' },
  '7347': { label: 'Communauté de villes', parent: '73' },
  '7348': { label: 'Communauté d\'agglomération', parent: '73' },
  '7349': { label: 'Autre EPCI', parent: '73' },
  '7351': { label: 'Institution interdépartementale', parent: '73' },
  '7352': { label: 'Institution interrégionale', parent: '73' },
  '7353': { label: 'SIVU', parent: '73' },
  '7354': { label: 'Syndicat mixte fermé', parent: '73' },
  '7355': { label: 'Syndicat mixte ouvert', parent: '73' },
  '7356': { label: 'Commission syndicale gestion biens indivis', parent: '73' },
  '7357': { label: 'PETR', parent: '73' },
  '7361': { label: 'CCAS', parent: '73' },
  '7362': { label: 'Caisse des écoles', parent: '73' },
  '7363': { label: 'Caisse crédit municipal', parent: '73' },
  '7364': { label: 'Établissement hospitalisation', parent: '73' },
  '7365': { label: 'Syndicat inter hospitalier', parent: '73' },
  '7366': { label: 'Établissement social médico-social', parent: '73' },
  '7367': { label: 'CIAS', parent: '73' },
  '7371': { label: 'OPHLM', parent: '73' },
  '7372': { label: 'SDIS', parent: '73' },
  '7373': { label: 'Établissement culturel local', parent: '73' },
  '7378': { label: 'Régie locale administrative', parent: '73' },
  '7379': { label: 'Autre EPA local', parent: '73' },
  '7381': { label: 'Organisme consulaire', parent: '73' },
  '7382': { label: 'EPA national administration centrale', parent: '73' },
  '7383': { label: 'EPSCP', parent: '73' },
  '7384': { label: 'Autre EPA national enseignement', parent: '73' },
  '7385': { label: 'EPA national territorial limité', parent: '73' },
  '7389': { label: 'EPA national', parent: '73' },
  '7410': { label: 'GIP', parent: '74' },
  '7430': { label: 'Établissement cultes Alsace-Lorraine', parent: '74' },
  '7450': { label: 'EPA cercle/foyer armées', parent: '74' },
  '7470': { label: 'GCS public', parent: '74' },
  '7490': { label: 'Autre personne morale droit administratif', parent: '74' },
  '8110': { label: 'Régime général Sécurité Sociale', parent: '81' },
  '8120': { label: 'Régime spécial Sécurité Sociale', parent: '81' },
  '8130': { label: 'Institution retraite complémentaire', parent: '81' },
  '8140': { label: 'MSA', parent: '81' },
  '8150': { label: 'Régime maladie non-salariés non agricoles', parent: '81' },
  '8160': { label: 'Régime vieillesse hors régime général', parent: '81' },
  '8170': { label: 'Régime assurance chômage', parent: '81' },
  '8190': { label: 'Autre régime prévoyance sociale', parent: '81' },
  '8210': { label: 'Mutuelle', parent: '82' },
  '8250': { label: 'Assurance mutuelle agricole', parent: '82' },
  '8290': { label: 'Autre organisme mutualiste', parent: '82' },
  '8310': { label: 'CSE d\'entreprise', parent: '83' },
  '8311': { label: 'CSE d\'établissement', parent: '83' },
  '8410': { label: 'Syndicat de salariés', parent: '84' },
  '8420': { label: 'Syndicat patronal', parent: '84' },
  '8450': { label: 'Ordre professionnel', parent: '84' },
  '8470': { label: 'Centre technique industriel', parent: '84' },
  '8490': { label: 'Autre organisme professionnel', parent: '84' },
  '8510': { label: 'Institution de prévoyance', parent: '85' },
  '8520': { label: 'Institution retraite supplémentaire', parent: '85' },
  '9110': { label: 'Syndicat de copropriété', parent: '91' },
  '9150': { label: 'ASL', parent: '91' },
  '9210': { label: 'Association non déclarée', parent: '92' },
  '9220': { label: 'Association déclarée', parent: '92' },
  '9221': { label: 'Association insertion économique', parent: '92' },
  '9222': { label: 'Association intermédiaire', parent: '92' },
  '9223': { label: 'Groupement d\'employeurs', parent: '92' },
  '9224': { label: 'Association d\'avocats ARPI', parent: '92' },
  '9230': { label: 'Association reconnue utilité publique', parent: '92' },
  '9240': { label: 'Congrégation', parent: '92' },
  '9260': { label: 'Association droit local Alsace-Moselle', parent: '92' },
  '9300': { label: 'Fondation', parent: '93' },
  '9900': { label: 'Autre personne morale droit privé', parent: '99' },
  '9970': { label: 'GCS privé', parent: '99' }
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
