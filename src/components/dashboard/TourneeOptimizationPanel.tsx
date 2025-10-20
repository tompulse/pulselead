import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Route, 
  Clock, 
  Navigation, 
  Save, 
  Loader2,
  TrendingUp,
  X,
  MapPin
} from "lucide-react";
import { format } from "date-fns";
import type { Database } from "@/integrations/supabase/types";

type Entreprise = Database['public']['Tables']['entreprises']['Row'];

interface TourneeOptimizationPanelProps {
  selectedEntreprises: Entreprise[];
  tourneeName: string;
  tourneeDate: string;
  onClose: () => void;
  onSave: () => void;
}

export const TourneeOptimizationPanel = ({ 
  selectedEntreprises,
  tourneeName,
  tourneeDate,
  onClose,
  onSave 
}: TourneeOptimizationPanelProps) => {
  const [optimizing, setOptimizing] = useState(false);
  const [optimizedResult, setOptimizedResult] = useState<any>(null);
  const { toast } = useToast();

  const getUserLocation = (): Promise<{lat: number, lng: number}> => {
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
        }
      );
    });
  };

  const handleOptimize = async () => {
    if (selectedEntreprises.length < 2) {
      toast({
        title: "Sélection insuffisante",
        description: "Sélectionnez au moins 2 entreprises",
        variant: "destructive",
      });
      return;
    }

    setOptimizing(true);
    try {
      let currentLocation = null;
      try {
        currentLocation = await getUserLocation();
      } catch (geoError) {
        console.log("Géolocalisation non disponible");
      }

      const { data, error } = await supabase.functions.invoke('optimize-tournee', {
        body: {
          entreprises: selectedEntreprises,
          point_depart: currentLocation,
        },
      });

      if (error) throw error;

      setOptimizedResult({
        ...data,
        point_depart: currentLocation
      });
      
      toast({
        title: "🎯 Tournée optimisée !",
        description: `${data.entreprises_ordonnees.length} visites • ${Math.round(data.distance_totale_km)} km`,
      });
    } catch (error) {
      console.error('Error optimizing tournee:', error);
      toast({
        title: "Erreur d'optimisation",
        description: "Impossible d'optimiser la tournée",
        variant: "destructive",
      });
    } finally {
      setOptimizing(false);
    }
  };

  const handleSaveTournee = async () => {
    if (!optimizedResult || !tourneeName) {
      toast({
        title: "Informations manquantes",
        description: "Veuillez renseigner le nom de la tournée",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { error } = await supabase.from('tournees').insert({
        user_id: user.id,
        nom: tourneeName,
        date_planifiee: tourneeDate,
        entreprises_ids: selectedEntreprises.map(e => e.id),
        ordre_optimise: optimizedResult.ordre_optimise,
        distance_totale_km: optimizedResult.distance_totale_km,
        temps_estime_minutes: optimizedResult.temps_estime_minutes,
        point_depart_lat: optimizedResult.point_depart?.lat,
        point_depart_lng: optimizedResult.point_depart?.lng,
        notes: null,
        statut: 'planifiee',
      });

      if (error) throw error;

      toast({
        title: "✅ Tournée enregistrée",
        description: "La tournée a été sauvegardée avec succès",
      });

      onSave();
    } catch (error) {
      console.error('Error saving tournee:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder la tournée",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full max-w-2xl border-accent/20 bg-gradient-to-br from-accent/5 to-transparent shadow-2xl">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Route className="w-5 h-5 text-accent" />
            {optimizedResult ? "Tournée optimisée" : "Nouvelle tournée"}
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {!optimizedResult ? (
          <>
            <div className="text-center space-y-2">
              <Badge variant="secondary" className="text-sm px-3 py-1">
                {selectedEntreprises.length} entreprise(s) sélectionnée(s)
              </Badge>
              <p className="text-sm text-muted-foreground">
                Cliquez sur Optimiser pour calculer le meilleur itinéraire
              </p>
            </div>

            <Button
              onClick={handleOptimize}
              disabled={optimizing || selectedEntreprises.length < 2}
              className="w-full h-12 text-base"
              size="lg"
            >
              {optimizing ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Optimisation en cours...
                </>
              ) : (
                <>
                  <TrendingUp className="w-5 h-5 mr-2" />
                  Optimiser avec l'IA
                </>
              )}
            </Button>
          </>
        ) : (
          <>
            {/* Stats en grille */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-card p-4 rounded-lg border border-accent/20 text-center">
                <Navigation className="w-8 h-8 mx-auto mb-2 text-accent" />
                <div className="text-2xl font-bold text-accent">
                  {Math.round(optimizedResult.distance_totale_km)} km
                </div>
                <div className="text-xs text-muted-foreground">Distance totale</div>
              </div>
              <div className="bg-card p-4 rounded-lg border border-accent/20 text-center">
                <Clock className="w-8 h-8 mx-auto mb-2 text-accent" />
                <div className="text-2xl font-bold text-accent">
                  {Math.floor(optimizedResult.temps_estime_minutes / 60)}h
                  {Math.round(optimizedResult.temps_estime_minutes % 60).toString().padStart(2, '0')}
                </div>
                <div className="text-xs text-muted-foreground">Temps total</div>
              </div>
              <div className="bg-card p-4 rounded-lg border border-accent/20 text-center">
                <MapPin className="w-8 h-8 mx-auto mb-2 text-accent" />
                <div className="text-2xl font-bold text-accent">
                  {optimizedResult.entreprises_ordonnees.length}
                </div>
                <div className="text-xs text-muted-foreground">Prospects</div>
              </div>
            </div>

            {/* Détails */}
            <div className="bg-muted/30 p-3 rounded-lg border border-accent/10">
              <p className="text-sm text-muted-foreground leading-relaxed">
                💡 {optimizedResult.explication}
              </p>
            </div>

            {/* Boutons d'action */}
            <div className="flex gap-3">
              <Button onClick={handleSaveTournee} className="flex-1 h-11" disabled={!tourneeName.trim()}>
                <Save className="w-4 h-4 mr-2" />
                Enregistrer la tournée
              </Button>
              <Button 
                variant="outline"
                onClick={() => setOptimizedResult(null)}
                className="h-11"
              >
                Modifier
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
