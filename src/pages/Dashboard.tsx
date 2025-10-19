import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Target, LogOut, List, MapIcon } from "lucide-react";
import { FilterBar } from "@/components/dashboard/FilterBar";
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
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="glass-card border-b border-accent/20 px-8 py-5 sticky top-0 z-10 backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-accent blur-xl opacity-30 animate-pulse" />
                <Target className="w-10 h-10 text-accent relative" />
              </div>
              <span className="text-3xl font-bold gradient-text">LeadMagnet</span>
            </div>
            
            {/* View Toggle */}
            <div className="flex gap-2 p-1 bg-card/50 rounded-lg border border-accent/20">
              <Button
                variant={view === "map" ? "default" : "ghost"}
                size="sm"
                onClick={() => setView("map")}
                className={view === "map" ? "bg-accent text-primary hover:bg-accent/90" : "hover:bg-accent/10"}
              >
                <MapIcon className="w-4 h-4 mr-2" />
                Carte
              </Button>
              <Button
                variant={view === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setView("list")}
                className={view === "list" ? "bg-accent text-primary hover:bg-accent/90" : "hover:bg-accent/10"}
              >
                <List className="w-4 h-4 mr-2" />
                Liste
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isAdmin && <SyncButton />}
            <Button
              variant="outline"
              onClick={handleLogout}
              className="border-accent/50 hover:bg-accent/10 hover:border-accent transition-all"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Déconnexion
            </Button>
          </div>
        </div>
      </header>

      {/* Filter Bar */}
      <FilterBar filters={filters} setFilters={setFilters} />

      {/* Content Area */}
      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-[1800px] mx-auto">
          {view === "map" ? (
            <MapView filters={filters} />
          ) : (
            <ListView filters={filters} />
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
