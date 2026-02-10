/**
 * Catégories NAF simplifiées et claires pour les filtres
 * Basées sur les grands secteurs d'activité
 */

export interface CategorieNAFSimplifiee {
  id: string;
  label: string;
  emoji: string;
  description: string;
  divisions: string[]; // Codes NAF division (2 chiffres)
  sections: string[];  // Codes NAF section (1 lettre)
}

export const CATEGORIES_NAF_SIMPLIFIEES: CategorieNAFSimplifiee[] = [
  {
    id: 'commerce',
    label: 'Commerce & Distribution',
    emoji: '🛒',
    description: 'Commerce de gros, détail, grande distribution',
    divisions: ['45', '46', '47'],
    sections: ['G']
  },
  {
    id: 'construction',
    label: 'BTP & Construction',
    emoji: '🏗️',
    description: 'Construction, travaux publics, bâtiment',
    divisions: ['41', '42', '43'],
    sections: ['F']
  },
  {
    id: 'services_entreprises',
    label: 'Services aux Entreprises',
    emoji: '💼',
    description: 'Conseil, comptabilité, juridique, marketing, RH',
    divisions: ['69', '70', '71', '72', '73', '74', '78', '82'],
    sections: ['M', 'N']
  },
  {
    id: 'industrie',
    label: 'Industrie & Production',
    emoji: '🏭',
    description: 'Fabrication, production industrielle',
    divisions: ['10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31', '32', '33'],
    sections: ['C']
  },
  {
    id: 'transport',
    label: 'Transport & Logistique',
    emoji: '🚚',
    description: 'Transport routier, messagerie, entreposage',
    divisions: ['49', '50', '51', '52', '53'],
    sections: ['H']
  },
  {
    id: 'restauration',
    label: 'Hôtellerie & Restauration',
    emoji: '🍽️',
    description: 'Restaurants, hôtels, hébergement, cafés',
    divisions: ['55', '56'],
    sections: ['I']
  },
  {
    id: 'sante',
    label: 'Santé & Action Sociale',
    emoji: '⚕️',
    description: 'Médical, paramédical, social, EHPAD',
    divisions: ['86', '87', '88'],
    sections: ['Q']
  },
  {
    id: 'informatique',
    label: 'Informatique & Télécoms',
    emoji: '💻',
    description: 'IT, développement, télécommunications',
    divisions: ['58', '59', '60', '61', '62', '63'],
    sections: ['J']
  },
  {
    id: 'immobilier',
    label: 'Immobilier',
    emoji: '🏢',
    description: 'Agences immobilières, promotion, location',
    divisions: ['68'],
    sections: ['L']
  },
  {
    id: 'finance',
    label: 'Finance & Assurance',
    emoji: '💰',
    description: 'Banques, assurances, activités financières',
    divisions: ['64', '65', '66'],
    sections: ['K']
  },
  {
    id: 'services_personnels',
    label: 'Services aux Particuliers',
    emoji: '✨',
    description: 'Coiffure, beauté, réparation, services à domicile',
    divisions: ['95', '96'],
    sections: ['S']
  },
  {
    id: 'agriculture',
    label: 'Agriculture & Alimentation',
    emoji: '🌾',
    description: 'Agriculture, élevage, sylviculture, pêche',
    divisions: ['01', '02', '03'],
    sections: ['A']
  },
  {
    id: 'energie',
    label: 'Énergie & Environnement',
    emoji: '⚡',
    description: 'Électricité, gaz, eau, déchets, recyclage',
    divisions: ['35', '36', '37', '38', '39'],
    sections: ['D', 'E']
  },
  {
    id: 'education',
    label: 'Enseignement & Formation',
    emoji: '🎓',
    description: 'Écoles, formations, cours particuliers',
    divisions: ['85'],
    sections: ['P']
  },
  {
    id: 'culture',
    label: 'Culture, Sport & Loisirs',
    emoji: '🎭',
    description: 'Arts, spectacles, sport, loisirs, divertissement',
    divisions: ['90', '91', '92', '93'],
    sections: ['R']
  },
  {
    id: 'autres',
    label: 'Autres Activités',
    emoji: '📋',
    description: 'Activités diverses non classées',
    divisions: ['97', '98', '99'],
    sections: ['T', 'U']
  }
];

/**
 * Trouve la catégorie simplifiée d'un code NAF division
 */
export function getCategorieFromDivision(division: string): CategorieNAFSimplifiee | null {
  return CATEGORIES_NAF_SIMPLIFIEES.find(cat => 
    cat.divisions.includes(division)
  ) || null;
}

/**
 * Trouve la catégorie simplifiée d'un code NAF section
 */
export function getCategorieFromSection(section: string): CategorieNAFSimplifiee | null {
  return CATEGORIES_NAF_SIMPLIFIEES.find(cat => 
    cat.sections.includes(section)
  ) || null;
}

/**
 * Obtient toutes les divisions d'une catégorie
 */
export function getDivisionsForCategorie(categorieId: string): string[] {
  const categorie = CATEGORIES_NAF_SIMPLIFIEES.find(cat => cat.id === categorieId);
  return categorie?.divisions || [];
}

/**
 * Obtient toutes les sections d'une catégorie
 */
export function getSectionsForCategorie(categorieId: string): string[] {
  const categorie = CATEGORIES_NAF_SIMPLIFIEES.find(cat => cat.id === categorieId);
  return categorie?.sections || [];
}
