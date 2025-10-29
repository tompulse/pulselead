// Système de catégories d'activités détaillées (34 catégories)
export const ACTIVITY_CATEGORIES = {
  // 🏢 TERTIAIRE & SERVICES
  "conseil-consulting": {
    label: "💼 Conseil & Consulting",
    keywords: ["conseil", "consulting", "consultant", "audit", "expertise", "stratégie", "management"],
    nafCodes: ["70.22", "69.20", "71.12"],
    formes: ["SASU", "EURL", "SAS", "SARL"]
  },
  "holding": {
    label: "🏛️ Holdings & Participations",
    keywords: ["holding", "participations", "gestion", "financière", "portefeuille"],
    nafCodes: ["64.20", "70.10"],
    formes: ["SAS", "SASU", "SARL", "SA"]
  },
  "immobilier": {
    label: "🏠 Immobilier & SCI",
    keywords: ["immobilier", "sci", "location", "agence", "foncier", "bail", "propriété", "lotissement", "civile immobilière"],
    nafCodes: ["68.10", "68.20", "68.31", "41.10"],
    formes: ["SCI", "SARL", "SAS"]
  },
  "finance-assurance": {
    label: "💰 Finance & Assurance",
    keywords: ["banque", "assurance", "crédit", "finance", "patrimoine", "comptabilité", "expert-comptable"],
    nafCodes: ["64.19", "64.92", "65.11", "65.12", "66.19", "69.20"],
    formes: ["SA", "SAS", "SARL"]
  },
  "juridique": {
    label: "⚖️ Juridique & Notaires",
    keywords: ["avocat", "notaire", "juridique", "droit", "légal", "huissier"],
    nafCodes: ["69.10", "69.20"],
    formes: ["SELARL", "SCP", "SELAS"]
  },

  // 🏗️ CONSTRUCTION & BATIMENT
  "maconnerie": {
    label: "🧱 Maçonnerie & Gros œuvre",
    keywords: ["maçon", "maçonnerie", "gros œuvre", "fondation", "béton", "ciment"],
    nafCodes: ["43.11", "43.12", "43.13", "43.99"],
    formes: ["SARL", "EURL", "SAS", "SASU"]
  },
  "plomberie-chauffage": {
    label: "🔧 Plomberie & Chauffage",
    keywords: ["plomberie", "plombier", "chauffage", "sanitaire", "climatisation", "ventilation"],
    nafCodes: ["43.22"],
    formes: ["SARL", "EURL", "SAS", "SASU", "Artisan"]
  },
  "electricite": {
    label: "⚡ Électricité",
    keywords: ["électricien", "électricité", "électrique", "installation électrique", "courant"],
    nafCodes: ["43.21"],
    formes: ["SARL", "EURL", "SAS", "SASU", "Artisan"]
  },
  "menuiserie": {
    label: "🪵 Menuiserie & Charpente",
    keywords: ["menuisier", "menuiserie", "charpente", "bois", "ébéniste", "parquet"],
    nafCodes: ["43.32", "16.21", "16.23"],
    formes: ["SARL", "EURL", "SAS", "SASU", "Artisan"]
  },
  "peinture-revetements": {
    label: "🎨 Peinture & Revêtements",
    keywords: ["peintre", "peinture", "revêtement", "carrelage", "façade", "décoration"],
    nafCodes: ["43.33", "43.34", "43.39"],
    formes: ["SARL", "EURL", "SAS", "SASU", "Artisan"]
  },

  // 🛍️ COMMERCE & DISTRIBUTION
  "commerce-detail": {
    label: "🛒 Commerce de détail",
    keywords: ["magasin", "boutique", "commerce", "vente", "détail", "retail"],
    nafCodes: ["47.11", "47.19", "47.5", "47.6", "47.7", "47.9"],
    formes: ["SARL", "EURL", "SAS", "SASU"]
  },
  "commerce-gros": {
    label: "📦 Commerce de gros & Négoce",
    keywords: ["gros", "grossiste", "négoce", "import-export", "distribution"],
    nafCodes: ["46."],
    formes: ["SARL", "SAS", "SA"]
  },
  "e-commerce": {
    label: "💻 E-commerce",
    keywords: ["e-commerce", "vente en ligne", "marketplace", "dropshipping", "web"],
    nafCodes: ["47.91"],
    formes: ["SASU", "EURL", "SAS", "SARL"]
  },

  // 🍴 RESTAURATION & ALIMENTATION
  "restauration": {
    label: "🍽️ Restaurants & Brasseries",
    keywords: ["restaurant", "brasserie", "bistro", "gastronomie", "cuisine"],
    nafCodes: ["56.10"],
    formes: ["SARL", "SAS", "EURL"]
  },
  "cafes-bars": {
    label: "☕ Cafés & Bars",
    keywords: ["café", "bar", "pub", "débit de boisson", "taverne"],
    nafCodes: ["56.30"],
    formes: ["SARL", "SAS", "EURL"]
  },
  "snack-fastfood": {
    label: "🍔 Snacks & Fast-food",
    keywords: ["snack", "fast-food", "sandwicherie", "kebab", "burger", "food truck"],
    nafCodes: ["56.10"],
    formes: ["SARL", "EURL", "SAS", "SASU"]
  },
  "traiteur": {
    label: "🎂 Traiteur & Pâtisserie",
    keywords: ["traiteur", "pâtisserie", "boulangerie", "pâtissier", "boulanger"],
    nafCodes: ["56.21", "10.71"],
    formes: ["SARL", "EURL", "Artisan"]
  },

  // 🚴 LIVRAISON & TRANSPORT
  "livraison-coursier": {
    label: "🚴 Livraison / Coursier",
    keywords: ["coursier", "livraison", "livreur", "vélo", "repas", "uber", "deliveroo", "plateformes", "auto-entrepreneur"],
    nafCodes: ["53.20"],
    formes: ["Micro-entreprise", "EURL", "SASU"]
  },
  "transport-marchandises": {
    label: "🚚 Transport de marchandises",
    keywords: ["transport", "logistique", "fret", "déménagement", "transporteur"],
    nafCodes: ["49.41", "49.42"],
    formes: ["SARL", "SAS", "EURL"]
  },
  "vtc-taxi": {
    label: "🚗 VTC & Taxis",
    keywords: ["vtc", "taxi", "chauffeur", "uber", "transport de personnes"],
    nafCodes: ["49.32", "49.39"],
    formes: ["Micro-entreprise", "EURL", "SASU"]
  },

  // 💻 TECHNOLOGIE & NUMÉRIQUE
  "informatique-dev": {
    label: "💻 Informatique & Développement",
    keywords: ["informatique", "développement", "logiciel", "software", "programmation", "dev", "web"],
    nafCodes: ["62.01", "62.02", "63.11"],
    formes: ["SASU", "EURL", "SAS"]
  },
  "digital-web": {
    label: "🌐 Digital & Web",
    keywords: ["digital", "numérique", "web", "internet", "online", "site web"],
    nafCodes: ["62.01", "63.12", "73.11"],
    formes: ["SASU", "EURL", "SAS"]
  },

  // 📢 COMMUNICATION & MARKETING
  "marketing-pub": {
    label: "📢 Marketing & Publicité",
    keywords: ["marketing", "publicité", "pub", "communication", "média", "agence"],
    nafCodes: ["73.11", "73.12"],
    formes: ["SASU", "SAS", "SARL"]
  },

  // ⚡ ENERGIE & ENVIRONNEMENT
  "energie-renouvelable": {
    label: "☀️ Énergie renouvelable",
    keywords: ["énergie", "photovoltaïque", "solaire", "pompe à chaleur", "renouvelable", "panneaux"],
    nafCodes: ["35.11", "43.22", "35.14"],
    formes: ["SARL", "SAS", "EURL"]
  },
  "environnement-recyclage": {
    label: "♻️ Environnement & Recyclage",
    keywords: ["environnement", "recyclage", "déchets", "écologie", "tri", "valorisation"],
    nafCodes: ["38.11", "38.12", "38.21"],
    formes: ["SARL", "SAS"]
  },

  // ⚕️ SANTE & BIEN-ETRE
  "sante-medical": {
    label: "⚕️ Santé & Médical",
    keywords: ["santé", "médical", "pharmacie", "paramédical", "laboratoire", "clinique"],
    nafCodes: ["86.10", "86.21", "86.22", "86.90", "47.73"],
    formes: ["SELARL", "SCP", "SARL"]
  },
  "beaute-coiffure": {
    label: "💇 Beauté & Coiffure",
    keywords: ["coiffure", "coiffeur", "beauté", "esthétique", "cosmétique", "spa"],
    nafCodes: ["96.02"],
    formes: ["SARL", "EURL", "Artisan"]
  },

  // 🏭 INDUSTRIE & PRODUCTION
  "industrie-fabrication": {
    label: "🏭 Industrie & Fabrication",
    keywords: ["industrie", "fabrication", "production", "manufacture", "usine", "producteur"],
    nafCodes: ["10.", "11.", "13.", "14.", "15.", "16.", "17.", "18.", "19.", "20.", "21.", "22.", "23.", "24.", "25.", "26.", "27.", "28.", "29.", "30.", "31.", "32.", "33."],
    formes: ["SA", "SAS", "SARL"]
  },

  // 🌾 AGRICULTURE & VITICULTURE
  "agriculture": {
    label: "🌾 Agriculture & Viticulture",
    keywords: ["agricole", "agriculture", "exploitation", "viticulteur", "viticole", "culture", "élevage"],
    nafCodes: ["01.", "02."],
    formes: ["EARL", "GAEC", "SCEA", "SARL"]
  },

  // 📚 EDUCATION & FORMATION
  "education-formation": {
    label: "📚 Éducation & Formation",
    keywords: ["éducation", "enseignement", "école", "formation", "cours", "soutien", "apprentissage"],
    nafCodes: ["85."],
    formes: ["SARL", "SAS", "Association"]
  },

  // 🔧 ARTISANAT & SERVICES
  "artisanat-reparation": {
    label: "🔨 Artisanat & Réparation",
    keywords: ["artisan", "artisanat", "réparation", "dépannage", "entretien"],
    nafCodes: ["95.", "43.", "45.20"],
    formes: ["EURL", "SARL", "Artisan"]
  },
  "services-personne": {
    label: "🏡 Services à la personne",
    keywords: ["ménage", "nettoyage", "jardinage", "aide à domicile", "services personne"],
    nafCodes: ["81.21", "81.22", "88.10", "88.91"],
    formes: ["SARL", "EURL", "Micro-entreprise"]
  },

  // 🏨 HOTELLERIE & TOURISME
  "hotellerie": {
    label: "🏨 Hôtellerie & Hébergement",
    keywords: ["hôtel", "hébergement", "gîte", "chambre d'hôtes", "camping", "auberge", "résidence"],
    nafCodes: ["55."],
    formes: ["SARL", "SAS", "EURL"]
  },

  // 🎬 CULTURE & SPECTACLES
  "culture-spectacles": {
    label: "🎭 Culture & Spectacles",
    keywords: ["média", "spectacle", "musée", "galerie", "théâtre", "cinéma", "événementiel", "exposition"],
    nafCodes: ["59.", "90.", "91."],
    formes: ["SARL", "SAS", "Association"]
  },

  // ⚽ SPORT & LOISIRS
  "sport-loisirs": {
    label: "⚽ Sport & Loisirs",
    keywords: ["sport", "sportif", "loisirs", "fitness", "gym", "club", "activité physique", "recreation"],
    nafCodes: ["93."],
    formes: ["SARL", "SAS", "Association"]
  },

  // ❓ AUTRES
  "autre": {
    label: "🔄 Autres activités",
    keywords: ["association", "autres", "divers", "non classé"],
    nafCodes: [],
    formes: ["Association", "SARL", "SAS"]
  },
  "activite-non-precisee": {
    label: "❓ Activité non précisée",
    keywords: [],
    nafCodes: [],
    formes: []
  }
};

export function categorizeActivity(activity: string | null, qualifiedCategory?: string | null, codeNaf?: string | null): string {
  // Si une catégorie qualifiée par l'IA existe, l'utiliser en priorité
  if (qualifiedCategory) {
    // Normaliser les variations
    if (qualifiedCategory === 'other') return "autre";
    if (qualifiedCategory === 'santé') return "sante-medical";
    if (qualifiedCategory === 'énergie') return "energie-renouvelable";
    return qualifiedCategory;
  }
  
  // Essayer d'abord par code NAF si disponible
  if (codeNaf) {
    for (const [key, category] of Object.entries(ACTIVITY_CATEGORIES)) {
      if (key === "activite-non-precisee" || key === "autre") continue;
      if (category.nafCodes.some(code => codeNaf.startsWith(code))) {
        return key;
      }
    }
  }
  
  // Sinon, fallback sur la méthode par mots-clés
  if (!activity) return "activite-non-precisee";
  
  const activityLower = activity.toLowerCase();
  
  for (const [key, category] of Object.entries(ACTIVITY_CATEGORIES)) {
    if (key === "activite-non-precisee" || key === "autre") continue;
    if (category.keywords.some(keyword => activityLower.includes(keyword))) {
      return key;
    }
  }
  
  return "activite-non-precisee";
}

export function getCategoryLabel(categoryKey: string): string {
  const category = ACTIVITY_CATEGORIES[categoryKey as keyof typeof ACTIVITY_CATEGORIES];
  return category?.label || "❓ Activité non précisée";
}
