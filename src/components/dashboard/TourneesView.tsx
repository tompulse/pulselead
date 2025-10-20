import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
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
  CheckCircle,
  Loader2,
  Map as MapIconLucide,
  ArrowRight,
  TrendingUp
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface Entreprise {
  id: string;
  nom: string;
  latitude: number;
  longitude: number;
  adresse?: string;
  ville?: string;
  code_postal?: string;
  numero_voie?: string;
  type_voie?: string;
  nom_voie?: string;
}

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
}

interface TourneesViewProps {
  selectedEntreprises: Entreprise[];
  onClearSelection: () => void;
}

export const TourneesView = ({ selectedEntreprises, onClearSelection }: TourneesViewProps) => {
  const [tournees, setTournees] = useState<Tournee[]>([]);
  const [loading, setLoading] = useState(true);
  const [optimizing, setOptimizing] = useState(false);
  const [optimizedResult, setOptimizedResult] = useState<any>(null);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [tourneeName, setTourneeName] = useState("");
  const [tourneeDate, setTourneeDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [tourneeNotes, setTourneeNotes] = useState("");
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

  const handleOptimize = async () => {
    if (selectedEntreprises.length < 2) {
      toast({
        title: "Sélection insuffisante",
        description: "Sélectionnez au moins 2 entreprises pour optimiser une tournée",
        variant: "destructive",
      });
      return;
    }

    setOptimizing(true);
    try {
      const { data, error } = await supabase.functions.invoke('optimize-tournee', {
        body: {
          entreprises: selectedEntreprises,
        },
      });

      if (error) throw error;

      setOptimizedResult(data);
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
        notes: tourneeNotes || null,
        statut: 'planifiee',
      });

      if (error) throw error;

      toast({
        title: "✅ Tournée enregistrée",
        description: "La tournée a été sauvegardée avec succès",
      });

      setShowSaveDialog(false);
      setTourneeName("");
      setTourneeNotes("");
      fetchTournees();
      onClearSelection();
      setOptimizedResult(null);
    } catch (error) {
      console.error('Error saving tournee:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder la tournée",
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

  return (
    <div className="h-full flex flex-col gap-6">
      {/* Optimisation en cours */}
      {selectedEntreprises.length > 0 && (
        <Card className="border-accent/20 bg-gradient-to-br from-accent/5 to-transparent">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Route className="w-5 h-5 text-accent" />
              Optimiser la tournée
            </CardTitle>
            <CardDescription>
              {selectedEntreprises.length} entreprise(s) sélectionnée(s)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {selectedEntreprises.map((e) => (
                <Badge key={e.id} variant="outline" className="text-xs">
                  {e.nom}
                </Badge>
              ))}
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleOptimize}
                disabled={optimizing || selectedEntreprises.length < 2}
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
              <Button variant="outline" onClick={onClearSelection}>
                Effacer
              </Button>
            </div>

            {/* Résultat optimisé */}
            {optimizedResult && (
              <div className="space-y-4 pt-4 border-t border-accent/20">
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

                <Button onClick={() => setShowSaveDialog(true)} className="w-full">
                  <Save className="w-4 h-4 mr-2" />
                  Enregistrer cette tournée
                </Button>
              </div>
            )}
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
                          <Button variant="outline" size="sm" className="flex-1">
                            <Play className="w-3 h-3 mr-1" />
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

      {/* Dialog de sauvegarde */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enregistrer la tournée</DialogTitle>
            <DialogDescription>
              Donnez un nom à votre tournée et planifiez une date
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nom">Nom de la tournée *</Label>
              <Input
                id="nom"
                placeholder="Ex: Tournée Sud 23 octobre"
                value={tourneeName}
                onChange={(e) => setTourneeName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Date planifiée *</Label>
              <Input
                id="date"
                type="date"
                value={tourneeDate}
                onChange={(e) => setTourneeDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Notes ou remarques..."
                value={tourneeNotes}
                onChange={(e) => setTourneeNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
              Annuler
            </Button>
            <Button onClick={handleSaveTournee} disabled={!tourneeName}>
              <Save className="w-4 h-4 mr-2" />
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
