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
import { ProspectsViewContainer } from "@/views/ProspectsViewContainer";
import { TourneesViewContainer } from "@/views/TourneesViewContainer";
import { CRMViewContainer } from "@/views/CRMViewContainer";
import { AnalyticsViewContainer } from "@/views/AnalyticsViewContainer";
import { INPIScrapingPanel } from "@/components/dashboard/INPIScrapingPanel";
import { trackEntrepriseView } from "@/utils/analytics";

const DashboardContent = () => {
  const [loading, setLoading] = useState(true);
  const [adminLoading, setAdminLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isDemoUser, setIsDemoUser] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
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
      
      // Check first login for demo modal
      const { data: quotas } = await supabase
        .from('user_quotas')
        .select('is_first_login')
        .eq('user_id', session.user.id)
        .single();

      // Filtres vides par défaut (pas de chargement automatique)
      
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
    const checkAccessAndRedirect = async () => {
      if (!loading && !adminLoading && !subscriptionLoading && userId) {
        // Bypass pour admins et utilisateur démo
        if (isAdmin || isDemoUser) {
          return;
        }

        // Check if user has PRO plan without active subscription
        const { data: quotas } = await supabase
          .from('user_quotas')
          .select('plan_type')
          .eq('user_id', userId)
          .single();

        const { data: subscription } = await supabase
          .from('user_subscriptions')
          .select('stripe_subscription_status')
          .eq('user_id', userId)
          .single();

        console.log('[DASHBOARD] Plan type:', quotas?.plan_type, 'Subscription status:', subscription?.stripe_subscription_status);

        // If PRO plan but no active subscription → Redirect to Stripe checkout
        if (quotas?.plan_type === 'pro' && (!subscription || !['active', 'trialing'].includes(subscription.stripe_subscription_status))) {
          console.log('[DASHBOARD] PRO plan without active subscription, redirecting to Stripe checkout');
          
          toast({
            title: "⚠️ Checkout requis",
            description: "Complétez votre inscription pour accéder au dashboard PRO",
            duration: 5000,
          });

          try {
            const { data: checkoutData, error: checkoutError } = await supabase.functions.invoke('create-checkout', {
              body: { 
                priceId: 'price_1SqxKmHjyidZ5i9L8tCztpFU',
                trialDays: 7
              },
            });

            if (checkoutError || !checkoutData?.url) {
              console.error('[DASHBOARD] Checkout error:', checkoutError);
              navigate("/");
              return;
            }

            window.location.href = checkoutData.url;
          } catch (error) {
            console.error('[DASHBOARD] Error creating checkout:', error);
            navigate("/");
          }
          return;
        }

        // FREE plan or PRO with active subscription
        if (!hasAccess && quotas?.plan_type !== 'free') {
          console.log('[DASHBOARD] No access and not FREE plan, redirecting to landing');
          navigate("/");
        }
      }
    };

    checkAccessAndRedirect();
  }, [loading, adminLoading, subscriptionLoading, hasAccess, userId, isAdmin, isDemoUser, navigate, toast]);


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
          {view === 'analytics' && isAdmin && (
            <AnalyticsViewContainer />
          )}
          {view === 'scraping' && isAdmin && (
            <div className="h-full overflow-y-auto p-4">
              <INPIScrapingPanel />
            </div>
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
