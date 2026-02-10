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

  // 2. Chercher par préfixe (du plus spécifique au plus général)
  // Essayer avec les 5 premiers caractères (ex: "47.73")
  if (normalized.length >= 5) {
    const prefix5 = normalized.substring(0, 5);
    for (const [nafCode, category] of NAF_TO_CATEGORY_MAP.entries()) {
      if (normalized.startsWith(nafCode) || prefix5.startsWith(nafCode)) {
        return category;
      }
    }
  }

  // 3. Essayer avec les 4 premiers caractères (ex: "47.7")
  if (normalized.length >= 4) {
    const prefix4 = normalized.substring(0, 4);
    for (const [nafCode, category] of NAF_TO_CATEGORY_MAP.entries()) {
      if (normalized.startsWith(nafCode) || prefix4.startsWith(nafCode)) {
        return category;
      }
    }
  }

  // 4. Essayer avec les 2 premiers caractères (ex: "47")
  if (normalized.length >= 2) {
    const prefix2 = normalized.substring(0, 2);
    for (const [nafCode, category] of NAF_TO_CATEGORY_MAP.entries()) {
      if (nafCode.startsWith(prefix2)) {
        return category;
      }
    }
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
