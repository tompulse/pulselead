import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { useSubscription } from "@/hooks/useSubscription";

import { DashboardProvider, useDashboard } from "@/contexts/DashboardContext";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { UnifiedEntreprisePanel } from "@/components/dashboard/UnifiedEntreprisePanel";
import { FilterOnboarding } from "@/components/dashboard/FilterOnboarding";
import { OnboardingWizard } from "@/components/landing/OnboardingWizard";
import { ProspectsViewContainer } from "@/views/ProspectsViewContainer";
import { TourneesViewContainer } from "@/views/TourneesViewContainer";
import { CRMViewContainer } from "@/views/CRMViewContainer";
import { TourneeAssistantChat } from "@/components/dashboard/TourneeAssistantChat";
import { Button } from "@/components/ui/button";
import { RefreshCw, Loader2 } from "lucide-react";
import { trackEntrepriseView } from "@/utils/analytics";

const DashboardContent = () => {
  const [loading, setLoading] = useState(true);
  const [adminLoading, setAdminLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showWizard, setShowWizard] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [harmonizing, setHarmonizing] = useState(false);
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
  const { hasAccess, isLoading: subscriptionLoading, daysRemaining } = useSubscription(userId || undefined);

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
        setAdminLoading(false);
        navigate("/auth");
        return;
      }

      setUserId(session.user.id);
      const userEmail = session.user.email;
      console.log('Checking admin for:', userEmail, session.user.id);

      // Fallback direct pour les admins principaux
      const adminEmails = ['tomiolovpro@gmail.com', 'tom.iolov@hotmail.fr'];
      if (userEmail && adminEmails.includes(userEmail)) {
        console.log('Admin email detected, granting access');
        setIsAdmin(true);
        setAdminLoading(false);
      } else {
        try {
          const { data: adminCheck, error } = await supabase.rpc('has_role', {
            _user_id: session.user.id,
            _role: 'admin'
          });
          
          console.log('Admin check result:', adminCheck, 'Error:', error);
          
          if (error) {
            console.error('Error checking admin status:', error);
            setIsAdmin(false);
          } else {
            setIsAdmin(adminCheck === true);
          }
        } catch (error) {
          console.error('Error checking admin status:', error);
          setIsAdmin(false);
        } finally {
          setAdminLoading(false);
        }
      }
      
      const { data: progress } = await supabase
        .from('user_onboarding_progress')
        .select('*')
        .eq('user_id', session.user.id)
        .single();

      if (!progress || !progress.completed_at) {
        const launch = localStorage.getItem('pulse_launch_filter_onboarding');
        if (launch) {
          localStorage.removeItem('pulse_launch_filter_onboarding');
          setShowWizard(false);
          setShowOnboarding(true);
        } else {
          setShowWizard(true);
        }
      } else {
        const savedFilters = localStorage.getItem('pulse_initial_filters');
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

  // Vérifier l'accès à l'abonnement après le chargement (attendre que le statut admin soit vérifié)
  useEffect(() => {
    if (!loading && !adminLoading && !subscriptionLoading && userId) {
      if (!isAdmin && !hasAccess) {
        navigate("/subscribe");
      }
    }
  }, [loading, adminLoading, subscriptionLoading, hasAccess, userId, isAdmin, navigate]);


  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Déconnexion réussie",
      description: "À bientôt sur PULSE !",
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

  const handleHarmonizeNaf = async () => {
    setHarmonizing(true);
    try {
      const { error } = await supabase.functions.invoke('harmonize-categories');
      if (error) throw error;
      toast({
        title: "✅ Qualification lancée",
        description: "La catégorisation NAF est en cours en arrière-plan",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Échec de la qualification",
        variant: "destructive",
      });
    } finally {
      setHarmonizing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-accent">PULSE</h1>
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

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      <DashboardHeader 
        view={view}
        onViewChange={setView}
        isAdmin={isAdmin}
        onLogout={handleLogout}
      />

      {/* Bouton admin - Qualifier la base NAF */}
      {isAdmin && (
        <div className="px-2 sm:px-4 pt-2">
          <Button 
            onClick={handleHarmonizeNaf}
            disabled={harmonizing}
            variant="outline" 
            size="sm" 
            className="gap-2"
          >
            {harmonizing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Qualification en cours...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4" />
                Qualifier NAF
              </>
            )}
          </Button>
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
