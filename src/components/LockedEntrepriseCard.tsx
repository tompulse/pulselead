import { Card } from "@/components/ui/card";
import { MapPin, Building2, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface LockedEntrepriseCardProps {
  entreprise: any;
}

export const LockedEntrepriseCard = ({ 
  entreprise
}: LockedEntrepriseCardProps) => {

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
        className="relative transition-all duration-300 overflow-hidden glass-card border-accent/30"
      >

        {/* Card content */}
        <div className="p-4 space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-bold text-base line-clamp-2 flex-1">
              {entreprise.nom || entreprise.denomination_unite_legale || 'Entreprise'}
            </h3>
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
              <Badge variant="secondary" className="text-xs whitespace-nowrap">
                {entreprise.code_naf}
              </Badge>
              {entreprise.libelle_activite_principale && (
                <span className="text-xs text-muted-foreground">
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
    </>
  );
};
