import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Activity hierarchy and categorization logic
const ACTIVITY_HIERARCHY = {
  services: {
    label: "Services aux Entreprises",
    emoji: "💼",
    subcategories: [
      { id: "conseil_management", label: "Conseil & Management", emoji: "📊", keywords: ["conseil", "consulting", "management", "stratégie", "audit", "expertise comptable", "expert comptable", "expert-comptable", "commissaire aux comptes", "comptabilité"], parent: "services" },
      { id: "rh_formation", label: "RH & Formation", emoji: "👥", keywords: ["formation", "recrutement", "ressources humaines", "rh", "coaching", "consulting rh", "cabinet de recrutement"], parent: "services" },
      { id: "finance_holdings", label: "Finance & Holdings", emoji: "🏦", keywords: ["holding", "finance", "investissement", "capital", "gestion patrimoine", "participation", "portefeuille", "valeurs mobilières"], parent: "services" },
      { id: "juridique_admin", label: "Juridique & Administratif", emoji: "⚖️", keywords: ["juridique", "avocat", "notaire", "administratif", "secrétariat", "cabinet juridique", "cabinet d'avocat"], parent: "services" },
      { id: "marketing_comm", label: "Marketing & Communication", emoji: "📢", keywords: ["marketing", "communication", "publicité", "digital", "web", "seo", "relations presse", "relations publiques", "agence de communication"], parent: "services" },
      { id: "nettoyage_maintenance", label: "Nettoyage & Maintenance", emoji: "🧹", keywords: ["nettoyage", "entretien", "maintenance", "propreté", "hygiène"], parent: "services" },
      { id: "securite", label: "Sécurité", emoji: "🛡️", keywords: ["sécurité", "gardiennage", "surveillance", "protection"], parent: "services" },
      { id: "evenementiel", label: "Événementiel", emoji: "🎉", keywords: ["événementiel", "traiteur", "réception", "organisation", "spectacle vivant"], parent: "services" },
    ]
  },
  immobilier: {
    label: "Immobilier",
    emoji: "🏢",
    subcategories: [
      { id: "promotion", label: "Promotion Immobilière", emoji: "🏗️", keywords: ["promotion immobilière", "promoteur", "construction immobilière"], parent: "immobilier" },
      { id: "gestion_immo", label: "Gestion Immobilière", emoji: "🔑", keywords: ["gestion immobilière", "syndic", "copropriété", "location", "administrateur de biens"], parent: "immobilier" },
      { id: "agent_immo", label: "Agent Immobilier", emoji: "🏠", keywords: ["agent immobilier", "transaction immobilière", "vente immobilière", "agence immobilière"], parent: "immobilier" },
      { id: "investissement_immo", label: "Investissement Immobilier", emoji: "💰", keywords: ["investissement immobilier", "sci", "foncière", "marchand de biens", "société civile immobilière"], parent: "immobilier" },
    ]
  },
  commerce: {
    label: "Commerce",
    emoji: "🛒",
    subcategories: [
      { id: "commerce_gros", label: "Commerce de Gros", emoji: "📦", keywords: ["commerce de gros", "grossiste", "import", "export", "distribution"], parent: "commerce" },
      { id: "commerce_detail", label: "Commerce de Détail", emoji: "🏪", keywords: ["commerce de détail", "magasin", "boutique", "vente au détail"], parent: "commerce" },
      { id: "ecommerce", label: "E-commerce", emoji: "💻", keywords: ["e-commerce", "vente en ligne", "marketplace", "boutique en ligne"], parent: "commerce" },
      { id: "franchise", label: "Franchise", emoji: "🔗", keywords: ["franchise", "franchisé", "réseau"], parent: "commerce" },
    ]
  },
  technologie: {
    label: "Technologie",
    emoji: "💻",
    subcategories: [
      { id: "dev_software", label: "Développement Logiciel", emoji: "⚙️", keywords: ["développement", "logiciel", "software", "application", "programmation", "site internet", "site web", "création de sites", "prestations informatiques", "ingénierie", "systèmes embarqués", "bureau d'étude technique"], parent: "technologie" },
      { id: "infra_it", label: "Infrastructure IT", emoji: "🖥️", keywords: ["infrastructure", "serveur", "cloud", "hébergement", "datacenter"], parent: "technologie" },
      { id: "cybersecurite", label: "Cybersécurité", emoji: "🔒", keywords: ["cybersécurité", "sécurité informatique", "protection données"], parent: "technologie" },
      { id: "ia_data", label: "IA & Data", emoji: "🤖", keywords: ["intelligence artificielle", "ia", "data science", "machine learning", "big data"], parent: "technologie" },
    ]
  },
  sante: {
    label: "Santé",
    emoji: "🏥",
    subcategories: [
      { id: "medical", label: "Médical", emoji: "👨‍⚕️", keywords: ["médical", "médecin", "clinique", "cabinet médical", "santé", "dentaire", "dentiste", "chirurgien"], parent: "sante" },
      { id: "paramedical", label: "Paramédical", emoji: "💊", keywords: ["infirmier", "kiné", "pharmacie", "paramédical", "orthophonie"], parent: "sante" },
      { id: "services_sante", label: "Services de Santé", emoji: "🩺", keywords: ["laboratoire", "imagerie", "analyse médicale"], parent: "sante" },
    ]
  },
  construction: {
    label: "Construction & BTP",
    emoji: "🏗️",
    subcategories: [
      { id: "gros_oeuvre", label: "Gros Œuvre", emoji: "🧱", keywords: ["maçonnerie", "gros oeuvre", "charpente", "béton"], parent: "construction" },
      { id: "second_oeuvre", label: "Second Œuvre", emoji: "🔨", keywords: ["plomberie", "électricité", "menuiserie", "peinture", "carrelage", "tuyauterie", "installation", "chauffage"], parent: "construction" },
      { id: "genie_civil", label: "Génie Civil", emoji: "🛣️", keywords: ["génie civil", "travaux publics", "voirie", "infrastructure"], parent: "construction" },
      { id: "renovation", label: "Rénovation", emoji: "🏡", keywords: ["rénovation", "réhabilitation", "restauration"], parent: "construction" },
    ]
  },
  industrie: {
    label: "Industrie",
    emoji: "🏭",
    subcategories: [
      { id: "fabrication", label: "Fabrication", emoji: "⚙️", keywords: ["fabrication", "production", "usine", "manufacture"], parent: "industrie" },
      { id: "agro_alimentaire", label: "Agro-alimentaire", emoji: "🍞", keywords: ["agro-alimentaire", "alimentation", "boulangerie", "pâtisserie"], parent: "industrie" },
      { id: "chimie", label: "Chimie & Pharma", emoji: "🧪", keywords: ["chimie", "pharmaceutique", "laboratoire"], parent: "industrie" },
      { id: "mecanique", label: "Mécanique", emoji: "🔧", keywords: ["mécanique", "usinage", "métallurgie"], parent: "industrie" },
    ]
  },
  transport: {
    label: "Transport & Logistique",
    emoji: "🚚",
    subcategories: [
      { id: "transport_routier", label: "Transport Routier", emoji: "🚛", keywords: ["transport routier", "camion", "livraison", "transport public routier", "transport de marchandises"], parent: "transport" },
      { id: "logistique", label: "Logistique", emoji: "📦", keywords: ["logistique", "entreposage", "stockage", "supply chain"], parent: "transport" },
      { id: "demenagement", label: "Déménagement", emoji: "📦", keywords: ["déménagement", "garde-meuble"], parent: "transport" },
    ]
  },
  hotellerie: {
    label: "Hôtellerie & Restauration",
    emoji: "🏨",
    subcategories: [
      { id: "hotellerie", label: "Hôtellerie", emoji: "🏨", keywords: ["hôtel", "hébergement", "auberge"], parent: "hotellerie" },
      { id: "restauration", label: "Restauration", emoji: "🍽️", keywords: ["restaurant", "café", "bar", "brasserie"], parent: "hotellerie" },
      { id: "traiteur", label: "Traiteur", emoji: "🎂", keywords: ["traiteur", "banquet", "réception"], parent: "hotellerie" },
    ]
  },
  education: {
    label: "Éducation & Formation",
    emoji: "📚",
    subcategories: [
      { id: "enseignement", label: "Enseignement", emoji: "👨‍🏫", keywords: ["école", "enseignement", "éducation"], parent: "education" },
      { id: "formation_pro", label: "Formation Professionnelle", emoji: "📖", keywords: ["formation professionnelle", "centre de formation"], parent: "education" },
      { id: "cours_particuliers", label: "Cours Particuliers", emoji: "✍️", keywords: ["cours particuliers", "soutien scolaire"], parent: "education" },
    ]
  },
  artisanat: {
    label: "Artisanat",
    emoji: "🔨",
    subcategories: [
      { id: "metiers_art", label: "Métiers d'Art", emoji: "🎨", keywords: ["artisan d'art", "création", "artisanat", "bijouterie", "horlogerie", "joaillerie"], parent: "artisanat" },
      { id: "reparation", label: "Réparation", emoji: "🔧", keywords: ["réparation", "dépannage", "maintenance"], parent: "artisanat" },
      { id: "coiffure_beaute", label: "Coiffure & Beauté", emoji: "💇", keywords: ["coiffure", "esthétique", "beauté", "salon"], parent: "artisanat" },
    ]
  },
  agriculture: {
    label: "Agriculture",
    emoji: "🌾",
    subcategories: [
      { id: "cultures", label: "Cultures", emoji: "🌱", keywords: ["culture", "céréales", "maraîchage"], parent: "agriculture" },
      { id: "elevage", label: "Élevage", emoji: "🐄", keywords: ["élevage", "ferme", "exploitation agricole"], parent: "agriculture" },
      { id: "services_agricoles", label: "Services Agricoles", emoji: "🚜", keywords: ["services agricoles", "travaux agricoles"], parent: "agriculture" },
    ]
  },
  energie: {
    label: "Énergie",
    emoji: "⚡",
    subcategories: [
      { id: "renouvelable", label: "Énergies Renouvelables", emoji: "☀️", keywords: ["solaire", "éolien", "photovoltaïque", "renouvelable"], parent: "energie" },
      { id: "electricite", label: "Électricité", emoji: "⚡", keywords: ["électricité", "électricien", "installation électrique"], parent: "energie" },
      { id: "gaz_chauffage", label: "Gaz & Chauffage", emoji: "🔥", keywords: ["gaz", "chauffage", "climatisation", "plomberie"], parent: "energie" },
    ]
  },
  finance: {
    label: "Finance & Assurance",
    emoji: "💰",
    subcategories: [
      { id: "banque", label: "Banque", emoji: "🏦", keywords: ["banque", "bancaire", "crédit"], parent: "finance" },
      { id: "assurance", label: "Assurance", emoji: "🛡️", keywords: ["assurance", "courtage", "mutuelle"], parent: "finance" },
      { id: "conseil_financier", label: "Conseil Financier", emoji: "📊", keywords: ["conseil financier", "gestion patrimoine", "investissement"], parent: "finance" },
    ]
  },
  media: {
    label: "Médias & Culture",
    emoji: "📺",
    subcategories: [
      { id: "edition", label: "Édition", emoji: "📖", keywords: ["édition", "livre", "publication"], parent: "media" },
      { id: "audiovisuel", label: "Audiovisuel", emoji: "🎬", keywords: ["audiovisuel", "production", "cinéma", "vidéo"], parent: "media" },
      { id: "spectacle", label: "Spectacle", emoji: "🎭", keywords: ["spectacle", "théâtre", "événementiel culturel"], parent: "media" },
    ]
  },
  sport: {
    label: "Sport & Loisirs",
    emoji: "⚽",
    subcategories: [
      { id: "equipements_sport", label: "Équipements Sportifs", emoji: "🏋️", keywords: ["salle de sport", "fitness", "équipements sportifs", "karting", "activités sportives"], parent: "sport" },
      { id: "enseignement_sport", label: "Enseignement Sportif", emoji: "🤸", keywords: ["coach sportif", "enseignement sportif"], parent: "sport" },
      { id: "loisirs", label: "Loisirs", emoji: "🎮", keywords: ["loisirs", "divertissement", "récréatives"], parent: "sport" },
    ]
  },
  environnement: {
    label: "Environnement",
    emoji: "♻️",
    subcategories: [
      { id: "recyclage", label: "Recyclage", emoji: "♻️", keywords: ["recyclage", "déchets", "tri"], parent: "environnement" },
      { id: "traitement_eau", label: "Traitement de l'Eau", emoji: "💧", keywords: ["traitement eau", "assainissement"], parent: "environnement" },
      { id: "espaces_verts", label: "Espaces Verts", emoji: "🌳", keywords: ["espaces verts", "paysagiste", "jardinage"], parent: "environnement" },
    ]
  },
  autre: {
    label: "Autre",
    emoji: "📋",
    subcategories: [
      { id: "association", label: "Association", emoji: "🤝", keywords: ["association", "ong"], parent: "autre" },
      { id: "autres_services", label: "Autres Services", emoji: "🔧", keywords: ["service", "prestation", "centre d'appels", "permanence téléphonique"], parent: "autre" },
    ]
  }
};

// Normalize text for better matching (remove accents, special chars, etc.)
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove accents
    .replace(/[^a-z0-9\s]/g, " ") // Remove special chars
    .replace(/\s+/g, " ") // Normalize spaces
    .trim();
}

function categorizeActivityDetailed(activity: string | null, categoryKey: string | null): string | null {
  if (!activity || !categoryKey) return null;
  
  const category = ACTIVITY_HIERARCHY[categoryKey as keyof typeof ACTIVITY_HIERARCHY];
  if (!category) return null;

  const activityNormalized = normalizeText(activity);
  
  // Find the best matching subcategory
  let bestMatch: { id: string; score: number } | null = null;
  
  for (const subcat of category.subcategories) {
    let score = 0;
    for (const keyword of subcat.keywords) {
      const keywordNormalized = normalizeText(keyword);
      if (activityNormalized.includes(keywordNormalized)) {
        score += keywordNormalized.length; // Longer keywords = more specific match
      }
    }
    
    if (score > 0 && (!bestMatch || score > bestMatch.score)) {
      bestMatch = { id: subcat.id, score };
    }
  }
  
  return bestMatch ? bestMatch.id : null;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const body = await req.json();
    const BATCH_SIZE = body.batchSize || 100;

    console.log(`Processing batch of ${BATCH_SIZE} enterprises for subcategory qualification`);

    // Fetch enterprises that need subcategory qualification
    const { data: entreprises, error: fetchError } = await supabase
      .from('entreprises')
      .select('id, activite, categorie_qualifiee')
      .is('sous_categorie', null)
      .not('categorie_qualifiee', 'is', null)
      .limit(BATCH_SIZE);

    if (fetchError) {
      console.error('Error fetching enterprises:', fetchError);
      throw fetchError;
    }

    if (!entreprises || entreprises.length === 0) {
      console.log('No more enterprises to qualify');
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'All enterprises qualified',
          processed: 0 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${entreprises.length} enterprises to process`);

    let succeeded = 0;
    let failed = 0;

    // Process each enterprise
    for (const entreprise of entreprises) {
      try {
        const subcategory = categorizeActivityDetailed(
          entreprise.activite,
          entreprise.categorie_qualifiee
        );

        // Always update to avoid infinite loops - use a default if no match found
        const finalSubcategory = subcategory || 'autres_services';
        
        const { error: updateError } = await supabase
          .from('entreprises')
          .update({ sous_categorie: finalSubcategory })
          .eq('id', entreprise.id);

        if (updateError) {
          console.error(`Error updating enterprise ${entreprise.id}:`, updateError);
          failed++;
        } else {
          succeeded++;
        }
      } catch (error) {
        console.error(`Error processing enterprise ${entreprise.id}:`, error);
        failed++;
      }
    }

    console.log(`Batch complete: ${succeeded} succeeded, ${failed} failed`);

    return new Response(
      JSON.stringify({
        success: true,
        processed: entreprises.length,
        succeeded,
        failed,
        hasMore: entreprises.length === BATCH_SIZE
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in qualify-subcategories function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
