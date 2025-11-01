import { Building2, Navigation, Map, Search, MapPin, MessageSquare, Bell, Calendar, DollarSign, User, Car, Phone, CalendarCheck, StickyNote, Briefcase, Clock, Mail, Users, Building, TrendingUp, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState, useMemo, memo, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { categorizeActivity, getCategoryLabel } from "@/utils/activityCategories";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { openGoogleMaps, openWaze } from "@/utils/navigation";
import { useIsMobile } from "@/hooks/use-mobile";
import { LeadStatusBadge } from "./LeadStatusBadge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useDebounce } from "@/hooks/useDebounce";

interface ListViewProps {
  filters: {
    dateFrom: string;
    dateTo: string;
    categories: string[];
    departments: string[];
    formesJuridiques?: string[];
    searchQuery?: string;
    typeEvenement?: string[];
    activiteDefinie?: boolean | null;
  };
  onEntrepriseSelect?: (entreprise: Entreprise) => void;
  selectionMode?: boolean;
  selectedEntreprises?: Entreprise[];
  onToggleSelection?: (entreprise: Entreprise) => void;
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
  effectifs?: number;
  chiffre_affaires?: number;
  site_web?: string;
  categorie_qualifiee?: string;
  categorie_confidence?: number;
}

export const ListView = ({ 
  filters, 
  onEntrepriseSelect,
  selectionMode = false,
  selectedEntreprises = [],
  onToggleSelection
}: ListViewProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 50;
  
  const [crmData, setCrmData] = useState<Record<string, { 
    status: any; 
    interactionCount: number; 
    hasUpcomingAction: boolean;
    hasAppel: boolean;
    hasVisite: boolean;
    hasRdv: boolean;
  }>>({});
  const isMobile = useIsMobile();
  const { toast } = useToast();
  
  // Use the dashboard data hook with the service
  const { entreprises, isLoading: loading } = useDashboardData(filters);

  useEffect(() => {
    // Fetch CRM data for all entreprises
    const fetchCRMData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: statusData } = await supabase
        .from('lead_statuts')
        .select('entreprise_id, statut_actuel, probabilite')
        .eq('user_id', user.id);

      const { data: interactionsData } = await supabase
        .from('lead_interactions')
        .select('entreprise_id, date_prochaine_action, type')
        .eq('user_id', user.id);

      const crmMap: Record<string, any> = {};
      
      statusData?.forEach(status => {
        if (!crmMap[status.entreprise_id]) {
          crmMap[status.entreprise_id] = { 
            status, 
            interactionCount: 0, 
            hasUpcomingAction: false,
            hasAppel: false,
            hasVisite: false,
            hasRdv: false
          };
        } else {
          crmMap[status.entreprise_id].status = status;
        }
      });

      interactionsData?.forEach(interaction => {
        if (!crmMap[interaction.entreprise_id]) {
          crmMap[interaction.entreprise_id] = { 
            status: null, 
            interactionCount: 0, 
            hasUpcomingAction: false,
            hasAppel: false,
            hasVisite: false,
            hasRdv: false
          };
        }
        crmMap[interaction.entreprise_id].interactionCount++;
        
        // Track interaction types
        if (interaction.type === 'appel') {
          crmMap[interaction.entreprise_id].hasAppel = true;
        } else if (interaction.type === 'visite') {
          crmMap[interaction.entreprise_id].hasVisite = true;
        } else if (interaction.type === 'rdv') {
          crmMap[interaction.entreprise_id].hasRdv = true;
        }
        
        if (interaction.date_prochaine_action) {
          const actionDate = new Date(interaction.date_prochaine_action);
          if (actionDate >= new Date()) {
            crmMap[interaction.entreprise_id].hasUpcomingAction = true;
          }
        }
      });

      setCrmData(crmMap);
    };

    fetchCRMData();

    // Refresh CRM data when component gains focus (e.g., returning from Activities view)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchCRMData();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [filters]);

  // Debounce search query for better performance
  const debouncedSearchQuery = useDebounce(filters.searchQuery || "", 300);
  
  // Filter by search query with useMemo for optimization
  const filteredEntreprises = useMemo(() => {
    if (!debouncedSearchQuery) return entreprises;
    const query = debouncedSearchQuery.toLowerCase();
    return entreprises.filter((ent) =>
      ent.nom?.toLowerCase().includes(query) ||
      ent.ville?.toLowerCase().includes(query) ||
      ent.code_postal?.includes(query) ||
      ent.activite?.toLowerCase().includes(query) ||
      ent.forme_juridique?.toLowerCase().includes(query)
    );
  }, [entreprises, debouncedSearchQuery]);

  // Réinitialiser la page quand les filtres changent
  useEffect(() => {
    setCurrentPage(1);
  }, [filters, debouncedSearchQuery]);

  // Pagination
  const totalItems = filteredEntreprises.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const displayedEntreprises = filteredEntreprises.slice(startIndex, endIndex);

  const getCategoryInfo = useCallback((activity: string | null, qualifiedCategory?: string | null): { emoji: string; label: string } => {
    const category = categorizeActivity(activity, qualifiedCategory);
    const fullLabel = getCategoryLabel(category);
    const parts = fullLabel.split(' ');
    return {
      emoji: parts[0],
      label: parts.slice(1).join(' ')
    };
  }, []);

  const handleCRMAction = async (entrepriseId: string, actionType: 'appeler' | 'visite' | 'rdv' | 'note') => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const crm = crmData[entrepriseId];
    const actionTypeMapping: Record<string, 'hasAppel' | 'hasVisite' | 'hasRdv'> = {
      appeler: 'hasAppel',
      visite: 'hasVisite',
      rdv: 'hasRdv'
    };

    const hasAction = crm?.[actionTypeMapping[actionType]];

    // If action already exists, delete it instead
    if (hasAction && actionType !== 'note') {
      const interactionTypes: Record<string, 'appel' | 'visite' | 'rdv'> = {
        appeler: 'appel',
        visite: 'visite',
        rdv: 'rdv'
      };

      const { data: existingInteractions } = await supabase
        .from('lead_interactions')
        .select('id')
        .eq('entreprise_id', entrepriseId)
        .eq('user_id', user.id)
        .eq('type', interactionTypes[actionType])
        .limit(1);

      if (existingInteractions && existingInteractions.length > 0) {
        await supabase
          .from('lead_interactions')
          .delete()
          .eq('id', existingInteractions[0].id);

        // Update local CRM data immediately
        setCrmData(prev => {
          const current = prev[entrepriseId];
          if (!current) return prev;
          
          return {
            ...prev,
            [entrepriseId]: {
              ...current,
              interactionCount: Math.max(0, current.interactionCount - 1),
              [actionTypeMapping[actionType]]: false,
            }
          };
        });

        const actionEmojis = {
          appeler: '📞',
          visite: '🚗',
          rdv: '📅',
        };

        toast({
          title: `${actionEmojis[actionType]} Action supprimée`,
          description: `L'action a été retirée pour cette entreprise`,
          duration: 2500,
        });

        return;
      }
    }

    // Otherwise, add the action
    const actionLabels = {
      appeler: 'Appel planifié',
      visite: 'Visite planifiée',
      rdv: 'Rendez-vous confirmé',
      note: 'Note ajoutée'
    };

    const interactionTypes: Record<string, 'appel' | 'visite' | 'rdv' | 'autre'> = {
      appeler: 'appel',
      visite: 'visite',
      rdv: 'rdv',
      note: 'autre'
    };

    try {
      await supabase.from('lead_interactions').insert([{
        entreprise_id: entrepriseId,
        user_id: user.id,
        type: interactionTypes[actionType],
        statut: 'en_cours',
        notes: actionLabels[actionType]
      }]);

      // Update local CRM data immediately to reflect the change
      setCrmData(prev => {
        const current = prev[entrepriseId] || { 
          status: null, 
          interactionCount: 0, 
          hasUpcomingAction: false,
          hasAppel: false,
          hasVisite: false,
          hasRdv: false
        };
        
        return {
          ...prev,
          [entrepriseId]: {
            ...current,
            interactionCount: current.interactionCount + 1,
            hasAppel: actionType === 'appeler' ? true : current.hasAppel,
            hasVisite: actionType === 'visite' ? true : current.hasVisite,
            hasRdv: actionType === 'rdv' ? true : current.hasRdv,
          }
        };
      });

      const actionEmojis = {
        appeler: '📞',
        visite: '🚗',
        rdv: '📅',
        note: '📝'
      };

      toast({
        title: `${actionEmojis[actionType]} ${actionLabels[actionType]} !`,
        description: `L'action a été enregistrée pour cette entreprise`,
        duration: 2500,
      });
    } catch (error) {
      console.error('Error adding CRM action:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'enregistrer l'action",
        variant: "destructive",
        duration: 3000,
      });
    }
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
        
        {/* Cards Grid - Scrollable */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden pr-2">
          {totalItems === 0 ? (
            <div className="glass-card rounded-2xl p-16 text-center shadow-2xl border border-accent/20">
              <div className="inline-flex p-4 bg-accent/10 rounded-2xl mb-6">
                <Building2 className="w-20 h-20 text-accent opacity-50" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Aucune entreprise trouvée</h3>
              <p className="text-muted-foreground text-lg max-w-md mx-auto">
                {filters.searchQuery ? "Essayez de modifier votre recherche" : "Cliquez sur 'Synchroniser les données' pour importer vos entreprises"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 pb-4 pr-2">{displayedEntreprises.map((item) => {
                const hasCoordinates = item.latitude && item.longitude;
                const categoryInfo = getCategoryInfo(item.activite, item.categorie_qualifiee);
                const crm = crmData[item.id];
                
                // Format address
                const addressParts = [
                  item.numero_voie,
                  item.type_voie,
                  item.nom_voie
                ].filter(Boolean).join(' ');
                
                const fullAddress = addressParts 
                  ? `${addressParts}, ${item.code_postal} ${item.ville || ''}`
                  : `${item.code_postal || ''} ${item.ville || ''}`.trim();
                
                // Extract ONLY the first gérant name from administration field
                const extractFirstGerant = (admin: string | null) => {
                  if (!admin) return null;
                  const match = admin.match(/(?:Gérant|Président|Directeur général)\s*:\s*([^;,\.]+)/i);
                  if (!match) return null;
                  
                  // Get the first name only, before any "nom d'usage" or other additions
                  const fullName = match[1].trim();
                  const firstName = fullName.split(/\s+nom\s+d'usage|\s+Président|\s+Directeur/i)[0].trim();
                  return firstName;
                };
                
                const gerant = extractFirstGerant(item.administration);
                const isSelected = selectedEntreprises.some(e => e.id === item.id);
                
                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      if (selectionMode && onToggleSelection) {
                        onToggleSelection(item);
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
                        <h4 className="font-bold text-base md:text-lg gradient-text break-words leading-tight" title={item.nom}>
                          {item.nom}
                        </h4>
                      </div>
                    </div>

                    <div className="relative space-y-2 mb-4 flex-1 overflow-y-auto custom-scrollbar pr-1">
                      {/* Activité */}
                      {categoryInfo.label && (
                        <div className="flex items-center gap-2 text-sm">
                          <Briefcase className="w-3.5 h-3.5 text-accent/60 flex-shrink-0" />
                          <span className="text-xs text-foreground/60">{categoryInfo.label}</span>
                        </div>
                      )}

                      {/* SIRET */}
                      {item.siret && (
                        <div className="flex items-center gap-2 text-sm">
                          <Building2 className="w-3.5 h-3.5 text-accent/60 flex-shrink-0" />
                          <span className="text-xs text-foreground/60">SIRET: {item.siret}</span>
                        </div>
                      )}
                      
                      {/* Adresse */}
                      {fullAddress && (
                        <div className="flex items-start gap-2 text-sm">
                          <MapPin className="w-3.5 h-3.5 text-accent/60 flex-shrink-0 mt-0.5" />
                          <span className="text-xs text-foreground/60">{fullAddress}</span>
                        </div>
                      )}

                      {/* Gérant - Afficher seulement le premier */}
                      {gerant && (
                        <div className="flex items-start gap-2 text-sm">
                          <User className="w-3.5 h-3.5 text-accent/60 flex-shrink-0 mt-0.5" />
                          <span className="text-xs text-foreground/60">{gerant}</span>
                        </div>
                      )}

                      {item.telephone && (
                        <div className="flex items-center gap-2 text-sm text-foreground/70">
                          <Phone className="w-4 h-4 flex-shrink-0 text-accent" />
                          <span className="text-xs">{item.telephone}</span>
                        </div>
                      )}

                      {item.email && (
                        <div className="flex items-center gap-2 text-sm text-foreground/70">
                          <Mail className="w-4 h-4 flex-shrink-0 text-accent" />
                          <span className="text-xs break-all">{item.email}</span>
                        </div>
                      )}

                      {item.forme_juridique && (
                        <div className="flex items-center gap-2 text-sm text-foreground/70">
                          <Building className="w-4 h-4 flex-shrink-0 text-accent" />
                          <span className="text-xs">{item.forme_juridique}</span>
                        </div>
                      )}

                      {item.effectifs && (
                        <div className="flex items-center gap-2 text-sm text-foreground/70">
                          <Users className="w-4 h-4 flex-shrink-0 text-accent" />
                          <span className="text-xs">{item.effectifs} employés</span>
                        </div>
                      )}

                      {item.chiffre_affaires && (
                        <div className="flex items-center gap-2 text-sm text-foreground/70">
                          <TrendingUp className="w-4 h-4 flex-shrink-0 text-accent" />
                          <span className="text-xs">CA: {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(Number(item.chiffre_affaires))}</span>
                        </div>
                      )}

                      {item.site_web && (
                        <div className="flex items-center gap-2 text-sm text-foreground/70">
                          <Building2 className="w-4 h-4 flex-shrink-0 text-accent" />
                          <a 
                            href={item.site_web.startsWith('http') ? item.site_web : `https://${item.site_web}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-accent hover:underline break-all text-xs font-semibold"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {item.site_web}
                          </a>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 justify-center mt-auto">
                      <Button
                        size="sm"
                        className="flex-1 h-11 bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 border border-blue-500/20 hover:border-blue-500/40 transition-all"
                        disabled={!item.telephone}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (item.telephone) {
                            window.location.href = `tel:${item.telephone}`;
                            handleCRMAction(item.id, 'appeler');
                          }
                        }}
                      >
                        <Phone className="w-5 h-5" />
                      </Button>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            size="sm"
                            className="flex-1 h-11 bg-green-500/10 hover:bg-green-500/20 text-green-500 border border-green-500/20 hover:border-green-500/40 transition-all"
                            disabled={!hasCoordinates}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Car className="w-5 h-5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-card border-accent/20 z-50">
                          <DropdownMenuItem 
                            onClick={() => {
                              openGoogleMaps(item.latitude, item.longitude);
                              handleCRMAction(item.id, 'visite');
                            }}
                          >
                            <Map className="w-4 h-4 mr-2" />
                            Google Maps
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => {
                              openWaze(item.latitude, item.longitude);
                              handleCRMAction(item.id, 'visite');
                            }}
                          >
                            <Navigation className="w-4 h-4 mr-2" />
                            Waze
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            size="sm"
                            className="flex-1 h-11 bg-purple-500/10 hover:bg-purple-500/20 text-purple-500 border border-purple-500/20 hover:border-purple-500/40 transition-all"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Calendar className="w-5 h-5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-card border-accent/20 z-50">
                          <DropdownMenuItem 
                            onClick={() => handleCRMAction(item.id, 'appeler')}
                          >
                            <Phone className="w-4 h-4 mr-2" />
                            Appeler
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleCRMAction(item.id, 'visite')}
                          >
                            <Car className="w-4 h-4 mr-2" />
                            Visite
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleCRMAction(item.id, 'rdv')}
                          >
                            <CalendarCheck className="w-4 h-4 mr-2" />
                            RDV
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {isMobile && filteredEntreprises.length > 0 && (
        <div className="mt-4 p-4 glass-card rounded-lg border border-accent/20">
          <p className="text-xs text-muted-foreground text-center">
            💡 Utilisez les 3 boutons pour appeler, visiter ou enregistrer une action
          </p>
        </div>
      )}
    </>
  );
};
