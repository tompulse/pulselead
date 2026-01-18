import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  ArrowLeft, 
  Calendar, 
  MapPin, 
  Navigation, 
  Clock, 
  Compass,
  Play,
  CheckCircle,
  Loader2,
  Home,
  Flag
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';
import { TourneeMap } from './TourneeMap';
import { SortableVisiteItem } from './SortableVisiteItem';
import { TourneeRouteConfig } from './TourneeRouteConfig';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

interface Tournee {
  id: string;
  nom: string;
  date_planifiee: string;
  entreprises_ids: string[];
  ordre_optimise: string[];
  distance_totale_km: number | null;
  temps_estime_minutes: number | null;
  statut: string;
  point_depart_lat: number | null;
  point_depart_lng: number | null;
  point_depart_adresse?: string | null;
  point_arrivee_type?: string | null;
  point_arrivee_lat?: number | null;
  point_arrivee_lng?: number | null;
  point_arrivee_adresse?: string | null;
  visites_effectuees?: any;
}

interface TourneeDetailViewProps {
  tournee: Tournee;
  onBack: () => void;
}

interface VisiteStatus {
  visite: boolean;
  rdv: boolean;
  aRevoir: boolean;
  aRappeler?: boolean;
}

interface RouteEndpoint {
  type: 'address' | 'current_location';
  address: string;
  lat: number;
  lng: number;
}

interface ArrivalOption {
  type: 'last_prospect' | 'return_start' | 'custom_address';
  address?: string;
  lat?: number;
  lng?: number;
}

export const TourneeDetailView = ({ tournee, onBack }: TourneeDetailViewProps) => {
  const queryClient = useQueryClient();
  const [orderedSiteIds, setOrderedSiteIds] = useState<string[]>(tournee.ordre_optimise || []);
  const [visitesStatus, setVisitesStatus] = useState<Record<string, VisiteStatus>>({});
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [localKpis, setLocalKpis] = useState({
    distance: tournee.distance_totale_km,
    temps: tournee.temps_estime_minutes,
  });

  // Route config state
  const [startPoint, setStartPoint] = useState<RouteEndpoint | null>(
    tournee.point_depart_lat && tournee.point_depart_lng
      ? {
          type: 'address',
          address: (tournee as any).point_depart_adresse || 'Point de départ',
          lat: tournee.point_depart_lat,
          lng: tournee.point_depart_lng,
        }
      : null
  );
  
  const [arrivalOption, setArrivalOption] = useState<ArrivalOption>(() => {
    const type = (tournee as any).point_arrivee_type as string;
    if (type === 'return_start') return { type: 'return_start' };
    if (type === 'custom_address') {
      return {
        type: 'custom_address',
        address: (tournee as any).point_arrivee_adresse,
        lat: (tournee as any).point_arrivee_lat,
        lng: (tournee as any).point_arrivee_lng,
      };
    }
    return { type: 'last_prospect' };
  });

  // Initialize visites status from tournee data
  useEffect(() => {
    if (tournee.visites_effectuees && typeof tournee.visites_effectuees === 'object') {
      setVisitesStatus(tournee.visites_effectuees as Record<string, VisiteStatus>);
    }
  }, [tournee.visites_effectuees]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Fetch sites data
  const { data: sites = [], isLoading } = useQuery({
    queryKey: ['tournee-sites', tournee.id, orderedSiteIds],
    queryFn: async () => {
      if (!orderedSiteIds || orderedSiteIds.length === 0) {
        return [];
      }

      const { data, error } = await supabase
        .from('nouveaux_sites')
        .select('id, nom, adresse, ville, code_postal, latitude, longitude, numero_voie, type_voie, libelle_voie')
        .in('id', orderedSiteIds);

      if (error) {
        console.error('[TourneeDetailView] Error fetching sites:', error);
        throw error;
      }

      // Réordonner selon orderedSiteIds
      const orderedSites = orderedSiteIds
        .map(id => data?.find(s => s.id === id))
        .filter(Boolean);

      return orderedSites;
    },
    enabled: orderedSiteIds.length > 0
  });

  // Update tournee mutation
  const updateTourneeMutation = useMutation({
    mutationFn: async (updates: Partial<Tournee>) => {
      const { error } = await supabase
        .from('tournees')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', tournee.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tournees'] });
    },
  });

  // Sync interaction to CRM
  const syncToCRM = useMutation({
    mutationFn: async ({ entrepriseId, type, dateRelance }: { entrepriseId: string; type: string; dateRelance?: string }) => {
      const { error } = await supabase.functions.invoke('sync-interaction', {
        body: {
          entreprise_id: entrepriseId,
          type,
          statut: type === 'a_revoir' ? 'a_rappeler' : 'en_cours',
          notes: `Depuis tournée: ${tournee.nom}`,
          date_relance: dateRelance || null,
        },
      });

      if (error) throw error;
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
    if (parts) {
      return `${parts}, ${site.code_postal || ''} ${site.ville || ''}`.trim();
    }
    return site.adresse || `${site.code_postal || ''} ${site.ville || ''}`.trim();
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const oldIndex = orderedSiteIds.indexOf(active.id as string);
      const newIndex = orderedSiteIds.indexOf(over.id as string);
      
      const newOrder = arrayMove(orderedSiteIds, oldIndex, newIndex);
      setOrderedSiteIds(newOrder);
      
      // Recalculate route
      await recalculateRoute(newOrder);
    }
  };

  const recalculateRoute = async (newOrder: string[]) => {
    setIsRecalculating(true);
    
    try {
      // Get sites with coordinates in new order
      const orderedSites = newOrder
        .map(id => sites.find(s => s.id === id))
        .filter(s => s?.latitude && s?.longitude);

      if (orderedSites.length < 2) {
        setIsRecalculating(false);
        return;
      }

      const waypoints = orderedSites.map(s => ({
        lat: Number(s.latitude),
        lng: Number(s.longitude),
      }));

      const { data, error } = await supabase.functions.invoke('calculate-routes', {
        body: { waypoints },
      });

      if (error) throw error;

      const newDistance = data.distance_km || localKpis.distance;
      const newTemps = data.duration_minutes || localKpis.temps;

      setLocalKpis({
        distance: newDistance,
        temps: newTemps,
      });

      // Save to database
      await updateTourneeMutation.mutateAsync({
        ordre_optimise: newOrder,
        distance_totale_km: newDistance,
        temps_estime_minutes: newTemps,
      });

      toast.success('Itinéraire recalculé');
    } catch (error) {
      console.error('Error recalculating route:', error);
      // Still save the new order
      await updateTourneeMutation.mutateAsync({
        ordre_optimise: newOrder,
      });
    } finally {
      setIsRecalculating(false);
    }
  };

  const handleVisiteChange = async (siteId: string, field: keyof VisiteStatus, value: boolean, dateRelance?: string) => {
    const newStatus = {
      ...visitesStatus,
      [siteId]: {
        ...(visitesStatus[siteId] || { visite: false, rdv: false, aRevoir: false, aRappeler: false }),
        [field]: value,
      },
    };
    
    setVisitesStatus(newStatus);

    // Save to database
    await updateTourneeMutation.mutateAsync({
      visites_effectuees: newStatus,
    });

    // Sync to CRM
    if (value) {
      const typeMap: Record<keyof VisiteStatus, string> = {
        visite: 'visite',
        rdv: 'rdv',
        aRevoir: 'a_revoir',
        aRappeler: 'a_rappeler',
      };
      
      try {
        await syncToCRM.mutateAsync({
          entrepriseId: siteId,
          type: typeMap[field] || field,
          dateRelance,
        });
        
        const messages: Record<keyof VisiteStatus, string> = {
          visite: 'Visite enregistrée',
          rdv: dateRelance ? `RDV planifié le ${new Date(dateRelance).toLocaleDateString('fr-FR')}` : 'RDV enregistré',
          aRevoir: dateRelance ? `Revisite planifiée le ${new Date(dateRelance).toLocaleDateString('fr-FR')}` : 'À revoir enregistré',
          aRappeler: dateRelance ? `Rappel planifié le ${new Date(dateRelance).toLocaleDateString('fr-FR')}` : 'À rappeler enregistré',
        };
        toast.success(messages[field] || 'Action enregistrée');
      } catch (error) {
        console.error('Error syncing to CRM:', error);
      }
    }
  };

  const handleNavigate = (site: { latitude?: number; longitude?: number; adresse: string }) => {
    if (site.latitude && site.longitude) {
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${site.latitude},${site.longitude}&travelmode=driving`, '_blank');
    } else {
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(site.adresse)}`, '_blank');
    }
  };

  const openInGoogleMaps = () => {
    if (sites.length === 0) return;

    const validSites = sites.filter((s: any) => s.latitude && s.longitude);
    if (validSites.length === 0) return;

    // Use start point if defined, otherwise first site
    const origin = startPoint && startPoint.lat !== 0 
      ? `${startPoint.lat},${startPoint.lng}`
      : `${validSites[0].latitude},${validSites[0].longitude}`;
    
    // Determine destination based on arrival option
    let destination = origin;
    if (arrivalOption.type === 'last_prospect' && validSites.length > 0) {
      const lastSite = validSites[validSites.length - 1];
      destination = `${lastSite.latitude},${lastSite.longitude}`;
    } else if (arrivalOption.type === 'return_start' && startPoint) {
      destination = `${startPoint.lat},${startPoint.lng}`;
    } else if (arrivalOption.type === 'custom_address' && arrivalOption.lat && arrivalOption.lng) {
      destination = `${arrivalOption.lat},${arrivalOption.lng}`;
    } else if (validSites.length > 0) {
      const lastSite = validSites[validSites.length - 1];
      destination = `${lastSite.latitude},${lastSite.longitude}`;
    }
    
    const waypointSites = startPoint ? validSites : validSites.slice(1);
    const waypoints = waypointSites.length > 0
      ? waypointSites.slice(0, -1).map((s: any) => `${s.latitude},${s.longitude}`).join('|')
      : '';

    let url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}`;
    if (waypoints) {
      url += `&waypoints=${waypoints}`;
    }
    url += '&travelmode=driving';

    window.open(url, '_blank');
  };

  const handleStartTournee = async () => {
    await updateTourneeMutation.mutateAsync({ statut: 'en_cours' });
    toast.success('Tournée démarrée');
  };

  const handleEndTournee = async () => {
    await updateTourneeMutation.mutateAsync({ statut: 'terminee' });
    toast.success('Tournée terminée');
  };

  const handleStartPointChange = async (point: RouteEndpoint | null) => {
    setStartPoint(point);
    await updateTourneeMutation.mutateAsync({
      point_depart_lat: point?.lat || null,
      point_depart_lng: point?.lng || null,
    } as any);
    
    // Recalculate route with new start point
    if (orderedSiteIds.length > 0) {
      await recalculateRouteWithEndpoints(orderedSiteIds, point, arrivalOption);
    }
  };

  const handleArrivalOptionChange = async (option: ArrivalOption) => {
    setArrivalOption(option);
    // Note: We can't save to DB as columns don't exist yet, but we update local state
    
    // Recalculate route with new arrival option
    if (orderedSiteIds.length > 0) {
      await recalculateRouteWithEndpoints(orderedSiteIds, startPoint, option);
    }
  };

  const recalculateRouteWithEndpoints = async (
    newOrder: string[], 
    start: RouteEndpoint | null, 
    arrival: ArrivalOption
  ) => {
    setIsRecalculating(true);
    
    try {
      const orderedSites = newOrder
        .map(id => sites.find(s => s.id === id))
        .filter(s => s?.latitude && s?.longitude);

      if (orderedSites.length === 0) {
        setIsRecalculating(false);
        return;
      }

      const waypoints: { lat: number; lng: number }[] = [];
      
      // Add start point
      if (start && start.lat !== 0) {
        waypoints.push({ lat: start.lat, lng: start.lng });
      }
      
      // Add all sites
      orderedSites.forEach(s => {
        waypoints.push({ lat: Number(s.latitude), lng: Number(s.longitude) });
      });
      
      // Add arrival point based on option
      if (arrival.type === 'return_start' && start && start.lat !== 0) {
        waypoints.push({ lat: start.lat, lng: start.lng });
      } else if (arrival.type === 'custom_address' && arrival.lat && arrival.lng) {
        waypoints.push({ lat: arrival.lat, lng: arrival.lng });
      }
      // For 'last_prospect', no need to add anything as it's already the last site

      if (waypoints.length < 2) {
        setIsRecalculating(false);
        return;
      }

      const { data, error } = await supabase.functions.invoke('calculate-routes', {
        body: { waypoints },
      });

      if (error) throw error;

      const newDistance = data.distance_km || localKpis.distance;
      const newTemps = data.duration_minutes || localKpis.temps;

      setLocalKpis({
        distance: newDistance,
        temps: newTemps,
      });

      await updateTourneeMutation.mutateAsync({
        ordre_optimise: newOrder,
        distance_totale_km: newDistance,
        temps_estime_minutes: newTemps,
      });

      toast.success('Itinéraire recalculé');
    } catch (error) {
      console.error('Error recalculating route:', error);
    } finally {
      setIsRecalculating(false);
    }
  };

  // Convertir les coordonnées en nombres pour la carte
  const entreprisesForMap = sites.map((site: any) => ({
    id: site.id,
    nom: site.nom,
    adresse: getFullAddress(site),
    ville: site.ville,
    latitude: Number(site.latitude),
    longitude: Number(site.longitude)
  })).filter(e => Number.isFinite(e.latitude) && Number.isFinite(e.longitude));

  const completedCount = Object.values(visitesStatus).filter(v => v.visite).length;
  const currentStatut = updateTourneeMutation.isPending ? tournee.statut : tournee.statut;

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
          ${currentStatut === 'planifiee' ? 'border-accent/50 text-accent' : ''}
          ${currentStatut === 'en_cours' ? 'border-orange-500/50 text-orange-500' : ''}
          ${currentStatut === 'terminee' ? 'border-green-500/50 text-green-500' : ''}
        `}>
          {currentStatut === 'planifiee' ? 'Planifiée' : currentStatut === 'en_cours' ? 'En cours' : 'Terminée'}
        </Badge>
      </div>

      {/* KPIs */}
      <div className="p-4 grid grid-cols-4 gap-3">
        <div className="p-3 rounded-xl bg-accent/10 border border-accent/20 text-center">
          <MapPin className="w-5 h-5 text-accent mx-auto mb-1" />
          <div className="font-bold text-xl">{orderedSiteIds.length}</div>
          <div className="text-xs text-muted-foreground">Arrêts</div>
        </div>
        <div className="p-3 rounded-xl bg-gradient-to-r from-accent/20 to-accent/10 border border-accent/30 text-center">
          <Navigation className="w-5 h-5 text-accent mx-auto mb-1" />
          <div className="font-bold text-xl flex items-center justify-center gap-1">
            {isRecalculating && <Loader2 className="w-4 h-4 animate-spin" />}
            {localKpis.distance?.toFixed(0) || '—'}
          </div>
          <div className="text-xs text-muted-foreground">km</div>
        </div>
        <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-center">
          <Clock className="w-5 h-5 text-purple-400 mx-auto mb-1" />
          <div className="font-bold text-xl">{formatDuration(localKpis.temps)}</div>
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
        {currentStatut === 'planifiee' && (
          <Button 
            onClick={handleStartTournee}
            className="flex-1 bg-accent hover:bg-accent/90 text-primary"
            disabled={updateTourneeMutation.isPending}
          >
            <Play className="w-4 h-4 mr-2" />
            Démarrer la tournée
          </Button>
        )}
        {currentStatut === 'en_cours' && (
          <Button 
            onClick={handleEndTournee}
            className="flex-1 bg-green-500 hover:bg-green-600 text-white"
            disabled={updateTourneeMutation.isPending}
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Terminer la tournée
          </Button>
        )}
        <Button 
          variant="outline" 
          onClick={openInGoogleMaps}
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
          {isLoading ? (
            <div className="h-full flex items-center justify-center bg-card">
              <div className="animate-spin w-8 h-8 border-4 border-accent border-t-transparent rounded-full" />
            </div>
          ) : entreprisesForMap.length > 0 ? (
            <TourneeMap 
              entreprises={entreprisesForMap}
              pointDepartLat={startPoint?.lat || undefined}
              pointDepartLng={startPoint?.lng || undefined}
            />
          ) : (
            <div className="h-full flex items-center justify-center bg-card text-muted-foreground">
              Aucun site avec coordonnées GPS
            </div>
          )}
        </div>

        {/* Sites list with drag & drop */}
        <Card className="lg:w-[420px] glass-card border-accent/20">
          <CardContent className="p-4 h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Itinéraire</h3>
              <span className="text-xs text-muted-foreground">Glissez pour réorganiser</span>
            </div>

            <ScrollArea className="flex-1">
              {/* Route Configuration */}
              <TourneeRouteConfig
                startPoint={startPoint}
                arrivalOption={arrivalOption}
                onStartPointChange={handleStartPointChange}
                onArrivalOptionChange={handleArrivalOptionChange}
                disabled={currentStatut === 'terminee'}
              />

              <div className="my-4 border-t border-accent/20" />

              {/* Prospects List Header */}
              <div className="flex items-center gap-2 mb-3 text-sm font-medium text-muted-foreground">
                <MapPin className="w-4 h-4 text-cyan-400" />
                Prospects à visiter ({orderedSiteIds.length})
              </div>

              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">
                  Chargement...
                </div>
              ) : sites.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Aucun site
                </div>
              ) : (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={orderedSiteIds}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-2">
                      {orderedSiteIds.map((siteId, index) => {
                        const site = sites.find(s => s.id === siteId);
                        if (!site) return null;
                        
                        return (
                          <SortableVisiteItem
                            key={siteId}
                            id={siteId}
                            index={index}
                            isLast={index === orderedSiteIds.length - 1}
                            site={{
                              id: site.id,
                              nom: site.nom,
                              adresse: getFullAddress(site),
                              ville: site.ville,
                              latitude: site.latitude,
                              longitude: site.longitude,
                            }}
                            visiteStatus={visitesStatus[siteId] || { visite: false, rdv: false, aRevoir: false }}
                            onVisiteChange={handleVisiteChange}
                            onNavigate={handleNavigate}
                          />
                        );
                      })}
                    </div>
                  </SortableContext>
                </DndContext>
              )}

              {/* Arrival indicator */}
              {arrivalOption.type !== 'last_prospect' && sites.length > 0 && (
                <div className="mt-4 p-3 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white text-lg">
                    🏁
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-medium text-green-400">Arrivée</div>
                    <div className="text-xs text-muted-foreground">
                      {arrivalOption.type === 'return_start' 
                        ? 'Retour au point de départ'
                        : arrivalOption.address || 'Adresse personnalisée'}
                    </div>
                  </div>
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
