// Système de catégorisation ultra-précis pour entreprises
// Référentiel unique pour "créations" et "nouveaux sites"

export interface DetailedCategory {
  key: string;
  label: string;
  emoji: string;
  nafCodes: string[];
  keywords: string[];
}

export const DETAILED_CATEGORIES: DetailedCategory[] = [
  // 🌾 AGRICULTURE
  { key: 'agriculture-cultures', label: 'Cultures & Maraîchage', emoji: '🌾', nafCodes: ['01.1', '01.2'], keywords: ['culture', 'maraîchage', 'céréales', 'légumes'] },
  { key: 'agriculture-elevage', label: 'Élevage', emoji: '🐄', nafCodes: ['01.4', '01.5'], keywords: ['élevage', 'bovins', 'porcins', 'volailles'] },
  { key: 'agriculture-viticole', label: 'Viticulture', emoji: '🍇', nafCodes: ['01.21'], keywords: ['vigne', 'viticole', 'vin', 'viticulture'] },
  { key: 'agriculture-forestier', label: 'Forestier & Sylviculture', emoji: '🌲', nafCodes: ['02'], keywords: ['forêt', 'bois', 'sylviculture'] },
  { key: 'agriculture-peche', label: 'Pêche & Aquaculture', emoji: '🐟', nafCodes: ['03'], keywords: ['pêche', 'aquaculture', 'poisson'] },

  // 🍞 ALIMENTAIRE
  { key: 'alimentaire-boulangerie', label: 'Boulangeries & Pâtisseries', emoji: '🥖', nafCodes: ['10.71'], keywords: ['boulangerie', 'pâtisserie', 'pain', 'viennoiserie'] },
  { key: 'alimentaire-boucherie', label: 'Boucheries & Charcuteries', emoji: '🥩', nafCodes: ['10.11', '10.13'], keywords: ['boucherie', 'charcuterie', 'viande'] },
  { key: 'alimentaire-laiterie', label: 'Produits laitiers', emoji: '🧀', nafCodes: ['10.51'], keywords: ['laiterie', 'fromage', 'yaourt', 'crème'] },
  { key: 'alimentaire-boissons', label: 'Boissons', emoji: '🥤', nafCodes: ['11'], keywords: ['boisson', 'jus', 'eau', 'soda'] },
  { key: 'alimentaire-conserves', label: 'Conserves & Plats préparés', emoji: '🥫', nafCodes: ['10.39', '10.85'], keywords: ['conserve', 'plat', 'préparé'] },
  { key: 'alimentaire-confiserie', label: 'Confiserie & Chocolaterie', emoji: '🍫', nafCodes: ['10.82'], keywords: ['chocolat', 'confiserie', 'bonbon'] },

  // 👕 TEXTILE & MODE
  { key: 'textile-confection', label: 'Confection & Vêtements', emoji: '👔', nafCodes: ['13', '14'], keywords: ['textile', 'vêtement', 'confection', 'habit'] },
  { key: 'textile-cuir', label: 'Maroquinerie & Cuir', emoji: '👜', nafCodes: ['15'], keywords: ['cuir', 'maroquinerie', 'sac', 'chaussure'] },

  // 🏗️ CONSTRUCTION & BTP
  { key: 'btp-gros-oeuvre', label: 'Gros œuvre & Maçonnerie', emoji: '🧱', nafCodes: ['41', '43.99'], keywords: ['maçonnerie', 'gros oeuvre', 'fondation', 'béton'] },
  { key: 'btp-charpente', label: 'Charpente & Couverture', emoji: '🏚️', nafCodes: ['43.91'], keywords: ['charpente', 'couverture', 'toiture', 'zinguerie'] },
  { key: 'btp-menuiserie', label: 'Menuiserie', emoji: '🪵', nafCodes: ['16', '43.32'], keywords: ['menuiserie', 'menuisier', 'fenêtre', 'porte'] },
  { key: 'btp-plomberie', label: 'Plomberie & Chauffage', emoji: '🚰', nafCodes: ['43.22'], keywords: ['plomberie', 'plombier', 'chauffage', 'sanitaire'] },
  { key: 'btp-electricite', label: 'Électricité', emoji: '⚡', nafCodes: ['43.21'], keywords: ['électricité', 'électricien', 'électrique'] },
  { key: 'btp-peinture', label: 'Peinture & Finitions', emoji: '🎨', nafCodes: ['43.34'], keywords: ['peinture', 'peintre', 'finition'] },
  { key: 'btp-terrassement', label: 'Terrassement & VRD', emoji: '🚜', nafCodes: ['42', '43.12'], keywords: ['terrassement', 'vrd', 'voirie'] },

  // 🚗 AUTOMOBILE
  { key: 'auto-concessionnaire', label: 'Concessionnaires', emoji: '🚗', nafCodes: ['45.11'], keywords: ['concessionnaire', 'vente', 'voiture', 'automobile'] },
  { key: 'auto-garage', label: 'Garages & Réparation', emoji: '🔧', nafCodes: ['45.20'], keywords: ['garage', 'réparation', 'mécanique', 'entretien'] },
  { key: 'auto-carrosserie', label: 'Carrosseries', emoji: '🎨', nafCodes: ['45.20B'], keywords: ['carrosserie', 'peinture', 'carrossier'] },
  { key: 'auto-pieces', label: 'Pièces détachées', emoji: '⚙️', nafCodes: ['45.31', '45.32'], keywords: ['pièce', 'détachée', 'accessoire'] },

  // 🛒 COMMERCE DE DÉTAIL
  { key: 'commerce-supermarche', label: 'Supermarchés & Hypermarchés', emoji: '🏪', nafCodes: ['47.11'], keywords: ['supermarché', 'hypermarché', 'grande surface'] },
  { key: 'commerce-alimentation', label: 'Alimentation générale', emoji: '🍎', nafCodes: ['47.2'], keywords: ['épicerie', 'alimentation', 'primeur'] },
  { key: 'commerce-pharmacie', label: 'Pharmacies', emoji: '💊', nafCodes: ['47.73'], keywords: ['pharmacie', 'pharmacien', 'médicament'] },
  { key: 'commerce-optique', label: 'Opticiens', emoji: '👓', nafCodes: ['47.78A'], keywords: ['optique', 'opticien', 'lunette'] },
  { key: 'commerce-bricolage', label: 'Bricolage & Jardinerie', emoji: '🔨', nafCodes: ['47.52'], keywords: ['bricolage', 'jardinerie', 'outillage'] },
  { key: 'commerce-electromenager', label: 'Électroménager & Multimédia', emoji: '📱', nafCodes: ['47.4', '47.5'], keywords: ['électroménager', 'informatique', 'téléphone'] },
  { key: 'commerce-meuble', label: 'Meubles & Décoration', emoji: '🛋️', nafCodes: ['47.59'], keywords: ['meuble', 'décoration', 'ameublement'] },
  { key: 'commerce-vetement', label: 'Vêtements & Accessoires', emoji: '👗', nafCodes: ['47.71'], keywords: ['vêtement', 'mode', 'prêt-à-porter'] },
  { key: 'commerce-chaussure', label: 'Chaussures', emoji: '👟', nafCodes: ['47.72'], keywords: ['chaussure', 'basket', 'bottier'] },
  { key: 'commerce-bijouterie', label: 'Bijouteries & Horlogeries', emoji: '💍', nafCodes: ['47.77'], keywords: ['bijouterie', 'horlogerie', 'bijou'] },
  { key: 'commerce-librairie', label: 'Librairies & Presse', emoji: '📚', nafCodes: ['47.61', '47.62'], keywords: ['librairie', 'presse', 'livre'] },
  { key: 'commerce-fleuriste', label: 'Fleuristes', emoji: '💐', nafCodes: ['47.76'], keywords: ['fleuriste', 'fleur', 'bouquet'] },
  { key: 'commerce-tabac', label: 'Tabac & Presse', emoji: '🚬', nafCodes: ['47.26'], keywords: ['tabac', 'presse', 'cigarette'] },

  // 📦 COMMERCE DE GROS
  { key: 'gros-alimentaire', label: 'Grossistes Alimentaires', emoji: '🚚', nafCodes: ['46.3'], keywords: ['grossiste', 'alimentaire', 'cash'] },
  { key: 'gros-materiel', label: 'Matériaux & Équipements', emoji: '📦', nafCodes: ['46.7'], keywords: ['matériaux', 'négoce', 'fourniture'] },
  { key: 'gros-produits', label: 'Produits manufacturés', emoji: '📋', nafCodes: ['46.4', '46.5'], keywords: ['produit', 'distribution'] },

  // 🏨 HÔTELLERIE & RESTAURATION
  { key: 'resto-restaurant', label: 'Restaurants traditionnels', emoji: '🍽️', nafCodes: ['56.10A'], keywords: ['restaurant', 'gastronomie', 'table'] },
  { key: 'resto-fastfood', label: 'Restauration rapide', emoji: '🍔', nafCodes: ['56.10C'], keywords: ['fast food', 'snack', 'burger', 'sandwich'] },
  { key: 'resto-cafeteria', label: 'Cafétérias & Self-service', emoji: '🍱', nafCodes: ['56.10B'], keywords: ['cafétéria', 'self', 'cantine'] },
  { key: 'resto-traiteur', label: 'Traiteurs', emoji: '🎂', nafCodes: ['56.21'], keywords: ['traiteur', 'événement', 'buffet'] },
  { key: 'resto-bar', label: 'Bars & Cafés', emoji: '☕', nafCodes: ['56.30'], keywords: ['bar', 'café', 'brasserie', 'pub'] },
  { key: 'hotellerie-hotel', label: 'Hôtels', emoji: '🏨', nafCodes: ['55.10'], keywords: ['hôtel', 'hébergement', 'chambre'] },

  // 🚚 TRANSPORT & LOGISTIQUE
  { key: 'transport-routier', label: 'Transport routier marchandises', emoji: '🚛', nafCodes: ['49.41'], keywords: ['transport', 'routier', 'marchandise', 'messagerie'] },
  { key: 'transport-demenagement', label: 'Déménagement', emoji: '📦', nafCodes: ['49.42'], keywords: ['déménagement', 'déménageur'] },
  { key: 'transport-taxi', label: 'Taxis & VTC', emoji: '🚕', nafCodes: ['49.32'], keywords: ['taxi', 'vtc', 'transport', 'personne'] },
  { key: 'transport-logistique', label: 'Entreposage & Logistique', emoji: '🏭', nafCodes: ['52'], keywords: ['entrepôt', 'logistique', 'stockage'] },

  // 💻 INFORMATIQUE & DIGITAL
  { key: 'info-developpement', label: 'Développement logiciel', emoji: '👨‍💻', nafCodes: ['62.01'], keywords: ['développement', 'logiciel', 'programmation', 'dev'] },
  { key: 'info-conseil', label: 'Conseil informatique', emoji: '🖥️', nafCodes: ['62.02'], keywords: ['conseil', 'consulting', 'it', 'informatique'] },
  { key: 'info-webagency', label: 'Web & Digital', emoji: '🌐', nafCodes: ['62.01', '73.11'], keywords: ['web', 'digital', 'site', 'agence'] },
  { key: 'info-hebergement', label: 'Hébergement & Cloud', emoji: '☁️', nafCodes: ['63.11'], keywords: ['hébergement', 'cloud', 'serveur'] },

  // 💰 FINANCE & ASSURANCE
  { key: 'finance-banque', label: 'Banques', emoji: '🏦', nafCodes: ['64.1'], keywords: ['banque', 'crédit', 'bancaire'] },
  { key: 'finance-assurance', label: 'Assurances', emoji: '🛡️', nafCodes: ['65'], keywords: ['assurance', 'mutuelle', 'assureur'] },
  { key: 'finance-holding', label: 'Holdings & Gestion', emoji: '💼', nafCodes: ['64.2', '70.10'], keywords: ['holding', 'gestion', 'portefeuille'] },
  { key: 'finance-comptable', label: 'Cabinets comptables', emoji: '📊', nafCodes: ['69.20'], keywords: ['comptable', 'expertise', 'compta'] },

  // 🏢 IMMOBILIER
  { key: 'immo-agence', label: 'Agences immobilières', emoji: '🏠', nafCodes: ['68.31'], keywords: ['agence', 'immobilier', 'transaction'] },
  { key: 'immo-syndic', label: 'Syndics & Gestion', emoji: '🏢', nafCodes: ['68.32'], keywords: ['syndic', 'gestion', 'copropriété'] },
  { key: 'immo-promotion', label: 'Promotion immobilière', emoji: '🏗️', nafCodes: ['41.10'], keywords: ['promotion', 'promoteur', 'construction'] },
  { key: 'immo-location', label: 'Location immobilière', emoji: '🔑', nafCodes: ['68.20'], keywords: ['location', 'bailleur'] },

  // ⚖️ JURIDIQUE & CONSEIL
  { key: 'juridique-avocat', label: 'Cabinets d\'avocats', emoji: '⚖️', nafCodes: ['69.10'], keywords: ['avocat', 'juridique', 'droit'] },
  { key: 'juridique-notaire', label: 'Notaires', emoji: '📜', nafCodes: ['69.10'], keywords: ['notaire', 'notariat'] },
  { key: 'conseil-management', label: 'Conseil en management', emoji: '💡', nafCodes: ['70.22'], keywords: ['conseil', 'consulting', 'stratégie'] },

  // 📐 ARCHITECTURE & INGÉNIERIE
  { key: 'archi-architecture', label: 'Architectes', emoji: '📐', nafCodes: ['71.11'], keywords: ['architecte', 'architecture', 'plan'] },
  { key: 'archi-bureau-etudes', label: 'Bureaux d\'études', emoji: '📋', nafCodes: ['71.12'], keywords: ['bureau', 'étude', 'ingénierie'] },
  { key: 'archi-geometre', label: 'Géomètres', emoji: '📏', nafCodes: ['71.12A'], keywords: ['géomètre', 'topographie'] },

  // 🎓 ENSEIGNEMENT & FORMATION
  { key: 'formation-ecole', label: 'Écoles & Formations', emoji: '🏫', nafCodes: ['85'], keywords: ['école', 'formation', 'enseignement'] },
  { key: 'formation-conduite', label: 'Auto-écoles', emoji: '🚗', nafCodes: ['85.53'], keywords: ['auto-école', 'conduite', 'permis'] },
  { key: 'formation-professionnelle', label: 'Formation professionnelle', emoji: '📚', nafCodes: ['85.59'], keywords: ['formation', 'professionnel', 'continue'] },

  // 🏥 SANTÉ & MÉDICAL
  { key: 'sante-medecin', label: 'Médecins généralistes', emoji: '👨‍⚕️', nafCodes: ['86.21'], keywords: ['médecin', 'généraliste', 'docteur'] },
  { key: 'sante-dentiste', label: 'Dentistes', emoji: '🦷', nafCodes: ['86.23'], keywords: ['dentiste', 'dentaire', 'orthodontie'] },
  { key: 'sante-kine', label: 'Kinésithérapeutes', emoji: '💆', nafCodes: ['86.90'], keywords: ['kinésithérapeute', 'kiné', 'ostéopathe'] },
  { key: 'sante-infirmier', label: 'Infirmiers', emoji: '💉', nafCodes: ['86.90'], keywords: ['infirmier', 'infirmière', 'soin'] },
  { key: 'sante-labo', label: 'Laboratoires d\'analyses', emoji: '🔬', nafCodes: ['86.90'], keywords: ['laboratoire', 'analyse', 'médical'] },
  { key: 'sante-clinique', label: 'Cliniques & Hôpitaux', emoji: '🏥', nafCodes: ['86.10'], keywords: ['clinique', 'hôpital', 'centre'] },
  { key: 'sante-ehpad', label: 'EHPAD & Résidences', emoji: '🏡', nafCodes: ['87'], keywords: ['ehpad', 'résidence', 'maison', 'retraite'] },

  // 🔧 SERVICES PERSONNELS
  { key: 'service-coiffeur', label: 'Coiffeurs', emoji: '💇', nafCodes: ['96.02'], keywords: ['coiffeur', 'coiffure', 'salon'] },
  { key: 'service-esthetique', label: 'Esthétique & Beauté', emoji: '💅', nafCodes: ['96.02'], keywords: ['esthétique', 'beauté', 'spa', 'onglerie'] },
  { key: 'service-pressing', label: 'Pressings & Blanchisseries', emoji: '👔', nafCodes: ['96.01'], keywords: ['pressing', 'blanchisserie', 'nettoyage'] },
  { key: 'service-reparation', label: 'Réparations diverses', emoji: '🔧', nafCodes: ['95'], keywords: ['réparation', 'dépannage'] },

  // 🏃 SPORT & LOISIRS
  { key: 'sport-salle', label: 'Salles de sport', emoji: '🏋️', nafCodes: ['93.13'], keywords: ['sport', 'fitness', 'musculation', 'salle'] },
  { key: 'sport-piscine', label: 'Piscines & Aquatique', emoji: '🏊', nafCodes: ['93.11'], keywords: ['piscine', 'aquatique', 'natation'] },
  { key: 'loisirs-cinema', label: 'Cinémas', emoji: '🎬', nafCodes: ['59.14'], keywords: ['cinéma', 'film', 'multiplex'] },

  // 🎨 CULTURE & SPECTACLE
  { key: 'culture-spectacle', label: 'Spectacles & Événementiel', emoji: '🎭', nafCodes: ['90'], keywords: ['spectacle', 'événement', 'concert'] },
  { key: 'culture-musee', label: 'Musées & Patrimoine', emoji: '🏛️', nafCodes: ['91'], keywords: ['musée', 'patrimoine', 'exposition'] },

  // ⚡ ÉNERGIE
  { key: 'energie-electricite', label: 'Production électricité', emoji: '⚡', nafCodes: ['35.11'], keywords: ['électricité', 'production', 'énergie'] },
  { key: 'energie-renouvelable', label: 'Énergies renouvelables', emoji: '☀️', nafCodes: ['35.11', '35.14'], keywords: ['solaire', 'éolien', 'renouvelable', 'photovoltaïque'] },
  { key: 'energie-gaz', label: 'Gaz & Réseaux', emoji: '🔥', nafCodes: ['35.2'], keywords: ['gaz', 'réseau', 'distribution'] },

  // 📋 SERVICES AUX ENTREPRISES
  { key: 'service-interim', label: 'Intérim & Recrutement', emoji: '👥', nafCodes: ['78'], keywords: ['intérim', 'recrutement', 'travail', 'temporaire'] },
  { key: 'service-nettoyage', label: 'Nettoyage & Entretien', emoji: '🧹', nafCodes: ['81.2'], keywords: ['nettoyage', 'entretien', 'propreté'] },
  { key: 'service-securite', label: 'Sécurité & Gardiennage', emoji: '🛡️', nafCodes: ['80.1'], keywords: ['sécurité', 'gardiennage', 'surveillance'] },
  { key: 'service-publicite', label: 'Publicité & Marketing', emoji: '📢', nafCodes: ['73'], keywords: ['publicité', 'marketing', 'communication'] },

  // ⚙️ INDUSTRIE
  { key: 'industrie-metallurgie', label: 'Métallurgie & Chaudronnerie', emoji: '⚙️', nafCodes: ['24', '25'], keywords: ['métallurgie', 'chaudronnerie', 'mécanique'] },
  { key: 'industrie-plastique', label: 'Plasturgie', emoji: '♻️', nafCodes: ['22'], keywords: ['plastique', 'plasturgie', 'injection'] },
  { key: 'industrie-chimie', label: 'Chimie', emoji: '🧪', nafCodes: ['20'], keywords: ['chimie', 'chimique', 'produit'] },
  { key: 'industrie-electronique', label: 'Électronique', emoji: '🔌', nafCodes: ['26', '27'], keywords: ['électronique', 'composant', 'circuit'] },
];

// Mapping des catégories qualifiées (Créations) → catégories détaillées
export const QUALIF_TO_DETAILED: Record<string, string> = {
  'immobilier': 'immo-agence',
  'holding': 'finance-holding',
  'commerce-detail': 'commerce-alimentation',
  'conseil-consulting': 'conseil-management',
  'commerce-gros': 'gros-produits',
  'informatique-dev': 'info-developpement',
  'restauration': 'resto-restaurant',
  'agriculture': 'agriculture-cultures',
  'artisanat-reparation': 'service-reparation',
  'energie-renouvelable': 'energie-renouvelable',
  'maconnerie': 'btp-gros-oeuvre',
  'digital-web': 'info-webagency',
  'education-formation': 'formation-professionnelle',
  'industrie-fabrication': 'industrie-metallurgie',
  'snack-fastfood': 'resto-fastfood',
  'sante-medical': 'sante-medecin',
  'transport-marchandises': 'transport-routier',
  'beaute-coiffure': 'service-coiffeur',
  'services-personne': 'service-nettoyage',
  'finance-assurance': 'finance-assurance',
};

// Fonction pour trouver la catégorie à partir d'un code NAF complet
export function getCategoryFromNaf(codeNaf: string): string | null {
  if (!codeNaf) return null;
  
  // Tester avec le code complet (ex: "47.73Z")
  for (const cat of DETAILED_CATEGORIES) {
    for (const nafCode of cat.nafCodes) {
      if (codeNaf.startsWith(nafCode)) {
        return cat.key;
      }
    }
  }
  
  return null;
}

// Fonction pour trouver les catégories à partir d'une requête métier
export function findCategoriesByQuery(query: string): DetailedCategory[] {
  const normalizedQuery = query.toLowerCase().trim();
  
  return DETAILED_CATEGORIES.filter(cat => {
    // Recherche dans le label
    if (cat.label.toLowerCase().includes(normalizedQuery)) return true;
    
    // Recherche dans les mots-clés
    return cat.keywords.some(keyword => 
      keyword.toLowerCase().includes(normalizedQuery) ||
      normalizedQuery.includes(keyword.toLowerCase())
    );
  });
}

// Fonction pour obtenir les codes NAF d'une requête métier
export function getNafCodesFromQuery(query: string): string[] {
  const categories = findCategoriesByQuery(query);
  return categories.flatMap(cat => cat.nafCodes);
}

// Fonction pour obtenir les mots-clés d'une requête métier
export function getKeywordsFromQuery(query: string): string[] {
  const categories = findCategoriesByQuery(query);
  return [...new Set(categories.flatMap(cat => cat.keywords))];
}

// Export de toutes les catégories par clé pour faciliter l'accès
export const CATEGORIES_BY_KEY = DETAILED_CATEGORIES.reduce((acc, cat) => {
  acc[cat.key] = cat;
  return acc;
}, {} as Record<string, DetailedCategory>);
