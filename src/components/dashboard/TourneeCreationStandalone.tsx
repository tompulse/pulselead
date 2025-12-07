import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  ArrowLeft,
  Calendar as CalendarIcon,
  MapPin, 
  Search,
  Route as RouteIcon,
  Check
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';

interface TourneeCreationStandaloneProps {
  userId: string;
  onClose: () => void;
  onSuccess: () => void;
}

interface NouveauSite {
  id: string;
  nom: string;
  ville: string | null;
  code_postal: string | null;
  latitude: number | null;
  longitude: number | null;
}

export const TourneeCreationStandalone = ({ 
  userId, 
  onClose, 
  onSuccess 
}: TourneeCreationStandaloneProps) => {
  const [tourneeName, setTourneeName] = useState('');
  const [tourneeDate, setTourneeDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSites, setSelectedSites] = useState<NouveauSite[]>([]);
  const queryClient = useQueryClient();

  // Fetch sites with coordinates
  const { data: sites = [], isLoading } = useQuery({
    queryKey: ['sites-for-tournee', searchQuery],
    queryFn: async () => {
      let query = supabase
        .from('nouveaux_sites')
        .select('id, nom, ville, code_postal, latitude, longitude')
        .not('latitude', 'is', null)
        .not('longitude', 'is', null)
        .limit(100);
      
      if (searchQuery) {
        query = query.or(`nom.ilike.%${searchQuery}%,ville.ilike.%${searchQuery}%`);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as NouveauSite[];
    },
  });

  const toggleSite = (site: NouveauSite) => {
    setSelectedSites(prev => {
      const isSelected = prev.some(s => s.id === site.id);
      if (isSelected) {
        return prev.filter(s => s.id !== site.id);
      }
      return [...prev, site];
    });
  };

  // Create tournee mutation
  const createTournee = useMutation({
    mutationFn: async () => {
      if (!tourneeName || !tourneeDate || selectedSites.length < 2) {
        throw new Error('Données incomplètes');
      }

      const { error } = await supabase
        .from('tournees')
        .insert({
          user_id: userId,
          nom: tourneeName,
          date_planifiee: tourneeDate,
          entreprises_ids: selectedSites.map(s => s.id),
          ordre_optimise: selectedSites.map(s => s.id),
          statut: 'planifiee',
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Tournée créée avec succès');
      onSuccess();
    },
    onError: (error) => {
      toast.error('Erreur: ' + error.message);
    },
  });

  return (
    <div className="h-full flex flex-col overflow-hidden p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onClose}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h2 className="text-xl font-bold">Nouvelle tournée</h2>
      </div>

      {/* Form */}
      <Card className="glass-card border-accent/20">
        <CardContent className="p-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-accent font-medium">Nom de la tournée</Label>
            <Input
              id="name"
              placeholder="Ex: Tournée Sud"
              value={tourneeName}
              onChange={(e) => setTourneeName(e.target.value)}
              className="border-accent/30"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-accent font-medium">Date planifiée</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal border-accent/30"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {tourneeDate ? format(new Date(tourneeDate), 'dd/MM/yyyy', { locale: fr }) : 'Choisir une date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 z-50" align="start">
                <Calendar
                  mode="single"
                  selected={tourneeDate ? new Date(tourneeDate) : undefined}
                  onSelect={(date) => setTourneeDate(date ? format(date, 'yyyy-MM-dd') : '')}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </CardContent>
      </Card>

      {/* Sites selection */}
      <Card className="flex-1 overflow-hidden glass-card border-accent/20">
        <CardContent className="p-4 h-full flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <Label className="text-accent font-medium">Sélectionner les sites ({selectedSites.length})</Label>
          </div>

          {/* Search */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un site..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 border-accent/30"
            />
          </div>

          <ScrollArea className="flex-1">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin w-6 h-6 border-2 border-accent border-t-transparent rounded-full" />
              </div>
            ) : (
              <div className="space-y-2">
                {sites.map((site) => {
                  const isSelected = selectedSites.some(s => s.id === site.id);
                  return (
                    <div
                      key={site.id}
                      onClick={() => toggleSite(site)}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        isSelected 
                          ? 'bg-accent/10 border-accent' 
                          : 'bg-card/50 border-accent/20 hover:border-accent/40'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Checkbox checked={isSelected} />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{site.nom}</p>
                          <p className="text-sm text-muted-foreground">
                            {site.code_postal} {site.ville}
                          </p>
                        </div>
                        <MapPin className="w-4 h-4 text-accent/60" />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Create button */}
      <Button
        onClick={() => createTournee.mutate()}
        disabled={!tourneeName || !tourneeDate || selectedSites.length < 2 || createTournee.isPending}
        className="w-full h-12 text-lg font-semibold bg-accent hover:bg-accent/90 text-primary"
      >
        {createTournee.isPending ? (
          <div className="animate-spin w-5 h-5 border-2 border-primary border-t-transparent rounded-full" />
        ) : (
          <>
            <Check className="w-5 h-5 mr-2" />
            Créer la tournée ({selectedSites.length} sites)
          </>
        )}
      </Button>
    </div>
  );
};