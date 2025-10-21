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
import { MapView } from "./MapView";
import { cn } from "@/lib/utils";
import {
  Navigation,
  MapPin,
  Smile,
  CheckCircle2,
  AlertCircle,
  Map as MapIconLucide,
  Clock,
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
  telephone?: string;
  siret: string;
  date_demarrage: string;
  code_naf: string;
};

interface TourneeRouteDisplayProps {
  tourneeId: string;
  ordreOptimise: string[];
  distanceTotaleKm: number;
  tempsEstimeMinutes: number;
  pointDepartLat?: number;
  pointDepartLng?: number;
  statut: string;
  notes?: string;
  heureDebut?: string;
  onUpdate?: () => void;
}

export const TourneeRouteDisplay = ({
  tourneeId,
  ordreOptimise: initialOrdre,
  distanceTotaleKm: initialDistance,
  tempsEstimeMinutes: initialTemps,
  pointDepartLat,
  pointDepartLng,
  statut: initialStatut,
  onUpdate,
}: TourneeRouteDisplayProps) => {
  const [entreprises, setEntreprises] = useState<Entreprise[]>([]);
  const [loading, setLoading] = useState(true);
  const [statut, setStatut] = useState(initialStatut);
  const [showNavigationDialog, setShowNavigationDialog] = useState(false);
  const [showVisiteDialog, setShowVisiteDialog] = useState(false);
  const [showCompletionDialog, setShowCompletionDialog] = useState(false);
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

  const recalculateRoute = async (newOrder: Entreprise[]) => {
    try {
      const { data, error } = await supabase.functions.invoke('optimize-tournee', {
        body: {
          entreprises: newOrder,
          point_depart: pointDepartLat && pointDepartLng ? {
            lat: pointDepartLat,
            lng: pointDepartLng
          } : null,
        },
      });

      if (error) throw error;

      setDistanceTotaleKm(data.distance_totale_km);
      setTempsEstimeMinutes(data.temps_estime_minutes);

      await supabase
        .from('tournees')
        .update({
          ordre_optimise: newOrder.map(e => e.id),
          distance_totale_km: data.distance_totale_km,
          temps_estime_minutes: data.temps_estime_minutes,
        })
        .eq('id', tourneeId);

      onUpdate?.();
    } catch (error) {
      console.error('Error recalculating route:', error);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setEntreprises((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        const newOrder = arrayMove(items, oldIndex, newIndex);
        recalculateRoute(newOrder);
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
      await recalculateRoute(newEntreprises);

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

  const handleNavigateFullRoute = (app: 'google' | 'waze') => {
    const waypoints = entreprises.map(e => ({
      lat: e.latitude,
      lng: e.longitude,
      name: e.nom
    }));

    if (waypoints.length === 0) return;

    let url: string;
    if (app === 'google') {
      // Google Maps: origin, waypoints, destination
      const origin = pointDepartLat && pointDepartLng 
        ? `${pointDepartLat},${pointDepartLng}`
        : `${waypoints[0].lat},${waypoints[0].lng}`;
      
      const destination = waypoints[waypoints.length - 1];
      const waypointsStr = waypoints
        .slice(0, -1)
        .map(w => `${w.lat},${w.lng}`)
        .join('|');

      url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination.lat},${destination.lng}&waypoints=${waypointsStr}&travelmode=driving`;
    } else {
      // Waze: seulement la première destination (limitation de Waze)
      const first = waypoints[0];
      url = `https://waze.com/ul?ll=${first.lat},${first.lng}&navigate=yes`;
    }

    window.open(url, '_blank');
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
    <div className="grid grid-cols-1 lg:grid-cols-[1fr,340px] gap-4 h-full">
      {/* Carte à gauche avec border améliorée */}
      <div className="relative h-full rounded-xl overflow-hidden border border-accent/30 shadow-lg shadow-accent/5">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-accent/5 pointer-events-none" />
        <MapView
          filters={{
            dateFrom: "",
            dateTo: "",
            categories: [],
            departments: []
          }}
          tourneeRoute={{
            entreprises,
            pointDepartLat,
            pointDepartLng
          }}
        />
      </div>

      {/* Liste à droite - style sexy */}
      <Card className="border-accent/30 h-full flex flex-col bg-gradient-to-br from-card/95 to-card/80 backdrop-blur-sm shadow-lg shadow-accent/5">
        <CardHeader className="pb-3 px-4 pt-4 shrink-0 border-b border-accent/10">
          <div className="flex items-center justify-between mb-2">
            <CardTitle className="text-base font-bold gradient-text flex items-center gap-2">
              <div className="p-2 bg-accent/10 rounded-lg">
                <MapPin className="w-4 h-4 text-accent" />
              </div>
              {entreprises.length} arrêts
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleNavigateFullRoute('google')}
                className="h-7 px-2 text-xs border-accent/30 hover:border-accent hover:bg-accent/10"
                title="Ouvrir l'itinéraire complet dans Google Maps"
              >
                <MapIconLucide className="w-3.5 h-3.5 mr-1" />
                <span className="hidden sm:inline">GPS</span>
              </Button>
              <Badge variant={statusConfig.variant} className="text-xs shadow-sm">
                {statusConfig.label}
              </Badge>
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
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col gap-3 px-4 pb-4 overflow-hidden">
          {/* Liste avec drag & drop stylée */}
          <div className="flex-1 overflow-y-auto -mx-2 px-2">
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
              className="relative w-full h-12 text-base font-semibold shrink-0 bg-gradient-to-r from-accent via-accent to-accent/80 hover:shadow-lg hover:shadow-accent/30 transition-all duration-300 group overflow-hidden"
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
                  if (checked) setARevoir(false);
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
