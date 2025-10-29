import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Liste des 28 catégories détaillées
const DETAILED_CATEGORIES = {
  immobilier_commercial: "Immobilier commercial - bureaux, locaux commerciaux, entrepôts",
  immobilier_residentiel: "Immobilier résidentiel - appartements, maisons, logements",
  promotion_immobiliere: "Promotion immobilière - construction, lotissements",
  gestion_patrimoine_immo: "Gestion de patrimoine immobilier - syndic, copropriété, SCI",
  conseil_strategie: "Conseil & Stratégie - consulting, management",
  comptabilite_gestion: "Comptabilité & Gestion - expert-comptable, paie, fiscalité",
  juridique_notariat: "Juridique & Notariat - avocats, notaires",
  audit_expertise: "Audit & Expertise - certification, contrôle",
  marketing_communication: "Marketing & Communication - publicité, agence",
  securite_surveillance: "Sécurité & Surveillance - gardiennage, protection",
  commerce_detail: "Commerce de détail - magasins, boutiques",
  commerce_gros: "Commerce de gros - grossistes, distribution",
  ecommerce: "E-commerce - vente en ligne",
  negoce: "Négoce - matériaux, approvisionnement",
  gros_oeuvre: "Gros œuvre - maçonnerie, construction, BTP",
  second_oeuvre: "Second œuvre - plomberie, électricité",
  finitions_decoration: "Finitions & Décoration - peinture, aménagement",
  renovation_entretien: "Rénovation & Entretien - maintenance, réparation",
  developpement_logiciel: "Développement logiciel - programmation",
  web_digital: "Web & Digital - sites web, agences web",
  it_infrastructure: "IT & Infrastructure - informatique, réseaux",
  ia_innovation: "IA & Innovation - intelligence artificielle",
  restauration_traditionnelle: "Restauration traditionnelle - restaurants",
  cafes_bars: "Cafés & Bars",
  hotellerie_hebergement: "Hôtellerie & Hébergement - hôtels, gîtes",
  boulangerie_patisserie: "Boulangerie & Pâtisserie",
  transport_personnes: "Transport de personnes - taxi, VTC",
  transport_marchandises: "Transport de marchandises - fret",
  livraison_coursier: "Livraison & Coursier",
  logistique_entreposage: "Logistique & Entreposage",
  sante_paramedical: "Santé & Paramédical",
  coiffure_esthetique: "Coiffure & Esthétique - beauté",
  sport_fitness: "Sport & Fitness - salles de sport",
  bienetre_relaxation: "Bien-être & Relaxation - massage, yoga",
  industrie_manufacturiere: "Industrie manufacturière - production",
  mecanique_metallurgie: "Mécanique & Métallurgie",
  electronique_electrique: "Électronique & Électrique",
  conditionnement_emballage: "Conditionnement & Emballage",
  energie_electricite: "Énergie & Électricité",
  environnement_recyclage: "Environnement & Recyclage - déchets",
  energies_renouvelables: "Énergies renouvelables - solaire",
  eau_assainissement: "Eau & Assainissement",
  agriculture_elevage: "Agriculture & Élevage",
  viticulture: "Viticulture - vigne, vin",
  horticulture_pepinieres: "Horticulture & Pépinières - espaces verts",
  agroalimentaire: "Agroalimentaire",
  enseignement: "Enseignement - écoles",
  formation_professionnelle: "Formation professionnelle",
  petite_enfance: "Petite enfance - crèches",
  banque_finance: "Banque & Finance",
  assurance: "Assurance",
  courtage_intermediation: "Courtage & Intermédiation",
  audiovisuel_production: "Audiovisuel & Production",
  presse_edition: "Presse & Édition",
  art_galeries: "Art & Galeries",
  spectacle_evenementiel: "Spectacle & Événementiel",
  artisanat_technique: "Artisanat technique",
  services_domicile: "Services à domicile - ménage",
  pressing_blanchisserie: "Pressing & Blanchisserie",
  associations: "Associations",
  activite_non_precise: "Activité non précisée"
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { batchSize = 50 } = await req.json();

    // Récupérer les entreprises à qualifier
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const response = await fetch(
      `${supabaseUrl}/rest/v1/entreprises?select=id,nom,activite,forme_juridique&limit=${batchSize}`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch entreprises: ${response.statusText}`);
    }

    const entreprises = await response.json();

    if (entreprises.length === 0) {
      return new Response(
        JSON.stringify({ processed: 0, hasMore: false }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Qualifier chaque entreprise avec l'IA
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const updates = [];

    for (const entreprise of entreprises) {
      try {
        const prompt = `Tu es un expert en catégorisation d'entreprises françaises.

Entreprise:
- Nom: ${entreprise.nom}
- Activité: ${entreprise.activite || 'Non précisée'}
- Forme juridique: ${entreprise.forme_juridique || 'Non précisée'}

Catégories disponibles (choisis LA PLUS SPÉCIFIQUE):
${Object.entries(DETAILED_CATEGORIES).map(([key, desc]) => `- ${key}: ${desc}`).join('\n')}

Réponds UNIQUEMENT avec la clé de la catégorie la plus appropriée (exemple: "immobilier_commercial").`;

        const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${LOVABLE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'google/gemini-2.5-flash',
            messages: [
              { role: 'system', content: 'Tu es un expert en classification. Réponds toujours avec une seule clé de catégorie, rien d\'autre.' },
              { role: 'user', content: prompt }
            ],
            max_tokens: 50,
            temperature: 0.3
          }),
        });

        if (aiResponse.status === 429) {
          console.error('Rate limit exceeded');
          return new Response(
            JSON.stringify({ error: 'Rate limit exceeded. Please wait before retrying.' }),
            { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        if (aiResponse.status === 402) {
          console.error('Payment required - credits exhausted');
          return new Response(
            JSON.stringify({ error: 'Credits exhausted. Please add credits to continue.' }),
            { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        if (!aiResponse.ok) {
          console.error(`AI API error: ${aiResponse.status} ${await aiResponse.text()}`);
          continue;
        }

        const aiData = await aiResponse.json();
        let category = aiData.choices?.[0]?.message?.content?.trim() || 'activite_non_precise';

        // Nettoyer la réponse (enlever quotes, espaces, etc.)
        category = category.replace(/['"]/g, '').trim();

        // Vérifier que c'est une catégorie valide
        if (!DETAILED_CATEGORIES[category as keyof typeof DETAILED_CATEGORIES]) {
          category = 'activite_non_precise';
        }

        updates.push({
          id: entreprise.id,
          categorie_qualifiee: category,
          date_qualification: new Date().toISOString()
        });

      } catch (error) {
        console.error(`Error qualifying entreprise ${entreprise.id}:`, error);
        continue;
      }
    }

    // Mettre à jour en base
    if (updates.length > 0) {
      for (const update of updates) {
        await fetch(
          `${supabaseUrl}/rest/v1/entreprises?id=eq.${update.id}`,
          {
            method: 'PATCH',
            headers: {
              'apikey': supabaseKey,
              'Authorization': `Bearer ${supabaseKey}`,
              'Content-Type': 'application/json',
              'Prefer': 'return=minimal'
            },
            body: JSON.stringify({
              categorie_qualifiee: update.categorie_qualifiee,
              date_qualification: update.date_qualification
            })
          }
        );
      }
    }

    return new Response(
      JSON.stringify({
        processed: updates.length,
        hasMore: entreprises.length === batchSize
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in qualify-detailed-categories:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
