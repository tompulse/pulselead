import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const NAF_MAPPING: Record<string, string[]> = {
  "agriculture": ["01", "02", "03"],
  "industrie_alimentaire": ["10", "11", "12"],
  "textile": ["13", "14", "15"],
  "bois_papier": ["16", "17", "18"],
  "chimie": ["19", "20", "21"],
  "plastique": ["22", "23"],
  "metallurgie": ["24", "25", "28"],
  "informatique": ["26", "27"],
  "automobile": ["29", "30"],
  "meubles": ["31", "32", "33"],
  "energie": ["35", "36", "37", "38", "39"],
  "construction": ["41", "42", "43"],
  "commerce_auto": ["45"],
  "commerce_gros": ["46"],
  "commerce_detail": ["47"],
  "transport": ["49", "50", "51", "52", "53"],
  "hotellerie": ["55", "56"],
  "communication": ["58", "59", "60", "61"],
  "informatique_services": ["62", "63"],
  "finance": ["64", "65", "66"],
  "immobilier": ["68"],
  "juridique": ["69", "70"],
  "architecture": ["71", "72", "73", "74", "75"],
  "services_admin": ["77", "78", "79", "80", "81", "82"],
  "administration": ["84"],
  "enseignement": ["85"],
  "sante": ["86", "87", "88"],
  "culture": ["90", "91", "92", "93"],
  "autres_services": ["94", "95", "96"],
  "menages": ["97", "98"],
  "international": ["99"]
};

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

    const systemPrompt = `Tu es un assistant IA pour créer des tournées commerciales. Tu extrais simplement les critères demandés.

**IMPORTANT:** Tu ne fais JAMAIS de propositions ou suggestions non sollicitées. Tu réponds uniquement à ce qui t'es demandé.

**Secteurs d'activité (NAF):**
${Object.keys(NAF_MAPPING).map(k => `- ${k}`).join("\n")}

**Départements disponibles:** 01-95, 2A, 2B

**Formes juridiques:** SAS, SARL, SCI, SC, SASU, SNC, EURL

**Types de prospects:**
- "creations" = créations d'entreprises (par défaut)
- "nouveaux-sites" = nouveaux établissements

**Conversions courantes:**
- "restauration" → hotellerie
- "BTP" ou "construction" → construction
- "informatique" → informatique_services
- "Paris" ou "75" → ["75"]
- "demain" → date du lendemain

**Règles:**
- Extrait uniquement ce qui est demandé
- Si données manquantes ou ambiguës, demande clarification de façon concise
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
                      categories: {
                        type: "array",
                        items: { type: "string" },
                        description: "Keys des catégories NAF (ex: ['hotellerie', 'construction'])"
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

    // Créer client Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseClient = createClient(supabaseUrl, supabaseKey);

    // Déterminer la table selon le type de vue
    const tableName = result.view === "creations" ? "entreprises" : "nouveaux_sites";

    // Construire la requête avec les filtres
    let query = supabaseClient.from(tableName).select('*')
      .not('latitude', 'is', null)
      .not('longitude', 'is', null);

    // Appliquer filtres NAF (codes à 2 chiffres)
    if (result.filters.categories && result.filters.categories.length > 0) {
      const nafCodes: string[] = [];
      result.filters.categories.forEach((cat: string) => {
        if (NAF_MAPPING[cat]) {
          nafCodes.push(...NAF_MAPPING[cat]);
        }
      });
      if (nafCodes.length > 0) {
        const nafFilters = nafCodes.map(code => `code_naf.like.${code}%`).join(',');
        query = query.or(nafFilters);
      }
    }

    // Appliquer filtres départements
    if (result.filters.departments && result.filters.departments.length > 0) {
      const deptFilters = result.filters.departments.map((d: string) => `code_postal.like.${d}%`).join(',');
      query = query.or(deptFilters);
    }

    // Appliquer filtres formes juridiques
    if (result.filters.formesJuridiques && result.filters.formesJuridiques.length > 0) {
      query = query.in('forme_juridique', result.filters.formesJuridiques);
    }

    const { data: entreprises, error: dbError } = await query;

    if (dbError) {
      console.error("Database error:", dbError);
      throw new Error("Erreur lors de la récupération des entreprises");
    }

    // Gérer les edge cases
    if (!entreprises || entreprises.length === 0) {
      return new Response(
        JSON.stringify({
          ...result,
          needsClarification: true,
          clarificationMessage: "Aucune entreprise trouvée. Voulez-vous élargir les critères ?"
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    if (entreprises.length > 30) {
      return new Response(
        JSON.stringify({
          ...result,
          needsClarification: true,
          clarificationMessage: `${entreprises.length} entreprises trouvées. Voulez-vous préciser les critères pour réduire ?`
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    // Appeler optimize-tournee
    console.log(`Optimisation de ${entreprises.length} entreprises...`);
    const { data: optimized, error: optimizeError } = await supabaseClient.functions.invoke('optimize-tournee', {
      body: {
        entreprises: entreprises,
        point_depart: null
      }
    });

    if (optimizeError) {
      console.error("Optimization error:", optimizeError);
      return new Response(
        JSON.stringify({
          ...result,
          needsClarification: true,
          clarificationMessage: "Impossible d'optimiser la tournée. Vérifiez les adresses."
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    // Retourner le résultat enrichi
    return new Response(
      JSON.stringify({
        ...result,
        optimization: {
          entreprises: optimized.entreprises_ordonnees,
          entreprises_ids: optimized.ordre_optimise,
          distance_km: optimized.distance_totale_km,
          temps_trajet_minutes: optimized.temps_trajet_minutes,
          temps_visites_minutes: optimized.entreprises_ordonnees.length * 15,
          temps_total_minutes: optimized.temps_estime_minutes,
          nb_arrets: optimized.entreprises_ordonnees.length,
          excluded_count: 0
        }
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200
      }
    );

  } catch (error) {
    console.error("Error in chat-tournee-assistant:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Erreur inconnue",
        errorType: "server_error"
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
