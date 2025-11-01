import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Building2, Calendar, Factory, ChevronLeft, ChevronRight, User, Phone, Mail, Navigation, Briefcase } from "lucide-react";
import { nouveauxSitesService, NouveauxSitesFilters } from "@/services/nouveauxSitesService";
import { getNafCategory } from "@/utils/nafCategories";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { openGoogleMaps } from "@/utils/navigation";

interface NouveauxSitesListViewProps {
  filters: NouveauxSitesFilters;
  onSiteSelect?: (site: any) => void;
}

export const NouveauxSitesListView = ({
  filters,
  onSiteSelect
}: NouveauxSitesListViewProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 50;

  const { data: sitesData, isLoading } = useQuery({
    queryKey: ['nouveaux-sites', filters],
    queryFn: () => nouveauxSitesService.fetchNouveauxSites(filters),
    staleTime: 5 * 60 * 1000,
  });

  // Réinitialiser la page quand les filtres changent
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  const allSites = sitesData?.data || [];
  const totalItems = allSites.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  
  // Calculer les items à afficher pour la page actuelle
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const displayedSites = allSites.slice(startIndex, endIndex);

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
    <div className="space-y-4 h-full flex flex-col overflow-hidden overflow-x-hidden">
      {/* Pagination en haut */}
      {totalItems > 0 && (
        <div className="shrink-0 px-4 py-2 border-b border-accent/20 flex items-center justify-between bg-card/50">
          <div className="text-xs text-muted-foreground">
            Affichage {startIndex + 1}-{Math.min(endIndex, totalItems)} sur {totalItems.toLocaleString('fr-FR')} résultat{totalItems > 1 ? 's' : ''}
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="h-7 w-7 p-0"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <div className="text-xs px-2">
              Page {currentPage} / {totalPages}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="h-7 w-7 p-0"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Cards Grid */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden pr-2">
        {totalItems === 0 ? (
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 pb-4 pr-2">
            {displayedSites.map((site) => {
              const nafInfo = getNafCategory(site.code_naf);
              const hasCoordinates = site.latitude && site.longitude;
              
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
                  onClick={() => onSiteSelect?.(site)}
                  className="group relative rounded-xl p-4 md:p-5 shadow-lg border border-accent/30 transition-colors bg-gradient-to-br from-card/95 to-card/80 backdrop-blur w-full flex flex-col min-h-[280px] overflow-hidden hover:border-accent/50 cursor-pointer"
                >
                  {/* Gradient overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />
                  
                  {/* Header */}
                  <div className="relative flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <h4 className="font-bold text-base md:text-lg gradient-text break-words leading-tight" title={site.nom}>
                        {site.nom}
                      </h4>
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
                        <Briefcase className="w-3.5 h-3.5 text-accent/60 flex-shrink-0" />
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

                  {/* Footer Actions */}
                  {hasCoordinates && (
                    <div className="relative mt-auto pt-3 border-t border-accent/10">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          openGoogleMaps(site.latitude!, site.longitude!);
                        }}
                        className="w-full h-8 text-xs hover:bg-accent/10 border-accent/30"
                      >
                        <Navigation className="w-3.5 h-3.5 mr-1.5" />
                        Itinéraire
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
