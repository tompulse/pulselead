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
  const [tourneeNotes, setTourneeNotes] = useState("");
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectedEntreprises, setSelectedEntreprises] = useState<Entreprise[]>([]);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
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
        notes: tourneeNotes || null,
        statut: 'planifiee',
      });

      if (error) throw error;

      toast({
        title: "✅ Tournée enregistrée",
        description: "La tournée a été sauvegardée avec succès",
      });

      setTourneeName("");
      setTourneeNotes("");
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
    <div className="h-full flex flex-col gap-6">
      {/* Nouvelle tournée */}
      {!isSelecting && !optimizedResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Créer une nouvelle tournée
            </CardTitle>
            <CardDescription>
              Sélectionnez vos entreprises sur la carte et optimisez votre itinéraire
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setIsSelecting(true)} className="w-full">
              <MapIconLucide className="w-4 h-4 mr-2" />
              Commencer la sélection
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Mode sélection avec carte */}
      {isSelecting && (
        <Card className="border-accent/20 bg-gradient-to-br from-accent/5 to-transparent">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Route className="w-5 h-5 text-accent" />
              Créer votre tournée
            </CardTitle>
            <CardDescription>
              Cliquez sur les entreprises pour les ajouter à votre tournée
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Informations de base */}
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="nom-tournee">Nom de la tournée *</Label>
                <Input
                  id="nom-tournee"
                  placeholder="Ex: Tournée Sud 23 octobre"
                  value={tourneeName}
                  onChange={(e) => setTourneeName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date-tournee">Date planifiée *</Label>
                <Input
                  id="date-tournee"
                  type="date"
                  value={tourneeDate}
                  onChange={(e) => setTourneeDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes-tournee">Notes</Label>
                <Textarea
                  id="notes-tournee"
                  placeholder="Notes ou remarques..."
                  value={tourneeNotes}
                  onChange={(e) => setTourneeNotes(e.target.value)}
                  rows={2}
                />
              </div>
            </div>

            {/* Carte intégrée */}
            <div className="h-[400px] rounded-lg overflow-hidden border border-accent/20">
              <MapView
                filters={{
                  dateFrom: "",
                  dateTo: "",
                  categories: [],
                  departments: []
                }}
                onEntrepriseSelect={handleMapMarkerClick}
                selectionMode={true}
                selectedEntreprises={selectedEntreprises}
                onToggleSelection={handleMapMarkerClick}
              />
            </div>

            {/* Entreprises sélectionnées */}
            {selectedEntreprises.length > 0 && (
              <div className="space-y-2">
                <Label>{selectedEntreprises.length} entreprise(s) sélectionnée(s)</Label>
                <div className="flex flex-wrap gap-2">
                  {selectedEntreprises.map((e) => (
                    <Badge 
                      key={e.id} 
                      variant="outline" 
                      className="text-xs cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                      onClick={() => setSelectedEntreprises(prev => prev.filter(item => item.id !== e.id))}
                    >
                      {e.nom} ✕
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                onClick={handleOptimize}
                disabled={optimizing || selectedEntreprises.length < 2 || !tourneeName.trim()}
                className="flex-1"
              >
                {optimizing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Optimisation en cours...
                  </>
                ) : (
                  <>
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Optimiser avec l'IA
                  </>
                )}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsSelecting(false);
                  setSelectedEntreprises([]);
                  setTourneeName("");
                  setTourneeNotes("");
                  setTourneeDate(format(new Date(), 'yyyy-MM-dd'));
                }}
              >
                Annuler
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Résultat optimisé */}
      {optimizedResult && (
        <Card className="border-accent/20 bg-gradient-to-br from-accent/5 to-transparent">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-accent" />
              Tournée optimisée
            </CardTitle>
            <CardDescription>
              Votre itinéraire a été calculé avec l'IA
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-accent">
                      {Math.round(optimizedResult.distance_totale_km)} km
                    </div>
                    <div className="text-xs text-muted-foreground">Distance totale</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-accent">
                      {Math.floor(optimizedResult.temps_estime_minutes / 60)}h
                      {Math.round(optimizedResult.temps_estime_minutes % 60).toString().padStart(2, '0')}
                    </div>
                    <div className="text-xs text-muted-foreground">Temps estimé</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-accent">
                      {optimizedResult.entreprises_ordonnees.length}
                    </div>
                    <div className="text-xs text-muted-foreground">Visites</div>
                  </div>
                </div>

                <div className="bg-muted/50 p-3 rounded-lg">
                  <p className="text-sm text-muted-foreground">{optimizedResult.explication}</p>
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-semibold">Itinéraire optimisé :</div>
                  {optimizedResult.entreprises_ordonnees.map((e: Entreprise, idx: number) => (
                    <div key={e.id} className="flex items-start gap-3 p-2 bg-card rounded border border-accent/10">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold text-sm">
                        {idx + 1}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{e.nom}</div>
                        <div className="text-xs text-muted-foreground">{e.ville} {e.code_postal}</div>
                      </div>
                      {idx < optimizedResult.entreprises_ordonnees.length - 1 && (
                        <ArrowRight className="w-4 h-4 text-muted-foreground mt-2" />
                      )}
                    </div>
                  ))}
                </div>

            <div className="flex gap-2">
              <Button onClick={handleSaveTournee} className="flex-1">
                <Save className="w-4 h-4 mr-2" />
                Enregistrer la tournée
              </Button>
              <Button 
                variant="outline"
                onClick={() => {
                  setOptimizedResult(null);
                  setSelectedEntreprises([]);
                  setTourneeName("");
                  setTourneeNotes("");
                  setTourneeDate(format(new Date(), 'yyyy-MM-dd'));
                  setIsSelecting(false);
                }}
              >
                Annuler
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Liste des tournées sauvegardées */}
      <Card className="flex-1 flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Mes tournées planifiées
          </CardTitle>
          <CardDescription>
            {tournees.length} tournée(s) enregistrée(s)
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-accent" />
              </div>
            ) : tournees.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Route className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Aucune tournée planifiée</p>
                <p className="text-sm mt-2">Sélectionnez des entreprises sur la carte pour commencer</p>
              </div>
            ) : (
              <div className="space-y-3">
                {tournees.map((tournee) => {
                  const statutConfig = getStatutBadge(tournee.statut);
                  return (
                    <Card key={tournee.id} className="border-accent/20">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <CardTitle className="text-base">{tournee.nom}</CardTitle>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Calendar className="w-3 h-3" />
                              {format(new Date(tournee.date_planifiee), 'PPP', { locale: fr })}
                            </div>
                          </div>
                          <Badge variant={statutConfig.variant}>{statutConfig.label}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="grid grid-cols-3 gap-2 text-sm">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-muted-foreground" />
                            <span>{tournee.entreprises_ids.length} visites</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Navigation className="w-3 h-3 text-muted-foreground" />
                            <span>{Math.round(tournee.distance_totale_km)} km</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-muted-foreground" />
                            <span>{Math.floor(tournee.temps_estime_minutes / 60)}h{(tournee.temps_estime_minutes % 60).toString().padStart(2, '0')}</span>
                          </div>
                        </div>
                        {tournee.notes && (
                          <p className="text-xs text-muted-foreground">{tournee.notes}</p>
                        )}
                        <div className="flex gap-2 pt-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1"
                            onClick={() => handleStartTournee(tournee)}
                          >
                            <Locate className="w-3 h-3 mr-1" />
                            Démarrer
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
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
