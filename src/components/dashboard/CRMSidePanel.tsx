import { useState, useEffect } from "react";
import { X, Phone, MapPin, Calendar, Building2, DollarSign, User, Navigation, Map as MapIconLucide } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { LeadStatusBadge } from "./LeadStatusBadge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface CRMSidePanelProps {
  entreprise: {
    id: string;
    nom: string;
    ville?: string;
    code_postal?: string;
    siret?: string;
    code_naf?: string;
    adresse?: string;
    numero_voie?: string;
    type_voie?: string;
    nom_voie?: string;
    capital?: number;
    date_demarrage?: string;
    activite?: string;
    administration?: string;
    latitude?: number;
    longitude?: number;
  } | null;
  onClose: () => void;
}

export const CRMSidePanel = ({ entreprise, onClose }: CRMSidePanelProps) => {
  const [leadStatus, setLeadStatus] = useState<any>(null);

  useEffect(() => {
    if (!entreprise) return;
    fetchCRMData();
  }, [entreprise]);

  const fetchCRMData = async () => {
    if (!entreprise) return;
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

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

  return (
    <div className="w-[400px] bg-background border-l border-accent/20 flex flex-col h-full shadow-2xl">
      {/* Header with gradient */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/20 via-accent/10 to-transparent" />
        <div className="relative p-6 border-b border-accent/20">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 pr-2">
              <h3 className="font-bold text-xl gradient-text mb-1">{entreprise.nom}</h3>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {entreprise.ville || entreprise.code_postal}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-9 w-9 p-0 hover:bg-accent/20 rounded-full transition-all"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          {leadStatus && (
            <div className="flex items-center gap-2">
              <LeadStatusBadge 
                statut={leadStatus.statut_actuel} 
                probabilite={leadStatus.probabilite}
              />
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-6 space-y-4">
          {/* Quick Actions - 3 buttons */}
          <div className="grid grid-cols-3 gap-2">
            <Button
              variant="outline"
              size="lg"
              onClick={async () => {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;
                
                await supabase.from('lead_interactions').insert([{
                  entreprise_id: entreprise.id,
                  user_id: user.id,
                  type: 'appel',
                  statut: 'en_cours',
                  notes: 'Appel planifié'
                }]);
                
                fetchCRMData();
              }}
              className="h-16 flex flex-col items-center justify-center gap-1.5 border-blue-500/30 hover:bg-blue-500/10 hover:border-blue-500 transition-all group relative overflow-hidden shadow-sm"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 via-blue-500/5 to-blue-500/0 group-hover:from-blue-500/10 group-hover:to-blue-500/20 transition-all" />
              <Phone className="h-5 w-5 text-blue-500 group-hover:scale-110 transition-transform relative z-10" />
              <span className="text-xs font-medium relative z-10">Appeler</span>
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={async () => {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;
                
                await supabase.from('lead_interactions').insert([{
                  entreprise_id: entreprise.id,
                  user_id: user.id,
                  type: 'visite',
                  statut: 'en_cours',
                  notes: 'Visite planifiée'
                }]);
                
                fetchCRMData();
              }}
              className="h-16 flex flex-col items-center justify-center gap-1.5 border-green-500/30 hover:bg-green-500/10 hover:border-green-500 transition-all group relative overflow-hidden shadow-sm"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/0 via-green-500/5 to-green-500/0 group-hover:from-green-500/10 group-hover:to-green-500/20 transition-all" />
              <MapPin className="h-5 w-5 text-green-500 group-hover:scale-110 transition-transform relative z-10" />
              <span className="text-xs font-medium relative z-10">Visiter</span>
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={async () => {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;
                
                await supabase.from('lead_interactions').insert([{
                  entreprise_id: entreprise.id,
                  user_id: user.id,
                  type: 'rdv',
                  statut: 'en_cours',
                  notes: 'Rendez-vous confirmé'
                }]);
                
                fetchCRMData();
              }}
              className="h-16 flex flex-col items-center justify-center gap-1.5 border-purple-500/30 hover:bg-purple-500/10 hover:border-purple-500 transition-all group relative overflow-hidden shadow-sm"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 via-purple-500/5 to-purple-500/0 group-hover:from-purple-500/10 group-hover:to-purple-500/20 transition-all" />
              <Calendar className="h-5 w-5 text-purple-500 group-hover:scale-110 transition-transform relative z-10" />
              <span className="text-xs font-medium relative z-10">RDV</span>
            </Button>
          </div>

          <Separator className="bg-accent/20" />

          {/* Informations de l'entreprise */}
          <div className="space-y-3">
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
          </div>

          <Separator className="bg-accent/20" />

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
        </div>
      </ScrollArea>
    </div>
  );
};
