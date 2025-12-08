import { useEffect, useState } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { useCRMActions } from "@/hooks/useCRMActions";
import { UnifiedCRMActions } from "./UnifiedCRMActions";
import { InteractionTimeline } from "./InteractionTimeline";
import { LeadStatusBadge } from "./LeadStatusBadge";
import { Building2, MapPin, Calendar, X, Navigation, Hash, Factory } from "lucide-react";
import { openGoogleMaps, openWaze } from "@/utils/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { NAF_SECTIONS, NAF_DIVISIONS } from "@/utils/nafNomenclatureComplete";

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

  const {
    interactions,
    leadStatus,
    isLoading,
  } = useCRMActions(entreprise?.id || '', userId);

  useEffect(() => {
    if (open) {
      setActiveTab('info');
    }
  }, [open]);

  if (!entreprise) return null;

  // Format address from real data
  const addressParts = [
    entreprise.numero_voie,
    entreprise.type_voie,
    entreprise.libelle_voie,
    entreprise.complement_adresse
  ].filter(Boolean).join(' ');
  
  const formattedAddress = addressParts || entreprise.adresse || '';
  const cityLine = [entreprise.code_postal, entreprise.ville].filter(Boolean).join(' ');

  // Get NAF info
  const nafSectionInfo = entreprise.naf_section ? NAF_SECTIONS[entreprise.naf_section] : null;
  const nafDivisionInfo = entreprise.naf_division ? NAF_DIVISIONS[entreprise.naf_division] : null;

  // Format date
  const formattedDate = entreprise.date_creation 
    ? new Date(entreprise.date_creation).toLocaleDateString('fr-FR', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
      })
    : null;

  const hasCoordinates = entreprise.latitude && entreprise.longitude;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent 
        side={isMobile ? "bottom" : "right"} 
        className={`${isMobile ? 'h-[90vh]' : 'w-[420px]'} p-0 flex flex-col`}
      >
        {/* Header */}
        <div className="shrink-0 p-4 border-b border-accent/20 bg-gradient-to-r from-accent/5 to-transparent">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold leading-tight">{entreprise.nom || 'Entreprise'}</h2>
              {cityLine && (
                <p className="text-sm text-muted-foreground mt-0.5">{cityLine}</p>
              )}
              {leadStatus && (
                <div className="mt-2">
                  <LeadStatusBadge statut={leadStatus.statut_actuel} />
                </div>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="shrink-0 -mr-2 -mt-1 h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
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
                      {formattedAddress ? (
                        <p>{formattedAddress}</p>
                      ) : null}
                      {cityLine && <p className="font-medium">{cityLine}</p>}
                      {!formattedAddress && !cityLine && (
                        <p className="text-muted-foreground italic">Non renseignée</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openGoogleMaps(entreprise.latitude, entreprise.longitude)}
                        className="h-8 text-xs border-accent/30 hover:bg-accent/10"
                        disabled={!hasCoordinates}
                      >
                        Google Maps
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openWaze(entreprise.latitude, entreprise.longitude)}
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
                    {entreprise.code_naf ? (
                      <p className="text-xs text-muted-foreground font-mono">Code NAF: {entreprise.code_naf}</p>
                    ) : !nafSectionInfo && !nafDivisionInfo ? (
                      <p className="text-sm text-muted-foreground italic">Non renseignée</p>
                    ) : null}
                  </div>

                  {/* SIRET */}
                  <div className="space-y-1 pt-3 border-t border-accent/10">
                    <div className="flex items-center gap-2 text-xs font-semibold text-accent uppercase tracking-wide">
                      <Hash className="w-3.5 h-3.5" />
                      SIRET
                    </div>
                    <p className="text-sm font-mono">
                      {entreprise.siret || <span className="text-muted-foreground italic font-sans">Non renseigné</span>}
                    </p>
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
                      {entreprise.categorie_entreprise && entreprise.categorie_entreprise !== 'Non spécifié' 
                        ? entreprise.categorie_entreprise 
                        : <span className="text-muted-foreground italic">Non renseignée</span>}
                    </p>
                  </div>

                  {/* Type d'établissement */}
                  <div className="pt-3 border-t border-accent/10">
                    <span className={`text-xs px-2.5 py-1 rounded-full ${
                      entreprise.est_siege 
                        ? 'bg-green-500/15 text-green-600 dark:text-green-400 border border-green-500/30' 
                        : 'bg-muted text-muted-foreground border border-muted-foreground/20'
                    }`}>
                      {entreprise.est_siege ? 'Siège social' : 'Établissement secondaire'}
                    </span>
                  </div>
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
                          entrepriseId={entreprise.id}
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
              onClick={() => openGoogleMaps(entreprise.latitude, entreprise.longitude)}
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
