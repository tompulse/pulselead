import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Building2, Calendar, Factory, ChevronLeft, ChevronRight } from "lucide-react";
import { nouveauxSitesService, NouveauxSitesFilters } from "@/services/nouveauxSitesService";
import { getNafCategory } from "@/utils/nafCategories";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

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
  useState(() => {
    setCurrentPage(1);
  });

  const allSites = sitesData?.data || [];
  const totalItems = allSites.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  
  // Calculer les items à afficher pour la page actuelle
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const displayedSites = allSites.slice(startIndex, endIndex);

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center space-y-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto"></div>
          <p className="text-sm text-muted-foreground">Chargement des sites...</p>
        </div>
      </div>
    );
  }

  if (totalItems === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center space-y-2">
          <Building2 className="w-12 h-12 text-muted-foreground mx-auto" />
          <p className="text-sm text-muted-foreground">Aucun site trouvé</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Pagination en haut */}
      <div className="shrink-0 px-4 py-2 border-b border-accent/20 flex items-center justify-between">
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

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-3">
          {displayedSites.map((site) => {
          const nafInfo = getNafCategory(site.code_naf);
          
          return (
            <Card
              key={site.id}
              onClick={() => onSiteSelect?.(site)}
              className="p-4 hover:shadow-md transition-all cursor-pointer border-accent/20 hover:border-accent/40"
            >
              <div className="space-y-3">
                {/* En-tête */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-base truncate">{site.nom}</h3>
                    <p className="text-xs text-muted-foreground font-mono">{site.siret}</p>
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

                {/* Secteur NAF */}
                {nafInfo && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-lg">{nafInfo.category.emoji}</span>
                    <span className="text-muted-foreground">{nafInfo.category.label}</span>
                    <Badge variant="outline" className="text-xs font-mono">
                      {site.code_naf}
                    </Badge>
                  </div>
                )}

                {/* Localisation */}
                <div className="flex items-start gap-2 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-accent" />
                  <div className="flex-1 min-w-0">
                    {site.adresse && <p className="truncate">{site.adresse}</p>}
                    <p className="truncate">
                      {site.code_postal} {site.ville}
                    </p>
                  </div>
                </div>

                {/* Date de création */}
                {site.date_creation && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>
                      Créé le {format(new Date(site.date_creation), 'dd MMMM yyyy', { locale: fr })}
                    </span>
                  </div>
                )}

                {/* Footer avec coordonnées */}
                {site.latitude && site.longitude && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t border-accent/10">
                    <Factory className="w-3.5 h-3.5" />
                    <span className="font-mono">
                      {site.latitude.toFixed(6)}, {site.longitude.toFixed(6)}
                    </span>
                  </div>
                )}
              </div>
            </Card>
          );
          })}
        </div>
      </ScrollArea>
    </div>
  );
};
