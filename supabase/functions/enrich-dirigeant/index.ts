import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { siret } = await req.json()

    if (!siret) {
      throw new Error('SIRET manquant')
    }

    console.log('🔍 Enrichissement dirigeant pour SIRET:', siret)

    // Clé API Pappers
    const PAPPERS_API_KEY = '1e9c651924c40f6cb1d6aa6b0332ffadd084a5c3c06630ef'

    // Appel à l'API Pappers
    const pappersUrl = `https://api.pappers.fr/v2/entreprise?api_token=${PAPPERS_API_KEY}&siret=${siret}`
    
    console.log('📞 Appel Pappers API...')
    const pappersResponse = await fetch(pappersUrl)

    if (!pappersResponse.ok) {
      const errorText = await pappersResponse.text()
      console.error('❌ Erreur Pappers:', errorText)
      throw new Error(`Erreur API Pappers: ${pappersResponse.status}`)
    }

    const pappersData = await pappersResponse.json()
    console.log('✅ Réponse Pappers reçue')

    // Extraire les infos du dirigeant principal
    let dirigeantNom = null
    let dirigeantPrenom = null
    let dirigeantFonction = null
    let dirigeantComplet = null

    if (pappersData.representants && pappersData.representants.length > 0) {
      // Prendre le premier représentant (généralement le gérant principal)
      const representant = pappersData.representants[0]
      
      // Personne physique
      if (representant.nom && representant.prenom) {
        dirigeantNom = representant.nom
        dirigeantPrenom = representant.prenom
        dirigeantComplet = `${representant.prenom} ${representant.nom}`
      }
      // Personne morale
      else if (representant.denomination) {
        dirigeantComplet = representant.denomination
      }

      // Fonction (gérant, président, etc.)
      dirigeantFonction = representant.qualite || 'Gérant'
    }

    // Si pas de représentants, essayer les dirigeants
    if (!dirigeantComplet && pappersData.dirigeants && pappersData.dirigeants.length > 0) {
      const dirigeant = pappersData.dirigeants[0]
      
      if (dirigeant.nom && dirigeant.prenom) {
        dirigeantNom = dirigeant.nom
        dirigeantPrenom = dirigeant.prenom
        dirigeantComplet = `${dirigeant.prenom} ${dirigeant.nom}`
      } else if (dirigeant.denomination) {
        dirigeantComplet = dirigeant.denomination
      }

      dirigeantFonction = dirigeant.qualite || 'Dirigeant'
    }

    console.log('📋 Dirigeant extrait:', dirigeantComplet)

    // Initialiser le client Supabase
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Mettre à jour la base de données
    const { data: updateData, error: updateError } = await supabaseClient
      .from('nouveaux_sites')
      .update({
        dirigeant: dirigeantComplet,
        fonction_dirigeant: dirigeantFonction,
        enrichi_dirigeant: true,
        date_enrichissement_dirigeant: new Date().toISOString(),
      })
      .eq('siret', siret)
      .select()
      .single()

    if (updateError) {
      console.error('❌ Erreur update BDD:', updateError)
      throw updateError
    }

    console.log('✅ Base de données mise à jour')

    // Retourner le résultat
    return new Response(
      JSON.stringify({
        success: true,
        dirigeant: dirigeantComplet,
        fonction: dirigeantFonction,
        source: 'pappers',
        entreprise: pappersData.nom_entreprise,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('❌ Erreur:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Erreur lors de l\'enrichissement',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
