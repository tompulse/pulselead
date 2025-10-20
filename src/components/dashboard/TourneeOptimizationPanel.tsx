import { useState } from "react";
import * as React from "react";
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

  // Auto-optimize on mount
  React.useEffect(() => {
    if (selectedEntreprises.length >= 2 && !optimizedResult) {
      handleOptimize();
    }
  }, []);

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

      // Check for duplicate tournee name
      const { data: existingTournee } = await supabase
        .from('tournees')
        .select('id')
        .eq('user_id', user.id)
        .eq('nom', tourneeName)
        .maybeSingle();

      if (existingTournee) {
        toast({
          title: "Nom déjà utilisé",
          description: "Une tournée avec ce nom existe déjà",
          variant: "destructive",
        });
        return;
      }

      // Check if any selected entreprise is already in another tournee
      const { data: existingTournees } = await supabase
        .from('tournees')
        .select('entreprises_ids')
        .eq('user_id', user.id);

      const allExistingEntrepriseIds = existingTournees?.flatMap(t => t.entreprises_ids || []) || [];
      const selectedIds = selectedEntreprises.map(e => e.id);
      const duplicates = selectedIds.filter(id => allExistingEntrepriseIds.includes(id));

      if (duplicates.length > 0) {
        const duplicateNames = selectedEntreprises
          .filter(e => duplicates.includes(e.id))
          .map(e => e.nom)
          .join(', ');
        
        toast({
          title: "Prospects déjà planifiés",
          description: `Ces entreprises sont déjà dans une autre tournée: ${duplicateNames}`,
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase.from('tournees').insert({
        user_id: user.id,
        nom: tourneeName,
        date_planifiee: tourneeDate,
        entreprises_ids: selectedIds,
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
        {optimizing ? (
          <div className="text-center py-8 space-y-3">
            <Loader2 className="w-12 h-12 mx-auto animate-spin text-accent" />
            <p className="text-sm text-muted-foreground">
              Optimisation en cours...
            </p>
          </div>
        ) : optimizedResult ? (
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

            {/* Itinéraire visuel avec design sexy */}
            <div className="relative bg-gradient-to-br from-accent/5 via-accent/10 to-accent/5 p-6 rounded-xl border border-accent/20 overflow-hidden">
              {/* Fond décoratif */}
              <div className="absolute inset-0 opacity-10">
                <svg className="w-full h-full" viewBox="0 0 400 200">
                  <defs>
                    <linearGradient id="roadGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="hsl(190 95% 60%)" stopOpacity="0.3" />
                      <stop offset="50%" stopColor="hsl(190 95% 70%)" stopOpacity="0.6" />
                      <stop offset="100%" stopColor="hsl(190 95% 60%)" stopOpacity="0.3" />
                    </linearGradient>
                  </defs>
                  <path 
                    d="M 0 100 Q 100 50, 200 100 T 400 100" 
                    stroke="url(#roadGradient)" 
                    strokeWidth="4" 
                    fill="none"
                    strokeDasharray="8 4"
                  />
                </svg>
              </div>

              <div className="relative space-y-3">
                {/* Header avec voiture */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-accent/20 p-2 rounded-lg border border-accent/30">
                    <span className="text-2xl">🚗</span>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-accent">Itinéraire optimisé</h3>
                    <p className="text-xs text-muted-foreground">
                      {optimizedResult.entreprises_ordonnees.length} arrêts planifiés
                    </p>
                  </div>
                </div>

                {/* Liste des entreprises */}
                <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-2">
                  {optimizedResult.entreprises_ordonnees.map((entreprise: any, index: number) => (
                    <div 
                      key={entreprise.id} 
                      className="flex items-center gap-3 bg-card/60 backdrop-blur-sm p-3 rounded-lg border border-accent/10 hover:border-accent/30 transition-all group"
                    >
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-accent to-cyan-glow flex items-center justify-center text-xs font-bold text-primary shadow-lg">
                          {index + 1}
                        </div>
                        {index < optimizedResult.entreprises_ordonnees.length - 1 && (
                          <div className="h-8 w-0.5 bg-gradient-to-b from-accent/60 to-transparent ml-3"></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate group-hover:text-accent transition-colors">
                          {entreprise.nom}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {entreprise.ville || entreprise.adresse}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Explication IA */}
                <div className="mt-4 p-3 bg-accent/5 rounded-lg border border-accent/20">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    💡 {optimizedResult.explication}
                  </p>
                </div>
              </div>
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
        ) : null}
      </CardContent>
    </Card>
  );
};
