import { Button } from "@/components/ui/button";
import { MapIcon, Navigation, TrendingUp, CreditCard, RefreshCw } from "lucide-react";
import { trackViewChange } from "@/utils/analytics";
import { useIsMobile } from "@/hooks/use-mobile";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { SubscriptionManagement } from "./SubscriptionManagement";
import { QualificationProgressDialog } from "./QualificationProgressDialog";
import { ImportDialog } from "./ImportDialog";
import { NotificationCenter } from "./NotificationCenter";
import { AccountMenu } from "./AccountMenu";
import { useState } from "react";

interface DashboardHeaderProps {
  view: 'prospects' | 'tournees' | 'crm';
  onViewChange: (view: 'prospects' | 'tournees' | 'crm') => void;
  isAdmin: boolean;
  onLogout: () => void;
  userId: string;
  userEmail?: string;
  subscriptionStatus?: string;
  subscriptionPlan?: string;
  daysRemaining?: number;
  endDate?: string;
  onSelectEntreprise?: (entrepriseId: string) => void;
}

export const DashboardHeader = ({ 
  view, 
  onViewChange, 
  isAdmin, 
  onLogout,
  userId,
  userEmail,
  subscriptionStatus,
  subscriptionPlan,
  daysRemaining,
  endDate,
  onSelectEntreprise
}: DashboardHeaderProps) => {
  const isMobile = useIsMobile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [subscriptionDialogOpen, setSubscriptionDialogOpen] = useState(false);
  const [qualificationDialogOpen, setQualificationDialogOpen] = useState(false);

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
        {/* Mobile View */}
        {isMobile ? (
          <>
            <div className="text-base font-bold gradient-text">
              {viewConfig.find(v => v.key === view)?.label}
            </div>
            
            <div className="flex items-center gap-2">
              <NotificationCenter userId={userId} onSelectEntreprise={onSelectEntreprise} />
              <AccountMenu
                userEmail={userEmail}
                subscriptionStatus={subscriptionStatus}
                subscriptionPlan={subscriptionPlan}
                daysRemaining={daysRemaining}
                endDate={endDate}
                onLogout={onLogout}
              />
            </div>
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
              {isAdmin && (
                <>
                  <ImportDialog />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQualificationDialogOpen(true)}
                    className="h-7 px-2 text-xs border-purple-500/50 hover:bg-purple-500/10 hover:border-purple-500 transition-all duration-300"
                  >
                    <RefreshCw className="w-3.5 h-3.5 sm:mr-1" />
                    <span className="hidden lg:inline">Qualifier données</span>
                  </Button>
                  <QualificationProgressDialog 
                    open={qualificationDialogOpen} 
                    onOpenChange={setQualificationDialogOpen} 
                  />
                  <Dialog open={subscriptionDialogOpen} onOpenChange={setSubscriptionDialogOpen}>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 px-2 text-xs border-accent/50 hover:bg-accent/10 hover:border-accent transition-all duration-300"
                      >
                        <CreditCard className="w-3.5 h-3.5 sm:mr-1" />
                        <span className="hidden lg:inline">Abonnements</span>
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
                      <DialogHeader>
                        <DialogTitle>Gestion des abonnements</DialogTitle>
                      </DialogHeader>
                      <div className="overflow-y-auto flex-1">
                        <SubscriptionManagement />
                      </div>
                    </DialogContent>
                  </Dialog>
                </>
              )}
              <NotificationCenter userId={userId} onSelectEntreprise={onSelectEntreprise} />
              <AccountMenu
                userEmail={userEmail}
                subscriptionStatus={subscriptionStatus}
                subscriptionPlan={subscriptionPlan}
                daysRemaining={daysRemaining}
                endDate={endDate}
                onLogout={onLogout}
              />
            </div>
          </>
        )}
      </div>
      
      {/* Mobile Navigation Buttons */}
      {isMobile && (
        <div className="grid grid-cols-3 gap-2 mt-3">
          {viewConfig.map((v) => (
            <Button
              key={v.key}
              variant={view === v.key ? "default" : "outline"}
              size="sm"
              onClick={() => handleViewChange(v.key)}
              className={`h-10 text-xs font-medium transition-all ${
                view === v.key 
                  ? "bg-accent text-primary hover:bg-accent/90" 
                  : "hover:bg-accent/10"
              }`}
            >
              {v.label}
            </Button>
          ))}
        </div>
      )}
      
      {/* Dialog pour abonnements (mobile aussi) */}
      <Dialog open={subscriptionDialogOpen} onOpenChange={setSubscriptionDialogOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Gestion des abonnements</DialogTitle>
          </DialogHeader>
          <div className="overflow-y-auto flex-1">
            <SubscriptionManagement />
          </div>
        </DialogContent>
      </Dialog>
    </header>
  );
};
