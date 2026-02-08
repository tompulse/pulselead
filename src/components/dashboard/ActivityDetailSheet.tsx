import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { MapPin, Calendar, RotateCcw, Eye, Trash2, Building2, Phone } from 'lucide-react';
import { format, isToday, isYesterday } from 'date-fns';
import { fr } from 'date-fns/locale';

interface ActivityDetailSheetProps {
  isOpen: boolean;
  onClose: () => void;
  activityType: 'visite' | 'rdv' | 'a_revoir' | 'a_rappeler' | null;
  userId: string;
  onEntrepriseSelect?: (id: string) => void;
}

const ACTIVITY_CONFIG = {
  visite: {
    title: 'Visites',
    icon: MapPin,
    color: 'text-accent',
    bgColor: 'bg-accent/20',
  },
  rdv: {
    title: 'Rendez-vous',
    icon: Calendar,
    color: 'text-green-400',
    bgColor: 'bg-green-500/20',
  },
  a_revoir: {
    title: 'À revoir',
    icon: RotateCcw,
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/20',
  },
  a_rappeler: {
    title: 'A rappeler',
    icon: Phone,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/20',
  },
};

const formatInteractionDate = (dateStr: string, includeTime = false) => {
  const date = new Date(dateStr);
  if (isToday(date)) {
    return includeTime ? `Aujourd'hui à ${format(date, 'HH:mm')}` : "Aujourd'hui";
  }
  if (isYesterday(date)) {
    return includeTime ? `Hier à ${format(date, 'HH:mm')}` : "Hier";
  }
  if (includeTime) {
    return format(date, 'd MMM à HH:mm', { locale: fr });
  }
  return format(date, 'd MMM', { locale: fr });
};

export const ActivityDetailSheet = ({
  isOpen,
  onClose,
  activityType,
  userId,
  onEntrepriseSelect,
}: ActivityDetailSheetProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const config = activityType ? ACTIVITY_CONFIG[activityType] : null;
  const Icon = config?.icon || MapPin;

  // Fetch interactions with company names
  const { data: interactions = [], isLoading } = useQuery({
    queryKey: ['activity-interactions', userId, activityType],
    queryFn: async () => {
      if (!activityType) return [];

      // Fetch interactions
      let query = supabase
        .from('lead_interactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (activityType === 'a_revoir') {
        query = query.eq('type', 'a_revoir');
      } else if (activityType === 'a_rappeler') {
        query = query.eq('type', 'appel').eq('statut', 'a_rappeler');
      } else {
        query = query.eq('type', activityType);
      }

      const { data: interactionsData, error } = await query;
      if (error) throw error;
      if (!interactionsData || interactionsData.length === 0) return [];

      // Get company names
      const entrepriseIds = [...new Set(interactionsData.map(i => i.entreprise_id))];
      const { data: sites } = await supabase
        .from('nouveaux_sites')
        .select('id, nom, ville')
        .in('id', entrepriseIds);

      // Merge data
      return interactionsData.map(interaction => ({
        ...interaction,
        site: sites?.find(s => s.id === interaction.entreprise_id),
      }));
    },
    enabled: isOpen && !!activityType,
  });

  const handleDelete = async (interactionId: string, entrepriseId: string, interactionType: string) => {
    setDeletingId(interactionId);
    try {
      // 1. Supprimer l'interaction
      const { error } = await supabase
        .from('lead_interactions')
        .delete()
        .eq('id', interactionId);

      if (error) throw error;

      // 2. ✅ Mettre à jour les tournées qui contiennent cette entreprise
      const { data: tournees } = await supabase
        .from('tournees')
        .select('id, visites_effectuees, entreprises_ids')
        .contains('entreprises_ids', [entrepriseId]);

      if (tournees && tournees.length > 0) {
        const typeToFieldMap: Record<string, string> = {
          visite: 'visite',
          rdv: 'rdv',
          a_revoir: 'aRevoir',
          appel: 'aRappeler', // type='appel' avec statut='a_rappeler' → aRappeler
        };

        const fieldToUpdate = typeToFieldMap[interactionType];

        for (const tournee of tournees) {
          if (tournee.visites_effectuees && typeof tournee.visites_effectuees === 'object') {
            const visites = tournee.visites_effectuees as Record<string, any>;
            if (visites[entrepriseId]?.[fieldToUpdate]) {
              // Décocher le statut dans la tournée
              const updatedVisites = {
                ...visites,
                [entrepriseId]: {
                  ...visites[entrepriseId],
                  [fieldToUpdate]: false,
                },
              };

              await supabase
                .from('tournees')
                .update({ visites_effectuees: updatedVisites })
                .eq('id', tournee.id);

              console.log('[ActivityDetailSheet] Tournée mise à jour:', tournee.id);
            }
          }
        }
      }

      toast({
        title: 'Interaction supprimée',
        description: "L'interaction a été retirée du CRM et des tournées",
      });

      // Refresh data - invalidate all related queries for bidirectional sync
      queryClient.invalidateQueries({ queryKey: ['activity-interactions', userId, activityType] });
      queryClient.invalidateQueries({ queryKey: ['crm-interactions', userId] });
      queryClient.invalidateQueries({ queryKey: ['notification-reminders', userId] });
      queryClient.invalidateQueries({ queryKey: ['tournee'] }); // ✅ Invalider les tournées
    } catch {
      toast({
        title: 'Erreur',
        description: "Impossible de supprimer l'interaction",
        variant: 'destructive',
      });
    } finally {
      setDeletingId(null);
    }
  };

  const handleViewEntreprise = (entrepriseId: string) => {
    onEntrepriseSelect?.(entrepriseId);
    onClose();
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-md p-0">
        <SheetHeader className="p-6 pb-4 border-b border-border/50">
          <SheetTitle className="flex items-center gap-3">
            {config && (
              <div className={`w-10 h-10 rounded-full ${config.bgColor} flex items-center justify-center`}>
                <Icon className={`w-5 h-5 ${config.color}`} />
              </div>
            )}
            <div>
              <span className="text-lg">{config?.title || 'Activités'}</span>
              <p className="text-sm text-muted-foreground font-normal">
                {interactions.length} interaction{interactions.length !== 1 ? 's' : ''}
              </p>
            </div>
          </SheetTitle>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-120px)]">
          <div className="p-4 space-y-3">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin w-6 h-6 border-2 border-accent border-t-transparent rounded-full" />
              </div>
            ) : interactions.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Building2 className="w-10 h-10 mx-auto mb-3 opacity-50" />
                <p className="font-medium">Aucune interaction</p>
                <p className="text-sm mt-1">Les {config?.title?.toLowerCase()} apparaîtront ici</p>
              </div>
            ) : (
              interactions.map((interaction) => {
                const isRdv = interaction.type === 'rdv';
                const isARevoir = interaction.type === 'a_revoir';
                const isARappeler = interaction.type === 'appel' && interaction.statut === 'a_rappeler';
                const hasScheduledDate = interaction.date_relance;
                
                return (
                <div
                  key={interaction.id}
                  className="p-4 rounded-lg bg-card border border-border/50 hover:border-accent/30 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">
                        {interaction.site?.nom || 'Entreprise inconnue'}
                      </p>
                      <p className="text-sm text-muted-foreground truncate">
                        {interaction.site?.ville || '—'}
                      </p>
                      
                      {/* Show scheduled date for RDV, À revoir, À rappeler */}
                      {hasScheduledDate && (
                        <div className={`flex items-center gap-1.5 mt-2 px-2 py-1 rounded w-fit ${
                          isRdv ? 'bg-green-500/10 border border-green-500/20' :
                          isARevoir ? 'bg-orange-500/10 border border-orange-500/20' :
                          'bg-blue-500/10 border border-blue-500/20'
                        }`}>
                          <Calendar className={`w-3.5 h-3.5 ${
                            isRdv ? 'text-green-400' :
                            isARevoir ? 'text-orange-400' :
                            'text-blue-400'
                          }`} />
                          <span className={`text-xs font-medium ${
                            isRdv ? 'text-green-400' :
                            isARevoir ? 'text-orange-400' :
                            'text-blue-400'
                          }`}>
                            {formatInteractionDate(interaction.date_relance!, isRdv)}
                          </span>
                        </div>
                      )}
                      
                      <p className="text-xs text-muted-foreground mt-1">
                        {hasScheduledDate ? 'Créé ' : ''}{formatInteractionDate(interaction.created_at || interaction.date_interaction)}
                      </p>
                      
                      {interaction.notes && (
                        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                          {interaction.notes}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-accent hover:text-accent hover:bg-accent/10"
                        onClick={() => handleViewEntreprise(interaction.entreprise_id)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleDelete(interaction.id, interaction.entreprise_id, interaction.type)}
                        disabled={deletingId === interaction.id}
                      >
                        {deletingId === interaction.id ? (
                          <div className="animate-spin w-4 h-4 border-2 border-destructive border-t-transparent rounded-full" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              )})
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};
