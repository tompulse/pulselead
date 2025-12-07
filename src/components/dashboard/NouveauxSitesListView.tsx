import { useInfiniteQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Building2, Calendar, Factory, Loader2, Eye } from "lucide-react";
import { nouveauxSitesService, NouveauxSitesFilters } from "@/services/nouveauxSitesService";
import { getNafCategory } from "@/utils/nafCategories";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";

interface NouveauxSitesListViewProps {
  filters: NouveauxSitesFilters;
  onSiteSelect?: (site: any) => void;
  selectionMode?: boolean;
  selectedSites?: any[];
  onToggleSelection?: (site: any) => void;
}

export const NouveauxSitesListView = ({ 
  filters, 
  onSiteSelect,
  selectionMode = false,
  selectedSites = [],
  onToggleSelection
}: NouveauxSitesListViewProps) => {
  const { 
    data, 
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useInfiniteQuery({
    queryKey: ['nouveaux-sites', filters],
    queryFn: ({ pageParam = 0 }) => nouveauxSitesService.fetchNouveauxSites(filters, pageParam),
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.hasMore ? allPages.length : undefined;
    },
    initialPageParam: 0,
    staleTime: 5 * 60 * 1000,
  });

  const allSites = data?.pages.flatMap(page => page.data) || [];
  const totalCount = data?.pages[0]?.total || 0;

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

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto hide-scrollbar">
        {isLoading && allSites.length === 0 ? (
          <div className="glass-card rounded-2xl p-16 text-center shadow-2xl border border-accent/20">
            <Loader2 className="w-12 h-12 animate-spin mx-auto text-accent mb-4" />
            <p className="text-muted-foreground text-lg">Chargement des sites...</p>
          </div>
        ) : allSites.length === 0 ? (
          <div className="glass-card rounded-2xl p-16 text-center shadow-2xl border border-accent/20">
            <div className="inline-flex p-4 bg-accent/10 rounded-2xl mb-6">
              <Factory className="w-20 h-20 text-accent opacity-50" />
            </div>
            <h3 className="text-2xl font-bold mb-3">Aucun site trouvé</h3>
            <p className="text-muted-foreground text-lg max-w-md mx-auto">
              {filters.searchQuery ? "Essayez de modifier votre recherche" : "Importez vos nouveaux sites pour commencer"}
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {allSites.map((site) => {
              const nafInfo = getNafCategory(site.code_naf);
              const hasCoordinates = site.latitude && site.longitude;
              const isSelected = selectedSites.some(s => s.id === site.id);
              
              // Format address
              const addressParts = [
                site.numero_voie,
                site.type_voie,
                site.libelle_voie
              ].filter(Boolean).join(' ');
              
              const fullAddress = addressParts 
                ? `${addressParts}, ${site.code_postal} ${site.ville || ''}`
                : `${site.code_postal || ''} ${site.ville || ''}`.trim();
              
              return (
                <div
                  key={site.id}
                  onClick={() => {
                    if (selectionMode && onToggleSelection) {
                      onToggleSelection(site);
                    }
                  }}
                  className={`group relative rounded-xl p-4 md:p-5 shadow-lg border transition-colors bg-gradient-to-br backdrop-blur w-full flex flex-col min-h-[280px] overflow-hidden ${
                    selectionMode 
                      ? isSelected
                        ? 'border-accent bg-accent/10 cursor-pointer hover:bg-accent/15'
                        : 'border-accent/30 from-card/95 to-card/80 cursor-pointer hover:border-accent/50 hover:bg-accent/5'
                      : 'border-accent/30 from-card/95 to-card/80 hover:border-accent/50'
                  }`}
                >
                  {/* Gradient overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />
                  
                  {/* Header */}
                  <div className="relative flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {selectionMode && (
                        <div className={`flex-shrink-0 w-5 h-5 rounded border-2 transition-all ${
                          isSelected 
                            ? 'bg-accent border-accent' 
                            : 'border-accent/50'
                        } flex items-center justify-center`}>
                          {isSelected && <span className="text-primary text-xs font-bold">✓</span>}
                        </div>
                      )}
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <h4 className="font-bold text-base md:text-lg gradient-text break-words leading-tight" title={site.nom}>
                          {site.nom}
                        </h4>
                        {(site as any).multipleCreations && (
                          <Badge variant="secondary" className="text-xs bg-orange-500/20 text-orange-600 dark:text-orange-400 border-orange-500/30 shrink-0">
                            ×{(site as any).multipleCreations}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      {site.est_siege && (
                        <Badge variant="secondary" className="text-xs bg-accent/20 text-accent border-accent/30">
                          Siège
                        </Badge>
                      )}
                      {site.categorie_entreprise && (
                        <Badge variant="outline" className="text-xs">
                          {site.categorie_entreprise}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="relative space-y-2 mb-4 flex-1 overflow-y-auto custom-scrollbar pr-1">
                    {/* Secteur NAF */}
                    {nafInfo && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-xs">{nafInfo.category.emoji}</span>
                        <span className="text-xs text-foreground/60">{nafInfo.category.label}</span>
                      </div>
                    )}

                    {/* Code NAF */}
                    {site.code_naf && (
                      <div className="flex items-center gap-2 text-sm">
                        <Building2 className="w-3.5 h-3.5 text-accent/60 flex-shrink-0" />
                        <span className="text-xs text-foreground/60">NAF: {site.code_naf}</span>
                      </div>
                    )}

                    {/* SIRET */}
                    {site.siret && (
                      <div className="flex items-center gap-2 text-sm">
                        <Factory className="w-3.5 h-3.5 text-accent/60 flex-shrink-0" />
                        <span className="text-xs text-foreground/60 font-mono">{site.siret}</span>
                      </div>
                    )}
                    
                    {/* Adresse */}
                    {fullAddress && (
                      <div className="flex items-start gap-2 text-sm">
                        <MapPin className="w-3.5 h-3.5 text-accent/60 flex-shrink-0 mt-0.5" />
                        <span className="text-xs text-foreground/60">{fullAddress}</span>
                      </div>
                    )}

                    {/* Date de création */}
                    {site.date_creation && (
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-3.5 h-3.5 text-accent/60 flex-shrink-0" />
                        <span className="text-xs text-foreground/60">
                          Créé le {format(new Date(site.date_creation), 'dd MMM yyyy', { locale: fr })}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* CRM Button - only show when not in selection mode */}
                  {!selectionMode && onSiteSelect && (
                    <div className="relative mt-auto pt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSiteSelect(site);
                        }}
                        className="w-full border-accent/30 hover:bg-accent/10 hover:border-accent"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Voir détails / CRM
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Sentinel for infinite scroll */}
          <div ref={sentinelRef} className="h-20 flex items-center justify-center">
            {isFetchingNextPage && (
              <Loader2 className="w-8 h-8 animate-spin text-accent" />
            )}
          </div>

          {/* Display total count */}
          <div className="text-center py-4 text-sm text-muted-foreground">
            {allSites.length} / {totalCount} sites affichés
          </div>
        </>
        )}
      </div>
    </div>
  );
};