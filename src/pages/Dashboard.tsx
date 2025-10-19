import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { Zap, LogOut, List, MapIcon, Filter, PanelRight, MapPin, MessageSquare } from "lucide-react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { MapView } from "@/components/dashboard/MapView";
import { ListView } from "@/components/dashboard/ListView";
import { SyncButton } from "@/components/dashboard/SyncButton";
import { CompactStats } from "@/components/dashboard/CompactStats";
import { CRMSidePanel } from "@/components/dashboard/CRMSidePanel";
import { QuickActionButtons } from "@/components/dashboard/QuickActionButtons";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [view, setView] = useState<"map" | "list">("map");
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [selectedEntreprise, setSelectedEntreprise] = useState<any>(null);
  const [crmPanelOpen, setCrmPanelOpen] = useState(false);
  const [filters, setFilters] = useState({
    dateFrom: "2025-09-01",
    dateTo: "",
    categories: [] as string[],
    departments: [] as string[],
    crmFilter: undefined as string | undefined,
  });
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const activeFiltersCount = 
    (filters.categories?.length || 0) + 
    (filters.departments?.length || 0) + 
    (filters.dateFrom ? 1 : 0) + 
    (filters.dateTo ? 1 : 0);

  useEffect(() => {
    // Check authentication and admin role
    const checkAuthAndRole = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth");
        return;
      }

      setUserId(session.user.id);

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
      description: "À bientôt sur LUMA !",
    });
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-accent/30 blur-xl animate-pulse"></div>
            <Zap className="w-12 h-12 text-accent mx-auto relative" />
          </div>
          <p className="text-muted-foreground text-base">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      {/* Header */}
      <header className="glass-card border-b border-accent/20 px-3 md:px-4 py-2 md:py-3 z-10 backdrop-blur-xl shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 md:gap-4">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-accent/30 blur-lg animate-pulse" />
                  <Zap className="w-6 h-6 md:w-7 md:h-7 text-accent relative" />
                </div>
                <span className="text-lg md:text-xl font-bold gradient-text">LUMA</span>
              </div>
              
              {/* View Toggle */}
              <div className="flex gap-1 p-0.5 bg-card/50 rounded-lg border border-accent/20">
                <Button
                  variant={view === "map" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setView("map")}
                  className={`h-7 px-2 text-xs ${view === "map" ? "bg-accent text-primary hover:bg-accent/90" : "hover:bg-accent/10"}`}
                >
                  <MapIcon className="w-3.5 h-3.5 mr-1" />
                  <span className="hidden sm:inline">Carte</span>
                </Button>
                <Button
                  variant={view === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setView("list")}
                  className={`h-7 px-2 text-xs ${view === "list" ? "bg-accent text-primary hover:bg-accent/90" : "hover:bg-accent/10"}`}
                >
                  <List className="w-3.5 h-3.5 mr-1" />
                  <span className="hidden sm:inline">Liste</span>
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {isAdmin && !isMobile && <SyncButton />}
              {!isMobile && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCrmPanelOpen(!crmPanelOpen)}
                  className={`h-7 px-2 text-xs ${crmPanelOpen ? 'bg-accent text-primary' : 'border-accent/50 hover:bg-accent/10'}`}
                >
                  <PanelRight className="w-3.5 h-3.5 mr-1" />
                  CRM
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="h-7 px-2 text-xs border-accent/50 hover:bg-accent/10 hover:border-accent transition-all"
              >
                <LogOut className="w-3.5 h-3.5 sm:mr-1" />
                <span className="hidden sm:inline">Déconnexion</span>
              </Button>
            </div>
          </div>
        </header>
      
      {/* Compact Stats */}
      {userId && !isMobile && <CompactStats userId={userId} />}

      {/* Mobile Filter Button */}
      {isMobile && (
        <div className="glass-card border-b border-accent/20 px-3 py-2 shrink-0">
          <Sheet open={filterSheetOpen} onOpenChange={setFilterSheetOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="w-full h-9 border-accent/50 hover:bg-accent/10 justify-between"
              >
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-accent" />
                  <span className="text-sm font-medium">Filtres</span>
                </div>
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary" className="bg-accent/20 text-accent h-5 px-2">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-screen p-0">
              <SheetHeader className="px-6 py-4 border-b border-accent/20 bg-gradient-to-b from-accent/5 to-transparent">
                <SheetTitle className="flex items-center gap-3 text-xl">
                  <div className="p-2 bg-accent/10 rounded-lg">
                    <Filter className="w-5 h-5 text-accent" />
                  </div>
                  Filtrer les résultats
                </SheetTitle>
              </SheetHeader>
              <div className="h-[calc(100vh-72px)] overflow-hidden">
                <Sidebar 
                  filters={filters} 
                  setFilters={setFilters}
                  onFilterChange={() => setFilterSheetOpen(false)}
                  isMobileSheet={true}
                />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      )}

      {/* Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Desktop/Tablet Sidebar */}
        {!isMobile && (
          <Sidebar filters={filters} setFilters={setFilters} />
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-hidden">
          <div className="h-full p-4 md:p-6">
            {view === "map" ? (
              <MapView 
                filters={filters} 
                onEntrepriseSelect={(entreprise) => {
                  setSelectedEntreprise(entreprise);
                  setCrmPanelOpen(true);
                }}
              />
            ) : (
              <div className="h-full">
                <ListView 
                  filters={filters}
                  onEntrepriseSelect={(entreprise) => {
                    setSelectedEntreprise(entreprise);
                    setCrmPanelOpen(true);
                  }}
                />
              </div>
            )}
          </div>
        </main>

        {/* CRM Side Panel - Desktop only */}
        {!isMobile && crmPanelOpen && (
          <CRMSidePanel 
            entreprise={selectedEntreprise}
            onClose={() => setCrmPanelOpen(false)}
          />
        )}

        {/* CRM Sheet - Mobile only */}
        {isMobile && (
          <Sheet open={crmPanelOpen} onOpenChange={setCrmPanelOpen}>
            <SheetContent side="bottom" className="h-[90vh] p-0">
              {selectedEntreprise && (
                <div className="h-full flex flex-col">
                  <SheetHeader className="px-6 py-4 border-b border-accent/20">
                    <SheetTitle className="text-xl gradient-text">{selectedEntreprise.nom}</SheetTitle>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {selectedEntreprise.ville || selectedEntreprise.code_postal}
                    </p>
                  </SheetHeader>
                  <ScrollArea className="flex-1 px-6 py-4">
                    <div className="space-y-6">
                      <Card className="border-accent/20 bg-gradient-to-br from-accent/5 to-transparent">
                        <CardContent className="p-5 space-y-4">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="p-2 bg-accent/20 rounded-lg">
                              <MessageSquare className="h-4 w-4 text-accent" />
                            </div>
                            <h4 className="font-semibold">Actions rapides</h4>
                          </div>
                          <QuickActionButtons 
                            entrepriseId={selectedEntreprise.id} 
                            onInteractionAdded={() => {
                              /* Refresh logic would go here */
                            }}
                          />
                        </CardContent>
                      </Card>
                    </div>
                  </ScrollArea>
                </div>
              )}
            </SheetContent>
          </Sheet>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
