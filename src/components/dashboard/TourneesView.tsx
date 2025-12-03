import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Route, 
  MapPin, 
  Clock, 
  Navigation, 
  Trash2, 
  Play, 
  Loader2,
  ArrowRight,
  Edit2,
  Check,
  X,
  CalendarDays,
  Building2
} from "lucide-react";
import { DatePicker } from "@/components/ui/date-picker";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

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

interface Entreprise {
  id: string;
  nom: string;
  adresse?: string;
  ville?: string;
  code_postal?: string;
  latitude?: number;
  longitude?: number;
}

export const TourneesView = () => {
  const [tournees, setTournees] = useState<Tournee[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTournee, setSelectedTournee] = useState<Tournee | null>(null);
  const [tourneeEntreprises, setTourneeEntreprises] = useState<Entreprise[]>([]);
  const [loadingEntreprises, setLoadingEntreprises] = useState(false);
  const [editingTournee, setEditingTournee] = useState<Tournee | null>(null);
  const [editedName, setEditedName] = useState("");
  const [editedDate, setEditedDate] = useState<Date | undefined>(undefined);
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

  const handleSelectTournee = async (tournee: Tournee) => {
    setSelectedTournee(tournee);
    setLoadingEntreprises(true);
    
    try {
      const { data, error } = await supabase
        .from('nouveaux_sites')
        .select('id, nom, adresse, ville, code_postal, latitude, longitude')
        .in('id', tournee.ordre_optimise.length > 0 ? tournee.ordre_optimise : tournee.entreprises_ids);
      
      if (error) throw error;
      
      const orderedData = tournee.ordre_optimise.length > 0
        ? tournee.ordre_optimise.map(id => data?.find(e => e.id === id)).filter(Boolean) as Entreprise[]
        : (data || []) as Entreprise[];
      
      setTourneeEntreprises(orderedData);
    } catch (error) {
      console.error('Error fetching tournee entreprises:', error);
      setTourneeEntreprises([]);
    } finally {
      setLoadingEntreprises(false);
    }
  };

  const handleDeleteTournee = async (tourneeId: string) => {
    try {
      const { error } = await supabase
        .from('tournees')
        .delete()
        .eq('id', tourneeId);

      if (error) throw error;

      setTournees(prev => prev.filter(t => t.id !== tourneeId));
      if (selectedTournee?.id === tourneeId) {
        setSelectedTournee(null);
        setTourneeEntreprises([]);
      }

      toast({
        title: "Tournée supprimée",
        description: "La tournée a été supprimée avec succès",
      });
    } catch (error) {
      console.error('Error deleting tournee:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la tournée",
        variant: "destructive",
      });
    }
  };

  const handleStartEdit = (tournee: Tournee) => {
    setEditingTournee(tournee);
    setEditedName(tournee.nom);
    setEditedDate(new Date(tournee.date_planifiee));
  };

  const handleSaveEdit = async () => {
    if (!editingTournee) return;
    
    try {
      const { error } = await supabase
        .from('tournees')
        .update({
          nom: editedName,
          date_planifiee: editedDate ? format(editedDate, 'yyyy-MM-dd') : editingTournee.date_planifiee
        })
        .eq('id', editingTournee.id);

      if (error) throw error;

      setTournees(prev => prev.map(t => 
        t.id === editingTournee.id 
          ? { ...t, nom: editedName, date_planifiee: editedDate ? format(editedDate, 'yyyy-MM-dd') : t.date_planifiee }
          : t
      ));

      if (selectedTournee?.id === editingTournee.id) {
        setSelectedTournee(prev => prev ? { ...prev, nom: editedName, date_planifiee: editedDate ? format(editedDate, 'yyyy-MM-dd') : prev.date_planifiee } : null);
      }

      toast({
        title: "Tournée modifiée",
        description: "Les modifications ont été enregistrées",
      });
    } catch (error) {
      console.error('Error updating tournee:', error);
      toast({
        title: "Erreur",
        description: "Impossible de modifier la tournée",
        variant: "destructive",
      });
    } finally {
      setEditingTournee(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingTournee(null);
    setEditedName("");
    setEditedDate(undefined);
  };

  const handleStartTournee = (tournee: Tournee) => {
    if (tourneeEntreprises.length === 0) return;
    
    const waypoints = tourneeEntreprises
      .filter(e => e.latitude && e.longitude)
      .map(e => `${e.latitude},${e.longitude}`)
      .join('/');
    
    if (waypoints) {
      const googleMapsUrl = `https://www.google.com/maps/dir/${waypoints}`;
      window.open(googleMapsUrl, '_blank');
    }
  };

  const getStatutBadge = (statut: string) => {
    switch (statut) {
      case 'planifiee':
        return <Badge variant="outline" className="text-xs">Planifiée</Badge>;
      case 'en_cours':
        return <Badge className="bg-accent text-primary text-xs">En cours</Badge>;
      case 'terminee':
        return <Badge variant="secondary" className="text-xs">Terminée</Badge>;
      default:
        return <Badge variant="outline" className="text-xs">{statut}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="h-full flex gap-4">
      {/* Liste des tournées */}
      <div className="w-80 shrink-0 flex flex-col">
        <div className="mb-4">
          <h2 className="text-lg font-semibold">Mes tournées</h2>
          <p className="text-sm text-muted-foreground">{tournees.length} tournée(s)</p>
        </div>
        
        <ScrollArea className="flex-1">
          <div className="space-y-3 pr-4">
            {tournees.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="py-8 text-center">
                  <Route className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                  <p className="text-sm text-muted-foreground">
                    Aucune tournée créée
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Créez une tournée depuis l'onglet Prospects
                  </p>
                </CardContent>
              </Card>
            ) : (
              tournees.map((tournee) => (
                <Card 
                  key={tournee.id}
                  className={`cursor-pointer transition-all hover:border-accent/50 ${
                    selectedTournee?.id === tournee.id ? 'border-accent bg-accent/5' : ''
                  }`}
                  onClick={() => handleSelectTournee(tournee)}
                >
                  <CardContent className="p-4">
                    {editingTournee?.id === tournee.id ? (
                      <div className="space-y-3" onClick={e => e.stopPropagation()}>
                        <Input
                          value={editedName}
                          onChange={(e) => setEditedName(e.target.value)}
                          placeholder="Nom de la tournée"
                          className="h-8 text-sm"
                        />
                        <DatePicker
                          date={editedDate}
                          onSelect={setEditedDate}
                        />
                        <div className="flex gap-2">
                          <Button size="sm" onClick={handleSaveEdit} className="h-7 text-xs">
                            <Check className="w-3 h-3 mr-1" />
                            Enregistrer
                          </Button>
                          <Button size="sm" variant="outline" onClick={handleCancelEdit} className="h-7 text-xs">
                            <X className="w-3 h-3 mr-1" />
                            Annuler
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-medium text-sm">{tournee.nom}</h3>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                              <CalendarDays className="w-3 h-3" />
                              {format(new Date(tournee.date_planifiee), "d MMMM yyyy", { locale: fr })}
                            </div>
                          </div>
                          {getStatutBadge(tournee.statut)}
                        </div>
                        
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {tournee.entreprises_ids.length} arrêts
                          </span>
                          {tournee.distance_totale_km && (
                            <span className="flex items-center gap-1">
                              <Navigation className="w-3 h-3" />
                              {Math.round(tournee.distance_totale_km)} km
                            </span>
                          )}
                          {tournee.temps_estime_minutes && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {Math.floor(tournee.temps_estime_minutes / 60)}h{(tournee.temps_estime_minutes % 60).toString().padStart(2, '0')}
                            </span>
                          )}
                        </div>
                        
                        <div className="flex gap-2 mt-3" onClick={e => e.stopPropagation()}>
                          <Button size="sm" variant="outline" onClick={() => handleStartEdit(tournee)} className="h-7 text-xs">
                            <Edit2 className="w-3 h-3" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => handleDeleteTournee(tournee.id)}
                            className="h-7 text-xs text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Détails de la tournée sélectionnée */}
      <div className="flex-1 min-w-0">
        {selectedTournee ? (
          <Card className="h-full flex flex-col">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{selectedTournee.nom}</CardTitle>
                  <CardDescription>
                    {format(new Date(selectedTournee.date_planifiee), "EEEE d MMMM yyyy", { locale: fr })}
                  </CardDescription>
                </div>
                <Button onClick={() => handleStartTournee(selectedTournee)} className="gap-2">
                  <Play className="w-4 h-4" />
                  Démarrer
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className="flex-1 min-h-0 overflow-hidden">
              {loadingEntreprises ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="w-6 h-6 animate-spin text-accent" />
                </div>
              ) : (
                <ScrollArea className="h-full">
                  <div className="space-y-2">
                    {tourneeEntreprises.map((entreprise, index) => (
                      <div 
                        key={entreprise.id}
                        className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg border border-border/50"
                      >
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold text-sm">
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{entreprise.nom}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {entreprise.adresse && `${entreprise.adresse}, `}
                            {entreprise.code_postal} {entreprise.ville}
                          </p>
                        </div>
                        {index < tourneeEntreprises.length - 1 && (
                          <ArrowRight className="w-4 h-4 text-muted-foreground" />
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card className="h-full flex items-center justify-center border-dashed">
            <CardContent className="text-center py-12">
              <Building2 className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
              <h3 className="font-medium text-muted-foreground">Sélectionnez une tournée</h3>
              <p className="text-sm text-muted-foreground/70 mt-1">
                Cliquez sur une tournée pour voir les détails
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default TourneesView;
