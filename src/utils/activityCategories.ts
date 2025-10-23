// Catégories d'activités avec leurs mots-clés
export const ACTIVITY_CATEGORIES = {
  livraison: {
    label: "🚴 Livraison / Coursier",
    keywords: ["coursier", "livraison", "livreur", "vélo", "repas", "uber", "deliveroo"]
  },
  immobilier: {
    label: "🏠 Immobilier & SCI",
    keywords: ["immobil", "location", "agence", "foncier", "bail", "propriété", "lotissement", "sci", "civile immobilière"]
  },
  construction: {
    label: "🏗️ BTP / Construction",
    keywords: ["construction", "bâtiment", "travaux", "maçon", "plomberie", "électricité", "menuiserie", "carrelage", "peinture", "rénovation", "chantier"]
  },
  restauration: {
    label: "🍴 Restauration",
    keywords: ["restaura", "café", "bar", "alimentation", "traiteur", "boulang", "pâtiss"]
  },
  commerce: {
    label: "🛍️ Commerce",
    keywords: ["commerce", "vente", "magasin", "boutique", "négoce", "retail", "distribution"]
  },
  energie: {
    label: "⚡ Énergie",
    keywords: ["énergie", "électrique", "photovoltaïque", "pompe à chaleur", "renouvelable", "solaire"]
  },
  transport: {
    label: "🚗 Transport & Logistique",
    keywords: ["transport", "vtc", "logistique", "déménagement", "taxi", "location de véhicules"]
  },
  technologie: {
    label: "💻 Technologie",
    keywords: ["informatique", "logiciel", "digital", "web", "développement", "software", "numérique", "tech"]
  },
  services: {
    label: "💼 Services & Holdings",
    keywords: ["conseil", "consulting", "formation", "audit", "expertise", "holding", "gestion", "participations"]
  },
  sante: {
    label: "⚕️ Santé / Bien-être",
    keywords: ["santé", "médical", "pharmacie", "cosmétique", "beauté", "coiffure", "esthétique"]
  },
  industrie: {
    label: "🏭 Industrie",
    keywords: ["industrie", "fabrication", "production", "manufacture", "usine"]
  },
  communication: {
    label: "📢 Communication",
    keywords: ["communication", "marketing", "publicité", "média", "agence"]
  }
};

export function categorizeActivity(activity: string | null): string {
  if (!activity) return "other";
  
  const activityLower = activity.toLowerCase();
  
  // Chercher la première catégorie qui match
  for (const [key, category] of Object.entries(ACTIVITY_CATEGORIES)) {
    if (category.keywords.some(keyword => activityLower.includes(keyword))) {
      return key;
    }
  }
  
  return "other";
}

export function getCategoryLabel(categoryKey: string): string {
  if (categoryKey === "other") return "🔹 Autre";
  return ACTIVITY_CATEGORIES[categoryKey as keyof typeof ACTIVITY_CATEGORIES]?.label || "🔹 Autre";
}
