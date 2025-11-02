import { Button } from "@/components/ui/button";
import { Menu, MapIcon, Navigation, TrendingUp, LogOut } from "lucide-react";
import { trackViewChange } from "@/utils/analytics";
import { SyncButton } from "./SyncButton";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";

interface DashboardHeaderProps {
  view: 'prospects' | 'tournees' | 'crm';
  onViewChange: (view: 'prospects' | 'tournees' | 'crm') => void;
  isAdmin: boolean;
  onLogout: () => void;
}

export const DashboardHeader = ({ 
  view, 
  onViewChange, 
  isAdmin, 
  onLogout
}: DashboardHeaderProps) => {
  const isMobile = useIsMobile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleViewChange = (newView: typeof view) => {
    onViewChange(newView);
    trackViewChange(newView);
    setMobileMenuOpen(false);
  };

  const viewConfig = [
    { key: 'prospects' as const, label: 'Prospects', icon: MapIcon },
    { key: 'tournees' as const, label: 'Tournées', icon: Navigation },
    { key: 'crm' as const, label: 'CRM', icon: TrendingUp },
  ];

  return (
    <header className="glass-card border-b border-accent/20 px-4 py-3 z-10 backdrop-blur-xl shrink-0 shadow-md">
      <div className="flex items-center justify-between">
        {/* Mobile Menu */}
        {isMobile ? (
          <>
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="border-accent/30 hover:bg-accent/10 h-9 w-9">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0">
                <SheetHeader className="p-6 pb-4 border-b border-accent/20">
                  <SheetTitle className="text-left gradient-text">Menu</SheetTitle>
                </SheetHeader>
                <div className="flex flex-col p-4 gap-2">
                  {viewConfig.map((v) => {
                    const Icon = v.icon;
                    return (
                      <Button
                        key={v.key}
                        variant={view === v.key ? "default" : "ghost"}
                        onClick={() => handleViewChange(v.key)}
                        className={`justify-start h-12 text-base gap-3 ${
                          view === v.key 
                            ? "bg-accent text-primary hover:bg-accent/90" 
                            : "hover:bg-accent/10"
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        {v.label}
                      </Button>
                    );
                  })}
                  {isAdmin && (
                    <div className="pt-4 border-t border-accent/20">
                      <SyncButton />
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
            
            <div className="text-base font-bold gradient-text">
              {viewConfig.find(v => v.key === view)?.label}
            </div>
            
            <Button
              variant="outline"
              size="icon"
              onClick={onLogout}
              className="h-9 w-9 border-accent/30 hover:bg-accent/10"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </>
        ) : (
          <>
            {/* Desktop View Toggle */}
            <div className="flex gap-1 p-0.5 bg-card/50 rounded-lg border border-accent/20 shadow-sm">
              {viewConfig.map((v) => {
                const Icon = v.icon;
                return (
                  <Button
                    key={v.key}
                    variant={view === v.key ? "default" : "ghost"}
                    size="sm"
                    onClick={() => handleViewChange(v.key)}
                    className={`h-7 px-2 text-xs transition-all duration-300 ${
                      view === v.key 
                        ? "bg-accent text-primary hover:bg-accent/90 shadow-lg shadow-accent/20" 
                        : "hover:bg-accent/10"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 mr-1" />
                    <span className="hidden sm:inline">{v.label}</span>
                  </Button>
                );
              })}
            </div>

            <div className="flex items-center gap-2">
              {isAdmin && <SyncButton />}
              <Button
                variant="outline"
                size="sm"
                onClick={onLogout}
                className="h-7 px-2 text-xs border-accent/50 hover:bg-accent/10 hover:border-accent transition-all duration-300 hover:shadow-md"
              >
                <LogOut className="w-3.5 h-3.5 sm:mr-1" />
                <span className="hidden sm:inline">Déconnexion</span>
              </Button>
            </div>
          </>
        )}
      </div>
    </header>
  );
};
