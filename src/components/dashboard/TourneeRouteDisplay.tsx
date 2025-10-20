import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { MapView } from "./MapView";
import {
  Navigation,
  Clock,
  Phone,
  ExternalLink,
} from "lucide-react";

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
  distanceTotaleKm,
  tempsEstimeMinutes,
  pointDepartLat,
  pointDepartLng,
  statut: initialStatut,
  onUpdate,
}: TourneeRouteDisplayProps) => {
  const [entreprises, setEntreprises] = useState<Entreprise[]>([]);
  const [loading, setLoading] = useState(true);
  const [statut, setStatut] = useState(initialStatut);
  const { toast } = useToast();

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

  const handlePhoneCall = (telephone: string) => {
    window.location.href = `tel:${telephone}`;
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

      {/* Liste simple des arrêts */}
      <Card className="border-accent/20 flex flex-col">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-bold">{entreprises.length} arrêts</CardTitle>
            <Badge variant={statusConfig.variant}>
              {statusConfig.label}
            </Badge>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
            <span className="flex items-center gap-1">
              <Navigation className="w-4 h-4" />
              {Math.round(distanceTotaleKm)} km
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {Math.floor(tempsEstimeMinutes / 60)}h{Math.round(tempsEstimeMinutes % 60).toString().padStart(2, '0')}
            </span>
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col gap-4">
          {/* Liste des arrêts */}
          <ScrollArea className="flex-1">
            <div className="space-y-2 pr-3">
              {entreprises.map((entreprise, index) => (
                <div
                  key={entreprise.id}
                  className="flex gap-3 p-3 bg-card/60 rounded-lg border border-accent/10 hover:border-accent/30 transition-all"
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-sm font-bold text-accent">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm mb-1">{entreprise.nom}</div>
                    <div className="text-xs text-muted-foreground mb-2">
                      {entreprise.adresse}, {entreprise.code_postal} {entreprise.ville}
                    </div>
                    {entreprise.telephone && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handlePhoneCall(entreprise.telephone!)}
                        className="h-7 px-2 text-xs"
                      >
                        <Phone className="w-3 h-3 mr-1" />
                        {entreprise.telephone}
                      </Button>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${entreprise.latitude},${entreprise.longitude}`, '_blank')}
                    className="flex-shrink-0"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* Bouton navigation */}
          <Button 
            onClick={handleStartNavigation} 
            size="lg"
            className="w-full h-14 text-base font-semibold"
          >
            <Navigation className="w-5 h-5 mr-2" />
            Lancer la navigation
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};