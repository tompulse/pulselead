import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export type LeadStatut = 'nouveau' | 'contacte' | 'qualifie' | 'proposition' | 'negociation' | 'gagne' | 'perdu';

interface LeadStatusBadgeProps {
  statut: LeadStatut;
  size?: 'sm' | 'md';
}

const statusConfig: Record<LeadStatut, { label: string; className: string }> = {
  nouveau: {
    label: 'Nouveau',
    className: 'bg-slate-500/20 text-slate-300 border-slate-500/30'
  },
  contacte: {
    label: 'Contacté',
    className: 'bg-blue-500/20 text-blue-300 border-blue-500/30'
  },
  qualifie: {
    label: 'Qualifié',
    className: 'bg-purple-500/20 text-purple-300 border-purple-500/30'
  },
  proposition: {
    label: 'Proposition',
    className: 'bg-orange-500/20 text-orange-300 border-orange-500/30'
  },
  negociation: {
    label: 'Négociation',
    className: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
  },
  gagne: {
    label: 'Gagné',
    className: 'bg-green-500/20 text-green-300 border-green-500/30'
  },
  perdu: {
    label: 'Perdu',
    className: 'bg-red-500/20 text-red-300 border-red-500/30'
  }
};

export const LeadStatusBadge = ({ statut, size = 'md' }: LeadStatusBadgeProps) => {
  const config = statusConfig[statut] || statusConfig.nouveau;
  
  return (
    <Badge 
      variant="outline" 
      className={cn(
        config.className,
        size === 'sm' ? 'text-xs px-1.5 py-0' : 'text-xs px-2 py-0.5'
      )}
    >
      {config.label}
    </Badge>
  );
};

export const getStatusLabel = (statut: LeadStatut): string => {
  return statusConfig[statut]?.label || statut;
};

export const allStatuts: LeadStatut[] = ['nouveau', 'contacte', 'qualifie', 'proposition', 'negociation', 'gagne', 'perdu'];
