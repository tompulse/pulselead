import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MapPin, Calendar, RotateCcw, Building2, Phone, ChevronRight } from 'lucide-react';
import { format, isToday, isYesterday } from 'date-fns';
import { fr } from 'date-fns/locale';
import { CRMProspectFicheDialog } from './CRMProspectFicheDialog';

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
    badgeColor: 'bg-accent/20 text-accent',
  },
  rdv: {
    title: 'Rendez-vous',
    icon: Calendar,
    color: 'text-green-400',
    bgColor: 'bg-green-500/20',
    badgeColor: 'bg-green-500/20 text-green-400',
  },
  a_revoir: {
    title: 'À revoir',
    icon: RotateCcw,
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/20',
    badgeColor: 'bg-orange-500/20 text-orange-400',
  },
  a_rappeler: {
    title: 'À rappeler',
    icon: Phone,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/20',
    badgeColor: 'bg-blue-500/20 text-blue-400',
  },
};

const formatDate = (dateStr: string, withTime = false) => {
  const date = new Date(dateStr);
  if (isToday(date)) return withTime ? `Aujourd'hui ${format(date, 'HH:mm')}` : "Aujourd'hui";
  if (isYesterday(date)) return withTime ? `Hier ${format(date, 'HH:mm')}` : 'Hier';
  return format(date, withTime ? 'd MMM HH:mm' : 'd MMM', { locale: fr });
};

export const ActivityDetailSheet = ({
  isOpen,
  onClose,
  activityType,
  userId,
  onEntrepriseSelect,
}: ActivityDetailSheetProps) => {
  const queryClient = useQueryClient();
  const config = activityType ? ACTIVITY_CONFIG[activityType] : null;
  const Icon = config?.icon || Building2;

  const [ficheInteractionId, setFicheInteractionId] = useState<string | null>(null);
  const [ficheEntrepriseId, setFicheEntrepriseId] = useState<string | null>(null);

  const { data: interactions = [], isLoading } = useQuery({
    queryKey: ['activity-interactions', userId, activityType],
    queryFn: async () => {
      if (!activityType) return [];

      let query = supabase
        .from('lead_interactions')
        .select('*')
        .eq('user_id', userId)
        .order('date_relance', { ascending: true, nullsFirst: false });

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

      const entrepriseIds = [...new Set(interactionsData.map((i) => i.entreprise_id))];
      const { data: sites } = await supabase
        .from('nouveaux_sites')
        .select('id, nom, commune, siret')
        .in('id', entrepriseIds);

      return interactionsData.map((interaction) => ({
        ...interaction,
        site: sites?.find((s) => s.id === interaction.entreprise_id),
      }));
    },
    enabled: isOpen && !!activityType,
  });

  const openFiche = (interactionId: string, entrepriseId: string) => {
    setFicheInteractionId(interactionId);
    setFicheEntrepriseId(entrepriseId);
  };

  const closeFiche = () => {
    setFicheInteractionId(null);
    setFicheEntrepriseId(null);
  };

  const handleFicheUpdate = () => {
    queryClient.invalidateQueries({ queryKey: ['activity-interactions', userId, activityType] });
    queryClient.invalidateQueries({ queryKey: ['crm-interactions', userId] });
  };

  return (
    <>
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
                  {' · '}
                  <span className="text-xs">Cliquez sur une carte pour éditer</span>
                </p>
              </div>
            </SheetTitle>
          </SheetHeader>

          <ScrollArea className="h-[calc(100vh-120px)]">
            <div className="p-4 space-y-2">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin w-6 h-6 border-2 border-accent border-t-transparent rounded-full" />
                </div>
              ) : interactions.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Building2 className="w-10 h-10 mx-auto mb-3 opacity-50" />
                  <p className="font-medium">Aucune interaction</p>
                  <p className="text-sm mt-1">
                    Les {config?.title?.toLowerCase()} apparaîtront ici
                  </p>
                </div>
              ) : (
                interactions.map((interaction) => {
                  const hasDate = !!interaction.date_relance;
                  const isProspectionImprevue = interaction.notes?.startsWith('📋 Prospection imprévue');

                  return (
                    <button
                      key={interaction.id}
                      type="button"
                      onClick={() => openFiche(interaction.id, interaction.entreprise_id)}
                      className="w-full text-left p-4 rounded-lg bg-card border border-border/50 hover:border-accent/50 hover:bg-card/80 transition-all group"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          {/* Nom + badge imprévue */}
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-medium truncate">
                              {interaction.site?.nom || 'Entreprise inconnue'}
                            </p>
                            {isProspectionImprevue && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-accent/20 text-accent font-medium shrink-0">
                                Imprévue
                              </span>
                            )}
                          </div>

                          {/* Commune */}
                          {interaction.site?.commune && (
                            <p className="text-xs text-muted-foreground truncate mt-0.5">
                              {interaction.site.commune}
                            </p>
                          )}

                          {/* Date prévue */}
                          {hasDate && (
                            <div
                              className={`inline-flex items-center gap-1.5 mt-2 px-2 py-1 rounded text-xs font-medium ${config?.badgeColor}`}
                            >
                              <Calendar className="w-3 h-3" />
                              {formatDate(interaction.date_relance!, true)}
                            </div>
                          )}

                          {/* Notes (preview) */}
                          {interaction.notes && (
                            <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2 whitespace-pre-line">
                              {interaction.notes}
                            </p>
                          )}

                          {/* Date création */}
                          <p className="text-[10px] text-muted-foreground/60 mt-1">
                            Créé {formatDate(interaction.created_at || interaction.date_interaction)}
                          </p>
                        </div>

                        {/* Chevron */}
                        <ChevronRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-accent transition-colors shrink-0 mt-1" />
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>

      {/* Fiche éditable */}
      <CRMProspectFicheDialog
        isOpen={!!ficheInteractionId}
        onClose={closeFiche}
        interactionId={ficheInteractionId}
        entrepriseId={ficheEntrepriseId}
        userId={userId}
        onUpdate={handleFicheUpdate}
      />
    </>
  );
};
