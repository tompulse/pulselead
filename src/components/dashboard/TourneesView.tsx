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
  Locate,
  List,
  Edit2,
  Check,
  X,
  CalendarDays
} from "lucide-react";
import { DatePicker } from "@/components/ui/date-picker";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { MapView } from "./MapView";
import { ListView } from "./ListView";
import type { Database } from "@/integrations/supabase/types";
import { TourneeFilters } from "./TourneeFilters";
import { TourneeRouteDisplay } from "./TourneeRouteDisplay";

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
  const [selectedTournee, setSelectedTournee] = useState<Tournee | null>(null);
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [editingTournee, setEditingTournee] = useState<Tournee | null>(null);
  const [editedName, setEditedName] = useState("");
  const [editedDate, setEditedDate] = useState<Date | undefined>(undefined);
  const [filters, setFilters] = useState({
    dateFrom: "",
    dateTo: "",
    categories: [] as string[],
    departments: [] as string[],
    formesJuridiques: [] as string[],
    searchQuery: "",
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
        duration: 3000,
      });
      return;
    }

    if (!tourneeName.trim()) {
      toast({
        title: "Nom requis",
        description: "Veuillez donner un nom à votre tournée",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    setOptimizing(true);
    try {
      // Étape 1: Géocoder les entreprises sans coordonnées GPS
      const entreprisesToGeocode = selectedEntreprises.filter(e => !e.latitude || !e.longitude);
      
      if (entreprisesToGeocode.length > 0) {
        toast({
          title: "📍 Géocodage en cours...",
          description: `Recherche des coordonnées GPS pour ${entreprisesToGeocode.length} entreprise(s)...`,
          duration: 3000,
        });

        // Géocoder chaque entreprise manquante
        for (const entreprise of entreprisesToGeocode) {
          try {
            const { data: geoData, error: geoError } = await supabase.functions.invoke('geocode-entreprise', {
              body: {
                adresse: entreprise.adresse,
                ville: entreprise.ville,
                code_postal: entreprise.code_postal
              }
            });

            if (!geoError && geoData?.latitude && geoData?.longitude) {
              // Mettre à jour les coordonnées dans la base de données
              await supabase
                .from('entreprises')
                .update({
                  latitude: geoData.latitude,
                  longitude: geoData.longitude
                })
                .eq('id', entreprise.id);

              // IMPORTANT: Mettre à jour l'objet local
              entreprise.latitude = geoData.latitude;
              entreprise.longitude = geoData.longitude;
              
              console.log(`✅ Coordonnées trouvées pour ${entreprise.nom}: ${geoData.latitude}, ${geoData.longitude}`);
            } else {
              console.warn(`⚠️ Géocodage échoué pour ${entreprise.nom}`);
            }
          } catch (error) {
            console.error(`Erreur géocodage ${entreprise.nom}:`, error);
          }
        }
      }

      // Étape 2: Vérifier qu'on a au moins quelques entreprises avec coordonnées
      const entreprisesWithCoords = selectedEntreprises.filter(e => 
        e.latitude && e.longitude && 
        Number.isFinite(e.latitude) && Number.isFinite(e.longitude)
      );
      
      if (entreprisesWithCoords.length === 0) {
        toast({
          title: "❌ Impossible d'optimiser",
          description: "Aucune entreprise n'a de coordonnées GPS valides. Vérifiez les adresses.",
          variant: "destructive",
          duration: 4000,
        });
        setOptimizing(false);
        return;
      }

      if (entreprisesWithCoords.length < selectedEntreprises.length) {
        const excluded = selectedEntreprises.length - entreprisesWithCoords.length;
        toast({
          title: "⚠️ Géocodage partiel",
          description: `${excluded} entreprise(s) sans coordonnées valides seront exclues de la tournée`,
          duration: 3000,
        });
      }

      // Étape 3: Récupérer la position actuelle
      let currentLocation = userLocation;
      try {
        currentLocation = await getUserLocation();
        setUserLocation(currentLocation);
      } catch (geoError) {
        console.log("Géolocalisation non disponible, utilisation sans point de départ");
      }

      // Étape 4: Optimiser avec uniquement les entreprises valides
      toast({
        title: "🚀 Optimisation en cours...",
        description: "Calcul du meilleur itinéraire...",
        duration: 2000,
      });

      const { data, error } = await supabase.functions.invoke('optimize-tournee', {
        body: {
          entreprises: entreprisesWithCoords.map(e => ({
            id: e.id,
            nom: e.nom,
            latitude: typeof e.latitude === 'string' ? parseFloat(e.latitude) : e.latitude,
            longitude: typeof e.longitude === 'string' ? parseFloat(e.longitude) : e.longitude,
            adresse: e.adresse,
            ville: e.ville,
            code_postal: e.code_postal,
            telephone: e.telephone
          })),
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
        duration: 2500,
      });
    } catch (error) {
      console.error('Error optimizing tournee:', error);
      toast({
        title: "Erreur d'optimisation",
        description: error instanceof Error ? error.message : "Impossible d'optimiser la tournée",
        variant: "destructive",
        duration: 3000,
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
        duration: 3000,
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
        duration: 2500,
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
        duration: 3000,
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
          duration: 3000,
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
        duration: 2500,
      });
    } catch (error) {
      console.error('Error starting tournee:', error);
      toast({
        title: "Erreur",
        description: "Impossible de démarrer la navigation",
        variant: "destructive",
        duration: 3000,
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
        duration: 2500,
      });
      fetchTournees();
    } catch (error) {
      console.error('Error deleting tournee:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la tournée",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const handleUpdateTournee = async () => {
    if (!editingTournee || !editedName.trim()) return;

    try {
      const updates: any = { nom: editedName };
      
      if (editedDate) {
        updates.date_planifiee = format(editedDate, 'yyyy-MM-dd');
      }

      const { error } = await supabase
        .from('tournees')
        .update(updates)
        .eq('id', editingTournee.id);

      if (error) throw error;

      toast({
        title: "✅ Tournée modifiée",
        description: "Les modifications ont été enregistrées",
        duration: 2500,
      });

      fetchTournees();
      setEditingTournee(null);
      setEditedName("");
      setEditedDate(undefined);
    } catch (error) {
      console.error('Error updating tournee:', error);
      toast({
        title: "Erreur",
        description: "Impossible de modifier la tournée",
        variant: "destructive",
        duration: 3000,
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

  // View détaillée d'une tournée
  if (selectedTournee) {
    return (
      <div className="h-full flex flex-col overflow-hidden">
        <TourneeRouteDisplay
          tourneeId={selectedTournee.id}
          tourneeName={selectedTournee.nom}
          ordreOptimise={selectedTournee.ordre_optimise}
          distanceTotaleKm={selectedTournee.distance_totale_km}
          tempsEstimeMinutes={selectedTournee.temps_estime_minutes}
          pointDepartLat={selectedTournee.point_depart_lat}
          pointDepartLng={selectedTournee.point_depart_lng}
          statut={selectedTournee.statut}
          notes={selectedTournee.notes}
          heureDebut={(selectedTournee as any).heure_debut}
          onUpdate={fetchTournees}
          onBack={() => setSelectedTournee(null)}
        />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col gap-3 overflow-hidden">
      {/* Nouvelle tournée */}
      {!isSelecting && !optimizedResult && (
        <Card className="border-accent/30 bg-gradient-to-br from-accent/10 via-accent/5 to-transparent hover:border-accent/50 transition-all shadow-lg shadow-accent/5">
          <CardContent className="pt-4 pb-4">
            <Button onClick={() => setIsSelecting(true)} className="w-full h-12 text-base font-semibold bg-gradient-to-r from-accent via-accent to-accent/80 transition-colors">
              <Plus className="w-5 h-5 mr-2" />
              Créer une nouvelle tournée
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Mode sélection avec carte */}
      {isSelecting && (
        <div className="flex flex-col h-full gap-3 overflow-hidden">
          {/* En-tête compact */}
          <Card className="flex-shrink-0 border-accent/30 bg-gradient-to-br from-accent/10 via-accent/5 to-transparent shadow-lg shadow-accent/5">
            <CardContent className="pt-4 pb-4 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold flex items-center gap-2 gradient-text text-lg">
                    <div className="p-2 bg-accent/10 rounded-lg">
                      <Route className="w-5 h-5 text-accent" />
                    </div>
                    Créer votre tournée
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Cliquez sur les entreprises pour les ajouter
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant={viewMode === 'map' ? 'default' : 'outline'}
                    onClick={() => setViewMode('map')}
                    className={viewMode === 'map' ? 'bg-gradient-to-r from-accent via-accent to-accent/80' : 'border-accent/30 hover:bg-accent/10'}
                  >
                    <MapIconLucide className="w-4 h-4 mr-1" />
                    Carte
                  </Button>
                  <Button
                    size="sm"
                    variant={viewMode === 'list' ? 'default' : 'outline'}
                    onClick={() => setViewMode('list')}
                    className={viewMode === 'list' ? 'bg-gradient-to-r from-accent via-accent to-accent/80' : 'border-accent/30 hover:bg-accent/10'}
                  >
                    <List className="w-4 h-4 mr-1" />
                    Liste
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleOptimize}
                    disabled={optimizing || selectedEntreprises.length < 2 || !tourneeName.trim()}
                    className="bg-gradient-to-r from-accent via-accent to-accent/80 transition-colors"
                  >
                    {optimizing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                        Optimisation...
                      </>
                    ) : (
                      <>
                        <TrendingUp className="w-4 h-4 mr-1" />
                        Optimiser
                      </>
                    )}
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => {
                      setIsSelecting(false);
                      setSelectedEntreprises([]);
                      setTourneeName("");
                      setTourneeDate(format(new Date(), 'yyyy-MM-dd'));
                    }}
                    className="hover:bg-accent/10"
                  >
                    Annuler
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <Input
                  placeholder="Nom de la tournée *"
                  value={tourneeName}
                  onChange={(e) => setTourneeName(e.target.value)}
                  className="border-accent/30 bg-card/50 focus:border-accent focus:ring-accent/20"
                />
                <Input
                  type="date"
                  value={tourneeDate}
                  onChange={(e) => setTourneeDate(e.target.value)}
                  className="border-accent/30 bg-card/50 focus:border-accent focus:ring-accent/20"
                />
              </div>

              <TourneeFilters filters={filters} setFilters={setFilters} />

              {selectedEntreprises.length > 0 && (
                <div className="flex items-center gap-2 bg-accent/5 p-3 rounded-lg border border-accent/20">
                  <Badge variant="secondary" className="bg-accent/20 text-accent border-accent/30">
                    {selectedEntreprises.length} sélectionnée(s)
                  </Badge>
                  <Button
                    onClick={handleOptimize}
                    disabled={optimizing || selectedEntreprises.length < 2 || !tourneeName.trim()}
                    size="sm"
                    className="ml-auto bg-gradient-to-r from-accent via-accent to-accent/80 transition-colors"
                  >
                    {optimizing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                        Optimisation...
                      </>
                    ) : (
                      <>
                        <TrendingUp className="w-4 h-4 mr-1" />
                        Optimiser
                      </>
                    )}
                  </Button>
                </div>
              )}

              {(!tourneeName.trim() || selectedEntreprises.length < 2) && (
                <div className="text-[11px] text-muted-foreground">
                  {!tourneeName.trim() ? "Renseignez un nom de tournée. " : null}
                  {selectedEntreprises.length < 2 ? "Sélectionnez au moins 2 entreprises sur la carte." : null}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Carte ou Liste */}
          <div className="flex-1 min-h-0 rounded-xl overflow-hidden border border-accent/30 shadow-lg shadow-accent/5 relative">
            <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-transparent pointer-events-none z-10" />
            {viewMode === 'map' ? (
              <MapView
                filters={filters}
                onEntrepriseSelect={handleMapMarkerClick}
                selectionMode={true}
                selectedEntreprises={selectedEntreprises}
                onToggleSelection={handleMapMarkerClick}
              />
            ) : (
              <ListView
                filters={filters}
                selectionMode={true}
                selectedEntreprises={selectedEntreprises}
                onToggleSelection={handleMapMarkerClick}
              />
            )}
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
      <Card className="flex-1 flex flex-col min-h-0 border-accent/30 bg-gradient-to-br from-card/95 to-card/80 shadow-lg shadow-accent/5">
        <CardHeader className="pb-3 flex-shrink-0 border-b border-accent/10">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-accent/10 rounded-lg">
              <Calendar className="w-4 h-4 text-accent" />
            </div>
            <div>
              <CardTitle className="text-base gradient-text">Mes tournées planifiées</CardTitle>
              <CardDescription className="text-xs">
                {tournees.length} tournée(s) enregistrée(s)
              </CardDescription>
            </div>
          </div>
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
                    <Card key={tournee.id} className="group relative border-accent/30 hover:border-accent/50 bg-gradient-to-br from-card/95 to-card/80 transition-colors duration-300">
                      <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-lg" />
                      <CardContent className="relative pt-3 pb-3 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            {editingTournee?.id === tournee.id ? (
                              <div className="space-y-2 bg-accent/5 p-3 rounded-lg border border-accent/30">
                                <div className="space-y-1.5">
                                  <Label className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Route className="w-3 h-3" />
                                    Nom de la tournée
                                  </Label>
                                  <Input
                                    value={editedName}
                                    onChange={(e) => setEditedName(e.target.value)}
                                    className="h-8 text-sm border-accent/30 bg-card/50 focus:border-accent focus:ring-accent/20"
                                    autoFocus
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') handleUpdateTournee();
                                      if (e.key === 'Escape') {
                                        setEditingTournee(null);
                                        setEditedName("");
                                        setEditedDate(undefined);
                                      }
                                    }}
                                  />
                                </div>
                                <div className="space-y-1.5">
                                  <Label className="text-xs text-muted-foreground flex items-center gap-1">
                                    <CalendarDays className="w-3 h-3" />
                                    Date planifiée
                                  </Label>
                                  <DatePicker
                                    date={editedDate}
                                    onSelect={setEditedDate}
                                    placeholder="Sélectionner une date"
                                    className="h-8 text-sm"
                                  />
                                </div>
                                <div className="flex gap-2 pt-1">
                                  <Button
                                    size="sm"
                                    onClick={handleUpdateTournee}
                                    className="flex-1 h-8 bg-gradient-to-r from-accent to-accent/80 hover:shadow-md hover:shadow-accent/30"
                                  >
                                    <Check className="w-3.5 h-3.5 mr-1" />
                                    Enregistrer
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      setEditingTournee(null);
                                      setEditedName("");
                                      setEditedDate(undefined);
                                    }}
                                    className="h-8 border-accent/30 hover:bg-accent/10"
                                  >
                                    <X className="w-3.5 h-3.5 mr-1" />
                                    Annuler
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <div className="font-medium text-sm truncate flex items-center gap-2">
                                  <Route className="w-3.5 h-3.5 text-accent" />
                                  {tournee.nom}
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setEditingTournee(tournee);
                                      setEditedName(tournee.nom);
                                      setEditedDate(new Date(tournee.date_planifiee));
                                    }}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-accent/10 rounded"
                                    title="Modifier"
                                  >
                                    <Edit2 className="w-3 h-3 text-accent" />
                                  </button>
                                </div>
                                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                                  <Calendar className="w-3 h-3" />
                                  {format(new Date(tournee.date_planifiee), 'dd/MM/yyyy', { locale: fr })}
                                </div>
                              </>
                            )}
                          </div>
                          {editingTournee?.id !== tournee.id && (
                            <Badge variant={statutConfig.variant} className="text-xs flex-shrink-0">
                              {statutConfig.label}
                            </Badge>
                          )}
                        </div>
                        
                        {editingTournee?.id !== tournee.id && (
                          <>
                            <div className="grid grid-cols-3 gap-1.5 text-xs">
                              <div className="flex items-center gap-1.5 bg-gradient-to-br from-blue-500/10 to-blue-500/5 p-2 rounded-lg border border-blue-500/20">
                                <MapPin className="w-3.5 h-3.5 text-blue-500" />
                                <span className="font-medium">{tournee.entreprises_ids.length}</span>
                              </div>
                              <div className="flex items-center gap-1.5 bg-gradient-to-br from-green-500/10 to-green-500/5 p-2 rounded-lg border border-green-500/20">
                                <Navigation className="w-3.5 h-3.5 text-green-500" />
                                <span className="font-medium">{Math.round(tournee.distance_totale_km)}km</span>
                              </div>
                              <div className="flex items-center gap-1.5 bg-gradient-to-br from-purple-500/10 to-purple-500/5 p-2 rounded-lg border border-purple-500/20">
                                <Clock className="w-3.5 h-3.5 text-purple-500" />
                                <span className="font-medium">{Math.floor(tournee.temps_estime_minutes / 60)}h{(tournee.temps_estime_minutes % 60).toString().padStart(2, '0')}</span>
                              </div>
                            </div>
                            
                            <div className="flex gap-2">
                              <Button 
                                variant="default" 
                                size="sm" 
                                className="flex-1 h-9 text-xs bg-gradient-to-r from-accent to-accent/80 hover:shadow-md hover:shadow-accent/30 transition-all"
                                onClick={() => setSelectedTournee(tournee)}
                              >
                                <MapIconLucide className="w-3.5 h-3.5 mr-1.5" />
                                Voir détails
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-9 text-xs border-accent/30 hover:bg-accent/10 hover:border-accent/50 transition-all"
                                onClick={() => handleStartTournee(tournee)}
                              >
                                <Locate className="w-3.5 h-3.5 mr-1" />
                                GPS
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-9 border-red-500/30 hover:bg-red-500/10 hover:border-red-500/50 transition-all"
                                onClick={() => handleDeleteTournee(tournee.id)}
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </>
                        )}
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
