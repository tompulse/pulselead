import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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
    <div className="grid grid-cols-1 lg:grid-cols-[1fr,380px] gap-4 h-full">
      {/* Carte - prend tout l'espace disponible */}
      <div className="h-full min-h-[400px]">
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

      {/* Liste ultra-simple - colonne fixe à droite */}
      <Card className="border-accent/20 h-full flex flex-col">
        <CardHeader className="pb-3 shrink-0">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-bold">{entreprises.length} arrêts</CardTitle>
            <Badge variant={statusConfig.variant} className="text-xs">
              {statusConfig.label}
            </Badge>
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
            <span>{Math.round(distanceTotaleKm)} km</span>
            <span>•</span>
            <span>{Math.floor(tempsEstimeMinutes / 60)}h{Math.round(tempsEstimeMinutes % 60).toString().padStart(2, '0')}</span>
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col gap-3 p-4 overflow-hidden">
          {/* Liste simple avec scroll automatique si nécessaire */}
          <div className="flex-1 overflow-y-auto -mx-2 px-2">
            <div className="space-y-1.5">
              {entreprises.map((entreprise, index) => (
                <div
                  key={entreprise.id}
                  className="flex items-center gap-2 p-2 rounded hover:bg-accent/5 transition-colors"
                >
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center text-xs font-bold text-accent">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{entreprise.nom}</div>
                    <div className="text-xs text-muted-foreground truncate">
                      {entreprise.ville}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bouton fixe en bas */}
          <Button 
            onClick={handleStartNavigation} 
            size="lg"
            className="w-full h-12 text-base font-semibold shrink-0"
          >
            <Navigation className="w-5 h-5 mr-2" />
            Démarrer la prospection
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};