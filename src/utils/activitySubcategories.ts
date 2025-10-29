// Système hiérarchique de catégorisation ultra-détaillé

export interface ActivitySubcategory {
  id: string;
  label: string;
  emoji: string;
  keywords: string[];
  parent: string;
}

export interface ActivityHierarchy {
  [key: string]: {
    label: string;
    emoji: string;
    subcategories: ActivitySubcategory[];
  };
}

export const ACTIVITY_HIERARCHY: ActivityHierarchy = {
  services: {
    label: "💼 Services aux Entreprises",
    emoji: "💼",
    subcategories: [
      {
        id: "conseil_management",
        label: "Conseil & Management",
        emoji: "📊",
        keywords: ["conseil", "consulting", "management", "stratégie", "audit", "coaching", "accompagnement"],
        parent: "services"
      },
      {
        id: "rh_formation",
        label: "RH & Formation",
        emoji: "👥",
        keywords: ["ressources humaines", "rh", "recrutement", "formation", "coaching professionnel", "compétences", "carrière"],
        parent: "services"
      },
      {
        id: "finance_holding",
        label: "Finance & Holdings",
        emoji: "💰",
        keywords: ["holding", "participation", "gestion patrimoine", "investissement", "finance", "capital", "private equity"],
        parent: "services"
      },
      {
        id: "juridique_administratif",
        label: "Juridique & Administratif",
        emoji: "⚖️",
        keywords: ["juridique", "administratif", "secrétariat", "domiciliation", "formalités"],
        parent: "services"
      },
      {
        id: "marketing_com",
        label: "Marketing & Communication",
        emoji: "📢",
        keywords: ["marketing", "communication", "publicité", "événementiel", "relations publiques", "brand"],
        parent: "services"
      },
      {
        id: "nettoyage_maintenance",
        label: "Nettoyage & Maintenance",
        emoji: "🧹",
        keywords: ["nettoyage", "entretien", "maintenance", "ménage", "propreté", "désinsectisation", "dératisation"],
        parent: "services"
      }
    ]
  },
  immobilier: {
    label: "🏠 Immobilier",
    emoji: "🏠",
    subcategories: [
      {
        id: "sci_investissement",
        label: "SCI & Investissement",
        emoji: "🏢",
        keywords: ["sci", "civile immobilière", "investissement", "patrimoine immobilier"],
        parent: "immobilier"
      },
      {
        id: "gestion_locative",
        label: "Gestion Locative",
        emoji: "🔑",
        keywords: ["location", "gestion locative", "bail", "locataire", "loyer"],
        parent: "immobilier"
      },
      {
        id: "promotion_construction",
        label: "Promotion & Construction",
        emoji: "🏗️",
        keywords: ["promotion", "promoteur", "construction", "lotissement", "aménagement"],
        parent: "immobilier"
      },
      {
        id: "transaction_agence",
        label: "Transaction & Agence",
        emoji: "🏘️",
        keywords: ["transaction", "agence immobilière", "vente", "achat", "négociation"],
        parent: "immobilier"
      }
    ]
  },
  commerce: {
    label: "🛍️ Commerce",
    emoji: "🛍️",
    subcategories: [
      {
        id: "detail_alimentaire",
        label: "Commerce Alimentaire",
        emoji: "🛒",
        keywords: ["alimentaire", "épicerie", "supermarché", "primeur", "bio"],
        parent: "commerce"
      },
      {
        id: "detail_non_alimentaire",
        label: "Commerce Non-Alimentaire",
        emoji: "🏪",
        keywords: ["boutique", "magasin", "retail", "prêt-à-porter", "équipement"],
        parent: "commerce"
      },
      {
        id: "ecommerce",
        label: "E-commerce",
        emoji: "💻",
        keywords: ["e-commerce", "vente en ligne", "marketplace", "drop shipping", "web"],
        parent: "commerce"
      },
      {
        id: "grossiste",
        label: "Grossiste & Distribution",
        emoji: "📦",
        keywords: ["grossiste", "distribution", "négoce", "import-export", "fourniture"],
        parent: "commerce"
      },
      {
        id: "franchise",
        label: "Franchise & Réseau",
        emoji: "🔗",
        keywords: ["franchise", "franchisé", "réseau", "enseigne"],
        parent: "commerce"
      }
    ]
  },
  livraison: {
    label: "🚴 Livraison",
    emoji: "🚴",
    subcategories: [
      {
        id: "livraison_repas",
        label: "Livraison de Repas",
        emoji: "🍕",
        keywords: ["livraison repas", "food delivery", "uber eats", "deliveroo"],
        parent: "livraison"
      },
      {
        id: "coursier_express",
        label: "Coursier Express",
        emoji: "🏍️",
        keywords: ["coursier", "express", "urgent", "pli"],
        parent: "livraison"
      },
      {
        id: "livraison_colis",
        label: "Livraison de Colis",
        emoji: "📮",
        keywords: ["colis", "paquet", "dernier kilomètre"],
        parent: "livraison"
      }
    ]
  },
  restauration: {
    label: "🍴 Restauration",
    emoji: "🍴",
    subcategories: [
      {
        id: "restaurant_traditionnel",
        label: "Restaurant Traditionnel",
        emoji: "🍽️",
        keywords: ["restaurant", "gastronomie", "bistrot", "brasserie"],
        parent: "restauration"
      },
      {
        id: "fast_food",
        label: "Fast-Food & Snacking",
        emoji: "🍔",
        keywords: ["fast food", "snack", "sandwicherie", "burger"],
        parent: "restauration"
      },
      {
        id: "traiteur",
        label: "Traiteur & Événementiel",
        emoji: "🥘",
        keywords: ["traiteur", "événementiel", "réception", "buffet"],
        parent: "restauration"
      },
      {
        id: "boulangerie",
        label: "Boulangerie-Pâtisserie",
        emoji: "🥖",
        keywords: ["boulangerie", "pâtisserie", "viennoiserie", "pain"],
        parent: "restauration"
      },
      {
        id: "cafe_bar",
        label: "Café & Bar",
        emoji: "☕",
        keywords: ["café", "bar", "salon de thé", "brasserie"],
        parent: "restauration"
      }
    ]
  },
  technologie: {
    label: "💻 Technologie",
    emoji: "💻",
    subcategories: [
      {
        id: "dev_logiciel",
        label: "Développement Logiciel",
        emoji: "⚙️",
        keywords: ["développement", "logiciel", "software", "application", "programmation"],
        parent: "technologie"
      },
      {
        id: "web_digital",
        label: "Web & Digital",
        emoji: "🌐",
        keywords: ["web", "digital", "site internet", "agence web", "ux ui"],
        parent: "technologie"
      },
      {
        id: "infra_it",
        label: "Infrastructure IT",
        emoji: "🖥️",
        keywords: ["infrastructure", "réseau", "serveur", "cloud", "hébergement"],
        parent: "technologie"
      },
      {
        id: "data_ia",
        label: "Data & Intelligence Artificielle",
        emoji: "🤖",
        keywords: ["data", "intelligence artificielle", "ia", "machine learning", "analyse"],
        parent: "technologie"
      },
      {
        id: "cybersecurite",
        label: "Cybersécurité",
        emoji: "🔒",
        keywords: ["cybersécurité", "sécurité informatique", "protection", "rgpd"],
        parent: "technologie"
      }
    ]
  },
  construction: {
    label: "🏗️ BTP",
    emoji: "🏗️",
    subcategories: [
      {
        id: "gros_oeuvre",
        label: "Gros Œuvre",
        emoji: "🧱",
        keywords: ["maçonnerie", "gros œuvre", "fondation", "structure", "béton"],
        parent: "construction"
      },
      {
        id: "second_oeuvre",
        label: "Second Œuvre",
        emoji: "🔨",
        keywords: ["menuiserie", "plomberie", "électricité", "chauffage", "climatisation"],
        parent: "construction"
      },
      {
        id: "finitions",
        label: "Finitions",
        emoji: "🎨",
        keywords: ["peinture", "carrelage", "revêtement", "parquet", "plâtrerie"],
        parent: "construction"
      },
      {
        id: "travaux_specialises",
        label: "Travaux Spécialisés",
        emoji: "🛠️",
        keywords: ["toiture", "couverture", "isolation", "étanchéité", "ravalement"],
        parent: "construction"
      },
      {
        id: "amenagement",
        label: "Aménagement & Décoration",
        emoji: "🪟",
        keywords: ["aménagement", "décoration", "architecture intérieur", "design"],
        parent: "construction"
      }
    ]
  },
  transport: {
    label: "🚗 Transport",
    emoji: "🚗",
    subcategories: [
      {
        id: "transport_personnes",
        label: "Transport de Personnes",
        emoji: "🚖",
        keywords: ["vtc", "taxi", "uber", "transport personnes", "chauffeur"],
        parent: "transport"
      },
      {
        id: "transport_marchandises",
        label: "Transport de Marchandises",
        emoji: "🚛",
        keywords: ["transport marchandises", "fret", "camion", "messagerie"],
        parent: "transport"
      },
      {
        id: "logistique",
        label: "Logistique & Entreposage",
        emoji: "📦",
        keywords: ["logistique", "entreposage", "stockage", "supply chain"],
        parent: "transport"
      },
      {
        id: "demenagement",
        label: "Déménagement",
        emoji: "📦",
        keywords: ["déménagement", "garde-meuble", "transfert"],
        parent: "transport"
      },
      {
        id: "location_vehicules",
        label: "Location de Véhicules",
        emoji: "🚙",
        keywords: ["location véhicules", "location voiture", "leasing", "utilitaire"],
        parent: "transport"
      }
    ]
  },
  industrie: {
    label: "🏭 Industrie",
    emoji: "🏭",
    subcategories: [
      {
        id: "fabrication",
        label: "Fabrication & Production",
        emoji: "⚙️",
        keywords: ["fabrication", "production", "manufacture", "usine"],
        parent: "industrie"
      },
      {
        id: "transformation",
        label: "Transformation",
        emoji: "🔧",
        keywords: ["transformation", "usinage", "mécanique"],
        parent: "industrie"
      },
      {
        id: "industrie_agro",
        label: "Agroalimentaire",
        emoji: "🌾",
        keywords: ["agroalimentaire", "alimentaire", "transformation alimentaire"],
        parent: "industrie"
      }
    ]
  },
  communication: {
    label: "📢 Communication",
    emoji: "📢",
    subcategories: [
      {
        id: "agence_pub",
        label: "Agence de Publicité",
        emoji: "📺",
        keywords: ["publicité", "agence pub", "création", "campagne"],
        parent: "communication"
      },
      {
        id: "creation_graphique",
        label: "Création Graphique",
        emoji: "🎨",
        keywords: ["graphisme", "design", "création", "identité visuelle"],
        parent: "communication"
      },
      {
        id: "audiovisuel",
        label: "Audiovisuel & Production",
        emoji: "🎬",
        keywords: ["audiovisuel", "vidéo", "production", "montage", "cinéma"],
        parent: "communication"
      },
      {
        id: "edition",
        label: "Édition & Presse",
        emoji: "📰",
        keywords: ["édition", "presse", "publication", "magazine"],
        parent: "communication"
      }
    ]
  },
  energie: {
    label: "⚡ Énergie",
    emoji: "⚡",
    subcategories: [
      {
        id: "solaire",
        label: "Énergie Solaire",
        emoji: "☀️",
        keywords: ["solaire", "photovoltaïque", "panneaux solaires"],
        parent: "energie"
      },
      {
        id: "pompe_chaleur",
        label: "Pompes à Chaleur",
        emoji: "🌡️",
        keywords: ["pompe à chaleur", "pac", "géothermie"],
        parent: "energie"
      },
      {
        id: "renovation_energetique",
        label: "Rénovation Énergétique",
        emoji: "🏡",
        keywords: ["rénovation énergétique", "isolation", "performance énergétique"],
        parent: "energie"
      },
      {
        id: "electricite",
        label: "Électricité",
        emoji: "⚡",
        keywords: ["électricité", "électricien", "installation électrique"],
        parent: "energie"
      }
    ]
  },
  sante: {
    label: "⚕️ Santé",
    emoji: "⚕️",
    subcategories: [
      {
        id: "medical",
        label: "Professions Médicales",
        emoji: "👨‍⚕️",
        keywords: ["médecin", "médical", "cabinet médical", "clinique"],
        parent: "sante"
      },
      {
        id: "paramedical",
        label: "Professions Paramédicales",
        emoji: "💉",
        keywords: ["infirmier", "kinésithérapeute", "paramédical", "ostéopathe"],
        parent: "sante"
      },
      {
        id: "pharmacie",
        label: "Pharmacie",
        emoji: "💊",
        keywords: ["pharmacie", "médicament", "parapharmacie"],
        parent: "sante"
      },
      {
        id: "bien_etre",
        label: "Bien-être & Esthétique",
        emoji: "💆",
        keywords: ["bien-être", "spa", "esthétique", "beauté", "coiffure", "cosmétique"],
        parent: "sante"
      },
      {
        id: "materiel_medical",
        label: "Matériel Médical",
        emoji: "🩺",
        keywords: ["matériel médical", "équipement médical", "dispositif médical"],
        parent: "sante"
      }
    ]
  },
  agriculture: {
    label: "🌾 Agriculture",
    emoji: "🌾",
    subcategories: [
      {
        id: "culture",
        label: "Cultures & Céréales",
        emoji: "🌱",
        keywords: ["culture", "céréales", "maraîchage", "exploitation agricole"],
        parent: "agriculture"
      },
      {
        id: "elevage",
        label: "Élevage",
        emoji: "🐄",
        keywords: ["élevage", "bovin", "porcin", "avicole"],
        parent: "agriculture"
      },
      {
        id: "viticulture",
        label: "Viticulture",
        emoji: "🍇",
        keywords: ["viticulteur", "viticulture", "vigne", "vin", "vinicole"],
        parent: "agriculture"
      },
      {
        id: "arboriculture",
        label: "Arboriculture & Horticulture",
        emoji: "🌳",
        keywords: ["arboriculture", "horticulture", "pépinière", "maraîcher"],
        parent: "agriculture"
      }
    ]
  },
  education: {
    label: "📚 Éducation",
    emoji: "📚",
    subcategories: [
      {
        id: "enseignement",
        label: "Enseignement & École",
        emoji: "🎓",
        keywords: ["enseignement", "école", "collège", "lycée", "professeur"],
        parent: "education"
      },
      {
        id: "formation_pro",
        label: "Formation Professionnelle",
        emoji: "📖",
        keywords: ["formation professionnelle", "organisme formation", "cpf"],
        parent: "education"
      },
      {
        id: "soutien_scolaire",
        label: "Soutien Scolaire",
        emoji: "✏️",
        keywords: ["soutien scolaire", "cours particuliers", "tutorat"],
        parent: "education"
      },
      {
        id: "petite_enfance",
        label: "Petite Enfance",
        emoji: "👶",
        keywords: ["crèche", "petite enfance", "garde d'enfants", "assistante maternelle"],
        parent: "education"
      }
    ]
  },
  artisanat: {
    label: "🔧 Artisanat",
    emoji: "🔧",
    subcategories: [
      {
        id: "reparation",
        label: "Réparation",
        emoji: "🔧",
        keywords: ["réparation", "dépannage", "maintenance"],
        parent: "artisanat"
      },
      {
        id: "services_personne",
        label: "Services à la Personne",
        emoji: "🏠",
        keywords: ["services à la personne", "aide à domicile", "ménage"],
        parent: "artisanat"
      },
      {
        id: "jardinage",
        label: "Jardinage & Paysagisme",
        emoji: "🌿",
        keywords: ["jardinage", "paysagiste", "espaces verts", "jardinier"],
        parent: "artisanat"
      },
      {
        id: "artisanat_art",
        label: "Artisanat d'Art",
        emoji: "🎨",
        keywords: ["artisanat art", "créateur", "fait main", "artisan"],
        parent: "artisanat"
      }
    ]
  },
  finance: {
    label: "💰 Finance",
    emoji: "💰",
    subcategories: [
      {
        id: "banque",
        label: "Banque",
        emoji: "🏦",
        keywords: ["banque", "crédit", "bancaire"],
        parent: "finance"
      },
      {
        id: "assurance",
        label: "Assurance",
        emoji: "🛡️",
        keywords: ["assurance", "courtier assurance", "mutuelle"],
        parent: "finance"
      },
      {
        id: "comptabilite",
        label: "Comptabilité & Expertise",
        emoji: "📊",
        keywords: ["comptabilité", "expert-comptable", "audit comptable"],
        parent: "finance"
      },
      {
        id: "gestion_patrimoine",
        label: "Gestion de Patrimoine",
        emoji: "💎",
        keywords: ["gestion patrimoine", "conseiller financier", "investissement"],
        parent: "finance"
      }
    ]
  },
  culture: {
    label: "🎨 Culture & Loisirs",
    emoji: "🎨",
    subcategories: [
      {
        id: "spectacle",
        label: "Spectacle & Événementiel",
        emoji: "🎭",
        keywords: ["spectacle", "concert", "événementiel", "salle spectacle"],
        parent: "culture"
      },
      {
        id: "sport",
        label: "Sport & Fitness",
        emoji: "⚽",
        keywords: ["sport", "fitness", "salle sport", "coach sportif"],
        parent: "culture"
      },
      {
        id: "loisirs",
        label: "Loisirs & Divertissement",
        emoji: "🎯",
        keywords: ["loisirs", "divertissement", "activité", "escape game"],
        parent: "culture"
      },
      {
        id: "musee_galerie",
        label: "Musée & Galerie",
        emoji: "🖼️",
        keywords: ["musée", "galerie", "exposition", "art"],
        parent: "culture"
      }
    ]
  },
  juridique: {
    label: "⚖️ Juridique",
    emoji: "⚖️",
    subcategories: [
      {
        id: "avocat",
        label: "Avocat",
        emoji: "👨‍⚖️",
        keywords: ["avocat", "cabinet avocat", "droit"],
        parent: "juridique"
      },
      {
        id: "notaire",
        label: "Notaire",
        emoji: "📜",
        keywords: ["notaire", "office notarial", "acte"],
        parent: "juridique"
      },
      {
        id: "huissier",
        label: "Huissier",
        emoji: "⚖️",
        keywords: ["huissier", "constat", "recouvrement"],
        parent: "juridique"
      }
    ]
  }
};

// Fonction pour obtenir toutes les sous-catégories d'une catégorie
export function getSubcategories(categoryKey: string): ActivitySubcategory[] {
  const category = ACTIVITY_HIERARCHY[categoryKey];
  return category?.subcategories || [];
}

// Synonymes de sous-catégories pour compatibilité (backend -> canonique UI)
export const SUBCATEGORY_SYNONYMS: Record<string, string> = {
  // Services
  juridique_admin: "juridique_administratif",
  finance_holdings: "finance_holding",
  marketing_comm: "marketing_com",
  
  // Immobilier
  gestion_immo: "gestion_locative",
  promotion: "promotion_construction",
  agent_immo: "transaction_agence",
  investissement_immo: "sci_investissement",
  
  // Commerce
  commerce_gros: "grossiste",
  commerce_detail: "detail_non_alimentaire",
  
  // Technologie
  dev_software: "dev_logiciel",
  ia_data: "data_ia",
  
  // BTP & Construction  
  renovation: "renovation_energetique",
  genie_civil: "travaux_specialises",
  
  // Transport
  transport_routier: "transport_marchandises",
  
  // Industrie
  agro_alimentaire: "industrie_agro",
  mecanique: "transformation",
  chimie: "transformation",
  
  // Santé
  services_sante: "materiel_medical",
  coiffure_beaute: "bien_etre",
  
  // Énergie
  renouvelable: "renovation_energetique",
  gaz_chauffage: "pompe_chaleur",
  
  // Agriculture
  cultures: "culture",
  services_agricoles: "culture",
  
  // Mapping direct pour les IDs identiques (évite les lookups inutiles)
  nettoyage_maintenance: "nettoyage_maintenance",
  conseil_management: "conseil_management",
  rh_formation: "rh_formation",
  assurance: "assurance",
  electricite: "electricite",
  elevage: "elevage",
  enseignement: "enseignement",
  formation_pro: "formation_pro",
  cybersecurite: "cybersecurite",
  reparation: "reparation",
  franchise: "franchise",
  ecommerce: "ecommerce",
  fabrication: "fabrication",
  logistique: "logistique",
  demenagement: "demenagement",
  medical: "medical",
  paramedical: "paramedical",
  gros_oeuvre: "gros_oeuvre",
  second_oeuvre: "second_oeuvre",
  infra_it: "infra_it",
  
  // Mapping approximatif pour sous-catégories sans équivalent exact
  securite: "nettoyage_maintenance",
  evenementiel: "marketing_com",
};

export function normalizeSubcategoryId(id?: string | null): string | null {
  if (!id) return null;
  return SUBCATEGORY_SYNONYMS[id] || id;
}

// Fonction pour obtenir le label d'une sous-catégorie
export function getSubcategoryLabel(subcategoryId: string): string {
  const normalized = normalizeSubcategoryId(subcategoryId) || subcategoryId;
  for (const category of Object.values(ACTIVITY_HIERARCHY)) {
    const subcategory = category.subcategories.find(sub => sub.id === normalized);
    if (subcategory) {
      return `${subcategory.emoji} ${subcategory.label}`;
    }
  }
  return normalized;
}

// Fonction pour déterminer la sous-catégorie d'une activité
export function categorizeActivityDetailed(
  activity: string | null,
  categoryKey: string | null
): string | null {
  if (!activity || !categoryKey) return null;
  
  const activityLower = activity.toLowerCase();
  const category = ACTIVITY_HIERARCHY[categoryKey];
  
  if (!category) return null;
  
  // Chercher la première sous-catégorie dont les mots-clés matchent
  for (const subcategory of category.subcategories) {
    if (subcategory.keywords.some(keyword => activityLower.includes(keyword))) {
      return subcategory.id;
    }
  }
  
  return null;
}

// Fonction pour obtenir tous les labels de la hiérarchie (catégorie + sous-catégorie)
export function getFullCategoryLabel(
  categoryKey: string,
  subcategoryId?: string | null
): string {
  const category = ACTIVITY_HIERARCHY[categoryKey];
  if (!category) return "❓ Non catégorisé";
  
  if (!subcategoryId) return category.label;
  const normalized = normalizeSubcategoryId(subcategoryId);
  const subcategory = category.subcategories.find(sub => sub.id === normalized);
  if (!subcategory) return category.label;
  
  return `${category.emoji} ${category.label.replace(category.emoji, '').trim()} › ${subcategory.emoji} ${subcategory.label}`;
}
