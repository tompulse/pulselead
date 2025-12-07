import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Calendar, MapPin, Route, Loader2, Clock, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface NouveauSite {
  id: string;
  nom: string;
  ville: string | null;
  code_postal: string | null;
  latitude: number | null;
  longitude: number | null;
  adresse: string | null;
}

interface TourneeCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedSites: NouveauSite[];
  userId: string;
  onSuccess: () => void;
}

export const TourneeCreationModal = ({
  isOpen,
  onClose,
  selectedSites,
  userId,
  onSuccess,
}: TourneeCreationModalProps) => {
  const queryClient = useQueryClient();
  const [nom, setNom] = useState(`Tournée du ${format(new Date(), 'dd/MM', { locale: fr })}`);
  const [datePlanifiee, setDatePlanifiee] = useState<Date>(new Date());
  const [isOptimizing, setIsOptimizing] = useState(false);

  const createTourneeMutation = useMutation({
    mutationFn: async () => {
      setIsOptimizing(true);

      // Prepare entreprises for optimization - only those with valid coordinates
      const entreprises = selectedSites
        .filter(site => site.latitude && site.longitude)
        .map(site => ({
          id: site.id,
          nom: site.nom,
          ville: site.ville || '',
          latitude: Number(site.latitude),
          longitude: Number(site.longitude),
          adresse: site.adresse || '',
          code_postal: site.code_postal || '',
        }));

      console.log('📦 Sites préparés pour optimisation:', entreprises.length, entreprises);

      if (entreprises.length < 2) {
        throw new Error('Il faut au moins 2 sites avec coordonnées GPS pour optimiser');
      }

      // Get user's current position for starting point
      let point_depart: { lat: number; lng: number } | null = null;
      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
        });
        point_depart = { lat: position.coords.latitude, lng: position.coords.longitude };
        console.log('📍 Position utilisateur détectée:', point_depart);
      } catch (err) {
        // Use first site as starting point
        point_depart = { lat: entreprises[0].latitude, lng: entreprises[0].longitude };
        console.log('📍 Position par défaut (1er site):', point_depart);
      }

      // Call optimize-tournee edge function
      console.log('🚀 Appel optimize-tournee avec', { entreprises, point_depart });
      const { data: optimizeResult, error: optimizeError } = await supabase.functions.invoke('optimize-tournee', {
        body: {
          entreprises,
          point_depart, // Correct field name for the edge function
        },
      });

      console.log('📊 Résultat optimisation:', optimizeResult, 'Erreur:', optimizeError);

      if (optimizeError) {
        console.error('Optimization error:', optimizeError);
        throw new Error('Erreur lors de l\'optimisation: ' + optimizeError.message);
      }

      if (optimizeResult?.error) {
        console.error('Optimization result error:', optimizeResult.error);
        // Continue with fallback order
      }

      // Extract values from response (edge function uses snake_case)
      const ordreOptimise = optimizeResult?.ordre_optimise || selectedSites.map(s => s.id);
      const distanceTotale = optimizeResult?.distance_totale_km || null;
      const tempsEstime = optimizeResult?.temps_estime_minutes || null;

      console.log('📝 Données pour insertion:', { ordreOptimise, distanceTotale, tempsEstime });

      // Create tournee with optimized data
      const { data: tournee, error: insertError } = await supabase
        .from('tournees')
        .insert({
          user_id: userId,
          nom,
          date_planifiee: format(datePlanifiee, 'yyyy-MM-dd'),
          entreprises_ids: selectedSites.map(s => s.id),
          ordre_optimise: ordreOptimise,
          distance_totale_km: distanceTotale,
          temps_estime_minutes: tempsEstime,
          point_depart_lat: point_depart?.lat,
          point_depart_lng: point_depart?.lng,
          statut: 'planifiee',
          visites_effectuees: [],
        })
        .select()
        .single();

      if (insertError) {
        console.error('Insert error:', insertError);
        throw insertError;
      }

      return { tournee, optimizeResult, distanceTotale, tempsEstime };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['tournees'] });
      
      const distance = Math.round(result.distanceTotale || 0);
      const minutes = result.tempsEstime || 0;
      const hours = Math.floor(minutes / 60);
      const mins = Math.round(minutes % 60);
      
      toast.success(`🚗 Tournée créée ! ${selectedSites.length} arrêts • ${distance} km • ${hours}h${mins.toString().padStart(2, '0')}`);
      onSuccess();
      onClose();
    },
    onError: (error: any) => {
      console.error('Error creating tournee:', error);
      toast.error(error.message || 'Impossible de créer la tournée');
    },
    onSettled: () => {
      setIsOptimizing(false);
    },
  });

  const sitesWithCoords = selectedSites.filter(s => s.latitude && s.longitude);
  const sitesWithoutCoords = selectedSites.filter(s => !s.latitude || !s.longitude);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-hidden bg-background">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Route className="w-5 h-5 text-accent" />
            Créer une tournée
          </DialogTitle>
          <DialogDescription>
            {selectedSites.length} prospect{selectedSites.length > 1 ? 's' : ''} sélectionné{selectedSites.length > 1 ? 's' : ''}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Nom de la tournée */}
          <div className="space-y-2">
            <Label htmlFor="nom">Nom de la tournée</Label>
            <Input
              id="nom"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              placeholder="Ex: Tournée Zone Est"
              className="border-accent/30"
            />
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label>Date planifiée</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal border-accent/30",
                    !datePlanifiee && "text-muted-foreground"
                  )}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {datePlanifiee ? format(datePlanifiee, 'PPP', { locale: fr }) : "Choisir une date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 pointer-events-auto" align="start">
                <CalendarComponent
                  mode="single"
                  selected={datePlanifiee}
                  onSelect={(date) => date && setDatePlanifiee(date)}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Sites sélectionnés */}
          <div className="space-y-2">
            <Label>Prospects sélectionnés</Label>
            <ScrollArea className="h-40 rounded-md border border-accent/20 p-2">
              <div className="space-y-2">
                {selectedSites.map((site, index) => (
                  <div 
                    key={site.id} 
                    className={cn(
                      "flex items-center gap-2 p-2 rounded-lg text-sm",
                      site.latitude && site.longitude 
                        ? "bg-accent/10" 
                        : "bg-orange-500/10 border border-orange-500/30"
                    )}
                  >
                    <Badge variant="outline" className="w-6 h-6 rounded-full flex items-center justify-center p-0 text-xs">
                      {index + 1}
                    </Badge>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{site.nom}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {site.ville || site.code_postal || 'Adresse non disponible'}
                      </p>
                    </div>
                    {site.latitude && site.longitude ? (
                      <MapPin className="w-4 h-4 text-green-500 flex-shrink-0" />
                    ) : (
                      <span className="text-xs text-orange-500">Sans GPS</span>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
            {sitesWithoutCoords.length > 0 && (
              <p className="text-xs text-orange-500">
                ⚠️ {sitesWithoutCoords.length} site{sitesWithoutCoords.length > 1 ? 's' : ''} sans coordonnées GPS (exclu{sitesWithoutCoords.length > 1 ? 's' : ''} de l'optimisation)
              </p>
            )}
          </div>

          {/* Estimation */}
          <div className="flex gap-4 p-3 bg-accent/5 rounded-lg border border-accent/20">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-accent" />
              <span className="text-sm">{sitesWithCoords.length} arrêts</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-accent" />
              <span className="text-sm">~{Math.ceil(sitesWithCoords.length * 15 / 60)}h{(sitesWithCoords.length * 15) % 60}min</span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isOptimizing}>
            Annuler
          </Button>
          <Button 
            onClick={() => createTourneeMutation.mutate()}
            disabled={isOptimizing || sitesWithCoords.length < 2 || !nom.trim()}
            className="bg-accent hover:bg-accent/90"
          >
            {isOptimizing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Optimisation...
              </>
            ) : (
              <>
                <Navigation className="w-4 h-4 mr-2" />
                Créer et optimiser
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
