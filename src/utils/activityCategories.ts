// Catégories d'activités étendues avec leurs mots-clés
export const ACTIVITY_CATEGORIES = {
  "activité non précisée": {
    label: "❓ Activité non précisée",
    keywords: []
  },
  services: {
    label: "💼 Services & Holdings",
    keywords: ["conseil", "consulting", "formation", "audit", "expertise", "holding", "gestion", "participations", "services"]
  },
  immobilier: {
    label: "🏠 Immobilier & SCI",
    keywords: ["immobil", "location", "agence", "foncier", "bail", "propriété", "lotissement", "sci", "civile immobilière"]
  },
  commerce: {
    label: "🛍️ Commerce & Distribution",
    keywords: ["commerce", "vente", "magasin", "boutique", "négoce", "retail", "distribution", "e-commerce"]
  },
  livraison: {
    label: "🚴 Livraison / Coursier",
    keywords: ["coursier", "livraison", "livreur", "vélo", "repas", "uber", "deliveroo", "plateformes"]
  },
  restauration: {
    label: "🍴 Restauration & Alimentation",
    keywords: ["restaura", "café", "bar", "alimentation", "traiteur", "boulang", "pâtiss", "food", "cuisine"]
  },
  technologie: {
    label: "💻 Technologie & Numérique",
    keywords: ["informatique", "logiciel", "digital", "web", "développement", "software", "numérique", "tech", "it"]
  },
  construction: {
    label: "🏗️ BTP / Construction",
    keywords: ["construction", "bâtiment", "travaux", "maçon", "plomberie", "électricité", "menuiserie", "carrelage", "peinture", "rénovation", "chantier"]
  },
  transport: {
    label: "🚗 Transport & Logistique",
    keywords: ["transport", "vtc", "logistique", "déménagement", "taxi", "location de véhicules", "fret"]
  },
  industrie: {
    label: "🏭 Industrie & Production",
    keywords: ["industrie", "fabrication", "production", "manufacture", "usine", "producteur"]
  },
  communication: {
    label: "📢 Communication & Marketing",
    keywords: ["communication", "marketing", "publicité", "média", "agence", "pub"]
  },
  energie: {
    label: "⚡ Énergie & Environnement",
    keywords: ["énergie", "électrique", "photovoltaïque", "pompe à chaleur", "renouvelable", "solaire", "environnement"]
  },
  sante: {
    label: "⚕️ Santé & Bien-être",
    keywords: ["santé", "médical", "pharmacie", "cosmétique", "beauté", "coiffure", "esthétique", "paramédical"]
  },
  agriculture: {
    label: "🌾 Agriculture & Viticulture",
    keywords: ["agricole", "agriculture", "exploitation", "viticulteur", "viticole", "culture", "élevage"]
  },
  education: {
    label: "📚 Éducation & Formation",
    keywords: ["éducation", "enseignement", "école", "formation", "cours", "soutien", "apprentissage"]
  },
  artisanat: {
    label: "🔧 Artisanat & Services à la personne",
    keywords: ["artisan", "artisanat", "réparation", "entretien", "ménage", "nettoyage", "jardinage"]
  },
  finance: {
    label: "💰 Finance & Assurance",
    keywords: ["finance", "banque", "assurance", "crédit", "gestion patrimoine", "comptabilité"]
  },
  hotellerie: {
    label: "🏨 Hôtellerie & Hébergement",
    keywords: ["hôtel", "hébergement", "gîte", "chambre d'hôtes", "camping", "auberge", "résidence"]
  },
  media: {
    label: "🎬 Médias & Spectacles",
    keywords: ["média", "spectacle", "musée", "galerie", "théâtre", "cinéma", "événementiel", "exposition"]
  },
  sport: {
    label: "⚽ Sport & Loisirs",
    keywords: ["sport", "sportif", "loisirs", "fitness", "gym", "club", "activité physique", "recreation"]
  },
  environnement: {
    label: "🌱 Environnement & Écologie",
    keywords: ["environnement", "écologie", "recyclage", "déchets", "nature", "durable", "bio"]
  },
  juridique: {
    label: "⚖️ Juridique & Administratif",
    keywords: ["juridique", "avocat", "notaire", "droit", "administratif", "légal"]
  },
  autre: {
    label: "🔄 Autres activités",
    keywords: ["association", "autres", "divers", "non classé"]
  }
};

export function categorizeActivity(activity: string | null, qualifiedCategory?: string | null): string {
  // Si une catégorie qualifiée par l'IA existe, l'utiliser en priorité
  if (qualifiedCategory) {
    // Normaliser les variations
    if (qualifiedCategory === 'other') return "activité non précisée";
    if (qualifiedCategory === 'santé') return "sante";
    if (qualifiedCategory === 'énergie') return "energie";
    return qualifiedCategory;
  }
  
  // Sinon, fallback sur la méthode par mots-clés
  if (!activity) return "activité non précisée";
  
  const activityLower = activity.toLowerCase();
  
  for (const [key, category] of Object.entries(ACTIVITY_CATEGORIES)) {
    if (key === "activité non précisée") continue; // Skip la catégorie par défaut
    if (category.keywords.some(keyword => activityLower.includes(keyword))) {
      return key;
    }
  }
  
  return "activité non précisée";
}

export function getCategoryLabel(categoryKey: string): string {
  const category = ACTIVITY_CATEGORIES[categoryKey as keyof typeof ACTIVITY_CATEGORIES];
  return category?.label || "❓ Activité non précisée";
}
