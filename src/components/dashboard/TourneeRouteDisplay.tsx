import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { MapView } from "./MapView";
import {
  MapPin,
  ArrowRight,
  Navigation,
  Clock,
  Phone,
  Save,
  Trash2,
  GripVertical,
  ExternalLink,
  Play,
  CheckCircle2,
  XCircle
} from "lucide-react";
import { format, addMinutes } from "date-fns";
import { fr } from "date-fns/locale";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

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

interface SortableStopProps {
  entreprise: Entreprise;
  index: number;
  estimatedTime?: string;
  distance?: number;
}

const SortableStop = ({ entreprise, index, estimatedTime, distance }: SortableStopProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: entreprise.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-start gap-3 p-3 bg-card rounded-lg border border-accent/20 hover:border-accent/40 transition-colors"
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing pt-1"
      >
        <GripVertical className="w-4 h-4 text-muted-foreground" />
      </div>
      
      <div className="flex-shrink-0">
        <div className="w-8 h-8 rounded-full bg-accent text-primary flex items-center justify-center font-bold text-sm">
          {index + 1}
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="font-semibold text-sm truncate">{entreprise.nom}</div>
        <div className="text-xs text-muted-foreground mt-0.5">
          {entreprise.adresse}, {entreprise.code_postal} {entreprise.ville}
        </div>
        {estimatedTime && (
          <div className="flex items-center gap-2 mt-1.5 text-xs">
            <Clock className="w-3 h-3 text-accent" />
            <span className="text-accent font-medium">{estimatedTime}</span>
            {distance && (
              <>
                <ArrowRight className="w-3 h-3 text-muted-foreground" />
                <span className="text-muted-foreground">{distance.toFixed(1)} km</span>
              </>
            )}
          </div>
        )}
        {entreprise.telephone && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 mt-1 text-xs"
            onClick={() => window.open(`tel:${entreprise.telephone}`, '_blank')}
          >
            <Phone className="w-3 h-3 mr-1" />
            {entreprise.telephone}
          </Button>
        )}
      </div>

      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0"
        onClick={() => {
          const url = `https://www.google.com/maps/search/?api=1&query=${entreprise.latitude},${entreprise.longitude}`;
          window.open(url, '_blank');
        }}
      >
        <ExternalLink className="w-4 h-4" />
      </Button>
    </div>
  );
};

export const TourneeRouteDisplay = ({
  tourneeId,
  ordreOptimise: initialOrdre,
  distanceTotaleKm,
  tempsEstimeMinutes,
  pointDepartLat,
  pointDepartLng,
  statut: initialStatut,
  notes: initialNotes,
  heureDebut: initialHeureDebut,
  onUpdate,
}: TourneeRouteDisplayProps) => {
  const [entreprises, setEntreprises] = useState<Entreprise[]>([]);
  const [ordreOptimise, setOrdreOptimise] = useState<string[]>(initialOrdre);
  const [loading, setLoading] = useState(true);
  const [statut, setStatut] = useState(initialStatut);
  const [notes, setNotes] = useState(initialNotes || "");
  const [heureDebut, setHeureDebut] = useState(initialHeureDebut || "09:00");
  const [saving, setSaving] = useState(false);
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
        .from('entreprises')
        .select('*')
        .in('id', initialOrdre);

      if (error) throw error;

      // Ordonner selon ordre_optimise
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

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setEntreprises((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        const newOrder = arrayMove(items, oldIndex, newIndex);
        setOrdreOptimise(newOrder.map(e => e.id));
        return newOrder;
      });
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('tournees')
        .update({
          ordre_optimise: ordreOptimise,
          notes,
          heure_debut: heureDebut,
          statut,
        })
        .eq('id', tourneeId);

      if (error) throw error;

      toast({
        title: "✅ Modifications enregistrées",
        description: "La tournée a été mise à jour",
      });
      onUpdate?.();
    } catch (error) {
      console.error('Error saving:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'enregistrer les modifications",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleStartNavigation = async () => {
    try {
      const origin = pointDepartLat && pointDepartLng
        ? `${pointDepartLat},${pointDepartLng}`
        : `${entreprises[0].latitude},${entreprises[0].longitude}`;

      const destination = `${entreprises[entreprises.length - 1].latitude},${entreprises[entreprises.length - 1].longitude}`;
      
      const waypoints = entreprises
        .slice(pointDepartLat && pointDepartLng ? 0 : 1, -1)
        .map(e => `${e.latitude},${e.longitude}`)
        .join('|');

      const url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&waypoints=${waypoints}&travelmode=driving`;
      
      window.open(url, '_blank');

      // Update status to en_cours if planifiee
      if (statut === 'planifiee') {
        await supabase
          .from('tournees')
          .update({ statut: 'en_cours' })
          .eq('id', tourneeId);
        setStatut('en_cours');
        onUpdate?.();
      }

      toast({
        title: "🚗 Navigation démarrée",
        description: "La tournée s'ouvre dans Google Maps",
      });
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Erreur",
        description: "Impossible de démarrer la navigation",
        variant: "destructive",
      });
    }
  };

  const getEstimatedTime = (index: number) => {
    if (!heureDebut) return undefined;
    
    const [hours, minutes] = heureDebut.split(':').map(Number);
    const startTime = new Date();
    startTime.setHours(hours, minutes, 0);
    
    // 15 min par visite + temps de trajet cumulé
    const avgTimePerStop = tempsEstimeMinutes / entreprises.length;
    const totalMinutes = index * (15 + avgTimePerStop);
    
    const estimatedTime = addMinutes(startTime, totalMinutes);
    return format(estimatedTime, 'HH:mm');
  };

  const getDistanceBetween = (index: number) => {
    if (index === 0) return undefined;
    return distanceTotaleKm / (entreprises.length - 1);
  };

  const getStatutConfig = (s: string) => {
    const configs: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive"; icon: any }> = {
      planifiee: { label: "Planifiée", variant: "secondary", icon: Clock },
      en_cours: { label: "En cours", variant: "default", icon: Play },
      terminee: { label: "Terminée", variant: "outline", icon: CheckCircle2 },
      annulee: { label: "Annulée", variant: "destructive", icon: XCircle },
    };
    return configs[s] || configs.planifiee;
  };

  const statusConfig = getStatutConfig(statut);
  const StatusIcon = statusConfig.icon;

  if (loading) {
    return <div className="p-4 text-center text-muted-foreground">Chargement...</div>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full">
      {/* Carte interactive */}
      <div className="h-full min-h-[500px]">
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

      {/* Détails de la tournée */}
      <Card className="border-accent/20 flex flex-col">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-4">
            <CardTitle className="text-base flex items-center gap-2">
              <Navigation className="w-4 h-4 text-accent" />
              Itinéraire détaillé
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant={statusConfig.variant} className="flex items-center gap-1">
                <StatusIcon className="w-3 h-3" />
                {statusConfig.label}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 flex-1 overflow-auto">
          {/* Configuration */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="heure-debut" className="text-xs">Heure de début</Label>
              <Input
                id="heure-debut"
                type="time"
                value={heureDebut}
                onChange={(e) => setHeureDebut(e.target.value)}
                className="h-8 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="statut" className="text-xs">Statut</Label>
              <select
                id="statut"
                value={statut}
                onChange={(e) => setStatut(e.target.value)}
                className="h-8 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="planifiee">Planifiée</option>
                <option value="en_cours">En cours</option>
                <option value="terminee">Terminée</option>
                <option value="annulee">Annulée</option>
              </select>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label htmlFor="notes" className="text-xs">Notes / Objectifs</Label>
            <Textarea
              id="notes"
              placeholder="Ajoutez vos notes, objectifs ou remarques..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[60px] text-sm resize-none"
            />
          </div>

          <Separator />

          {/* Point de départ */}
          {pointDepartLat && pointDepartLng && (
            <div className="flex items-center gap-3 p-3 bg-accent/5 rounded-lg border border-accent/20">
              <MapPin className="w-5 h-5 text-accent" />
              <div className="flex-1">
                <div className="font-medium text-sm">Point de départ</div>
                <div className="text-xs text-muted-foreground">Votre position</div>
              </div>
              {heureDebut && (
                <div className="text-xs text-accent font-medium">{heureDebut}</div>
              )}
            </div>
          )}

          {/* Liste des arrêts */}
          <div className="space-y-2">
            <div className="text-sm font-medium flex items-center justify-between">
              <span>{entreprises.length} arrêts prévus</span>
              <span className="text-xs text-muted-foreground">Glissez pour réorganiser</span>
            </div>
            
            <ScrollArea className="h-[300px] pr-3">
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
                      <SortableStop
                        key={entreprise.id}
                        entreprise={entreprise}
                        index={index}
                        estimatedTime={getEstimatedTime(index)}
                        distance={getDistanceBetween(index)}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            </ScrollArea>
          </div>

          <Separator />

          {/* Actions */}
          <div className="flex gap-2">
            <Button onClick={handleStartNavigation} className="flex-1">
              <Navigation className="w-4 h-4 mr-2" />
              Démarrer la navigation
            </Button>
            <Button onClick={handleSave} variant="outline" disabled={saving}>
              <Save className="w-4 h-4 mr-2" />
              {saving ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
