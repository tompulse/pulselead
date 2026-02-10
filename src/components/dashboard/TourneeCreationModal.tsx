import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Calendar as CalendarIcon, Route, Loader2, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';

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
  const queryClient = useQueryClient();

  const createTourneeMutation = useMutation({
    mutationFn: async () => {
      if (!nom.trim()) throw new Error('Veuillez saisir un nom pour la tournée');
      if (!date) throw new Error('Veuillez sélectionner une date');
      if (selectedSites.length < 2) throw new Error('Sélectionnez au moins 2 sites');

      setIsOptimizing(true);

      // Préparer les entreprises pour l'optimisation - ne garder que celles avec coordonnées
      const entreprises = selectedSites
        .filter(site => site.latitude && site.longitude)
        .map(site => ({
          id: site.id,
          nom: site.nom,
          latitude: Number(site.latitude),
          longitude: Number(site.longitude),
          adresse: site.adresse || '',
          ville: site.commune || '',
          code_postal: site.code_postal || ''
        }));

      console.log('[TourneeCreation] Calling optimize-tournee with', entreprises.length, 'valid sites');

      if (entreprises.length < 2) {
        throw new Error('Au moins 2 sites avec coordonnées GPS sont nécessaires');
      }

      // Vérifier l'authentification avant d'appeler la fonction
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Session expirée. Veuillez vous reconnecter.');
      }

      // Appeler l'edge function d'optimisation
      const { data: optimData, error: optimError } = await supabase.functions.invoke('optimize-tournee', {
        body: { entreprises }
      });

      if (optimError) {
        console.error('[TourneeCreation] Optimization error:', optimError);
        throw new Error('Erreur lors de l\'optimisation: ' + optimError.message);
      }

      console.log('[TourneeCreation] Optimization result:', optimData);
      
      // Vérifier si l'optimisation a réussi
      if (optimData.error) {
        console.error('[TourneeCreation] API returned error:', optimData.error);
        throw new Error(optimData.error);
      }

      // Utiliser les données optimisées ou fallback sur l'ordre original
      const ordreOptimise = optimData.ordre_optimise || entreprises.map(e => e.id);
      const distanceKm = optimData.distance_totale_km ?? null;
      const tempsMin = optimData.temps_estime_minutes ?? null;

      console.log('[TourneeCreation] Saving tournee with:', { ordreOptimise, distanceKm, tempsMin });

      // Utiliser les IDs originaux des sites sélectionnés (pas ceux retournés par optimize)
      const entreprisesIds = selectedSites.map(s => s.id);

      // Créer la tournée avec les KPIs
      const { data: tournee, error: insertError } = await supabase
        .from('tournees')
        .insert({
          user_id: userId,
          nom: nom.trim(),
          date_planifiee: format(date, 'yyyy-MM-dd'),
          entreprises_ids: entreprisesIds,
          ordre_optimise: ordreOptimise,
          distance_totale_km: distanceKm,
          temps_estime_minutes: tempsMin,
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
            {date ? (
              <div className="flex items-center gap-2">
                <div className="flex-1 p-3 rounded-lg border border-accent/30 bg-accent/5">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <CalendarIcon className="w-4 h-4 text-accent" />
                    {format(date, 'EEEE d MMMM yyyy', { locale: fr })}
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDate(undefined)}
                  className="border-accent/30"
                >
                  Modifier
                </Button>
              </div>
            ) : (
              <div className="border border-accent/30 rounded-lg overflow-hidden">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  locale={fr}
                  disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))}
                  className="p-3 pointer-events-auto w-full"
                />
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={createTourneeMutation.isPending}
            className="border-accent/30"
          >
            Annuler
          </Button>
          <Button
            onClick={() => createTourneeMutation.mutate()}
            disabled={!nom.trim() || !date || createTourneeMutation.isPending || selectedSites.length < 2}
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
