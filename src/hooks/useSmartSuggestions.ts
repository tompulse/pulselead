import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Suggestion {
  type: 'appel' | 'visite' | 'rdv' | 'note';
  message: string;
  priority: 'high' | 'medium' | 'low';
  reason: string;
}

export const useSmartSuggestions = (entrepriseId: string, userId: string) => {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!entrepriseId || !userId) return;

      // Get last interaction
      const { data: interactions } = await supabase
        .from('lead_interactions')
        .select('*')
        .eq('entreprise_id', entrepriseId)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1);

      // Get lead status
      const { data: leadStatus } = await supabase
        .from('lead_statuts')
        .select('*')
        .eq('entreprise_id', entrepriseId)
        .eq('user_id', userId)
        .maybeSingle();

      const newSuggestions: Suggestion[] = [];

      if (!interactions || interactions.length === 0) {
        // No interactions yet - suggest first contact
        newSuggestions.push({
          type: 'appel',
          message: 'Premier contact recommandé',
          priority: 'high',
          reason: 'Aucune interaction enregistrée avec cette entreprise'
        });
      } else {
        const lastInteraction = interactions[0];
        const daysSinceLastContact = Math.floor(
          (Date.now() - new Date(lastInteraction.created_at).getTime()) / (1000 * 60 * 60 * 24)
        );

        // Suggest follow-up based on last interaction type
        if (lastInteraction.type === 'appel' && daysSinceLastContact >= 3) {
          newSuggestions.push({
            type: 'visite',
            message: 'Planifier une visite sur site',
            priority: 'medium',
            reason: `Dernier appel il y a ${daysSinceLastContact} jours`
          });
        }

        if (lastInteraction.type === 'visite' && daysSinceLastContact >= 2) {
          newSuggestions.push({
            type: 'rdv',
            message: 'Proposer un rendez-vous de présentation',
            priority: 'high',
            reason: 'Suite à la visite récente'
          });
        }

        // Check for pending next action
        if (lastInteraction.date_prochaine_action) {
          const nextActionDate = new Date(lastInteraction.date_prochaine_action);
          const daysUntilAction = Math.floor(
            (nextActionDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
          );

          if (daysUntilAction <= 0) {
            newSuggestions.push({
              type: 'note',
              message: lastInteraction.prochaine_action || 'Action en attente',
              priority: 'high',
              reason: 'Action planifiée à faire maintenant'
            });
          } else if (daysUntilAction <= 2) {
            newSuggestions.push({
              type: 'note',
              message: lastInteraction.prochaine_action || 'Action à venir',
              priority: 'medium',
              reason: `Prévue dans ${daysUntilAction} jour(s)`
            });
          }
        }

        // Status-based suggestions
        if (leadStatus?.statut_actuel === 'contacte' && daysSinceLastContact >= 5) {
          newSuggestions.push({
            type: 'appel',
            message: 'Relancer pour qualification',
            priority: 'medium',
            reason: 'Lead contacté il y a plus de 5 jours'
          });
        }

        if (leadStatus?.statut_actuel === 'qualifie' && daysSinceLastContact >= 7) {
          newSuggestions.push({
            type: 'rdv',
            message: 'Proposer une démo/présentation',
            priority: 'high',
            reason: 'Lead qualifié sans proposition depuis 7 jours'
          });
        }

        if (leadStatus?.statut_actuel === 'proposition' && daysSinceLastContact >= 10) {
          newSuggestions.push({
            type: 'appel',
            message: 'Relancer sur la proposition',
            priority: 'high',
            reason: 'Proposition envoyée il y a plus de 10 jours'
          });
        }
      }

      // Sort by priority
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      newSuggestions.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

      setSuggestions(newSuggestions);
      setLoading(false);
    };

    fetchSuggestions();
  }, [entrepriseId, userId]);

  return { suggestions, loading };
};
