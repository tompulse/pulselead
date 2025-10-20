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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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
}

export const InteractionsDialog = ({ 
  open, 
  onOpenChange, 
  type, 
  userId,
  onEntrepriseClick 
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
      toast({
        title: "✓ Supprimé",
        description: "L'interaction a été supprimée",
      });
      fetchInteractions();
    }
    setDeleteId(null);
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
        <DialogContent className="max-w-2xl max-h-[85vh]">
          <DialogHeader>
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
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-3">
                {interactions.map((interaction) => (
                  <div
                    key={interaction.id}
                    className="p-4 rounded-lg border border-accent/20 bg-card/50 hover:bg-accent/5 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div 
                        className="flex-1 min-w-0 cursor-pointer"
                        onClick={() => {
                          onEntrepriseClick?.(interaction.entreprise_id);
                          onOpenChange(false);
                        }}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <p className="font-semibold text-foreground/90">
                            {interaction.entreprise_nom}
                          </p>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(interaction.created_at), 'dd MMM yyyy', { locale: fr })}
                          </span>
                        </div>
                        
                        {interaction.notes && (
                          <p className="text-sm text-muted-foreground mb-2">
                            {interaction.notes}
                          </p>
                        )}
                        
                        {interaction.date_prochaine_action && (
                          <Badge variant="outline" className="text-xs">
                            Prochaine action: {format(new Date(interaction.date_prochaine_action), 'dd MMM à HH:mm', { locale: fr })}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex gap-2">
                        {/* Always show action buttons if data exists */}
                        {interaction.telephone && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 border-blue-500/30 hover:bg-blue-500/10 hover:border-blue-500"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.location.href = `tel:${interaction.telephone}`;
                            }}
                          >
                            <Phone className="h-3.5 w-3.5" />
                          </Button>
                        )}
                        
                        {interaction.latitude && interaction.longitude && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 border-green-500/30 hover:bg-green-500/10 hover:border-green-500"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(`https://waze.com/ul?ll=${interaction.latitude},${interaction.longitude}&navigate=yes`, '_blank');
                            }}
                          >
                            <Navigation className="h-3.5 w-3.5" />
                          </Button>
                        )}
                        
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteId(interaction.id);
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

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cette interaction ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. L'interaction sera définitivement supprimée.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && handleDelete(deleteId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
