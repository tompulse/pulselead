import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Target, LogOut, List, MapIcon } from "lucide-react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { MapView } from "@/components/dashboard/MapView";
import { ListView } from "@/components/dashboard/ListView";
import { SyncButton } from "@/components/dashboard/SyncButton";

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [view, setView] = useState<"map" | "list">("map");
  const [filters, setFilters] = useState({
    dateFrom: "2025-09-01",
    dateTo: "",
    categories: [] as string[],
    departments: [] as string[],
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check authentication and admin role
    const checkAuthAndRole = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth");
        return;
      }

      // Check if user has admin role
      const { data: adminCheck, error } = await supabase.rpc('has_role', {
        _user_id: session.user.id,
        _role: 'admin'
      });

      if (error) {
        console.error('Erreur vérification admin:', error);
      }
      
      console.log('Vérification admin pour:', session.user.email, 'Résultat:', adminCheck);
      setIsAdmin(adminCheck === true);
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
      description: "À bientôt sur LeadMagnet !",
    });
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Target className="w-12 h-12 text-accent mx-auto animate-pulse" />
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      {/* Header - Compact */}
      <header className="glass-card border-b border-accent/20 px-3 md:px-4 py-2 md:py-3 z-10 backdrop-blur-xl shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-4">
            <div className="flex items-center gap-2">
              <div className="relative">
                <div className="absolute inset-0 bg-accent blur-lg opacity-30 animate-pulse" />
                <Target className="w-6 h-6 md:w-7 md:h-7 text-accent relative" />
              </div>
              <span className="text-lg md:text-xl font-bold gradient-text">LeadMagnet</span>
            </div>
            
            {/* View Toggle - Compact */}
            <div className="flex gap-1 p-0.5 bg-card/50 rounded-lg border border-accent/20">
              <Button
                variant={view === "map" ? "default" : "ghost"}
                size="sm"
                onClick={() => setView("map")}
                className={`h-7 px-2 text-xs ${view === "map" ? "bg-accent text-primary hover:bg-accent/90" : "hover:bg-accent/10"}`}
              >
                <MapIcon className="w-3.5 h-3.5 mr-1" />
                Carte
              </Button>
              <Button
                variant={view === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setView("list")}
                className={`h-7 px-2 text-xs ${view === "list" ? "bg-accent text-primary hover:bg-accent/90" : "hover:bg-accent/10"}`}
              >
                <List className="w-3.5 h-3.5 mr-1" />
                Liste
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAdmin && <SyncButton />}
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="h-7 px-2 text-xs border-accent/50 hover:bg-accent/10 hover:border-accent transition-all"
            >
              <LogOut className="w-3.5 h-3.5 mr-1" />
              Déconnexion
            </Button>
          </div>
        </div>
      </header>

      {/* Content Area with Sidebar */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Always visible */}
        <Sidebar filters={filters} setFilters={setFilters} />

        {/* Main Content */}
        <main className="flex-1 overflow-hidden">
          <div className="h-full">
            {view === "map" ? (
              <MapView filters={filters} />
            ) : (
              <ListView filters={filters} />
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
