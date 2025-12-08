import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type ProspectStatus = 'nouveau' | 'contacte' | 'qualifie' | 'proposition' | 'negociation' | 'gagne' | 'perdu';

interface ProspectStatusBadgeProps {
  status: ProspectStatus;
  className?: string;
  showLabel?: boolean;
}

const STATUS_CONFIG: Record<ProspectStatus, { label: string; color: string; bgColor: string; borderColor: string }> = {
  nouveau: {
    label: "Nouveau",
    color: "text-blue-500",
    bgColor: "bg-blue-500/15",
    borderColor: "border-blue-500/30"
  },
  contacte: {
    label: "Contacté",
    color: "text-orange-500",
    bgColor: "bg-orange-500/15",
    borderColor: "border-orange-500/30"
  },
  qualifie: {
    label: "Qualifié",
    color: "text-purple-500",
    bgColor: "bg-purple-500/15",
    borderColor: "border-purple-500/30"
  },
  proposition: {
    label: "Proposition",
    color: "text-amber-500",
    bgColor: "bg-amber-500/15",
    borderColor: "border-amber-500/30"
  },
  negociation: {
    label: "Négociation",
    color: "text-cyan-500",
    bgColor: "bg-cyan-500/15",
    borderColor: "border-cyan-500/30"
  },
  gagne: {
    label: "Gagné",
    color: "text-green-500",
    bgColor: "bg-green-500/15",
    borderColor: "border-green-500/30"
  },
  perdu: {
    label: "Perdu",
    color: "text-gray-400",
    bgColor: "bg-gray-500/15",
    borderColor: "border-gray-500/30"
  }
};

export const ProspectStatusBadge = ({ status, className, showLabel = true }: ProspectStatusBadgeProps) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.nouveau;
  
  return (
    <Badge 
      variant="outline"
      className={cn(
        "text-xs font-medium border",
        config.color,
        config.bgColor,
        config.borderColor,
        className
      )}
    >
      <span className={cn("w-1.5 h-1.5 rounded-full mr-1.5", config.color.replace("text-", "bg-"))} />
      {showLabel && config.label}
    </Badge>
  );
};

export const getStatusConfig = (status: ProspectStatus) => STATUS_CONFIG[status] || STATUS_CONFIG.nouveau;
