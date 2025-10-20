import { Building2, Navigation, Map, Search, MapPin, MessageSquare, Bell, Calendar, DollarSign, User, Car, Phone, CalendarCheck, StickyNote, Briefcase, Clock, Mail, Users, Building, TrendingUp, Banknote, CalendarDays } from "lucide-react";
import { useEffect, useState } from "react";
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

interface ListViewProps {
  filters: {
    dateFrom: string;
    dateTo: string;
    categories: string[];
    departments: string[];
  };
  onEntrepriseSelect?: (entreprise: Entreprise) => void;
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
}

export const ListView = ({ filters, onEntrepriseSelect }: ListViewProps) => {
  const [entreprises, setEntreprises] = useState<Entreprise[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null);
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
        let filtered = data || [];
        
        // Filter by departments first
        if (filters.departments && filters.departments.length > 0) {
          filtered = filtered.filter((ent: Entreprise) => {
            const codePostal = ent.code_postal;
            if (!codePostal) return false;
            
            const normalizedCP = codePostal.length === 4 ? '0' + codePostal : codePostal;
            const dept = normalizedCP.substring(0, 2);
            
            if (normalizedCP.startsWith('20')) {
              // Corse: inclure si 2A ou 2B est sélectionné (impossible de différencier via CP)
              return filters.departments.includes('2A') || filters.departments.includes('2B');
            }
            
            return filters.departments.includes(dept);
          });
        }

        // Filter by categories using the same logic as FilterOnboarding
        if (filters.categories && filters.categories.length > 0) {
          filtered = filtered.filter((ent: Entreprise) => {
            const category = categorizeActivity(ent.activite);
            return filters.categories.includes(category);
          });
        }

        setEntreprises(filtered);
      }
      setLoading(false);
    };

    fetchEntreprises();

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
      });
    } catch (error) {
      console.error('Error adding CRM action:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'enregistrer l'action",
        variant: "destructive"
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
        {/* Header with search - More colorful */}
        <div className="glass-card rounded-xl p-3 md:p-4 border border-accent/30 flex-shrink-0 bg-gradient-to-br from-accent/10 via-accent/5 to-transparent shadow-lg shadow-accent/5">
          <div className="flex flex-col md:flex-row gap-3 items-start md:items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 bg-gradient-to-br from-accent/20 to-accent/10 rounded-lg shadow-sm">
                <Building2 className="w-4 h-4 md:w-5 md:h-5 text-accent" />
              </div>
              <div>
                <h3 className="text-base md:text-lg font-bold gradient-text">Liste des entreprises</h3>
                <p className="text-xs md:text-sm text-muted-foreground font-medium">
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
                className="pl-9 bg-background/50 border-accent/20 focus:border-accent h-9"
              />
            </div>
          </div>
        </div>

        {/* Cards Grid - Scrollable */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden pr-2">
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 pb-4 pr-2">{filteredEntreprises.map((item) => {
                const hasCoordinates = item.latitude && item.longitude;
                const categoryInfo = getCategoryInfo(item.activite);
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
                
                // Extract gérant from administration field
                const extractGerant = (admin: string | null) => {
                  if (!admin) return null;
                  const match = admin.match(/(?:Gérant|Président|Directeur général)\s*:\s*([^;,]+)/i);
                  return match ? match[1].trim() : null;
                };
                
                const gerant = extractGerant(item.administration);
                
                const isHovered = hoveredCardId === item.id;
                
                return (
                  <div
                    key={item.id}
                    className="group relative rounded-xl p-4 md:p-5 shadow-lg border border-accent/30 hover:border-accent/50 transition-all bg-gradient-to-br from-card/95 to-card/80 backdrop-blur w-full flex flex-col hover:shadow-xl hover:shadow-accent/10 cursor-pointer h-[380px] overflow-hidden"
                    onClick={() => onEntrepriseSelect?.(item)}
                    onMouseEnter={() => setHoveredCardId(item.id)}
                    onMouseLeave={() => setHoveredCardId(null)}
                  >
                    {/* Gradient overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />
                    
                    <div className="relative flex items-start justify-between gap-2 mb-3">
                      <h4 className="font-bold text-base md:text-lg line-clamp-2 flex-1 gradient-text" title={item.nom}>
                        {item.nom}
                      </h4>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {/* Action icons - filled if action exists, outline otherwise - Now toggleable */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCRMAction(item.id, 'appeler');
                          }}
                          className={`h-8 w-8 rounded-lg flex items-center justify-center transition-all shadow-sm ${
                            crm?.hasAppel 
                              ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white hover:shadow-md hover:shadow-blue-500/30' 
                              : 'border border-blue-500/30 text-blue-500/60 hover:border-blue-500 hover:text-blue-500 hover:bg-blue-500/5'
                          }`}
                        >
                          <Phone className="h-4 w-4" />
                        </button>
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCRMAction(item.id, 'visite');
                          }}
                          className={`h-8 w-8 rounded-lg flex items-center justify-center transition-all shadow-sm ${
                            crm?.hasVisite 
                              ? 'bg-gradient-to-br from-green-500 to-green-600 text-white hover:shadow-md hover:shadow-green-500/30' 
                              : 'border border-green-500/30 text-green-500/60 hover:border-green-500 hover:text-green-500 hover:bg-green-500/5'
                          }`}
                        >
                          <Car className="h-4 w-4" />
                        </button>
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCRMAction(item.id, 'rdv');
                          }}
                          className={`h-8 w-8 rounded-lg flex items-center justify-center transition-all shadow-sm ${
                            crm?.hasRdv 
                              ? 'bg-gradient-to-br from-purple-500 to-purple-600 text-white hover:shadow-md hover:shadow-purple-500/30' 
                              : 'border border-purple-500/30 text-purple-500/60 hover:border-purple-500 hover:text-purple-500 hover:bg-purple-500/5'
                          }`}
                        >
                          <CalendarCheck className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div className="relative space-y-2 mb-4 flex-1 min-h-0 overflow-hidden">
                      {categoryInfo.label && (
                        <div className="flex items-center gap-2 text-sm text-foreground/70 bg-accent/5 p-2 rounded-lg border border-accent/10">
                          <Briefcase className="w-4 h-4 flex-shrink-0 text-accent" />
                          <span className="line-clamp-1 font-medium">{categoryInfo.label}</span>
                        </div>
                      )}
                      
                      {fullAddress && (
                        <div className="flex items-center gap-2 text-sm text-foreground/70">
                          <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-accent" />
                          <span className="line-clamp-2">{fullAddress}</span>
                        </div>
                      )}
                      
                      {gerant && (
                        <div className="flex items-center gap-2 text-sm text-foreground/70">
                          <User className="w-3.5 h-3.5 flex-shrink-0 text-accent" />
                          <span className="line-clamp-1">{gerant}</span>
                        </div>
                      )}

                      {item.telephone && (
                        <div className="flex items-center gap-2 text-sm text-foreground/70">
                          <Phone className="w-3.5 h-3.5 flex-shrink-0 text-accent" />
                          <span className="line-clamp-1">{item.telephone}</span>
                        </div>
                      )}

                      {item.email && (
                        <div className="flex items-center gap-2 text-sm text-foreground/70">
                          <Mail className="w-3.5 h-3.5 flex-shrink-0 text-accent" />
                          <span className="line-clamp-1">{item.email}</span>
                        </div>
                      )}

                      {item.forme_juridique && (
                        <div className="flex items-center gap-2 text-sm text-foreground/70">
                          <Building className="w-3.5 h-3.5 flex-shrink-0 text-accent" />
                          <span className="line-clamp-1">{item.forme_juridique}</span>
                        </div>
                      )}

                      {item.date_demarrage && (
                        <div className="flex items-center gap-2 text-sm text-foreground/70">
                          <CalendarDays className="w-3.5 h-3.5 flex-shrink-0 text-accent" />
                          <span className="line-clamp-1">Créée le {new Date(item.date_demarrage).toLocaleDateString('fr-FR')}</span>
                        </div>
                      )}

                      {/* Overlay sheet avec infos supplémentaires au survol */}
                      {isHovered && (
                        <div 
                          className="absolute inset-0 bg-gradient-to-br from-card/98 to-card/95 backdrop-blur-xl rounded-lg border border-accent/30 shadow-2xl shadow-accent/20 p-4 overflow-y-auto custom-scrollbar z-50 animate-fade-in"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="space-y-2.5">
                            <div className="flex items-center justify-between mb-3 pb-2 border-b border-accent/20">
                              <h4 className="font-bold text-sm gradient-text">Informations détaillées</h4>
                            </div>

                            {item.siret && (
                              <div className="flex items-center gap-2 text-xs text-foreground/70">
                                <Building2 className="w-3 h-3 flex-shrink-0 text-accent" />
                                <span>SIRET: {item.siret}</span>
                              </div>
                            )}

                            {item.code_naf && (
                              <div className="flex items-center gap-2 text-xs text-foreground/70">
                                <Briefcase className="w-3 h-3 flex-shrink-0 text-accent" />
                                <span>Code NAF: {item.code_naf}</span>
                              </div>
                            )}

                            {item.activite && (
                              <div className="flex items-start gap-2 text-xs text-foreground/70 bg-accent/5 p-2 rounded border border-accent/10">
                                <Briefcase className="w-3 h-3 flex-shrink-0 text-accent mt-0.5" />
                                <span>Activité: {item.activite}</span>
                              </div>
                            )}

                            {item.effectifs && (
                              <div className="flex items-center gap-2 text-xs text-foreground/70">
                                <Users className="w-3 h-3 flex-shrink-0 text-accent" />
                                <span>{item.effectifs} employés</span>
                              </div>
                            )}

                            {item.chiffre_affaires && (
                              <div className="flex items-center gap-2 text-xs text-foreground/70">
                                <TrendingUp className="w-3 h-3 flex-shrink-0 text-accent" />
                                <span>CA: {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(Number(item.chiffre_affaires))}</span>
                              </div>
                            )}

                            {item.capital && (
                              <div className="flex items-center gap-2 text-xs text-foreground/70">
                                <Banknote className="w-3 h-3 flex-shrink-0 text-accent" />
                                <span>Capital: {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(Number(item.capital))}</span>
                              </div>
                            )}

                            {item.administration && (
                              <div className="flex items-start gap-2 text-xs text-foreground/70 bg-accent/5 p-2 rounded border border-accent/10">
                                <User className="w-3 h-3 flex-shrink-0 text-accent mt-0.5" />
                                <span>Administration: {item.administration}</span>
                              </div>
                            )}

                            {item.site_web && (
                              <div className="flex items-center gap-2 text-xs text-foreground/70">
                                <Building2 className="w-3 h-3 flex-shrink-0 text-accent" />
                                <a 
                                  href={item.site_web.startsWith('http') ? item.site_web : `https://${item.site_web}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-accent hover:underline break-all"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {item.site_web}
                                </a>
                              </div>
                            )}

                            {fullAddress && (
                              <div className="flex items-start gap-2 text-xs text-foreground/70 bg-accent/5 p-2 rounded border border-accent/10">
                                <MapPin className="w-3 h-3 flex-shrink-0 text-accent mt-0.5" />
                                <span>{fullAddress}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 justify-center mt-auto">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 border-accent/30 hover:bg-accent/10 hover:border-accent"
                        disabled={!item.telephone}
                        onClick={() => {
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
                            variant="outline"
                            size="sm"
                            className="flex-1 border-accent/30 hover:bg-accent/10 hover:border-accent"
                            disabled={!hasCoordinates}
                          >
                            <Car className="w-5 h-5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-card border-accent/20 z-50">
                          <DropdownMenuItem 
                            onClick={() => openGoogleMaps(item.latitude, item.longitude)}
                          >
                            <Map className="w-4 h-4 mr-2" />
                            Google Maps
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => openWaze(item.latitude, item.longitude)}
                          >
                            <Navigation className="w-4 h-4 mr-2" />
                            Waze
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 border-accent/30 hover:bg-accent/10 hover:border-accent"
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
