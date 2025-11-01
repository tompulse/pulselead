import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { TourneeMap } from "./TourneeMap";
import { cn } from "@/lib/utils";
import {
  Navigation,
  MapPin,
  Smile,
  CheckCircle2,
  AlertCircle,
  Map as MapIconLucide,
  Clock,
  Route as RouteIcon,
  Coins,
  X,
  Loader2,
  TrendingUp,
} from "lucide-react";
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
import { SortableEntrepriseItem } from "./SortableEntrepriseItem";

type Entreprise = {
  id: string;
  nom: string;
  adresse: string;
  code_postal: string;
  ville?: string;
  latitude: number;
  longitude: number;
  siret: string;
  date_demarrage: string;
  code_naf: string;
};

interface TourneeRouteDisplayProps {
  tourneeId: string;
  tourneeName: string;
  ordreOptimise: string[];
  distanceTotaleKm: number;
  tempsEstimeMinutes: number;
  pointDepartLat?: number;
  pointDepartLng?: number;
  statut: string;
  notes?: string;
  heureDebut?: string;
  onUpdate?: () => void;
  onBack?: () => void;
}

export const TourneeRouteDisplay = ({
  tourneeId,
  tourneeName,
  ordreOptimise: initialOrdre,
  distanceTotaleKm: initialDistance,
  tempsEstimeMinutes: initialTemps,
  pointDepartLat,
  pointDepartLng,
  statut: initialStatut,
  onUpdate,
  onBack,
}: TourneeRouteDisplayProps) => {
  const [entreprises, setEntreprises] = useState<Entreprise[]>([]);
  const [loading, setLoading] = useState(true);
  const [statut, setStatut] = useState(initialStatut);
  const [showNavigationDialog, setShowNavigationDialog] = useState(false);
  const [showVisiteDialog, setShowVisiteDialog] = useState(false);
  const [showCompletionDialog, setShowCompletionDialog] = useState(false);
  const [routeCalculating, setRouteCalculating] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [routeOptions, setRouteOptions] = useState<{
    withTolls: { distance_km: string; duration_minutes: number } | null;
    withoutTolls: { distance_km: string; duration_minutes: number } | null;
  }>({ withTolls: null, withoutTolls: null });
  const [selectedEntreprise, setSelectedEntreprise] = useState<Entreprise | null>(null);
  const [visiteNotes, setVisiteNotes] = useState("");
  const [rdvPris, setRdvPris] = useState(false);
  const [aRevoir, setARevoir] = useState(false);
  const [visites, setVisites] = useState<any[]>([]);
  const [distanceTotaleKm, setDistanceTotaleKm] = useState(initialDistance);
  const [tempsEstimeMinutes, setTempsEstimeMinutes] = useState(initialTemps);
  const [navigatingEntreprise, setNavigatingEntreprise] = useState<Entreprise | null>(null);
  const { toast } = useToast();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    fetchEntreprises();
    fetchVisites();
  }, [initialOrdre]);

  // Calculer automatiquement les routes quand les entreprises sont chargées
  useEffect(() => {
    if (entreprises.length > 0 && !routeCalculating && !routeOptions.withTolls && !routeOptions.withoutTolls) {
      calculateRoutes();
    }
  }, [entreprises.length]);

  const fetchEntreprises = async () => {
    try {
      const { data, error } = await supabase
        .from('entreprises')
        .select('*')
        .in('id', initialOrdre);

      if (error) throw error;

      const ordered = initialOrdre
        .map(id => data?.find((e: Entreprise) => e.id === id))
        .filter(Boolean) as Entreprise[];

      setEntreprises(ordered);
    } catch (error) {
      console.error('Error fetching entreprises:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchVisites = async () => {
    try {
      const { data, error } = await supabase
        .from('tournee_visites')
        .select('*')
        .eq('tournee_id', tourneeId);

      if (error) throw error;
      setVisites(data || []);
    } catch (error) {
      console.error('Error fetching visites:', error);
    }
  };

  const updateManualOrder = async (newOrder: Entreprise[]) => {
    try {
      // Sauvegarder le nouvel ordre
      await supabase
        .from('tournees')
        .update({
          ordre_optimise: newOrder.map(e => e.id),
        })
        .eq('id', tourneeId);

      toast({
        title: "Ordre mis à jour",
        description: "Recalcul de l'itinéraire en cours...",
        duration: 2000,
      });

      // Recalculer automatiquement les distances et durées
      await calculateRoutes();

      onUpdate?.();
    } catch (error) {
      console.error('Error updating manual order:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour l'ordre",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setEntreprises((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        const newOrder = arrayMove(items, oldIndex, newIndex);
        updateManualOrder(newOrder);
        return newOrder;
      });
    }
  };

  const handleDeleteEntreprise = async (entreprise: Entreprise) => {
    try {
      const newEntreprises = entreprises.filter(e => e.id !== entreprise.id);
      
      if (newEntreprises.length === 0) {
        toast({
          title: "Impossible de supprimer",
          description: "Une tournée doit contenir au moins 1 arrêt",
          variant: "destructive",
          duration: 3000,
        });
        return;
      }

      setEntreprises(newEntreprises);

      // Update tournees table
      await supabase
        .from('tournees')
        .update({
          entreprises_ids: newEntreprises.map(e => e.id),
        })
        .eq('id', tourneeId);

      toast({
        title: "✅ Arrêt supprimé",
        description: `${entreprise.nom} a été retiré de la tournée`,
        duration: 2500,
      });

      onUpdate?.();
    } catch (error) {
      console.error('Error deleting entreprise:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'arrêt",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const handleNavigateToOne = (entreprise: Entreprise) => {
    setNavigatingEntreprise(entreprise);
    setShowNavigationDialog(true);
  };

  const handleNavigateWithApp = (app: 'google' | 'waze') => {
    if (!navigatingEntreprise) return;

    const lat = navigatingEntreprise.latitude;
    const lng = navigatingEntreprise.longitude;

    let url: string;
    if (app === 'google') {
      url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;
    } else {
      url = `https://waze.com/ul?ll=${lat},${lng}&navigate=yes`;
    }

    window.open(url, '_blank');
    setShowNavigationDialog(false);
    setNavigatingEntreprise(null);
  };

  const calculateRoutes = async () => {
    setRouteCalculating(true);
    setRouteOptions({ withTolls: null, withoutTolls: null });

    try {
      // Filtrer uniquement les entreprises avec coordonnées valides
      const validEntreprises = entreprises.filter(e => e.latitude && e.longitude);
      
      if (validEntreprises.length === 0) {
        toast({
          title: "Impossible de calculer",
          description: "Aucune entreprise n'a de coordonnées GPS valides",
          variant: "destructive",
          duration: 3000,
        });
        return;
      }

      const waypoints = validEntreprises.map(e => ({
        lat: e.latitude,
        lng: e.longitude,
      }));

      const { data, error } = await supabase.functions.invoke('calculate-routes', {
        body: {
          waypoints,
          startPoint: pointDepartLat && pointDepartLng 
            ? { lat: pointDepartLat, lng: pointDepartLng }
            : null
        }
      });

      if (error) throw error;

      setRouteOptions({
        withTolls: data.withTolls,
        withoutTolls: data.withoutTolls
      });

      // Mettre à jour les distances et temps affichés
      const withTollsData = data.withTolls;
      if (withTollsData) {
        setDistanceTotaleKm(parseFloat(withTollsData.distance_km));
        setTempsEstimeMinutes(withTollsData.duration_minutes);

        // Sauvegarder dans la base de données
        await supabase
          .from('tournees')
          .update({
            distance_totale_km: parseFloat(withTollsData.distance_km),
            temps_estime_minutes: withTollsData.duration_minutes,
          })
          .eq('id', tourneeId);
      }
    } catch (error) {
      console.error('Error calculating routes:', error);
      toast({
        title: "Erreur de calcul",
        description: "Impossible de calculer les itinéraires",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setRouteCalculating(false);
    }
  };

  const handleNavigateFullRoute = (avoidTolls: boolean = false) => {
    const waypoints = entreprises.map(e => ({
      lat: e.latitude,
      lng: e.longitude,
      name: e.nom
    }));

    if (waypoints.length === 0) return;

    // Google Maps: origin, waypoints, destination
    const origin = pointDepartLat && pointDepartLng 
      ? `${pointDepartLat},${pointDepartLng}`
      : `${waypoints[0].lat},${waypoints[0].lng}`;
    
    const destination = waypoints[waypoints.length - 1];
    const waypointsStr = waypoints
      .slice(0, -1)
      .map(w => `${w.lat},${w.lng}`)
      .join('|');

    const url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination.lat},${destination.lng}&waypoints=${waypointsStr}&travelmode=driving${avoidTolls ? '&avoid=tolls' : ''}`;

    window.open(url, '_blank');
  };

  const handleOptimizeTournee = async () => {
    setIsOptimizing(true);
    
    try {
      // Obtenir la géolocalisation en direct de l'utilisateur
      const getUserLocation = (): Promise<{ lat: number; lng: number }> => {
        return new Promise((resolve, reject) => {
          if (!navigator.geolocation) {
            reject(new Error("La géolocalisation n'est pas supportée"));
            return;
          }

          navigator.geolocation.getCurrentPosition(
            (position) => {
              resolve({
                lat: position.coords.latitude,
                lng: position.coords.longitude
              });
            },
            (error) => {
              reject(error);
            },
            {
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 0
            }
          );
        });
      };

      let startPoint;
      try {
        const currentLocation = await getUserLocation();
        startPoint = currentLocation;
        toast({
          title: "📍 Position détectée",
          description: "Utilisation de votre position actuelle",
          duration: 2000,
        });
      } catch (geoError) {
        console.warn('Géolocalisation non disponible:', geoError);
        // Fallback sur le point de départ sauvegardé
        if (pointDepartLat && pointDepartLng) {
          startPoint = { lat: pointDepartLat, lng: pointDepartLng };
        } else {
          throw new Error("Aucun point de départ disponible");
        }
      }

      const { data, error } = await supabase.functions.invoke('optimize-tournee', {
        body: {
          entreprises: entreprises,
          point_depart: startPoint
        }
      });

      if (error) throw error;

      // Mettre à jour l'ordre avec le résultat optimisé
      const optimizedOrder = data.ordre_optimise;
      const optimizedEntreprises = data.entreprises_ordonnees;

      setEntreprises(optimizedEntreprises);

      // Sauvegarder l'ordre optimisé dans la base de données
      await supabase
        .from('tournees')
        .update({
          ordre_optimise: optimizedOrder,
        })
        .eq('id', tourneeId);

      toast({
        title: "✅ Tournée optimisée",
        description: `Itinéraire optimisé depuis votre position actuelle`,
        duration: 2500,
      });

      // Recalculer les routes pour avoir les vrais chiffres détaillés
      await calculateRoutes();

      onUpdate?.();
    } catch (error) {
      console.error('Error optimizing tournee:', error);
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Impossible d'optimiser la tournée",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleSaveVisite = async () => {
    if (!selectedEntreprise) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const visiteData = {
        tournee_id: tourneeId,
        entreprise_id: selectedEntreprise.id,
        user_id: user.id,
        ordre_visite: entreprises.findIndex(e => e.id === selectedEntreprise.id) + 1,
        notes: visiteNotes,
        rdv_pris: rdvPris,
        a_revoir: aRevoir,
        statut: 'visite',
      };

      const existingVisite = visites.find(v => v.entreprise_id === selectedEntreprise.id);

      if (existingVisite) {
        await supabase
          .from('tournee_visites')
          .update(visiteData)
          .eq('id', existingVisite.id);
      } else {
        await supabase
          .from('tournee_visites')
          .insert(visiteData);
      }

      // Créer une interaction dans lead_interactions si RDV pris ou À revoir
      if (rdvPris || aRevoir) {
        const interactionData = {
          entreprise_id: selectedEntreprise.id,
          user_id: user.id,
          type: rdvPris ? ('appel' as const) : ('a_revoir' as const),
          statut: 'en_cours' as const,
          notes: visiteNotes || (rdvPris ? 'RDV pris lors de la tournée' : 'À revoir suite à la tournée'),
          prochaine_action: rdvPris ? 'Confirmer le RDV' : 'Revoir cette entreprise',
          date_prochaine_action: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        };

        await supabase
          .from('lead_interactions')
          .insert([interactionData]);
      }

      await fetchVisites();
      
      setShowVisiteDialog(false);
      setSelectedEntreprise(null);
      setVisiteNotes("");
      setRdvPris(false);
      setARevoir(false);

      toast({
        title: "✅ Visite enregistrée",
        description: "Les informations ont été sauvegardées",
        duration: 2500,
      });
    } catch (error) {
      console.error('Error saving visite:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'enregistrer la visite",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const handleOpenVisiteDialog = (entreprise: Entreprise) => {
    setSelectedEntreprise(entreprise);
    const existingVisite = visites.find(v => v.entreprise_id === entreprise.id);
    if (existingVisite) {
      setVisiteNotes(existingVisite.notes || "");
      setRdvPris(existingVisite.rdv_pris || false);
      setARevoir(existingVisite.a_revoir || false);
    }
    setShowVisiteDialog(true);
  };

  const handleCompleteTournee = async () => {
    try {
      await supabase
        .from('tournees')
        .update({ statut: 'terminee' })
        .eq('id', tourneeId);
      
      setStatut('terminee');
      setShowCompletionDialog(true);
      onUpdate?.();
    } catch (error) {
      console.error('Error completing tournee:', error);
    }
  };

  const getStatutConfig = (s: string) => {
    const configs: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
      planifiee: { label: "Planifiée", variant: "secondary" },
      en_cours: { label: "En cours", variant: "default" },
      terminee: { label: "Terminée", variant: "outline" },
      annulee: { label: "Annulée", variant: "destructive" },
    };
    return configs[s] || configs.planifiee;
  };

  const statusConfig = getStatutConfig(statut);

  if (loading) {
    return <div className="p-4 text-center text-muted-foreground">Chargement...</div>;
  }

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-full">
      {/* Carte à gauche */}
      <div className="relative flex-1 min-h-[400px] lg:min-h-0 rounded-xl overflow-hidden border border-accent/30 shadow-lg shadow-accent/5 bg-card">
        <TourneeMap
          entreprises={entreprises}
          pointDepartLat={pointDepartLat}
          pointDepartLng={pointDepartLng}
        />
      </div>

      {/* Liste à droite */}
      <Card className="border-accent/30 w-full lg:w-[400px] flex flex-col bg-gradient-to-br from-card/95 to-card/80 backdrop-blur-sm shadow-lg shadow-accent/5">
        <CardHeader className="pb-3 px-4 pt-4 shrink-0 border-b border-accent/10">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-lg gradient-text flex items-center gap-2 mb-1">
                <RouteIcon className="w-5 h-5 text-accent flex-shrink-0" />
                <span className="truncate">{tourneeName}</span>
              </h3>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                {entreprises.length} arrêts
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {onBack && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={onBack}
                  className="border-accent/30 hover:bg-accent/10 hover:border-accent/50 transition-all h-8 text-xs"
                >
                  ← Retour
                </Button>
              )}
              <Button
                variant={statut === 'terminee' ? "outline" : "secondary"}
                size="sm"
                onClick={async () => {
                  try {
                    const newStatut = statut === 'terminee' ? 'planifiee' : 'terminee';
                    await supabase
                      .from('tournees')
                      .update({ statut: newStatut })
                      .eq('id', tourneeId);
                    
                    setStatut(newStatut);
                    toast({
                      title: newStatut === 'terminee' ? "✅ Tournée terminée" : "📋 Tournée réactivée",
                      duration: 2000,
                    });
                    onUpdate?.();
                  } catch (error) {
                    console.error('Error updating statut:', error);
                    toast({
                      title: "Erreur",
                      description: "Impossible de modifier le statut",
                      variant: "destructive",
                    });
                  }
                }}
                className="text-xs shadow-sm transition-all"
              >
                {statusConfig.label}
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-3 text-xs text-muted-foreground bg-accent/5 rounded-lg px-3 py-2">
              <div className="flex items-center gap-1">
                <Navigation className="w-3 h-3" />
                <span className="font-medium">{Math.round(distanceTotaleKm)} km</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span className="font-medium">{Math.floor(tempsEstimeMinutes / 60)}h{Math.round(tempsEstimeMinutes % 60).toString().padStart(2, '0')}</span>
              </div>
            </div>
            <div className="text-[10px] text-muted-foreground bg-card/40 rounded-lg px-3 py-1.5 flex items-center justify-between">
              <span>Dont visites: {Math.floor((entreprises.length * 15) / 60)}h{Math.round((entreprises.length * 15) % 60).toString().padStart(2, '0')}</span>
              <span className="opacity-70">(15 min/arrêt)</span>
            </div>

            {/* Section itinéraires avec/sans péages */}
            {routeCalculating ? (
              <div className="flex items-center justify-center gap-2 py-3 text-xs text-muted-foreground bg-accent/5 rounded-lg">
                <Loader2 className="w-3 h-3 animate-spin" />
                <span>Calcul...</span>
              </div>
            ) : (routeOptions.withTolls || routeOptions.withoutTolls) && (
              <div className="space-y-1.5">
                {routeOptions.withTolls && (
                  <div 
                    className="flex items-center justify-between text-xs bg-blue-500/10 border border-blue-500/20 rounded-lg px-3 py-2 hover:bg-blue-500/15 transition-colors cursor-pointer" 
                    onClick={() => handleNavigateFullRoute(false)}
                  >
                    <div className="flex items-center gap-2">
                      <Coins className="w-3 h-3 text-blue-500" />
                      <span className="font-medium text-blue-600 dark:text-blue-400">Péages</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground font-medium">
                      <span>{routeOptions.withTolls.distance_km} km</span>
                      <span>•</span>
                      <span>{Math.floor(routeOptions.withTolls.duration_minutes / 60)}h{Math.round(routeOptions.withTolls.duration_minutes % 60).toString().padStart(2, '0')}</span>
                    </div>
                  </div>
                )}
                {routeOptions.withoutTolls && (
                  <div 
                    className="flex items-center justify-between text-xs bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-2 hover:bg-green-500/15 transition-colors cursor-pointer" 
                    onClick={() => handleNavigateFullRoute(true)}
                  >
                    <div className="flex items-center gap-2">
                      <RouteIcon className="w-3 h-3 text-green-500" />
                      <span className="font-medium text-green-600 dark:text-green-400">Sans péages</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground font-medium">
                      <span>{routeOptions.withoutTolls.distance_km} km</span>
                      <span>•</span>
                      <span>{Math.floor(routeOptions.withoutTolls.duration_minutes / 60)}h{Math.round(routeOptions.withoutTolls.duration_minutes % 60).toString().padStart(2, '0')}</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Bouton optimiser */}
            <Button
              variant="default"
              size="sm"
              onClick={handleOptimizeTournee}
              disabled={isOptimizing || entreprises.length < 2}
              className="w-full h-9 text-xs bg-accent text-accent-foreground hover:bg-accent/90 transition-all font-medium shadow-md"
            >
              {isOptimizing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                  Optimisation...
                </>
              ) : (
                <>
                  <TrendingUp className="w-3.5 h-3.5 mr-1.5" />
                  Optimiser l'itinéraire
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col gap-3 px-4 pb-4 overflow-hidden min-h-0">
          {/* Liste avec drag & drop stylée */}
          <div className="flex-1 overflow-y-auto -mx-2 px-2 min-h-0">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={entreprises.map(e => e.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2">
                  {entreprises.map((entreprise, index) => (
                    <SortableEntrepriseItem
                      key={entreprise.id}
                      entreprise={entreprise}
                      index={index}
                      visite={visites.find(v => v.entreprise_id === entreprise.id)}
                      onNavigate={handleNavigateToOne}
                      onVisiteClick={handleOpenVisiteDialog}
                      onDelete={handleDeleteEntreprise}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </div>

          {/* Bouton terminé stylé */}
          {statut !== 'terminee' && (
            <Button 
              onClick={handleCompleteTournee} 
              size="lg"
              className="relative w-full h-12 text-base font-semibold shrink-0 bg-gradient-to-r from-accent via-accent to-accent/80 transition-colors duration-300 group overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              <CheckCircle2 className="w-5 h-5 mr-2 relative z-10" />
              <span className="relative z-10">Prospection terminée</span>
            </Button>
          )}
        </CardContent>
      </Card>


      {/* Dialog de choix de navigation */}
      <Dialog open={showNavigationDialog} onOpenChange={setShowNavigationDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Navigation GPS</DialogTitle>
            <DialogDescription>
              {navigatingEntreprise ? `Vers ${navigatingEntreprise.nom}` : 'Itinéraire complet de la tournée'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3 mt-4">
            <Button
              onClick={() => handleNavigateWithApp('google')}
              className="h-24 flex flex-col gap-2 hover:border-accent hover:bg-accent/10"
              variant="outline"
            >
              <MapIconLucide className="w-10 h-10 text-accent" />
              <div className="text-center">
                <span className="font-semibold">Google Maps</span>
                {!navigatingEntreprise && <p className="text-xs text-muted-foreground mt-1">Itinéraire complet</p>}
              </div>
            </Button>
            <Button
              onClick={() => handleNavigateWithApp('waze')}
              className="h-24 flex flex-col gap-2 hover:border-accent hover:bg-accent/10"
              variant="outline"
            >
              <Navigation className="w-10 h-10 text-accent" />
              <div className="text-center">
                <span className="font-semibold">Waze</span>
                {!navigatingEntreprise && <p className="text-xs text-muted-foreground mt-1">Premier arrêt</p>}
              </div>
            </Button>
          </div>
          {!navigatingEntreprise && (
            <p className="text-xs text-muted-foreground text-center mt-2 px-4">
              📍 Google Maps affichera tous les arrêts. Waze vous guidera vers le premier point.
            </p>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog notes de visite */}
      <Dialog open={showVisiteDialog} onOpenChange={setShowVisiteDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Notes de visite</DialogTitle>
            <DialogDescription>
              {selectedEntreprise?.nom}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                placeholder="Ajoutez vos notes sur cette visite..."
                value={visiteNotes}
                onChange={(e) => setVisiteNotes(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="rdv"
                checked={rdvPris}
                onCheckedChange={(checked) => {
                  setRdvPris(checked as boolean);
                  if (checked) {
                    setARevoir(false);
                  }
                }}
              />
              <Label htmlFor="rdv" className="flex items-center gap-2 cursor-pointer">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                RDV pris
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="revoir"
                checked={aRevoir}
                disabled={rdvPris}
                onCheckedChange={(checked) => setARevoir(checked as boolean)}
              />
              <Label htmlFor="revoir" className={cn("flex items-center gap-2", rdvPris ? "opacity-50" : "cursor-pointer")}>
                <AlertCircle className="w-4 h-4 text-orange-500" />
                À revoir
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSaveVisite}>
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog completion */}
      <Dialog open={showCompletionDialog} onOpenChange={setShowCompletionDialog}>
        <DialogContent className="sm:max-w-md text-center">
          <DialogHeader>
            <DialogTitle className="text-center">
              <div className="flex justify-center mb-4">
                <Smile className="w-16 h-16 text-accent" />
              </div>
              Bravo !
            </DialogTitle>
            <DialogDescription className="text-center">
              Votre tournée de prospection est terminée.
              <br />
              Vous avez visité {entreprises.length} entreprises !
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-center">
            <Button onClick={() => setShowCompletionDialog(false)}>
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
