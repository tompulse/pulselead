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

      // Check for duplicate tournee name AND date
      const { data: existingTournee } = await supabase
        .from('tournees')
        .select('id')
        .eq('user_id', user.id)
        .eq('nom', tourneeName)
        .eq('date_planifiee', tourneeDate)
        .maybeSingle();

      if (existingTournee) {
        toast({
          title: "Tournée déjà existante",
          description: "Une tournée avec ce nom existe déjà pour cette date",
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
    <Card className="w-full max-w-md border-accent/20 bg-card/80 backdrop-blur-xl shadow-xl">
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
            {/* Stats compactes */}
            <div className="flex items-center justify-around py-3 px-2 bg-accent/5 rounded-lg border border-accent/20">
              <div className="text-center">
                <div className="text-lg font-bold text-accent">{Math.round(optimizedResult.distance_totale_km)} km</div>
                <div className="text-[10px] text-muted-foreground">Distance</div>
              </div>
              <div className="h-8 w-px bg-accent/20"></div>
              <div className="text-center">
                <div className="text-lg font-bold text-accent">
                  {Math.floor(optimizedResult.temps_estime_minutes / 60)}h{Math.round(optimizedResult.temps_estime_minutes % 60).toString().padStart(2, '0')}
                </div>
                <div className="text-[10px] text-muted-foreground">Durée</div>
              </div>
              <div className="h-8 w-px bg-accent/20"></div>
              <div className="text-center">
                <div className="text-lg font-bold text-accent">{optimizedResult.entreprises_ordonnees.length}</div>
                <div className="text-[10px] text-muted-foreground">Arrêts</div>
              </div>
            </div>

            {/* Liste des entreprises épurée */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 mb-2">
                <Route className="w-4 h-4 text-accent" />
                <h3 className="text-sm font-semibold text-foreground">Itinéraire</h3>
              </div>
              <div className="space-y-1.5 max-h-64 overflow-y-auto custom-scrollbar pr-1">
                {optimizedResult.entreprises_ordonnees.map((entreprise: any, index: number) => (
                  <div 
                    key={entreprise.id} 
                    className="flex gap-2 p-2 rounded-lg border border-accent/10 bg-card/40 hover:bg-card/60 transition-colors"
                  >
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center text-xs font-bold text-accent">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0 space-y-0.5">
                      <p className="text-sm font-medium text-foreground truncate">
                        {entreprise.nom}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {entreprise.adresse && entreprise.code_postal && entreprise.ville 
                          ? `${entreprise.adresse}, ${entreprise.code_postal} ${entreprise.ville}`
                          : entreprise.ville || entreprise.adresse || 'Adresse non disponible'
                        }
                      </p>
                      {entreprise.telephone && (
                        <p className="text-xs text-accent font-medium">📞 {entreprise.telephone}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Boutons d'action */}
            <div className="flex gap-2">
              <Button onClick={handleSaveTournee} className="flex-1 h-10" disabled={!tourneeName.trim()}>
                <Save className="w-4 h-4 mr-2" />
                Enregistrer
              </Button>
              <Button 
                variant="outline"
                onClick={() => setOptimizedResult(null)}
                className="h-10 px-3"
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
