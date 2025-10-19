import { Building2, Navigation, Map, Search, MapPin, MessageSquare, Bell, Calendar, DollarSign, User, Car, Phone, CalendarCheck, StickyNote } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { categorizeActivity, getCategoryLabel } from "@/utils/activityCategories";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useIsMobile } from "@/hooks/use-mobile";
import { LeadStatusBadge } from "./LeadStatusBadge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { PhoneButton } from "./PhoneButton";

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
}

export const ListView = ({ filters, onEntrepriseSelect }: ListViewProps) => {
  const [entreprises, setEntreprises] = useState<Entreprise[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [crmData, setCrmData] = useState<Record<string, { status: any; interactionCount: number; hasUpcomingAction: boolean }>>({});
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
        .select('entreprise_id, date_prochaine_action')
        .eq('user_id', user.id);

      const crmMap: Record<string, any> = {};
      
      statusData?.forEach(status => {
        if (!crmMap[status.entreprise_id]) {
          crmMap[status.entreprise_id] = { status, interactionCount: 0, hasUpcomingAction: false };
        } else {
          crmMap[status.entreprise_id].status = status;
        }
      });

      interactionsData?.forEach(interaction => {
        if (!crmMap[interaction.entreprise_id]) {
          crmMap[interaction.entreprise_id] = { status: null, interactionCount: 0, hasUpcomingAction: false };
        }
        crmMap[interaction.entreprise_id].interactionCount++;
        
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
        {/* Header with search - More subtle */}
        <div className="glass-card rounded-lg p-3 md:p-4 border border-accent/10 flex-shrink-0 bg-accent/5">
          <div className="flex flex-col md:flex-row gap-3 items-start md:items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-accent/10 rounded-lg">
                <Building2 className="w-4 h-4 md:w-5 md:h-5 text-accent" />
              </div>
              <div>
                <h3 className="text-base md:text-lg font-semibold text-foreground/80">Liste des entreprises</h3>
                <p className="text-xs md:text-sm text-muted-foreground">
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
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-4 max-w-full">
              {filteredEntreprises.map((item) => {
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
                
                return (
                  <div
                    key={item.id}
                    className="glass-card rounded-xl p-5 shadow-lg border border-accent/20 hover:border-accent/40 transition-all bg-gradient-to-br from-card/80 to-card/40 max-w-full overflow-hidden"
                  >
                    <div className="space-y-3 mb-4">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-bold text-lg truncate flex-1" title={item.nom}>
                          {item.nom}
                        </h4>
                        <div className="flex gap-1 flex-shrink-0">
                          {crm?.hasUpcomingAction && (
                            <Badge variant="outline" className="h-6 px-2">
                              <Bell className="h-3 w-3" />
                            </Badge>
                          )}
                          {crm?.interactionCount > 0 && (
                            <Badge variant="secondary" className="h-6 px-2 flex items-center gap-1">
                              <MessageSquare className="h-3 w-3" />
                              {crm.interactionCount}
                            </Badge>
                          )}
                        </div>
                      </div>

                      {crm?.status && (
                        <div className="flex items-center gap-2">
                          <LeadStatusBadge 
                            statut={crm.status.statut_actuel} 
                            probabilite={crm.status.probabilite}
                            showTooltip={false}
                          />
                        </div>
                      )}
                      
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-base flex-shrink-0">{categoryInfo.emoji}</span>
                          <span className="text-muted-foreground truncate">{categoryInfo.label}</span>
                        </div>
                        
                        {gerant && (
                          <div className="flex items-start gap-2 text-sm">
                            <User className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                            <span className="text-muted-foreground truncate">
                              {gerant}
                            </span>
                          </div>
                        )}
                        
                        {item.activite && (
                          <div className="flex items-start gap-2 text-xs">
                            <Building2 className="w-3.5 h-3.5 text-accent flex-shrink-0 mt-0.5" />
                            <p className="text-muted-foreground/90 line-clamp-3 leading-relaxed">
                              {item.activite}
                            </p>
                          </div>
                        )}
                        
                        {fullAddress && (
                          <div className="flex items-start gap-2 text-sm">
                            <MapPin className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                            <span className="text-muted-foreground line-clamp-2">
                              {fullAddress}
                            </span>
                          </div>
                        )}
                        
                        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground/80">
                          {item.date_demarrage && (
                            <div className="flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
                              <span>{new Date(item.date_demarrage).toLocaleDateString('fr-FR')}</span>
                            </div>
                          )}
                          
                          {item.capital && (
                            <div className="flex items-center gap-1.5">
                              <DollarSign className="w-3.5 h-3.5 flex-shrink-0" />
                              <span>{item.capital.toLocaleString('fr-FR')} €</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <PhoneButton 
                        phoneNumber={item.telephone} 
                        entrepriseName={item.nom}
                        onClick={() => handleCRMAction(item.id, 'appeler')}
                      />

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 border-accent/30 hover:bg-accent/10 hover:border-accent"
                            disabled={!hasCoordinates}
                          >
                            <Car className="w-4 h-4 mr-2" />
                            Visiter
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem 
                            onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${item.latitude},${item.longitude}`, '_blank')}
                          >
                            <Map className="w-4 h-4 mr-2" />
                            Google Maps
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => window.open(`https://waze.com/ul?ll=${item.latitude},${item.longitude}&navigate=yes`, '_blank')}
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
                            <MessageSquare className="w-4 h-4 mr-2" />
                            CRM
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => handleCRMAction(item.id, 'appeler')}>
                            <Phone className="w-4 h-4 mr-2" />
                            Appeler
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleCRMAction(item.id, 'visite')}>
                            <Car className="w-4 h-4 mr-2" />
                            Rendre visite
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleCRMAction(item.id, 'rdv')}>
                            <CalendarCheck className="w-4 h-4 mr-2" />
                            Rendez-vous
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleCRMAction(item.id, 'note')}>
                            <StickyNote className="w-4 h-4 mr-2" />
                            Ne pas oublier
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
            💡 Utilisez les boutons Visiter et CRM pour interagir avec les entreprises
          </p>
        </div>
      )}
    </>
  );
};
