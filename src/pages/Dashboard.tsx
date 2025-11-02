import { useEffect, useState, useRef } from "react";
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
import { TourneeAssistantChat } from "@/components/dashboard/TourneeAssistantChat";
import { DataEnrichmentPanel } from "@/components/dashboard/DataEnrichmentPanel";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Filter, Loader2, CheckCircle, Database } from "lucide-react";
import { format } from "date-fns";
import { trackEntrepriseView } from "@/utils/analytics";
import type { ApplyAIFiltersParams } from "@/components/dashboard/ProspectsView";

const DashboardContent = () => {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showWizard, setShowWizard] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [enrichmentOpen, setEnrichmentOpen] = useState(false);
  const [filters, setFilters] = useState({
    dateFrom: "",
    dateTo: "",
    categories: [] as string[],
    departments: [] as string[],
    formesJuridiques: [] as string[],
    searchQuery: "",
    subcategories: [] as string[],
  });

  const applyAIFiltersRef = useRef<((params: ApplyAIFiltersParams) => void) | null>(null);
  const { view, setView, selectedEntreprise, setSelectedEntreprise, crmPanelOpen, setCrmPanelOpen } = useDashboard();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const handleAIFiltersApply = (params: ApplyAIFiltersParams) => {
    // Passer au mode prospects si pas déjà le cas
    if (view !== 'prospects') {
      setView('prospects');
    }
    
    // Délai pour laisser la vue se charger
    setTimeout(() => {
      applyAIFiltersRef.current?.(params);
    }, 100);
  };

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
          <h1 className="text-4xl font-bold text-accent">LUMA</h1>
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

      {/* Bouton d'enrichissement des données */}
      {isAdmin && (
        <div className="px-2 sm:px-4 pt-2">
          <Dialog open={enrichmentOpen} onOpenChange={setEnrichmentOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1 sm:gap-2 text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3">
                <Database className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden xs:inline">Enrichir</span>
                <span className="xs:hidden">Données</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl mx-2 sm:mx-auto">
              <DialogHeader>
                <DialogTitle className="text-base sm:text-lg">Enrichissement automatique des données</DialogTitle>
              </DialogHeader>
              <DataEnrichmentPanel />
            </DialogContent>
          </Dialog>
        </div>
      )}
      
      <div className="flex flex-1 overflow-hidden min-h-0 gap-4 p-4">
        <main className="flex-1 overflow-hidden min-h-0">
          {view === 'prospects' && userId && (
            <ProspectsViewContainer 
              filters={filters}
              setFilters={setFilters}
              userId={userId}
              onEntrepriseSelect={handleEntrepriseSelect}
              onAIFiltersReady={(applyFn) => {
                applyAIFiltersRef.current = applyFn;
              }}
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

      {/* Assistant IA Tournée */}
      {userId && view === 'prospects' && (
        <TourneeAssistantChat 
          userId={userId}
          onApplyFilters={handleAIFiltersApply}
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
