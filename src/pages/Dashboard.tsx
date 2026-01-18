import { useEffect, useState } from "react";
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
import { trackEntrepriseView } from "@/utils/analytics";

const DashboardContent = () => {
  const [loading, setLoading] = useState(true);
  const [adminLoading, setAdminLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isDemoUser, setIsDemoUser] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showWizard, setShowWizard] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [filters, setFilters] = useState({
    dateFrom: "",
    dateTo: "",
    nafSections: [] as string[],
    nafDivisions: [] as string[],
    departments: [] as string[],
    taillesEntreprise: [] as string[],
    searchQuery: "",
  });

  const { view, setView, selectedEntreprise, setSelectedEntreprise, crmPanelOpen, setCrmPanelOpen } = useDashboard();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [userEmail, setUserEmail] = useState<string | undefined>(undefined);
  const { hasAccess, isLoading: subscriptionLoading, daysRemaining, subscriptionStatus, subscriptionPlan, endDate } = useSubscription(userId || undefined);

  const activeFiltersCount = 
    (filters.nafSections?.length || 0) + 
    (filters.nafDivisions?.length || 0) +
    (filters.departments?.length || 0) + 
    (filters.taillesEntreprise?.length || 0);

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
      setUserEmail(session.user.email || undefined);
      const userEmail = session.user.email;
      console.log('Checking admin for:', userEmail, session.user.id);

      // Check for demo user
      const demoEmail = 'demo@pulse.com';
      
      if (userEmail === demoEmail) {
        console.log('Demo user detected, granting visitor access');
        setIsDemoUser(true);
        setAdminLoading(false);
      } else {
        // Always use server-side role verification for admin status
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
              nafSections: parsed.nafSections || [],
              nafDivisions: parsed.nafDivisions || [],
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
      // Bypass pour admins et utilisateur démo
      if (!isAdmin && !isDemoUser && !hasAccess) {
        // Redirection vers la landing avec trigger de checkout
        navigate("/?checkout=pending");
      }
    }
  }, [loading, adminLoading, subscriptionLoading, hasAccess, userId, isAdmin, isDemoUser, navigate]);


  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Déconnexion réussie",
      description: "À bientôt sur PULSE !",
    });
    navigate("/");
  };

  const handleOnboardingComplete = (newFilters: { nafSections?: string[]; departments?: string[] }) => {
    setFilters(prev => ({
      ...prev,
      nafSections: newFilters.nafSections || [],
      departments: newFilters.departments || []
    }));
    setShowOnboarding(false);
    
    toast({
      title: "Configuration terminée !",
      description: "Vous allez maintenant voir les entreprises qui correspondent à vos critères.",
    });
  };

  // Loading state amélioré
  if (loading || adminLoading || subscriptionLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-accent">PULSE</h1>
          <p className="text-muted-foreground text-base">
            {subscriptionLoading ? "Vérification de votre abonnement..." : "Chargement..."}
          </p>
          <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto"></div>
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
        userId={userId || ''}
        userEmail={userEmail}
        subscriptionStatus={subscriptionStatus}
        subscriptionPlan={subscriptionPlan}
        daysRemaining={daysRemaining}
        endDate={endDate}
        onSelectEntreprise={(id) => {
          handleEntrepriseSelect({ id });
        }}
      />
      
      <div className="flex flex-1 overflow-hidden min-h-0 gap-4 p-4 pt-0">
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
