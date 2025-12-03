// Nomenclature d'activités française (NAF) officielle - Rev. 2
// Source: INSEE https://www.insee.fr/fr/information/2406147

export interface NafSection {
  code: string;
  label: string;
  emoji: string;
  divisions: {
    code: string;
    label: string;
  }[];
}

export const NAF_SECTIONS: NafSection[] = [
  {
    code: "A",
    label: "Agriculture, sylviculture et pêche",
    emoji: "🌾",
    divisions: [
      { code: "01", label: "Culture et production animale, chasse et services annexes" },
      { code: "02", label: "Sylviculture et exploitation forestière" },
      { code: "03", label: "Pêche et aquaculture" }
    ]
  },
  {
    code: "B",
    label: "Industries extractives",
    emoji: "⛏️",
    divisions: [
      { code: "05", label: "Extraction de houille et de lignite" },
      { code: "06", label: "Extraction d'hydrocarbures" },
      { code: "07", label: "Extraction de minerais métalliques" },
      { code: "08", label: "Autres industries extractives" },
      { code: "09", label: "Services de soutien aux industries extractives" }
    ]
  },
  {
    code: "C",
    label: "Industrie manufacturière",
    emoji: "🏭",
    divisions: [
      { code: "10", label: "Industries alimentaires" },
      { code: "11", label: "Fabrication de boissons" },
      { code: "12", label: "Fabrication de produits à base de tabac" },
      { code: "13", label: "Fabrication de textiles" },
      { code: "14", label: "Industrie de l'habillement" },
      { code: "15", label: "Industrie du cuir et de la chaussure" },
      { code: "16", label: "Travail du bois et fabrication d'articles en bois" },
      { code: "17", label: "Industrie du papier et du carton" },
      { code: "18", label: "Imprimerie et reproduction d'enregistrements" },
      { code: "19", label: "Cokéfaction et raffinage" },
      { code: "20", label: "Industrie chimique" },
      { code: "21", label: "Industrie pharmaceutique" },
      { code: "22", label: "Fabrication de produits en caoutchouc et plastique" },
      { code: "23", label: "Fabrication d'autres produits minéraux non métalliques" },
      { code: "24", label: "Métallurgie" },
      { code: "25", label: "Fabrication de produits métalliques" },
      { code: "26", label: "Fabrication de produits informatiques, électroniques et optiques" },
      { code: "27", label: "Fabrication d'équipements électriques" },
      { code: "28", label: "Fabrication de machines et équipements n.c.a." },
      { code: "29", label: "Industrie automobile" },
      { code: "30", label: "Fabrication d'autres matériels de transport" },
      { code: "31", label: "Fabrication de meubles" },
      { code: "32", label: "Autres industries manufacturières" },
      { code: "33", label: "Réparation et installation de machines et d'équipements" }
    ]
  },
  {
    code: "D",
    label: "Production et distribution d'électricité, de gaz, de vapeur et d'air conditionné",
    emoji: "⚡",
    divisions: [
      { code: "35", label: "Production et distribution d'électricité, de gaz, de vapeur et d'air conditionné" }
    ]
  },
  {
    code: "E",
    label: "Production et distribution d'eau ; assainissement, gestion des déchets et dépollution",
    emoji: "💧",
    divisions: [
      { code: "36", label: "Captage, traitement et distribution d'eau" },
      { code: "37", label: "Collecte et traitement des eaux usées" },
      { code: "38", label: "Collecte, traitement et élimination des déchets ; récupération" },
      { code: "39", label: "Dépollution et autres services de gestion des déchets" }
    ]
  },
  {
    code: "F",
    label: "Construction",
    emoji: "🏗️",
    divisions: [
      { code: "41", label: "Construction de bâtiments" },
      { code: "42", label: "Génie civil" },
      { code: "43", label: "Travaux de construction spécialisés" }
    ]
  },
  {
    code: "G",
    label: "Commerce ; réparation d'automobiles et de motocycles",
    emoji: "🛒",
    divisions: [
      { code: "45", label: "Commerce et réparation d'automobiles et de motocycles" },
      { code: "46", label: "Commerce de gros, à l'exception des automobiles et des motocycles" },
      { code: "47", label: "Commerce de détail, à l'exception des automobiles et des motocycles" }
    ]
  },
  {
    code: "H",
    label: "Transports et entreposage",
    emoji: "🚚",
    divisions: [
      { code: "49", label: "Transports terrestres et transport par conduites" },
      { code: "50", label: "Transports par eau" },
      { code: "51", label: "Transports aériens" },
      { code: "52", label: "Entreposage et services auxiliaires des transports" },
      { code: "53", label: "Activités de poste et de courrier" }
    ]
  },
  {
    code: "I",
    label: "Hébergement et restauration",
    emoji: "🏨",
    divisions: [
      { code: "55", label: "Hébergement" },
      { code: "56", label: "Restauration" }
    ]
  },
  {
    code: "J",
    label: "Information et communication",
    emoji: "📡",
    divisions: [
      { code: "58", label: "Édition" },
      { code: "59", label: "Production de films cinématographiques, vidéo et programmes de télévision" },
      { code: "60", label: "Programmation et diffusion" },
      { code: "61", label: "Télécommunications" },
      { code: "62", label: "Programmation, conseil et autres activités informatiques" },
      { code: "63", label: "Services d'information" }
    ]
  },
  {
    code: "K",
    label: "Activités financières et d'assurance",
    emoji: "💰",
    divisions: [
      { code: "64", label: "Activités des services financiers, hors assurance et caisses de retraite" },
      { code: "65", label: "Assurance" },
      { code: "66", label: "Activités auxiliaires de services financiers et d'assurance" }
    ]
  },
  {
    code: "L",
    label: "Activités immobilières",
    emoji: "🏢",
    divisions: [
      { code: "68", label: "Activités immobilières" }
    ]
  },
  {
    code: "M",
    label: "Activités spécialisées, scientifiques et techniques",
    emoji: "🔬",
    divisions: [
      { code: "69", label: "Activités juridiques et comptables" },
      { code: "70", label: "Activités des sièges sociaux ; conseil de gestion" },
      { code: "71", label: "Activités d'architecture et d'ingénierie ; activités de contrôle et analyses techniques" },
      { code: "72", label: "Recherche-développement scientifique" },
      { code: "73", label: "Publicité et études de marché" },
      { code: "74", label: "Autres activités spécialisées, scientifiques et techniques" },
      { code: "75", label: "Activités vétérinaires" }
    ]
  },
  {
    code: "N",
    label: "Activités de services administratifs et de soutien",
    emoji: "📋",
    divisions: [
      { code: "77", label: "Activités de location et location-bail" },
      { code: "78", label: "Activités liées à l'emploi" },
      { code: "79", label: "Activités des agences de voyage, voyagistes, services de réservation" },
      { code: "80", label: "Enquêtes et sécurité" },
      { code: "81", label: "Services relatifs aux bâtiments et aménagement paysager" },
      { code: "82", label: "Activités administratives et autres activités de soutien aux entreprises" }
    ]
  },
  {
    code: "O",
    label: "Administration publique",
    emoji: "🏛️",
    divisions: [
      { code: "84", label: "Administration publique et défense ; sécurité sociale obligatoire" }
    ]
  },
  {
    code: "P",
    label: "Enseignement",
    emoji: "🎓",
    divisions: [
      { code: "85", label: "Enseignement" }
    ]
  },
  {
    code: "Q",
    label: "Santé humaine et action sociale",
    emoji: "🏥",
    divisions: [
      { code: "86", label: "Activités pour la santé humaine" },
      { code: "87", label: "Hébergement médico-social et social" },
      { code: "88", label: "Action sociale sans hébergement" }
    ]
  },
  {
    code: "R",
    label: "Arts, spectacles et activités récréatives",
    emoji: "🎨",
    divisions: [
      { code: "90", label: "Activités créatives, artistiques et de spectacle" },
      { code: "91", label: "Bibliothèques, archives, musées et autres activités culturelles" },
      { code: "92", label: "Organisation de jeux de hasard et d'argent" },
      { code: "93", label: "Activités sportives, récréatives et de loisirs" }
    ]
  },
  {
    code: "S",
    label: "Autres activités de services",
    emoji: "🔧",
    divisions: [
      { code: "94", label: "Activités des organisations associatives" },
      { code: "95", label: "Réparation d'ordinateurs et de biens personnels et domestiques" },
      { code: "96", label: "Autres services personnels" }
    ]
  },
  {
    code: "T",
    label: "Activités des ménages en tant qu'employeurs",
    emoji: "🏠",
    divisions: [
      { code: "97", label: "Activités des ménages en tant qu'employeurs de personnel domestique" },
      { code: "98", label: "Activités indifférenciées des ménages en tant que producteurs de biens et services" }
    ]
  },
  {
    code: "U",
    label: "Activités extra-territoriales",
    emoji: "🌍",
    divisions: [
      { code: "99", label: "Activités des organisations et organismes extraterritoriaux" }
    ]
  }
];

// Map division code to section
export function getNafSectionForDivision(divisionCode: string): NafSection | null {
  return NAF_SECTIONS.find(section => 
    section.divisions.some(d => d.code === divisionCode)
  ) || null;
}

// Get division info
export function getNafDivision(divisionCode: string): { section: NafSection; division: { code: string; label: string } } | null {
  for (const section of NAF_SECTIONS) {
    const division = section.divisions.find(d => d.code === divisionCode);
    if (division) {
      return { section, division };
    }
  }
  return null;
}

// Get all division codes
export function getAllNafDivisionCodes(): string[] {
  return NAF_SECTIONS.flatMap(s => s.divisions.map(d => d.code));
}
