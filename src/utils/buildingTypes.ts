export const BUILDING_TYPES = {
  'boutique_commerce': { 
    label: '🏪 Boutique / Commerce', 
    icon: '🏪',
    keywords: ['commerce', 'magasin', 'boutique', 'vente', 'retail', 'épicerie', 'supermarché', 'alimentation'],
    naf: ['47.1', '47.2', '47.5', '47.6', '47.7', '47.9']
  },
  'restaurant_bar': { 
    label: '🍽️ Restaurant / Bar', 
    icon: '🍽️',
    keywords: ['restaurant', 'bar', 'café', 'brasserie', 'traiteur', 'restauration', 'boulangerie', 'pâtisserie'],
    naf: ['56.1', '56.3', '10.71']
  },
  'bureau_services': { 
    label: '🏢 Bureau (conseil/services)', 
    icon: '🏢',
    keywords: ['conseil', 'bureau', 'agence', 'cabinet', 'consulting', 'service', 'expertise', 'comptable', 'avocat', 'architecte'],
    naf: ['69', '70', '71', '73', '74', '82', '62', '63']
  },
  'atelier_usine': { 
    label: '🏭 Atelier / Usine', 
    icon: '🏭',
    keywords: ['usine', 'fabrication', 'production', 'manufacture', 'industrie', 'atelier de production'],
    naf: ['10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31', '32', '33']
  },
  'base_travaux_btp': { 
    label: '🚧 Base travaux BTP', 
    icon: '🚧',
    keywords: ['construction', 'btp', 'travaux', 'bâtiment', 'chantier', 'gros oeuvre', 'maçonnerie'],
    naf: ['41', '42', '43']
  },
  'artisan_local_mixte': { 
    label: '🔧 Artisan (local mixte)', 
    icon: '🔧',
    keywords: ['artisan', 'menuisier', 'plombier', 'électricien', 'peintre', 'maçon', 'réparation', 'dépannage', 'installation'],
    naf: ['43.2', '43.3', '95', '33.1']
  },
  'holding_siege': { 
    label: '🏛️ Holding / Siège social', 
    icon: '🏛️',
    keywords: ['holding', 'siège', 'direction', 'administration centrale'],
    formes: ['HOLDING']
  },
  'cabinet_medical': { 
    label: '⚕️ Cabinet médical', 
    icon: '⚕️',
    keywords: ['médical', 'santé', 'cabinet', 'médecin', 'infirmier', 'kinésithérapeute', 'pharmacie', 'dentiste', 'vétérinaire'],
    naf: ['86', '47.73']
  },
  'centre_formation': { 
    label: '🎓 Centre de formation', 
    icon: '🎓',
    keywords: ['formation', 'enseignement', 'école', 'centre', 'éducation', 'cours'],
    naf: ['85']
  },
  'exploitation_agricole': { 
    label: '🌾 Exploitation agricole', 
    icon: '🌾',
    keywords: ['agricole', 'exploitation', 'ferme', 'élevage', 'culture', 'maraîchage'],
    naf: ['01', '02', '03']
  },
  'hotel_hebergement': { 
    label: '🏨 Hôtel / Hébergement', 
    icon: '🏨',
    keywords: ['hôtel', 'hébergement', 'résidence', 'camping', 'gîte', 'chambre d\'hôtes'],
    naf: ['55']
  },
  'entrepot_logistique': { 
    label: '📦 Entrepôt logistique', 
    icon: '📦',
    keywords: ['entrepôt', 'logistique', 'stockage', 'transport', 'messagerie', 'distribution'],
    naf: ['49', '50', '51', '52', '53']
  }
} as const;

export const ZONE_TYPES = {
  'centre_ville': { 
    label: '🏙️ Centre-ville', 
    icon: '🏙️',
    keywords: ['centre', 'ville', 'downtown', 'centre-ville']
  },
  'zone_industrielle': { 
    label: '🏭 Zone industrielle', 
    icon: '🏭',
    keywords: ['zi', 'zone industrielle', 'parc industriel', 'zone artisanale', 'parc d\'activités', 'za']
  },
  'zone_commerciale': { 
    label: '🛒 Zone commerciale', 
    icon: '🛒',
    keywords: ['zc', 'zone commerciale', 'parc commercial', 'centre commercial', 'galerie']
  },
  'rural': { 
    label: '🌳 Rural', 
    icon: '🌳',
    default: true
  }
} as const;

export type BuildingTypeKey = keyof typeof BUILDING_TYPES;
export type ZoneTypeKey = keyof typeof ZONE_TYPES;

export function getBuildingTypeLabel(key: string): string {
  return BUILDING_TYPES[key as BuildingTypeKey]?.label || key;
}

export function getZoneTypeLabel(key: string): string {
  return ZONE_TYPES[key as ZoneTypeKey]?.label || key;
}

export function getBuildingTypeIcon(key: string): string {
  return BUILDING_TYPES[key as BuildingTypeKey]?.icon || '🏢';
}

export function getZoneTypeIcon(key: string): string {
  return ZONE_TYPES[key as ZoneTypeKey]?.icon || '📍';
}
