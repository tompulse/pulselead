import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Calendar, 
  MapPin, 
  Navigation, 
  Clock, 
  Map, 
  Compass,
  Trash2,
  Route as RouteIcon
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';
import { TourneeDetailView } from '@/components/dashboard/TourneeDetailView';

interface Tournee {
  id: string;
  nom: string;
  date_planifiee: string;
  entreprises_ids: string[];
  ordre_optimise: string[];
  distance_totale_km: number | null;
  temps_estime_minutes: number | null;
  statut: string;
  heure_debut: string | null;
  point_depart_lat: number | null;
  point_depart_lng: number | null;
}

export const TourneesViewContainer = ({ userId }: { userId: string }) => {
  const [selectedTournee, setSelectedTournee] = useState<Tournee | null>(null);
  const queryClient = useQueryClient();

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
  const deleteTournee = useMutation({
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
    if (!minutes) return '—';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h${mins.toString().padStart(2, '0')}`;
  };

  const getStatusBadge = (statut: string) => {
    switch (statut) {
      case 'planifiee':
        return <Badge variant="outline" className="border-accent/50 text-accent">Planifiée</Badge>;
      case 'en_cours':
        return <Badge className="bg-orange-500/20 text-orange-500 border-orange-500/30">En cours</Badge>;
      case 'terminee':
        return <Badge className="bg-green-500/20 text-green-500 border-green-500/30">Terminée</Badge>;
      default:
        return <Badge variant="outline">{statut}</Badge>;
    }
  };

  // Si une tournée est sélectionnée, afficher le détail
  if (selectedTournee) {
    return (
      <TourneeDetailView 
        tournee={selectedTournee} 
        onBack={() => setSelectedTournee(null)} 
      />
    );
  }

  return (
    <div className="h-full flex flex-col overflow-hidden p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-accent/10">
          <Calendar className="w-5 h-5 text-accent" />
        </div>
        <div>
          <h3 className="font-bold text-lg">Mes tournées</h3>
          <p className="text-sm text-muted-foreground">
            {tournees.length} tournée{tournees.length > 1 ? 's' : ''} planifiée{tournees.length > 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Tournees list */}
      <Card className="flex-1 overflow-hidden glass-card border-accent/20">
        <CardContent className="p-4 h-full">
          <ScrollArea className="h-full">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin w-8 h-8 border-4 border-accent border-t-transparent rounded-full" />
              </div>
            ) : tournees.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <RouteIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="font-medium">Aucune tournée planifiée</p>
                <p className="text-sm mt-1">Sélectionnez des prospects pour créer une tournée</p>
              </div>
            ) : (
              <div className="space-y-4">
                {tournees.map((tournee) => (
                  <div 
                    key={tournee.id}
                    className="p-4 rounded-xl border border-accent/20 bg-card/50 space-y-3 hover:border-accent/40 transition-colors"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <RouteIcon className="w-4 h-4 text-accent" />
                        <span className="font-semibold">{tournee.nom}</span>
                      </div>
                      {getStatusBadge(tournee.statut)}
                    </div>

                    {/* Date */}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      {format(new Date(tournee.date_planifiee), 'EEEE d MMMM yyyy', { locale: fr })}
                    </div>

                    {/* KPIs */}
                    <div className="grid grid-cols-3 gap-2">
                      <div className="flex items-center gap-2 p-3 rounded-lg bg-accent/10 border border-accent/20">
                        <MapPin className="w-4 h-4 text-accent" />
                        <span className="font-medium">{tournee.entreprises_ids?.length || 0} arrêts</span>
                      </div>
                      <div className="flex items-center gap-2 p-3 rounded-lg bg-gradient-to-r from-accent/20 to-accent/10 border border-accent/30">
                        <Navigation className="w-4 h-4 text-accent" />
                        <span className="font-medium">{tournee.distance_totale_km?.toFixed(0) || '—'} km</span>
                      </div>
                      <div className="flex items-center gap-2 p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
                        <Clock className="w-4 h-4 text-purple-400" />
                        <span className="font-medium">{formatDuration(tournee.temps_estime_minutes)}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        className="flex-1 border-accent/30 hover:bg-accent/10 bg-accent/5"
                        onClick={(e) => {
                          e.stopPropagation();
                          console.log('[Tournees] Opening detail for:', tournee.nom);
                          setSelectedTournee(tournee);
                        }}
                      >
                        <Map className="w-4 h-4 mr-2" />
                        Voir détails
                      </Button>
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => deleteTournee.mutate(tournee.id)}
                        className="border-destructive/30 hover:bg-destructive/10 text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};