import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock, Unlock, MapPin, Building2, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { UpgradeDialog } from "./upgrade/UpgradeDialog";

interface LockedEntrepriseCardProps {
  entreprise: any;
  isUnlocked: boolean;
  onUnlock: () => Promise<{ success: boolean; limit_reached: boolean; message?: string }>;
  onClick?: () => void;
  isPro: boolean;
}

export const LockedEntrepriseCard = ({ 
  entreprise, 
  isUnlocked, 
  onUnlock, 
  onClick,
  isPro 
}: LockedEntrepriseCardProps) => {
  const [unlocking, setUnlocking] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [localUnlocked, setLocalUnlocked] = useState(isUnlocked);

  const handleUnlock = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // 🔥 PRO USERS : Accès direct sans restrictions
    if (isPro) {
      if (onClick) onClick();
      return;
    }

    // Les utilisateurs FREE n'ont plus accès - redirection vers upgrade
    setShowUpgrade(true);
  };

  const formatAddress = () => {
    const parts = [
      entreprise.numero_voie,
      entreprise.type_voie,
      entreprise.libelle_voie
    ].filter(Boolean).join(' ');
    
    return parts 
      ? `${parts}, ${entreprise.code_postal} ${entreprise.ville || ''}`
      : `${entreprise.code_postal || ''} ${entreprise.ville || ''}`.trim();
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <>
      <Card 
        className="relative group cursor-pointer transition-all duration-300 overflow-hidden glass-card border-accent/30 hover:border-accent/60 hover:shadow-xl hover:shadow-accent/20"
        onClick={handleUnlock}
      >
        {/* 🔥 SUPPRIMÉ : Plus d'overlay de verrouillage pour PRO */}
        {!isPro && (
          <div className="absolute inset-0 bg-gradient-to-br from-black/60 to-black/40 backdrop-blur-[2px] z-10 flex items-center justify-center">
            <div className="text-center space-y-3 p-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-accent/20 backdrop-blur-sm flex items-center justify-center">
                <Lock className="w-8 h-8 text-accent" />
              </div>
              <Button 
                onClick={handleUnlock}
                className="bg-gradient-to-r from-accent to-cyan-500 hover:from-accent/90 hover:to-cyan-500/90 text-black font-bold shadow-lg"
              >
                <span className="flex items-center gap-2">
                  <Unlock className="w-4 h-4" />
                  Passer à PRO
                </span>
              </Button>
              <p className="text-xs text-white/70">
                Accès illimité avec PRO
              </p>
            </div>
          </div>
        )}

        {/* Card content */}
        <div className="p-4 space-y-3">
          {/* Header with PRO indicator */}
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-bold text-base line-clamp-2 flex-1">
              {entreprise.nom || entreprise.denomination_unite_legale || 'Entreprise'}
            </h3>
            {isPro && (
              <div className="flex-shrink-0">
                <Badge variant="outline" className="bg-emerald-500/10 border-emerald-500/30 text-emerald-400">
                  <Unlock className="w-3 h-3 mr-1" />
                  PRO
                </Badge>
              </div>
            )}
          </div>

          {/* SIRET */}
          {entreprise.siret && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Building2 className="w-3 h-3" />
              <span className="font-mono">{entreprise.siret}</span>
            </div>
          )}

          {/* Address */}
          <div className="flex items-start gap-2 text-xs text-muted-foreground">
            <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0" />
            <span className="line-clamp-2">{formatAddress()}</span>
          </div>

          {/* NAF Code */}
          {entreprise.code_naf && (
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                {entreprise.code_naf}
              </Badge>
              {entreprise.libelle_activite_principale && (
                <span className="text-xs text-muted-foreground line-clamp-1">
                  {entreprise.libelle_activite_principale}
                </span>
              )}
            </div>
          )}

          {/* Creation date */}
          {entreprise.date_creation && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="w-3 h-3" />
              <span>Créée le {formatDate(entreprise.date_creation)}</span>
            </div>
          )}
        </div>
      </Card>

      <UpgradeDialog
        open={showUpgrade}
        onOpenChange={setShowUpgrade}
        feature="Déblocage de prospects"
        reason="Vous avez atteint la limite de 30 prospects débloqués. Passez à PRO pour accéder aux nouvelles entreprises."
      />
    </>
  );
};
