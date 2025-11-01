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

    const systemPrompt = `Tu es un assistant IA spécialisé dans la création de tournées commerciales pour le système LUMA.

**Ton rôle:**
- Analyser les demandes en français des commerciaux
- Extraire les critères de filtrage (secteurs d'activité, départements, formes juridiques, dates)
- Générer un nom de tournée pertinent
- Déterminer la date souhaitée
- Identifier le type de prospects (créations ou nouveaux sites)

**Structure des filtres disponibles:**

1. **Catégories NAF** (secteurs d'activité):
${Object.keys(NAF_MAPPING).map(k => `   - ${k}: ${NAF_MAPPING[k].join(", ")}`).join("\n")}

2. **Régions et départements:**
${Object.entries(REGIONS_DEPARTMENTS).map(([region, depts]) => `   - ${region}: ${depts.join(", ")}`).join("\n")}

3. **Formes juridiques:**
   - Société par actions simplifiée (SAS)
   - Société à responsabilité limitée (SARL)
   - Société civile immobilière (SCI)
   - Société civile (SC)
   - Société par actions simplifiée (à associé unique) (SASU)
   - Société en Nom Collectif (SNC)
   - Société à responsabilité limitée (à associé unique) (EURL)

4. **Types de prospects:**
   - "creations" = créations d'entreprises
   - "nouveaux-sites" = nouveaux établissements

**Exemples de conversion:**
- "restauration" → hotellerie (codes 55, 56)
- "informatique" → informatique_services (codes 62, 63)
- "BTP" ou "construction" → construction (codes 41, 42, 43)
- "Paris" ou "75" → ["75"]
- "Île-de-France" → ["75", "77", "78", "91", "92", "93", "94", "95"]
- "demain" → date du lendemain
- "aujourd'hui" → date du jour
- "vendredi prochain" → calcul du prochain vendredi

**Règles:**
- Toujours suggérer "creations" par défaut si non spécifié
- Si pas de date spécifiée, suggérer demain
- Générer un nom de tournée descriptif basé sur les critères
- Retourner les codes NAF en format key (pas les numéros)
- Si ambiguïté, demander clarification`;

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

    return new Response(
      JSON.stringify(result),
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
