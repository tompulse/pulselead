import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Phone, MapPin, Calendar, StickyNote, Trash2, Navigation } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

interface Interaction {
  id: string;
  entreprise_id: string;
  type: string;
  notes: string;
  created_at: string;
  date_prochaine_action?: string;
  prochaine_action?: string;
  entreprise_nom: string;
  telephone?: string;
  latitude?: number;
  longitude?: number;
}

interface InteractionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: 'appel' | 'visite' | 'rdv' | null;
  userId: string;
  onEntrepriseClick?: (entrepriseId: string) => void;
  onInteractionDeleted?: (entrepriseId: string, type: string) => void;
}

export const InteractionsDialog = ({ 
  open, 
  onOpenChange, 
  type, 
  userId,
  onEntrepriseClick,
  onInteractionDeleted
}: InteractionsDialogProps) => {
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (open && type && userId) {
      fetchInteractions();
    }
  }, [open, type, userId]);

  const fetchInteractions = async () => {
    if (!type) return;
    
    setLoading(true);
    const { data, error } = await supabase
      .from('lead_interactions')
      .select(`
        id,
        entreprise_id,
        type,
        notes,
        created_at,
        date_prochaine_action,
        prochaine_action,
        entreprises (
          nom,
          telephone,
          latitude,
          longitude
        )
      `)
      .eq('user_id', userId)
      .eq('type', type)
      .order('created_at', { ascending: false });

    if (!error && data) {
      const formattedData = data
        .filter(item => item.entreprises)
        .map(item => ({
          id: item.id,
          entreprise_id: item.entreprise_id,
          type: item.type,
          notes: item.notes || '',
          created_at: item.created_at,
          date_prochaine_action: item.date_prochaine_action || undefined,
          prochaine_action: item.prochaine_action || undefined,
          entreprise_nom: (item.entreprises as any)?.nom || 'Entreprise',
          telephone: (item.entreprises as any)?.telephone,
          latitude: (item.entreprises as any)?.latitude,
          longitude: (item.entreprises as any)?.longitude,
        }));
      setInteractions(formattedData);
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    // Find the interaction to get entreprise_id and type before deleting
    const interaction = interactions.find(i => i.id === id);
    
    const { error } = await supabase
      .from('lead_interactions')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'interaction",
        variant: "destructive"
      });
    } else {
      // Optimistic UI update
      setInteractions(prev => prev.filter(i => i.id !== id));

      toast({
        title: "✓ Supprimé",
        description: "L'interaction a été supprimée",
      });
      
      // Notify parent component about the deletion
      if (interaction && onInteractionDeleted) {
        onInteractionDeleted(interaction.entreprise_id, interaction.type);
      }
    }
  };

  const handleDeleteAll = async () => {
    if (!type || interactions.length === 0) return;

    const interactionIds = interactions.map(i => i.id);
    const { error } = await supabase
      .from('lead_interactions')
      .delete()
      .in('id', interactionIds);

    if (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer les interactions",
        variant: "destructive"
      });
    } else {
      // Notify parent component about each deletion
      if (onInteractionDeleted) {
        interactions.forEach(interaction => {
          onInteractionDeleted(interaction.entreprise_id, interaction.type);
        });
      }

      setInteractions([]);
      
      toast({
        title: "✓ Tout supprimé",
        description: `${interactionIds.length} interaction${interactionIds.length > 1 ? 's supprimées' : ' supprimée'}`,
      });
    }
  };

  const getTypeInfo = (type: string) => {
    switch (type) {
      case 'appel':
        return { icon: Phone, label: 'Appels', color: 'text-blue-500', bg: 'bg-blue-500/10' };
      case 'visite':
        return { icon: MapPin, label: 'Visites', color: 'text-green-500', bg: 'bg-green-500/10' };
      case 'rdv':
        return { icon: Calendar, label: 'Rendez-vous', color: 'text-purple-500', bg: 'bg-purple-500/10' };
      default:
        return { icon: StickyNote, label: 'Notes', color: 'text-accent', bg: 'bg-accent/10' };
    }
  };

  if (!type) return null;

  const typeInfo = getTypeInfo(type);
  const Icon = typeInfo.icon;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[85vh] sm:max-w-[90vw]">
          <DialogHeader>
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-lg ${typeInfo.bg}`}>
                  <Icon className={`h-5 w-5 ${typeInfo.color}`} />
                </div>
                <div>
                  <DialogTitle>{typeInfo.label}</DialogTitle>
                  <div className="text-sm text-muted-foreground font-normal">
                    {interactions.length} {interactions.length > 1 ? 'enregistrements' : 'enregistrement'}
                  </div>
                </div>
              </div>
              
              {interactions.length > 0 && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDeleteAll}
                  className="flex items-center gap-2 h-9"
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="hidden sm:inline">Tout supprimer</span>
                </Button>
              )}
            </div>
          </DialogHeader>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin w-8 h-8 border-2 border-accent border-t-transparent rounded-full" />
            </div>
          ) : interactions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Icon className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>Aucun {typeInfo.label.toLowerCase()} enregistré</p>
            </div>
          ) : (
            <ScrollArea className="h-[50vh] sm:h-[500px] pr-4">
              <div className="space-y-3">
                {interactions.map((interaction) => (
                  <div
                    key={interaction.id}
                    className="p-3 sm:p-4 rounded-lg border border-accent/20 bg-card/50 hover:bg-accent/5 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row items-start justify-between gap-3">
                      <div 
                        className="flex-1 min-w-0 cursor-pointer w-full"
                        onClick={() => {
                          onEntrepriseClick?.(interaction.entreprise_id);
                          onOpenChange(false);
                        }}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-2">
                          <p className="font-semibold text-foreground/90 text-sm sm:text-base">
                            {interaction.entreprise_nom}
                          </p>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(interaction.created_at), 'dd MMM yyyy', { locale: fr })}
                          </span>
                        </div>
                        
                        {interaction.notes && (
                          <p className="text-xs sm:text-sm text-muted-foreground mb-2">
                            {interaction.notes}
                          </p>
                        )}
                        
                        {interaction.date_prochaine_action && (
                          <Badge variant="outline" className="text-xs">
                            Prochaine action: {format(new Date(interaction.date_prochaine_action), 'dd MMM à HH:mm', { locale: fr })}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex gap-2 w-full sm:w-auto justify-end">
                        {/* Always show action buttons, disabled if no data */}
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={!interaction.telephone}
                          className="h-8 border-blue-500/30 hover:bg-blue-500/10 hover:border-blue-500 disabled:opacity-50"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (interaction.telephone) {
                              window.location.href = `tel:${interaction.telephone}`;
                            }
                          }}
                          title={interaction.telephone ? `Appeler ${interaction.telephone}` : "Téléphone non disponible"}
                        >
                          <Phone className="h-3.5 w-3.5" />
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={!interaction.latitude || !interaction.longitude}
                          className="h-8 border-green-500/30 hover:bg-green-500/10 hover:border-green-500 disabled:opacity-50"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (interaction.latitude && interaction.longitude) {
                              window.open(`https://waze.com/ul?ll=${interaction.latitude},${interaction.longitude}&navigate=yes`, '_blank');
                            }
                          }}
                          title={interaction.latitude && interaction.longitude ? "Ouvrir dans Waze" : "Adresse non disponible"}
                        >
                          <Navigation className="h-3.5 w-3.5" />
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(interaction.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>

    </>
  );
};
