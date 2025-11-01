// Catégories NAF organisées par secteurs avec emojis pour les commerciaux

export interface NafCategory {
  emoji: string;
  label: string;
  codes: {
    code: string;
    label: string;
  }[];
}

export const NAF_CATEGORIES: Record<string, NafCategory> = {
  agriculture: {
    emoji: "🌾",
    label: "Agriculture & Forêt",
    codes: [
      { code: "01", label: "Culture et production animale" },
      { code: "02", label: "Sylviculture et exploitation forestière" },
      { code: "03", label: "Pêche et aquaculture" }
    ]
  },
  industrie_alimentaire: {
    emoji: "🍞",
    label: "Industrie alimentaire",
    codes: [
      { code: "10", label: "Industries alimentaires" },
      { code: "11", label: "Fabrication de boissons" },
      { code: "12", label: "Fabrication de produits à base de tabac" }
    ]
  },
  textile: {
    emoji: "👕",
    label: "Textile & Habillement",
    codes: [
      { code: "13", label: "Fabrication de textiles" },
      { code: "14", label: "Industrie de l'habillement" },
      { code: "15", label: "Industrie du cuir et de la chaussure" }
    ]
  },
  bois_papier: {
    emoji: "📄",
    label: "Bois & Papier",
    codes: [
      { code: "16", label: "Travail du bois et fabrication d'articles" },
      { code: "17", label: "Industrie du papier et du carton" },
      { code: "18", label: "Imprimerie et reproduction" }
    ]
  },
  chimie: {
    emoji: "🧪",
    label: "Chimie & Pharmacie",
    codes: [
      { code: "19", label: "Cokéfaction et raffinage" },
      { code: "20", label: "Industrie chimique" },
      { code: "21", label: "Industrie pharmaceutique" }
    ]
  },
  plastique: {
    emoji: "♻️",
    label: "Plastique & Caoutchouc",
    codes: [
      { code: "22", label: "Fabrication de produits en caoutchouc et plastique" },
      { code: "23", label: "Fabrication d'autres produits minéraux non métalliques" }
    ]
  },
  metallurgie: {
    emoji: "⚙️",
    label: "Métallurgie & Mécanique",
    codes: [
      { code: "24", label: "Métallurgie" },
      { code: "25", label: "Fabrication de produits métalliques" },
      { code: "28", label: "Fabrication de machines et équipements" }
    ]
  },
  informatique: {
    emoji: "💻",
    label: "Informatique & Électronique",
    codes: [
      { code: "26", label: "Fabrication de produits informatiques, électroniques et optiques" },
      { code: "27", label: "Fabrication d'équipements électriques" }
    ]
  },
  automobile: {
    emoji: "🚗",
    label: "Automobile & Transport",
    codes: [
      { code: "29", label: "Industrie automobile" },
      { code: "30", label: "Fabrication d'autres matériels de transport" }
    ]
  },
  meubles: {
    emoji: "🪑",
    label: "Meubles & Autres",
    codes: [
      { code: "31", label: "Fabrication de meubles" },
      { code: "32", label: "Autres industries manufacturières" },
      { code: "33", label: "Réparation et installation de machines" }
    ]
  },
  energie: {
    emoji: "⚡",
    label: "Énergie & Eau",
    codes: [
      { code: "35", label: "Production et distribution d'électricité, de gaz" },
      { code: "36", label: "Captage, traitement et distribution d'eau" },
      { code: "37", label: "Collecte et traitement des eaux usées" },
      { code: "38", label: "Collecte, traitement et élimination des déchets" },
      { code: "39", label: "Dépollution et autres services de gestion des déchets" }
    ]
  },
  construction: {
    emoji: "🏗️",
    label: "Construction & BTP",
    codes: [
      { code: "41", label: "Construction de bâtiments" },
      { code: "42", label: "Génie civil" },
      { code: "43", label: "Travaux de construction spécialisés" }
    ]
  },
  commerce_auto: {
    emoji: "🚙",
    label: "Commerce Automobile",
    codes: [
      { code: "45", label: "Commerce et réparation d'automobiles et de motocycles" }
    ]
  },
  commerce_gros: {
    emoji: "📦",
    label: "Commerce de Gros",
    codes: [
      { code: "46", label: "Commerce de gros" }
    ]
  },
  commerce_detail: {
    emoji: "🛒",
    label: "Commerce de Détail",
    codes: [
      { code: "47", label: "Commerce de détail" }
    ]
  },
  transport: {
    emoji: "🚚",
    label: "Transport & Logistique",
    codes: [
      { code: "49", label: "Transports terrestres et transport par conduites" },
      { code: "50", label: "Transports par eau" },
      { code: "51", label: "Transports aériens" },
      { code: "52", label: "Entreposage et services auxiliaires des transports" },
      { code: "53", label: "Activités de poste et de courrier" }
    ]
  },
  hotellerie: {
    emoji: "🏨",
    label: "Hôtellerie & Restauration",
    codes: [
      { code: "55", label: "Hébergement" },
      { code: "56", label: "Restauration" }
    ]
  },
  communication: {
    emoji: "📡",
    label: "Communication & Médias",
    codes: [
      { code: "58", label: "Édition" },
      { code: "59", label: "Production de films cinématographiques, vidéo et programmes TV" },
      { code: "60", label: "Programmation et diffusion" },
      { code: "61", label: "Télécommunications" }
    ]
  },
  informatique_services: {
    emoji: "🖥️",
    label: "Services Informatiques",
    codes: [
      { code: "62", label: "Programmation, conseil et autres activités informatiques" },
      { code: "63", label: "Services d'information" }
    ]
  },
  finance: {
    emoji: "💰",
    label: "Finance & Assurance",
    codes: [
      { code: "64", label: "Activités des services financiers" },
      { code: "65", label: "Assurance" },
      { code: "66", label: "Activités auxiliaires de services financiers et d'assurance" }
    ]
  },
  immobilier: {
    emoji: "🏢",
    label: "Immobilier",
    codes: [
      { code: "68", label: "Activités immobilières" }
    ]
  },
  juridique: {
    emoji: "⚖️",
    label: "Services Juridiques",
    codes: [
      { code: "69", label: "Activités juridiques et comptables" },
      { code: "70", label: "Activités des sièges sociaux ; conseil de gestion" }
    ]
  },
  architecture: {
    emoji: "📐",
    label: "Architecture & Ingénierie",
    codes: [
      { code: "71", label: "Activités d'architecture et d'ingénierie" },
      { code: "72", label: "Recherche-développement scientifique" },
      { code: "73", label: "Publicité et études de marché" },
      { code: "74", label: "Autres activités spécialisées, scientifiques et techniques" },
      { code: "75", label: "Activités vétérinaires" }
    ]
  },
  services_admin: {
    emoji: "📋",
    label: "Services Administratifs",
    codes: [
      { code: "77", label: "Activités de location et location-bail" },
      { code: "78", label: "Activités liées à l'emploi" },
      { code: "79", label: "Activités des agences de voyage" },
      { code: "80", label: "Enquêtes et sécurité" },
      { code: "81", label: "Services relatifs aux bâtiments" },
      { code: "82", label: "Activités administratives et autres services de soutien" }
    ]
  },
  administration: {
    emoji: "🏛️",
    label: "Administration Publique",
    codes: [
      { code: "84", label: "Administration publique et défense" }
    ]
  },
  enseignement: {
    emoji: "🎓",
    label: "Enseignement & Formation",
    codes: [
      { code: "85", label: "Enseignement" }
    ]
  },
  sante: {
    emoji: "🏥",
    label: "Santé & Action Sociale",
    codes: [
      { code: "86", label: "Activités pour la santé humaine" },
      { code: "87", label: "Hébergement médico-social et social" },
      { code: "88", label: "Action sociale sans hébergement" }
    ]
  },
  culture: {
    emoji: "🎨",
    label: "Culture & Loisirs",
    codes: [
      { code: "90", label: "Activités créatives, artistiques et de spectacle" },
      { code: "91", label: "Bibliothèques, archives, musées" },
      { code: "92", label: "Organisation de jeux de hasard et d'argent" },
      { code: "93", label: "Activités sportives, récréatives et de loisirs" }
    ]
  },
  autres_services: {
    emoji: "🔧",
    label: "Autres Services",
    codes: [
      { code: "94", label: "Activités des organisations associatives" },
      { code: "95", label: "Réparation d'ordinateurs et de biens personnels" },
      { code: "96", label: "Autres services personnels" }
    ]
  },
  menages: {
    emoji: "🏠",
    label: "Services aux Ménages",
    codes: [
      { code: "97", label: "Activités des ménages en tant qu'employeurs" },
      { code: "98", label: "Activités indifférenciées des ménages" }
    ]
  },
  international: {
    emoji: "🌍",
    label: "Organisations Internationales",
    codes: [
      { code: "99", label: "Activités des organisations et organismes extraterritoriaux" }
    ]
  }
};

// Fonction helper pour récupérer la catégorie d'un code NAF
export function getNafCategory(codeNaf: string): { key: string; category: NafCategory } | null {
  if (!codeNaf) return null;
  
  // Extraire les 2 premiers chiffres du code NAF
  const prefix = codeNaf.substring(0, 2);
  
  for (const [key, category] of Object.entries(NAF_CATEGORIES)) {
    if (category.codes.some(c => c.code === prefix)) {
      return { key, category };
    }
  }
  
  return null;
}

// Fonction pour récupérer le label d'un code NAF complet
export function getNafLabel(codeNaf: string): string {
  const categoryInfo = getNafCategory(codeNaf);
  if (!categoryInfo) return codeNaf;
  
  const prefix = codeNaf.substring(0, 2);
  const code = categoryInfo.category.codes.find(c => c.code === prefix);
  
  return code ? code.label : codeNaf;
}
