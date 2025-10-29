// Définition des 28 catégories principales détaillées
export const ACTIVITY_CATEGORIES: Record<string, { label: string; keywords: string[] }> = {
  // Immobilier (4 catégories)
  immobilier_commercial: {
    label: "🏢 Immobilier commercial",
    keywords: ["immobilier commercial", "bureau", "local commercial", "entrepôt", "locaux professionnels", "investissement immobilier commercial"]
  },
  immobilier_residentiel: {
    label: "🏘️ Immobilier résidentiel",
    keywords: ["immobilier résidentiel", "appartement", "maison", "logement", "habitation", "résidence", "location", "vente immobilier"]
  },
  promotion_immobiliere: {
    label: "🏗️ Promotion immobilière",
    keywords: ["promotion immobilière", "promoteur", "construction immobilière", "lotissement", "programme immobilier"]
  },
  gestion_patrimoine_immo: {
    label: "🏛️ Gestion de patrimoine immobilier",
    keywords: ["gestion patrimoine", "syndic", "administration biens", "copropriété", "gestion locative", "sci", "civile immobilière"]
  },

  // Services professionnels (6 catégories)
  conseil_strategie: {
    label: "💼 Conseil & Stratégie",
    keywords: ["conseil", "stratégie", "consulting", "management", "organisation", "conseil entreprise", "accompagnement", "holding"]
  },
  comptabilite_gestion: {
    label: "🧾 Comptabilité & Gestion",
    keywords: ["comptabilité", "comptable", "expert-comptable", "gestion", "paie", "fiscalité", "commissaire aux comptes"]
  },
  juridique_notariat: {
    label: "⚖️ Juridique & Notariat",
    keywords: ["juridique", "avocat", "notaire", "droit", "légal", "contentieux", "justice", "administratif"]
  },
  audit_expertise: {
    label: "📊 Audit & Expertise",
    keywords: ["audit", "expertise", "contrôle", "certification", "vérification", "évaluation"]
  },
  marketing_communication: {
    label: "🎯 Marketing & Communication",
    keywords: ["marketing", "communication", "publicité", "relation publique", "digital marketing", "réseaux sociaux", "événementiel", "agence", "pub"]
  },
  securite_surveillance: {
    label: "🔐 Sécurité & Surveillance",
    keywords: ["sécurité", "surveillance", "gardiennage", "protection", "agent sécurité", "alarme"]
  },

  // Commerce (4 catégories)
  commerce_detail: {
    label: "🛍️ Commerce de détail",
    keywords: ["commerce détail", "magasin", "boutique", "vente détail", "retail", "distribution"]
  },
  commerce_gros: {
    label: "📦 Commerce de gros",
    keywords: ["commerce gros", "grossiste", "import export", "distribution gros"]
  },
  ecommerce: {
    label: "🌐 E-commerce",
    keywords: ["e-commerce", "vente ligne", "commerce électronique", "marketplace", "plateforme vente"]
  },
  negoce: {
    label: "🚚 Négoce",
    keywords: ["négoce", "négoce matériaux", "distribution spécialisée", "approvisionnement"]
  },

  // Construction & BTP (4 catégories)
  gros_oeuvre: {
    label: "🏗️ Gros œuvre",
    keywords: ["gros œuvre", "maçonnerie", "construction", "béton", "charpente", "fondation", "terrassement", "bâtiment", "btp"]
  },
  second_oeuvre: {
    label: "🔧 Second œuvre",
    keywords: ["second œuvre", "plomberie", "électricité", "chauffage", "climatisation", "menuiserie"]
  },
  finitions_decoration: {
    label: "🎨 Finitions & Décoration",
    keywords: ["finitions", "peinture", "décoration", "revêtement", "aménagement intérieur", "carrelage"]
  },
  renovation_entretien: {
    label: "🏡 Rénovation & Entretien",
    keywords: ["rénovation", "entretien", "maintenance", "réparation", "restauration", "réhabilitation", "travaux"]
  },

  // Technologie (4 catégories)
  developpement_logiciel: {
    label: "💻 Développement logiciel",
    keywords: ["développement logiciel", "programmation", "software", "application", "développeur", "génie logiciel"]
  },
  web_digital: {
    label: "🌐 Web & Digital",
    keywords: ["web", "digital", "internet", "site web", "développement web", "agence web", "numérique"]
  },
  it_infrastructure: {
    label: "📱 IT & Infrastructure",
    keywords: ["informatique", "IT", "infrastructure", "réseau", "système information", "serveur", "cloud", "tech"]
  },
  ia_innovation: {
    label: "🤖 IA & Innovation",
    keywords: ["intelligence artificielle", "IA", "innovation", "recherche développement", "technologie avancée", "robotique"]
  },

  // Restauration & Hôtellerie (4 catégories)
  restauration_traditionnelle: {
    label: "🍴 Restauration traditionnelle",
    keywords: ["restaurant", "restauration", "cuisine", "gastronomie", "brasserie", "bistrot", "traiteur"]
  },
  cafes_bars: {
    label: "☕ Cafés & Bars",
    keywords: ["café", "bar", "bar à vin", "débit boissons", "salon de thé"]
  },
  hotellerie_hebergement: {
    label: "🏨 Hôtellerie & Hébergement",
    keywords: ["hôtel", "hébergement", "gîte", "chambre hôtes", "camping", "auberge", "résidence hôtelière"]
  },
  boulangerie_patisserie: {
    label: "🍰 Boulangerie & Pâtisserie",
    keywords: ["boulangerie", "pâtisserie", "boulanger", "pâtissier", "viennoiserie", "alimentation"]
  },

  // Transport & Logistique (4 catégories)
  transport_personnes: {
    label: "🚗 Transport de personnes",
    keywords: ["transport personnes", "taxi", "VTC", "transport commun", "autocar", "navette"]
  },
  transport_marchandises: {
    label: "📦 Transport de marchandises",
    keywords: ["transport marchandises", "transporteur", "fret", "logistique transport", "messagerie"]
  },
  livraison_coursier: {
    label: "🚴 Livraison & Coursier",
    keywords: ["livraison", "coursier", "express", "livraison rapide", "distribution colis", "livreur", "vélo", "repas", "uber", "deliveroo"]
  },
  logistique_entreposage: {
    label: "📍 Logistique & Entreposage",
    keywords: ["logistique", "entreposage", "stockage", "entrepôt", "supply chain", "préparation commande", "déménagement"]
  },

  // Santé & Bien-être (4 catégories)
  sante_paramedical: {
    label: "⚕️ Santé & Paramédical",
    keywords: ["santé", "médical", "paramédical", "médecin", "infirmier", "pharmacie", "soin"]
  },
  coiffure_esthetique: {
    label: "💇 Coiffure & Esthétique",
    keywords: ["coiffure", "coiffeur", "esthétique", "beauté", "salon beauté", "spa", "institut beauté", "cosmétique"]
  },
  sport_fitness: {
    label: "💪 Sport & Fitness",
    keywords: ["sport", "fitness", "gym", "salle sport", "musculation", "coach sportif", "activité physique", "sportif"]
  },
  bienetre_relaxation: {
    label: "🧘 Bien-être & Relaxation",
    keywords: ["bien-être", "relaxation", "massage", "yoga", "méditation", "thérapie alternative"]
  },

  // Industrie (4 catégories)
  industrie_manufacturiere: {
    label: "🏭 Industrie manufacturière",
    keywords: ["industrie", "manufacturier", "fabrication", "production", "usine", "manufacture", "producteur"]
  },
  mecanique_metallurgie: {
    label: "⚙️ Mécanique & Métallurgie",
    keywords: ["mécanique", "métallurgie", "usinage", "chaudronnerie", "soudure", "métaux"]
  },
  electronique_electrique: {
    label: "🔌 Électronique & Électrique",
    keywords: ["électronique", "électrique", "électrotechnique", "composants électroniques", "câblage"]
  },
  conditionnement_emballage: {
    label: "📦 Conditionnement & Emballage",
    keywords: ["conditionnement", "emballage", "packaging", "impression", "étiquetage"]
  },

  // Énergie & Environnement (4 catégories)
  energie_electricite: {
    label: "⚡ Énergie & Électricité",
    keywords: ["énergie", "électricité", "production énergie", "distribution énergie", "fournisseur énergie"]
  },
  environnement_recyclage: {
    label: "♻️ Environnement & Recyclage",
    keywords: ["environnement", "recyclage", "déchets", "traitement déchets", "collecte", "écologie"]
  },
  energies_renouvelables: {
    label: "🌱 Énergies renouvelables",
    keywords: ["énergies renouvelables", "solaire", "éolien", "photovoltaïque", "biomasse", "vert", "pompe à chaleur", "durable"]
  },
  eau_assainissement: {
    label: "💧 Eau & Assainissement",
    keywords: ["eau", "assainissement", "traitement eau", "épuration", "réseau eau"]
  },

  // Agriculture (4 catégories)
  agriculture_elevage: {
    label: "🌾 Agriculture & Élevage",
    keywords: ["agriculture", "agricole", "élevage", "exploitation agricole", "culture", "ferme"]
  },
  viticulture: {
    label: "🍇 Viticulture",
    keywords: ["viticulture", "vigne", "vin", "viticulteur", "viticole", "cave", "domaine viticole"]
  },
  horticulture_pepinieres: {
    label: "🌿 Horticulture & Pépinières",
    keywords: ["horticulture", "pépinière", "jardinerie", "paysagiste", "espaces verts", "arboriculture", "jardinage"]
  },
  agroalimentaire: {
    label: "🥖 Agroalimentaire",
    keywords: ["agroalimentaire", "alimentaire", "transformation alimentaire", "produits alimentaires", "food"]
  },

  // Éducation (3 catégories)
  enseignement: {
    label: "📚 Enseignement",
    keywords: ["enseignement", "éducation", "école", "cours", "professeur", "pédagogie", "soutien", "apprentissage"]
  },
  formation_professionnelle: {
    label: "🎓 Formation professionnelle",
    keywords: ["formation professionnelle", "formation continue", "organisme formation", "formation"]
  },
  petite_enfance: {
    label: "👶 Petite enfance",
    keywords: ["petite enfance", "crèche", "garderie", "puériculture", "assistante maternelle"]
  },

  // Finance (3 catégories)
  banque_finance: {
    label: "💰 Banque & Finance",
    keywords: ["banque", "finance", "établissement financier", "crédit", "investissement"]
  },
  assurance: {
    label: "🛡️ Assurance",
    keywords: ["assurance", "assureur", "mutuelle", "prévoyance", "garantie"]
  },
  courtage_intermediation: {
    label: "💳 Courtage & Intermédiation",
    keywords: ["courtage", "courtier", "intermédiation", "intermédiaire financier", "bourse", "gestion patrimoine"]
  },

  // Médias & Culture (4 catégories)
  audiovisuel_production: {
    label: "🎬 Audiovisuel & Production",
    keywords: ["audiovisuel", "production", "cinéma", "vidéo", "télévision", "film"]
  },
  presse_edition: {
    label: "📰 Presse & Édition",
    keywords: ["presse", "édition", "journal", "magazine", "publication", "maison édition"]
  },
  art_galeries: {
    label: "🎨 Art & Galeries",
    keywords: ["art", "galerie", "artiste", "œuvre art", "musée"]
  },
  spectacle_evenementiel: {
    label: "🎭 Spectacle & Événementiel",
    keywords: ["spectacle", "théâtre", "concert", "événement", "organisation événement", "exposition", "loisirs"]
  },

  // Artisanat & Services (3 catégories)
  artisanat_technique: {
    label: "🔧 Artisanat technique",
    keywords: ["artisanat", "artisan", "métier art", "fabrication artisanale", "savoir-faire", "réparation"]
  },
  services_domicile: {
    label: "🧹 Services à domicile",
    keywords: ["services domicile", "ménage", "aide domicile", "assistance", "entretien domicile", "nettoyage"]
  },
  pressing_blanchisserie: {
    label: "👔 Pressing & Blanchisserie",
    keywords: ["pressing", "blanchisserie", "nettoyage", "laverie", "entretien textile"]
  },

  // Autres (2 catégories)
  associations: {
    label: "🤝 Associations",
    keywords: ["association", "ONG", "organisme but non lucratif", "association loi 1901"]
  },
  activite_non_precise: {
    label: "❓ Activité non précisée",
    keywords: ["autre", "non classé", "non précisé", "divers"]
  }
};

/**
 * Catégorise une activité en fonction de ses mots-clés
 * Amélioration: scoring pour gérer les ambiguïtés
 */
export function categorizeActivity(activity: string | null, qualifiedCategory?: string | null): string {
  // Si une catégorie qualifiée existe et est valide, on la retourne
  if (qualifiedCategory && ACTIVITY_CATEGORIES[qualifiedCategory]) {
    return qualifiedCategory;
  }

  if (!activity) {
    return "activite_non_precise";
  }

  const activityLower = activity.toLowerCase();
  const scores: Record<string, number> = {};

  // Calculer un score pour chaque catégorie
  Object.entries(ACTIVITY_CATEGORIES).forEach(([categoryKey, categoryData]) => {
    let score = 0;
    
    categoryData.keywords.forEach((keyword) => {
      if (activityLower.includes(keyword.toLowerCase())) {
        // Plus le mot-clé est long, plus il est spécifique et pertinent
        score += keyword.length;
      }
    });

    if (score > 0) {
      scores[categoryKey] = score;
    }
  });

  // Trouver la catégorie avec le meilleur score
  const sortedCategories = Object.entries(scores)
    .sort(([, scoreA], [, scoreB]) => scoreB - scoreA);

  if (sortedCategories.length > 0) {
    return sortedCategories[0][0];
  }

  return "activite_non_precise";
}

/**
 * Retourne le label d'une catégorie
 */
export function getCategoryLabel(categoryKey: string): string {
  return ACTIVITY_CATEGORIES[categoryKey]?.label || "❓ Activité non précisée";
}
