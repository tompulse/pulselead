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
    showUnlockedOnly: false,
  });
  
  // 🆕 Nouveaux états pour gérer l'activation post-paiement
  const [isActivating, setIsActivating] = useState(false);
  const [activationAttempts, setActivationAttempts] = useState(0);

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

      // 🔥 BLOCAGE : Si pas de quotas valides → Stripe
      if (!quotas || quotasError?.code === 'PGRST116') {
        console.log('[DASHBOARD] ❌ No quotas found, redirecting to Stripe');
        toast({
          variant: "destructive",
          title: "🔒 Abonnement requis",
          description: "Démarrez votre essai gratuit de 7 jours pour accéder au dashboard",
          duration: 5000,
        });
        
        // Redirection vers Stripe Payment Link
        const paymentUrl = `${import.meta.env.VITE_STRIPE_PAYMENT_LINK_PRO || 'https://buy.stripe.com/00w6oH0PRckQ6IHcro2ZO00'}?client_reference_id=${session.user.id}&prefilled_email=${encodeURIComponent(session.user.email || '')}`;
        window.location.href = paymentUrl;
        return;
      }

      // Si is_first_login = true → vérifier si paiement en cours
      if (quotas.is_first_login === true) {
        console.log('[DASHBOARD] ⏳ Account not activated yet, checking if payment was made...');
        
        // Vérifier si l'utilisateur vient de payer (localStorage ou tentative < 20)
        const justPaid = localStorage.getItem('stripe_payment_completed');
        const withinActivationWindow = activationAttempts < 20; // Max 40 secondes d'attente
        
        if ((justPaid || withinActivationWindow) && !isActivating) {
          console.log('[DASHBOARD] 🔄 Payment detected, waiting for webhook activation...');
          setIsActivating(true);
          setActivationAttempts(prev => prev + 1);
          
          // Poll toutes les 2 secondes
          setTimeout(() => {
            console.log('[DASHBOARD] Retrying activation check...');
            checkAuthAndRole();
          }, 2000);
          
          return;
        }
        
        // Si toujours pas activé après 40 secondes → rediriger Stripe
        console.log('[DASHBOARD] ❌ Activation timeout, redirecting to Stripe');
        localStorage.removeItem('stripe_payment_completed');
        toast({
          variant: "destructive",
          title: "🔒 Abonnement requis",
          description: "Finalisez votre inscription pour accéder au dashboard",
          duration: 5000,
        });
        
        const paymentUrl = `${import.meta.env.VITE_STRIPE_PAYMENT_LINK_PRO || 'https://buy.stripe.com/00w6oH0PRckQ6IHcro2ZO00'}?client_reference_id=${session.user.id}&prefilled_email=${encodeURIComponent(session.user.email || '')}`;
        window.location.href = paymentUrl;
        return;
      }
      
      // ✅ Compte activé ! Nettoyer le flag
      if (quotas.is_first_login === false) {
        localStorage.removeItem('stripe_payment_completed');
        setIsActivating(false);
      }
      
      // 🔥 BLOCAGE SUPPLÉMENTAIRE : Vérifier que le plan n'est pas null
      if (!quotas.plan_type || quotas.plan_type === null) {
        console.log('[DASHBOARD] ❌ No plan_type, redirecting to Stripe');
        toast({
          variant: "destructive",
          title: "🔒 Abonnement requis",
          description: "Choisissez un plan pour accéder au dashboard",
          duration: 5000,
        });
        
        const paymentUrl = `${import.meta.env.VITE_STRIPE_PAYMENT_LINK_PRO || 'https://buy.stripe.com/00w6oH0PRckQ6IHcro2ZO00'}?client_reference_id=${session.user.id}&prefilled_email=${encodeURIComponent(session.user.email || '')}`;
        window.location.href = paymentUrl;
        return;
      }

      // 🔥 Si plan PRO, vérifier que la subscription est active
      // SAUF si on vient juste de payer (on attend le webhook)
      const justPaid = localStorage.getItem('stripe_payment_completed');
      
      if (quotas.plan_type === 'pro' && !justPaid) {
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
      } else if (quotas.plan_type === 'pro' && justPaid) {
        console.log('[DASHBOARD] PRO plan + payment flag detected, skipping subscription check (waiting for webhook)');
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

  // 🔥 SUPPRIMÉ : Plus de redirection automatique vers Stripe
  // L'utilisateur choisit son plan dans /onboarding
  // L'upgrade se fait via modal in-app depuis le dashboard


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
  if (loading || adminLoading || isActivating) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-navy-deep to-black-deep flex items-center justify-center p-6">
        <div className="w-full max-w-md text-center space-y-6">
          {isActivating ? (
            <>
              {/* Activation en cours */}
              <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold gradient-text mb-3">
                🎉 Paiement réussi !
              </h1>
              <p className="text-muted-foreground text-lg mb-6">
                Activation de votre compte PRO en cours...
              </p>
              <div className="relative w-20 h-20 mx-auto">
                <div className="absolute inset-0 rounded-full border-4 border-accent/20"></div>
                <div className="absolute inset-0 rounded-full border-4 border-accent border-t-transparent animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg className="w-8 h-8 text-accent animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                Quelques secondes... ({activationAttempts * 2}s / 40s)
              </p>
              <div className="mt-6 p-6 glass-card">
                <p className="text-xs text-muted-foreground">
                  💡 Votre compte est en cours d'activation automatique par notre système.
                  <br />Cette étape prend généralement 2-10 secondes.
                </p>
              </div>
            </>
          ) : (
            <>
              {/* Chargement normal */}
              <h1 className="text-4xl font-bold text-accent">PULSE</h1>
              <p className="text-muted-foreground text-base">Chargement...</p>
              <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto"></div>
            </>
          )}
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
