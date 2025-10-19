import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🔄 Début de la synchronisation des entreprises...');

    // Connexion à la base source
    const sourceDbUrl = Deno.env.get('SOURCE_DB_URL');
    const sourceDbKey = Deno.env.get('SOURCE_DB_ANON_KEY');
    
    if (!sourceDbUrl || !sourceDbKey) {
      throw new Error('Les secrets SOURCE_DB_URL et SOURCE_DB_ANON_KEY ne sont pas configurés');
    }

    const sourceDb = createClient(sourceDbUrl, sourceDbKey);
    console.log('✅ Connecté à la base source');

    // Connexion à la base de destination (Lovable Cloud)
    const destDbUrl = Deno.env.get('SUPABASE_URL');
    const destDbKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!destDbUrl || !destDbKey) {
      throw new Error('Les secrets SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY ne sont pas configurés');
    }

    const destDb = createClient(destDbUrl, destDbKey);
    console.log('✅ Connecté à la base de destination');

    // Récupération des données depuis la base source
    const { data: sourceData, error: sourceError } = await sourceDb
      .from('entreprises')
      .select('*');

    if (sourceError) {
      console.error('❌ Erreur lors de la récupération des données source:', sourceError);
      throw sourceError;
    }

    console.log(`📊 ${sourceData?.length || 0} entreprises récupérées depuis la source`);

    if (!sourceData || sourceData.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Aucune donnée à synchroniser',
          synced: 0 
        }), 
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Suppression des anciennes données (pour une synchronisation complète)
    const { error: deleteError } = await destDb
      .from('entreprises')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Supprime tout

    if (deleteError) {
      console.error('⚠️ Erreur lors de la suppression des anciennes données:', deleteError);
    } else {
      console.log('🗑️ Anciennes données supprimées');
    }

    // Insertion des nouvelles données
    const { data: insertedData, error: insertError } = await destDb
      .from('entreprises')
      .insert(sourceData)
      .select();

    if (insertError) {
      console.error('❌ Erreur lors de l\'insertion des données:', insertError);
      throw insertError;
    }

    console.log(`✅ ${insertedData?.length || 0} entreprises synchronisées avec succès`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Synchronisation réussie',
        synced: insertedData?.length || 0,
        timestamp: new Date().toISOString()
      }), 
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('❌ Erreur de synchronisation:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
    return new Response(
      JSON.stringify({ 
        success: false,
        error: errorMessage,
        timestamp: new Date().toISOString()
      }), 
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
