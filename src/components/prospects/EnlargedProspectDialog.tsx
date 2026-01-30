import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lock, Unlock, MapPin, Building2, Calendar, Mail, Phone } from "lucide-react";
import { useState } from "react";
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { UpgradeDialog } from "../upgrade/UpgradeDialog";
import { cn } from "@/lib/utils";

interface EnlargedProspectDialogProps {
  site: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  canSeeDetails: boolean;
  isPro: boolean;
  onUnlock: (siteId: string) => Promise<{ success: boolean; limit_reached: boolean; remaining?: number; limit?: number }>;
  onUnlockSuccess?: () => void;
}

export const EnlargedProspectDialog = ({ 
  site, 
  open, 
  onOpenChange,
  canSeeDetails: initialCanSeeDetails,
  isPro,
  onUnlock,
  onUnlockSuccess
}: EnlargedProspectDialogProps) => {
  const [unlocking, setUnlocking] = useState(false);
  const [localCanSeeDetails, setLocalCanSeeDetails] = useState(initialCanSeeDetails);
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);

  // 🔥 PRO USERS : Toujours accès complet sans restrictions
  const canSeeDetails = isPro || localCanSeeDetails || initialCanSeeDetails;

  // Format address
  const addressParts = [
    site?.numero_voie,
    site?.type_voie,
    site?.libelle_voie
  ].filter(Boolean).join(' ');
  
  const fullAddress = addressParts 
    ? `${addressParts}, ${site?.code_postal} ${site?.ville || ''}`
    : `${site?.code_postal || ''} ${site?.ville || ''}`.trim();

  const handleUnlock = async () => {
    // 🔥 PRO : Pas besoin de déblocage, accès direct
    if (isPro) return;
    
    // FREE : Redirect vers upgrade
    setShowUpgradeDialog(true);
  };

  return (
    <>
      <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
        <DialogPrimitive.Portal>
          {/* Overlay SANS backdrop-blur */}
          <DialogPrimitive.Overlay
            className="fixed inset-0 z-[9999] bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
          />
          
          {/* Content du Dialog */}
          <DialogPrimitive.Content
            className={cn(
              "fixed left-[50%] top-[50%] z-[10000] grid w-full max-w-[95vw] sm:max-w-[500px] max-h-[85vh] translate-x-[-50%] translate-y-[-50%] overflow-y-auto border border-accent/30 bg-background shadow-2xl duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 sm:rounded-lg p-0"
            )}
          >
          <div className="relative">
            {/* Card Content */}
            <div className="p-6 space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl font-bold leading-tight line-clamp-2">
                    {site?.nom || site?.denomination_unite_legale || 'Entreprise'}
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    {site?.ville || 'Ville inconnue'}
                  </p>
                </div>
                
                {canSeeDetails ? (
                  <Badge variant="outline" className="bg-emerald-500/10 border-emerald-500/30 text-emerald-400 flex-shrink-0">
                    <Unlock className="w-3 h-3 mr-1" />
                    {isPro ? 'PRO' : 'Débloqué'}
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-orange-500/10 border-orange-500/30 text-orange-400 flex-shrink-0">
                    <Lock className="w-3 h-3 mr-1" />
                    Verrouillé
                  </Badge>
                )}
              </div>

              {/* Separator */}
              <div className="h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent" />

              {/* SIRET */}
              {site?.siret && (
                <div className="flex items-center gap-3">
                  <Building2 className="w-4 h-4 text-accent flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">SIRET</p>
                    {canSeeDetails ? (
                      <p className="font-mono text-sm">{site.siret}</p>
                    ) : (
                      <div className="relative">
                        <p className="font-mono text-sm blur-sm select-none">123 456 789 01234</p>
                        <Lock className="w-3 h-3 text-orange-500/80 absolute right-0 top-1/2 -translate-y-1/2" />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Address */}
              {fullAddress && (
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">Adresse</p>
                    {canSeeDetails ? (
                      <p className="text-sm">{fullAddress}</p>
                    ) : (
                      <div className="relative">
                        <p className="text-sm blur-sm select-none">RUE DE COBLENCE, 58000 NEVERS</p>
                        <Lock className="w-3 h-3 text-orange-500/80 absolute right-0 top-1/2 -translate-y-1/2" />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Email */}
              {site?.email && (
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-accent flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">Email</p>
                    {canSeeDetails ? (
                      <p className="text-sm">{site.email}</p>
                    ) : (
                      <div className="relative">
                        <p className="text-sm blur-sm select-none">contact@entreprise.fr</p>
                        <Lock className="w-3 h-3 text-orange-500/80 absolute right-0 top-1/2 -translate-y-1/2" />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Phone */}
              {site?.telephone && (
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-accent flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">Téléphone</p>
                    {canSeeDetails ? (
                      <p className="text-sm">{site.telephone}</p>
                    ) : (
                      <div className="relative">
                        <p className="text-sm blur-sm select-none">01 23 45 67 89</p>
                        <Lock className="w-3 h-3 text-orange-500/80 absolute right-0 top-1/2 -translate-y-1/2" />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* NAF Code */}
              {site?.code_naf && (
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {site.code_naf}
                  </Badge>
                  {site?.libelle_activite_principale && (
                    <span className="text-xs text-muted-foreground line-clamp-1">
                      {site.libelle_activite_principale}
                    </span>
                  )}
                </div>
              )}

              {/* Creation date */}
              {site?.date_creation && (
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-accent flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">Date de création</p>
                    <p className="text-sm">
                      {format(new Date(site.date_creation), 'dd MMMM yyyy', { locale: fr })}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Unlock Button - Fixed at bottom */}
            {!canSeeDetails && (
              <div className="sticky bottom-0 p-4 bg-gradient-to-t from-background via-background to-transparent border-t border-accent/20">
                <Button
                  onClick={handleUnlock}
                  disabled={unlocking}
                  className="w-full bg-gradient-to-r from-accent to-cyan-500 hover:from-accent/90 hover:to-cyan-500/90 text-black font-bold shadow-lg h-12"
                >
                  {unlocking ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      Déblocage en cours...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Unlock className="w-5 h-5" />
                      Débloquer ce prospect
                    </span>
                  )}
                </Button>
                <p className="text-xs text-center text-muted-foreground mt-2">
                  Utilisez un de vos 30 déblocages gratuits
                </p>
              </div>
            )}
          </div>
          
          {/* Close button */}
          <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none z-50">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>

      <UpgradeDialog
        open={showUpgradeDialog}
        onOpenChange={setShowUpgradeDialog}
        feature="Déblocage de prospects"
        reason="Vous avez atteint la limite de 30 prospects débloqués. Passez à PRO pour un accès illimité."
      />
    </>
  );
};
