import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Route, 
  MapPin, 
  Clock, 
  Calendar, 
  Navigation, 
  Save, 
  Trash2, 
  Play, 
  Loader2,
  Map as MapIconLucide,
  ArrowRight,
  TrendingUp,
  Plus,
  Locate
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { MapView } from "./MapView";
import type { Database } from "@/integrations/supabase/types";
import { TourneeFilters } from "./TourneeFilters";

type Entreprise = Database['public']['Tables']['entreprises']['Row'];

interface Tournee {
  id: string;
  nom: string;
  date_planifiee: string;
  statut: string;
  entreprises_ids: string[];
  ordre_optimise: string[];
  distance_totale_km: number;
  temps_estime_minutes: number;
  notes?: string;
  created_at: string;
  point_depart_lat?: number;
  point_depart_lng?: number;
}

export const TourneesView = () => {
  const [tournees, setTournees] = useState<Tournee[]>([]);
  const [loading, setLoading] = useState(true);
  const [optimizing, setOptimizing] = useState(false);
  const [optimizedResult, setOptimizedResult] = useState<any>(null);
  const [tourneeName, setTourneeName] = useState("");
  const [tourneeDate, setTourneeDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectedEntreprises, setSelectedEntreprises] = useState<Entreprise[]>([]);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [filters, setFilters] = useState({
    dateFrom: "2025-09-01",
    dateTo: "",
    categories: [] as string[],
    departments: [] as string[],
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchTournees();
  }, []);

  const fetchTournees = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('tournees')
        .select('*')
        .eq('user_id', user.id)
        .order('date_planifiee', { ascending: false });

      if (error) throw error;
      setTournees(data || []);
    } catch (error) {
      console.error('Error fetching tournees:', error);
    } finally {
      setLoading(false);
    }
  };

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
        description: "Sélectionnez au moins 2 entreprises pour optimiser une tournée",
        variant: "destructive",
      });
      return;
    }

    if (!tourneeName.trim()) {
      toast({
        title: "Nom requis",
        description: "Veuillez donner un nom à votre tournée",
        variant: "destructive",
      });
      return;
    }

    setOptimizing(true);
    try {
      // Récupérer la position actuelle
      let currentLocation = userLocation;
      try {
        currentLocation = await getUserLocation();
        setUserLocation(currentLocation);
      } catch (geoError) {
        console.log("Géolocalisation non disponible, utilisation sans point de départ");
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
        description: `${data.entreprises_ordonnees.length} visites • ${Math.round(data.distance_totale_km)} km • ${Math.round(data.temps_estime_minutes / 60)}h${Math.round(data.temps_estime_minutes % 60)}`,
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

      setTourneeName("");
      setTourneeDate(format(new Date(), 'yyyy-MM-dd'));
      fetchTournees();
      setSelectedEntreprises([]);
      setOptimizedResult(null);
      setIsSelecting(false);
    } catch (error) {
      console.error('Error saving tournee:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder la tournée",
        variant: "destructive",
      });
    }
  };

  const handleStartTournee = async (tournee: Tournee) => {
    try {
      const currentLocation = await getUserLocation();
      
      // Récupérer les entreprises dans l'ordre optimisé
      const { data: entreprisesData, error } = await supabase
        .from('entreprises')
        .select('*')
        .in('id', tournee.ordre_optimise);

      if (error) throw error;

      // Ordonner selon ordre_optimise
      const orderedEntreprises = tournee.ordre_optimise
        .map(id => entreprisesData?.find(e => e.id === id))
        .filter(Boolean);

      if (!orderedEntreprises.length) {
        toast({
          title: "Erreur",
          description: "Impossible de charger les entreprises de la tournée",
          variant: "destructive",
        });
        return;
      }

      // Construire l'URL Google Maps avec waypoints
      const origin = `${currentLocation.lat},${currentLocation.lng}`;
      const destination = `${orderedEntreprises[orderedEntreprises.length - 1].latitude},${orderedEntreprises[orderedEntreprises.length - 1].longitude}`;
      const waypoints = orderedEntreprises
        .slice(0, -1)
        .map(e => `${e.latitude},${e.longitude}`)
        .join('|');

      const url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&waypoints=${waypoints}&travelmode=driving`;
      
      window.open(url, '_blank', 'noopener,noreferrer');

      // Mettre à jour le statut
      await supabase
        .from('tournees')
        .update({ statut: 'en_cours' })
        .eq('id', tournee.id);

      fetchTournees();
      
      toast({
        title: "🚗 Navigation démarrée",
        description: "La tournée s'ouvre dans Google Maps",
      });
    } catch (error) {
      console.error('Error starting tournee:', error);
      toast({
        title: "Erreur",
        description: "Impossible de démarrer la navigation",
        variant: "destructive",
      });
    }
  };

  const handleDeleteTournee = async (id: string) => {
    try {
      const { error } = await supabase.from('tournees').delete().eq('id', id);
      if (error) throw error;

      toast({
        title: "Tournée supprimée",
        description: "La tournée a été supprimée",
      });
      fetchTournees();
    } catch (error) {
      console.error('Error deleting tournee:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la tournée",
        variant: "destructive",
      });
    }
  };

  const getStatutBadge = (statut: string) => {
    const config = {
      planifiee: { label: "Planifiée", variant: "secondary" as const },
      en_cours: { label: "En cours", variant: "default" as const },
      terminee: { label: "Terminée", variant: "outline" as const },
      annulee: { label: "Annulée", variant: "destructive" as const },
    };
    return config[statut as keyof typeof config] || config.planifiee;
  };

  const handleMapMarkerClick = (entreprise: Entreprise) => {
    if (!isSelecting) return;

    setSelectedEntreprises(prev => {
      const exists = prev.find(e => e.id === entreprise.id);
      if (exists) {
        return prev.filter(e => e.id !== entreprise.id);
      }
      return [...prev, entreprise];
    });
  };

  return (
    <div className="h-full flex flex-col gap-3 overflow-hidden">
      {/* Nouvelle tournée */}
      {!isSelecting && !optimizedResult && (
        <Card>
          <CardContent className="pt-4 pb-4">
            <Button onClick={() => setIsSelecting(true)} className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Créer une nouvelle tournée
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Mode sélection avec carte */}
      {isSelecting && (
        <div className="flex flex-col h-full gap-3 overflow-hidden">
          {/* En-tête compact */}
          <Card className="flex-shrink-0">
            <CardContent className="pt-4 pb-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold flex items-center gap-2">
                    <Route className="w-4 h-4 text-accent" />
                    Créer votre tournée
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Cliquez sur les entreprises pour les ajouter
                  </p>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => {
                    setIsSelecting(false);
                    setSelectedEntreprises([]);
                    setTourneeName("");
                    setTourneeDate(format(new Date(), 'yyyy-MM-dd'));
                  }}
                >
                  Annuler
                </Button>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <Input
                  placeholder="Nom de la tournée *"
                  value={tourneeName}
                  onChange={(e) => setTourneeName(e.target.value)}
                  className="text-sm"
                />
                <Input
                  type="date"
                  value={tourneeDate}
                  onChange={(e) => setTourneeDate(e.target.value)}
                  className="text-sm"
                />
              </div>

              <TourneeFilters filters={filters} setFilters={setFilters} />

              {selectedEntreprises.length > 0 && (
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {selectedEntreprises.length} sélectionnée(s)
                  </Badge>
                  <Button
                    onClick={handleOptimize}
                    disabled={optimizing || selectedEntreprises.length < 2 || !tourneeName.trim()}
                    size="sm"
                    className="ml-auto"
                  >
                    {optimizing ? (
                      <>
                        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                        Optimisation...
                      </>
                    ) : (
                      <>
                        <TrendingUp className="w-3 h-3 mr-1" />
                        Optimiser
                      </>
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Carte */}
          <div className="flex-1 min-h-0 rounded-lg overflow-hidden border border-accent/20">
            <MapView
              filters={filters}
              onEntrepriseSelect={handleMapMarkerClick}
              selectionMode={true}
              selectedEntreprises={selectedEntreprises}
              onToggleSelection={handleMapMarkerClick}
            />
          </div>
        </div>
      )}

      {/* Résultat optimisé */}
      {optimizedResult && (
        <div className="flex flex-col h-full gap-3 overflow-hidden">
          {/* Rapport de tournée */}
          <Card className="flex-shrink-0 border-accent/20 bg-gradient-to-br from-accent/5 to-transparent">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-accent" />
                Rapport de tournée optimisée
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Stats compactes */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-card p-3 rounded-lg border">
                  <div className="text-xs text-muted-foreground mb-1">Distance</div>
                  <div className="text-xl font-bold text-accent">
                    {Math.round(optimizedResult.distance_totale_km)} km
                  </div>
                </div>
                <div className="bg-card p-3 rounded-lg border">
                  <div className="text-xs text-muted-foreground mb-1">Temps trajet</div>
                  <div className="text-xl font-bold text-accent">
                    {Math.floor(optimizedResult.temps_estime_minutes / 60)}h
                    {Math.round(optimizedResult.temps_estime_minutes % 60).toString().padStart(2, '0')}
                  </div>
                </div>
                <div className="bg-card p-3 rounded-lg border">
                  <div className="text-xs text-muted-foreground mb-1">Prospects</div>
                  <div className="text-xl font-bold text-accent">
                    {optimizedResult.entreprises_ordonnees.length}
                  </div>
                </div>
              </div>

              {/* Détails supplémentaires */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-1 bg-muted/50 p-2 rounded">
                  <Clock className="w-3 h-3 text-muted-foreground" />
                  <span className="text-muted-foreground">Temps/visite:</span>
                  <span className="font-medium ml-auto">15 min</span>
                </div>
                <div className="flex items-center gap-1 bg-muted/50 p-2 rounded">
                  <Navigation className="w-3 h-3 text-muted-foreground" />
                  <span className="text-muted-foreground">Distance moy:</span>
                  <span className="font-medium ml-auto">
                    {Math.round(optimizedResult.distance_totale_km / (optimizedResult.entreprises_ordonnees.length || 1))} km
                  </span>
                </div>
              </div>

              <div className="bg-muted/50 p-2 rounded text-xs text-muted-foreground">
                💡 {optimizedResult.explication}
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSaveTournee} size="sm" className="flex-1">
                  <Save className="w-3 h-3 mr-1" />
                  Enregistrer
                </Button>
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setOptimizedResult(null);
                    setSelectedEntreprises([]);
                    setTourneeName("");
                    setTourneeDate(format(new Date(), 'yyyy-MM-dd'));
                    setIsSelecting(false);
                  }}
                >
                  Annuler
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Liste des entreprises scrollable */}
          <Card className="flex-1 min-h-0 flex flex-col">
            <CardHeader className="pb-3 flex-shrink-0">
              <CardTitle className="text-sm">Itinéraire optimisé</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 min-h-0 p-0">
              <ScrollArea className="h-full px-4">
                <div className="space-y-2 pb-4">
                  {optimizedResult.entreprises_ordonnees.map((e: Entreprise, idx: number) => (
                    <div key={e.id} className="flex items-center gap-2 p-2 bg-muted/30 rounded border border-accent/10">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold text-xs">
                        {idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">{e.nom}</div>
                        <div className="text-xs text-muted-foreground truncate">{e.ville} {e.code_postal}</div>
                      </div>
                      {idx < optimizedResult.entreprises_ordonnees.length - 1 && (
                        <ArrowRight className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Liste des tournées sauvegardées */}
      <Card className="flex-1 flex flex-col min-h-0">
        <CardHeader className="pb-3 flex-shrink-0">
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Mes tournées planifiées
          </CardTitle>
          <CardDescription className="text-xs">
            {tournees.length} tournée(s) enregistrée(s)
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 min-h-0 p-0">
          <ScrollArea className="h-full px-4">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-accent" />
              </div>
            ) : tournees.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Route className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Aucune tournée planifiée</p>
              </div>
            ) : (
              <div className="space-y-2 pb-4">
                {tournees.map((tournee) => {
                  const statutConfig = getStatutBadge(tournee.statut);
                  return (
                    <Card key={tournee.id} className="border-accent/20">
                      <CardContent className="pt-3 pb-3 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm truncate">{tournee.nom}</div>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Calendar className="w-3 h-3" />
                              {format(new Date(tournee.date_planifiee), 'dd/MM/yyyy')}
                            </div>
                          </div>
                          <Badge variant={statutConfig.variant} className="text-xs flex-shrink-0">
                            {statutConfig.label}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-1 text-xs">
                          <div className="flex items-center gap-1 bg-muted/30 p-1 rounded">
                            <MapPin className="w-3 h-3 text-muted-foreground" />
                            <span>{tournee.entreprises_ids.length}</span>
                          </div>
                          <div className="flex items-center gap-1 bg-muted/30 p-1 rounded">
                            <Navigation className="w-3 h-3 text-muted-foreground" />
                            <span>{Math.round(tournee.distance_totale_km)}km</span>
                          </div>
                          <div className="flex items-center gap-1 bg-muted/30 p-1 rounded">
                            <Clock className="w-3 h-3 text-muted-foreground" />
                            <span>{Math.floor(tournee.temps_estime_minutes / 60)}h{(tournee.temps_estime_minutes % 60).toString().padStart(2, '0')}</span>
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1 h-8 text-xs"
                            onClick={() => handleStartTournee(tournee)}
                          >
                            <Locate className="w-3 h-3 mr-1" />
                            Démarrer
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8"
                            onClick={() => handleDeleteTournee(tournee.id)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};
