import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface LeadStatusBadgeProps {
  statut: 'nouveau' | 'contacte' | 'qualifie' | 'proposition' | 'negociation' | 'gagne' | 'perdu';
  probabilite?: number;
  showTooltip?: boolean;
}

const getStatusColor = (statut: string): "default" | "secondary" | "destructive" | "outline" => {
  switch (statut) {
    case 'nouveau':
      return 'outline';
    case 'contacte':
      return 'secondary';
    case 'qualifie':
    case 'proposition':
    case 'negociation':
      return 'default';
    case 'gagne':
      return 'default';
    case 'perdu':
      return 'destructive';
    default:
      return 'outline';
  }
};

const getStatusLabel = (statut: string) => {
  const labels = {
    nouveau: '🆕 Nouveau',
    contacte: '📞 Contacté',
    qualifie: '✅ Qualifié',
    proposition: '📄 Proposition',
    negociation: '🤝 Négociation',
    gagne: '🎉 Gagné',
    perdu: '❌ Perdu',
  };
  return labels[statut as keyof typeof labels] || statut;
};

const getStatusDescription = (statut: string, probabilite?: number) => {
  const descriptions = {
    nouveau: 'Lead non contacté',
    contacte: 'Premier contact établi',
    qualifie: 'Besoin identifié et validé',
    proposition: 'Proposition commerciale envoyée',
    negociation: 'Discussion en cours sur les conditions',
    gagne: 'Contrat signé',
    perdu: 'Opportunité perdue',
  };
  
  const baseDesc = descriptions[statut as keyof typeof descriptions] || '';
  if (probabilite !== undefined && statut !== 'gagne' && statut !== 'perdu') {
    return `${baseDesc} • ${probabilite}% de chances de conversion`;
  }
  return baseDesc;
};

export const LeadStatusBadge = ({ statut, probabilite, showTooltip = true }: LeadStatusBadgeProps) => {
  const badge = (
    <Badge variant={getStatusColor(statut)} className="whitespace-nowrap">
      {getStatusLabel(statut)}
    </Badge>
  );

  if (!showTooltip) {
    return badge;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {badge}
        </TooltipTrigger>
        <TooltipContent>
          <p>{getStatusDescription(statut, probabilite)}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
