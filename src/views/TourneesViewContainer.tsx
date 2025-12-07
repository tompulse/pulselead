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
  Plus,
  Pencil
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';

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
    toast.info('Fonctionnalité à venir - Backend à implémenter');
  };

  const handleViewDetails = (tournee: Tournee) => {
    navigate(`/dashboard/tournee/${tournee.id}`);
  };

  const handleEdit = (tournee: Tournee) => {
    toast.info(`Modifier ${tournee.nom} - Backend à implémenter`);
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  return (
    <div className="h-full flex flex-col overflow-hidden p-4 space-y-4">
      {/* Create Button */}
      <Button 
        onClick={handleCreateTournee}
        className="w-full h-14 bg-accent hover:bg-accent/90 text-primary font-semibold text-base rounded-xl"
      >
        <Plus className="w-5 h-5 mr-2" />
        Créer une nouvelle tournée
      </Button>

      {/* Header */}
      <div className="flex items-center gap-3 p-4 rounded-xl bg-card/50 border border-accent/20">
        <div className="p-2.5 rounded-lg bg-accent/10 border border-accent/30">
          <Calendar className="w-5 h-5 text-accent" />
        </div>
        <div>
          <h3 className="font-bold text-lg text-accent">Mes tournées planifiées</h3>
          <p className="text-sm text-muted-foreground">
            {tournees.length} tournée{tournees.length > 1 ? 's' : ''} enregistrée{tournees.length > 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Tournees list */}
      <div className="flex-1 overflow-auto space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-accent border-t-transparent rounded-full" />
          </div>
        ) : tournees.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <RouteIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="font-medium">Aucune tournée planifiée</p>
            <p className="text-sm mt-1">Cliquez sur le bouton ci-dessus pour créer votre première tournée</p>
          </div>
        ) : (
          tournees.map((tournee) => (
            <Card 
              key={tournee.id}
              className="glass-card border-accent/20 hover:border-accent/40 transition-colors rounded-2xl overflow-hidden"
            >
              <CardContent className="p-5 space-y-4">
                {/* Header row */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <RouteIcon className="w-5 h-5 text-accent" />
                    <span className="font-semibold text-lg">{tournee.nom}</span>
                  </div>
                  {getStatusBadge(tournee.statut)}
                </div>

                {/* Date */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  {format(new Date(tournee.date_planifiee), 'dd/MM/yyyy', { locale: fr })}
                </div>

                {/* KPIs row */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-accent/10 border border-accent/20">
                    <MapPin className="w-5 h-5 text-accent" />
                    <span className="font-bold text-lg">{tournee.entreprises_ids?.length || 0}</span>
                  </div>
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-accent/20 to-accent/10 border border-accent/30">
                    <Navigation className="w-5 h-5 text-accent" />
                    <span className="font-bold text-lg">{tournee.distance_totale_km?.toFixed(0) || 0}km</span>
                  </div>
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
                    <Clock className="w-5 h-5 text-purple-400" />
                    <span className="font-bold text-lg">{formatDuration(tournee.temps_estime_minutes)}</span>
                  </div>
                </div>

                {/* Actions row */}
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline"
                    className="flex-1 h-12 border-accent/30 hover:bg-accent/10 rounded-xl"
                    onClick={() => handleViewDetails(tournee)}
                  >
                    <Map className="w-4 h-4 mr-2" />
                    Voir détails
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => handleEdit(tournee)}
                    className="h-12 w-12 border-accent/30 hover:bg-accent/10 rounded-xl"
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => handleDelete(tournee.id)}
                    className="h-12 w-12 border-destructive/30 hover:bg-destructive/10 text-destructive rounded-xl"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
