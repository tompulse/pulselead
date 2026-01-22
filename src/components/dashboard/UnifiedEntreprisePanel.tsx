import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { useCRMActions } from "@/hooks/useCRMActions";
import { UnifiedCRMActions } from "./UnifiedCRMActions";
import { InteractionTimeline } from "./InteractionTimeline";
import { LeadStatusBadge } from "./LeadStatusBadge";
import { Building2, MapPin, Calendar, Navigation, Hash, Factory, Scale, User, Sparkles } from "lucide-react";
import { openGoogleMaps, openWaze } from "@/utils/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { NAF_SECTIONS, NAF_DIVISIONS } from "@/utils/nafNomenclatureComplete";
import { getCategorieJuridiqueFullLabel } from "@/utils/categoriesJuridiques";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface UnifiedEntreprisePanelProps {
  entreprise: any | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
}

export const UnifiedEntreprisePanel = ({ 
  entreprise, 
  open, 
  onOpenChange,
  userId 
}: UnifiedEntreprisePanelProps) => {
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState<'info' | 'crm'>('info');
  const [isEnriching, setIsEnriching] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // If we only have an ID, fetch full data from nouveaux_sites
  const entrepriseId = entreprise?.id;
  const needsFetch = entreprise && entrepriseId && !entreprise.siret && !entreprise.nom;

  const { data: fetchedEntreprise, isLoading: isFetchingEntreprise } = useQuery({
    queryKey: ['entreprise-detail', entrepriseId],
    queryFn: async () => {
      if (!entrepriseId) return null;
      const { data, error } = await supabase
        .from('nouveaux_sites')
        .select('*')
        .eq('id', entrepriseId)
        .single();
      
      if (error) {
        console.error('Error fetching entreprise:', error);
        return null;
      }
      return data;
    },
    enabled: open && !!entrepriseId,
    staleTime: 5 * 60 * 1000,
  });

  // Use fetched data if available, otherwise use passed data
  const displayEntreprise = fetchedEntreprise || entreprise;

  const {
    interactions,
    leadStatus,
    isLoading,
  } = useCRMActions(entrepriseId || '', userId);

  useEffect(() => {
    if (open) {
      setActiveTab('info');
    }
  }, [open]);

  if (!open) return null;

  // Show loading state while fetching
  if (isFetchingEntreprise || !displayEntreprise) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent 
          side={isMobile ? "bottom" : "right"} 
          className={`${isMobile ? 'h-[90vh]' : 'w-[420px]'} p-0 flex flex-col`}
        >
          <div className="p-6 space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <div className="space-y-3 pt-4">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  // Format address from real data
  const addressParts = [
    displayEntreprise.numero_voie,
    displayEntreprise.type_voie,
    displayEntreprise.libelle_voie,
    displayEntreprise.complement_adresse
  ].filter(Boolean).join(' ');
  
  const formattedAddress = addressParts || displayEntreprise.adresse || '';
  const cityLine = [displayEntreprise.code_postal, displayEntreprise.ville].filter(Boolean).join(' ');

  // Get NAF info
  const nafSectionInfo = displayEntreprise.naf_section ? NAF_SECTIONS[displayEntreprise.naf_section] : null;
  const nafDivisionInfo = displayEntreprise.naf_division ? NAF_DIVISIONS[displayEntreprise.naf_division] : null;

  // Format date
  const formattedDate = displayEntreprise.date_creation 
    ? new Date(displayEntreprise.date_creation).toLocaleDateString('fr-FR', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
      })
    : null;

  const hasCoordinates = displayEntreprise.latitude && displayEntreprise.longitude;

  // Fonction pour enrichir le dirigeant via Pappers
  const handleEnrichDirigeant = async () => {
    if (!displayEntreprise.siret) {
      toast({
        title: "SIRET requis",
        description: "Un SIRET est nécessaire pour enrichir les informations du dirigeant.",
        variant: "destructive",
      });
      return;
    }

    setIsEnriching(true);
    try {
      const { data, error } = await supabase.functions.invoke('enrich-dirigeant', {
        body: { siret: displayEntreprise.siret },
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "Dirigeant trouvé !",
          description: `${data.dirigeant} (${data.fonction})`,
        });
        
        // Rafraîchir les données de l'entreprise
        queryClient.invalidateQueries({ queryKey: ['entreprise-detail', entrepriseId] });
      } else {
        throw new Error(data.error || 'Erreur lors de l\'enrichissement');
      }
    } catch (error: any) {
      console.error('Erreur enrichissement:', error);
      toast({
        title: "Erreur d'enrichissement",
        description: error.message || "Impossible de récupérer les informations du dirigeant. L'entreprise est peut-être trop récente.",
        variant: "destructive",
      });
    } finally {
      setIsEnriching(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent 
        side={isMobile ? "bottom" : "right"} 
        className={`${isMobile ? 'h-[90vh]' : 'w-[420px]'} p-0 flex flex-col`}
      >
        {/* Header */}
        <div className="shrink-0 p-4 pr-12 border-b border-accent/20 bg-gradient-to-r from-accent/5 to-transparent">
          <h2 className="text-lg font-bold leading-tight">{displayEntreprise.nom || 'Entreprise'}</h2>
          {cityLine && (
            <p className="text-sm text-muted-foreground mt-0.5">{cityLine}</p>
          )}
          {leadStatus && (
            <div className="mt-2">
              <LeadStatusBadge statut={leadStatus.statut_actuel} />
            </div>
          )}
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'info' | 'crm')} className="flex-1 flex flex-col min-h-0">
          <div className="shrink-0 px-4 pt-3">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="info">Infos</TabsTrigger>
              <TabsTrigger value="crm">CRM</TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 min-h-0 overflow-hidden">
            {/* Informations Tab */}
            <TabsContent value="info" className="h-full m-0 data-[state=active]:flex data-[state=active]:flex-col">
              <ScrollArea className="flex-1">
                <div className="p-4 space-y-4">
                  {/* Adresse */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs font-semibold text-accent uppercase tracking-wide">
                      <MapPin className="w-3.5 h-3.5" />
                      Adresse
                    </div>
                    <div className="text-sm">
                      {formattedAddress && <p>{formattedAddress}</p>}
                      {cityLine && <p className="font-medium">{cityLine}</p>}
                      {!formattedAddress && !cityLine && (
                        <p className="text-muted-foreground italic">Non renseignée</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openGoogleMaps(displayEntreprise.latitude, displayEntreprise.longitude)}
                        className="h-8 text-xs border-accent/30 hover:bg-accent/10"
                        disabled={!hasCoordinates}
                      >
                        Google Maps
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openWaze(displayEntreprise.latitude, displayEntreprise.longitude)}
                        className="h-8 text-xs border-accent/30 hover:bg-accent/10"
                        disabled={!hasCoordinates}
                      >
                        Waze
                      </Button>
                    </div>
                  </div>

                  {/* Activité NAF */}
                  <div className="space-y-2 pt-3 border-t border-accent/10">
                    <div className="flex items-center gap-2 text-xs font-semibold text-accent uppercase tracking-wide">
                      <Factory className="w-3.5 h-3.5" />
                      Activité
                    </div>
                    {nafSectionInfo ? (
                      <p className="text-sm">
                        {nafSectionInfo.emoji} {nafSectionInfo.label}
                      </p>
                    ) : null}
                    {nafDivisionInfo ? (
                      <p className="text-xs text-muted-foreground">{nafDivisionInfo.label}</p>
                    ) : null}
                    {displayEntreprise.code_naf ? (
                      <p className="text-xs text-muted-foreground font-mono">Code NAF: {displayEntreprise.code_naf}</p>
                    ) : !nafSectionInfo && !nafDivisionInfo ? (
                      <p className="text-sm text-muted-foreground italic">Non renseignée</p>
                    ) : null}
                  </div>

                  {/* SIREN */}
                  <div className="space-y-1 pt-3 border-t border-accent/10">
                    <div className="flex items-center gap-2 text-xs font-semibold text-accent uppercase tracking-wide">
                      <Hash className="w-3.5 h-3.5" />
                      SIREN
                    </div>
                    <p className="text-sm font-mono">
                      {displayEntreprise.siret 
                        ? displayEntreprise.siret.substring(0, 9).replace(/(\d{3})(\d{3})(\d{3})/, '$1 $2 $3')
                        : <span className="text-muted-foreground italic font-sans">Non renseigné</span>}
                    </p>
                  </div>

                  {/* Catégorie juridique */}
                  {displayEntreprise.categorie_juridique && (
                    <div className="space-y-1 pt-3 border-t border-accent/10">
                      <div className="flex items-center gap-2 text-xs font-semibold text-accent uppercase tracking-wide">
                        <Scale className="w-3.5 h-3.5" />
                        Catégorie juridique
                      </div>
                      <p className="text-sm">
                        {getCategorieJuridiqueFullLabel(displayEntreprise.categorie_juridique)}
                      </p>
                      <p className="text-xs text-muted-foreground font-mono">
                        Code: {displayEntreprise.categorie_juridique}
                      </p>
                    </div>
                  )}

                  {/* Dirigeant */}
                  <div className="space-y-2 pt-3 border-t border-accent/10">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-semibold text-accent uppercase tracking-wide">
                        <User className="w-3.5 h-3.5" />
                        Dirigeant
                      </div>
                    </div>
                    {displayEntreprise.dirigeant ? (
                      <div className="space-y-1">
                        <p className="text-sm font-medium">{displayEntreprise.dirigeant}</p>
                        {displayEntreprise.fonction_dirigeant && (
                          <p className="text-xs text-muted-foreground">{displayEntreprise.fonction_dirigeant}</p>
                        )}
                        {displayEntreprise.date_enrichissement_dirigeant && (
                          <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                            ✓ Mis à jour le {new Date(displayEntreprise.date_enrichissement_dirigeant).toLocaleDateString('fr-FR')}
                          </p>
                        )}
                        {displayEntreprise.siret && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handleEnrichDirigeant}
                            disabled={isEnriching}
                            className="mt-2 h-8 text-xs border-blue-500/30 hover:bg-blue-500/10 text-blue-600 dark:text-blue-400"
                          >
                            <Sparkles className="w-3 h-3 mr-1.5" />
                            {isEnriching ? 'Recherche...' : 'Actualiser via Pappers'}
                          </Button>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground italic">
                          Non renseigné
                        </p>
                        {displayEntreprise.siret ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handleEnrichDirigeant}
                            disabled={isEnriching}
                            className="h-8 text-xs border-blue-500/30 hover:bg-blue-500/10 text-blue-600 dark:text-blue-400"
                          >
                            <Sparkles className="w-3 h-3 mr-1.5" />
                            {isEnriching ? 'Recherche...' : 'Trouver via Pappers'}
                          </Button>
                        ) : (
                          <p className="text-xs text-muted-foreground">
                            SIRET requis pour enrichir
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Date de création */}
                  <div className="space-y-1 pt-3 border-t border-accent/10">
                    <div className="flex items-center gap-2 text-xs font-semibold text-accent uppercase tracking-wide">
                      <Calendar className="w-3.5 h-3.5" />
                      Date de création
                    </div>
                    <p className="text-sm">
                      {formattedDate || <span className="text-muted-foreground italic">Non renseignée</span>}
                    </p>
                  </div>

                  {/* Taille entreprise */}
                  <div className="space-y-1 pt-3 border-t border-accent/10">
                    <div className="flex items-center gap-2 text-xs font-semibold text-accent uppercase tracking-wide">
                      <Building2 className="w-3.5 h-3.5" />
                      Taille
                    </div>
                    <p className="text-sm">
                      {displayEntreprise.categorie_entreprise && displayEntreprise.categorie_entreprise !== 'Non spécifié' 
                        ? displayEntreprise.categorie_entreprise 
                        : <span className="text-muted-foreground italic">Non renseignée</span>}
                    </p>
                  </div>

                  {/* Type d'établissement */}
                  {displayEntreprise.est_siege !== null && displayEntreprise.est_siege !== undefined && (
                    <div className="pt-3 border-t border-accent/10">
                      <span className={`text-xs px-2.5 py-1 rounded-full ${
                        displayEntreprise.est_siege 
                          ? 'bg-green-500/15 text-green-600 dark:text-green-400 border border-green-500/30' 
                          : 'bg-muted text-muted-foreground border border-muted-foreground/20'
                      }`}>
                        {displayEntreprise.est_siege ? 'Siège social' : 'Établissement secondaire'}
                      </span>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            {/* CRM Tab */}
            <TabsContent value="crm" className="h-full m-0 data-[state=active]:flex data-[state=active]:flex-col">
              <ScrollArea className="flex-1">
                <div className="p-4 space-y-5">
                  {isLoading ? (
                    <div className="space-y-3">
                      <Skeleton className="h-16 w-full" />
                      <Skeleton className="h-32 w-full" />
                    </div>
                  ) : (
                    <>
                      <div className="space-y-3">
                        <h3 className="text-xs font-semibold text-accent uppercase tracking-wide">Actions</h3>
                        <UnifiedCRMActions
                          entrepriseId={displayEntreprise.id}
                          onInteractionAdded={() => {}}
                          mode="dialog"
                          size="lg"
                        />
                      </div>

                      <div className="space-y-3 pt-3 border-t border-accent/10">
                        <h3 className="text-xs font-semibold text-accent uppercase tracking-wide">Historique</h3>
                        {interactions && interactions.length > 0 ? (
                          <InteractionTimeline interactions={interactions} />
                        ) : (
                          <p className="text-sm text-muted-foreground italic py-4 text-center">
                            Aucune interaction enregistrée
                          </p>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          </div>
        </Tabs>

        {/* Quick actions bar */}
        <div className="shrink-0 p-3 border-t border-accent/20 bg-background">
          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={() => openGoogleMaps(displayEntreprise.latitude, displayEntreprise.longitude)}
              disabled={!hasCoordinates}
              size="sm"
              className="h-10 bg-green-500/10 hover:bg-green-500/20 text-green-600 dark:text-green-400 border border-green-500/20"
            >
              <Navigation className="w-4 h-4 mr-2" />
              Y aller
            </Button>
            <Button
              onClick={() => setActiveTab('crm')}
              size="sm"
              className="h-10 bg-accent/10 hover:bg-accent/20 text-accent border border-accent/20"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Planifier
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
