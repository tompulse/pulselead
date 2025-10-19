import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Target, LogOut, Filter, List, MapIcon } from "lucide-react";
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
    <div className="min-h-screen bg-background flex">
      {/* Sidebar - Only show in map view */}
      {view === "map" && <Sidebar filters={filters} setFilters={setFilters} />}

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="glass-card border-b border-accent/20 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Target className="w-8 h-8 text-accent" />
                <span className="text-2xl font-bold gradient-text">LeadMagnet</span>
              </div>
              
              {/* View Toggle */}
              <div className="flex gap-2 ml-8">
                <Button
                  variant={view === "map" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setView("map")}
                  className={view === "map" ? "bg-accent text-primary" : ""}
                >
                  <MapIcon className="w-4 h-4 mr-2" />
                  Carte
                </Button>
                <Button
                  variant={view === "list" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setView("list")}
                  className={view === "list" ? "bg-accent text-primary" : ""}
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
                className="border-accent/50 hover:bg-accent/10"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Déconnexion
              </Button>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 p-6">
          {view === "map" ? (
            <MapView filters={filters} />
          ) : (
            <ListView filters={filters} />
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
