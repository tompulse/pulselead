import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Système de catégories détaillées (référentiel unique Créations + Nouveaux Sites)
const DETAILED_CATEGORIES = [
  { key: 'agriculture-cultures', label: 'Cultures & Maraîchage', nafCodes: ['01.1', '01.2'], keywords: ['culture', 'maraîchage', 'céréales', 'légumes'] },
  { key: 'agriculture-elevage', label: 'Élevage', nafCodes: ['01.4', '01.5'], keywords: ['élevage', 'bovins', 'porcins', 'volailles'] },
  { key: 'agriculture-viticole', label: 'Viticulture', nafCodes: ['01.21'], keywords: ['vigne', 'viticole', 'vin', 'viticulture'] },
  { key: 'agriculture-forestier', label: 'Forestier & Sylviculture', nafCodes: ['02'], keywords: ['forêt', 'bois', 'sylviculture'] },
  { key: 'agriculture-peche', label: 'Pêche & Aquaculture', nafCodes: ['03'], keywords: ['pêche', 'aquaculture', 'poisson'] },
  { key: 'alimentaire-boulangerie', label: 'Boulangeries & Pâtisseries', nafCodes: ['10.71'], keywords: ['boulangerie', 'pâtisserie', 'pain', 'viennoiserie'] },
  { key: 'alimentaire-boucherie', label: 'Boucheries & Charcuteries', nafCodes: ['10.11', '10.13'], keywords: ['boucherie', 'charcuterie', 'viande'] },
  { key: 'alimentaire-laiterie', label: 'Produits laitiers', nafCodes: ['10.51'], keywords: ['laiterie', 'fromage', 'yaourt', 'crème'] },
  { key: 'alimentaire-boissons', label: 'Boissons', nafCodes: ['11'], keywords: ['boisson', 'jus', 'eau', 'soda'] },
  { key: 'alimentaire-conserves', label: 'Conserves & Plats préparés', nafCodes: ['10.39', '10.85'], keywords: ['conserve', 'plat', 'préparé'] },
  { key: 'alimentaire-confiserie', label: 'Confiserie & Chocolaterie', nafCodes: ['10.82'], keywords: ['chocolat', 'confiserie', 'bonbon'] },
  { key: 'textile-confection', label: 'Confection & Vêtements', nafCodes: ['13', '14'], keywords: ['textile', 'vêtement', 'confection', 'habit'] },
  { key: 'textile-cuir', label: 'Maroquinerie & Cuir', nafCodes: ['15'], keywords: ['cuir', 'maroquinerie', 'sac', 'chaussure'] },
  { key: 'btp-gros-oeuvre', label: 'Gros œuvre & Maçonnerie', nafCodes: ['41', '43.99'], keywords: ['maçonnerie', 'gros oeuvre', 'fondation', 'béton'] },
  { key: 'btp-charpente', label: 'Charpente & Couverture', nafCodes: ['43.91'], keywords: ['charpente', 'couverture', 'toiture', 'zinguerie'] },
  { key: 'btp-menuiserie', label: 'Menuiserie', nafCodes: ['16', '43.32'], keywords: ['menuiserie', 'menuisier', 'fenêtre', 'porte'] },
  { key: 'btp-plomberie', label: 'Plomberie & Chauffage', nafCodes: ['43.22'], keywords: ['plomberie', 'plombier', 'chauffage', 'sanitaire'] },
  { key: 'btp-electricite', label: 'Électricité', nafCodes: ['43.21'], keywords: ['électricité', 'électricien', 'électrique'] },
  { key: 'btp-peinture', label: 'Peinture & Finitions', nafCodes: ['43.34'], keywords: ['peinture', 'peintre', 'finition'] },
  { key: 'btp-terrassement', label: 'Terrassement & VRD', nafCodes: ['42', '43.12'], keywords: ['terrassement', 'vrd', 'voirie'] },
  { key: 'auto-concessionnaire', label: 'Concessionnaires', nafCodes: ['45.11'], keywords: ['concessionnaire', 'vente', 'voiture', 'automobile'] },
  { key: 'auto-garage', label: 'Garages & Réparation', nafCodes: ['45.20'], keywords: ['garage', 'réparation', 'mécanique', 'entretien'] },
  { key: 'auto-carrosserie', label: 'Carrosseries', nafCodes: ['45.20B'], keywords: ['carrosserie', 'peinture', 'carrossier'] },
  { key: 'auto-pieces', label: 'Pièces détachées', nafCodes: ['45.31', '45.32'], keywords: ['pièce', 'détachée', 'accessoire'] },
  { key: 'commerce-supermarche', label: 'Supermarchés & Hypermarchés', nafCodes: ['47.11'], keywords: ['supermarché', 'hypermarché', 'grande surface'] },
  { key: 'commerce-alimentation', label: 'Alimentation générale', nafCodes: ['47.2'], keywords: ['épicerie', 'alimentation', 'primeur'] },
  { key: 'commerce-pharmacie', label: 'Pharmacies', nafCodes: ['47.73'], keywords: ['pharmacie', 'pharmacien', 'médicament'] },
  { key: 'commerce-optique', label: 'Opticiens', nafCodes: ['47.78A'], keywords: ['optique', 'opticien', 'lunette'] },
  { key: 'commerce-bricolage', label: 'Bricolage & Jardinerie', nafCodes: ['47.52'], keywords: ['bricolage', 'jardinerie', 'outillage'] },
  { key: 'commerce-electromenager', label: 'Électroménager & Multimédia', nafCodes: ['47.4', '47.5'], keywords: ['électroménager', 'informatique', 'téléphone'] },
  { key: 'commerce-meuble', label: 'Meubles & Décoration', nafCodes: ['47.59'], keywords: ['meuble', 'décoration', 'ameublement'] },
  { key: 'commerce-vetement', label: 'Vêtements & Accessoires', nafCodes: ['47.71'], keywords: ['vêtement', 'mode', 'prêt-à-porter'] },
  { key: 'commerce-chaussure', label: 'Chaussures', nafCodes: ['47.72'], keywords: ['chaussure', 'basket', 'bottier'] },
  { key: 'commerce-bijouterie', label: 'Bijouteries & Horlogeries', nafCodes: ['47.77'], keywords: ['bijouterie', 'horlogerie', 'bijou'] },
  { key: 'commerce-librairie', label: 'Librairies & Presse', nafCodes: ['47.61', '47.62'], keywords: ['librairie', 'presse', 'livre'] },
  { key: 'commerce-fleuriste', label: 'Fleuristes', nafCodes: ['47.76'], keywords: ['fleuriste', 'fleur', 'bouquet'] },
  { key: 'commerce-tabac', label: 'Tabac & Presse', nafCodes: ['47.26'], keywords: ['tabac', 'presse', 'cigarette'] },
  { key: 'gros-alimentaire', label: 'Grossistes Alimentaires', nafCodes: ['46.3'], keywords: ['grossiste', 'alimentaire', 'cash'] },
  { key: 'gros-materiel', label: 'Matériaux & Équipements', nafCodes: ['46.7'], keywords: ['matériaux', 'négoce', 'fourniture'] },
  { key: 'gros-produits', label: 'Produits manufacturés', nafCodes: ['46.4', '46.5'], keywords: ['produit', 'distribution'] },
  { key: 'resto-restaurant', label: 'Restaurants traditionnels', nafCodes: ['56.10A'], keywords: ['restaurant', 'gastronomie', 'table'] },
  { key: 'resto-fastfood', label: 'Restauration rapide', nafCodes: ['56.10C'], keywords: ['fast food', 'snack', 'burger', 'sandwich'] },
  { key: 'resto-cafeteria', label: 'Cafétérias & Self-service', nafCodes: ['56.10B'], keywords: ['cafétéria', 'self', 'cantine'] },
  { key: 'resto-traiteur', label: 'Traiteurs', nafCodes: ['56.21'], keywords: ['traiteur', 'événement', 'buffet'] },
  { key: 'resto-bar', label: 'Bars & Cafés', nafCodes: ['56.30'], keywords: ['bar', 'café', 'brasserie', 'pub'] },
  { key: 'hotellerie-hotel', label: 'Hôtels', nafCodes: ['55.10'], keywords: ['hôtel', 'hébergement', 'chambre'] },
  { key: 'transport-routier', label: 'Transport routier marchandises', nafCodes: ['49.41'], keywords: ['transport', 'routier', 'marchandise', 'messagerie'] },
  { key: 'transport-demenagement', label: 'Déménagement', nafCodes: ['49.42'], keywords: ['déménagement', 'déménageur'] },
  { key: 'transport-taxi', label: 'Taxis & VTC', nafCodes: ['49.32'], keywords: ['taxi', 'vtc', 'transport', 'personne'] },
  { key: 'transport-logistique', label: 'Entreposage & Logistique', nafCodes: ['52'], keywords: ['entrepôt', 'logistique', 'stockage'] },
  { key: 'info-developpement', label: 'Développement logiciel', nafCodes: ['62.01'], keywords: ['développement', 'logiciel', 'programmation', 'dev'] },
  { key: 'info-conseil', label: 'Conseil informatique', nafCodes: ['62.02'], keywords: ['conseil', 'consulting', 'it', 'informatique'] },
  { key: 'info-webagency', label: 'Web & Digital', nafCodes: ['62.01', '73.11'], keywords: ['web', 'digital', 'site', 'agence'] },
  { key: 'info-hebergement', label: 'Hébergement & Cloud', nafCodes: ['63.11'], keywords: ['hébergement', 'cloud', 'serveur'] },
  { key: 'finance-banque', label: 'Banques', nafCodes: ['64.1'], keywords: ['banque', 'crédit', 'bancaire'] },
  { key: 'finance-assurance', label: 'Assurances', nafCodes: ['65'], keywords: ['assurance', 'mutuelle', 'assureur'] },
  { key: 'finance-holding', label: 'Holdings & Gestion', nafCodes: ['64.2', '70.10'], keywords: ['holding', 'gestion', 'portefeuille'] },
  { key: 'finance-comptable', label: 'Cabinets comptables', nafCodes: ['69.20'], keywords: ['comptable', 'expertise', 'compta'] },
  { key: 'immo-agence', label: 'Agences immobilières', nafCodes: ['68.31'], keywords: ['agence', 'immobilier', 'transaction'] },
  { key: 'immo-syndic', label: 'Syndics & Gestion', nafCodes: ['68.32'], keywords: ['syndic', 'gestion', 'copropriété'] },
  { key: 'immo-promotion', label: 'Promotion immobilière', nafCodes: ['41.10'], keywords: ['promotion', 'promoteur', 'construction'] },
  { key: 'immo-location', label: 'Location immobilière', nafCodes: ['68.20'], keywords: ['location', 'bailleur'] },
  { key: 'juridique-avocat', label: 'Cabinets d\'avocats', nafCodes: ['69.10'], keywords: ['avocat', 'juridique', 'droit'] },
  { key: 'juridique-notaire', label: 'Notaires', nafCodes: ['69.10'], keywords: ['notaire', 'notariat'] },
  { key: 'conseil-management', label: 'Conseil en management', nafCodes: ['70.22'], keywords: ['conseil', 'consulting', 'stratégie'] },
  { key: 'archi-architecture', label: 'Architectes', nafCodes: ['71.11'], keywords: ['architecte', 'architecture', 'plan'] },
  { key: 'archi-bureau-etudes', label: 'Bureaux d\'études', nafCodes: ['71.12'], keywords: ['bureau', 'étude', 'ingénierie'] },
  { key: 'archi-geometre', label: 'Géomètres', nafCodes: ['71.12A'], keywords: ['géomètre', 'topographie'] },
  { key: 'formation-ecole', label: 'Écoles & Formations', nafCodes: ['85'], keywords: ['école', 'formation', 'enseignement'] },
  { key: 'formation-conduite', label: 'Auto-écoles', nafCodes: ['85.53'], keywords: ['auto-école', 'conduite', 'permis'] },
  { key: 'formation-professionnelle', label: 'Formation professionnelle', nafCodes: ['85.59'], keywords: ['formation', 'professionnel', 'continue'] },
  { key: 'sante-medecin', label: 'Médecins généralistes', nafCodes: ['86.21'], keywords: ['médecin', 'généraliste', 'docteur'] },
  { key: 'sante-dentiste', label: 'Dentistes', nafCodes: ['86.23'], keywords: ['dentiste', 'dentaire', 'orthodontie'] },
  { key: 'sante-kine', label: 'Kinésithérapeutes', nafCodes: ['86.90'], keywords: ['kinésithérapeute', 'kiné', 'ostéopathe'] },
  { key: 'sante-infirmier', label: 'Infirmiers', nafCodes: ['86.90'], keywords: ['infirmier', 'infirmière', 'soin'] },
  { key: 'sante-labo', label: 'Laboratoires d\'analyses', nafCodes: ['86.90'], keywords: ['laboratoire', 'analyse', 'médical'] },
  { key: 'sante-clinique', label: 'Cliniques & Hôpitaux', nafCodes: ['86.10'], keywords: ['clinique', 'hôpital', 'centre'] },
  { key: 'sante-ehpad', label: 'EHPAD & Résidences', nafCodes: ['87'], keywords: ['ehpad', 'résidence', 'maison', 'retraite'] },
  { key: 'service-coiffeur', label: 'Coiffeurs', nafCodes: ['96.02'], keywords: ['coiffeur', 'coiffure', 'salon'] },
  { key: 'service-esthetique', label: 'Esthétique & Beauté', nafCodes: ['96.02'], keywords: ['esthétique', 'beauté', 'spa', 'onglerie'] },
  { key: 'service-pressing', label: 'Pressings & Blanchisseries', nafCodes: ['96.01'], keywords: ['pressing', 'blanchisserie', 'nettoyage'] },
  { key: 'service-reparation', label: 'Réparations diverses', nafCodes: ['95'], keywords: ['réparation', 'dépannage'] },
  { key: 'sport-salle', label: 'Salles de sport', nafCodes: ['93.13'], keywords: ['sport', 'fitness', 'musculation', 'salle'] },
  { key: 'sport-piscine', label: 'Piscines & Aquatique', nafCodes: ['93.11'], keywords: ['piscine', 'aquatique', 'natation'] },
  { key: 'loisirs-cinema', label: 'Cinémas', nafCodes: ['59.14'], keywords: ['cinéma', 'film', 'multiplex'] },
  { key: 'culture-spectacle', label: 'Spectacles & Événementiel', nafCodes: ['90'], keywords: ['spectacle', 'événement', 'concert'] },
  { key: 'culture-musee', label: 'Musées & Patrimoine', nafCodes: ['91'], keywords: ['musée', 'patrimoine', 'exposition'] },
  { key: 'energie-electricite', label: 'Production électricité', nafCodes: ['35.11'], keywords: ['électricité', 'production', 'énergie'] },
  { key: 'energie-renouvelable', label: 'Énergies renouvelables', nafCodes: ['35.11', '35.14'], keywords: ['solaire', 'éolien', 'renouvelable', 'photovoltaïque'] },
  { key: 'energie-gaz', label: 'Gaz & Réseaux', nafCodes: ['35.2'], keywords: ['gaz', 'réseau', 'distribution'] },
  { key: 'service-interim', label: 'Intérim & Recrutement', nafCodes: ['78'], keywords: ['intérim', 'recrutement', 'travail', 'temporaire'] },
  { key: 'service-nettoyage', label: 'Nettoyage & Entretien', nafCodes: ['81.2'], keywords: ['nettoyage', 'entretien', 'propreté'] },
  { key: 'service-securite', label: 'Sécurité & Gardiennage', nafCodes: ['80.1'], keywords: ['sécurité', 'gardiennage', 'surveillance'] },
  { key: 'service-publicite', label: 'Publicité & Marketing', nafCodes: ['73'], keywords: ['publicité', 'marketing', 'communication'] },
  { key: 'industrie-metallurgie', label: 'Métallurgie & Chaudronnerie', nafCodes: ['24', '25'], keywords: ['métallurgie', 'chaudronnerie', 'mécanique'] },
  { key: 'industrie-plastique', label: 'Plasturgie', nafCodes: ['22'], keywords: ['plastique', 'plasturgie', 'injection'] },
  { key: 'industrie-chimie', label: 'Chimie', nafCodes: ['20'], keywords: ['chimie', 'chimique', 'produit'] },
  { key: 'industrie-electronique', label: 'Électronique', nafCodes: ['26', '27'], keywords: ['électronique', 'composant', 'circuit'] },
];

// Fonction pour trouver les catégories depuis une requête utilisateur
function findCategoriesFromQuery(query: string): string[] {
  const normalized = query.toLowerCase();
  const matches: Set<string> = new Set();
  
  for (const cat of DETAILED_CATEGORIES) {
    // Match sur le label
    if (cat.label.toLowerCase().includes(normalized)) {
      matches.add(cat.key);
      continue;
    }
    
    // Match sur les mots-clés
    for (const keyword of cat.keywords) {
      if (keyword.toLowerCase().includes(normalized) || normalized.includes(keyword.toLowerCase())) {
        matches.add(cat.key);
        break;
      }
    }
  }
  
  return Array.from(matches);
}

const REGIONS_DEPARTMENTS: Record<string, string[]> = {
  "Auvergne-Rhône-Alpes": ["01", "03", "07", "15", "26", "38", "42", "43", "63", "69", "73", "74"],
  "Bourgogne-Franche-Comté": ["21", "25", "39", "58", "70", "71", "89", "90"],
  "Bretagne": ["22", "29", "35", "56"],
  "Centre-Val de Loire": ["18", "28", "36", "37", "41", "45"],
  "Corse": ["2A", "2B"],
  "Grand Est": ["08", "10", "51", "52", "54", "55", "57", "67", "68", "88"],
  "Hauts-de-France": ["02", "59", "60", "62", "80"],
  "Île-de-France": ["75", "77", "78", "91", "92", "93", "94", "95"],
  "Normandie": ["14", "27", "50", "61", "76"],
  "Nouvelle-Aquitaine": ["16", "17", "19", "23", "24", "33", "40", "47", "64", "79", "86", "87"],
  "Occitanie": ["09", "11", "12", "30", "31", "32", "34", "46", "48", "65", "66", "81", "82"],
  "Pays de la Loire": ["44", "49", "53", "72", "85"],
  "Provence-Alpes-Côte d'Azur": ["04", "05", "06", "13", "83", "84"]
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, userId } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    const categoriesListForPrompt = DETAILED_CATEGORIES
      .slice(0, 50) // Limiter pour ne pas surcharger le prompt
      .map(c => `- "${c.label}" (${c.keywords.slice(0, 3).join(', ')})`)
      .join('\n');

    const systemPrompt = `Tu es un assistant IA pour créer des tournées commerciales avec un système de catégorisation ultra-précis.

**Catégories d'activités disponibles (exemples):**
${categoriesListForPrompt}
... et ${DETAILED_CATEGORIES.length - 50} autres catégories disponibles

**Exemples de requêtes métier → catégories:**
- "pharmacies" → trouve automatiquement "commerce-pharmacie"
- "garages" → trouve "auto-garage"
- "boulangeries" → trouve "alimentaire-boulangerie"
- "restaurants" → trouve "resto-restaurant"
- "coiffeurs" → trouve "service-coiffeur"

**Instructions:**
1. Pour CHAQUE type d'activité mentionné, extrais le mot-clé métier exact (ex: "pharmacie", "garage", "restaurant")
2. Ne fais PAS de mapping toi-même, envoie juste les mots-clés métier
3. Le système fera le matching automatique avec les catégories détaillées

**Types de prospects:**
- "creations" = créations d'entreprises (par défaut)
- "nouveaux-sites" = nouveaux établissements

**Départements:** 01-95, 2A, 2B
**Formes juridiques:** SAS, SARL, SCI, SC, SASU, SNC, EURL

**Règles:**
- Extrait uniquement ce qui est demandé
- Pour les activités, envoie les termes métier simples (pharmacie, garage, etc.)
- Si ambiguïté, demande clarification
- Génère un nom de tournée descriptif
- Par défaut: créations, demain`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "create_tournee",
              description: "Créer une tournée avec les critères extraits",
              parameters: {
                type: "object",
                properties: {
                  tourneeName: {
                    type: "string",
                    description: "Nom généré pour la tournée"
                  },
                  tourneeDate: {
                    type: "string",
                    description: "Date au format ISO (YYYY-MM-DD)"
                  },
                  view: {
                    type: "string",
                    enum: ["creations", "nouveaux-sites"],
                    description: "Type de prospects"
                  },
                  filters: {
                    type: "object",
                    properties: {
                      businessTypes: {
                        type: "array",
                        items: { type: "string" },
                        description: "Termes métier simples (ex: ['pharmacie', 'garage', 'boulangerie'])"
                      },
                      departments: {
                        type: "array",
                        items: { type: "string" },
                        description: "Codes départements (ex: ['75', '92'])"
                      },
                      formesJuridiques: {
                        type: "array",
                        items: { type: "string" },
                        description: "Formes juridiques exactes"
                      },
                      dateFrom: {
                        type: "string",
                        description: "Date de début au format YYYY-MM-DD (optionnel)"
                      },
                      dateTo: {
                        type: "string",
                        description: "Date de fin au format YYYY-MM-DD (optionnel)"
                      }
                    }
                  },
                  needsClarification: {
                    type: "boolean",
                    description: "true si besoin de clarification"
                  },
                  clarificationMessage: {
                    type: "string",
                    description: "Message de clarification si needsClarification=true"
                  }
                },
                required: ["tourneeName", "tourneeDate", "view", "filters"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "create_tournee" } }
      })
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ 
            error: "Limite de requêtes atteinte. Veuillez réessayer dans quelques instants.",
            errorType: "rate_limit"
          }), 
          { 
            status: 429, 
            headers: { ...corsHeaders, "Content-Type": "application/json" } 
          }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ 
            error: "Crédits IA épuisés. Veuillez recharger votre compte Lovable.",
            errorType: "payment_required"
          }), 
          { 
            status: 402, 
            headers: { ...corsHeaders, "Content-Type": "application/json" } 
          }
        );
      }
      
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      throw new Error("Erreur lors de l'appel à l'IA");
    }

    const data = await response.json();
    
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      throw new Error("Aucune réponse structurée de l'IA");
    }

    const result = JSON.parse(toolCall.function.arguments);

    // Si clarification nécessaire, retourner directement
    if (result.needsClarification) {
      return new Response(
        JSON.stringify(result),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    // Mapper les termes métier vers les catégories détaillées
    const detailedCategories: string[] = [];
    if (result.filters.businessTypes && result.filters.businessTypes.length > 0) {
      for (const businessType of result.filters.businessTypes) {
        const foundCategories = findCategoriesFromQuery(businessType);
        detailedCategories.push(...foundCategories);
      }
    }

    console.log('Business types:', result.filters.businessTypes);
    console.log('Mapped to categories:', detailedCategories);

    // Créer client Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseClient = createClient(supabaseUrl, supabaseKey);

    // Déterminer la table selon le type de vue
    const tableName = result.view === "creations" ? "entreprises" : "nouveaux_sites";
    const activityColumn = result.view === "creations" ? "activite" : "categorie_entreprise";

    // Construire la requête avec les filtres
    let query = supabaseClient.from(tableName).select('*')
      .not('latitude', 'is', null)
      .not('longitude', 'is', null);

    // Filtrer par catégories détaillées
    if (detailedCategories.length > 0) {
      query = query.in(activityColumn, detailedCategories);
    }

    // Filtrer par départements
    if (result.filters.departments && result.filters.departments.length > 0) {
      const deptPatterns = result.filters.departments.map((d: string) => `${d}%`);
      const orExpr = deptPatterns.map((p: string) => `code_postal.like.${p}`).join(',');
      query = query.or(orExpr);
    }

    // Filtrer par formes juridiques
    if (result.filters.formesJuridiques && result.filters.formesJuridiques.length > 0) {
      query = query.in('forme_juridique', result.filters.formesJuridiques);
    }

    // Filtrer par dates (pour créations uniquement)
    if (result.view === "creations") {
      if (result.filters.dateFrom) {
        query = query.gte('date_demarrage', result.filters.dateFrom);
      }
      if (result.filters.dateTo) {
        query = query.lte('date_demarrage', result.filters.dateTo);
      }
    }

    const { data: entreprises, error: fetchError } = await query;

    if (fetchError) {
      console.error('Fetch error:', fetchError);
      throw fetchError;
    }

    console.log(`Found ${entreprises?.length || 0} entreprises matching criteria`);

    return new Response(
      JSON.stringify({
        ...result,
        detectedCategories: detailedCategories,
        entreprises: entreprises || [],
        count: entreprises?.length || 0
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );

  } catch (error) {
    console.error('Error in chat-tournee-assistant:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        errorType: 'server_error'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});
