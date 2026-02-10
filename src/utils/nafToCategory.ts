// Système de catégorisation automatique basé sur le code NAF
// Assure que 100% des prospects ont une catégorie

import { DETAILED_CATEGORIES, DetailedCategory } from './detailedCategories';

// Map de correspondance NAF → Catégorie (optimisée pour la performance)
const NAF_TO_CATEGORY_MAP = new Map<string, string>();

// Construction du map au chargement du module
DETAILED_CATEGORIES.forEach(category => {
  category.nafCodes.forEach(nafCode => {
    NAF_TO_CATEGORY_MAP.set(nafCode, category.key);
  });
});

/**
 * Trouve la catégorie détaillée d'un prospect selon son code NAF
 * Garantit qu'un résultat est toujours retourné (jamais null)
 */
export function getCategoryFromNaf(codeNaf: string | null | undefined): string {
  if (!codeNaf || codeNaf === '' || codeNaf === 'null') {
    return 'autre'; // Catégorie par défaut
  }

  // Normaliser le code NAF (supprimer les caractères non numériques sauf le point)
  const normalized = codeNaf.trim().toUpperCase().replace(/[^0-9.]/g, '');
  
  // 1. Chercher une correspondance exacte
  if (NAF_TO_CATEGORY_MAP.has(normalized)) {
    return NAF_TO_CATEGORY_MAP.get(normalized)!;
  }

  // 2. Chercher par préfixe - du plus long au plus court
  // Cela permet de matcher "47.73Z" avec "47.73" ou "47.7" ou "47"
  for (const [nafCode, category] of NAF_TO_CATEGORY_MAP.entries()) {
    if (normalized.startsWith(nafCode)) {
      return category;
    }
  }

  // 3. Essayer avec les 2 premiers chiffres uniquement (division NAF)
  // Ex: "47.73Z" → "47"
  if (normalized.length >= 2) {
    const division = normalized.substring(0, 2);
    for (const [nafCode, category] of NAF_TO_CATEGORY_MAP.entries()) {
      // Chercher un code NAF qui commence par cette division
      if (nafCode.startsWith(division)) {
        return category;
      }
    }
  }

  // 4. Si toujours rien, mapper par division NAF sur les grands secteurs
  const division = normalized.substring(0, 2);
  
  // Mapping direct des divisions NAF vers secteurs
  const divisionToSector: Record<string, string> = {
    '01': 'agriculture-cultures', '02': 'agriculture-forestier', '03': 'agriculture-peche',
    '10': 'alimentaire-conserves', '11': 'alimentaire-boissons',
    '13': 'textile-confection', '14': 'textile-confection', '15': 'textile-cuir',
    '16': 'btp-menuiserie', '17': 'industrie-plastique', '18': 'industrie-electronique',
    '20': 'industrie-chimie', '21': 'industrie-chimie', '22': 'industrie-plastique',
    '23': 'industrie-metallurgie', '24': 'industrie-metallurgie', '25': 'industrie-metallurgie',
    '26': 'industrie-electronique', '27': 'industrie-electronique', '28': 'industrie-metallurgie',
    '41': 'btp-gros-oeuvre', '42': 'btp-terrassement', '43': 'btp-gros-oeuvre',
    '45': 'auto-garage', '46': 'gros-produits', '47': 'commerce-alimentation',
    '49': 'transport-routier', '50': 'transport-logistique', '52': 'transport-logistique', '53': 'transport-routier',
    '55': 'hotellerie-hotel', '56': 'resto-restaurant',
    '58': 'info-developpement', '59': 'loisirs-cinema', '60': 'info-developpement',
    '62': 'info-developpement', '63': 'info-hebergement',
    '64': 'finance-banque', '65': 'finance-assurance', '66': 'finance-assurance',
    '68': 'immo-agence', '69': 'finance-comptable', '70': 'conseil-management',
    '71': 'archi-architecture', '72': 'info-conseil', '73': 'service-publicite',
    '77': 'transport-logistique', '78': 'service-interim', '79': 'transport-routier',
    '80': 'service-securite', '81': 'service-nettoyage', '82': 'service-publicite',
    '84': 'service-publicite', '85': 'formation-professionnelle',
    '86': 'sante-medecin', '87': 'sante-ehpad', '88': 'sante-ehpad',
    '90': 'culture-spectacle', '91': 'culture-musee', '93': 'sport-salle',
    '95': 'service-reparation', '96': 'service-coiffeur'
  };
  
  if (divisionToSector[division]) {
    return divisionToSector[division];
  }

  // 5. Si aucune correspondance, retourner "autre"
  return 'autre';
}

/**
 * Obtient les informations complètes de la catégorie d'un prospect
 */
export function getCategoryInfo(codeNaf: string | null | undefined): DetailedCategory {
  const categoryKey = getCategoryFromNaf(codeNaf);
  const category = DETAILED_CATEGORIES.find(cat => cat.key === categoryKey);
  
  if (!category) {
    // Fallback sur "autre"
    return DETAILED_CATEGORIES.find(cat => cat.key === 'autre') || {
      key: 'autre',
      label: 'Autres activités',
      emoji: '🔄',
      nafCodes: [],
      keywords: []
    };
  }
  
  return category;
}

/**
 * Obtient le label formaté avec emoji
 */
export function getCategoryLabel(codeNaf: string | null | undefined): string {
  const info = getCategoryInfo(codeNaf);
  return `${info.emoji} ${info.label}`;
}

/**
 * Compte le nombre de prospects par catégorie
 */
export function countProspectsByCategory(prospects: Array<{ code_naf?: string | null }>): Record<string, number> {
  const counts: Record<string, number> = {};
  
  // Initialiser tous les compteurs à 0
  DETAILED_CATEGORIES.forEach(cat => {
    counts[cat.key] = 0;
  });
  
  // Compter les prospects
  prospects.forEach(prospect => {
    const category = getCategoryFromNaf(prospect.code_naf);
    counts[category] = (counts[category] || 0) + 1;
  });
  
  return counts;
}

/**
 * Filtre les prospects par catégorie
 */
export function filterProspectsByCategories(
  prospects: Array<{ code_naf?: string | null }>,
  selectedCategories: string[]
): Array<{ code_naf?: string | null }> {
  if (!selectedCategories || selectedCategories.length === 0) {
    return prospects;
  }
  
  return prospects.filter(prospect => {
    const category = getCategoryFromNaf(prospect.code_naf);
    return selectedCategories.includes(category);
  });
}

/**
 * Obtient toutes les catégories disponibles avec leurs compteurs
 */
export function getAvailableCategories(prospects: Array<{ code_naf?: string | null }>): Array<{
  category: DetailedCategory;
  count: number;
}> {
  const counts = countProspectsByCategory(prospects);
  
  return DETAILED_CATEGORIES.map(category => ({
    category,
    count: counts[category.key] || 0
  })).filter(item => item.count > 0); // Ne retourner que les catégories avec au moins 1 prospect
}
