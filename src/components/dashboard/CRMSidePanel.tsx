import { useState, useEffect } from "react";
import { X, Phone, MapPin, Calendar, Building2, DollarSign, User, Navigation, Map as MapIconLucide } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { LeadStatusBadge } from "./LeadStatusBadge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { openGoogleMaps, openWaze } from "@/utils/navigation";

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
  const [interactions, setInteractions] = useState<{
    hasAppel: boolean;
    hasVisite: boolean;
    hasRdv: boolean;
  }>({
    hasAppel: false,
    hasVisite: false,
    hasRdv: false,
  });
  const { toast } = useToast();

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

    const { data: interactionsData } = await supabase
      .from('lead_interactions')
      .select('type')
      .eq('entreprise_id', entreprise.id)
      .eq('user_id', user.id);

    setLeadStatus(statusData);
    
    // Update interaction states
    const hasAppel = interactionsData?.some(i => i.type === 'appel') || false;
    const hasVisite = interactionsData?.some(i => i.type === 'visite') || false;
    const hasRdv = interactionsData?.some(i => i.type === 'rdv') || false;
    
    setInteractions({
      hasAppel,
      hasVisite,
      hasRdv,
    });
  };

  const handleCRMAction = async (actionType: 'appeler' | 'visite' | 'rdv') => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !entreprise) return;

    const actionTypeMapping: Record<string, 'hasAppel' | 'hasVisite' | 'hasRdv'> = {
      appeler: 'hasAppel',
      visite: 'hasVisite',
      rdv: 'hasRdv'
    };

    const hasAction = interactions[actionTypeMapping[actionType]];

    // If action already exists, delete it (toggle off)
    if (hasAction) {
      const interactionTypes: Record<string, 'appel' | 'visite' | 'rdv'> = {
        appeler: 'appel',
        visite: 'visite',
        rdv: 'rdv'
      };

      const { data: existingInteractions } = await supabase
        .from('lead_interactions')
        .select('id')
        .eq('entreprise_id', entreprise.id)
        .eq('user_id', user.id)
        .eq('type', interactionTypes[actionType])
        .limit(1);

      if (existingInteractions && existingInteractions.length > 0) {
        await supabase
          .from('lead_interactions')
          .delete()
          .eq('id', existingInteractions[0].id);

        // Update local state immediately
        setInteractions(prev => ({
          ...prev,
          [actionTypeMapping[actionType]]: false,
        }));

        const actionEmojis = {
          appeler: '📞',
          visite: '🚗',
          rdv: '📅',
        };

        toast({
          title: `${actionEmojis[actionType]} Action supprimée`,
          description: `L'action a été retirée pour cette entreprise`,
        });

        return;
      }
    }

    // Otherwise, add the action (toggle on)
    const actionLabels = {
      appeler: 'Appel planifié',
      visite: 'Visite planifiée',
      rdv: 'Rendez-vous confirmé',
    };

    const interactionTypes: Record<string, 'appel' | 'visite' | 'rdv'> = {
      appeler: 'appel',
      visite: 'visite',
      rdv: 'rdv',
    };

    try {
      await supabase.from('lead_interactions').insert([{
        entreprise_id: entreprise.id,
        user_id: user.id,
        type: interactionTypes[actionType],
        statut: 'en_cours',
        notes: actionLabels[actionType]
      }]);

      // Update local state immediately
      setInteractions(prev => ({
        ...prev,
        [actionTypeMapping[actionType]]: true,
      }));

      const actionEmojis = {
        appeler: '📞',
        visite: '🚗',
        rdv: '📅',
      };

      toast({
        title: `${actionEmojis[actionType]} ${actionLabels[actionType]} !`,
        description: `L'action a été enregistrée pour cette entreprise`,
      });
    } catch (error) {
      console.error('Error adding CRM action:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'enregistrer l'action",
        variant: "destructive"
      });
    }
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
      {/* Header with optimized design */}
      <div className="relative overflow-hidden bg-gradient-to-br from-navy-deep via-navy-darker to-black-deep border-b border-cyan-electric/20">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-cyan-electric/10 via-transparent to-transparent" />
        <div className="relative p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-2xl gradient-text mb-2 line-clamp-2 leading-tight">
                {entreprise.nom}
              </h3>
              {leadStatus && (
                <LeadStatusBadge 
                  statut={leadStatus.statut_actuel} 
                  probabilite={leadStatus.probabilite}
                />
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-9 w-9 rounded-lg hover:bg-destructive/10 hover:text-destructive transition-all shadow-lg border border-transparent hover:border-destructive/30 flex-shrink-0"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-6 space-y-4">
          {/* Quick Actions - 3 toggle buttons */}
          <div className="grid grid-cols-3 gap-2">
            <Button
              variant="outline"
              size="lg"
              onClick={() => handleCRMAction('appeler')}
              className={`h-16 flex flex-col items-center justify-center gap-1.5 transition-all group relative overflow-hidden shadow-sm ${
                interactions.hasAppel
                  ? 'bg-blue-500/20 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.3)]'
                  : 'border-blue-500/30 hover:bg-blue-500/10 hover:border-blue-500'
              }`}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 via-blue-500/5 to-blue-500/0 group-hover:from-blue-500/10 group-hover:to-blue-500/20 transition-all" />
              <Phone className={`h-5 w-5 text-blue-500 group-hover:scale-110 transition-transform relative z-10 ${interactions.hasAppel ? 'scale-110' : ''}`} />
              <span className="text-xs font-medium relative z-10">Appeler</span>
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => handleCRMAction('visite')}
              className={`h-16 flex flex-col items-center justify-center gap-1.5 transition-all group relative overflow-hidden shadow-sm ${
                interactions.hasVisite
                  ? 'bg-green-500/20 border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.3)]'
                  : 'border-green-500/30 hover:bg-green-500/10 hover:border-green-500'
              }`}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/0 via-green-500/5 to-green-500/0 group-hover:from-green-500/10 group-hover:to-green-500/20 transition-all" />
              <MapPin className={`h-5 w-5 text-green-500 group-hover:scale-110 transition-transform relative z-10 ${interactions.hasVisite ? 'scale-110' : ''}`} />
              <span className="text-xs font-medium relative z-10">Visiter</span>
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => handleCRMAction('rdv')}
              className={`h-16 flex flex-col items-center justify-center gap-1.5 transition-all group relative overflow-hidden shadow-sm ${
                interactions.hasRdv
                  ? 'bg-purple-500/20 border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.3)]'
                  : 'border-purple-500/30 hover:bg-purple-500/10 hover:border-purple-500'
              }`}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 via-purple-500/5 to-purple-500/0 group-hover:from-purple-500/10 group-hover:to-purple-500/20 transition-all" />
              <Calendar className={`h-5 w-5 text-purple-500 group-hover:scale-110 transition-transform relative z-10 ${interactions.hasRdv ? 'scale-110' : ''}`} />
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
                variant="outline"
                onClick={() => openGoogleMaps(entreprise.latitude, entreprise.longitude)}
                className="border-accent/30 hover:bg-accent/10 flex items-center justify-center gap-2"
              >
                <MapIconLucide className="w-4 h-4" />
                Google Maps
              </Button>
              
              <Button
                variant="outline"
                onClick={() => openWaze(entreprise.latitude, entreprise.longitude)}
                className="border-accent/30 hover:bg-accent/10 flex items-center justify-center gap-2"
              >
                <Navigation className="w-4 h-4" />
                Waze
              </Button>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
