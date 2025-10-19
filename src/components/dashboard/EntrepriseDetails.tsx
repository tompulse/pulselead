import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useIsMobile } from "@/hooks/use-mobile";
import { MapPin, Building2, User, Calendar, DollarSign, Navigation, Map, Loader2, MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { InteractionTimeline } from "./InteractionTimeline";
import { QuickActionButtons } from "./QuickActionButtons";
import { LeadStatusBadge } from "./LeadStatusBadge";

interface EntrepriseDetailsProps {
  entreprise: {
    id: string;
    nom: string;
    adresse: string;
    code_postal: string;
    ville?: string;
    latitude: number;
    longitude: number;
    siret: string;
    date_demarrage: string;
    interlocuteur?: string;
    numero_voie?: string;
    type_voie?: string;
    nom_voie?: string;
    administration?: string;
    capital?: number;
    activite?: string;
    code_naf: string;
  } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EntrepriseDetails = ({ entreprise, open, onOpenChange }: EntrepriseDetailsProps) => {
  const isMobile = useIsMobile();
  const [formattedAdmin, setFormattedAdmin] = useState<string | null>(null);
  const [formattedActivite, setFormattedActivite] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [interactions, setInteractions] = useState<any[]>([]);
  const [leadStatus, setLeadStatus] = useState<any>(null);
  const [loadingCRM, setLoadingCRM] = useState(true);

  useEffect(() => {
    if (!entreprise || !open) return;

    const formatDetails = async () => {
      if (!entreprise.administration && !entreprise.activite) {
        setFormattedAdmin(null);
        setFormattedActivite(null);
        return;
      }

      setLoading(true);
      try {
        const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/format-lead-details`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            administration: entreprise.administration,
            activite: entreprise.activite,
          }),
        });

        if (response.ok) {
          const formatted = await response.json();
          setFormattedAdmin(formatted.administration || entreprise.administration);
          setFormattedActivite(formatted.activite || entreprise.activite);
        } else {
          setFormattedAdmin(entreprise.administration || null);
          setFormattedActivite(entreprise.activite || null);
        }
      } catch (error) {
        console.error("Error formatting lead details:", error);
        setFormattedAdmin(entreprise.administration || null);
        setFormattedActivite(entreprise.activite || null);
      } finally {
        setLoading(false);
      }
    };

    const fetchCRMData = async () => {
      setLoadingCRM(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch interactions
      const { data: interactionsData } = await supabase
        .from('lead_interactions')
        .select('*')
        .eq('entreprise_id', entreprise.id)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      setInteractions(interactionsData || []);

      // Fetch lead status
      const { data: statusData } = await supabase
        .from('lead_statuts')
        .select('*')
        .eq('entreprise_id', entreprise.id)
        .eq('user_id', user.id)
        .single();

      setLeadStatus(statusData);
      setLoadingCRM(false);
    };

    formatDetails();
    fetchCRMData();
  }, [entreprise, open]);

  const refreshCRMData = async () => {
    if (!entreprise) return;
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: interactionsData } = await supabase
      .from('lead_interactions')
      .select('*')
      .eq('entreprise_id', entreprise.id)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    setInteractions(interactionsData || []);

    const { data: statusData } = await supabase
      .from('lead_statuts')
      .select('*')
      .eq('entreprise_id', entreprise.id)
      .eq('user_id', user.id)
      .single();

    setLeadStatus(statusData);
  };

  if (!entreprise) return null;

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

  const content = (
    <div className="space-y-6">
      {/* Header avec nom et badges */}
      <div className="space-y-3">
        <h2 className="text-2xl md:text-3xl font-bold gradient-text leading-tight pr-8">
          {entreprise.nom}
        </h2>
        <div className="flex flex-wrap gap-2">
          {entreprise.code_naf && (
            <Badge variant="secondary" className="bg-accent/20 text-accent">
              NAF: {entreprise.code_naf}
            </Badge>
          )}
          {leadStatus && (
            <LeadStatusBadge 
              statut={leadStatus.statut_actuel} 
              probabilite={leadStatus.probabilite}
            />
          )}
        </div>
      </div>

      <Separator className="bg-accent/20" />

      <Tabs defaultValue="info" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="info">Informations</TabsTrigger>
          <TabsTrigger value="crm" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            CRM
            {interactions.length > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                {interactions.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="space-y-4 mt-4">

      {/* Informations principales */}
      <div className="space-y-4">
        {/* Adresse */}
        <div className="flex items-start gap-3 p-3 rounded-lg bg-accent/5 border border-accent/20">
          <MapPin className="w-5 h-5 text-accent shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Adresse</p>
            <p className="text-base leading-relaxed">{formattedAddress}</p>
          </div>
        </div>

        {/* Activité */}
        {(loading || formattedActivite) && (
          <div className="flex items-start gap-3 p-3 rounded-lg bg-accent/5 border border-accent/20">
            <Building2 className="w-5 h-5 text-accent shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-muted-foreground mb-1">Activité</p>
              {loading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-accent" />
                  <p className="text-sm text-muted-foreground">Formatage en cours...</p>
                </div>
              ) : (
                <p className="text-base leading-relaxed">{formattedActivite}</p>
              )}
            </div>
          </div>
        )}

        {/* SIRET */}
        <div className="flex items-start gap-3 p-3 rounded-lg bg-accent/5 border border-accent/20">
          <Building2 className="w-5 h-5 text-accent shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">SIRET</p>
            <p className="text-base font-mono">{entreprise.siret}</p>
          </div>
        </div>

        {/* Contact */}
        {(loading || formattedAdmin) && (
          <div className="flex items-start gap-3 p-3 rounded-lg bg-accent/5 border border-accent/20">
            <User className="w-5 h-5 text-accent shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-muted-foreground mb-1">Contact</p>
              {loading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-accent" />
                  <p className="text-sm text-muted-foreground">Formatage en cours...</p>
                </div>
              ) : (
                <p className="text-base leading-relaxed">{formattedAdmin}</p>
              )}
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
        </div>

      <Separator className="bg-accent/20" />

      {/* Boutons de navigation */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
        <Button
          asChild
          size="lg"
          className="bg-accent/10 hover:bg-accent text-accent hover:text-primary border border-accent/50 w-full"
        >
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${entreprise.latitude},${entreprise.longitude}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full"
          >
            <Map className="w-5 h-5 shrink-0" />
            <span className="truncate">Ouvrir dans Google Maps</span>
          </a>
        </Button>
        
        <Button
          asChild
          size="lg"
          className="bg-accent/10 hover:bg-accent text-accent hover:text-primary border border-accent/50 w-full"
        >
          <a
            href={`https://waze.com/ul?ll=${entreprise.latitude},${entreprise.longitude}&navigate=yes`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full"
          >
            <Navigation className="w-5 h-5 shrink-0" />
            <span className="truncate">Naviguer avec Waze</span>
          </a>
        </Button>
      </div>
        </TabsContent>

        <TabsContent value="crm" className="space-y-4 mt-4">
          {/* Quick Actions */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-accent" />
              Actions rapides
            </h3>
            <QuickActionButtons 
              entrepriseId={entreprise.id} 
              onInteractionAdded={refreshCRMData}
            />
          </div>

          <Separator className="bg-accent/20" />

          {/* Timeline */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm">Historique des interactions</h3>
            {loadingCRM ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-accent" />
              </div>
            ) : (
              <InteractionTimeline interactions={interactions} />
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="h-[90vh] overflow-y-auto overflow-x-hidden">
          <SheetHeader className="mb-4">
            <SheetTitle className="text-xl">Détails de l'entreprise</SheetTitle>
          </SheetHeader>
          <div className="max-w-full overflow-x-hidden">
            {content}
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Détails de l'entreprise</DialogTitle>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  );
};
