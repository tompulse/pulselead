import { useState, useMemo } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Loader2, Factory } from "lucide-react";
import { nouveauxSitesService, NouveauxSitesFilters } from "@/services/nouveauxSitesService";
import { getNafCategory } from "@/utils/nafCategories";
import { formatDateCreation } from "@/utils/formatDateSafe";
import { fr } from "date-fns/locale";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { ProspectStatusBadge, ProspectStatus } from "./ProspectStatusBadge";
import { useProspectStatuses } from "@/hooks/useProspectStatuses";
import { RelatedEstablishmentsCard } from "./RelatedEstablishmentsCard";
import { getCategoryLabel } from "@/utils/nafToCategory";
interface NouveauxSitesListViewProps {
  filters: NouveauxSitesFilters;
  onSiteSelect?: (site: any) => void;
  selectionMode?: boolean;
  selectedSites?: any[];
  onToggleSelection?: (site: any) => void;
  userId?: string;
}

export const NouveauxSitesListView = ({ 
  filters, 
  onSiteSelect,
  selectionMode = false,
  selectedSites = [],
  onToggleSelection,
  userId
}: NouveauxSitesListViewProps) => {
  // State for flip card - shows related establishments
  const [expandedCard, setExpandedCard] = useState<{ siteId: string; name: string; relatedIds: string[] } | null>(null);
  
  // 🔥 PLUS DE SYSTÈME FREE/PRO - Accès total pour tous
  const isPro = true; // Toujours true = accès illimité
  const isProspectUnlocked = () => true; // Tous les prospects sont débloqués
  // Détecter si des filtres sont actifs
  const hasFilters = 
    (filters.nafSections?.length || 0) > 0 ||
    (filters.nafDivisions?.length || 0) > 0 ||
    (filters.departments?.length || 0) > 0 ||
    (filters.categoriesJuridiques?.length || 0) > 0 ||
    (filters.typesEtablissement?.length || 0) > 0 ||
    (filters.searchQuery?.trim() || '').length > 0 ||
    filters.dateCreationFrom ||
    filters.dateCreationTo;

  const { 
    data, 
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useInfiniteQuery({
    queryKey: ['nouveaux-sites', filters],
    queryFn: ({ pageParam = 0 }) => nouveauxSitesService.fetchNouveauxSites(filters, pageParam),
    getNextPageParam: (lastPage, allPages) => {
      // Si filtres actifs, ne pas paginer (tout est chargé d'un coup)
      return hasFilters ? undefined : (lastPage.hasMore ? allPages.length : undefined);
    },
    initialPageParam: 0,
    staleTime: 5 * 60 * 1000,
  });

  const allSites = data?.pages.flatMap(page => page.data) || [];
  const totalCount = data?.pages[0]?.total || 0;
  const errorMessage = error instanceof Error ? error.message : (error as string) || '';

  // Plus de filtrage par unlock - tous les sites sont affichés
  const filteredSites = allSites;

  // Get all entreprise IDs for status lookup
  const entrepriseIds = useMemo(() => allSites.map(site => site.id), [allSites]);
  
  // Fetch statuses for displayed prospects
  const { data: statusMap = {} } = useProspectStatuses(userId || null, entrepriseIds);

  const sentinelRef = useInfiniteScroll({
    onLoadMore: fetchNextPage,
    hasMore: !!hasNextPage,
    isLoading: isFetchingNextPage,
  });

  if (isLoading) {
    return (
      <div className="glass-card rounded-2xl p-12 flex items-center justify-center shadow-2xl border border-accent/20">
        <div className="text-center space-y-4">
          <div className="animate-spin w-12 h-12 border-4 border-accent border-t-transparent rounded-full mx-auto" />
          <p className="text-muted-foreground font-medium">Chargement des sites...</p>
        </div>
      </div>
    );
  }

  if (isError && errorMessage) {
    return (
      <div className="glass-card rounded-2xl p-8 sm:p-12 flex items-center justify-center shadow-2xl border border-red-500/20 bg-red-500/5">
        <div className="text-center space-y-4 max-w-lg">
          <h3 className="text-xl font-bold text-red-600 dark:text-red-400">Impossible de charger les prospects</h3>
          <p className="text-sm text-muted-foreground font-mono break-all">{errorMessage}</p>
          <p className="text-sm text-muted-foreground">
            Vérifie que la table <strong>nouveaux_sites</strong> existe dans ton projet Supabase (même nom que l’URL de l’app) et que tu as exécuté le script <strong>ACTIVER_NOUVEAUX_SITES_POUR_PULSE.sql</strong> dans Supabase → SQL Editor.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col lg:overflow-hidden">
      <div className="flex-1 overflow-y-auto lg:overflow-y-auto pr-3" style={{ WebkitOverflowScrolling: 'touch' }}>
        {isLoading && filteredSites.length === 0 ? (
          <div className="glass-card rounded-2xl p-16 text-center shadow-2xl border border-accent/20">
            <Loader2 className="w-12 h-12 animate-spin mx-auto text-accent mb-4" />
            <p className="text-muted-foreground text-lg">Chargement des sites...</p>
          </div>
        ) : filteredSites.length === 0 ? (
          <div className="glass-card rounded-2xl p-16 text-center shadow-2xl border border-accent/20">
            <div className="inline-flex p-4 bg-accent/10 rounded-2xl mb-6">
              <Factory className="w-20 h-20 text-accent opacity-50" />
            </div>
            <h3 className="text-2xl font-bold mb-3">Aucun site trouvé</h3>
            <p className="text-muted-foreground text-lg max-w-md mx-auto">
              {filters.searchQuery ? "Essayez de modifier votre recherche" : filters.showUnlockedOnly ? "Aucun prospect débloqué" : "Importez vos nouveaux sites pour commencer"}
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-2 sm:gap-3">
              {filteredSites.map((site) => {
              const nafInfo = getNafCategory(site.code_naf);
              const hasCoordinates = site.latitude && site.longitude;
              const isSelected = selectedSites.some(s => s.id === site.id);
              const prospectStatus = statusMap[site.id] as ProspectStatus | undefined;
              
              // Tous les prospects sont accessibles - pas de vérification
              const canSeeDetails = true;
              
              // Construire l'adresse complète
              const addressParts = [
                site.numero_voie,
                site.type_voie,
                site.libelle_voie
              ].filter(Boolean).join(' ');
              
              // Construire l'adresse avec code postal et ville
              const cityPart = [site.code_postal, site.ville].filter(Boolean).join(' ');
              
              const fullAddress = addressParts 
                ? `${addressParts}, ${cityPart}`.trim()
                : cityPart;
              
              // Debug: Log si la ville est manquante
              if (!site.ville && site.code_postal) {
                console.warn(`[${site.nom}] Ville manquante pour code postal ${site.code_postal}`, site);
              }
              
              return (
                <div
                  key={site.id}
                  onClick={() => {
                    if (selectionMode && onToggleSelection) {
                      onToggleSelection(site);
                    }
                  }}
                  className={`group relative rounded-xl p-3 sm:p-4 shadow-lg border transition-colors bg-gradient-to-br backdrop-blur w-full flex flex-col min-h-[180px] sm:min-h-[200px] md:min-h-[220px] overflow-hidden border-accent/30 from-card/95 to-card/80 ${
                    selectionMode ? 'cursor-pointer' : ''
                  }`}
                >
                  {/* Gradient overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />
                  
                  {/* Header */}
                  <div className="relative flex items-start justify-between gap-2 mb-2 sm:mb-3">
                    <div className="flex items-center gap-1.5 sm:gap-2 flex-1 min-w-0">
                      {selectionMode && (
                        <div className={`flex-shrink-0 w-4 h-4 sm:w-5 sm:h-5 rounded border-2 transition-all ${
                          isSelected 
                            ? 'bg-accent border-accent' 
                            : 'border-accent/50'
                        } flex items-center justify-center`}>
                          {isSelected && <span className="text-primary text-[10px] sm:text-xs font-bold">✓</span>}
                        </div>
                      )}
                      <div className="flex items-center gap-1.5 sm:gap-2 flex-1 min-w-0">
                        <h4 className="font-bold text-sm sm:text-base gradient-text line-clamp-2 leading-tight" title={site.nom}>
                          {site.nom}
                        </h4>
                        {(site as any).multipleCreations && (
                          <Badge 
                            variant="secondary" 
                            className="text-[10px] sm:text-xs bg-orange-500/20 text-orange-600 dark:text-orange-400 border-orange-500/30 shrink-0 cursor-pointer hover:bg-orange-500/30 hover:scale-105 transition-all"
                            onClick={(e) => {
                              e.stopPropagation();
                              setExpandedCard({
                                siteId: site.id,
                                name: site.nom,
                                relatedIds: (site as any).relatedIds || [site.id]
                              });
                            }}
                          >
                            ×{(site as any).multipleCreations}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-0.5 sm:gap-1 shrink-0">
                      {/* Status badge - prominent position */}
                      {prospectStatus && (
                        <ProspectStatusBadge status={prospectStatus} />
                      )}
                      {/* Siège ou Site secondaire - DÉSACTIVÉ */}
                      {/* Taille entreprise - N'afficher que PME, ETI, GE */}
                      {site.categorie_entreprise && 
                       site.categorie_entreprise !== 'Non spécifié' &&
                       site.categorie_entreprise !== 'Taille inconnue, nouvelle entité' &&
                       site.categorie_entreprise.trim() !== '' && (
                        <Badge variant="secondary" className="text-[10px] sm:text-xs bg-accent/20 text-accent border-accent/30">
                          {site.categorie_entreprise}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="relative space-y-1.5 sm:space-y-2 flex-1 overflow-y-auto custom-scrollbar pr-1">
                    {/* Catégorie d'activité */}
                    <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
                      <span className="text-xs sm:text-sm font-medium text-accent line-clamp-1">
                        {getCategoryLabel(site.code_naf)}
                      </span>
                    </div>

                    {/* Code NAF (optionnel, plus discret) */}
                    {site.code_naf && (
                      <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
                        <span className="text-[10px] sm:text-xs flex-shrink-0">🏷️</span>
                        <span className="text-[10px] sm:text-xs text-foreground/40 font-mono">NAF: {site.code_naf}</span>
                      </div>
                    )}

                    {/* SIRET */}
                    {site.siret && (
                      <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
                        <span className="text-[10px] sm:text-xs flex-shrink-0">🏛️</span>
                        <span className="text-[10px] sm:text-xs text-foreground/60 font-mono truncate">
                          {site.siret.replace(/(\d{3})(\d{3})(\d{3})(\d{5})/, '$1 $2 $3 $4')}
                        </span>
                      </div>
                    )}
                    
                    {/* Adresse */}
                    {fullAddress && (
                      <div className="flex items-start gap-1.5 sm:gap-2 text-xs sm:text-sm">
                        <span className="text-[10px] sm:text-xs flex-shrink-0">📍</span>
                        <span className="text-[10px] sm:text-xs text-foreground/80 line-clamp-2 break-words">{fullAddress}</span>
                      </div>
                    )}

                    {/* Date de création - Always visible */}
                    {site.date_creation && formatDateCreation(site.date_creation) && (
                      <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
                        <span className="text-[10px] sm:text-xs flex-shrink-0">📅</span>
                        <span className="text-[10px] sm:text-xs text-foreground/60">
                          Créé le {formatDateCreation(site.date_creation)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Flip Card - Related Establishments */}
                  {expandedCard?.siteId === site.id && (
                    <RelatedEstablishmentsCard
                      companyName={expandedCard.name}
                      relatedIds={expandedCard.relatedIds}
                      onClose={() => setExpandedCard(null)}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* Sentinel for infinite scroll - invisible */}
          <div ref={sentinelRef} />

          {/* Loading indicator */}
          {isFetchingNextPage && (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-6 h-6 animate-spin text-accent" />
            </div>
          )}

          {/* Display total count */}
          <div className="text-center py-4 text-sm text-muted-foreground">
            {filteredSites.length} {filters.showUnlockedOnly ? 'prospect(s) débloqué(s)' : `/ ${totalCount} sites affichés`}
          </div>
        </>
        )}
      </div>

    </div>
  );
};
