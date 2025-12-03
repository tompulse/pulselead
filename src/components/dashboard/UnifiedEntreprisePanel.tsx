import { useEffect, useState } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useIsMobile } from "@/hooks/use-mobile";
import { Building2, MapPin, Calendar, X, Navigation } from "lucide-react";
import { openGoogleMaps, openWaze } from "@/utils/navigation";

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

  if (!entreprise) return null;

  const formattedAddress = [
    entreprise.numero_voie,
    entreprise.type_voie,
    entreprise.libelle_voie,
    entreprise.code_postal,
    entreprise.ville
  ].filter(Boolean).join(' ') || entreprise.adresse || 'Adresse non disponible';

  const content = (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-start justify-between p-6 border-b border-accent/20">
        <div className="flex-1 pr-4">
          <h2 className="text-2xl font-bold mb-2">{entreprise.nom}</h2>
          <p className="text-sm text-muted-foreground">{entreprise.categorie_detaillee || entreprise.categorie_entreprise || 'Non catégorisé'}</p>
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

      {/* Content */}
      <ScrollArea className="flex-1 px-6">
        <div className="space-y-6 py-4">
          {/* Address */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-accent">
              <MapPin className="w-4 h-4" />
              <span>Adresse</span>
            </div>
            <p className="text-sm pl-6">{formattedAddress}</p>
            {entreprise.latitude && entreprise.longitude && (
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
            )}
          </div>

          <Separator />

          {/* Activity */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-accent">
              <Building2 className="w-4 h-4" />
              <span>Activité</span>
            </div>
            <p className="text-sm pl-6">{entreprise.categorie_detaillee || 'Non renseigné'}</p>
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

          {/* Date création */}
          {entreprise.date_creation && (
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm font-semibold text-accent">
                <Calendar className="w-4 h-4" />
                <span>Date de création</span>
              </div>
              <p className="text-sm pl-6">
                {new Date(entreprise.date_creation).toLocaleDateString('fr-FR')}
              </p>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Actions rapides en bas */}
      {entreprise.latitude && entreprise.longitude && (
        <div className="shrink-0 px-6 py-4 border-t border-accent/20 bg-gradient-to-b from-transparent to-accent/5">
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={() => openGoogleMaps(entreprise.latitude, entreprise.longitude)}
              className="h-12 bg-green-500/10 hover:bg-green-500/20 text-green-500 border border-green-500/20 hover:border-green-500/40 transition-all"
            >
              <MapPin className="w-4 h-4 mr-2" />
              Maps
            </Button>

            <Button
              onClick={() => openWaze(entreprise.latitude, entreprise.longitude)}
              className="h-12 bg-purple-500/10 hover:bg-purple-500/20 text-purple-500 border border-purple-500/20 hover:border-purple-500/40 transition-all"
            >
              <Navigation className="w-4 h-4 mr-2" />
              Waze
            </Button>
          </div>
        </div>
      )}
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