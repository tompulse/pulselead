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

    // Vérification de l'authentification et du rôle admin
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Non autorisé - authentification requise' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Connexion à la base de destination pour vérifier le rôle
    const destDbUrl = Deno.env.get('SUPABASE_URL');
    const destDbKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!destDbUrl || !destDbKey) {
      throw new Error('Les secrets SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY ne sont pas configurés');
    }

    const destDb = createClient(destDbUrl, destDbKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Récupérer l'utilisateur authentifié
    const { data: { user }, error: userError } = await destDb.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (userError || !user) {
      console.error('❌ Erreur authentification:', userError);
      return new Response(
        JSON.stringify({ error: 'Non autorisé - utilisateur invalide' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Vérifier si l'utilisateur a le rôle admin
    const { data: isAdmin, error: roleError } = await destDb.rpc('has_role', {
      _user_id: user.id,
      _role: 'admin'
    });

    if (roleError || !isAdmin) {
      console.log('❌ Tentative d\'accès non autorisé par l\'utilisateur:', user.id);
      return new Response(
        JSON.stringify({ error: 'Non autorisé - droits administrateur requis' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ Utilisateur admin vérifié:', user.id);

    // Connexion à la base source
    const sourceDbUrl = Deno.env.get('SOURCE_DB_URL');
    const sourceDbKey = Deno.env.get('SOURCE_DB_ANON_KEY');
    
    console.log('📝 Debug - SOURCE_DB_URL:', sourceDbUrl);
    console.log('📝 Debug - SOURCE_DB_ANON_KEY exists:', !!sourceDbKey);
    
    if (!sourceDbUrl || !sourceDbKey) {
      throw new Error('Les secrets SOURCE_DB_URL et SOURCE_DB_ANON_KEY ne sont pas configurés');
    }

    // Nettoyer l'URL (enlever les espaces)
    const cleanSourceUrl = sourceDbUrl.trim();
    console.log('🧹 URL nettoyée:', cleanSourceUrl);

    const sourceDb = createClient(cleanSourceUrl, sourceDbKey);
    console.log('✅ Connecté à la base source');

    // Récupération des données depuis la base source
    const { data: sourceData, error: sourceError } = await sourceDb
      .from('Data SaaS Lovable')
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

    // Mapper et nettoyer les données (SIRET obligatoire et unique)
    const mappedDataRaw = (sourceData || []).map((item: any) => {
      const rawSiret = (item.siret ?? '').toString();
      // Garder uniquement les chiffres dans le SIRET
      const siret = rawSiret.replace(/\D/g, '').trim();
      
      // Parser la date de lancement (format: 2025-09-25)
      let dateDemarrage = null;
      if (item.lancement) {
        try {
          dateDemarrage = item.lancement;
        } catch (e) {
          console.warn('⚠️ Date invalide pour SIRET', siret, ':', item.lancement);
        }
      }

      // Parser le capital en nombre (ex: "10 000.00 EUR" -> 10000)
      const capitalStr = (item.capital ?? '').toString();
      const capitalParsed = capitalStr
        ? (() => {
            const cleaned = capitalStr.replace(/\s/g, '').replace(/[^\d,.-]/g, '').replace(',', '.');
            const num = parseFloat(cleaned);
            return Number.isFinite(num) ? num : null;
          })()
        : null;
      
      return {
        nom: item.entreprise || '',
        siret,
        numero_voie: item.numero_voie?.toString() || null,
        type_voie: item.type_voie || null,
        nom_voie: item.nom_voie || null,
        code_postal: (() => {
          const cp = item.code_postal?.toString() || null;
          // Normaliser le code postal : ajouter 0 devant si 4 chiffres
          return cp && cp.length === 4 ? '0' + cp : cp;
        })(),
        ville: item.ville || item.Ville || null, // Support pour différentes variations de noms de colonnes
        adresse: null, // On utilise les champs séparés
        latitude: item.latitude,
        longitude: item.longitude,
        date_demarrage: dateDemarrage,
        capital: capitalParsed,
        activite: item.activite || null,
        administration: item.interlocuteurs || null,
        code_naf: null,
        statut: null,
        telephone: null,
        email: null,
        forme_juridique: null,
        dirigeant: null,
        effectifs: null,
        chiffre_affaires: null,
        score_lead: null,
        enrichi: false,
        date_enrichissement: null,
        interlocuteur: null,
      };
    });

    // Filtrer les entrées sans SIRET valide
    const filteredData = mappedDataRaw.filter((d: any) => d.siret && d.siret.length > 0);

    // Dédupliquer par SIRET (on garde la première occurrence)
    const uniqueMap = new Map<string, any>();
    for (const row of filteredData) {
      if (!uniqueMap.has(row.siret)) uniqueMap.set(row.siret, row);
    }
    const mappedData = Array.from(uniqueMap.values());

    console.log(`🔄 ${mappedData.length} entreprises prêtes après nettoyage (source=${sourceData?.length || 0}, invalides=${mappedDataRaw.length - filteredData.length}, doublons=${filteredData.length - mappedData.length})`);

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
      .insert(mappedData)
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
