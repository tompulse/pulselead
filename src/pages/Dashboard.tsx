import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useSubscription } from "@/hooks/useSubscription";

import { DashboardProvider, useDashboard } from "@/contexts/DashboardContext";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { ProspectsViewContainer } from "@/views/ProspectsViewContainer";
import { TourneesViewContainer } from "@/views/TourneesViewContainer";
import { TourneeAssistantChat } from "@/components/dashboard/TourneeAssistantChat";
import { trackEntrepriseView } from "@/utils/analytics";
import type { ApplyAIFiltersParams } from "@/components/dashboard/ProspectsView";

const DashboardContent = () => {
  const [loading, setLoading] = useState(true);
  const [adminLoading, setAdminLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    dateFrom: "",
    dateTo: "",
    categories: [] as string[],
    departments: [] as string[],
    formesJuridiques: [] as string[],
    searchQuery: "",
  });

  const applyAIFiltersRef = useRef<((params: ApplyAIFiltersParams) => void) | null>(null);
  const { view, setView } = useDashboard();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { hasAccess, isLoading: subscriptionLoading } = useSubscription(userId || undefined);

  const handleAIFiltersApply = (params: ApplyAIFiltersParams) => {
    if (view !== 'prospects') {
      setView('prospects');
    }
    
    setTimeout(() => {
      applyAIFiltersRef.current?.(params);
    }, 100);
  };

  const handleEntrepriseSelect = async (entreprise: any) => {
    if (entreprise.id && entreprise.nom) {
      trackEntrepriseView(entreprise.id, entreprise.nom, view);
    }
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

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      <DashboardHeader 
        view={view}
        onViewChange={setView}
        isAdmin={isAdmin}
        onLogout={handleLogout}
      />
      
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
        </main>
      </div>

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
