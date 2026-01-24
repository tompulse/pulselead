import { Archive } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ArchivedBadgeProps {
  dateArchive?: string;
  className?: string;
  variant?: "default" | "compact";
}

export const ArchivedBadge = ({ 
  dateArchive, 
  className = "",
  variant = "default" 
}: ArchivedBadgeProps) => {
  const formattedDate = dateArchive 
    ? new Date(dateArchive).toLocaleDateString('fr-FR', { 
        day: 'numeric', 
        month: 'short', 
        year: 'numeric' 
      })
    : null;

  if (variant === "compact") {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={`inline-flex items-center gap-1 ${className}`}>
              <Archive className="h-3.5 w-3.5 text-muted-foreground/60" />
            </div>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-xs">
            <p className="text-xs">
              <span className="font-semibold">Entreprise archivée</span>
              {formattedDate && (
                <span className="block text-muted-foreground mt-0.5">
                  Archivée le {formattedDate}
                </span>
              )}
              <span className="block text-muted-foreground mt-1">
                Cette entreprise n'apparaît plus dans la base active mais reste accessible dans vos tournées et actions CRM.
              </span>
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            variant="outline" 
            className={`gap-1.5 text-xs bg-muted/50 text-muted-foreground border-muted-foreground/20 hover:bg-muted/70 transition-colors ${className}`}
          >
            <Archive className="h-3 w-3" />
            <span>Archivée</span>
          </Badge>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <p className="text-xs">
            <span className="font-semibold">Entreprise archivée</span>
            {formattedDate && (
              <span className="block text-muted-foreground mt-0.5">
                Archivée le {formattedDate}
              </span>
            )}
            <span className="block text-muted-foreground mt-1">
              Cette entreprise n'apparaît plus dans la base active mais reste accessible dans vos tournées et actions CRM.
            </span>
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
