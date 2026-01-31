import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Site {
  id: number;
  nom: string;
  adresse?: string;
  numero_voie?: string;
  type_voie?: string;
  libelle_voie?: string;
  ville?: string;
  code_postal?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { batch_size = 50 } = await req.json().catch(() => ({}));
    
    console.log('[batch-geocode] Starting batch geocoding, batch_size:', batch_size);
    
    // Vérifier les secrets
    const MAPBOX_TOKEN = Deno.env.get('MAPBOX_ACCESS_TOKEN');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!MAPBOX_TOKEN || !SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
      throw new Error('Missing required environment variables');
    }
    
    // Créer client Supabase avec service_role
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    
    // Récupérer les sites à géocoder
    const { data: sites, error: fetchError } = await supabase
      .from('nouveaux_sites')
      .select('id, nom, adresse, numero_voie, type_voie, libelle_voie, ville, code_postal')
      .or('latitude.is.null,longitude.is.null')
      .not('ville', 'is', null)
      .limit(batch_size);
    
    if (fetchError) throw fetchError;
    if (!sites || sites.length === 0) {
      return new Response(
        JSON.stringify({ 
          message: 'Aucun site à géocoder',
          processed: 0,
          success: 0,
          errors: 0
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log('[batch-geocode] Found', sites.length, 'sites to geocode');
    
    let successCount = 0;
    let errorCount = 0;
    const results = [];
    
    for (const site of sites) {
      try {
        // Construire l'adresse de recherche
        const addressParts = [];
        
        if (site.numero_voie) addressParts.push(site.numero_voie);
        if (site.type_voie) addressParts.push(site.type_voie);
        if (site.libelle_voie) addressParts.push(site.libelle_voie);
        
        const streetAddress = addressParts.join(' ').trim() || site.adresse;
        
        if (streetAddress) addressParts.push(streetAddress);
        if (site.code_postal) addressParts.push(site.code_postal);
        if (site.ville) addressParts.push(site.ville);
        addressParts.push('France');
        
        const searchText = addressParts.join(', ');
        
        // Appeler Mapbox Geocoding
        const geocodeUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchText)}.json?access_token=${MAPBOX_TOKEN}&country=FR&limit=1`;
        
        const response = await fetch(geocodeUrl);
        
        if (!response.ok) {
          console.error('[batch-geocode] Mapbox error for', site.nom, ':', response.status);
          errorCount++;
          results.push({ id: site.id, nom: site.nom, success: false, error: 'Mapbox error' });
          continue;
        }
        
        const data = await response.json();
        
        if (!data.features || data.features.length === 0) {
          console.log('[batch-geocode] No results for', site.nom);
          errorCount++;
          results.push({ id: site.id, nom: site.nom, success: false, error: 'No results' });
          continue;
        }
        
        const [longitude, latitude] = data.features[0].center;
        
        // Vérifier que les coordonnées sont en France
        if (latitude < 41 || latitude > 51 || longitude < -5 || longitude > 10) {
          console.warn('[batch-geocode] Coordinates outside France for', site.nom, ':', latitude, longitude);
          errorCount++;
          results.push({ id: site.id, nom: site.nom, success: false, error: 'Outside France' });
          continue;
        }
        
        // Mettre à jour dans la base
        const { error: updateError } = await supabase
          .from('nouveaux_sites')
          .update({ 
            latitude, 
            longitude,
            updated_at: new Date().toISOString()
          })
          .eq('id', site.id);
        
        if (updateError) {
          console.error('[batch-geocode] Update error for', site.nom, ':', updateError);
          errorCount++;
          results.push({ id: site.id, nom: site.nom, success: false, error: 'Update failed' });
          continue;
        }
        
        successCount++;
        results.push({ 
          id: site.id, 
          nom: site.nom, 
          success: true, 
          latitude, 
          longitude 
        });
        
        console.log('[batch-geocode] ✅', site.nom, ':', latitude, longitude);
        
        // Rate limiting (Mapbox: 600 req/min)
        await new Promise(resolve => setTimeout(resolve, 120));
        
      } catch (err) {
        console.error('[batch-geocode] Error processing', site.nom, ':', err);
        errorCount++;
        results.push({ id: site.id, nom: site.nom, success: false, error: String(err) });
      }
    }
    
    console.log('[batch-geocode] Completed:', successCount, 'success,', errorCount, 'errors');
    
    return new Response(
      JSON.stringify({
        message: 'Batch geocoding completed',
        processed: sites.length,
        success: successCount,
        errors: errorCount,
        results
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );
    
  } catch (error) {
    console.error('[batch-geocode] Fatal error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        details: error instanceof Error ? error.stack : undefined
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
