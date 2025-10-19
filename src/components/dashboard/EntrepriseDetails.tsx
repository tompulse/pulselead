import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useIsMobile } from "@/hooks/use-mobile";
import { MapPin, Building2, User, Calendar, DollarSign, Navigation, Map, Loader2 } from "lucide-react";

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

    formatDetails();
  }, [entreprise, open]);

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
      {/* Header avec nom et badge */}
      <div className="space-y-2">
        <h2 className="text-2xl md:text-3xl font-bold gradient-text leading-tight pr-8">
          {entreprise.nom}
        </h2>
        {entreprise.code_naf && (
          <Badge variant="secondary" className="bg-accent/20 text-accent">
            NAF: {entreprise.code_naf}
          </Badge>
        )}
      </div>

      <Separator className="bg-accent/20" />

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
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Button
          asChild
          size="lg"
          className="bg-accent/10 hover:bg-accent text-accent hover:text-primary border border-accent/50"
        >
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${entreprise.latitude},${entreprise.longitude}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2"
          >
            <Map className="w-5 h-5" />
            <span>Ouvrir dans Google Maps</span>
          </a>
        </Button>
        
        <Button
          asChild
          size="lg"
          className="bg-accent/10 hover:bg-accent text-accent hover:text-primary border border-accent/50"
        >
          <a
            href={`https://waze.com/ul?ll=${entreprise.latitude},${entreprise.longitude}&navigate=yes`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2"
          >
            <Navigation className="w-5 h-5" />
            <span>Naviguer avec Waze</span>
          </a>
        </Button>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="h-[90vh] overflow-y-auto">
          <SheetHeader className="mb-4">
            <SheetTitle className="text-xl">Détails de l'entreprise</SheetTitle>
          </SheetHeader>
          {content}
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
