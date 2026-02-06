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
import { LoadingState, SkeletonTable } from '@/components/ui/loading-state';
import { ErrorMessage } from '@/components/ui/error-message';

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
  
  // 🔥 PLUS DE SYSTÈME FREE/PRO - Accès total pour tous
  const isPro = true; // Toujours true = accès illimité pour tous
  
  // État pour le mode tournée
  const [tourneeActive, setTourneeActive] = useState(false);
  const [tourneeName, setTourneeName] = useState('');
  const [tourneeDate, setTourneeDate] = useState('');
  const [selectedSites, setSelectedSites] = useState<any[]>([]);
  const [isOptimizing, setIsOptimizing] = useState(false);
  
  // État pour le point de départ
  const [startAddress, setStartAddress] = useState('');
  const [startLat, setStartLat] = useState<number>(0);
  const [startLng, setStartLng] = useState<number>(0);

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

  // Gestion du point de départ
  const handleStartPointChange = (address: string, lat: number, lng: number) => {
    setStartAddress(address);
    setStartLat(lat);
    setStartLng(lng);
  };

  // Toggle mode tournée
  const handleToggleTournee = () => {
    if (tourneeActive) {
      // Réinitialiser
      setTourneeActive(false);
      setTourneeName('');
      setTourneeDate('');
      setSelectedSites([]);
      setStartAddress('');
      setStartLat(0);
      setStartLng(0);
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

    // Plus de limite de tournées - accès illimité pour tous

    setIsOptimizing(true);
    
    try {
      // Vérifier l'authentification avant d'appeler la fonction
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Session expirée. Veuillez vous reconnecter.');
      }

      // Appel à l'edge function d'optimisation
      const { data: optimizeData, error: optimizeError } = await supabase.functions.invoke('optimize-tournee', {
        body: { 
          entreprises: selectedSites.map(site => ({
            id: site.id,
            nom: site.nom,
            adresse: `${site.numero_voie || ''} ${site.type_voie || ''} ${site.libelle_voie || ''}, ${site.code_postal || ''} ${site.ville || ''}`.trim(),
            ville: site.ville,
            code_postal: site.code_postal,
            latitude: Number(site.latitude) || null,
            longitude: Number(site.longitude) || null
          })),
          // Inclure le point de départ si défini (utiliser point_depart comme attendu par l'edge function)
          point_depart: startLat && startLng ? {
            lat: startLat,
            lng: startLng
          } : undefined
        }
      });

      if (optimizeError) throw optimizeError;

      // Extraire les données de l'optimisation (noms corrects des champs retournés)
      const ordreOptimise = optimizeData?.ordre_optimise || selectedSites.map(s => s.id);
      const distanceKm = optimizeData?.distance_totale_km || null;
      const tempsMinutes = optimizeData?.temps_estime_minutes || null;

      // Sauvegarder la tournée avec le point de départ
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
          statut: 'planifiee',
          point_depart_lat: startLat || null,
          point_depart_lng: startLng || null
        })
        .select()
        .single();

      if (saveError) throw saveError;

      // Plus de comptage de tournées - accès illimité pour tous

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
    <div className="h-full flex flex-col overflow-hidden">
      {/* Mobile & Tablet filters bar - Fixed */}
      <div className="shrink-0 lg:hidden">
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
          startAddress={startAddress}
          startLat={startLat}
          startLng={startLng}
          onStartPointChange={handleStartPointChange}
        />
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-4 overflow-hidden p-4 pt-2">
        {/* Sidebar Filtres NAF - Desktop only - Fixed */}
        <div className="w-64 lg:w-80 shrink-0 glass-card rounded-xl border border-accent/20 overflow-hidden hidden lg:flex lg:flex-col">
          <ScrollArea className="flex-1">
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
              startAddress={startAddress}
              startLat={startLat}
              startLng={startLng}
              onStartPointChange={handleStartPointChange}
            />
          </ScrollArea>
        </div>

        {/* Liste des sites - Scrollable */}
        <div className="flex-1 overflow-y-auto">
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
