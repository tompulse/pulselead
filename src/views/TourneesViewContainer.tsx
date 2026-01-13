import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  MapPin, 
  Navigation, 
  Clock, 
  Map,
  Trash2,
  Route as RouteIcon,
  Plus
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Tournee {
  id: string;
  nom: string;
  date_planifiee: string;
  entreprises_ids: string[];
  ordre_optimise: string[];
  distance_totale_km: number | null;
  temps_estime_minutes: number | null;
  statut: string;
}

export const TourneesViewContainer = ({ userId }: { userId: string }) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Fetch user's tournees
  const { data: tournees = [], isLoading } = useQuery({
    queryKey: ['tournees', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tournees')
        .select('*')
        .eq('user_id', userId)
        .order('date_planifiee', { ascending: true });
      
      if (error) throw error;
      return data as Tournee[];
    },
  });

  // Delete tournee mutation
  const deleteMutation = useMutation({
    mutationFn: async (tourneeId: string) => {
      const { error } = await supabase
        .from('tournees')
        .delete()
        .eq('id', tourneeId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tournees', userId] });
      toast.success('Tournée supprimée');
    },
    onError: () => {
      toast.error('Erreur lors de la suppression');
    },
  });

  const formatDuration = (minutes: number | null) => {
    if (!minutes) return '0h00';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h${mins.toString().padStart(2, '0')}`;
  };

  const getStatusBadge = (statut: string) => {
    switch (statut) {
      case 'planifiee':
        return <Badge variant="outline" className="border-accent/50 text-accent">Planifiée</Badge>;
      case 'en_cours':
        return <Badge className="bg-orange-500/20 text-orange-500 border border-orange-500/30">En cours</Badge>;
      case 'terminee':
        return <Badge className="bg-green-500/20 text-green-500 border border-green-500/30">Terminée</Badge>;
      default:
        return <Badge variant="outline">{statut}</Badge>;
    }
  };

  const handleCreateTournee = () => {
    // Rediriger vers la vue Prospects pour sélectionner des entreprises
    navigate('/dashboard');
    // Le passage à la vue prospects sera géré par le composant parent
    toast.info('Sélectionnez des prospects sur la carte pour créer une tournée', {
      description: 'Cliquez sur les prospects à ajouter à votre tournée',
      duration: 5000,
    });
  };

  const handleViewDetails = (tournee: Tournee) => {
    navigate(`/dashboard/tournee/${tournee.id}`);
  };


  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  return (
    <div className="h-full flex flex-col overflow-hidden p-4 space-y-5">
      {/* Create Button */}
      <Button 
        onClick={handleCreateTournee}
        className="w-full h-14 bg-gradient-to-r from-accent to-cyan-glow hover:from-accent/90 hover:to-cyan-glow/90 text-primary font-bold text-base rounded-2xl shadow-lg shadow-accent/30 transition-all duration-300 hover:shadow-xl hover:shadow-accent/40 hover:scale-[1.02]"
        aria-label="Créer une nouvelle tournée"
      >
        <Plus className="w-5 h-5 mr-2" aria-hidden="true" />
        Créer une nouvelle tournée
      </Button>

      {/* Header */}
      <div className="flex items-center gap-4 p-5 rounded-2xl bg-gradient-to-r from-card/80 to-card/40 border border-accent/20 backdrop-blur">
        <div className="p-3 rounded-xl bg-accent/15 border border-accent/30">
          <Calendar className="w-6 h-6 text-accent" aria-hidden="true" />
        </div>
        <div>
          <h3 className="font-bold text-lg text-accent">Mes tournées planifiées</h3>
          <p className="text-sm text-muted-foreground">
            {tournees.length} tournée{tournees.length > 1 ? 's' : ''} enregistrée{tournees.length > 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Tournees list */}
      <div className="flex-1 overflow-auto space-y-4 hide-scrollbar">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-accent border-t-transparent rounded-full" />
          </div>
        ) : tournees.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <div className="w-20 h-20 mx-auto mb-5 rounded-2xl bg-accent/10 flex items-center justify-center">
              <RouteIcon className="w-10 h-10 text-accent/50" aria-hidden="true" />
            </div>
            <p className="font-semibold text-lg">Aucune tournée planifiée</p>
            <p className="text-sm mt-2 max-w-xs mx-auto">Sélectionnez des prospects et créez votre première tournée optimisée</p>
          </div>
        ) : (
          tournees.map((tournee) => (
            <Card 
              key={tournee.id}
              className="glass-card border-accent/20 hover:border-accent/40 transition-all duration-300 rounded-2xl overflow-hidden hover:shadow-lg hover:shadow-accent/10"
            >
              <CardContent className="p-5 space-y-5">
                {/* Header row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2 rounded-lg bg-accent/10 shrink-0">
                      <RouteIcon className="w-5 h-5 text-accent" aria-hidden="true" />
                    </div>
                    <span className="font-bold text-lg truncate">{tournee.nom}</span>
                  </div>
                  {getStatusBadge(tournee.statut)}
                </div>

                {/* Date */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4 text-accent/60" aria-hidden="true" />
                  <span>{format(new Date(tournee.date_planifiee), 'dd/MM/yyyy', { locale: fr })}</span>
                </div>

                {/* KPIs row */}
                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                  <div className="flex flex-col items-center justify-center p-3 sm:p-4 rounded-xl bg-accent/10 border border-accent/20">
                    <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-accent mb-1" aria-hidden="true" />
                    <span className="font-bold text-lg sm:text-xl">{tournee.ordre_optimise?.length || 0}</span>
                    <span className="text-[10px] sm:text-xs text-muted-foreground">arrêts</span>
                  </div>
                  <div className="flex flex-col items-center justify-center p-3 sm:p-4 rounded-xl bg-gradient-to-br from-accent/15 to-cyan-glow/10 border border-accent/30">
                    <Navigation className="w-4 h-4 sm:w-5 sm:h-5 text-accent mb-1" aria-hidden="true" />
                    <span className="font-bold text-lg sm:text-xl">{tournee.distance_totale_km?.toFixed(0) || 0}<span className="text-sm font-normal">km</span></span>
                    <span className="text-[10px] sm:text-xs text-muted-foreground">distance</span>
                  </div>
                  <div className="flex flex-col items-center justify-center p-3 sm:p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
                    <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400 mb-1" aria-hidden="true" />
                    <span className="font-bold text-lg sm:text-xl">{formatDuration(tournee.temps_estime_minutes)}</span>
                    <span className="text-[10px] sm:text-xs text-muted-foreground">durée</span>
                  </div>
                </div>

                {/* Actions row */}
                <div className="flex items-center gap-2 pt-1">
                  <Button 
                    variant="outline"
                    className="flex-1 h-11 sm:h-12 border-accent/30 hover:bg-accent hover:text-primary hover:border-accent rounded-xl font-semibold transition-all duration-200"
                    onClick={() => handleViewDetails(tournee)}
                    aria-label={`Voir les détails de ${tournee.nom}`}
                  >
                    <Map className="w-4 h-4 mr-2" aria-hidden="true" />
                    Voir détails
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="icon"
                        className="h-11 w-11 sm:h-12 sm:w-12 border-destructive/30 hover:bg-destructive hover:text-white hover:border-destructive rounded-xl transition-all duration-200"
                        aria-label={`Supprimer ${tournee.nom}`}
                      >
                        <Trash2 className="w-4 h-4" aria-hidden="true" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Supprimer cette tournée ?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Cette action est irréversible. La tournée "{tournee.nom}" sera définitivement supprimée.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(tournee.id)}
                          className="bg-destructive hover:bg-destructive/90"
                        >
                          Supprimer
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
