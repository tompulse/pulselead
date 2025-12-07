import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { ArrowLeft, MapPin, Navigation, Clock, Route, Loader2, LocateFixed } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { TourneeMap } from './TourneeMap';
import { SortableVisiteItem } from './SortableVisiteItem';
import { Json } from '@/integrations/supabase/types';

interface Tournee {
  id: string;
  nom: string;
  date_planifiee: string;
  entreprises_ids: string[];
  ordre_optimise: string[];
  distance_totale_km: number | null;
  temps_estime_minutes: number | null;
  point_depart_lat: number | null;
  point_depart_lng: number | null;
  statut: string;
  visites_effectuees: any;
}

interface NouveauSite {
  id: string;
  nom: string;
  ville: string | null;
  adresse: string | null;
  latitude: number | null;
  longitude: number | null;
  code_postal: string | null;
}

interface VisiteState {
  visite: boolean;
  rdv: boolean;
  aRevoir: boolean;
  notes: string;
}

interface TourneeDetailViewProps {
  tourneeId: string;
  userId: string;
  onBack: () => void;
}

export const TourneeDetailView = ({ tourneeId, userId, onBack }: TourneeDetailViewProps) => {
  const queryClient = useQueryClient();
  const [orderedSites, setOrderedSites] = useState<NouveauSite[]>([]);
  const [visitesState, setVisitesState] = useState<Record<string, VisiteState>>({});
  const [startAddress, setStartAddress] = useState('');
  const [startCoords, setStartCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Fetch tournée
  const { data: tournee, isLoading: tourneeLoading } = useQuery({
    queryKey: ['tournee-detail', tourneeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tournees')
        .select('*')
        .eq('id', tourneeId)
        .single();
      if (error) throw error;
      return data as Tournee;
    },
  });

  // Fetch sites
  const { data: sites = [], isLoading: sitesLoading } = useQuery({
    queryKey: ['tournee-sites', tournee?.entreprises_ids],
    queryFn: async () => {
      if (!tournee?.entreprises_ids?.length) return [];
      const { data, error } = await supabase
        .from('nouveaux_sites')
        .select('id, nom, ville, adresse, latitude, longitude, code_postal')
        .in('id', tournee.entreprises_ids);
      if (error) throw error;
      return data as NouveauSite[];
    },
    enabled: !!tournee?.entreprises_ids?.length,
  });

  // Initialize ordered sites and visites state
  useEffect(() => {
    if (tournee && sites.length > 0) {
      const ordre = tournee.ordre_optimise || tournee.entreprises_ids;
      const ordered = ordre
        .map(id => sites.find(s => s.id === id))
        .filter(Boolean) as NouveauSite[];
      setOrderedSites(ordered);

      // Initialize visites state from saved data
      const savedVisites = (tournee.visites_effectuees as Record<string, VisiteState>) || {};
      const initialState: Record<string, VisiteState> = {};
      ordered.forEach(site => {
        initialState[site.id] = savedVisites[site.id] || {
          visite: false,
          rdv: false,
          aRevoir: false,
          notes: '',
        };
      });
      setVisitesState(initialState);

      // Set start coords
      if (tournee.point_depart_lat && tournee.point_depart_lng) {
        setStartCoords({ lat: tournee.point_depart_lat, lng: tournee.point_depart_lng });
      }
    }
  }, [tournee, sites]);

  // Save visites mutation
  const saveVisitesMutation = useMutation({
    mutationFn: async (newVisitesState: Record<string, VisiteState>) => {
      const { error } = await supabase
        .from('tournees')
        .update({ visites_effectuees: newVisitesState as unknown as Json })
        .eq('id', tourneeId);
      if (error) throw error;
    },
  });

  // Sync to CRM mutation
  const syncToCRMMutation = useMutation({
    mutationFn: async ({ siteId, type }: { siteId: string; type: 'visite' | 'rdv' | 'a_revoir' }) => {
      const { error } = await supabase.functions.invoke('sync-interaction', {
        body: {
          entreprise_id: siteId,
          type: type === 'a_revoir' ? 'autre' : type,
          statut: type === 'a_revoir' ? 'a_rappeler' : 'en_cours',
          notes: visitesState[siteId]?.notes || `Tournée: ${tournee?.nom}`,
        },
      });
      if (error) throw error;
    },
  });

  // Handle visite checkbox change
  const handleVisiteChange = useCallback((siteId: string, field: keyof VisiteState, value: boolean | string) => {
    setVisitesState(prev => {
      const newState = {
        ...prev,
        [siteId]: { ...prev[siteId], [field]: value },
      };
      // Auto-save
      saveVisitesMutation.mutate(newState);
      
      // Sync to CRM if checkbox is checked
      if (typeof value === 'boolean' && value && (field === 'visite' || field === 'rdv' || field === 'aRevoir')) {
        const typeMap = { visite: 'visite', rdv: 'rdv', aRevoir: 'a_revoir' } as const;
        syncToCRMMutation.mutate({ siteId, type: typeMap[field] });
      }
      
      return newState;
    });
  }, [saveVisitesMutation, syncToCRMMutation, tournee?.nom]);

  // Handle drag end
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = orderedSites.findIndex(s => s.id === active.id);
    const newIndex = orderedSites.findIndex(s => s.id === over.id);
    const newOrder = arrayMove(orderedSites, oldIndex, newIndex);
    setOrderedSites(newOrder);

    // Recalculate route
    await recalculateRoute(newOrder);
  };

  // Recalculate route
  const recalculateRoute = async (sites: NouveauSite[]) => {
    setIsOptimizing(true);
    try {
      const entreprises = sites
        .filter(s => s.latitude && s.longitude)
        .map(s => ({
          id: s.id,
          nom: s.nom,
          ville: s.ville,
          latitude: s.latitude,
          longitude: s.longitude,
        }));

      const { data, error } = await supabase.functions.invoke('calculate-routes', {
        body: {
          entreprises,
          startPoint: startCoords,
        },
      });

      if (!error && data) {
        // Update tournee with new order and distance
        await supabase
          .from('tournees')
          .update({
            ordre_optimise: sites.map(s => s.id),
            distance_totale_km: data.distance,
            temps_estime_minutes: data.duration,
          })
          .eq('id', tourneeId);

        queryClient.invalidateQueries({ queryKey: ['tournee-detail', tourneeId] });
      }
    } catch (error) {
      console.error('Error recalculating route:', error);
    } finally {
      setIsOptimizing(false);
    }
  };

  // Optimize from current position
  const optimizeFromPosition = async () => {
    setIsOptimizing(true);
    try {
      const entreprises = orderedSites
        .filter(s => s.latitude && s.longitude)
        .map(s => ({
          id: s.id,
          nom: s.nom,
          ville: s.ville,
          latitude: s.latitude,
          longitude: s.longitude,
        }));

      const { data, error } = await supabase.functions.invoke('optimize-tournee', {
        body: {
          entreprises,
          startPoint: startCoords,
        },
      });

      if (!error && data) {
        // Reorder sites based on optimization result
        const newOrder = (data.ordreOptimise || [])
          .map((id: string) => orderedSites.find(s => s.id === id))
          .filter(Boolean) as NouveauSite[];
        
        setOrderedSites(newOrder);

        // Update in DB
        await supabase
          .from('tournees')
          .update({
            ordre_optimise: data.ordreOptimise,
            distance_totale_km: data.distanceTotale,
            temps_estime_minutes: data.tempsEstime,
            point_depart_lat: startCoords?.lat,
            point_depart_lng: startCoords?.lng,
          })
          .eq('id', tourneeId);

        queryClient.invalidateQueries({ queryKey: ['tournee-detail', tourneeId] });
        toast({ title: '✅ Parcours optimisé !', description: `${Math.round(data.distanceTotale)} km` });
      }
    } catch (error) {
      console.error('Error optimizing:', error);
      toast({ title: 'Erreur', description: 'Impossible d\'optimiser', variant: 'destructive' });
    } finally {
      setIsOptimizing(false);
    }
  };

  // Get current location
  const getCurrentLocation = () => {
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setStartCoords({ lat: position.coords.latitude, lng: position.coords.longitude });
        setStartAddress('Ma position actuelle');
        setIsLocating(false);
        toast({ title: '📍 Position détectée' });
      },
      (error) => {
        console.error('Geolocation error:', error);
        toast({ title: 'Erreur', description: 'Impossible d\'obtenir la position', variant: 'destructive' });
        setIsLocating(false);
      },
      { timeout: 10000 }
    );
  };

  // Open GPS navigation
  const openGPS = (site: NouveauSite) => {
    if (!site.latitude || !site.longitude) return;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${site.latitude},${site.longitude}`;
    window.open(url, '_blank');
  };

  // Open full route in GPS
  const openFullRouteGPS = () => {
    const validSites = orderedSites.filter(s => s.latitude && s.longitude);
    if (validSites.length === 0) return;

    const waypoints = validSites.slice(0, -1).map(s => `${s.latitude},${s.longitude}`).join('|');
    const destination = validSites[validSites.length - 1];
    let url = `https://www.google.com/maps/dir/?api=1&destination=${destination.latitude},${destination.longitude}`;
    
    if (startCoords) {
      url += `&origin=${startCoords.lat},${startCoords.lng}`;
    }
    if (waypoints) {
      url += `&waypoints=${waypoints}`;
    }
    
    window.open(url, '_blank');
  };

  if (tourneeLoading || sitesLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  if (!tournee) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-muted-foreground">Tournée introuvable</p>
      </div>
    );
  }

  const formatDuration = (minutes: number | null) => {
    if (!minutes) return '--';
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}h${m.toString().padStart(2, '0')}`;
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-accent/20">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h2 className="font-bold text-lg">{tournee.nom}</h2>
            <p className="text-sm text-muted-foreground">{new Date(tournee.date_planifiee).toLocaleDateString('fr-FR')}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={optimizeFromPosition}
            disabled={isOptimizing}
            className="border-accent/30"
          >
            {isOptimizing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Route className="w-4 h-4" />}
            <span className="ml-2 hidden md:inline">Optimiser</span>
          </Button>
          <Button 
            onClick={openFullRouteGPS}
            className="bg-accent hover:bg-accent/90"
          >
            <Navigation className="w-4 h-4" />
            <span className="ml-2">Lancer GPS</span>
          </Button>
        </div>
      </div>

      {/* Start point selector */}
      <div className="p-4 border-b border-accent/20 space-y-2">
        <Label className="text-sm font-medium">Point de départ</Label>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={getCurrentLocation}
            disabled={isLocating}
            className="border-accent/30"
          >
            {isLocating ? <Loader2 className="w-4 h-4 animate-spin" /> : <LocateFixed className="w-4 h-4" />}
            <span className="ml-2">Ma position</span>
          </Button>
          <Input
            placeholder="Ou saisir une adresse..."
            value={startAddress}
            onChange={(e) => setStartAddress(e.target.value)}
            className="flex-1 border-accent/30"
          />
        </div>
        {startCoords && (
          <p className="text-xs text-green-500">📍 Point de départ défini</p>
        )}
      </div>

      {/* KPIs */}
      <div className="flex gap-4 p-4 bg-accent/5 border-b border-accent/20">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-accent" />
          <span className="text-sm font-medium">{orderedSites.length} arrêts</span>
        </div>
        <div className="flex items-center gap-2">
          <Route className="w-4 h-4 text-accent" />
          <span className="text-sm font-medium">{Math.round(tournee.distance_totale_km || 0)} km</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-accent" />
          <span className="text-sm font-medium">{formatDuration(tournee.temps_estime_minutes)}</span>
        </div>
      </div>

      {/* Map */}
      <div className="h-48 md:h-64 border-b border-accent/20">
        <TourneeMap 
          entreprises={orderedSites
            .filter(s => s.latitude && s.longitude)
            .map(s => ({
              id: s.id,
              nom: s.nom,
              ville: s.ville || '',
              adresse: s.adresse || '',
              latitude: s.latitude!,
              longitude: s.longitude!,
            }))}
          pointDepartLat={startCoords?.lat}
          pointDepartLng={startCoords?.lng}
        />
      </div>

      {/* Sortable list */}
      <ScrollArea className="flex-1 p-4">
        <DndContext 
          sensors={sensors} 
          collisionDetection={closestCenter} 
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={orderedSites.map(s => s.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-3">
              {orderedSites.map((site, index) => (
                <SortableVisiteItem
                  key={site.id}
                  site={site}
                  index={index}
                  visiteState={visitesState[site.id] || { visite: false, rdv: false, aRevoir: false, notes: '' }}
                  onVisiteChange={(field, value) => handleVisiteChange(site.id, field, value)}
                  onOpenGPS={() => openGPS(site)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </ScrollArea>
    </div>
  );
};
