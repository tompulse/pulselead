import { Building2, Navigation, Map, Search, MapPin } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ACTIVITY_CATEGORIES, categorizeActivity, getCategoryLabel } from "@/utils/activityCategories";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EntrepriseDetails } from "./EntrepriseDetails";

interface ListViewProps {
  filters: {
    dateFrom: string;
    dateTo: string;
    categories: string[];
    departments: string[];
  };
}

interface Entreprise {
  id: string;
  nom: string;
  siret: string;
  adresse: string;
  code_postal: string;
  ville?: string;
  code_naf: string;
  statut: string;
  date_demarrage: string;
  numero_voie?: string;
  type_voie?: string;
  nom_voie?: string;
  telephone?: string;
  email?: string;
  forme_juridique?: string;
  capital?: number;
  activite?: string;
  administration?: string;
  latitude?: number;
  longitude?: number;
}

export const ListView = ({ filters }: ListViewProps) => {
  const [entreprises, setEntreprises] = useState<Entreprise[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEntreprise, setSelectedEntreprise] = useState<Entreprise | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  useEffect(() => {
    const fetchEntreprises = async () => {
      setLoading(true);
      
      let query = (supabase as any)
        .from("entreprises")
        .select("*");

      // Apply date filters with null handling
      if (filters.dateFrom || filters.dateTo) {
        query = query.or(`date_demarrage.is.null,and(date_demarrage.gte.${filters.dateFrom || "1900-01-01"},date_demarrage.lte.${filters.dateTo || "2100-12-31"})`);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching entreprises:", error);
        setEntreprises([]);
      } else {
        // Filter by categories if needed
        let filtered = data || [];
        if (filters.categories && filters.categories.length > 0) {
          filtered = filtered.filter((ent: Entreprise) => {
            const codeNaf = ent.code_naf;
            if (!codeNaf) return false;
            
            return filters.categories.some(cat => {
              const categoryRanges = ACTIVITY_CATEGORIES[cat];
              if (!categoryRanges) return false;
              
              return categoryRanges.some(range => {
                if (range.includes('-')) {
                  const [start, end] = range.split('-');
                  return codeNaf >= start && codeNaf <= end;
                }
                return codeNaf.startsWith(range);
              });
            });
          });
        }

        // Filter by departments if selected
        if (filters.departments && filters.departments.length > 0) {
          filtered = filtered.filter((ent: Entreprise) => {
            const codePostal = ent.code_postal;
            if (!codePostal) return false;
            
            // Normaliser le code postal (ajouter 0 devant si nécessaire)
            const normalizedCP = codePostal.length === 4 ? '0' + codePostal : codePostal;
            const dept = normalizedCP.substring(0, 2);
            const deptCorse = normalizedCP.substring(0, 3); // Pour la Corse (2A, 2B)
            
            return filters.departments.includes(dept) || filters.departments.includes(deptCorse);
          });
        }

        setEntreprises(filtered);
      }
      setLoading(false);
    };

    fetchEntreprises();
  }, [filters]);

  // Filter by search query
  const filteredEntreprises = entreprises.filter((ent) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      ent.nom?.toLowerCase().includes(query) ||
      ent.ville?.toLowerCase().includes(query) ||
      ent.code_postal?.includes(query) ||
      ent.activite?.toLowerCase().includes(query)
    );
  });

  const getCategoryInfo = (activity: string | null): { emoji: string; label: string } => {
    const category = categorizeActivity(activity);
    const fullLabel = getCategoryLabel(category);
    const parts = fullLabel.split(' ');
    return {
      emoji: parts[0],
      label: parts.slice(1).join(' ')
    };
  };

  const handleCardClick = (entreprise: Entreprise) => {
    setSelectedEntreprise(entreprise);
    setDetailsOpen(true);
  };

  if (loading) {
    return (
      <div className="glass-card rounded-2xl p-12 flex items-center justify-center shadow-2xl border border-accent/20">
        <div className="text-center space-y-4">
          <div className="animate-spin w-12 h-12 border-4 border-accent border-t-transparent rounded-full mx-auto" />
          <p className="text-muted-foreground font-medium">Chargement des données...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4 h-full flex flex-col overflow-hidden">
        {/* Header with search */}
        <div className="glass-card rounded-2xl p-6 shadow-2xl border border-accent/20 flex-shrink-0">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-accent/10 rounded-lg">
                <Building2 className="w-6 h-6 text-accent" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Liste des entreprises</h3>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {filteredEntreprises.length} résultat{filteredEntreprises.length > 1 ? 's' : ''}
                </p>
              </div>
            </div>
            
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Rechercher une entreprise..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-background/50 border-accent/20 focus:border-accent"
              />
            </div>
          </div>
        </div>

        {/* Cards Grid - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          {filteredEntreprises.length === 0 ? (
            <div className="glass-card rounded-2xl p-16 text-center shadow-2xl border border-accent/20">
              <div className="inline-flex p-4 bg-accent/10 rounded-2xl mb-6">
                <Building2 className="w-20 h-20 text-accent opacity-50" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Aucune entreprise trouvée</h3>
              <p className="text-muted-foreground text-lg max-w-md mx-auto">
                {searchQuery ? "Essayez de modifier votre recherche" : "Cliquez sur 'Synchroniser les données' pour importer vos entreprises"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-4">
              {filteredEntreprises.map((item) => {
                const hasCoordinates = item.latitude && item.longitude;
                const categoryInfo = getCategoryInfo(item.activite);
                
                return (
                  <div
                    key={item.id}
                    onClick={() => handleCardClick(item)}
                    className="glass-card rounded-xl p-5 shadow-lg border border-accent/20 hover:border-accent/40 cursor-pointer transition-all hover:shadow-xl hover:scale-[1.02] bg-gradient-to-br from-card/80 to-card/40"
                  >
                    <div className="space-y-3 mb-4">
                      <h4 className="font-bold text-lg truncate" title={item.nom}>
                        {item.nom}
                      </h4>
                      
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-base flex-shrink-0">{categoryInfo.emoji}</span>
                          <span className="text-muted-foreground truncate">{categoryInfo.label}</span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="w-4 h-4 text-accent flex-shrink-0" />
                          <span className="text-muted-foreground truncate">
                            {item.ville || item.code_postal || "Ville non disponible"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 border-accent/30 hover:bg-accent/10 hover:border-accent"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (hasCoordinates) {
                            window.open(`https://www.google.com/maps/search/?api=1&query=${item.latitude},${item.longitude}`, '_blank');
                          }
                        }}
                        disabled={!hasCoordinates}
                        title={hasCoordinates ? "Ouvrir dans Google Maps" : "Coordonnées non disponibles"}
                      >
                        <Map className="w-4 h-4 mr-1" />
                        Maps
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 border-accent/30 hover:bg-accent/10 hover:border-accent"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (hasCoordinates) {
                            window.open(`https://waze.com/ul?ll=${item.latitude},${item.longitude}&navigate=yes`, '_blank');
                          }
                        }}
                        disabled={!hasCoordinates}
                        title={hasCoordinates ? "Naviguer avec Waze" : "Coordonnées non disponibles"}
                      >
                        <Navigation className="w-4 h-4 mr-1" />
                        Waze
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <EntrepriseDetails
        entreprise={selectedEntreprise ? {
          ...selectedEntreprise,
          latitude: selectedEntreprise.latitude || 0,
          longitude: selectedEntreprise.longitude || 0,
        } : null}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
      />
    </>
  );
};
