// Nomenclature d'Activités Française (NAF) - Classification officielle
// Source: INSEE

export interface NafSection {
  code: string;
  label: string;
  emoji: string;
  divisions: string[]; // Codes à 2 chiffres inclus
}

export const NAF_SECTIONS: NafSection[] = [
  {
    code: "A",
    label: "Agriculture, sylviculture et pêche",
    emoji: "🌾",
    divisions: ["01", "02", "03"]
  },
  {
    code: "B",
    label: "Industries extractives",
    emoji: "⛏️",
    divisions: ["05", "06", "07", "08", "09"]
  },
  {
    code: "C",
    label: "Industrie manufacturière",
    emoji: "🏭",
    divisions: ["10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30", "31", "32", "33"]
  },
  {
    code: "D",
    label: "Production et distribution d'électricité, gaz, vapeur",
    emoji: "⚡",
    divisions: ["35"]
  },
  {
    code: "E",
    label: "Eau, assainissement, déchets et dépollution",
    emoji: "💧",
    divisions: ["36", "37", "38", "39"]
  },
  {
    code: "F",
    label: "Construction",
    emoji: "🏗️",
    divisions: ["41", "42", "43"]
  },
  {
    code: "G",
    label: "Commerce, réparation automobiles et motocycles",
    emoji: "🛒",
    divisions: ["45", "46", "47"]
  },
  {
    code: "H",
    label: "Transports et entreposage",
    emoji: "🚚",
    divisions: ["49", "50", "51", "52", "53"]
  },
  {
    code: "I",
    label: "Hébergement et restauration",
    emoji: "🍽️",
    divisions: ["55", "56"]
  },
  {
    code: "J",
    label: "Information et communication",
    emoji: "💻",
    divisions: ["58", "59", "60", "61", "62", "63"]
  },
  {
    code: "K",
    label: "Activités financières et d'assurance",
    emoji: "🏦",
    divisions: ["64", "65", "66"]
  },
  {
    code: "L",
    label: "Activités immobilières",
    emoji: "🏠",
    divisions: ["68"]
  },
  {
    code: "M",
    label: "Activités spécialisées, scientifiques et techniques",
    emoji: "🔬",
    divisions: ["69", "70", "71", "72", "73", "74", "75"]
  },
  {
    code: "N",
    label: "Services administratifs et de soutien",
    emoji: "📋",
    divisions: ["77", "78", "79", "80", "81", "82"]
  },
  {
    code: "O",
    label: "Administration publique",
    emoji: "🏛️",
    divisions: ["84"]
  },
  {
    code: "P",
    label: "Enseignement",
    emoji: "🎓",
    divisions: ["85"]
  },
  {
    code: "Q",
    label: "Santé humaine et action sociale",
    emoji: "🏥",
    divisions: ["86", "87", "88"]
  },
  {
    code: "R",
    label: "Arts, spectacles et activités récréatives",
    emoji: "🎭",
    divisions: ["90", "91", "92", "93"]
  },
  {
    code: "S",
    label: "Autres activités de services",
    emoji: "🔧",
    divisions: ["94", "95", "96"]
  },
  {
    code: "T",
    label: "Activités des ménages employeurs",
    emoji: "🏡",
    divisions: ["97", "98"]
  },
  {
    code: "U",
    label: "Activités extra-territoriales",
    emoji: "🌐",
    divisions: ["99"]
  }
];

// Divisions NAF détaillées (niveau 2 chiffres)
export const NAF_DIVISIONS: Record<string, { label: string; section: string }> = {
  // Section A - Agriculture
  "01": { label: "Culture et production animale, chasse", section: "A" },
  "02": { label: "Sylviculture et exploitation forestière", section: "A" },
  "03": { label: "Pêche et aquaculture", section: "A" },
  
  // Section B - Industries extractives
  "05": { label: "Extraction de houille et de lignite", section: "B" },
  "06": { label: "Extraction d'hydrocarbures", section: "B" },
  "07": { label: "Extraction de minerais métalliques", section: "B" },
  "08": { label: "Autres industries extractives", section: "B" },
  "09": { label: "Services de soutien aux industries extractives", section: "B" },
  
  // Section C - Industrie manufacturière
  "10": { label: "Industries alimentaires", section: "C" },
  "11": { label: "Fabrication de boissons", section: "C" },
  "12": { label: "Fabrication de produits à base de tabac", section: "C" },
  "13": { label: "Fabrication de textiles", section: "C" },
  "14": { label: "Industrie de l'habillement", section: "C" },
  "15": { label: "Industrie du cuir et de la chaussure", section: "C" },
  "16": { label: "Travail du bois et fabrication d'articles en bois", section: "C" },
  "17": { label: "Industrie du papier et du carton", section: "C" },
  "18": { label: "Imprimerie et reproduction d'enregistrements", section: "C" },
  "19": { label: "Cokéfaction et raffinage", section: "C" },
  "20": { label: "Industrie chimique", section: "C" },
  "21": { label: "Industrie pharmaceutique", section: "C" },
  "22": { label: "Fabrication de produits en caoutchouc et plastique", section: "C" },
  "23": { label: "Fabrication d'autres produits minéraux non métalliques", section: "C" },
  "24": { label: "Métallurgie", section: "C" },
  "25": { label: "Fabrication de produits métalliques", section: "C" },
  "26": { label: "Fabrication de produits informatiques et électroniques", section: "C" },
  "27": { label: "Fabrication d'équipements électriques", section: "C" },
  "28": { label: "Fabrication de machines et équipements", section: "C" },
  "29": { label: "Industrie automobile", section: "C" },
  "30": { label: "Fabrication d'autres matériels de transport", section: "C" },
  "31": { label: "Fabrication de meubles", section: "C" },
  "32": { label: "Autres industries manufacturières", section: "C" },
  "33": { label: "Réparation et installation de machines", section: "C" },
  
  // Section D - Électricité, gaz
  "35": { label: "Production et distribution d'électricité, gaz, vapeur", section: "D" },
  
  // Section E - Eau, déchets
  "36": { label: "Captage, traitement et distribution d'eau", section: "E" },
  "37": { label: "Collecte et traitement des eaux usées", section: "E" },
  "38": { label: "Collecte, traitement et élimination des déchets", section: "E" },
  "39": { label: "Dépollution et autres services de gestion des déchets", section: "E" },
  
  // Section F - Construction
  "41": { label: "Construction de bâtiments", section: "F" },
  "42": { label: "Génie civil", section: "F" },
  "43": { label: "Travaux de construction spécialisés", section: "F" },
  
  // Section G - Commerce
  "45": { label: "Commerce et réparation automobiles et motocycles", section: "G" },
  "46": { label: "Commerce de gros", section: "G" },
  "47": { label: "Commerce de détail", section: "G" },
  
  // Section H - Transports
  "49": { label: "Transports terrestres et transport par conduites", section: "H" },
  "50": { label: "Transports par eau", section: "H" },
  "51": { label: "Transports aériens", section: "H" },
  "52": { label: "Entreposage et services auxiliaires des transports", section: "H" },
  "53": { label: "Activités de poste et de courrier", section: "H" },
  
  // Section I - Hébergement, restauration
  "55": { label: "Hébergement", section: "I" },
  "56": { label: "Restauration", section: "I" },
  
  // Section J - Information, communication
  "58": { label: "Édition", section: "J" },
  "59": { label: "Production de films, vidéo et programmes TV", section: "J" },
  "60": { label: "Programmation et diffusion", section: "J" },
  "61": { label: "Télécommunications", section: "J" },
  "62": { label: "Programmation, conseil et autres activités informatiques", section: "J" },
  "63": { label: "Services d'information", section: "J" },
  
  // Section K - Finance, assurance
  "64": { label: "Activités des services financiers", section: "K" },
  "65": { label: "Assurance", section: "K" },
  "66": { label: "Activités auxiliaires de services financiers", section: "K" },
  
  // Section L - Immobilier
  "68": { label: "Activités immobilières", section: "L" },
  
  // Section M - Activités scientifiques et techniques
  "69": { label: "Activités juridiques et comptables", section: "M" },
  "70": { label: "Activités des sièges sociaux, conseil de gestion", section: "M" },
  "71": { label: "Activités d'architecture et d'ingénierie", section: "M" },
  "72": { label: "Recherche-développement scientifique", section: "M" },
  "73": { label: "Publicité et études de marché", section: "M" },
  "74": { label: "Autres activités spécialisées, scientifiques et techniques", section: "M" },
  "75": { label: "Activités vétérinaires", section: "M" },
  
  // Section N - Services administratifs
  "77": { label: "Activités de location et location-bail", section: "N" },
  "78": { label: "Activités liées à l'emploi", section: "N" },
  "79": { label: "Agences de voyage et services de réservation", section: "N" },
  "80": { label: "Enquêtes et sécurité", section: "N" },
  "81": { label: "Services relatifs aux bâtiments et aménagement paysager", section: "N" },
  "82": { label: "Activités administratives et autres activités de soutien", section: "N" },
  
  // Section O - Administration publique
  "84": { label: "Administration publique et défense", section: "O" },
  
  // Section P - Enseignement
  "85": { label: "Enseignement", section: "P" },
  
  // Section Q - Santé, action sociale
  "86": { label: "Activités pour la santé humaine", section: "Q" },
  "87": { label: "Hébergement médico-social et social", section: "Q" },
  "88": { label: "Action sociale sans hébergement", section: "Q" },
  
  // Section R - Arts, spectacles
  "90": { label: "Activités créatives, artistiques et de spectacle", section: "R" },
  "91": { label: "Bibliothèques, archives, musées", section: "R" },
  "92": { label: "Organisation de jeux de hasard et d'argent", section: "R" },
  "93": { label: "Activités sportives, récréatives et de loisirs", section: "R" },
  
  // Section S - Autres services
  "94": { label: "Activités des organisations associatives", section: "S" },
  "95": { label: "Réparation d'ordinateurs et de biens personnels", section: "S" },
  "96": { label: "Autres services personnels", section: "S" },
  
  // Section T - Ménages employeurs
  "97": { label: "Activités des ménages employeurs de personnel domestique", section: "T" },
  "98": { label: "Activités indifférenciées des ménages producteurs", section: "T" },
  
  // Section U - Extra-territorial
  "99": { label: "Activités des organisations extra-territoriales", section: "U" }
};

// Fonction pour obtenir la section NAF à partir du code NAF
export function getNafSection(codeNaf: string): NafSection | undefined {
  if (!codeNaf) return undefined;
  const division = codeNaf.substring(0, 2);
  const divisionInfo = NAF_DIVISIONS[division];
  if (!divisionInfo) return undefined;
  return NAF_SECTIONS.find(s => s.code === divisionInfo.section);
}

// Fonction pour obtenir la division NAF
export function getNafDivision(codeNaf: string): { code: string; label: string; section: string } | undefined {
  if (!codeNaf) return undefined;
  const division = codeNaf.substring(0, 2);
  const divisionInfo = NAF_DIVISIONS[division];
  if (!divisionInfo) return undefined;
  return { code: division, ...divisionInfo };
}

// Fonction pour obtenir le label de la section à partir du code division
export function getSectionFromDivision(division: string): string {
  const divisionInfo = NAF_DIVISIONS[division];
  if (!divisionInfo) return "Non classé";
  const section = NAF_SECTIONS.find(s => s.code === divisionInfo.section);
  return section ? `${section.code} - ${section.label}` : "Non classé";
}
