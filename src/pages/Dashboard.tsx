import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { trackViewChange, trackEntrepriseView } from "@/utils/analytics";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { Lightbulb, LogOut, List, MapIcon, Filter, PanelRight, MapPin, MessageSquare, Building2, Calendar, DollarSign, User, Navigation, Map as MapIconLucide } from "lucide-react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { MapView } from "@/components/dashboard/MapView";
import { ListView } from "@/components/dashboard/ListView";
import { Skeleton } from "@/components/ui/skeleton";
import { SyncButton } from "@/components/dashboard/SyncButton";
import { CRMSidePanel } from "@/components/dashboard/CRMSidePanel";
import { QuickActionButtons } from "@/components/dashboard/QuickActionButtons";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { LeadStatusBadge } from "@/components/dashboard/LeadStatusBadge";
import { InteractionTimeline } from "@/components/dashboard/InteractionTimeline";
import { FilterOnboarding } from "@/components/dashboard/FilterOnboarding";
import { ActivitiesView } from "@/components/dashboard/ActivitiesView";

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [view, setView] = useState<"map" | "list" | "activities">("map");
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [selectedEntreprise, setSelectedEntreprise] = useState<any>(null);
  const [crmPanelOpen, setCrmPanelOpen] = useState(false);
  const [fullEntrepriseData, setFullEntrepriseData] = useState<any>(null);
  const [mobileInteractions, setMobileInteractions] = useState<any[]>([]);
  const [mobileLeadStatus, setMobileLeadStatus] = useState<any>(null);
  const [mobileActiveTab, setMobileActiveTab] = useState<'info' | 'crm'>('info');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [filters, setFilters] = useState({
    dateFrom: "2025-09-01",
    dateTo: "",
    categories: [] as string[],
    departments: [] as string[],
  });
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const activeFiltersCount = 
    (filters.categories?.length || 0) + 
    (filters.departments?.length || 0) + 
    (filters.dateFrom ? 1 : 0) + 
    (filters.dateTo ? 1 : 0);

  const handleEntrepriseSelect = async (entreprise: any) => {
    setSelectedEntreprise(entreprise);
    
    // Track entreprise view
    if (entreprise.id && entreprise.nom) {
      trackEntrepriseView(entreprise.id, entreprise.nom, view);
    }
    
    // Fetch full entreprise data if needed
    if (entreprise.id) {
      const { data } = await supabase
        .from('entreprises')
        .select('*')
        .eq('id', entreprise.id)
        .single();
      
      if (data) {
        setFullEntrepriseData(data);
      }

      // On mobile, also fetch interactions and lead status
      if (isMobile) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: interactionsData } = await supabase
            .from('lead_interactions')
            .select('*')
            .eq('entreprise_id', entreprise.id)
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

          setMobileInteractions(interactionsData || []);

          const { data: statusData } = await supabase
            .from('lead_statuts')
            .select('*')
            .eq('entreprise_id', entreprise.id)
            .eq('user_id', user.id)
            .single();

          setMobileLeadStatus(statusData);
        }
      }
    }
    
    // Reset to Info tab on mobile
    setMobileActiveTab('info');
    setCrmPanelOpen(true);
  };

  const refreshMobileData = async () => {
    if (!fullEntrepriseData || !isMobile) return;
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: interactionsData } = await supabase
      .from('lead_interactions')
      .select('*')
      .eq('entreprise_id', fullEntrepriseData.id)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    setMobileInteractions(interactionsData || []);

    const { data: statusData } = await supabase
      .from('lead_statuts')
      .select('*')
      .eq('entreprise_id', fullEntrepriseData.id)
      .eq('user_id', user.id)
      .single();

    setMobileLeadStatus(statusData);
  };

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
      
      // Check if onboarding is needed
      const onboardingComplete = localStorage.getItem('luma_onboarding_complete');
      const savedFilters = localStorage.getItem('luma_initial_filters');
      
      if (!onboardingComplete) {
        setShowOnboarding(true);
      } else if (savedFilters) {
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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Déconnexion réussie",
      description: "À bientôt sur LUMA !",
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-accent/30 blur-xl animate-pulse"></div>
            <Lightbulb className="w-12 h-12 text-accent mx-auto relative" />
          </div>
          <p className="text-muted-foreground text-base">Chargement...</p>
        </div>
      </div>
    );
  }

  if (showOnboarding) {
    return <FilterOnboarding onComplete={handleOnboardingComplete} />;
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
                  <Lightbulb className="w-6 h-6 md:w-7 md:h-7 text-accent relative" />
                </div>
                <span className="text-lg md:text-xl font-bold gradient-text">LUMA</span>
              </div>
              
              {/* View Toggle */}
              <div className="flex gap-1 p-0.5 bg-card/50 rounded-lg border border-accent/20">
                <Button
                  variant={view === "map" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => {
                    setView("map");
                    trackViewChange("map");
                  }}
                  className={`h-7 px-2 text-xs ${view === "map" ? "bg-accent text-primary hover:bg-accent/90" : "hover:bg-accent/10"}`}
                >
                  <MapIcon className="w-3.5 h-3.5 mr-1" />
                  <span className="hidden sm:inline">Carte</span>
                </Button>
                <Button
                  variant={view === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => {
                    setView("list");
                    trackViewChange("list");
                  }}
                  className={`h-7 px-2 text-xs ${view === "list" ? "bg-accent text-primary hover:bg-accent/90" : "hover:bg-accent/10"}`}
                >
                  <List className="w-3.5 h-3.5 mr-1" />
                  <span className="hidden sm:inline">Liste</span>
                </Button>
                <Button
                  variant={view === "activities" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => {
                    setView("activities");
                    trackViewChange("activities");
                  }}
                  className={`h-7 px-2 text-xs ${view === "activities" ? "bg-accent text-primary hover:bg-accent/90" : "hover:bg-accent/10"}`}
                >
                  <Calendar className="w-3.5 h-3.5 mr-1" />
                  <span className="hidden sm:inline">Activités</span>
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {isAdmin && !isMobile && <SyncButton />}
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
      
      {/* Compact Stats - Removed from all views */}

      {/* Mobile Filter Button */}
      {isMobile && view !== "activities" && (
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
        {!isMobile && view !== "activities" && (
          <Sidebar filters={filters} setFilters={setFilters} />
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-hidden relative">
          <div className="h-full p-4 md:p-6">
            {filters.departments.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <Card className="glass-card border-accent/20 p-8 max-w-md text-center">
                  <div className="relative inline-block mb-4">
                    <div className="absolute inset-0 bg-accent/30 blur-xl animate-pulse"></div>
                    <MapPin className="w-16 h-16 text-accent mx-auto relative" />
                  </div>
                  <h3 className="text-xl font-semibold gradient-text mb-3">
                    Sélectionnez une zone géographique
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Veuillez choisir au moins un département dans les filtres pour afficher les entreprises sur la carte.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      if (isMobile) {
                        setFilterSheetOpen(true);
                      } else {
                        // Focus sur la sidebar
                        document.querySelector('aside')?.scrollIntoView({ behavior: 'smooth' });
                      }
                    }}
                    className="border-accent/50 hover:bg-accent/10"
                  >
                    <Filter className="w-4 h-4 mr-2" />
                    Ouvrir les filtres
                  </Button>
                </Card>
              </div>
            ) : view === "map" ? (
              <MapView 
                key="map-view"
                filters={filters} 
                onEntrepriseSelect={handleEntrepriseSelect}
              />
            ) : view === "list" ? (
              <div className="h-full">
                <ListView 
                  filters={filters}
                  onEntrepriseSelect={handleEntrepriseSelect}
                />
              </div>
            ) : (
              <div className="h-full">
                <ActivitiesView
                  userId={userId!}
                  onEntrepriseClick={async (entrepriseId) => {
                    const { data } = await supabase
                      .from('entreprises')
                      .select('*')
                      .eq('id', entrepriseId)
                      .single();
                    
                    if (data) {
                      handleEntrepriseSelect(data);
                    }
                  }}
                />
              </div>
            )}
          </div>
        </main>

        {/* CRM Side Panel - Desktop only */}
        {!isMobile && crmPanelOpen && (
          <CRMSidePanel 
            entreprise={fullEntrepriseData || selectedEntreprise}
            onClose={() => {
              setCrmPanelOpen(false);
              setFullEntrepriseData(null);
            }}
          />
        )}

        {/* CRM Sheet - Mobile only */}
        {isMobile && (
          <Sheet open={crmPanelOpen} onOpenChange={setCrmPanelOpen}>
            <SheetContent side="bottom" className="h-[90vh] p-0">
              {(fullEntrepriseData || selectedEntreprise) && (() => {
                const entreprise = fullEntrepriseData || selectedEntreprise;
                const addressParts = [
                  entreprise.numero_voie,
                  entreprise.type_voie,
                  entreprise.nom_voie
                ].filter(Boolean).join(' ');
                
                const locationParts = [
                  entreprise.code_postal,
                  entreprise.ville
                ].filter(Boolean).join(' ');
                
                const formattedAddress = addressParts && locationParts 
                  ? `${addressParts}, ${locationParts}`
                  : addressParts || locationParts || entreprise.adresse || "Adresse non disponible";

                const formattedCapital = entreprise.capital 
                  ? `${entreprise.capital.toLocaleString('fr-FR')} €`
                  : null;

                return (
                  <div className="h-full flex flex-col">
                    {/* Header */}
                    <div className="relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-accent/20 via-accent/10 to-transparent" />
                      <div className="relative px-6 py-4 border-b border-accent/20">
                        <SheetTitle className="text-xl gradient-text mb-1">
                          {entreprise.nom}
                        </SheetTitle>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {entreprise.ville || entreprise.code_postal}
                        </p>
                        {mobileLeadStatus && (
                          <div className="flex items-center gap-2 mt-2">
                            <LeadStatusBadge 
                              statut={mobileLeadStatus.statut_actuel} 
                              probabilite={mobileLeadStatus.probabilite}
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Tabs Content */}
                    <ScrollArea className="flex-1">
                      <div className="p-6">
                        <Tabs value={mobileActiveTab} onValueChange={(v) => setMobileActiveTab(v as 'info' | 'crm')} className="w-full">
                          <TabsList className="grid w-full grid-cols-2 mb-6">
                            <TabsTrigger value="info">📋 Infos</TabsTrigger>
                            <TabsTrigger value="crm" className="flex items-center gap-2">
                              💼 CRM
                              {mobileInteractions.length > 0 && (
                                <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                                  {mobileInteractions.length}
                                </Badge>
                              )}
                            </TabsTrigger>
                          </TabsList>

                          <TabsContent value="info" className="space-y-4 mt-0">
                            {/* SIRET */}
                            {entreprise.siret && (
                              <div className="flex items-start gap-3 p-3 rounded-lg bg-accent/5 border border-accent/20">
                                <Building2 className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                                <div>
                                  <p className="text-sm font-medium text-muted-foreground mb-1">SIRET</p>
                                  <p className="text-base font-mono">{entreprise.siret}</p>
                                </div>
                              </div>
                            )}

                            {/* Code NAF */}
                            {entreprise.code_naf && (
                              <div className="flex items-start gap-3 p-3 rounded-lg bg-accent/5 border border-accent/20">
                                <Building2 className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                                <div>
                                  <p className="text-sm font-medium text-muted-foreground mb-1">Code NAF</p>
                                  <p className="text-base">{entreprise.code_naf}</p>
                                </div>
                              </div>
                            )}

                            {/* Adresse */}
                            <div className="flex items-start gap-3 p-3 rounded-lg bg-accent/5 border border-accent/20">
                              <MapPin className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                              <div>
                                <p className="text-sm font-medium text-muted-foreground mb-1">Adresse</p>
                                <p className="text-base leading-relaxed">{formattedAddress}</p>
                              </div>
                            </div>

                            {/* Activité */}
                            {entreprise.activite && (
                              <div className="flex items-start gap-3 p-3 rounded-lg bg-accent/5 border border-accent/20">
                                <Building2 className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-muted-foreground mb-1">Activité</p>
                                  <p className="text-base leading-relaxed">{entreprise.activite}</p>
                                </div>
                              </div>
                            )}

                            {/* Contact/Administration */}
                            {entreprise.administration && (
                              <div className="flex items-start gap-3 p-3 rounded-lg bg-accent/5 border border-accent/20">
                                <User className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-muted-foreground mb-1">Contact</p>
                                  <p className="text-base leading-relaxed">{entreprise.administration}</p>
                                </div>
                              </div>
                            )}

                            {/* Capital */}
                            {formattedCapital && (
                              <div className="flex items-start gap-3 p-3 rounded-lg bg-accent/5 border border-accent/20">
                                <DollarSign className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                                <div>
                                  <p className="text-sm font-medium text-muted-foreground mb-1">Capital</p>
                                  <p className="text-base font-semibold">{formattedCapital}</p>
                                </div>
                              </div>
                            )}

                            {/* Date de démarrage */}
                            {entreprise.date_demarrage && (
                              <div className="flex items-start gap-3 p-3 rounded-lg bg-accent/5 border border-accent/20">
                                <Calendar className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                                <div>
                                  <p className="text-sm font-medium text-muted-foreground mb-1">Date de démarrage</p>
                                  <p className="text-base">{entreprise.date_demarrage}</p>
                                </div>
                              </div>
                            )}

                            <Separator className="bg-accent/20 my-4" />

                            {/* Boutons de navigation */}
                            {entreprise.latitude && entreprise.longitude && (
                              <div className="grid grid-cols-2 gap-3 w-full">
                                <Button
                                  asChild
                                  variant="outline"
                                  className="border-accent/30 hover:bg-accent/10"
                                >
                                  <a
                                    href={`https://www.google.com/maps/search/?api=1&query=${entreprise.latitude},${entreprise.longitude}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center gap-2"
                                  >
                                    <MapIconLucide className="w-4 h-4" />
                                    Google Maps
                                  </a>
                                </Button>
                                
                                <Button
                                  asChild
                                  variant="outline"
                                  className="border-accent/30 hover:bg-accent/10"
                                >
                                  <a
                                    href={`https://waze.com/ul?ll=${entreprise.latitude},${entreprise.longitude}&navigate=yes`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center gap-2"
                                  >
                                    <Navigation className="w-4 h-4" />
                                    Waze
                                  </a>
                                </Button>
                              </div>
                            )}
                          </TabsContent>

                          <TabsContent value="crm" className="space-y-6 mt-0">
                            {/* Quick Actions Card */}
                            <Card className="border-accent/20 bg-gradient-to-br from-accent/5 to-transparent">
                              <CardContent className="p-5 space-y-4">
                                <div className="flex items-center gap-2 mb-3">
                                  <div className="p-2 bg-accent/20 rounded-lg">
                                    <MessageSquare className="h-4 w-4 text-accent" />
                                  </div>
                                  <h4 className="font-semibold">Actions rapides</h4>
                                </div>
                                <QuickActionButtons 
                                  entrepriseId={entreprise.id} 
                                  onInteractionAdded={refreshMobileData}
                                />
                              </CardContent>
                            </Card>

                            <Separator className="bg-accent/20" />

                            {/* Timeline Card */}
                            <Card className="border-accent/20">
                              <CardContent className="p-5 space-y-4">
                                <div className="flex items-center gap-2">
                                  <div className="p-2 bg-accent/20 rounded-lg">
                                    <Calendar className="h-4 w-4 text-accent" />
                                  </div>
                                  <h4 className="font-semibold">Historique des interactions</h4>
                                </div>
                                <InteractionTimeline interactions={mobileInteractions} />
                              </CardContent>
                            </Card>
                          </TabsContent>
                        </Tabs>
                      </div>
                    </ScrollArea>
                  </div>
                );
              })()}
            </SheetContent>
          </Sheet>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
