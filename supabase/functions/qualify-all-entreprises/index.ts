import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Récupérer 50 entreprises non qualifiées
    const { data: entreprises, error: fetchError } = await supabase
      .from('entreprises')
      .select('id, activite, administration, forme_juridique, code_naf, nom')
      .is('categorie_qualifiee', null)
      .limit(50);

    if (fetchError) throw fetchError;

    const total = entreprises?.length || 0;
    console.log(`Starting qualification of ${total} entreprises`);

    const results = {
      total,
      processed: 0,
      succeeded: 0,
      failed: 0,
      categories: {} as Record<string, number>,
      errors: [] as string[],
    };

    // Traiter toutes les entreprises du batch
    for (const entreprise of entreprises) {
        try {
        const prompt = `Tu dois classifier cette entreprise dans UNE SEULE des 34 catégories suivantes.

CATÉGORIES AUTORISÉES (utilise exactement ces clés) :
- conseil-consulting : Conseil & Consulting
- holding : Holdings & Participations  
- immobilier : Immobilier & SCI
- finance-assurance : Finance & Assurance
- juridique : Juridique & Notaires
- maconnerie : Maçonnerie & Gros œuvre
- plomberie-chauffage : Plomberie & Chauffage
- electricite : Électricité
- menuiserie : Menuiserie & Charpente
- peinture-revetements : Peinture & Revêtements
- commerce-detail : Commerce de détail
- commerce-gros : Commerce de gros & Négoce
- e-commerce : E-commerce
- restauration : Restaurants & Brasseries
- cafes-bars : Cafés & Bars
- snack-fastfood : Snacks & Fast-food
- traiteur : Traiteur & Pâtisserie
- livraison-coursier : Livraison / Coursier
- transport-marchandises : Transport de marchandises
- vtc-taxi : VTC & Taxis
- informatique-dev : Informatique & Développement
- digital-web : Digital & Web
- marketing-pub : Marketing & Publicité
- energie-renouvelable : Énergie renouvelable
- environnement-recyclage : Environnement & Recyclage
- sante-medical : Santé & Médical
- beaute-coiffure : Beauté & Coiffure
- industrie-fabrication : Industrie & Fabrication
- agriculture : Agriculture & Viticulture
- education-formation : Éducation & Formation
- artisanat-reparation : Artisanat & Réparation
- services-personne : Services à la personne
- hotellerie : Hôtellerie & Hébergement
- culture-spectacles : Culture & Spectacles
- sport-loisirs : Sport & Loisirs
- autre : Autres activités

ENTREPRISE À QUALIFIER :
- Nom: ${entreprise.nom || 'Non spécifié'}
- Activité: ${entreprise.activite || 'Non spécifiée'}
- Administration: ${entreprise.administration || 'Non spécifiée'}
- Forme juridique: ${entreprise.forme_juridique || 'Non spécifiée'}
- Code NAF: ${entreprise.code_naf || 'Non spécifié'}

INSTRUCTIONS CRITIQUES:
1. Tu DOIS utiliser EXACTEMENT l'une des clés ci-dessus (ex: "conseil-consulting", "maconnerie", "restauration")
2. Réponds UNIQUEMENT au format: "categorie-exacte|score"
3. Score de confiance entre 1 et 100
4. Si aucune catégorie ne correspond parfaitement, utilise "autre"

RÉPONDS UNIQUEMENT: "categorie-exacte|score"
RIEN D'AUTRE. PAS D'EXPLICATION.`;

          const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${lovableApiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'google/gemini-2.5-flash-lite',
              messages: [{ role: 'user', content: prompt }],
            }),
          });

          if (!aiResponse.ok) {
            const errorText = await aiResponse.text();
            console.error(`AI Error for ${entreprise.id}:`, errorText);
            results.failed++;
            results.errors.push(`${entreprise.id}: ${errorText}`);
            continue;
          }

          const aiData = await aiResponse.json();
          const response = aiData.choices[0].message.content.trim();
          
          const [categorie, confidenceStr] = response.split('|');
          const confidence = parseInt(confidenceStr) || 50;
          let categorieClean = categorie.toLowerCase().trim();

          // Liste des catégories valides
          const validCategories = [
            'conseil-consulting', 'holding', 'immobilier', 'finance-assurance', 'juridique',
            'maconnerie', 'plomberie-chauffage', 'electricite', 'menuiserie', 'peinture-revetements',
            'commerce-detail', 'commerce-gros', 'e-commerce', 'restauration', 'cafes-bars',
            'snack-fastfood', 'traiteur', 'livraison-coursier', 'transport-marchandises', 'vtc-taxi',
            'informatique-dev', 'digital-web', 'marketing-pub', 'energie-renouvelable',
            'environnement-recyclage', 'sante-medical', 'beaute-coiffure', 'industrie-fabrication',
            'agriculture', 'education-formation', 'artisanat-reparation', 'services-personne',
            'hotellerie', 'culture-spectacles', 'sport-loisirs', 'autre'
          ];

          // Validation: si la catégorie n'est pas valide, forcer "autre"
          if (!validCategories.includes(categorieClean)) {
            console.log(`Invalid category "${categorieClean}" for ${entreprise.id}, forcing "autre"`);
            categorieClean = 'autre';
          }

          // Mettre à jour l'entreprise
          const { error: updateError } = await supabase
            .from('entreprises')
            .update({
              categorie_qualifiee: categorieClean,
              categorie_confidence: confidence,
              date_qualification: new Date().toISOString(),
            })
            .eq('id', entreprise.id);

          if (updateError) {
            console.error(`Update error for ${entreprise.id}:`, updateError);
            results.failed++;
            results.errors.push(`${entreprise.id}: ${updateError.message}`);
          } else {
            results.succeeded++;
            results.categories[categorieClean] = (results.categories[categorieClean] || 0) + 1;
          }

          results.processed++;

        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          console.error(`Error qualifying ${entreprise.id}:`, errorMessage);
          results.failed++;
          results.errors.push(`${entreprise.id}: ${errorMessage}`);
        }
      }

    console.log('Qualification complete:', results);

    return new Response(
      JSON.stringify(results),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in qualify-all-entreprises:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});