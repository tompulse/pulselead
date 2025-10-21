import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { DashboardProvider, useDashboard } from "@/contexts/DashboardContext";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { UnifiedEntreprisePanel } from "@/components/dashboard/UnifiedEntreprisePanel";
import { FilterOnboarding } from "@/components/dashboard/FilterOnboarding";
import { OnboardingWizard } from "@/components/landing/OnboardingWizard";
import { ProspectsViewContainer } from "@/views/ProspectsViewContainer";
import { TourneesViewContainer } from "@/views/TourneesViewContainer";
import { CRMViewContainer } from "@/views/CRMViewContainer";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Filter, Lightbulb } from "lucide-react";
import { format } from "date-fns";
import { trackEntrepriseView } from "@/utils/analytics";

const DashboardContent = () => {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showWizard, setShowWizard] = useState(false);
  const [filters, setFilters] = useState({
    dateFrom: "2025-09-01",
    dateTo: "",
    categories: [] as string[],
    departments: [] as string[],
  });

  const { view, setView, selectedEntreprise, setSelectedEntreprise, crmPanelOpen, setCrmPanelOpen } = useDashboard();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const activeFiltersCount = 
    (filters.categories?.length || 0) + 
    (filters.departments?.length || 0) + 
    (filters.dateFrom ? 1 : 0) + 
    (filters.dateTo ? 1 : 0);

  const handleEntrepriseSelect = async (entreprise: any) => {
    setSelectedEntreprise(entreprise);
    
    if (entreprise.id && entreprise.nom) {
      trackEntrepriseView(entreprise.id, entreprise.nom, view);
    }
    
    setCrmPanelOpen(true);
  };

  useEffect(() => {
    const checkAuthAndRole = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth");
        return;
      }

      setUserId(session.user.id);

      const { data: adminCheck } = await supabase.rpc('has_role', {
        _user_id: session.user.id,
        _role: 'admin'
      });
      
      setIsAdmin(adminCheck === true);
      
      const { data: progress } = await supabase
        .from('user_onboarding_progress')
        .select('*')
        .eq('user_id', session.user.id)
        .single();

      if (!progress || !progress.completed_at) {
        const launch = localStorage.getItem('luma_launch_filter_onboarding');
        if (launch) {
          localStorage.removeItem('luma_launch_filter_onboarding');
          setShowWizard(false);
          setShowOnboarding(true);
        } else {
          setShowWizard(true);
        }
      } else {
        const savedFilters = localStorage.getItem('luma_initial_filters');
        if (savedFilters) {
          try {
            const parsed = JSON.parse(savedFilters);
            setFilters(prev => ({
              ...prev,
              categories: parsed.categories || [],
              departments: parsed.departments || []
            }));
          } catch (e) {
            console.error('Error parsing saved filters:', e);
          }
        }
      }
      
      setLoading(false);
    };

    checkAuthAndRole();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Déconnexion réussie",
      description: "À bientôt sur LUMA !",
    });
    navigate("/");
  };

  const handleOnboardingComplete = (newFilters: { categories: string[]; departments: string[] }) => {
    setFilters(prev => ({
      ...prev,
      categories: newFilters.categories,
      departments: newFilters.departments
    }));
    setShowOnboarding(false);
    
    toast({
      title: "Configuration terminée !",
      description: "Vous allez maintenant voir les entreprises qui correspondent à vos critères.",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-accent/30 blur-xl animate-pulse"></div>
            <Lightbulb className="w-12 h-12 text-accent mx-auto relative" />
          </div>
          <p className="text-muted-foreground text-base">Chargement...</p>
        </div>
      </div>
    );
  }

  if (showWizard) {
    return <OnboardingWizard onComplete={() => {
      setShowWizard(false);
      setLoading(false);
    }} />;
  }

  if (showOnboarding) {
    return <FilterOnboarding onComplete={handleOnboardingComplete} />;
  }

  const showSidebar = view === 'prospects';

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      <DashboardHeader 
        view={view}
        onViewChange={setView}
        isAdmin={isAdmin}
        onLogout={handleLogout}
      />
      
      {/* Mobile Filter Button */}
      {isMobile && showSidebar && (
        <div className="glass-card border-b border-accent/20 px-3 py-2 shrink-0">
          <Sheet open={filterSheetOpen} onOpenChange={setFilterSheetOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="w-full h-9 border-accent/50 hover:bg-accent/10 justify-between"
              >
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-accent" />
                  <span className="text-sm font-medium">Filtres</span>
                </div>
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary" className="bg-accent/20 text-accent h-5 px-2">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-screen p-0">
              <SheetHeader className="px-6 py-4 border-b border-accent/20 bg-gradient-to-b from-accent/5 to-transparent">
                <SheetTitle className="flex items-center gap-3 text-xl">
                  <div className="p-2 bg-accent/10 rounded-lg">
                    <Filter className="w-5 h-5 text-accent" />
                  </div>
                  Filtrer les résultats
                </SheetTitle>
              </SheetHeader>
              <div className="h-[calc(100vh-72px)] overflow-hidden">
                <Sidebar 
                  filters={filters} 
                  setFilters={setFilters}
                  onFilterChange={() => setFilterSheetOpen(false)}
                  isMobileSheet={true}
                />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden min-h-0">
        {!isMobile && showSidebar && (
          <Sidebar filters={filters} setFilters={setFilters} />
        )}

        <main className="flex-1 overflow-hidden min-h-0">
          {view === 'prospects' && userId && (
            <ProspectsViewContainer 
              filters={filters}
              userId={userId}
              onEntrepriseSelect={handleEntrepriseSelect}
            />
          )}
          {view === 'tournees' && userId && (
            <TourneesViewContainer userId={userId} />
          )}
          {view === 'crm' && userId && (
            <CRMViewContainer 
              userId={userId}
              onEntrepriseSelect={(id) => {
                const entreprise = { id };
                handleEntrepriseSelect(entreprise);
              }}
            />
          )}
        </main>
      </div>

      {/* CRM Panel */}
      {userId && (
        <UnifiedEntreprisePanel
          entreprise={selectedEntreprise}
          open={crmPanelOpen}
          onOpenChange={setCrmPanelOpen}
          userId={userId}
        />
      )}
    </div>
  );
};

const Dashboard = () => (
  <DashboardProvider>
    <DashboardContent />
  </DashboardProvider>
);

export default Dashboard;
