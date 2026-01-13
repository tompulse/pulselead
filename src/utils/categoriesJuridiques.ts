// Mapping des catégories juridiques selon la classification INSEE
// Le premier chiffre du code à 4 chiffres détermine la catégorie principale (1-9)

export const CATEGORIES_JURIDIQUES: Record<string, { label: string; type: string; emoji: string }> = {
  '1': {
    label: 'Entrepreneur individuel',
    type: 'Auto-entrepreneur, freelance',
    emoji: '👤'
  },
  '2': {
    label: 'Groupement droit privé non doté de personnalité morale',
    type: 'Association informelle',
    emoji: '👥'
  },
  '3': {
    label: 'Personne morale droit étranger',
    type: 'Société étrangère',
    emoji: '🌍'
  },
  '4': {
    label: 'Personne morale droit public commercial',
    type: 'Entreprise publique (SNCF, etc.)',
    emoji: '🏛️'
  },
  '5': {
    label: 'Société commerciale',
    type: 'SARL, SAS, EURL, SA, etc.',
    emoji: '🏢'
  },
  '6': {
    label: 'Autre personne morale immatriculée RCS',
    type: 'Coopératives, associations commerciales',
    emoji: '🤝'
  },
  '7': {
    label: 'Organisme soumis droit administratif',
    type: 'Collectivités, écoles, hôpitaux, mairies',
    emoji: '🏫'
  },
  '8': {
    label: 'Organisme privé spécialisé',
    type: 'Syndicats professionnels',
    emoji: '⚖️'
  },
  '9': {
    label: 'Groupement droit privé',
    type: 'Associations à but lucratif',
    emoji: '🎯'
  }
};

// Obtenir la catégorie principale à partir du code complet (ex: "5499" → "5")
export function getCategorieJuridiqueGroupe(codeComplet: string | null): string | null {
  if (!codeComplet || codeComplet.length === 0) return null;
  const premier = codeComplet.charAt(0);
  if (CATEGORIES_JURIDIQUES[premier]) return premier;
  return null;
}

// Obtenir le label complet
export function getCategorieJuridiqueLabel(groupe: string): string {
  return CATEGORIES_JURIDIQUES[groupe]?.label || 'Autre';
}

// Obtenir le type court
export function getCategorieJuridiqueType(groupe: string): string {
  return CATEGORIES_JURIDIQUES[groupe]?.type || 'Non classifié';
}

// Obtenir l'emoji
export function getCategorieJuridiqueEmoji(groupe: string): string {
  return CATEGORIES_JURIDIQUES[groupe]?.emoji || '📋';
}
