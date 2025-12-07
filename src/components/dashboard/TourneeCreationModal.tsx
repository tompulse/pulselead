import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarIcon, Route, Loader2, MapPin, Clock, Navigation } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Site {
  id: string;
  nom: string;
  adresse?: string;
  ville?: string;
  code_postal?: string;
  latitude?: number;
  longitude?: number;
}

interface TourneeCreationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedSites: Site[];
  userId: string;
  onSuccess: () => void;
}

export const TourneeCreationModal = ({
  open,
  onOpenChange,
  selectedSites,
  userId,
  onSuccess
}: TourneeCreationModalProps) => {
  const [nom, setNom] = useState('');
  const [date, setDate] = useState<Date>();
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationResult, setOptimizationResult] = useState<any>(null);
  const queryClient = useQueryClient();

  const createTourneeMutation = useMutation({
    mutationFn: async () => {
      if (!nom.trim()) throw new Error('Veuillez saisir un nom pour la tournée');
      if (!date) throw new Error('Veuillez sélectionner une date');
      if (selectedSites.length < 2) throw new Error('Sélectionnez au moins 2 sites');

      setIsOptimizing(true);

      // Préparer les entreprises pour l'optimisation
      const entreprises = selectedSites.map(site => ({
        id: site.id,
        nom: site.nom,
        latitude: site.latitude || 0,
        longitude: site.longitude || 0,
        adresse: site.adresse,
        ville: site.ville,
        code_postal: site.code_postal
      }));

      console.log('[TourneeCreation] Calling optimize-tournee with', entreprises.length, 'sites');

      // Appeler l'edge function d'optimisation
      const { data: optimData, error: optimError } = await supabase.functions.invoke('optimize-tournee', {
        body: { entreprises }
      });

      if (optimError) {
        console.error('[TourneeCreation] Optimization error:', optimError);
        throw new Error('Erreur lors de l\'optimisation: ' + optimError.message);
      }

      console.log('[TourneeCreation] Optimization result:', optimData);
      setOptimizationResult(optimData);

      // Créer la tournée avec les KPIs
      const { data: tournee, error: insertError } = await supabase
        .from('tournees')
        .insert({
          user_id: userId,
          nom: nom.trim(),
          date_planifiee: format(date, 'yyyy-MM-dd'),
          entreprises_ids: optimData.ordre_optimise || selectedSites.map(s => s.id),
          ordre_optimise: optimData.ordre_optimise || selectedSites.map(s => s.id),
          distance_totale_km: optimData.distance_totale_km || null,
          temps_estime_minutes: optimData.temps_estime_minutes || null,
          statut: 'planifiee'
        })
        .select()
        .single();

      if (insertError) {
        console.error('[TourneeCreation] Insert error:', insertError);
        throw insertError;
      }

      return { tournee, optimData };
    },
    onSuccess: (result) => {
      setIsOptimizing(false);
      queryClient.invalidateQueries({ queryKey: ['tournees', userId] });
      toast.success(
        `Tournée "${nom}" créée avec succès!`,
        {
          description: result.optimData?.explication || `${selectedSites.length} arrêts optimisés`
        }
      );
      onSuccess();
      resetForm();
    },
    onError: (error: Error) => {
      setIsOptimizing(false);
      toast.error('Erreur lors de la création', { description: error.message });
    }
  });

  const resetForm = () => {
    setNom('');
    setDate(undefined);
    setOptimizationResult(null);
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Route className="w-5 h-5 text-accent" />
            Créer une tournée optimisée
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Sites sélectionnés */}
          <div className="p-3 rounded-lg bg-accent/10 border border-accent/20">
            <div className="flex items-center gap-2 text-sm font-medium text-accent">
              <MapPin className="w-4 h-4" />
              {selectedSites.length} site{selectedSites.length > 1 ? 's' : ''} sélectionné{selectedSites.length > 1 ? 's' : ''}
            </div>
            <div className="mt-2 text-xs text-muted-foreground max-h-20 overflow-y-auto">
              {selectedSites.slice(0, 5).map(s => s.nom).join(', ')}
              {selectedSites.length > 5 && `, +${selectedSites.length - 5} autres`}
            </div>
          </div>

          {/* Nom de la tournée */}
          <div className="space-y-2">
            <Label htmlFor="nom">Nom de la tournée *</Label>
            <Input
              id="nom"
              placeholder="Ex: Tournée Centre-Ville"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              className="border-accent/30 focus:border-accent"
            />
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label>Date de la tournée *</Label>
            <Popover modal={true}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal border-accent/30",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, 'PPP', { locale: fr }) : "Sélectionner une date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 z-[100]" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  locale={fr}
                  disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Preview d'optimisation */}
          {optimizationResult && (
            <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/30 space-y-2">
              <div className="text-sm font-medium text-green-500">✓ Itinéraire optimisé</div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-1">
                  <Navigation className="w-3 h-3" />
                  {optimizationResult.distance_totale_km?.toFixed(1)} km
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {Math.floor((optimizationResult.temps_estime_minutes || 0) / 60)}h
                  {((optimizationResult.temps_estime_minutes || 0) % 60).toString().padStart(2, '0')}
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isOptimizing}>
            Annuler
          </Button>
          <Button
            onClick={() => createTourneeMutation.mutate()}
            disabled={!nom.trim() || !date || isOptimizing}
            className="bg-accent hover:bg-accent/90 text-primary"
          >
            {isOptimizing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Optimisation...
              </>
            ) : (
              <>
                <Route className="w-4 h-4 mr-2" />
                Créer la tournée
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
