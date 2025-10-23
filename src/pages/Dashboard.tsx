import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAutoQualification } from "@/hooks/useAutoQualification";
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
import { Filter, Loader2, CheckCircle } from "lucide-react";
import { format } from "date-fns";
import { trackEntrepriseView } from "@/utils/analytics";

const DashboardContent = () => {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showWizard, setShowWizard] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [filters, setFilters] = useState({
    dateFrom: "",
    dateTo: "",
    categories: [] as string[],
    departments: [] as string[],
    formesJuridiques: [] as string[],
    searchQuery: "",
  });

  const { view, setView, selectedEntreprise, setSelectedEntreprise, crmPanelOpen, setCrmPanelOpen } = useDashboard();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const { isQualifying, results: qualificationResults } = useAutoQualification();

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

  // Notifications de qualification automatique
  useEffect(() => {
    if (isQualifying) {
      toast({
        title: "🤖 Qualification IA en cours",
        description: "Analyse intelligente de vos entreprises en arrière-plan...",
      });
    } else if (qualificationResults && !qualificationResults.alreadyQualified) {
      const { succeeded, failed, categories } = qualificationResults;
      const topCategories = Object.entries(categories as Record<string, number>)
        .sort(([,a], [,b]) => (b as number) - (a as number))
        .slice(0, 3)
        .map(([cat, count]) => `${cat} (${count})`)
        .join(', ');

      toast({
        title: "✅ Qualification terminée !",
        description: `${succeeded} entreprises qualifiées. Top catégories: ${topCategories}`,
        duration: 8000,
      });
    }
  }, [isQualifying, qualificationResults, toast]);

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
        isQualifying={isQualifying}
        qualificationResults={qualificationResults}
      />
      
      <div className="flex flex-1 overflow-hidden min-h-0 gap-4 p-4">
        <main className="flex-1 overflow-hidden min-h-0">
          {view === 'prospects' && userId && (
            <ProspectsViewContainer 
              filters={filters}
              setFilters={setFilters}
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
