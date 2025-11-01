import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Catégories détaillées avec NAF codes et mots-clés
const DETAILED_CATEGORIES = [
  { key: 'agriculture-cultures', nafCodes: ['01.1', '01.2'], keywords: ['culture', 'maraîchage', 'céréales', 'légumes'] },
  { key: 'agriculture-elevage', nafCodes: ['01.4', '01.5'], keywords: ['élevage', 'bovins', 'porcins', 'volailles'] },
  { key: 'agriculture-viticole', nafCodes: ['01.21'], keywords: ['vigne', 'viticole', 'vin', 'viticulture'] },
  { key: 'agriculture-forestier', nafCodes: ['02'], keywords: ['forêt', 'bois', 'sylviculture'] },
  { key: 'agriculture-peche', nafCodes: ['03'], keywords: ['pêche', 'aquaculture', 'poisson'] },
  { key: 'alimentaire-boulangerie', nafCodes: ['10.71'], keywords: ['boulangerie', 'pâtisserie', 'pain', 'viennoiserie'] },
  { key: 'alimentaire-boucherie', nafCodes: ['10.11', '10.13'], keywords: ['boucherie', 'charcuterie', 'viande'] },
  { key: 'alimentaire-laiterie', nafCodes: ['10.51'], keywords: ['laiterie', 'fromage', 'yaourt', 'crème'] },
  { key: 'alimentaire-boissons', nafCodes: ['11'], keywords: ['boisson', 'jus', 'eau', 'soda'] },
  { key: 'alimentaire-conserves', nafCodes: ['10.39', '10.85'], keywords: ['conserve', 'plat', 'préparé'] },
  { key: 'alimentaire-confiserie', nafCodes: ['10.82'], keywords: ['chocolat', 'confiserie', 'bonbon'] },
  { key: 'textile-confection', nafCodes: ['13', '14'], keywords: ['textile', 'vêtement', 'confection', 'habit'] },
  { key: 'textile-cuir', nafCodes: ['15'], keywords: ['cuir', 'maroquinerie', 'sac', 'chaussure'] },
  { key: 'btp-gros-oeuvre', nafCodes: ['41', '43.99'], keywords: ['maçonnerie', 'gros oeuvre', 'fondation', 'béton'] },
  { key: 'btp-charpente', nafCodes: ['43.91'], keywords: ['charpente', 'couverture', 'toiture', 'zinguerie'] },
  { key: 'btp-menuiserie', nafCodes: ['16', '43.32'], keywords: ['menuiserie', 'menuisier', 'fenêtre', 'porte'] },
  { key: 'btp-plomberie', nafCodes: ['43.22'], keywords: ['plomberie', 'plombier', 'chauffage', 'sanitaire'] },
  { key: 'btp-electricite', nafCodes: ['43.21'], keywords: ['électricité', 'électricien', 'électrique'] },
  { key: 'btp-peinture', nafCodes: ['43.34'], keywords: ['peinture', 'peintre', 'finition'] },
  { key: 'btp-terrassement', nafCodes: ['42', '43.12'], keywords: ['terrassement', 'vrd', 'voirie'] },
  { key: 'auto-concessionnaire', nafCodes: ['45.11'], keywords: ['concessionnaire', 'vente', 'voiture', 'automobile'] },
  { key: 'auto-garage', nafCodes: ['45.20'], keywords: ['garage', 'réparation', 'mécanique', 'entretien'] },
  { key: 'auto-carrosserie', nafCodes: ['45.20B'], keywords: ['carrosserie', 'peinture', 'carrossier'] },
  { key: 'auto-pieces', nafCodes: ['45.31', '45.32'], keywords: ['pièce', 'détachée', 'accessoire'] },
  { key: 'commerce-supermarche', nafCodes: ['47.11'], keywords: ['supermarché', 'hypermarché', 'grande surface'] },
  { key: 'commerce-alimentation', nafCodes: ['47.2'], keywords: ['épicerie', 'alimentation', 'primeur'] },
  { key: 'commerce-pharmacie', nafCodes: ['47.73'], keywords: ['pharmacie', 'pharmacien', 'médicament'] },
  { key: 'commerce-optique', nafCodes: ['47.78A'], keywords: ['optique', 'opticien', 'lunette'] },
  { key: 'commerce-bricolage', nafCodes: ['47.52'], keywords: ['bricolage', 'jardinerie', 'outillage'] },
  { key: 'commerce-electromenager', nafCodes: ['47.4', '47.5'], keywords: ['électroménager', 'informatique', 'téléphone'] },
  { key: 'commerce-meuble', nafCodes: ['47.59'], keywords: ['meuble', 'décoration', 'ameublement'] },
  { key: 'commerce-vetement', nafCodes: ['47.71'], keywords: ['vêtement', 'mode', 'prêt-à-porter'] },
  { key: 'commerce-chaussure', nafCodes: ['47.72'], keywords: ['chaussure', 'basket', 'bottier'] },
  { key: 'commerce-bijouterie', nafCodes: ['47.77'], keywords: ['bijouterie', 'horlogerie', 'bijou'] },
  { key: 'commerce-librairie', nafCodes: ['47.61', '47.62'], keywords: ['librairie', 'presse', 'livre'] },
  { key: 'commerce-fleuriste', nafCodes: ['47.76'], keywords: ['fleuriste', 'fleur', 'bouquet'] },
  { key: 'commerce-tabac', nafCodes: ['47.26'], keywords: ['tabac', 'presse', 'cigarette'] },
  { key: 'gros-alimentaire', nafCodes: ['46.3'], keywords: ['grossiste', 'alimentaire', 'cash'] },
  { key: 'gros-materiel', nafCodes: ['46.7'], keywords: ['matériaux', 'négoce', 'fourniture'] },
  { key: 'gros-produits', nafCodes: ['46.4', '46.5'], keywords: ['produit', 'distribution'] },
  { key: 'resto-restaurant', nafCodes: ['56.10A'], keywords: ['restaurant', 'gastronomie', 'table'] },
  { key: 'resto-fastfood', nafCodes: ['56.10C'], keywords: ['fast food', 'snack', 'burger', 'sandwich'] },
  { key: 'resto-cafeteria', nafCodes: ['56.10B'], keywords: ['cafétéria', 'self', 'cantine'] },
  { key: 'resto-traiteur', nafCodes: ['56.21'], keywords: ['traiteur', 'événement', 'buffet'] },
  { key: 'resto-bar', nafCodes: ['56.30'], keywords: ['bar', 'café', 'brasserie', 'pub'] },
  { key: 'hotellerie-hotel', nafCodes: ['55.10'], keywords: ['hôtel', 'hébergement', 'chambre'] },
  { key: 'transport-routier', nafCodes: ['49.41'], keywords: ['transport', 'routier', 'marchandise', 'messagerie'] },
  { key: 'transport-demenagement', nafCodes: ['49.42'], keywords: ['déménagement', 'déménageur'] },
  { key: 'transport-taxi', nafCodes: ['49.32'], keywords: ['taxi', 'vtc', 'transport', 'personne'] },
  { key: 'transport-logistique', nafCodes: ['52'], keywords: ['entrepôt', 'logistique', 'stockage'] },
  { key: 'info-developpement', nafCodes: ['62.01'], keywords: ['développement', 'logiciel', 'programmation', 'dev'] },
  { key: 'info-conseil', nafCodes: ['62.02'], keywords: ['conseil', 'consulting', 'it', 'informatique'] },
  { key: 'info-webagency', nafCodes: ['62.01', '73.11'], keywords: ['web', 'digital', 'site', 'agence'] },
  { key: 'info-hebergement', nafCodes: ['63.11'], keywords: ['hébergement', 'cloud', 'serveur'] },
  { key: 'finance-banque', nafCodes: ['64.1'], keywords: ['banque', 'crédit', 'bancaire'] },
  { key: 'finance-assurance', nafCodes: ['65'], keywords: ['assurance', 'mutuelle', 'assureur'] },
  { key: 'finance-holding', nafCodes: ['64.2', '70.10'], keywords: ['holding', 'gestion', 'portefeuille'] },
  { key: 'finance-comptable', nafCodes: ['69.20'], keywords: ['comptable', 'expertise', 'compta'] },
  { key: 'immo-agence', nafCodes: ['68.31'], keywords: ['agence', 'immobilier', 'transaction'] },
  { key: 'immo-syndic', nafCodes: ['68.32'], keywords: ['syndic', 'gestion', 'copropriété'] },
  { key: 'immo-promotion', nafCodes: ['41.10'], keywords: ['promotion', 'promoteur', 'construction'] },
  { key: 'immo-location', nafCodes: ['68.20'], keywords: ['location', 'bailleur'] },
  { key: 'juridique-avocat', nafCodes: ['69.10'], keywords: ['avocat', 'juridique', 'droit'] },
  { key: 'juridique-notaire', nafCodes: ['69.10'], keywords: ['notaire', 'notariat'] },
  { key: 'conseil-management', nafCodes: ['70.22'], keywords: ['conseil', 'consulting', 'stratégie'] },
  { key: 'archi-architecture', nafCodes: ['71.11'], keywords: ['architecte', 'architecture', 'plan'] },
  { key: 'archi-bureau-etudes', nafCodes: ['71.12'], keywords: ['bureau', 'étude', 'ingénierie'] },
  { key: 'archi-geometre', nafCodes: ['71.12A'], keywords: ['géomètre', 'topographie'] },
  { key: 'formation-ecole', nafCodes: ['85'], keywords: ['école', 'formation', 'enseignement'] },
  { key: 'formation-conduite', nafCodes: ['85.53'], keywords: ['auto-école', 'conduite', 'permis'] },
  { key: 'formation-professionnelle', nafCodes: ['85.59'], keywords: ['formation', 'professionnel', 'continue'] },
  { key: 'sante-medecin', nafCodes: ['86.21'], keywords: ['médecin', 'généraliste', 'docteur'] },
  { key: 'sante-dentiste', nafCodes: ['86.23'], keywords: ['dentiste', 'dentaire', 'orthodontie'] },
  { key: 'sante-kine', nafCodes: ['86.90'], keywords: ['kinésithérapeute', 'kiné', 'ostéopathe'] },
  { key: 'sante-infirmier', nafCodes: ['86.90'], keywords: ['infirmier', 'infirmière', 'soin'] },
  { key: 'sante-labo', nafCodes: ['86.90'], keywords: ['laboratoire', 'analyse', 'médical'] },
  { key: 'sante-clinique', nafCodes: ['86.10'], keywords: ['clinique', 'hôpital', 'centre'] },
  { key: 'sante-ehpad', nafCodes: ['87'], keywords: ['ehpad', 'résidence', 'maison', 'retraite'] },
  { key: 'service-coiffeur', nafCodes: ['96.02'], keywords: ['coiffeur', 'coiffure', 'salon'] },
  { key: 'service-esthetique', nafCodes: ['96.02'], keywords: ['esthétique', 'beauté', 'spa', 'onglerie'] },
  { key: 'service-pressing', nafCodes: ['96.01'], keywords: ['pressing', 'blanchisserie', 'nettoyage'] },
  { key: 'service-reparation', nafCodes: ['95'], keywords: ['réparation', 'dépannage'] },
  { key: 'sport-salle', nafCodes: ['93.13'], keywords: ['sport', 'fitness', 'musculation', 'salle'] },
  { key: 'sport-piscine', nafCodes: ['93.11'], keywords: ['piscine', 'aquatique', 'natation'] },
  { key: 'loisirs-cinema', nafCodes: ['59.14'], keywords: ['cinéma', 'film', 'multiplex'] },
  { key: 'culture-spectacle', nafCodes: ['90'], keywords: ['spectacle', 'événement', 'concert'] },
  { key: 'culture-musee', nafCodes: ['91'], keywords: ['musée', 'patrimoine', 'exposition'] },
  { key: 'energie-electricite', nafCodes: ['35.11'], keywords: ['électricité', 'production', 'énergie'] },
  { key: 'energie-renouvelable', nafCodes: ['35.11', '35.14'], keywords: ['solaire', 'éolien', 'renouvelable', 'photovoltaïque'] },
  { key: 'energie-gaz', nafCodes: ['35.2'], keywords: ['gaz', 'réseau', 'distribution'] },
  { key: 'service-interim', nafCodes: ['78'], keywords: ['intérim', 'recrutement', 'travail', 'temporaire'] },
  { key: 'service-nettoyage', nafCodes: ['81.2'], keywords: ['nettoyage', 'entretien', 'propreté'] },
  { key: 'service-securite', nafCodes: ['80.1'], keywords: ['sécurité', 'gardiennage', 'surveillance'] },
  { key: 'service-publicite', nafCodes: ['73'], keywords: ['publicité', 'marketing', 'communication'] },
  { key: 'industrie-metallurgie', nafCodes: ['24', '25'], keywords: ['métallurgie', 'chaudronnerie', 'mécanique'] },
  { key: 'industrie-plastique', nafCodes: ['22'], keywords: ['plastique', 'plasturgie', 'injection'] },
  { key: 'industrie-chimie', nafCodes: ['20'], keywords: ['chimie', 'chimique', 'produit'] },
  { key: 'industrie-electronique', nafCodes: ['26', '27'], keywords: ['électronique', 'composant', 'circuit'] },
];

// Mapping catégories qualifiées (Créations) → catégories détaillées
const QUALIF_TO_DETAILED: Record<string, string> = {
  'immobilier': 'immo-agence',
  'holding': 'finance-holding',
  'commerce-detail': 'commerce-alimentation',
  'conseil-consulting': 'conseil-management',
  'commerce-gros': 'gros-produits',
  'informatique-dev': 'info-developpement',
  'restauration': 'resto-restaurant',
  'agriculture': 'agriculture-cultures',
  'artisanat-reparation': 'service-reparation',
  'energie-renouvelable': 'energie-renouvelable',
  'maconnerie': 'btp-gros-oeuvre',
  'digital-web': 'info-webagency',
  'education-formation': 'formation-professionnelle',
  'industrie-fabrication': 'industrie-metallurgie',
  'snack-fastfood': 'resto-fastfood',
  'sante-medical': 'sante-medecin',
  'transport-marchandises': 'transport-routier',
  'beaute-coiffure': 'service-coiffeur',
  'services-personne': 'service-nettoyage',
  'finance-assurance': 'finance-assurance',
};

function getCategoryFromNaf(codeNaf: string): string | null {
  if (!codeNaf) return null;
  
  // Chercher la catégorie détaillée correspondante
  for (const cat of DETAILED_CATEGORIES) {
    for (const nafCode of cat.nafCodes) {
      if (codeNaf.startsWith(nafCode)) {
        return cat.key;
      }
    }
  }
  
  return null;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    let successCount = 0;
    let errorCount = 0;

    // 1. Harmoniser les nouveaux_sites basé sur code_naf
    console.log('Harmonizing nouveaux_sites...');
    const { data: nouveauxSites, error: nsError } = await supabase
      .from('nouveaux_sites')
      .select('id, code_naf')
      .not('code_naf', 'is', null);

    if (nsError) throw nsError;

    for (const site of nouveauxSites || []) {
      const category = getCategoryFromNaf(site.code_naf);
      if (category) {
        const { error } = await supabase
          .from('nouveaux_sites')
          .update({ categorie_entreprise: category })
          .eq('id', site.id);

        if (error) {
          console.error(`Error updating nouveaux_sites ${site.id}:`, error);
          errorCount++;
        } else {
          successCount++;
        }
      }
    }

    // 2. Harmoniser les entreprises basé sur categorie_qualifiee
    console.log('Harmonizing entreprises...');
    const { data: entreprises, error: entError } = await supabase
      .from('entreprises')
      .select('id, categorie_qualifiee')
      .not('categorie_qualifiee', 'is', null);

    if (entError) throw entError;

    for (const entreprise of entreprises || []) {
      const category = QUALIF_TO_DETAILED[entreprise.categorie_qualifiee];
      if (category) {
        const { error } = await supabase
          .from('entreprises')
          .update({ activite: category })
          .eq('id', entreprise.id);

        if (error) {
          console.error(`Error updating entreprises ${entreprise.id}:`, error);
          errorCount++;
        } else {
          successCount++;
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Harmonisation terminée: ${successCount} succès, ${errorCount} erreurs`,
        successCount,
        errorCount
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in harmonize-categories:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
