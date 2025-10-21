import { supabase } from "@/integrations/supabase/client";

export interface DemoEntreprise {
  nom: string;
  siret: string;
  adresse: string;
  code_postal: string;
  ville: string;
  activite: string;
  telephone: string;
  email: string;
  latitude: number;
  longitude: number;
  statut: string;
  chiffre_affaires: number;
  effectifs: number;
  score_lead: number;
}

const DEMO_ENTREPRISES: DemoEntreprise[] = [
  {
    nom: "Boulangerie des Délices",
    siret: "12345678900001",
    adresse: "15 Rue de la Paix",
    code_postal: "75002",
    ville: "Paris",
    activite: "Boulangerie",
    telephone: "01 42 00 00 01",
    email: "contact@delices.fr",
    latitude: 48.8698,
    longitude: 2.3318,
    statut: "actif",
    chiffre_affaires: 250000,
    effectifs: 5,
    score_lead: 85
  },
  {
    nom: "Restaurant Le Gourmet",
    siret: "12345678900002",
    adresse: "28 Avenue des Champs-Élysées",
    code_postal: "75008",
    ville: "Paris",
    activite: "Restauration",
    telephone: "01 42 00 00 02",
    email: "info@legourmet.fr",
    latitude: 48.8698,
    longitude: 2.3079,
    statut: "actif",
    chiffre_affaires: 800000,
    effectifs: 15,
    score_lead: 92
  },
  {
    nom: "Café des Arts",
    siret: "12345678900003",
    adresse: "5 Boulevard Saint-Germain",
    code_postal: "75005",
    ville: "Paris",
    activite: "Café",
    telephone: "01 42 00 00 03",
    email: "contact@cafedesarts.fr",
    latitude: 48.8519,
    longitude: 2.3466,
    statut: "actif",
    chiffre_affaires: 180000,
    effectifs: 4,
    score_lead: 70
  },
  {
    nom: "Coiffure Élégance",
    siret: "12345678900004",
    adresse: "42 Rue du Faubourg Saint-Honoré",
    code_postal: "75008",
    ville: "Paris",
    activite: "Coiffure",
    telephone: "01 42 00 00 04",
    email: "rdv@elegance-coiffure.fr",
    latitude: 48.8704,
    longitude: 2.3165,
    statut: "actif",
    chiffre_affaires: 120000,
    effectifs: 3,
    score_lead: 65
  },
  {
    nom: "Pharmacie Centrale",
    siret: "12345678900005",
    adresse: "10 Place de la République",
    code_postal: "75011",
    ville: "Paris",
    activite: "Pharmacie",
    telephone: "01 42 00 00 05",
    email: "contact@pharma-centrale.fr",
    latitude: 48.8679,
    longitude: 2.3637,
    statut: "actif",
    chiffre_affaires: 950000,
    effectifs: 8,
    score_lead: 88
  },
  {
    nom: "Garage Moderne",
    siret: "12345678900006",
    adresse: "75 Avenue de la Grande Armée",
    code_postal: "75116",
    ville: "Paris",
    activite: "Garage automobile",
    telephone: "01 42 00 00 06",
    email: "service@garage-moderne.fr",
    latitude: 48.8768,
    longitude: 2.2851,
    statut: "actif",
    chiffre_affaires: 450000,
    effectifs: 6,
    score_lead: 75
  },
  {
    nom: "Librairie du Marais",
    siret: "12345678900007",
    adresse: "22 Rue des Rosiers",
    code_postal: "75004",
    ville: "Paris",
    activite: "Librairie",
    telephone: "01 42 00 00 07",
    email: "contact@librairie-marais.fr",
    latitude: 48.8575,
    longitude: 2.3594,
    statut: "actif",
    chiffre_affaires: 200000,
    effectifs: 3,
    score_lead: 68
  },
  {
    nom: "Fleuriste Belle Époque",
    siret: "12345678900008",
    adresse: "8 Rue de Rivoli",
    code_postal: "75004",
    ville: "Paris",
    activite: "Fleuriste",
    telephone: "01 42 00 00 08",
    email: "commande@belle-epoque.fr",
    latitude: 48.8563,
    longitude: 2.3587,
    statut: "actif",
    chiffre_affaires: 150000,
    effectifs: 2,
    score_lead: 72
  },
  {
    nom: "Cabinet Dentaire Sourire",
    siret: "12345678900009",
    adresse: "33 Avenue Montaigne",
    code_postal: "75008",
    ville: "Paris",
    activite: "Cabinet dentaire",
    telephone: "01 42 00 00 09",
    email: "rdv@sourire-dentaire.fr",
    latitude: 48.8668,
    longitude: 2.3053,
    statut: "actif",
    chiffre_affaires: 380000,
    effectifs: 4,
    score_lead: 80
  },
  {
    nom: "Pressing Rapide",
    siret: "12345678900010",
    adresse: "18 Rue de Turenne",
    code_postal: "75003",
    ville: "Paris",
    activite: "Pressing",
    telephone: "01 42 00 00 10",
    email: "contact@pressing-rapide.fr",
    latitude: 48.8605,
    longitude: 2.3644,
    statut: "actif",
    chiffre_affaires: 90000,
    effectifs: 2,
    score_lead: 60
  }
];

export const generateDemoData = async (userId: string) => {
  try {
    // Check if demo data already loaded
    const { data: progress } = await supabase
      .from('user_onboarding_progress')
      .select('demo_data_loaded')
      .eq('user_id', userId)
      .single();

    if (progress?.demo_data_loaded) {
      console.log('Demo data already loaded');
      return { success: true, message: 'Demo data already loaded', entreprises: DEMO_ENTREPRISES };
    }

    // We don't insert into entreprises in demo mode to avoid RLS and UUID constraints.
    // Simply mark demo flag and return in-memory demo list for UI showcase.
    const { error: progressError } = await supabase
      .from('user_onboarding_progress')
      .upsert({
        user_id: userId,
        demo_data_loaded: true,
      });

    if (progressError) throw progressError;

    return { 
      success: true, 
      message: 'Mode démo activé',
      entreprises: DEMO_ENTREPRISES 
    };
  } catch (error) {
    console.error('Error generating demo data:', error);
    return { success: false, error };
  }
};

export const clearDemoData = async (userId: string) => {
  try {
    // Just flip the flag; demo data are in-memory only
    await supabase
      .from('user_onboarding_progress')
      .upsert({ user_id: userId, demo_data_loaded: false });

    return { success: true };
  } catch (error) {
    console.error('Error clearing demo data:', error);
    return { success: false, error };
  }
};

export const getDemoEntreprises = () => DEMO_ENTREPRISES;
