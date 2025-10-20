import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Entreprise {
  id: string;
  nom: string;
  latitude: number;
  longitude: number;
  adresse?: string;
  ville?: string;
  code_postal?: string;
}

interface OptimizationRequest {
  entreprises: Entreprise[];
  point_depart?: { lat: number; lng: number };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { entreprises, point_depart }: OptimizationRequest = await req.json();
    
    if (!entreprises || entreprises.length === 0) {
      throw new Error("Aucune entreprise fournie");
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Préparer les données pour l'IA
    const entreprisesInfo = entreprises.map((e, idx) => 
      `${idx + 1}. ${e.nom} - ${e.ville || ''} ${e.code_postal || ''} (Lat: ${e.latitude}, Lng: ${e.longitude})`
    ).join('\n');

    const departInfo = point_depart 
      ? `Point de départ: Lat ${point_depart.lat}, Lng ${point_depart.lng}`
      : "Point de départ: première entreprise de la liste";

    const systemPrompt = `Tu es un expert en optimisation d'itinéraires commerciaux. 
Ta mission est d'optimiser l'ordre de visite d'entreprises pour minimiser la distance totale parcourue.

Règles:
- Utilise l'algorithme du plus proche voisin
- Retourne UNIQUEMENT un JSON valide avec la structure exacte demandée
- Calcule les distances en ligne droite (approximation Haversine)
- Estime 15 minutes par visite + temps de trajet
- Format de réponse obligatoire: {"ordre": [indices], "distance_km": number, "temps_minutes": number, "explication": "texte"}`;

    const userPrompt = `${departInfo}

Entreprises à visiter:
${entreprisesInfo}

Optimise l'ordre de visite pour minimiser la distance totale. 
Retourne un JSON avec:
- ordre: tableau des indices (0-based) dans l'ordre optimal de visite
- distance_km: distance totale estimée en km
- temps_minutes: temps total estimé incluant visites (15min chacune) et trajets
- explication: brève explication de l'optimisation (2-3 phrases)`;

    // Appel à Lovable AI
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Lovable AI error:', response.status, errorText);
      throw new Error(`AI optimization failed: ${response.status}`);
    }

    const aiData = await response.json();
    const aiResponse = aiData.choices[0].message.content;
    
    // Parser la réponse JSON de l'IA
    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Format de réponse IA invalide");
    }

    const result = JSON.parse(jsonMatch[0]);
    
    // Valider et construire l'ordre optimisé avec les IDs
    const ordreOptimise = result.ordre.map((idx: number) => entreprises[idx].id);
    
    return new Response(
      JSON.stringify({
        ordre_optimise: ordreOptimise,
        entreprises_ordonnees: result.ordre.map((idx: number) => entreprises[idx]),
        distance_totale_km: result.distance_km,
        temps_estime_minutes: result.temps_minutes,
        explication: result.explication,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in optimize-tournee:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        details: error instanceof Error ? error.stack : undefined
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
