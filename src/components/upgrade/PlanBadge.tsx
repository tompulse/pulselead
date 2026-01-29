import { Badge } from "@/components/ui/badge";
import { Sparkles, Unlock } from "lucide-react";

interface PlanBadgeProps {
  plan: 'free' | 'pro';
  className?: string;
  showIcon?: boolean;
}

export const PlanBadge = ({ plan, className = '', showIcon = true }: PlanBadgeProps) => {
  if (plan === 'pro') {
    return (
      <Badge 
        className={`bg-gradient-to-r from-accent/20 to-cyan-500/20 text-accent border-accent/40 font-bold ${className}`}
      >
        {showIcon && <Sparkles className="w-3 h-3 mr-1" />}
        PRO
      </Badge>
    );
  }
  
  return (
    <Badge 
      variant="outline" 
      className={`border-white/30 text-white/70 ${className}`}
    >
      {showIcon && <Unlock className="w-3 h-3 mr-1" />}
      Gratuit
    </Badge>
  );
};
