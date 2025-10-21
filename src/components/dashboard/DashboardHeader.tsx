import { Button } from "@/components/ui/button";
import { Lightbulb, LogOut, MapIcon, Navigation, TrendingUp } from "lucide-react";
import { trackViewChange } from "@/utils/analytics";
import { SyncButton } from "./SyncButton";
import { useIsMobile } from "@/hooks/use-mobile";

interface DashboardHeaderProps {
  view: 'prospects' | 'tournees' | 'analytics';
  onViewChange: (view: 'prospects' | 'tournees' | 'analytics') => void;
  isAdmin: boolean;
  onLogout: () => void;
}

export const DashboardHeader = ({ view, onViewChange, isAdmin, onLogout }: DashboardHeaderProps) => {
  const isMobile = useIsMobile();

  const handleViewChange = (newView: typeof view) => {
    onViewChange(newView);
    trackViewChange(newView);
  };

  return (
    <header className="glass-card border-b border-accent/20 px-3 md:px-4 py-2 md:py-3 z-10 backdrop-blur-xl shrink-0">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 md:gap-4">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-accent/30 blur-lg animate-pulse" />
              <Lightbulb className="w-6 h-6 md:w-7 md:h-7 text-accent relative" />
            </div>
            <span className="text-lg md:text-xl font-bold gradient-text">LUMA</span>
          </div>
          
          {/* View Toggle */}
          <div className="flex gap-1 p-0.5 bg-card/50 rounded-lg border border-accent/20">
            <Button
              variant={view === "prospects" ? "default" : "ghost"}
              size="sm"
              onClick={() => handleViewChange("prospects")}
              className={`h-7 px-2 text-xs ${view === "prospects" ? "bg-accent text-primary hover:bg-accent/90" : "hover:bg-accent/10"}`}
            >
              <MapIcon className="w-3.5 h-3.5 mr-1" />
              <span className="hidden sm:inline">Prospects</span>
            </Button>
            <Button
              variant={view === "tournees" ? "default" : "ghost"}
              size="sm"
              onClick={() => handleViewChange("tournees")}
              className={`h-7 px-2 text-xs ${view === "tournees" ? "bg-accent text-primary hover:bg-accent/90" : "hover:bg-accent/10"}`}
            >
              <Navigation className="w-3.5 h-3.5 mr-1" />
              <span className="hidden sm:inline">Tournées</span>
            </Button>
            <Button
              variant={view === "analytics" ? "default" : "ghost"}
              size="sm"
              onClick={() => handleViewChange("analytics")}
              className={`h-7 px-2 text-xs ${view === "analytics" ? "bg-accent text-primary hover:bg-accent/90" : "hover:bg-accent/10"}`}
            >
              <TrendingUp className="w-3.5 h-3.5 mr-1" />
              <span className="hidden sm:inline">Analytics</span>
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isAdmin && !isMobile && <SyncButton />}
          <Button
            variant="outline"
            size="sm"
            onClick={onLogout}
            className="h-7 px-2 text-xs border-accent/50 hover:bg-accent/10 hover:border-accent transition-all"
          >
            <LogOut className="w-3.5 h-3.5 sm:mr-1" />
            <span className="hidden sm:inline">Déconnexion</span>
          </Button>
        </div>
      </div>
    </header>
  );
};
