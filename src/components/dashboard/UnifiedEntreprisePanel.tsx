import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useIsMobile } from "@/hooks/use-mobile";
import { useCRMActions } from "@/hooks/useCRMActions";
import { useUserPlan } from "@/hooks/useUserPlan";
import { UnifiedCRMActions } from "./UnifiedCRMActions";
import { InteractionTimeline } from "./InteractionTimeline";
import { LeadStatusBadge } from "./LeadStatusBadge";
import { UpgradeDialog } from "@/components/upgrade/UpgradeDialog";
import { Building2, MapPin, Calendar, Navigation, Hash, Factory, Scale, User, Sparkles, Lock, Unlock } from "lucide-react";
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
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // User plan & unlock logic
  const { userPlan, unlockProspect, isProspectUnlocked, isLoading: planLoading } = useUserPlan(userId);
  const isPro = userPlan?.plan_type === 'pro' || userPlan?.plan_type === 'teams';
  const isUnlocked = entreprise?.id ? isProspectUnlocked(entreprise.id) : false;
  
  // 🔥 PRO USERS : Toujours accès complet, pas de restrictions
  const canSeeDetails = isPro || isUnlocked;

  // If we only have an ID, fetch full data from nouveaux_sites
  const entrepriseId = entreprise?.id;
  const needsFetch = entreprise && entrepriseId && !entreprise.siret && !entreprise.nom;

  const { data: fetchedEntreprise, isLoading: isFetchingEntreprise, error: fetchError } = useQuery({
    queryKey: ['entreprise-detail', entrepriseId],
    queryFn: async () => {
      if (!entrepriseId) {
        console.warn('[UnifiedEntreprisePanel] No entrepriseId provided');
        return null;
      }
      
      console.log('[UnifiedEntreprisePanel] Fetching entreprise:', entrepriseId);
      
      try {
        const { data, error } = await supabase
          .from('nouveaux_sites')
          .select('*')
          .eq('id', entrepriseId)
          .single();
        
        if (error) {
          console.error('[UnifiedEntreprisePanel] Supabase error:', error);
          throw error;
        }
        
        if (!data) {
          console.error('[UnifiedEntreprisePanel] No data returned for ID:', entrepriseId);
          return null;
        }
        
        console.log('[UnifiedEntreprisePanel] Successfully fetched:', data);
        return data;
      } catch (error) {
        console.error('[UnifiedEntreprisePanel] Fetch error:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les données de l'entreprise",
          variant: "destructive"
        });
        return null;
      }
    },
    enabled: open && !!entrepriseId,
    staleTime: 5 * 60 * 1000,
    retry: 1,
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

  // Show error state if fetch failed
  if (fetchError && !displayEntreprise) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent 
          side={isMobile ? "bottom" : "right"} 
          className={`${isMobile ? 'h-[90vh]' : 'w-[420px]'} p-0 flex flex-col`}
        >
          <div className="p-6 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto">
              <span className="text-3xl">⚠️</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-red-400 mb-2">Erreur de chargement</h3>
              <p className="text-sm text-muted-foreground">
                Impossible de charger les données de cette entreprise
              </p>
            </div>
            <Button onClick={() => onOpenChange(false)} variant="outline">
              Fermer
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

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

  // Vérification de sécurité : s'assurer que displayEntreprise est valide
  if (!displayEntreprise || typeof displayEntreprise !== 'object') {
    console.error('[UnifiedEntreprisePanel] Invalid entreprise data:', displayEntreprise);
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent 
          side={isMobile ? "bottom" : "right"} 
          className={`${isMobile ? 'h-[90vh]' : 'w-[420px]'} p-0 flex flex-col`}
        >
          <div className="p-6 text-center">
            <p className="text-red-400">Erreur : Données entreprise invalides</p>
            <Button onClick={() => onOpenChange(false)} className="mt-4">
              Fermer
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  // Format address from real data - avec vérifications
  const addressParts = [
    displayEntreprise?.numero_voie,
    displayEntreprise?.type_voie,
    displayEntreprise?.libelle_voie,
    displayEntreprise?.complement_adresse
  ].filter(Boolean).join(' ');
  
  const formattedAddress = addressParts || displayEntreprise?.adresse || '';
  const cityLine = [displayEntreprise?.code_postal, displayEntreprise?.ville].filter(Boolean).join(' ');

  // Get NAF info - avec vérifications
  const nafSectionInfo = displayEntreprise?.naf_section && NAF_SECTIONS ? NAF_SECTIONS[displayEntreprise.naf_section] : null;
  const nafDivisionInfo = displayEntreprise?.naf_division && NAF_DIVISIONS ? NAF_DIVISIONS[displayEntreprise.naf_division] : null;

  // Format date - avec vérifications
  const formattedDate = displayEntreprise?.date_creation 
    ? (() => {
        try {
          return new Date(displayEntreprise.date_creation).toLocaleDateString('fr-FR', { 
            day: 'numeric', 
            month: 'long', 
            year: 'numeric' 
          });
        } catch (e) {
          console.error('Error formatting date:', e);
          return null;
        }
      })()
    : null;

  const hasCoordinates = displayEntreprise?.latitude && displayEntreprise?.longitude;
  
  // Handle unlock
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);

  const handleUnlock = async () => {
    if (!displayEntreprise?.id) return;
    
    const result = await unlockProspect(displayEntreprise.id);
    if (result.success) {
      toast({
        title: "✅ Prospect débloqué !",
        description: `${result.remaining}/${result.limit} prospects restants`,
      });
      // Reload the component to reflect the change
      queryClient.invalidateQueries({ queryKey: ['entreprise-detail', entrepriseId] });
    } else if (result.limit_reached) {
      // Show upgrade modal
      setShowUpgradeDialog(true);
    } else {
      toast({
        title: "❌ Erreur",
        description: result.message,
        variant: "destructive"
      });
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
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <h2 className="text-lg font-bold leading-tight">
                {displayEntreprise?.nom || displayEntreprise?.denomination_unite_legale || 'Entreprise'}
              </h2>
              {cityLine && (
                <p className="text-sm text-muted-foreground mt-0.5">{cityLine}</p>
              )}
            </div>
            <div className="flex gap-2">
              <Badge variant={isPro ? "default" : "secondary"} className="text-xs">
                {isPro ? "PRO" : "FREE"}
              </Badge>
              {canSeeDetails && !isPro && (
                <Badge variant="outline" className="gap-1 text-xs bg-emerald-500/10 border-emerald-500/30">
                  <Unlock className="w-3 h-3" />
                  Débloqué
                </Badge>
              )}
            </div>
          </div>
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
                  {/* Unlock CTA for FREE users */}
                  {!canSeeDetails && (
                    <div className="p-4 bg-gradient-to-br from-accent/10 via-accent/5 to-transparent border-2 border-accent/30 rounded-lg text-center space-y-3 shadow-lg">
                      <div className="w-14 h-14 mx-auto rounded-full bg-gradient-to-br from-accent/30 to-orange-500/20 flex items-center justify-center">
                        <Lock className="w-7 h-7 text-accent" />
                      </div>
                      <div>
                        <p className="font-bold text-base">Prospect Verrouillé</p>
                        <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                          Débloquez pour voir <strong className="text-foreground">SIRET, adresse complète, date de création</strong> et toutes les infos détaillées
                        </p>
                      </div>
                      <Button onClick={handleUnlock} className="w-full bg-gradient-to-r from-accent to-cyan-500 hover:from-accent/90 hover:to-cyan-500/90 text-black font-bold shadow-lg" size="default">
                        <Unlock className="w-4 h-4 mr-2" />
                        Débloquer ce prospect
                      </Button>
                      <div className="flex items-center justify-center gap-2 text-xs">
                        <span className="text-muted-foreground">
                          {userPlan?.prospects_unlocked_count || 0}/30 prospects débloqués
                        </span>
                        {userPlan && userPlan.prospects_unlocked_count >= 25 && (
                          <span className="text-orange-400 font-semibold">⚠️ Bientôt la limite</span>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Adresse - Bloquée pour FREE */}
                  <div className="space-y-2 relative">
                    <div className="flex items-center gap-2 text-xs font-semibold text-accent uppercase tracking-wide">
                      {canSeeDetails ? (
                        <MapPin className="w-3.5 h-3.5" />
                      ) : (
                        <Lock className="w-3.5 h-3.5 text-orange-500/80" />
                      )}
                      Adresse {!canSeeDetails && <span className="text-orange-500/80 text-[10px] font-normal normal-case">(Verrouillée)</span>}
                    </div>
                    {canSeeDetails ? (
                      <>
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
                      </>
                    ) : (
                      <div className="relative">
                        <div className="text-sm blur-[4px] select-none text-muted-foreground pointer-events-none">
                          RUE DE COBLENCE, 58000 NEVERS
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-background/50 to-transparent pointer-events-none" />
                      </div>
                    )}
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

                  {/* SIREN - Bloqué pour FREE */}
                  <div className="space-y-1 pt-3 border-t border-accent/10 relative">
                    <div className="flex items-center gap-2 text-xs font-semibold text-accent uppercase tracking-wide">
                      {canSeeDetails ? (
                        <Hash className="w-3.5 h-3.5" />
                      ) : (
                        <Lock className="w-3.5 h-3.5 text-orange-500/80" />
                      )}
                      SIREN {!canSeeDetails && <span className="text-orange-500/80 text-[10px] font-normal normal-case">(Verrouillé)</span>}
                    </div>
                    {canSeeDetails ? (
                      <p className="text-sm font-mono">
                        {displayEntreprise.siret 
                          ? displayEntreprise.siret.substring(0, 9).replace(/(\d{3})(\d{3})(\d{3})/, '$1 $2 $3')
                          : <span className="text-muted-foreground italic font-sans">Non renseigné</span>}
                      </p>
                    ) : (
                      <div className="relative">
                        <p className="text-sm font-mono blur-[4px] select-none text-muted-foreground pointer-events-none">
                          990 470 197
                        </p>
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-background/50 to-transparent pointer-events-none" />
                      </div>
                    )}
                  </div>

                  {/* Catégorie juridique */}
                  {canSeeDetails && displayEntreprise.categorie_juridique && (
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

                  {/* Date de création - Bloqué pour FREE */}
                  <div className="space-y-1 pt-3 border-t border-accent/10 relative">
                    <div className="flex items-center gap-2 text-xs font-semibold text-accent uppercase tracking-wide">
                      {canSeeDetails ? (
                        <Calendar className="w-3.5 h-3.5" />
                      ) : (
                        <Lock className="w-3.5 h-3.5 text-orange-500/80" />
                      )}
                      Date de création {!canSeeDetails && <span className="text-orange-500/80 text-[10px] font-normal normal-case">(Verrouillée)</span>}
                    </div>
                    {canSeeDetails ? (
                      <p className="text-sm">
                        {formattedDate || <span className="text-muted-foreground italic">Non renseignée</span>}
                      </p>
                    ) : (
                      <div className="relative">
                        <p className="text-sm blur-[4px] select-none text-muted-foreground pointer-events-none">
                          15 janvier 2024
                        </p>
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-background/50 to-transparent pointer-events-none" />
                      </div>
                    )}
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
              disabled={!hasCoordinates || !canSeeDetails}
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

      {/* Upgrade Dialog */}
      <UpgradeDialog
        open={showUpgradeDialog}
        onOpenChange={setShowUpgradeDialog}
        feature="Déblocage de prospects"
        reason={`Vous avez atteint votre limite (${userPlan?.prospects_unlocked_count || 0}/${userPlan?.prospects_limit || 30} prospects). Passez à PRO pour un accès illimité.`}
      />
    </Sheet>
  );
};
