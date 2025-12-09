import { useState } from 'react';
import { NouveauxSitesListView } from '@/components/dashboard/NouveauxSitesListView';
import { NafFilters } from '@/components/dashboard/NafFilters';
import { MobileFiltersBar } from '@/components/dashboard/MobileFiltersBar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { nouveauxSitesService } from '@/services/nouveauxSitesService';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

interface ProspectsViewContainerProps {
  filters: any;
  setFilters: React.Dispatch<React.SetStateAction<any>>;
  userId: string;
  onEntrepriseSelect?: (entreprise: any) => void;
}

export const ProspectsViewContainer = ({ 
  filters, 
  setFilters,
  userId,
  onEntrepriseSelect 
}: ProspectsViewContainerProps) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  // État pour le mode tournée
  const [tourneeActive, setTourneeActive] = useState(false);
  const [tourneeName, setTourneeName] = useState('');
  const [tourneeDate, setTourneeDate] = useState('');
  const [selectedSites, setSelectedSites] = useState<any[]>([]);
  const [isOptimizing, setIsOptimizing] = useState(false);

  // Fetch count for filters display
  const { data } = useInfiniteQuery({
    queryKey: ['nouveaux-sites', filters],
    queryFn: ({ pageParam = 0 }) => nouveauxSitesService.fetchNouveauxSites(filters, pageParam),
    getNextPageParam: (lastPage) => lastPage.hasMore ? 1 : undefined,
    initialPageParam: 0,
    staleTime: 5 * 60 * 1000,
  });

  const totalCount = data?.pages[0]?.total || 0;
  const resultsCount = data?.pages[0]?.total || 0;

  // Toggle sélection d'un site
  const handleToggleSelection = (site: any) => {
    setSelectedSites(prev => 
      prev.some(s => s.id === site.id) 
        ? prev.filter(s => s.id !== site.id) 
        : [...prev, site]
    );
  };

  // Toggle mode tournée
  const handleToggleTournee = () => {
    if (tourneeActive) {
      // Réinitialiser
      setTourneeActive(false);
      setTourneeName('');
      setTourneeDate('');
      setSelectedSites([]);
    } else {
      setTourneeActive(true);
      setTourneeDate(format(new Date(), 'yyyy-MM-dd'));
    }
  };

  // Optimiser et créer la tournée
  const handleOptimize = async () => {
    if (selectedSites.length < 2) {
      toast.error('Sélectionnez au moins 2 sites');
      return;
    }
    if (!tourneeName.trim()) {
      toast.error('Donnez un nom à la tournée');
      return;
    }
    if (!tourneeDate) {
      toast.error('Choisissez une date');
      return;
    }

    setIsOptimizing(true);
    
    try {
      // Appel à l'edge function d'optimisation
      const { data: optimizeData, error: optimizeError } = await supabase.functions.invoke('optimize-tournee', {
        body: { 
          entreprises: selectedSites.map(site => ({
            id: site.id,
            nom: site.nom,
            adresse: `${site.numero_voie || ''} ${site.type_voie || ''} ${site.libelle_voie || ''}, ${site.code_postal || ''} ${site.ville || ''}`.trim(),
            latitude: site.latitude,
            longitude: site.longitude
          }))
        }
      });

      if (optimizeError) throw optimizeError;

      // Extraire les données de l'optimisation
      const ordreOptimise = optimizeData?.optimizedOrder?.map((e: any) => e.id) || selectedSites.map(s => s.id);
      const distanceKm = optimizeData?.withTolls?.distance_km || optimizeData?.distance_km || null;
      const tempsMinutes = optimizeData?.withTolls?.duration_minutes || optimizeData?.duration_minutes || null;

      // Sauvegarder la tournée
      const { data: tournee, error: saveError } = await supabase
        .from('tournees')
        .insert({
          user_id: userId,
          nom: tourneeName.trim(),
          date_planifiee: tourneeDate,
          entreprises_ids: selectedSites.map(s => s.id),
          ordre_optimise: ordreOptimise,
          distance_totale_km: distanceKm,
          temps_estime_minutes: tempsMinutes,
          statut: 'planifiee'
        })
        .select()
        .single();

      if (saveError) throw saveError;

      toast.success('Tournée créée avec succès !');
      queryClient.invalidateQueries({ queryKey: ['tournees'] });
      
      // Réinitialiser et naviguer
      setTourneeActive(false);
      setTourneeName('');
      setTourneeDate('');
      setSelectedSites([]);
      
      navigate(`/dashboard/tournee/${tournee.id}`);
    } catch (error) {
      console.error('Erreur création tournée:', error);
      toast.error('Erreur lors de la création de la tournée');
    } finally {
      setIsOptimizing(false);
    }
  };

  const activeFiltersCount = 
    (filters.nafSections?.length || 0) + 
    (filters.nafDivisions?.length || 0) +
    (filters.departments?.length || 0) +
    (filters.taillesEntreprise?.length || 0);

  return (
    <div className="h-full flex flex-col overflow-y-auto lg:overflow-hidden">
      {/* Mobile & Tablet filters bar */}
      <MobileFiltersBar
        filters={filters}
        setFilters={setFilters}
        resultsCount={resultsCount}
        totalCount={totalCount}
        tourneeActive={tourneeActive}
        onToggleTournee={handleToggleTournee}
        tourneeName={tourneeName}
        setTourneeName={setTourneeName}
        tourneeDate={tourneeDate}
        setTourneeDate={setTourneeDate}
        selectedCount={selectedSites.length}
        onOptimize={handleOptimize}
        isOptimizing={isOptimizing}
      />
      
      <div className="flex-1 flex flex-col lg:flex-row gap-4 lg:overflow-hidden p-4 pt-2">
        {/* Sidebar Filtres NAF - Desktop only */}
        <div className="w-64 lg:w-80 shrink-0 glass-card rounded-xl border border-accent/20 overflow-hidden hidden lg:block">
          <ScrollArea className="h-full">
            <NafFilters
              filters={filters}
              setFilters={setFilters}
              resultsCount={resultsCount}
              totalCount={totalCount}
              tourneeActive={tourneeActive}
              onToggleTournee={handleToggleTournee}
              tourneeName={tourneeName}
              setTourneeName={setTourneeName}
              tourneeDate={tourneeDate}
              setTourneeDate={setTourneeDate}
              selectedCount={selectedSites.length}
              onOptimize={handleOptimize}
              isOptimizing={isOptimizing}
            />
          </ScrollArea>
        </div>

        {/* Liste des sites */}
        <div className="flex-1 lg:overflow-hidden">
          <NouveauxSitesListView
            filters={filters}
            onSiteSelect={onEntrepriseSelect}
            userId={userId}
            selectionMode={tourneeActive}
            selectedSites={selectedSites}
            onToggleSelection={handleToggleSelection}
          />
        </div>
      </div>
    </div>
  );
};
