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
  Eye,
  Trash2,
  Route as RouteIcon,
  ArrowLeft,
  Compass,
  Play,
  CheckCircle,
  Loader2,
  GripVertical,
  RotateCcw
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';
import { TourneeMap } from '@/components/dashboard/TourneeMap';
import { Checkbox } from '@/components/ui/checkbox';

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
  visites_effectuees?: any;
}

// ==================== LISTE DES TOURNÉES ====================
const TourneesList = ({ 
  tournees, 
  isLoading, 
  onSelectTournee, 
  onDeleteTournee 
}: { 
  tournees: Tournee[]; 
  isLoading: boolean;
  onSelectTournee: (t: Tournee) => void;
  onDeleteTournee: (id: string) => void;
}) => {
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
                        variant="default"
                        className="flex-1 bg-accent hover:bg-accent/90 text-primary"
                        onClick={() => onSelectTournee(tournee)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Voir détails
                      </Button>
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => onDeleteTournee(tournee.id)}
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

// ==================== DÉTAIL D'UNE TOURNÉE ====================
const TourneeDetail = ({ 
  tournee, 
  onBack 
}: { 
  tournee: Tournee; 
  onBack: () => void;
}) => {
  const queryClient = useQueryClient();
  const [visitesStatus, setVisitesStatus] = useState<Record<string, { visite: boolean; rdv: boolean; aRevoir: boolean }>>(
    tournee.visites_effectuees || {}
  );

  // Fetch sites data
  const { data: sites = [], isLoading: sitesLoading } = useQuery({
    queryKey: ['tournee-detail-sites', tournee.id],
    queryFn: async () => {
      const ids = tournee.ordre_optimise || tournee.entreprises_ids || [];
      if (ids.length === 0) return [];

      const { data, error } = await supabase
        .from('nouveaux_sites')
        .select('id, nom, adresse, ville, code_postal, latitude, longitude, numero_voie, type_voie, libelle_voie')
        .in('id', ids);

      if (error) throw error;

      // Réordonner selon ordre_optimise
      return ids
        .map(id => data?.find(s => s.id === id))
        .filter(Boolean) as any[];
    },
  });

  // Update tournee mutation
  const updateMutation = useMutation({
    mutationFn: async (updates: Partial<Tournee>) => {
      const { error } = await supabase
        .from('tournees')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', tournee.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tournees'] });
    },
  });

  const formatDuration = (minutes: number | null) => {
    if (!minutes) return '0h00';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h${mins.toString().padStart(2, '0')}`;
  };

  const getFullAddress = (site: any) => {
    const parts = [site.numero_voie, site.type_voie, site.libelle_voie].filter(Boolean).join(' ');
    if (parts) return `${parts}, ${site.code_postal || ''} ${site.ville || ''}`.trim();
    return site.adresse || `${site.code_postal || ''} ${site.ville || ''}`.trim();
  };

  const handleNavigateTo = (site: any) => {
    if (site.latitude && site.longitude) {
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${site.latitude},${site.longitude}&travelmode=driving`, '_blank');
    } else {
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(getFullAddress(site))}`, '_blank');
    }
  };

  const openFullRoute = () => {
    const validSites = sites.filter(s => s.latitude && s.longitude);
    if (validSites.length === 0) return;

    const origin = `${validSites[0].latitude},${validSites[0].longitude}`;
    const destination = validSites.length > 1 
      ? `${validSites[validSites.length - 1].latitude},${validSites[validSites.length - 1].longitude}`
      : origin;
    
    const waypoints = validSites.length > 2
      ? validSites.slice(1, -1).map(s => `${s.latitude},${s.longitude}`).join('|')
      : '';

    let url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}`;
    if (waypoints) url += `&waypoints=${waypoints}`;
    url += '&travelmode=driving';
    window.open(url, '_blank');
  };

  const handleVisiteChange = async (siteId: string, field: 'visite' | 'rdv' | 'aRevoir', value: boolean) => {
    const newStatus = {
      ...visitesStatus,
      [siteId]: {
        ...(visitesStatus[siteId] || { visite: false, rdv: false, aRevoir: false }),
        [field]: value,
      },
    };
    setVisitesStatus(newStatus);
    await updateMutation.mutateAsync({ visites_effectuees: newStatus });
    
    // Sync to CRM
    if (value) {
      const typeMap = { visite: 'visite', rdv: 'rdv', aRevoir: 'a_revoir' };
      try {
        await supabase.functions.invoke('sync-interaction', {
          body: {
            entreprise_id: siteId,
            type: typeMap[field],
            statut: 'en_cours',
            notes: `Depuis tournée: ${tournee.nom}`,
          },
        });
        toast.success(`${field === 'visite' ? 'Visite' : field === 'rdv' ? 'RDV' : 'À revoir'} enregistré`);
      } catch (error) {
        console.error('Sync error:', error);
      }
    }
  };

  const handleStartTournee = async () => {
    await updateMutation.mutateAsync({ statut: 'en_cours' });
    toast.success('Tournée démarrée');
  };

  const handleEndTournee = async () => {
    await updateMutation.mutateAsync({ statut: 'terminee' });
    toast.success('Tournée terminée');
  };

  const entreprisesForMap = sites.map(site => ({
    id: site.id,
    nom: site.nom,
    adresse: getFullAddress(site),
    ville: site.ville,
    latitude: site.latitude,
    longitude: site.longitude
  }));

  const completedCount = Object.values(visitesStatus).filter(v => v.visite).length;

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-accent/20 flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h2 className="font-bold text-lg">{tournee.nom}</h2>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            {format(new Date(tournee.date_planifiee), 'EEEE d MMMM yyyy', { locale: fr })}
          </div>
        </div>
        <Badge variant="outline" className={`
          ${tournee.statut === 'planifiee' ? 'border-accent/50 text-accent' : ''}
          ${tournee.statut === 'en_cours' ? 'border-orange-500/50 text-orange-500' : ''}
          ${tournee.statut === 'terminee' ? 'border-green-500/50 text-green-500' : ''}
        `}>
          {tournee.statut === 'planifiee' ? 'Planifiée' : tournee.statut === 'en_cours' ? 'En cours' : 'Terminée'}
        </Badge>
      </div>

      {/* KPIs */}
      <div className="p-4 grid grid-cols-4 gap-3">
        <div className="p-3 rounded-xl bg-accent/10 border border-accent/20 text-center">
          <MapPin className="w-5 h-5 text-accent mx-auto mb-1" />
          <div className="font-bold text-xl">{sites.length}</div>
          <div className="text-xs text-muted-foreground">Arrêts</div>
        </div>
        <div className="p-3 rounded-xl bg-gradient-to-r from-accent/20 to-accent/10 border border-accent/30 text-center">
          <Navigation className="w-5 h-5 text-accent mx-auto mb-1" />
          <div className="font-bold text-xl">{tournee.distance_totale_km?.toFixed(0) || '—'}</div>
          <div className="text-xs text-muted-foreground">km</div>
        </div>
        <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-center">
          <Clock className="w-5 h-5 text-purple-400 mx-auto mb-1" />
          <div className="font-bold text-xl">{formatDuration(tournee.temps_estime_minutes)}</div>
          <div className="text-xs text-muted-foreground">durée</div>
        </div>
        <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-center">
          <CheckCircle className="w-5 h-5 text-green-400 mx-auto mb-1" />
          <div className="font-bold text-xl">{completedCount}/{sites.length}</div>
          <div className="text-xs text-muted-foreground">visités</div>
        </div>
      </div>

      {/* Actions */}
      <div className="px-4 flex gap-2">
        {tournee.statut === 'planifiee' && (
          <Button 
            onClick={handleStartTournee}
            className="flex-1 bg-accent hover:bg-accent/90 text-primary"
            disabled={updateMutation.isPending}
          >
            <Play className="w-4 h-4 mr-2" />
            Démarrer la tournée
          </Button>
        )}
        {tournee.statut === 'en_cours' && (
          <Button 
            onClick={handleEndTournee}
            className="flex-1 bg-green-500 hover:bg-green-600 text-white"
            disabled={updateMutation.isPending}
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Terminer la tournée
          </Button>
        )}
        <Button 
          variant="outline" 
          onClick={openFullRoute}
          className="border-accent/30 hover:bg-accent/10"
        >
          <Compass className="w-4 h-4 mr-2" />
          Ouvrir GPS
        </Button>
      </div>

      {/* Content: Map + List */}
      <div className="flex-1 flex flex-col lg:flex-row gap-4 p-4 overflow-hidden">
        {/* Map */}
        <div className="flex-1 min-h-[300px] lg:min-h-0 rounded-xl overflow-hidden border border-accent/20">
          {sitesLoading ? (
            <div className="h-full flex items-center justify-center bg-card">
              <Loader2 className="w-8 h-8 animate-spin text-accent" />
            </div>
          ) : entreprisesForMap.length > 0 ? (
            <TourneeMap 
              entreprises={entreprisesForMap}
              pointDepartLat={tournee.point_depart_lat || undefined}
              pointDepartLng={tournee.point_depart_lng || undefined}
            />
          ) : (
            <div className="h-full flex items-center justify-center bg-card text-muted-foreground">
              Aucun site avec coordonnées GPS
            </div>
          )}
        </div>

        {/* Sites list */}
        <Card className="lg:w-96 glass-card border-accent/20">
          <CardContent className="p-4 h-full flex flex-col">
            <h3 className="font-semibold mb-4">Itinéraire optimisé</h3>

            <ScrollArea className="flex-1">
              {sitesLoading ? (
                <div className="text-center py-8 text-muted-foreground">Chargement...</div>
              ) : sites.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">Aucun site</div>
              ) : (
                <div className="space-y-2">
                  {sites.map((site, index) => {
                    const status = visitesStatus[site.id] || { visite: false, rdv: false, aRevoir: false };
                    const isLast = index === sites.length - 1;
                    
                    return (
                      <div 
                        key={site.id}
                        className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
                          status.visite 
                            ? 'bg-green-500/10 border-green-500/30' 
                            : 'bg-card/50 border-accent/10 hover:border-accent/30'
                        }`}
                      >
                        {/* Index badge */}
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                          isLast 
                            ? 'bg-green-500 text-white' 
                            : status.visite
                              ? 'bg-green-500/50 text-white'
                              : 'bg-accent text-primary'
                        }`}>
                          {isLast ? '🏁' : index + 1}
                        </div>

                        {/* Site info */}
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm truncate">{site.nom}</div>
                          <div className="text-xs text-muted-foreground truncate">{getFullAddress(site)}</div>
                          
                          {/* Action checkboxes */}
                          <div className="flex flex-wrap items-center gap-3 mt-2">
                            <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                              <Checkbox 
                                checked={status.visite}
                                onCheckedChange={(checked) => handleVisiteChange(site.id, 'visite', !!checked)}
                                className="h-4 w-4"
                              />
                              <MapPin className="w-3 h-3 text-accent" />
                              <span>Visité</span>
                            </label>
                            
                            <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                              <Checkbox 
                                checked={status.rdv}
                                onCheckedChange={(checked) => handleVisiteChange(site.id, 'rdv', !!checked)}
                                className="h-4 w-4"
                              />
                              <Calendar className="w-3 h-3 text-purple-400" />
                              <span>RDV</span>
                            </label>
                            
                            <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                              <Checkbox 
                                checked={status.aRevoir}
                                onCheckedChange={(checked) => handleVisiteChange(site.id, 'aRevoir', !!checked)}
                                className="h-4 w-4"
                              />
                              <RotateCcw className="w-3 h-3 text-orange-400" />
                              <span>À revoir</span>
                            </label>
                          </div>
                        </div>

                        {/* Navigation button */}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="shrink-0 h-8 w-8"
                          onClick={() => handleNavigateTo(site)}
                        >
                          <Navigation className="w-4 h-4 text-accent" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// ==================== COMPOSANT PRINCIPAL ====================
export const TourneesViewContainer = ({ userId }: { userId: string }) => {
  const [viewMode, setViewMode] = useState<'list' | 'detail'>('list');
  const [selectedTournee, setSelectedTournee] = useState<Tournee | null>(null);
  const queryClient = useQueryClient();

  console.log('[TourneesViewContainer] Render - viewMode:', viewMode, 'selectedTournee:', selectedTournee?.id);

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

  const handleSelectTournee = (tournee: Tournee) => {
    console.log('[TourneesViewContainer] handleSelectTournee called with:', tournee.id, tournee.nom);
    setSelectedTournee(tournee);
    setViewMode('detail');
    console.log('[TourneesViewContainer] State updated - should now show detail');
  };

  const handleBack = () => {
    console.log('[TourneesViewContainer] handleBack called');
    setSelectedTournee(null);
    setViewMode('list');
  };

  // Rendu explicite avec keys pour forcer le re-render
  return (
    <div className="h-full w-full" key={`view-${viewMode}-${selectedTournee?.id || 'none'}`}>
      {viewMode === 'detail' && selectedTournee ? (
        <TourneeDetail 
          key={`detail-${selectedTournee.id}`}
          tournee={selectedTournee} 
          onBack={handleBack} 
        />
      ) : (
        <TourneesList 
          key="list"
          tournees={tournees}
          isLoading={isLoading}
          onSelectTournee={handleSelectTournee}
          onDeleteTournee={(id) => deleteMutation.mutate(id)}
        />
      )}
    </div>
  );
};
