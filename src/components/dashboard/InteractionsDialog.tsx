import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Phone, MapPin, Calendar, StickyNote, Trash2, Navigation, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { openWaze } from "@/utils/navigation";

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
  type: 'appel' | 'visite' | 'rdv' | 'a_revoir' | null;
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

  const isRedundantNote = (notes: string, type: string) => {
    const lowerNotes = notes.toLowerCase().trim();
    const redundantPhrases = [
      'appel planifié',
      'visite planifiée',
      'rdv planifié',
      'rendez-vous planifié',
      'action planifiée',
      'à planifier',
      'prévu'
    ];
    return redundantPhrases.some(phrase => lowerNotes === phrase || lowerNotes.includes(phrase));
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
        variant: "destructive",
        duration: 3000,
      });
    } else {
      // Optimistic UI update
      setInteractions(prev => prev.filter(i => i.id !== id));

      toast({
        title: "✓ Supprimé",
        description: "L'interaction a été supprimée",
        duration: 2500,
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
        variant: "destructive",
        duration: 3000,
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
        duration: 2500,
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
      case 'a_revoir':
        return { icon: Clock, label: 'À revoir', color: 'text-orange-500', bg: 'bg-orange-500/10' };
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
            <div className="flex items-start justify-between gap-4 pr-8">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${typeInfo.bg} flex-shrink-0`}>
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
                  className="flex items-center gap-2 h-9 flex-shrink-0"
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
              <div className="space-y-4">
                {interactions.map((interaction) => (
                  <div
                    key={interaction.id}
                    className="group relative p-4 sm:p-5 rounded-xl border border-accent/20 bg-gradient-to-br from-card/80 to-card/40 hover:border-accent/40 transition-colors duration-300"
                  >
                    {/* Gradient overlay based on type */}
                    <div className={`absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity ${
                      type === 'appel' ? 'bg-gradient-to-br from-blue-500/5 to-transparent' :
                      type === 'visite' ? 'bg-gradient-to-br from-green-500/5 to-transparent' :
                      type === 'rdv' ? 'bg-gradient-to-br from-purple-500/5 to-transparent' :
                      'bg-gradient-to-br from-orange-500/5 to-transparent'
                    }`} />
                    
                    <div className="relative flex flex-col gap-4">
                      {/* Header: Company name and date */}
                      <div 
                        className="cursor-pointer"
                        onClick={() => {
                          onEntrepriseClick?.(interaction.entreprise_id);
                          onOpenChange(false);
                        }}
                      >
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="flex-1">
                            <h4 className="text-lg font-bold text-foreground group-hover:text-accent transition-colors line-clamp-1">
                              {interaction.entreprise_nom}
                            </h4>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/30 px-2.5 py-1 rounded-full">
                            <Calendar className="w-3 h-3" />
                            {format(new Date(interaction.created_at), 'dd MMM yyyy', { locale: fr })}
                          </div>
                        </div>
                        
                        {/* Notes - only show if not redundant */}
                        {interaction.notes && !isRedundantNote(interaction.notes, interaction.type) && (
                          <p className="text-sm text-muted-foreground bg-muted/20 px-3 py-2 rounded-lg mb-3 border border-muted/30">
                            {interaction.notes}
                          </p>
                        )}
                        
                        {/* Next action badge */}
                        {interaction.date_prochaine_action && (
                          <Badge variant="outline" className={`text-xs border-accent/50 bg-accent/10 ${
                            type === 'appel' ? 'text-blue-400' :
                            type === 'visite' ? 'text-green-400' :
                            'text-purple-400'
                          }`}>
                            <Clock className="w-3 h-3 mr-1" />
                            {format(new Date(interaction.date_prochaine_action), 'dd MMM à HH:mm', { locale: fr })}
                          </Badge>
                        )}
                      </div>
                      
                      {/* Action buttons */}
                      <div className="flex gap-2 pt-2 border-t border-accent/10">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={!interaction.telephone}
                          className={`flex-1 h-9 gap-2 ${
                            interaction.telephone 
                              ? 'border-blue-500/30 text-blue-400 hover:bg-blue-500/10 hover:border-blue-500 hover:text-blue-300' 
                              : 'opacity-40'
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (interaction.telephone) {
                              window.location.href = `tel:${interaction.telephone}`;
                            }
                          }}
                          title={interaction.telephone ? `Appeler ${interaction.telephone}` : "Téléphone non disponible"}
                        >
                          <Phone className="h-4 w-4" />
                          <span className="hidden sm:inline text-xs font-medium">
                            {interaction.telephone ? 'Appeler' : 'Non dispo'}
                          </span>
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={!interaction.latitude || !interaction.longitude}
                          className={`flex-1 h-9 gap-2 ${
                            interaction.latitude && interaction.longitude
                              ? 'border-green-500/30 text-green-400 hover:bg-green-500/10 hover:border-green-500 hover:text-green-300' 
                              : 'opacity-40'
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (interaction.latitude && interaction.longitude) {
                              openWaze(interaction.latitude, interaction.longitude);
                            }
                          }}
                          title={interaction.latitude && interaction.longitude ? "Ouvrir dans Waze" : "Adresse non disponible"}
                        >
                          <Navigation className="h-4 w-4" />
                          <span className="hidden sm:inline text-xs font-medium">
                            {interaction.latitude && interaction.longitude ? 'Itinéraire' : 'Non dispo'}
                          </span>
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-9 w-9 border-destructive/30 text-destructive hover:bg-destructive/10 hover:border-destructive hover:text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(interaction.id);
                          }}
                          title="Supprimer"
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
