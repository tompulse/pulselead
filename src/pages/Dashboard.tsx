import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";

import { DashboardProvider, useDashboard } from "@/contexts/DashboardContext";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";

import { UnifiedEntreprisePanel } from "@/components/dashboard/UnifiedEntreprisePanel";
import { FilterOnboarding } from "@/components/dashboard/FilterOnboarding";
import { ProspectsViewContainer } from "@/views/ProspectsViewContainer";
import { UnlockedProspectsView } from "@/components/dashboard/UnlockedProspectsView";
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
  
  // 🔥 SUPPRIMÉ useSubscription - on vérifie juste les quotas directement
  const [userPlan, setUserPlan] = useState<string | null>(null);

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
      try {
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
      
      // 🔥 VÉRIFICATION : Est-ce que user_quotas existe ?
      console.log('[DASHBOARD] Checking user quotas...');
      const { data: quotas, error: quotasError } = await supabase
        .from('user_quotas')
        .select('plan_type, is_first_login')
        .eq('user_id', session.user.id)
        .single();

      console.log('[DASHBOARD] Quotas result:', quotas, quotasError);

      // 🔥 BLOCAGE : Si pas de quotas valides → retour à l'auth
      if (!quotas || quotasError?.code === 'PGRST116') {
        console.log('[DASHBOARD] ❌ No quotas found, redirecting to /auth');
        toast({
          variant: "destructive",
          title: "⚠️ Aucun plan actif",
          description: "Connecte-toi pour accéder au dashboard",
        });
        navigate('/auth');
        return;
      }

      // Si is_first_login = true → pas encore validé
      if (quotas.is_first_login === true) {
        console.log('[DASHBOARD] ❌ First login not completed, redirecting to /auth');
        toast({
          variant: "destructive",
          title: "⚠️ Configuration incomplète",
          description: "Finalise ton inscription",
        });
        navigate('/auth');
        return;
      }

      // 🔥 Si plan PRO, vérifier que la subscription est active
      if (quotas.plan_type === 'pro') {
        console.log('[DASHBOARD] PRO plan detected, checking subscription status...');
        const { data: subscription } = await supabase
          .from('user_subscriptions')
          .select('subscription_status')
          .eq('user_id', session.user.id)
          .single();

        console.log('[DASHBOARD] Subscription status:', subscription?.subscription_status);

        // Si PRO mais pas de subscription active/trialing → bloquer l'accès
        if (!subscription || !['active', 'trialing'].includes(subscription.subscription_status)) {
          console.log('[DASHBOARD] ❌ PRO plan without active subscription, redirecting to Stripe');
          toast({
            variant: "destructive",
            title: "⚠️ Paiement requis",
            description: "Finalise ton inscription PRO pour accéder au dashboard",
          });
          // Rediriger vers Stripe pour finaliser le paiement
          const stripeUrl = `${import.meta.env.VITE_STRIPE_PAYMENT_LINK_PRO || 'https://buy.stripe.com/00g6oH0PR0CU6IH6pp'}?client_reference_id=${session.user.id}`;
          window.location.href = stripeUrl;
          return;
        }
      }

      // ✅ Plan trouvé et actif
      console.log('[DASHBOARD] ✅ Plan active:', quotas.plan_type);
      setUserPlan(quotas.plan_type);

      // Filtres vides par défaut (pas de chargement automatique)
      
        setLoading(false);
      } catch (error) {
        console.error('[DASHBOARD] Fatal error:', error);
        toast({
          variant: "destructive",
          title: "❌ Erreur",
          description: "Impossible de charger le dashboard.",
        });
        navigate('/plan-selection');
      }
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
      if (!loading && !adminLoading && userId) {
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
          
          // Show loading message
          toast({
            title: "⏳ Redirection automatique...",
            description: "Finalisation de votre inscription PRO (7j gratuits)",
            duration: 15000,
          });

          // Delay to let user see the message
          await new Promise(resolve => setTimeout(resolve, 1000));

          try {
            const { data: checkoutData, error: checkoutError } = await supabase.functions.invoke('create-checkout', {
              body: { 
                priceId: 'price_1SqxKmHjyidZ5i9L8tCztpFU',
                trialDays: 7
              },
            });

            console.log('[DASHBOARD] Checkout response:', { checkoutData, checkoutError });

            if (checkoutError || !checkoutData?.url) {
              console.error('[DASHBOARD] Checkout error:', checkoutError);
              toast({
                title: "⚠️ Checkout Stripe",
                description: "Redirection manuelle requise. Cliquez sur 'Accéder au checkout' dans votre dashboard.",
                variant: "default",
                duration: 10000,
              });
              // Don't navigate away, let user see the dashboard with manual button
              return;
            }

            // Redirect to Stripe checkout
            console.log('[DASHBOARD] Redirecting to Stripe:', checkoutData.url);
            window.location.href = checkoutData.url;
          } catch (error) {
            console.error('[DASHBOARD] Error creating checkout:', error);
            toast({
              title: "⚠️ Checkout Stripe",
              description: "Redirection manuelle requise. Cliquez sur 'Accéder au checkout' dans votre dashboard.",
              variant: "default",
              duration: 10000,
            });
            // Don't navigate away, let user see the dashboard with manual button
          }
          return;
        }

        // FREE plan or PRO with active subscription
        if (quotas?.plan_type !== 'free' && (!subscription || !['active', 'trialing'].includes(subscription.stripe_subscription_status))) {
          console.log('[DASHBOARD] No access and not FREE plan, redirecting to landing');
          navigate("/");
        }
      }
    };

    checkAccessAndRedirect();
  }, [loading, adminLoading, userId, isAdmin, isDemoUser, userPlan, navigate, toast]);


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
          <p className="text-muted-foreground text-base">Chargement...</p>
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
          {view === 'unlocked' && userId && (
            <div className="h-full overflow-y-auto p-4">
              <UnlockedProspectsView 
                userId={userId}
                onEntrepriseSelect={handleEntrepriseSelect}
              />
            </div>
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
