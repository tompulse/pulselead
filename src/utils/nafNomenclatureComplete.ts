// Nomenclature NAF officielle française complète - 5 niveaux
// Sections (A-U) → Divisions (XX) → Groupes (XX.X) → Classes (XX.XX) → Sous-classes (XX.XXZ)

export interface NafSection {
  code: string;
  label: string;
  emoji: string;
}

export interface NafDivision {
  code: string;
  label: string;
  section: string;
}

export interface NafGroupe {
  code: string;
  label: string;
  division: string;
}

export interface NafClasse {
  code: string;
  label: string;
  groupe: string;
}

// Section A-U avec emojis
export const NAF_SECTIONS: Record<string, { label: string; emoji: string }> = {
  'A': { label: 'Agriculture, sylviculture et pêche', emoji: '🌾' },
  'B': { label: 'Industries extractives', emoji: '⛏️' },
  'C': { label: 'Industrie manufacturière', emoji: '🏭' },
  'D': { label: 'Production et distribution d\'électricité, gaz, vapeur et air conditionné', emoji: '⚡' },
  'E': { label: 'Production et distribution d\'eau, assainissement, gestion des déchets', emoji: '💧' },
  'F': { label: 'Construction', emoji: '🏗️' },
  'G': { label: 'Commerce, réparation d\'automobiles et de motocycles', emoji: '🛒' },
  'H': { label: 'Transports et entreposage', emoji: '🚚' },
  'I': { label: 'Hébergement et restauration', emoji: '🏨' },
  'J': { label: 'Information et communication', emoji: '💻' },
  'K': { label: 'Activités financières et d\'assurance', emoji: '💰' },
  'L': { label: 'Activités immobilières', emoji: '🏠' },
  'M': { label: 'Activités spécialisées, scientifiques et techniques', emoji: '🔬' },
  'N': { label: 'Activités de services administratifs et de soutien', emoji: '📋' },
  'O': { label: 'Administration publique', emoji: '🏛️' },
  'P': { label: 'Enseignement', emoji: '🎓' },
  'Q': { label: 'Santé humaine et action sociale', emoji: '🏥' },
  'R': { label: 'Arts, spectacles et activités récréatives', emoji: '🎭' },
  'S': { label: 'Autres activités de services', emoji: '🔧' },
  'T': { label: 'Activités des ménages en tant qu\'employeurs', emoji: '🏡' },
  'U': { label: 'Activités extra-territoriales', emoji: '🌍' },
};

// Divisions (88 divisions officielles)
export const NAF_DIVISIONS: Record<string, { label: string; section: string }> = {
  '01': { label: 'Culture et production animale, chasse et services annexes', section: 'A' },
  '02': { label: 'Sylviculture et exploitation forestière', section: 'A' },
  '03': { label: 'Pêche et aquaculture', section: 'A' },
  '05': { label: 'Extraction de houille et de lignite', section: 'B' },
  '06': { label: 'Extraction d\'hydrocarbures', section: 'B' },
  '07': { label: 'Extraction de minerais métalliques', section: 'B' },
  '08': { label: 'Autres industries extractives', section: 'B' },
  '09': { label: 'Services de soutien aux industries extractives', section: 'B' },
  '10': { label: 'Industries alimentaires', section: 'C' },
  '11': { label: 'Fabrication de boissons', section: 'C' },
  '12': { label: 'Fabrication de produits à base de tabac', section: 'C' },
  '13': { label: 'Fabrication de textiles', section: 'C' },
  '14': { label: 'Industrie de l\'habillement', section: 'C' },
  '15': { label: 'Industrie du cuir et de la chaussure', section: 'C' },
  '16': { label: 'Travail du bois et fabrication d\'articles en bois et en liège', section: 'C' },
  '17': { label: 'Industrie du papier et du carton', section: 'C' },
  '18': { label: 'Imprimerie et reproduction d\'enregistrements', section: 'C' },
  '19': { label: 'Cokéfaction et raffinage', section: 'C' },
  '20': { label: 'Industrie chimique', section: 'C' },
  '21': { label: 'Industrie pharmaceutique', section: 'C' },
  '22': { label: 'Fabrication de produits en caoutchouc et en plastique', section: 'C' },
  '23': { label: 'Fabrication d\'autres produits minéraux non métalliques', section: 'C' },
  '24': { label: 'Métallurgie', section: 'C' },
  '25': { label: 'Fabrication de produits métalliques, sauf machines et équipements', section: 'C' },
  '26': { label: 'Fabrication de produits informatiques, électroniques et optiques', section: 'C' },
  '27': { label: 'Fabrication d\'équipements électriques', section: 'C' },
  '28': { label: 'Fabrication de machines et équipements n.c.a.', section: 'C' },
  '29': { label: 'Industrie automobile', section: 'C' },
  '30': { label: 'Fabrication d\'autres matériels de transport', section: 'C' },
  '31': { label: 'Fabrication de meubles', section: 'C' },
  '32': { label: 'Autres industries manufacturières', section: 'C' },
  '33': { label: 'Réparation et installation de machines et d\'équipements', section: 'C' },
  '35': { label: 'Production et distribution d\'électricité, de gaz, de vapeur et d\'air conditionné', section: 'D' },
  '36': { label: 'Captage, traitement et distribution d\'eau', section: 'E' },
  '37': { label: 'Collecte et traitement des eaux usées', section: 'E' },
  '38': { label: 'Collecte, traitement et élimination des déchets ; récupération', section: 'E' },
  '39': { label: 'Dépollution et autres services de gestion des déchets', section: 'E' },
  '41': { label: 'Construction de bâtiments', section: 'F' },
  '42': { label: 'Génie civil', section: 'F' },
  '43': { label: 'Travaux de construction spécialisés', section: 'F' },
  '45': { label: 'Commerce et réparation d\'automobiles et de motocycles', section: 'G' },
  '46': { label: 'Commerce de gros, à l\'exception des automobiles et des motocycles', section: 'G' },
  '47': { label: 'Commerce de détail, à l\'exception des automobiles et des motocycles', section: 'G' },
  '49': { label: 'Transports terrestres et transport par conduites', section: 'H' },
  '50': { label: 'Transports par eau', section: 'H' },
  '51': { label: 'Transports aériens', section: 'H' },
  '52': { label: 'Entreposage et services auxiliaires des transports', section: 'H' },
  '53': { label: 'Activités de poste et de courrier', section: 'H' },
  '55': { label: 'Hébergement', section: 'I' },
  '56': { label: 'Restauration', section: 'I' },
  '58': { label: 'Édition', section: 'J' },
  '59': { label: 'Production de films cinématographiques, de vidéo et de programmes de télévision', section: 'J' },
  '60': { label: 'Programmation et diffusion', section: 'J' },
  '61': { label: 'Télécommunications', section: 'J' },
  '62': { label: 'Programmation, conseil et autres activités informatiques', section: 'J' },
  '63': { label: 'Services d\'information', section: 'J' },
  '64': { label: 'Activités des services financiers, hors assurance et caisses de retraite', section: 'K' },
  '65': { label: 'Assurance', section: 'K' },
  '66': { label: 'Activités auxiliaires de services financiers et d\'assurance', section: 'K' },
  '68': { label: 'Activités immobilières', section: 'L' },
  '69': { label: 'Activités juridiques et comptables', section: 'M' },
  '70': { label: 'Activités des sièges sociaux ; conseil de gestion', section: 'M' },
  '71': { label: 'Activités d\'architecture et d\'ingénierie ; activités de contrôle et analyses techniques', section: 'M' },
  '72': { label: 'Recherche-développement scientifique', section: 'M' },
  '73': { label: 'Publicité et études de marché', section: 'M' },
  '74': { label: 'Autres activités spécialisées, scientifiques et techniques', section: 'M' },
  '75': { label: 'Activités vétérinaires', section: 'M' },
  '77': { label: 'Activités de location et location-bail', section: 'N' },
  '78': { label: 'Activités liées à l\'emploi', section: 'N' },
  '79': { label: 'Activités des agences de voyage, voyagistes, services de réservation', section: 'N' },
  '80': { label: 'Enquêtes et sécurité', section: 'N' },
  '81': { label: 'Services relatifs aux bâtiments et aménagement paysager', section: 'N' },
  '82': { label: 'Activités administratives et autres activités de soutien aux entreprises', section: 'N' },
  '84': { label: 'Administration publique et défense ; sécurité sociale obligatoire', section: 'O' },
  '85': { label: 'Enseignement', section: 'P' },
  '86': { label: 'Activités pour la santé humaine', section: 'Q' },
  '87': { label: 'Hébergement médico-social et social', section: 'Q' },
  '88': { label: 'Action sociale sans hébergement', section: 'Q' },
  '90': { label: 'Activités créatives, artistiques et de spectacle', section: 'R' },
  '91': { label: 'Bibliothèques, archives, musées et autres activités culturelles', section: 'R' },
  '92': { label: 'Organisation de jeux de hasard et d\'argent', section: 'R' },
  '93': { label: 'Activités sportives, récréatives et de loisirs', section: 'R' },
  '94': { label: 'Activités des organisations associatives', section: 'S' },
  '95': { label: 'Réparation d\'ordinateurs et de biens personnels et domestiques', section: 'S' },
  '96': { label: 'Autres services personnels', section: 'S' },
  '97': { label: 'Activités des ménages en tant qu\'employeurs de personnel domestique', section: 'T' },
  '98': { label: 'Activités indifférenciées des ménages en tant que producteurs', section: 'T' },
  '99': { label: 'Activités des organisations et organismes extraterritoriaux', section: 'U' },
};

// Groupes NAF (272 groupes officiels - sélection des principaux)
export const NAF_GROUPES: Record<string, { label: string; division: string }> = {
  // Section A
  '01.1': { label: 'Cultures non permanentes', division: '01' },
  '01.2': { label: 'Cultures permanentes', division: '01' },
  '01.3': { label: 'Reproduction de plantes', division: '01' },
  '01.4': { label: 'Production animale', division: '01' },
  '01.5': { label: 'Culture et élevage associés', division: '01' },
  '01.6': { label: 'Activités de soutien à l\'agriculture et traitement primaire des récoltes', division: '01' },
  '01.7': { label: 'Chasse, piégeage et services annexes', division: '01' },
  '02.1': { label: 'Sylviculture et autres activités forestières', division: '02' },
  '02.2': { label: 'Exploitation forestière', division: '02' },
  '02.3': { label: 'Récolte de produits forestiers non ligneux poussant à l\'état sauvage', division: '02' },
  '02.4': { label: 'Services de soutien à l\'exploitation forestière', division: '02' },
  '03.1': { label: 'Pêche', division: '03' },
  '03.2': { label: 'Aquaculture', division: '03' },
  // Section B
  '05.1': { label: 'Extraction de houille', division: '05' },
  '05.2': { label: 'Extraction de lignite', division: '05' },
  '06.1': { label: 'Extraction de pétrole brut', division: '06' },
  '06.2': { label: 'Extraction de gaz naturel', division: '06' },
  '07.1': { label: 'Extraction de minerais de fer', division: '07' },
  '07.2': { label: 'Extraction de minerais de métaux non ferreux', division: '07' },
  '08.1': { label: 'Extraction de pierres, de sables et d\'argiles', division: '08' },
  '08.9': { label: 'Activités extractives n.c.a.', division: '08' },
  '09.1': { label: 'Activités de soutien à l\'extraction d\'hydrocarbures', division: '09' },
  '09.9': { label: 'Activités de soutien aux autres industries extractives', division: '09' },
  // Section C - Industries alimentaires
  '10.1': { label: 'Transformation et conservation de la viande et préparation de produits à base de viande', division: '10' },
  '10.2': { label: 'Transformation et conservation de poisson, crustacés et mollusques', division: '10' },
  '10.3': { label: 'Transformation et conservation de fruits et légumes', division: '10' },
  '10.4': { label: 'Fabrication d\'huiles et graisses végétales et animales', division: '10' },
  '10.5': { label: 'Fabrication de produits laitiers', division: '10' },
  '10.6': { label: 'Travail des grains ; fabrication de produits amylacés', division: '10' },
  '10.7': { label: 'Fabrication de produits de boulangerie-pâtisserie et de pâtes alimentaires', division: '10' },
  '10.8': { label: 'Fabrication d\'autres produits alimentaires', division: '10' },
  '10.9': { label: 'Fabrication d\'aliments pour animaux', division: '10' },
  '11.0': { label: 'Fabrication de boissons', division: '11' },
  '12.0': { label: 'Fabrication de produits à base de tabac', division: '12' },
  // Section C - Textiles
  '13.1': { label: 'Préparation de fibres textiles et filature', division: '13' },
  '13.2': { label: 'Tissage', division: '13' },
  '13.3': { label: 'Ennoblissement textile', division: '13' },
  '13.9': { label: 'Fabrication d\'autres textiles', division: '13' },
  '14.1': { label: 'Fabrication de vêtements, autres qu\'en fourrure', division: '14' },
  '14.2': { label: 'Fabrication d\'articles en fourrure', division: '14' },
  '14.3': { label: 'Fabrication d\'articles à mailles', division: '14' },
  '15.1': { label: 'Apprêt et tannage des cuirs ; préparation et teinture des fourrures', division: '15' },
  '15.2': { label: 'Fabrication de chaussures', division: '15' },
  // Section C - Bois, papier, imprimerie
  '16.1': { label: 'Sciage et rabotage du bois', division: '16' },
  '16.2': { label: 'Fabrication d\'articles en bois, liège, vannerie et sparterie', division: '16' },
  '17.1': { label: 'Fabrication de pâte à papier, de papier et de carton', division: '17' },
  '17.2': { label: 'Fabrication d\'articles en papier ou en carton', division: '17' },
  '18.1': { label: 'Imprimerie et services annexes', division: '18' },
  '18.2': { label: 'Reproduction d\'enregistrements', division: '18' },
  // Section C - Chimie, pharma
  '19.1': { label: 'Cokéfaction', division: '19' },
  '19.2': { label: 'Raffinage du pétrole', division: '19' },
  '20.1': { label: 'Fabrication de produits chimiques de base, de produits azotés et d\'engrais', division: '20' },
  '20.2': { label: 'Fabrication de pesticides et d\'autres produits agrochimiques', division: '20' },
  '20.3': { label: 'Fabrication de peintures, vernis, encres et mastics', division: '20' },
  '20.4': { label: 'Fabrication de savons, de produits d\'entretien et de parfums', division: '20' },
  '20.5': { label: 'Fabrication d\'autres produits chimiques', division: '20' },
  '20.6': { label: 'Fabrication de fibres artificielles ou synthétiques', division: '20' },
  '21.1': { label: 'Fabrication de produits pharmaceutiques de base', division: '21' },
  '21.2': { label: 'Fabrication de préparations pharmaceutiques', division: '21' },
  // Section C - Caoutchouc, plastique, minéraux
  '22.1': { label: 'Fabrication de produits en caoutchouc', division: '22' },
  '22.2': { label: 'Fabrication de produits en plastique', division: '22' },
  '23.1': { label: 'Fabrication de verre et d\'articles en verre', division: '23' },
  '23.2': { label: 'Fabrication de produits réfractaires', division: '23' },
  '23.3': { label: 'Fabrication de matériaux de construction en terre cuite', division: '23' },
  '23.4': { label: 'Fabrication d\'autres produits en céramique et en porcelaine', division: '23' },
  '23.5': { label: 'Fabrication de ciment, chaux et plâtre', division: '23' },
  '23.6': { label: 'Fabrication d\'ouvrages en béton, en ciment ou en plâtre', division: '23' },
  '23.7': { label: 'Taille, façonnage et finissage de pierres', division: '23' },
  '23.9': { label: 'Fabrication de produits abrasifs et de produits minéraux non métalliques n.c.a.', division: '23' },
  // Section C - Métallurgie
  '24.1': { label: 'Sidérurgie', division: '24' },
  '24.2': { label: 'Fabrication de tubes, tuyaux, profilés creux et accessoires correspondants en acier', division: '24' },
  '24.3': { label: 'Fabrication d\'autres produits de première transformation de l\'acier', division: '24' },
  '24.4': { label: 'Production de métaux précieux et d\'autres métaux non ferreux', division: '24' },
  '24.5': { label: 'Fonderie', division: '24' },
  '25.1': { label: 'Fabrication d\'éléments en métal pour la construction', division: '25' },
  '25.2': { label: 'Fabrication de réservoirs, citernes et conteneurs métalliques', division: '25' },
  '25.3': { label: 'Fabrication de générateurs de vapeur, à l\'exception des chaudières pour chauffage central', division: '25' },
  '25.4': { label: 'Fabrication d\'armes et de munitions', division: '25' },
  '25.5': { label: 'Forge, emboutissage, estampage ; métallurgie des poudres', division: '25' },
  '25.6': { label: 'Traitement et revêtement des métaux ; usinage', division: '25' },
  '25.7': { label: 'Fabrication de coutellerie, d\'outillage et de quincaillerie', division: '25' },
  '25.9': { label: 'Fabrication d\'autres ouvrages en métaux', division: '25' },
  // Section C - Électronique, électrique
  '26.1': { label: 'Fabrication de composants et cartes électroniques', division: '26' },
  '26.2': { label: 'Fabrication d\'ordinateurs et d\'équipements périphériques', division: '26' },
  '26.3': { label: 'Fabrication d\'équipements de communication', division: '26' },
  '26.4': { label: 'Fabrication de produits électroniques grand public', division: '26' },
  '26.5': { label: 'Fabrication d\'instruments et d\'appareils de mesure, d\'essai et de navigation', division: '26' },
  '26.6': { label: 'Fabrication d\'équipements d\'irradiation médicale, d\'équipements électromédicaux', division: '26' },
  '26.7': { label: 'Fabrication de matériels optique et photographique', division: '26' },
  '26.8': { label: 'Fabrication de supports magnétiques et optiques', division: '26' },
  '27.1': { label: 'Fabrication de moteurs, génératrices et transformateurs électriques', division: '27' },
  '27.2': { label: 'Fabrication de piles et d\'accumulateurs électriques', division: '27' },
  '27.3': { label: 'Fabrication de fils et câbles et de matériel d\'installation électrique', division: '27' },
  '27.4': { label: 'Fabrication d\'appareils d\'éclairage électrique', division: '27' },
  '27.5': { label: 'Fabrication d\'appareils ménagers', division: '27' },
  '27.9': { label: 'Fabrication d\'autres matériels électriques', division: '27' },
  // Section C - Machines et équipements
  '28.1': { label: 'Fabrication de machines d\'usage général', division: '28' },
  '28.2': { label: 'Fabrication d\'autres machines d\'usage général', division: '28' },
  '28.3': { label: 'Fabrication de machines agricoles et forestières', division: '28' },
  '28.4': { label: 'Fabrication de machines de formage des métaux et de machines-outils', division: '28' },
  '28.9': { label: 'Fabrication d\'autres machines d\'usage spécifique', division: '28' },
  // Section C - Automobile et transport
  '29.1': { label: 'Construction de véhicules automobiles', division: '29' },
  '29.2': { label: 'Fabrication de carrosseries et remorques', division: '29' },
  '29.3': { label: 'Fabrication d\'équipements automobiles', division: '29' },
  '30.1': { label: 'Construction navale', division: '30' },
  '30.2': { label: 'Construction de locomotives et d\'autre matériel ferroviaire roulant', division: '30' },
  '30.3': { label: 'Construction aéronautique et spatiale', division: '30' },
  '30.4': { label: 'Construction de véhicules militaires de combat', division: '30' },
  '30.9': { label: 'Fabrication de matériels de transport n.c.a.', division: '30' },
  // Section C - Meubles et autres
  '31.0': { label: 'Fabrication de meubles', division: '31' },
  '32.1': { label: 'Fabrication d\'articles de joaillerie, bijouterie et articles similaires', division: '32' },
  '32.2': { label: 'Fabrication d\'instruments de musique', division: '32' },
  '32.3': { label: 'Fabrication d\'articles de sport', division: '32' },
  '32.4': { label: 'Fabrication de jeux et jouets', division: '32' },
  '32.5': { label: 'Fabrication d\'instruments et de fournitures à usage médical et dentaire', division: '32' },
  '32.9': { label: 'Activités manufacturières n.c.a.', division: '32' },
  '33.1': { label: 'Réparation d\'ouvrages en métaux, de machines et d\'équipements', division: '33' },
  '33.2': { label: 'Installation de machines et d\'équipements industriels', division: '33' },
  // Section D
  '35.1': { label: 'Production, transport et distribution d\'électricité', division: '35' },
  '35.2': { label: 'Production et distribution de combustibles gazeux', division: '35' },
  '35.3': { label: 'Production et distribution de vapeur et d\'air conditionné', division: '35' },
  // Section E
  '36.0': { label: 'Captage, traitement et distribution d\'eau', division: '36' },
  '37.0': { label: 'Collecte et traitement des eaux usées', division: '37' },
  '38.1': { label: 'Collecte des déchets', division: '38' },
  '38.2': { label: 'Traitement et élimination des déchets', division: '38' },
  '38.3': { label: 'Récupération', division: '38' },
  '39.0': { label: 'Dépollution et autres services de gestion des déchets', division: '39' },
  // Section F
  '41.1': { label: 'Promotion immobilière', division: '41' },
  '41.2': { label: 'Construction de bâtiments résidentiels et non résidentiels', division: '41' },
  '42.1': { label: 'Construction de routes et de voies ferrées', division: '42' },
  '42.2': { label: 'Construction de réseaux et de lignes', division: '42' },
  '42.9': { label: 'Construction d\'autres ouvrages de génie civil', division: '42' },
  '43.1': { label: 'Démolition et préparation des sites', division: '43' },
  '43.2': { label: 'Travaux d\'installation électrique, plomberie et autres travaux d\'installation', division: '43' },
  '43.3': { label: 'Travaux de finition', division: '43' },
  '43.9': { label: 'Autres travaux de construction spécialisés', division: '43' },
  // Section G
  '45.1': { label: 'Commerce de véhicules automobiles', division: '45' },
  '45.2': { label: 'Entretien et réparation de véhicules automobiles', division: '45' },
  '45.3': { label: 'Commerce d\'équipements automobiles', division: '45' },
  '45.4': { label: 'Commerce et réparation de motocycles', division: '45' },
  '46.1': { label: 'Intermédiaires du commerce de gros', division: '46' },
  '46.2': { label: 'Commerce de gros de produits agricoles bruts et d\'animaux vivants', division: '46' },
  '46.3': { label: 'Commerce de gros de produits alimentaires, de boissons et de tabac', division: '46' },
  '46.4': { label: 'Commerce de gros de biens domestiques', division: '46' },
  '46.5': { label: 'Commerce de gros d\'équipements de l\'information et de la communication', division: '46' },
  '46.6': { label: 'Commerce de gros d\'autres équipements industriels', division: '46' },
  '46.7': { label: 'Autres commerces de gros spécialisés', division: '46' },
  '46.9': { label: 'Commerce de gros non spécialisé', division: '46' },
  '47.1': { label: 'Commerce de détail en magasin non spécialisé', division: '47' },
  '47.2': { label: 'Commerce de détail alimentaire en magasin spécialisé', division: '47' },
  '47.3': { label: 'Commerce de détail de carburants en magasin spécialisé', division: '47' },
  '47.4': { label: 'Commerce de détail d\'équipements de l\'information et de la communication', division: '47' },
  '47.5': { label: 'Commerce de détail d\'autres équipements du foyer en magasin spécialisé', division: '47' },
  '47.6': { label: 'Commerce de détail de biens culturels et de loisirs en magasin spécialisé', division: '47' },
  '47.7': { label: 'Autres commerces de détail en magasin spécialisé', division: '47' },
  '47.8': { label: 'Commerce de détail sur éventaires et marchés', division: '47' },
  '47.9': { label: 'Commerce de détail hors magasin, éventaires ou marchés', division: '47' },
  // Section H
  '49.1': { label: 'Transport ferroviaire interurbain de voyageurs', division: '49' },
  '49.2': { label: 'Transports ferroviaires de fret', division: '49' },
  '49.3': { label: 'Autres transports terrestres de voyageurs', division: '49' },
  '49.4': { label: 'Transports routiers de fret et services de déménagement', division: '49' },
  '49.5': { label: 'Transports par conduites', division: '49' },
  '50.1': { label: 'Transports maritimes et côtiers de passagers', division: '50' },
  '50.2': { label: 'Transports maritimes et côtiers de fret', division: '50' },
  '50.3': { label: 'Transports fluviaux de passagers', division: '50' },
  '50.4': { label: 'Transports fluviaux de fret', division: '50' },
  '51.1': { label: 'Transports aériens de passagers', division: '51' },
  '51.2': { label: 'Transports aériens de fret et transports spatiaux', division: '51' },
  '52.1': { label: 'Entreposage et stockage', division: '52' },
  '52.2': { label: 'Services auxiliaires des transports', division: '52' },
  '53.1': { label: 'Activités de poste dans le cadre d\'une obligation de service universel', division: '53' },
  '53.2': { label: 'Autres activités de poste et de courrier', division: '53' },
  // Section I
  '55.1': { label: 'Hôtels et hébergement similaire', division: '55' },
  '55.2': { label: 'Hébergement touristique et autre hébergement de courte durée', division: '55' },
  '55.3': { label: 'Terrains de camping et parcs pour caravanes ou véhicules de loisirs', division: '55' },
  '55.9': { label: 'Autres hébergements', division: '55' },
  '56.1': { label: 'Restaurants et services de restauration mobile', division: '56' },
  '56.2': { label: 'Traiteurs et autres services de restauration', division: '56' },
  '56.3': { label: 'Débits de boissons', division: '56' },
  // Section J
  '58.1': { label: 'Édition de livres et périodiques et autres activités d\'édition', division: '58' },
  '58.2': { label: 'Édition de logiciels', division: '58' },
  '59.1': { label: 'Activités cinématographiques, vidéo et de télévision', division: '59' },
  '59.2': { label: 'Enregistrement sonore et édition musicale', division: '59' },
  '60.1': { label: 'Édition et diffusion de programmes radio', division: '60' },
  '60.2': { label: 'Programmation de télévision et télédiffusion', division: '60' },
  '61.1': { label: 'Télécommunications filaires', division: '61' },
  '61.2': { label: 'Télécommunications sans fil', division: '61' },
  '61.3': { label: 'Télécommunications par satellite', division: '61' },
  '61.9': { label: 'Autres activités de télécommunication', division: '61' },
  '62.0': { label: 'Programmation, conseil et autres activités informatiques', division: '62' },
  '63.1': { label: 'Traitement de données, hébergement et activités connexes ; portails Internet', division: '63' },
  '63.9': { label: 'Autres services d\'information', division: '63' },
  // Section K
  '64.1': { label: 'Intermédiation monétaire', division: '64' },
  '64.2': { label: 'Activités des sociétés holding', division: '64' },
  '64.3': { label: 'Fonds de placement et entités financières similaires', division: '64' },
  '64.9': { label: 'Autres activités des services financiers, hors assurance et caisses de retraite', division: '64' },
  '65.1': { label: 'Assurance', division: '65' },
  '65.2': { label: 'Réassurance', division: '65' },
  '65.3': { label: 'Caisses de retraite', division: '65' },
  '66.1': { label: 'Activités auxiliaires de services financiers, hors assurance et caisses de retraite', division: '66' },
  '66.2': { label: 'Activités auxiliaires d\'assurance et de caisses de retraite', division: '66' },
  '66.3': { label: 'Gestion de fonds', division: '66' },
  // Section L
  '68.1': { label: 'Activités des marchands de biens immobiliers', division: '68' },
  '68.2': { label: 'Location et exploitation de biens immobiliers propres ou loués', division: '68' },
  '68.3': { label: 'Activités immobilières pour compte de tiers', division: '68' },
  // Section M
  '69.1': { label: 'Activités juridiques', division: '69' },
  '69.2': { label: 'Activités comptables', division: '69' },
  '70.1': { label: 'Activités des sièges sociaux', division: '70' },
  '70.2': { label: 'Conseil de gestion', division: '70' },
  '71.1': { label: 'Activités d\'architecture et d\'ingénierie', division: '71' },
  '71.2': { label: 'Activités de contrôle et analyses techniques', division: '71' },
  '72.1': { label: 'Recherche-développement en sciences physiques et naturelles', division: '72' },
  '72.2': { label: 'Recherche-développement en sciences humaines et sociales', division: '72' },
  '73.1': { label: 'Publicité', division: '73' },
  '73.2': { label: 'Études de marché et sondages', division: '73' },
  '74.1': { label: 'Activités spécialisées de design', division: '74' },
  '74.2': { label: 'Activités photographiques', division: '74' },
  '74.3': { label: 'Traduction et interprétation', division: '74' },
  '74.9': { label: 'Autres activités spécialisées, scientifiques et techniques n.c.a.', division: '74' },
  '75.0': { label: 'Activités vétérinaires', division: '75' },
  // Section N
  '77.1': { label: 'Location et location-bail de véhicules automobiles', division: '77' },
  '77.2': { label: 'Location et location-bail de biens personnels et domestiques', division: '77' },
  '77.3': { label: 'Location et location-bail d\'autres machines, équipements et biens', division: '77' },
  '77.4': { label: 'Location-bail de propriété intellectuelle et de produits similaires', division: '77' },
  '78.1': { label: 'Activités des agences de placement de main-d\'œuvre', division: '78' },
  '78.2': { label: 'Activités des agences de travail temporaire', division: '78' },
  '78.3': { label: 'Autre mise à disposition de ressources humaines', division: '78' },
  '79.1': { label: 'Activités des agences de voyage et voyagistes', division: '79' },
  '79.9': { label: 'Autres services de réservation et activités connexes', division: '79' },
  '80.1': { label: 'Activités de sécurité privée', division: '80' },
  '80.2': { label: 'Activités liées aux systèmes de sécurité', division: '80' },
  '80.3': { label: 'Activités d\'enquête', division: '80' },
  '81.1': { label: 'Activités combinées de soutien lié aux bâtiments', division: '81' },
  '81.2': { label: 'Activités de nettoyage', division: '81' },
  '81.3': { label: 'Services d\'aménagement paysager', division: '81' },
  '82.1': { label: 'Activités administratives', division: '82' },
  '82.2': { label: 'Activités de centres d\'appels', division: '82' },
  '82.3': { label: 'Organisation de foires, salons professionnels et congrès', division: '82' },
  '82.9': { label: 'Activités de soutien aux entreprises n.c.a.', division: '82' },
  // Section O
  '84.1': { label: 'Administration générale, économique et sociale', division: '84' },
  '84.2': { label: 'Services de prérogative publique', division: '84' },
  '84.3': { label: 'Sécurité sociale obligatoire', division: '84' },
  // Section P
  '85.1': { label: 'Enseignement pré-primaire', division: '85' },
  '85.2': { label: 'Enseignement primaire', division: '85' },
  '85.3': { label: 'Enseignement secondaire', division: '85' },
  '85.4': { label: 'Enseignement supérieur et post-secondaire non supérieur', division: '85' },
  '85.5': { label: 'Autres activités d\'enseignement', division: '85' },
  '85.6': { label: 'Activités de soutien à l\'enseignement', division: '85' },
  // Section Q
  '86.1': { label: 'Activités hospitalières', division: '86' },
  '86.2': { label: 'Activité des médecins et des dentistes', division: '86' },
  '86.9': { label: 'Autres activités pour la santé humaine', division: '86' },
  '87.1': { label: 'Hébergement médicalisé', division: '87' },
  '87.2': { label: 'Hébergement social pour personnes handicapées mentales, malades mentales et toxicomanes', division: '87' },
  '87.3': { label: 'Hébergement social pour personnes âgées ou handicapées physiques', division: '87' },
  '87.9': { label: 'Autres activités d\'hébergement social', division: '87' },
  '88.1': { label: 'Action sociale sans hébergement pour personnes âgées et pour personnes handicapées', division: '88' },
  '88.9': { label: 'Autre action sociale sans hébergement', division: '88' },
  // Section R
  '90.0': { label: 'Activités créatives, artistiques et de spectacle', division: '90' },
  '91.0': { label: 'Bibliothèques, archives, musées et autres activités culturelles', division: '91' },
  '92.0': { label: 'Organisation de jeux de hasard et d\'argent', division: '92' },
  '93.1': { label: 'Activités liées au sport', division: '93' },
  '93.2': { label: 'Activités récréatives et de loisirs', division: '93' },
  // Section S
  '94.1': { label: 'Activités des organisations économiques, patronales et professionnelles', division: '94' },
  '94.2': { label: 'Activités des syndicats de salariés', division: '94' },
  '94.9': { label: 'Activités des autres organisations associatives', division: '94' },
  '95.1': { label: 'Réparation d\'ordinateurs et d\'équipements de communication', division: '95' },
  '95.2': { label: 'Réparation de biens personnels et domestiques', division: '95' },
  '96.0': { label: 'Autres services personnels', division: '96' },
  // Section T
  '97.0': { label: 'Activités des ménages en tant qu\'employeurs de personnel domestique', division: '97' },
  '98.1': { label: 'Activités indifférenciées des ménages en tant que producteurs de biens', division: '98' },
  '98.2': { label: 'Activités indifférenciées des ménages en tant que producteurs de services', division: '98' },
  // Section U
  '99.0': { label: 'Activités des organisations et organismes extraterritoriaux', division: '99' },
};

// Classes NAF (615 classes officielles - sélection des principales)
export const NAF_CLASSES: Record<string, { label: string; groupe: string }> = {
  // Section A - Agriculture
  '01.11': { label: 'Culture de céréales (à l\'exception du riz), de légumineuses et de graines oléagineuses', groupe: '01.1' },
  '01.12': { label: 'Culture du riz', groupe: '01.1' },
  '01.13': { label: 'Culture de légumes, de melons, de racines et de tubercules', groupe: '01.1' },
  '01.14': { label: 'Culture de la canne à sucre', groupe: '01.1' },
  '01.15': { label: 'Culture du tabac', groupe: '01.1' },
  '01.16': { label: 'Culture de plantes à fibres', groupe: '01.1' },
  '01.19': { label: 'Autres cultures non permanentes', groupe: '01.1' },
  '01.21': { label: 'Culture de la vigne', groupe: '01.2' },
  '01.22': { label: 'Culture de fruits tropicaux et subtropicaux', groupe: '01.2' },
  '01.23': { label: 'Culture d\'agrumes', groupe: '01.2' },
  '01.24': { label: 'Culture de fruits à pépins et à noyau', groupe: '01.2' },
  '01.25': { label: 'Culture d\'autres fruits d\'arbres ou d\'arbustes et de fruits à coque', groupe: '01.2' },
  '01.26': { label: 'Culture de fruits oléagineux', groupe: '01.2' },
  '01.27': { label: 'Culture de plantes à boissons', groupe: '01.2' },
  '01.28': { label: 'Culture de plantes à épices, aromatiques, médicinales et pharmaceutiques', groupe: '01.2' },
  '01.29': { label: 'Autres cultures permanentes', groupe: '01.2' },
  '01.30': { label: 'Reproduction de plantes', groupe: '01.3' },
  '01.41': { label: 'Élevage de vaches laitières', groupe: '01.4' },
  '01.42': { label: 'Élevage d\'autres bovins et de buffles', groupe: '01.4' },
  '01.43': { label: 'Élevage de chevaux et d\'autres équidés', groupe: '01.4' },
  '01.44': { label: 'Élevage de chameaux et d\'autres camélidés', groupe: '01.4' },
  '01.45': { label: 'Élevage d\'ovins et de caprins', groupe: '01.4' },
  '01.46': { label: 'Élevage de porcins', groupe: '01.4' },
  '01.47': { label: 'Élevage de volailles', groupe: '01.4' },
  '01.49': { label: 'Élevage d\'autres animaux', groupe: '01.4' },
  '01.50': { label: 'Culture et élevage associés', groupe: '01.5' },
  '01.61': { label: 'Activités de soutien aux cultures', groupe: '01.6' },
  '01.62': { label: 'Activités de soutien à la production animale', groupe: '01.6' },
  '01.63': { label: 'Traitement primaire des récoltes', groupe: '01.6' },
  '01.64': { label: 'Traitement des semences', groupe: '01.6' },
  '01.70': { label: 'Chasse, piégeage et services annexes', groupe: '01.7' },
  // Construction (Section F)
  '41.10': { label: 'Promotion immobilière', groupe: '41.1' },
  '41.20': { label: 'Construction de bâtiments résidentiels et non résidentiels', groupe: '41.2' },
  '42.11': { label: 'Construction de routes et autoroutes', groupe: '42.1' },
  '42.12': { label: 'Construction de voies ferrées de surface et souterraines', groupe: '42.1' },
  '42.13': { label: 'Construction de ponts et tunnels', groupe: '42.1' },
  '42.21': { label: 'Construction de réseaux pour fluides', groupe: '42.2' },
  '42.22': { label: 'Construction de réseaux électriques et de télécommunications', groupe: '42.2' },
  '42.91': { label: 'Construction d\'ouvrages maritimes et fluviaux', groupe: '42.9' },
  '42.99': { label: 'Construction d\'autres ouvrages de génie civil n.c.a.', groupe: '42.9' },
  '43.11': { label: 'Travaux de démolition', groupe: '43.1' },
  '43.12': { label: 'Travaux de préparation des sites', groupe: '43.1' },
  '43.13': { label: 'Forages et sondages', groupe: '43.1' },
  '43.21': { label: 'Installation électrique', groupe: '43.2' },
  '43.22': { label: 'Travaux de plomberie et installation de chauffage et de conditionnement d\'air', groupe: '43.2' },
  '43.29': { label: 'Autres travaux d\'installation', groupe: '43.2' },
  '43.31': { label: 'Travaux de plâtrerie', groupe: '43.3' },
  '43.32': { label: 'Travaux de menuiserie', groupe: '43.3' },
  '43.33': { label: 'Travaux de revêtement des sols et des murs', groupe: '43.3' },
  '43.34': { label: 'Travaux de peinture et vitrerie', groupe: '43.3' },
  '43.39': { label: 'Autres travaux de finition', groupe: '43.3' },
  '43.91': { label: 'Travaux de couverture', groupe: '43.9' },
  '43.99': { label: 'Autres travaux de construction spécialisés n.c.a.', groupe: '43.9' },
  // Commerce (Section G)
  '45.11': { label: 'Commerce de voitures et de véhicules automobiles légers', groupe: '45.1' },
  '45.19': { label: 'Commerce d\'autres véhicules automobiles', groupe: '45.1' },
  '45.20': { label: 'Entretien et réparation de véhicules automobiles', groupe: '45.2' },
  '45.31': { label: 'Commerce de gros d\'équipements automobiles', groupe: '45.3' },
  '45.32': { label: 'Commerce de détail d\'équipements automobiles', groupe: '45.3' },
  '45.40': { label: 'Commerce et réparation de motocycles', groupe: '45.4' },
  '47.11': { label: 'Commerce de détail en magasin non spécialisé à prédominance alimentaire', groupe: '47.1' },
  '47.19': { label: 'Autre commerce de détail en magasin non spécialisé', groupe: '47.1' },
  '47.21': { label: 'Commerce de détail de fruits et légumes en magasin spécialisé', groupe: '47.2' },
  '47.22': { label: 'Commerce de détail de viandes et de produits à base de viande en magasin spécialisé', groupe: '47.2' },
  '47.23': { label: 'Commerce de détail de poissons, crustacés et mollusques en magasin spécialisé', groupe: '47.2' },
  '47.24': { label: 'Commerce de détail de pain, pâtisserie et confiserie en magasin spécialisé', groupe: '47.2' },
  '47.25': { label: 'Commerce de détail de boissons en magasin spécialisé', groupe: '47.2' },
  '47.26': { label: 'Commerce de détail de produits à base de tabac en magasin spécialisé', groupe: '47.2' },
  '47.29': { label: 'Autres commerces de détail alimentaires en magasin spécialisé', groupe: '47.2' },
  '47.30': { label: 'Commerce de détail de carburants en magasin spécialisé', groupe: '47.3' },
  '47.41': { label: 'Commerce de détail d\'ordinateurs, d\'unités périphériques et de logiciels en magasin spécialisé', groupe: '47.4' },
  '47.42': { label: 'Commerce de détail de matériels de télécommunication en magasin spécialisé', groupe: '47.4' },
  '47.43': { label: 'Commerce de détail de matériels audio/vidéo en magasin spécialisé', groupe: '47.4' },
  '47.51': { label: 'Commerce de détail de textiles en magasin spécialisé', groupe: '47.5' },
  '47.52': { label: 'Commerce de détail de quincaillerie, peintures et verres en magasin spécialisé', groupe: '47.5' },
  '47.53': { label: 'Commerce de détail de tapis, moquettes et revêtements de murs et de sols', groupe: '47.5' },
  '47.54': { label: 'Commerce de détail d\'appareils électroménagers en magasin spécialisé', groupe: '47.5' },
  '47.59': { label: 'Commerce de détail de meubles, appareils d\'éclairage et autres articles de ménage', groupe: '47.5' },
  '47.61': { label: 'Commerce de détail de livres en magasin spécialisé', groupe: '47.6' },
  '47.62': { label: 'Commerce de détail de journaux et papeterie en magasin spécialisé', groupe: '47.6' },
  '47.63': { label: 'Commerce de détail d\'enregistrements musicaux et vidéo en magasin spécialisé', groupe: '47.6' },
  '47.64': { label: 'Commerce de détail d\'articles de sport en magasin spécialisé', groupe: '47.6' },
  '47.65': { label: 'Commerce de détail de jeux et jouets en magasin spécialisé', groupe: '47.6' },
  '47.71': { label: 'Commerce de détail d\'habillement en magasin spécialisé', groupe: '47.7' },
  '47.72': { label: 'Commerce de détail de chaussures et d\'articles en cuir en magasin spécialisé', groupe: '47.7' },
  '47.73': { label: 'Commerce de détail de produits pharmaceutiques en magasin spécialisé', groupe: '47.7' },
  '47.74': { label: 'Commerce de détail d\'articles médicaux et orthopédiques en magasin spécialisé', groupe: '47.7' },
  '47.75': { label: 'Commerce de détail de parfumerie et de produits de beauté en magasin spécialisé', groupe: '47.7' },
  '47.76': { label: 'Commerce de détail de fleurs, plantes, graines, engrais, animaux de compagnie', groupe: '47.7' },
  '47.77': { label: 'Commerce de détail d\'articles d\'horlogerie et de bijouterie en magasin spécialisé', groupe: '47.7' },
  '47.78': { label: 'Autre commerce de détail de biens neufs en magasin spécialisé', groupe: '47.7' },
  '47.79': { label: 'Commerce de détail de biens d\'occasion en magasin', groupe: '47.7' },
  '47.81': { label: 'Commerce de détail alimentaire sur éventaires et marchés', groupe: '47.8' },
  '47.82': { label: 'Commerce de détail de textiles, d\'habillement et de chaussures sur éventaires et marchés', groupe: '47.8' },
  '47.89': { label: 'Autres commerces de détail sur éventaires et marchés', groupe: '47.8' },
  '47.91': { label: 'Vente à distance', groupe: '47.9' },
  '47.99': { label: 'Autres commerces de détail hors magasin, éventaires ou marchés', groupe: '47.9' },
  // Hébergement restauration (Section I)
  '55.10': { label: 'Hôtels et hébergement similaire', groupe: '55.1' },
  '55.20': { label: 'Hébergement touristique et autre hébergement de courte durée', groupe: '55.2' },
  '55.30': { label: 'Terrains de camping et parcs pour caravanes ou véhicules de loisirs', groupe: '55.3' },
  '55.90': { label: 'Autres hébergements', groupe: '55.9' },
  '56.10': { label: 'Restaurants et services de restauration mobile', groupe: '56.1' },
  '56.21': { label: 'Services des traiteurs', groupe: '56.2' },
  '56.29': { label: 'Autres services de restauration', groupe: '56.2' },
  '56.30': { label: 'Débits de boissons', groupe: '56.3' },
  // Information et communication (Section J)
  '62.01': { label: 'Programmation informatique', groupe: '62.0' },
  '62.02': { label: 'Conseil informatique', groupe: '62.0' },
  '62.03': { label: 'Gestion d\'installations informatiques', groupe: '62.0' },
  '62.09': { label: 'Autres activités informatiques', groupe: '62.0' },
  '63.11': { label: 'Traitement de données, hébergement et activités connexes', groupe: '63.1' },
  '63.12': { label: 'Portails Internet', groupe: '63.1' },
  '63.91': { label: 'Activités des agences de presse', groupe: '63.9' },
  '63.99': { label: 'Autres services d\'information n.c.a.', groupe: '63.9' },
  // Activités immobilières (Section L)
  '68.10': { label: 'Activités des marchands de biens immobiliers', groupe: '68.1' },
  '68.20': { label: 'Location et exploitation de biens immobiliers propres ou loués', groupe: '68.2' },
  '68.31': { label: 'Agences immobilières', groupe: '68.3' },
  '68.32': { label: 'Administration de biens immobiliers', groupe: '68.3' },
  // Activités spécialisées (Section M)
  '69.10': { label: 'Activités juridiques', groupe: '69.1' },
  '69.20': { label: 'Activités comptables', groupe: '69.2' },
  '70.10': { label: 'Activités des sièges sociaux', groupe: '70.1' },
  '70.21': { label: 'Conseil en relations publiques et communication', groupe: '70.2' },
  '70.22': { label: 'Conseil pour les affaires et autres conseils de gestion', groupe: '70.2' },
  '71.11': { label: 'Activités d\'architecture', groupe: '71.1' },
  '71.12': { label: 'Activités d\'ingénierie', groupe: '71.1' },
  '71.20': { label: 'Activités de contrôle et analyses techniques', groupe: '71.2' },
  '73.11': { label: 'Activités des agences de publicité', groupe: '73.1' },
  '73.12': { label: 'Régie publicitaire de médias', groupe: '73.1' },
  '73.20': { label: 'Études de marché et sondages', groupe: '73.2' },
  '74.10': { label: 'Activités spécialisées de design', groupe: '74.1' },
  '74.20': { label: 'Activités photographiques', groupe: '74.2' },
  '74.30': { label: 'Traduction et interprétation', groupe: '74.3' },
  '74.90': { label: 'Autres activités spécialisées, scientifiques et techniques n.c.a.', groupe: '74.9' },
  '75.00': { label: 'Activités vétérinaires', groupe: '75.0' },
  // Services administratifs (Section N)
  '81.10': { label: 'Activités combinées de soutien lié aux bâtiments', groupe: '81.1' },
  '81.21': { label: 'Nettoyage courant des bâtiments', groupe: '81.2' },
  '81.22': { label: 'Autres activités de nettoyage des bâtiments et nettoyage industriel', groupe: '81.2' },
  '81.29': { label: 'Autres activités de nettoyage', groupe: '81.2' },
  '81.30': { label: 'Services d\'aménagement paysager', groupe: '81.3' },
  '82.11': { label: 'Services administratifs combinés de bureau', groupe: '82.1' },
  '82.19': { label: 'Photocopie, préparation de documents et autres activités spécialisées de soutien de bureau', groupe: '82.1' },
  '82.20': { label: 'Activités de centres d\'appels', groupe: '82.2' },
  '82.30': { label: 'Organisation de foires, salons professionnels et congrès', groupe: '82.3' },
  '82.91': { label: 'Activités des agences de recouvrement de factures et des sociétés d\'information financière', groupe: '82.9' },
  '82.92': { label: 'Activités de conditionnement', groupe: '82.9' },
  '82.99': { label: 'Autres activités de soutien aux entreprises n.c.a.', groupe: '82.9' },
  // Santé (Section Q)
  '86.10': { label: 'Activités hospitalières', groupe: '86.1' },
  '86.21': { label: 'Activité des médecins généralistes', groupe: '86.2' },
  '86.22': { label: 'Activité des médecins spécialistes', groupe: '86.2' },
  '86.23': { label: 'Pratique dentaire', groupe: '86.2' },
  '86.90': { label: 'Autres activités pour la santé humaine', groupe: '86.9' },
  '87.10': { label: 'Hébergement médicalisé', groupe: '87.1' },
  '87.20': { label: 'Hébergement social pour personnes handicapées mentales, malades mentales et toxicomanes', groupe: '87.2' },
  '87.30': { label: 'Hébergement social pour personnes âgées ou handicapées physiques', groupe: '87.3' },
  '87.90': { label: 'Autres activités d\'hébergement social', groupe: '87.9' },
  '88.10': { label: 'Action sociale sans hébergement pour personnes âgées et pour personnes handicapées', groupe: '88.1' },
  '88.91': { label: 'Action sociale sans hébergement pour jeunes enfants', groupe: '88.9' },
  '88.99': { label: 'Autre action sociale sans hébergement n.c.a.', groupe: '88.9' },
  // Services personnels (Section S)
  '96.01': { label: 'Blanchisserie-teinturerie', groupe: '96.0' },
  '96.02': { label: 'Coiffure et soins de beauté', groupe: '96.0' },
  '96.03': { label: 'Services funéraires', groupe: '96.0' },
  '96.04': { label: 'Entretien corporel', groupe: '96.0' },
  '96.09': { label: 'Autres services personnels n.c.a.', groupe: '96.0' },
};

// Émojis par division (basés sur la thématique)
export const DIVISION_EMOJIS: Record<string, string> = {
  // Agriculture, sylviculture et pêche (01-03)
  '01': '🌾', '02': '🌲', '03': '🐟',
  // Industries extractives (05-09)
  '05': '⛏️', '06': '🛢️', '07': '⚒️', '08': '🪨', '09': '⛏️',
  // Industrie manufacturière (10-33)
  '10': '🍖', '11': '🍷', '12': '🚬', '13': '🧵', '14': '👔',
  '15': '👞', '16': '🪵', '17': '📄', '18': '🖨️', '19': '⛽',
  '20': '🧪', '21': '💊', '22': '🔧', '23': '🧱', '24': '⚙️',
  '25': '🔩', '26': '💻', '27': '🔌', '28': '⚙️', '29': '🚗',
  '30': '✈️', '31': '🪑', '32': '💎', '33': '🔧',
  // Électricité, gaz (35)
  '35': '⚡',
  // Eau, déchets (36-39)
  '36': '💧', '37': '🚿', '38': '♻️', '39': '🧹',
  // Construction (41-43)
  '41': '🏗️', '42': '🛤️', '43': '🔨',
  // Commerce (45-47)
  '45': '🚙', '46': '📦', '47': '🛒',
  // Transports (49-53)
  '49': '🚚', '50': '🚢', '51': '✈️', '52': '🏭', '53': '📮',
  // Hébergement, restauration (55-56)
  '55': '🏨', '56': '🍽️',
  // Information, communication (58-63)
  '58': '📚', '59': '🎬', '60': '📺', '61': '📡', '62': '💻', '63': '🌐',
  // Finance, assurance (64-66)
  '64': '🏦', '65': '🛡️', '66': '💹',
  // Immobilier (68)
  '68': '🏠',
  // Activités spécialisées (69-75)
  '69': '⚖️', '70': '📊', '71': '📐', '72': '🔬', '73': '📢', '74': '🎨', '75': '🐕',
  // Services administratifs (77-82)
  '77': '🚐', '78': '👥', '79': '✈️', '80': '🔒', '81': '🧹', '82': '📋',
  // Administration publique (84)
  '84': '🏛️',
  // Enseignement (85)
  '85': '🎓',
  // Santé, social (86-88)
  '86': '🏥', '87': '🏠', '88': '🤝',
  // Arts, loisirs (90-93)
  '90': '🎭', '91': '🏛️', '92': '🎰', '93': '⚽',
  // Autres services (94-96)
  '94': '🤝', '95': '🔧', '96': '💇',
  // Ménages employeurs (97-98)
  '97': '🏡', '98': '🏡',
  // Extra-territorial (99)
  '99': '🌍',
};

export function getDivisionEmoji(division: string): string {
  return DIVISION_EMOJIS[division] || '📁';
}

// Fonctions utilitaires
export function getSectionFromDivision(division: string): string | null {
  return NAF_DIVISIONS[division]?.section || null;
}

export function getDivisionFromGroupe(groupe: string): string | null {
  return NAF_GROUPES[groupe]?.division || null;
}

export function getGroupeFromClasse(classe: string): string | null {
  return NAF_CLASSES[classe]?.groupe || null;
}

export function getSectionLabel(section: string): string {
  return NAF_SECTIONS[section]?.label || section;
}

export function getDivisionLabel(division: string): string {
  return NAF_DIVISIONS[division]?.label || `Division ${division}`;
}

export function getGroupeLabel(groupe: string): string {
  return NAF_GROUPES[groupe]?.label || `Groupe ${groupe}`;
}

export function getClasseLabel(classe: string): string {
  return NAF_CLASSES[classe]?.label || `Classe ${classe}`;
}

export function getSectionEmoji(section: string): string {
  return NAF_SECTIONS[section]?.emoji || '📁';
}

// Dérive la hiérarchie complète d'un code NAF
export function getNafHierarchy(codeNaf: string): {
  section: string | null;
  division: string | null;
  groupe: string | null;
  classe: string | null;
  sousClasse: string;
} {
  const division = codeNaf.substring(0, 2);
  const groupe = codeNaf.substring(0, 4);
  const classe = codeNaf.substring(0, 5);
  
  return {
    section: NAF_DIVISIONS[division]?.section || null,
    division,
    groupe,
    classe,
    sousClasse: codeNaf
  };
}
