import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Hook pour calculer automatiquement le score d'un lead
 * 
 * UTILITÉ: Évalue le potentiel d'un lead (0-100) basé sur:
 * - Fréquence des interactions (+ 20 points si > 3 interactions)
 * - Récence du dernier contact (- 10 points par semaine d'inactivité)
 * - Type d'interactions (RDV = +15, visite = +10, appel = +5)
 * - Statut du lead (+20 si qualifié, +40 si proposition, +60 si négociation)
 * - Réactivité (+ 15 si dernier contact < 7 jours)
 * 
 * EXEMPLE:
 * - Lead chaud (80-100): Contact récent, plusieurs RDV, en négociation
 * - Lead tiède (50-79): Quelques interactions, en qualification
 * - Lead froid (0-49): Pas de contact récent, nouveau ou perdu
 */
export const useLeadScoring = (entrepriseId: string, userId: string) => {
  const [score, setScore] = useState<number | null>(null);
  const [temperature, setTemperature] = useState<'cold' | 'warm' | 'hot'>('cold');

  useEffect(() => {
    if (!entrepriseId || !userId) return;

    const calculateScore = async () => {
      try {
        // Récupérer les interactions
        const { data: interactions } = await supabase
          .from('lead_interactions')
          .select('type, created_at')
          .eq('entreprise_id', entrepriseId)
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        // Récupérer le statut actuel
        const { data: status } = await supabase
          .from('lead_statuts')
          .select('statut_actuel, etape_pipeline')
          .eq('entreprise_id', entrepriseId)
          .eq('user_id', userId)
          .single();

        let calculatedScore = 30; // Score de base

        if (interactions && interactions.length > 0) {
          // Points pour fréquence des interactions
          if (interactions.length > 3) calculatedScore += 20;
          else if (interactions.length > 1) calculatedScore += 10;

          // Points pour le type d'interactions
          const interactionPoints = interactions.reduce((sum, interaction) => {
            switch (interaction.type) {
              case 'rdv': return sum + 15;
              case 'visite': return sum + 10;
              case 'appel': return sum + 5;
              case 'email': return sum + 3;
              default: return sum;
            }
          }, 0);
          calculatedScore += Math.min(interactionPoints, 30); // Max 30 points

          // Points pour récence
          const lastInteraction = new Date(interactions[0].created_at);
          const daysSinceLastContact = Math.floor(
            (Date.now() - lastInteraction.getTime()) / (1000 * 60 * 60 * 24)
          );

          if (daysSinceLastContact <= 7) {
            calculatedScore += 15; // Contact très récent
          } else if (daysSinceLastContact <= 14) {
            calculatedScore += 10;
          } else if (daysSinceLastContact <= 30) {
            calculatedScore += 5;
          } else {
            // Pénalité pour inactivité
            const weeksSinceContact = Math.floor(daysSinceLastContact / 7);
            calculatedScore -= Math.min(weeksSinceContact * 10, 30);
          }
        }

        // Points pour le statut
        if (status) {
          switch (status.statut_actuel) {
            case 'gagne':
              calculatedScore = 100; // Automatiquement 100
              break;
            case 'negociation':
              calculatedScore += 20;
              break;
            case 'proposition':
              calculatedScore += 15;
              break;
            case 'qualifie':
              calculatedScore += 10;
              break;
            case 'perdu':
              calculatedScore = 0; // Automatiquement 0
              break;
          }
        }

        // Limiter entre 0 et 100
        calculatedScore = Math.max(0, Math.min(100, calculatedScore));

        // Déterminer la température
        let temp: 'cold' | 'warm' | 'hot' = 'cold';
        if (calculatedScore >= 80) temp = 'hot';
        else if (calculatedScore >= 50) temp = 'warm';

        setScore(calculatedScore);
        setTemperature(temp);

        // Mettre à jour le score dans la base de données
        await supabase
          .from('entreprises')
          .update({ score_lead: calculatedScore })
          .eq('id', entrepriseId);

      } catch (error) {
        console.error('Error calculating lead score:', error);
      }
    };

    calculateScore();
  }, [entrepriseId, userId]);

  return { score, temperature };
};
