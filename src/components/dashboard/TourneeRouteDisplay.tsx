import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { TourneeMap } from "./TourneeMap";
import { cn } from "@/lib/utils";
import {
  Navigation,
  MapPin,
  CheckCircle2,
  Map as MapIconLucide,
  Clock,
  Route as RouteIcon,
  X,
  Loader2,
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
  adresse: string | null;
  code_postal: string | null;
  ville?: string | null;
  latitude: number | null;
  longitude: number | null;
  siret: string;
  date_creation?: string | null;
  code_naf?: string | null;
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
  pointDepartLat: initialPointDepartLat,
  pointDepartLng: initialPointDepartLng,
  statut: initialStatut,
  onUpdate,
  onBack,
}: TourneeRouteDisplayProps) => {
  const [entreprises, setEntreprises] = useState<Entreprise[]>([]);
  const [loading, setLoading] = useState(true);
  const [statut, setStatut] = useState(initialStatut);
  const [showNavigationDialog, setShowNavigationDialog] = useState(false);
  const [distanceTotaleKm, setDistanceTotaleKm] = useState(initialDistance);
  const [tempsEstimeMinutes, setTempsEstimeMinutes] = useState(initialTemps);
  const { toast } = useToast();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    fetchEntreprises();
  }, [initialOrdre]);

  const fetchEntreprises = async () => {
    try {
      const { data, error } = await supabase
        .from('nouveaux_sites')
        .select('id, nom, adresse, code_postal, ville, latitude, longitude, siret, date_creation, code_naf')
        .in('id', initialOrdre);

      if (error) throw error;

      const ordered = initialOrdre
        .map(id => data?.find((e) => e.id === id))
        .filter(Boolean) as Entreprise[];

      setEntreprises(ordered);
    } catch (error) {
      console.error('Error fetching entreprises:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || active.id === over.id) return;

    const oldIndex = entreprises.findIndex(e => e.id === active.id);
    const newIndex = entreprises.findIndex(e => e.id === over.id);

    const newOrder = arrayMove(entreprises, oldIndex, newIndex);
    setEntreprises(newOrder);

    // Save new order
    try {
      await supabase
        .from('tournees')
        .update({ ordre_optimise: newOrder.map(e => e.id) })
        .eq('id', tourneeId);

      toast({
        title: "Ordre mis à jour",
        duration: 2000,
      });
    } catch (error) {
      console.error('Error updating order:', error);
    }
  };

  const handleNavigateFullRoute = (app: 'google' | 'waze') => {
    const waypoints = entreprises.filter(e => e.latitude && e.longitude);
    if (waypoints.length === 0) return;

    const origin = initialPointDepartLat && initialPointDepartLng
      ? { lat: initialPointDepartLat, lng: initialPointDepartLng }
      : { lat: waypoints[0].latitude!, lng: waypoints[0].longitude! };

    let url: string;
    if (app === 'google') {
      const destination = waypoints[waypoints.length - 1];
      const waypointsStr = waypoints
        .slice(0, -1)
        .map(w => `${w.latitude},${w.longitude}`)
        .join('|');

      url = `https://www.google.com/maps/dir/?api=1&origin=${origin.lat},${origin.lng}&destination=${destination.latitude},${destination.longitude}&waypoints=${waypointsStr}&travelmode=driving`;
    } else {
      const first = waypoints[0];
      url = `https://waze.com/ul?ll=${first.latitude},${first.longitude}&navigate=yes`;
    }

    window.open(url, '_blank');
    setShowNavigationDialog(false);
  };

  const handleStartTournee = async () => {
    try {
      await supabase
        .from('tournees')
        .update({ statut: 'en_cours' })
        .eq('id', tourneeId);

      setStatut('en_cours');
      toast({ title: "Tournée démarrée", duration: 2000 });
      onUpdate?.();
    } catch (error) {
      console.error('Error starting tournee:', error);
    }
  };

  const handleCompleteTournee = async () => {
    try {
      await supabase
        .from('tournees')
        .update({ statut: 'terminee' })
        .eq('id', tourneeId);

      setStatut('terminee');
      toast({ title: "Tournée terminée", duration: 2000 });
      onUpdate?.();
    } catch (error) {
      console.error('Error completing tournee:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col gap-4 p-4 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          {onBack && (
            <Button variant="ghost" size="sm" onClick={onBack}>
              <X className="w-4 h-4" />
            </Button>
          )}
          <div>
            <h2 className="text-xl font-bold">{tourneeName}</h2>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Badge variant={statut === 'terminee' ? 'default' : 'secondary'}>
                {statut === 'planifiee' ? 'Planifiée' : statut === 'en_cours' ? 'En cours' : 'Terminée'}
              </Badge>
              <span>{Math.round(distanceTotaleKm)} km</span>
              <span>•</span>
              <span>{Math.floor(tempsEstimeMinutes / 60)}h{Math.round(tempsEstimeMinutes % 60).toString().padStart(2, '0')}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowNavigationDialog(true)}>
            <Navigation className="w-4 h-4 mr-2" />
            GPS
          </Button>
          {statut === 'planifiee' && (
            <Button onClick={handleStartTournee}>Démarrer</Button>
          )}
          {statut === 'en_cours' && (
            <Button onClick={handleCompleteTournee}>Terminer</Button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-0 overflow-hidden">
        {/* Liste des entreprises */}
        <Card className="glass-card border-accent/20 overflow-hidden flex flex-col">
          <CardHeader className="pb-2 shrink-0">
            <CardTitle className="text-sm flex items-center gap-2">
              <RouteIcon className="w-4 h-4 text-accent" />
              Itinéraire ({entreprises.length} arrêts)
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto p-3">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext items={entreprises.map(e => e.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-2">
                {entreprises.map((entreprise, index) => (
                    <SortableEntrepriseItem
                      key={entreprise.id}
                      entreprise={{ ...entreprise, latitude: entreprise.latitude || 0, longitude: entreprise.longitude || 0 }}
                      index={index}
                      onNavigate={(e) => {
                        window.open(`https://www.google.com/maps/dir/?api=1&destination=${e.latitude},${e.longitude}`, '_blank');
                      }}
                      onVisiteClick={() => {}}
                      onDelete={async (e) => {
                        const newOrder = entreprises.filter(ent => ent.id !== e.id);
                        setEntreprises(newOrder);
                        await supabase
                          .from('tournees')
                          .update({ ordre_optimise: newOrder.map(ent => ent.id) })
                          .eq('id', tourneeId);
                        toast({ title: "Arrêt supprimé", duration: 2000 });
                      }}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </CardContent>
        </Card>

        {/* Map */}
        <Card className="glass-card border-accent/20 overflow-hidden">
          <CardContent className="p-0 h-full">
            <TourneeMap
              entreprises={entreprises.filter(e => e.latitude && e.longitude).map(e => ({
                id: e.id,
                nom: e.nom,
                adresse: e.adresse || '',
                ville: e.ville || undefined,
                latitude: e.latitude!,
                longitude: e.longitude!
              }))}
              pointDepartLat={initialPointDepartLat}
              pointDepartLng={initialPointDepartLng}
            />
          </CardContent>
        </Card>
      </div>

      {/* Navigation Dialog */}
      {showNavigationDialog && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card max-w-sm w-full p-6 space-y-4">
            <h3 className="text-lg font-bold">Navigation GPS</h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleNavigateFullRoute('google')}
                className="flex flex-col items-center gap-3 p-4 rounded-lg border-2 border-accent/30 hover:border-accent hover:bg-accent/10 transition-all"
              >
                <MapPin className="w-10 h-10 text-accent" />
                <span className="font-semibold text-sm">Google Maps</span>
              </button>
              <button
                onClick={() => handleNavigateFullRoute('waze')}
                className="flex flex-col items-center gap-3 p-4 rounded-lg border-2 border-accent/30 hover:border-accent hover:bg-accent/10 transition-all"
              >
                <Navigation className="w-10 h-10 text-accent" />
                <span className="font-semibold text-sm">Waze</span>
              </button>
            </div>
            <Button variant="outline" onClick={() => setShowNavigationDialog(false)} className="w-full">
              Annuler
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};