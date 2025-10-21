import { useEffect, useState } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useIsMobile } from "@/hooks/use-mobile";
import { useCRMActions } from "@/hooks/useCRMActions";
import { QuickActionButtons } from "./QuickActionButtons";
import { InteractionTimeline } from "./InteractionTimeline";
import { LeadStatusBadge } from "./LeadStatusBadge";
import { PhoneButton } from "./PhoneButton";
import { Building2, MapPin, Calendar, DollarSign, X } from "lucide-react";
import { openGoogleMaps, openWaze } from "@/utils/navigation";
import { Skeleton } from "@/components/ui/skeleton";

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
    addInteraction,
    removeInteraction,
    updateLeadStatus,
    isUpdating
  } = useCRMActions(entreprise?.id || '', userId);

  // Reset to info tab when opening
  useEffect(() => {
    if (open) {
      setActiveTab('info');
    }
  }, [open]);

  if (!entreprise) return null;

  const formattedAddress = [
    entreprise.numero_voie,
    entreprise.type_voie,
    entreprise.nom_voie,
    entreprise.code_postal,
    entreprise.ville
  ].filter(Boolean).join(' ');

  const formattedCapital = entreprise.capital 
    ? new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(entreprise.capital)
    : 'Non disponible';

  const content = (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-start justify-between p-6 border-b border-accent/20">
        <div className="flex-1 pr-4">
          <h2 className="text-2xl font-bold mb-2">{entreprise.nom}</h2>
          {leadStatus && (
            <LeadStatusBadge 
              statut={leadStatus.statut_actuel}
            />
          )}
          <p className="text-sm text-muted-foreground">{entreprise.activite}</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onOpenChange(false)}
          className="shrink-0"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'info' | 'crm')} className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-2 mx-6 mt-4">
          <TabsTrigger value="info">Informations</TabsTrigger>
          <TabsTrigger value="crm">CRM</TabsTrigger>
        </TabsList>

        <ScrollArea className="flex-1 px-6">
          {/* Informations Tab */}
          <TabsContent value="info" className="space-y-6 py-4">
            {/* Address */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-semibold text-accent">
                <MapPin className="w-4 h-4" />
                <span>Adresse</span>
              </div>
              <p className="text-sm pl-6">{formattedAddress}</p>
              <div className="flex gap-2 pl-6">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => openGoogleMaps(entreprise.latitude, entreprise.longitude)}
                  className="border-accent/30 hover:bg-accent/10"
                >
                  Google Maps
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => openWaze(entreprise.latitude, entreprise.longitude)}
                  className="border-accent/30 hover:bg-accent/10"
                >
                  Waze
                </Button>
              </div>
            </div>

            <Separator />

            {/* Activity */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-semibold text-accent">
                <Building2 className="w-4 h-4" />
                <span>Activité</span>
              </div>
              <p className="text-sm pl-6">{entreprise.activite || 'Non renseigné'}</p>
              {entreprise.code_naf && (
                <p className="text-xs text-muted-foreground pl-6">Code NAF: {entreprise.code_naf}</p>
              )}
            </div>

            <Separator />

            {/* SIRET */}
            {entreprise.siret && (
              <>
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-accent">SIRET</p>
                  <p className="text-sm pl-6">{entreprise.siret}</p>
                </div>
                <Separator />
              </>
            )}

            {/* Contact */}
            <div className="space-y-2">
              <p className="text-sm font-semibold text-accent">Contact</p>
              <div className="pl-6 space-y-2">
                {entreprise.telephone ? (
                  <PhoneButton phoneNumber={entreprise.telephone} entrepriseName={entreprise.nom} />
                ) : (
                  <p className="text-sm text-muted-foreground">Téléphone non disponible</p>
                )}
                {entreprise.email && (
                  <p className="text-sm">{entreprise.email}</p>
                )}
              </div>
            </div>

            <Separator />

            {/* Financial Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm font-semibold text-accent">
                  <DollarSign className="w-4 h-4" />
                  <span>Capital</span>
                </div>
                <p className="text-sm pl-6">{formattedCapital}</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm font-semibold text-accent">
                  <Calendar className="w-4 h-4" />
                  <span>Date de création</span>
                </div>
                <p className="text-sm pl-6">
                  {entreprise.date_demarrage 
                    ? new Date(entreprise.date_demarrage).toLocaleDateString('fr-FR')
                    : 'Non disponible'}
                </p>
              </div>
            </div>
          </TabsContent>

          {/* CRM Tab */}
          <TabsContent value="crm" className="space-y-6 py-4">
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-64 w-full" />
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-accent">Actions rapides</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <Button 
                      size="sm" 
                      variant={interactions.some(i => i.type === 'appel') ? "default" : "outline"}
                      onClick={() => interactions.some(i => i.type === 'appel') ? removeInteraction('appel') : addInteraction({ type: 'appel' })}
                      disabled={isUpdating}
                    >
                      Appel
                    </Button>
                    <Button 
                      size="sm" 
                      variant={interactions.some(i => i.type === 'visite') ? "default" : "outline"}
                      onClick={() => interactions.some(i => i.type === 'visite') ? removeInteraction('visite') : addInteraction({ type: 'visite' })}
                      disabled={isUpdating}
                    >
                      Visite
                    </Button>
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-accent">Historique des interactions</h3>
                  <InteractionTimeline 
                    interactions={interactions}
                  />
                </div>
              </>
            )}
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </div>
  );

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="h-[90vh] p-0">
          {content}
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl h-[80vh] p-0">
        {content}
      </DialogContent>
    </Dialog>
  );
};
