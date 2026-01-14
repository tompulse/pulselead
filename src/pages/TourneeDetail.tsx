import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  Pencil,
  Check,
  X,
  Sparkles
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';
import { TourneeMap } from '@/components/dashboard/TourneeMap';
import { SortableVisiteItem } from '@/components/dashboard/SortableVisiteItem';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
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

interface VisiteStatus {
  visite: boolean;
  rdv: boolean;
  aRevoir: boolean;
}

const TourneeDetail = () => {
  const { tourneeId } = useParams<{ tourneeId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [orderedSiteIds, setOrderedSiteIds] = useState<string[]>([]);
  const [visitesStatus, setVisitesStatus] = useState<Record<string, VisiteStatus>>({});
  const [siteNotes, setSiteNotes] = useState<Record<string, string>>({});
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [localKpis, setLocalKpis] = useState({
    distance: null as number | null,
    temps: null as number | null,
  });
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 10 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { 
        delay: 250,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Fetch tournee data
  const { data: tournee, isLoading: tourneeLoading, error: tourneeError } = useQuery({
    queryKey: ['tournee', tourneeId],
    queryFn: async () => {
      if (!tourneeId) throw new Error('No tournee ID');
      
      const { data, error } = await supabase
        .from('tournees')
        .select('*')
        .eq('id', tourneeId)
        .maybeSingle();
      
      if (error) throw error;
      if (!data) throw new Error('Tournée non trouvée');
      
      return data;
    },
    enabled: !!tourneeId
  });

  // Initialize state from tournee
  useEffect(() => {
    if (tournee) {
      setOrderedSiteIds(tournee.ordre_optimise || []);
      setLocalKpis({
        distance: tournee.distance_totale_km,
        temps: tournee.temps_estime_minutes,
      });
      if (tournee.visites_effectuees && typeof tournee.visites_effectuees === 'object' && !Array.isArray(tournee.visites_effectuees)) {
        setVisitesStatus(tournee.visites_effectuees as unknown as Record<string, VisiteStatus>);
      }
    }
  }, [tournee]);

  // Fetch sites data
  const { data: sites = [], isLoading: sitesLoading } = useQuery({
    queryKey: ['tournee-sites', tourneeId, orderedSiteIds],
    queryFn: async () => {
      if (!orderedSiteIds || orderedSiteIds.length === 0) return [];

      const { data, error } = await supabase
        .from('nouveaux_sites')
        .select('id, nom, adresse, ville, code_postal, latitude, longitude, numero_voie, type_voie, libelle_voie')
        .in('id', orderedSiteIds);

      if (error) throw error;

      // Réordonner selon orderedSiteIds
      return orderedSiteIds
        .map(id => data?.find(s => s.id === id))
        .filter(Boolean);
    },
    enabled: orderedSiteIds.length > 0
  });

  // Auto-calculate route if KPIs are missing
  useEffect(() => {
    const calculateMissingKpis = async () => {
      if (
        sites.length >= 2 &&
        (localKpis.distance === null || localKpis.temps === null) &&
        !isRecalculating
      ) {
        const validSites = sites.filter((s: any) => s.latitude && s.longitude);
        if (validSites.length < 2) return;

        setIsRecalculating(true);
        try {
          const waypoints = validSites.map((s: any) => ({
            lat: Number(s.latitude),
            lng: Number(s.longitude),
          }));

          const { data, error } = await supabase.functions.invoke('calculate-routes', {
            body: { waypoints },
          });

          if (error) throw error;

          const newDistance = parseFloat(data.withTolls?.distance_km) || parseFloat(data.withoutTolls?.distance_km) || null;
          const newTemps = data.withTolls?.duration_minutes || data.withoutTolls?.duration_minutes || null;

          if (newDistance || newTemps) {
            setLocalKpis({
              distance: newDistance || null,
              temps: newTemps || null,
            });

            // Save to database
            await supabase
              .from('tournees')
              .update({
                distance_totale_km: newDistance,
                temps_estime_minutes: newTemps,
                updated_at: new Date().toISOString(),
              })
              .eq('id', tourneeId);
          }
        } catch (error) {
          console.error('Error calculating route:', error);
        } finally {
          setIsRecalculating(false);
        }
      }
    };

    calculateMissingKpis();
  }, [sites, localKpis.distance, localKpis.temps, tourneeId]);

  // Update tournee mutation
  const updateTourneeMutation = useMutation({
    mutationFn: async (updates: Record<string, any>) => {
      const { error } = await supabase
        .from('tournees')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', tourneeId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tournees'] });
    },
  });

  // Sync interaction to CRM
  const syncToCRM = useMutation({
    mutationFn: async ({ entrepriseId, type }: { entrepriseId: string; type: string }) => {
      const { error } = await supabase.functions.invoke('sync-interaction', {
        body: {
          entreprise_id: entrepriseId,
          type,
          statut: 'en_cours',
          notes: `Depuis tournée: ${tournee?.nom}`,
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
      
      await recalculateRoute(newOrder);
    }
  };

  const recalculateRoute = async (newOrder: string[]) => {
    setIsRecalculating(true);
    
    try {
      const orderedSites = newOrder
        .map(id => sites.find((s: any) => s.id === id))
        .filter((s: any) => s?.latitude && s?.longitude);

      if (orderedSites.length < 2) {
        setIsRecalculating(false);
        return;
      }

      const waypoints = orderedSites.map((s: any) => ({
        lat: Number(s.latitude),
        lng: Number(s.longitude),
      }));

      const { data, error } = await supabase.functions.invoke('calculate-routes', {
        body: { waypoints },
      });

      if (error) throw error;

      // Parse response correctly - check nested structure first
      const newDistance = parseFloat(data.withTolls?.distance_km) || 
                          parseFloat(data.withoutTolls?.distance_km) || 
                          parseFloat(data.distance_km) || 
                          localKpis.distance;
      const newTemps = data.withTolls?.duration_minutes || 
                       data.withoutTolls?.duration_minutes || 
                       data.duration_minutes || 
                       localKpis.temps;

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
      await updateTourneeMutation.mutateAsync({
        ordre_optimise: newOrder,
      });
    } finally {
      setIsRecalculating(false);
    }
  };

  const handleVisiteChange = async (siteId: string, field: keyof VisiteStatus, value: boolean) => {
    const newStatus = {
      ...visitesStatus,
      [siteId]: {
        ...(visitesStatus[siteId] || { visite: false, rdv: false, aRevoir: false }),
        [field]: value,
      },
    };
    
    setVisitesStatus(newStatus);

    await updateTourneeMutation.mutateAsync({
      visites_effectuees: newStatus,
    });

    if (value) {
      const typeMap: Record<keyof VisiteStatus, string> = {
        visite: 'visite',
        rdv: 'rdv',
        aRevoir: 'a_revoir',
      };
      
      try {
        await syncToCRM.mutateAsync({
          entrepriseId: siteId,
          type: typeMap[field],
        });
        toast.success(`${field === 'visite' ? 'Visite' : field === 'rdv' ? 'RDV' : 'À revoir'} enregistré`);
      } catch (error) {
        console.error('Error syncing to CRM:', error);
      }
    }
  };

  const handleNoteChange = async (siteId: string, note: string) => {
    // Update local state
    setSiteNotes(prev => ({
      ...prev,
      [siteId]: note,
    }));

    // Get user session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.id) return;

    try {
      // Check if interaction exists for this site
      const { data: existing } = await supabase
        .from('lead_interactions')
        .select('id')
        .eq('entreprise_id', siteId)
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (existing) {
        // Update existing interaction with note
        await supabase
          .from('lead_interactions')
          .update({ 
            notes: note || null,
            updated_at: new Date().toISOString()
          })
          .eq('id', existing.id);
      } else {
        // Create new interaction with note
        await supabase
          .from('lead_interactions')
          .insert({
            entreprise_id: siteId,
            user_id: session.user.id,
            type: 'visite',
            statut: 'en_cours',
            notes: note || null,
          });
      }

      toast.success('Note enregistrée');
      queryClient.invalidateQueries({ queryKey: ['crm-notes'] });
    } catch (error) {
      console.error('Error saving note:', error);
      toast.error('Erreur lors de l\'enregistrement de la note');
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

    const origin = `${validSites[0].latitude},${validSites[0].longitude}`;
    const destination = validSites.length > 1 
      ? `${validSites[validSites.length - 1].latitude},${validSites[validSites.length - 1].longitude}`
      : origin;
    
    const waypoints = validSites.length > 2
      ? validSites.slice(1, -1).map((s: any) => `${s.latitude},${s.longitude}`).join('|')
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

  const handleRemoveSite = async (siteId: string) => {
    const newOrder = orderedSiteIds.filter(id => id !== siteId);
    const newEntreprisesIds = tournee.entreprises_ids.filter(id => id !== siteId);
    
    // Remove from visitesStatus
    const newVisitesStatus = { ...visitesStatus };
    delete newVisitesStatus[siteId];
    
    setOrderedSiteIds(newOrder);
    setVisitesStatus(newVisitesStatus);
    
    // Update database
    await updateTourneeMutation.mutateAsync({
      ordre_optimise: newOrder,
      entreprises_ids: newEntreprisesIds,
      visites_effectuees: newVisitesStatus,
    });
    
    // Recalculate route if needed
    if (newOrder.length >= 2) {
      await recalculateRoute(newOrder);
    } else {
      setLocalKpis({ distance: null, temps: null });
    }
    
    toast.success('Site supprimé de la tournée');
    queryClient.invalidateQueries({ queryKey: ['tournee-sites', tourneeId, newOrder] });
  };

  const handleBack = () => {
    navigate('/dashboard');
  };

  const handleStartEditName = () => {
    setEditedName(tournee?.nom || '');
    setIsEditingName(true);
  };

  const handleSaveName = async () => {
    if (!editedName.trim()) {
      toast.error('Le nom ne peut pas être vide');
      return;
    }
    await updateTourneeMutation.mutateAsync({ nom: editedName.trim() });
    setIsEditingName(false);
    toast.success('Nom modifié');
    queryClient.invalidateQueries({ queryKey: ['tournee', tourneeId] });
  };

  const handleCancelEditName = () => {
    setIsEditingName(false);
    setEditedName('');
  };

  const handleOptimizeRoute = async () => {
    if (sites.length < 2) {
      toast.error('Au moins 2 sites sont nécessaires pour optimiser');
      return;
    }

    setIsOptimizing(true);
    
    try {
      const validSites = sites.filter((s: any) => s.latitude && s.longitude);
      
      if (validSites.length < 2) {
        toast.error('Coordonnées GPS manquantes pour optimiser');
        setIsOptimizing(false);
        return;
      }

      const entreprises = validSites.map((s: any) => ({
        id: s.id,
        nom: s.nom,
        adresse: getFullAddress(s),
        ville: s.ville,
        latitude: Number(s.latitude),
        longitude: Number(s.longitude),
      }));

      const point_depart = tournee.point_depart_lat && tournee.point_depart_lng
        ? { lat: Number(tournee.point_depart_lat), lng: Number(tournee.point_depart_lng) }
        : null;

      const { data, error } = await supabase.functions.invoke('optimize-tournee', {
        body: { entreprises, point_depart },
      });

      if (error) throw error;

      const optimizedOrder = data.ordre_optimise || [];
      const newDistance = data.distance_totale_km || localKpis.distance;
      const newTemps = data.temps_estime_minutes || localKpis.temps;

      if (optimizedOrder.length > 0) {
        setOrderedSiteIds(optimizedOrder);
        setLocalKpis({
          distance: newDistance,
          temps: newTemps,
        });

        await updateTourneeMutation.mutateAsync({
          ordre_optimise: optimizedOrder,
          distance_totale_km: newDistance,
          temps_estime_minutes: newTemps,
        });

        toast.success('Itinéraire optimisé !');
        queryClient.invalidateQueries({ queryKey: ['tournee', tourneeId] });
      } else {
        toast.error('Impossible d\'optimiser l\'itinéraire');
      }
    } catch (error) {
      console.error('Error optimizing route:', error);
      toast.error('Erreur lors de l\'optimisation');
    } finally {
      setIsOptimizing(false);
    }
  };

  // Loading state
  if (tourneeLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-accent border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-muted-foreground">Chargement de la tournée...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (tourneeError || !tournee) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-destructive mb-4">Tournée non trouvée</p>
          <Button onClick={handleBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour au dashboard
          </Button>
        </div>
      </div>
    );
  }

  const entreprisesForMap = sites.map((site: any) => ({
    id: site.id,
    nom: site.nom,
    adresse: getFullAddress(site),
    ville: site.ville,
    latitude: site.latitude,
    longitude: site.longitude
  }));

  const completedCount = Object.values(visitesStatus).filter(v => v.visite).length;
  const currentStatut = tournee.statut;

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Header - Compact on mobile */}
      <div className="p-3 sm:p-4 border-b border-accent/20 flex items-center gap-2 sm:gap-4 shrink-0">
        <Button variant="ghost" size="icon" onClick={handleBack} aria-label="Retour" className="h-9 w-9 shrink-0">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1 min-w-0">
          {isEditingName ? (
            <div className="flex items-center gap-2">
              <Input
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                className="h-8 sm:h-9 text-base sm:text-lg font-bold bg-card border-accent/30 flex-1 min-w-0"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveName();
                  if (e.key === 'Escape') handleCancelEditName();
                }}
              />
              <Button size="icon" variant="ghost" onClick={handleSaveName} className="h-8 w-8 text-green-500 hover:text-green-400 hover:bg-green-500/10 shrink-0">
                <Check className="w-4 h-4" />
              </Button>
              <Button size="icon" variant="ghost" onClick={handleCancelEditName} className="h-8 w-8 text-muted-foreground hover:text-foreground shrink-0">
                <X className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2 min-w-0">
              <h2 className="font-bold text-base sm:text-lg truncate">{tournee.nom}</h2>
              <Button 
                size="icon" 
                variant="ghost" 
                onClick={handleStartEditName}
                className="h-7 w-7 sm:h-8 sm:w-8 text-muted-foreground hover:text-accent shrink-0"
                aria-label="Modifier le nom"
              >
                <Pencil className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </Button>
            </div>
          )}
          <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-muted-foreground mt-0.5">
            <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span className="truncate">{format(new Date(tournee.date_planifiee), 'EEE d MMM yyyy', { locale: fr })}</span>
          </div>
        </div>
        <Badge variant="outline" className={`shrink-0 text-xs
          ${currentStatut === 'planifiee' ? 'border-accent/50 text-accent' : ''}
          ${currentStatut === 'en_cours' ? 'border-orange-500/50 text-orange-500' : ''}
          ${currentStatut === 'terminee' ? 'border-green-500/50 text-green-500' : ''}
        `}>
          {currentStatut === 'planifiee' ? 'Planifiée' : currentStatut === 'en_cours' ? 'En cours' : 'Terminée'}
        </Badge>
      </div>

      {/* KPIs - Responsive grid */}
      <div className="p-3 sm:p-4 grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
        <div className="p-2.5 sm:p-3 rounded-xl bg-accent/10 border border-accent/20 text-center">
          <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-accent mx-auto mb-1" />
          <div className="font-bold text-lg sm:text-xl">{sites.length}</div>
          <div className="text-[10px] sm:text-xs text-muted-foreground">Arrêts</div>
        </div>
        <div className="p-2.5 sm:p-3 rounded-xl bg-gradient-to-r from-accent/20 to-accent/10 border border-accent/30 text-center">
          <Navigation className="w-4 h-4 sm:w-5 sm:h-5 text-accent mx-auto mb-1" />
          <div className="font-bold text-lg sm:text-xl flex items-center justify-center gap-1">
            {isRecalculating && <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />}
            {localKpis.distance?.toFixed(0) || '—'}
          </div>
          <div className="text-[10px] sm:text-xs text-muted-foreground">km</div>
        </div>
        <div className="p-2.5 sm:p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-center">
          <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400 mx-auto mb-1" />
          <div className="font-bold text-lg sm:text-xl">{formatDuration(localKpis.temps)}</div>
          <div className="text-[10px] sm:text-xs text-muted-foreground">durée</div>
        </div>
        <div className="p-2.5 sm:p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-center">
          <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-400 mx-auto mb-1" />
          <div className="font-bold text-lg sm:text-xl">{completedCount}/{sites.length}</div>
          <div className="text-[10px] sm:text-xs text-muted-foreground">visités</div>
        </div>
      </div>

      {/* Actions supprimées (Démarrer la tournée / Ouvrir GPS) */}
      <div className="px-4" />

      {/* Content: Map + List - Stack on mobile, side by side on desktop */}
      <div className="flex-1 flex flex-col lg:flex-row gap-3 sm:gap-4 p-3 sm:p-4 min-h-0">
        {/* Map - hauteur fixe sur mobile, flex sur desktop */}
        <div className="h-[250px] sm:h-[300px] lg:min-h-[400px] lg:flex-1 rounded-xl overflow-hidden border border-accent/20">
          {sitesLoading ? (
            <div className="h-full flex items-center justify-center bg-card">
              <div className="animate-spin w-8 h-8 border-4 border-accent border-t-transparent rounded-full" />
            </div>
          ) : entreprisesForMap.length > 0 ? (
            <TourneeMap 
              entreprises={entreprisesForMap}
              pointDepartLat={tournee.point_depart_lat || undefined}
              pointDepartLng={tournee.point_depart_lng || undefined}
            />
          ) : (
            <div className="h-full flex items-center justify-center bg-card text-muted-foreground text-sm">
              Aucun site avec coordonnées GPS
            </div>
          )}
        </div>

        {/* Sites list with drag & drop - hauteur fixe avec scroll interne */}
        <Card className="glass-card border-accent/20 lg:w-[420px] lg:shrink-0 flex flex-col min-h-[300px] max-h-[350px] sm:max-h-[400px] lg:max-h-none lg:h-full overflow-hidden">
          <CardContent className="p-3 sm:p-4 flex-1 flex flex-col min-h-0 overflow-hidden">
            <div className="flex items-center justify-between mb-3 sm:mb-4 shrink-0 gap-2">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <h3 className="font-semibold text-sm sm:text-base shrink-0">Itinéraire</h3>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={isOptimizing || sites.length < 2}
                  onClick={handleOptimizeRoute}
                  className="h-7 text-[10px] sm:text-xs border-accent/30 hover:bg-accent/10 hover:text-accent px-2 sm:px-3 whitespace-nowrap"
                >
                  {isOptimizing ? (
                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                  ) : (
                    <Sparkles className="w-3 h-3 mr-1" />
                  )}
                  <span className="hidden xs:inline">Revenir à la version </span>optimisée
                </Button>
              </div>
              <span className="text-[10px] sm:text-xs text-muted-foreground hidden md:block shrink-0">Glissez pour réorganiser</span>
            </div>

            <ScrollArea className="flex-1 min-h-0">
              {sitesLoading ? (
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
                    <div className="space-y-2 pr-3">
                      {orderedSiteIds.map((siteId, index) => {
                        const site = sites.find((s: any) => s.id === siteId);
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
                            currentNote={siteNotes[siteId] || ''}
                            onVisiteChange={handleVisiteChange}
                            onNavigate={handleNavigate}
                            onRemove={handleRemoveSite}
                            onNoteChange={handleNoteChange}
                          />
                        );
                      })}
                    </div>
                  </SortableContext>
                </DndContext>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TourneeDetail;
