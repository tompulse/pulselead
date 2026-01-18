import { useState } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Clock, CreditCard, AlertTriangle, CheckCircle2, ExternalLink, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SubscriptionStatusBannerProps {
  status?: string;
  daysRemaining?: number;
  endDate?: string;
  isLoading?: boolean;
}

export const SubscriptionStatusBanner = ({
  status,
  daysRemaining,
  endDate,
  isLoading
}: SubscriptionStatusBannerProps) => {
  const [isOpeningPortal, setIsOpeningPortal] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const { toast } = useToast();

  const handleOpenPortal = async () => {
    // Open a popup synchronously to avoid browser popup blockers
    const popup = window.open("about:blank", "_blank");
    if (!popup) {
      toast({
        title: "Popup bloquée",
        description:
          "Autorisez les popups pour ouvrir le portail. Redirection dans cet onglet…",
      });
    }

    setIsOpeningPortal(true);
    try {
      const { data, error } = await supabase.functions.invoke("customer-portal");
      if (error) throw error;

      const url = data?.url;
      if (!url) throw new Error("URL du portail non disponible");

      if (popup && !popup.closed) {
        popup.location.href = url;
      } else {
        window.location.href = url;
      }
    } catch (error: any) {
      console.error("Error opening customer portal:", error);
      if (popup && !popup.closed) popup.close();

      toast({
        variant: "destructive",
        title: "Erreur",
        description:
          error?.message ||
          "Impossible d'ouvrir le portail de gestion. Réessayez plus tard.",
      });
    } finally {
      setIsOpeningPortal(false);
    }
  };

  // Don't show if loading, dismissed, or no status
  if (isLoading || isDismissed || !status) {
    return null;
  }

  // Don't show for active subscriptions (they don't need a reminder)
  if (status === 'active' && (!daysRemaining || daysRemaining > 7)) {
    return null;
  }

  const formattedEndDate = endDate 
    ? format(new Date(endDate), 'EEEE d MMMM yyyy', { locale: fr })
    : null;

  // Trial status - show prominently
  if (status === 'trialing') {
    return (
      <div className="relative bg-gradient-to-r from-cyan-500/10 via-cyan-500/5 to-transparent border border-cyan-500/20 rounded-lg px-4 py-3 mb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-start sm:items-center gap-3">
            <div className="p-2 bg-cyan-500/20 rounded-full shrink-0">
              <Clock className="h-4 w-4 text-cyan-400" />
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
              <Badge variant="outline" className="border-cyan-500/30 text-cyan-400 bg-cyan-500/10 w-fit">
                Essai gratuit
              </Badge>
              <span className="text-sm text-muted-foreground">
                {daysRemaining !== undefined ? (
                  daysRemaining > 0 ? (
                    <>Il vous reste <strong className="text-foreground">{daysRemaining} jour{daysRemaining > 1 ? 's' : ''}</strong></>
                  ) : (
                    <span className="text-amber-400">Votre essai se termine aujourd'hui</span>
                  )
                ) : null}
              </span>
              {formattedEndDate && (
                <span className="text-xs text-muted-foreground hidden md:inline">
                  · Premier prélèvement le {formattedEndDate} (79€)
                </span>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleOpenPortal}
              disabled={isOpeningPortal}
              className="text-xs border-cyan-500/30 hover:bg-cyan-500/10"
            >
              {isOpeningPortal ? (
                'Chargement...'
              ) : (
                <>
                  Gérer <ExternalLink className="h-3 w-3 ml-1" />
                </>
              )}
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setIsDismissed(true)}
              className="h-6 w-6 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
        
        {/* Mobile: show payment info on separate line */}
        {formattedEndDate && (
          <p className="text-xs text-muted-foreground mt-2 md:hidden flex items-center gap-1">
            <CreditCard className="h-3 w-3" />
            Premier prélèvement le {formattedEndDate} (79€)
          </p>
        )}
      </div>
    );
  }

  // Past due status - urgent alert
  if (status === 'past_due') {
    return (
      <div className="relative bg-gradient-to-r from-red-500/10 via-red-500/5 to-transparent border border-red-500/30 rounded-lg px-4 py-3 mb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500/20 rounded-full">
              <AlertTriangle className="h-4 w-4 text-red-400" />
            </div>
            <div>
              <Badge variant="destructive" className="mb-1">
                Paiement en attente
              </Badge>
              <p className="text-sm text-muted-foreground">
                Mettez à jour votre moyen de paiement pour continuer à utiliser PULSE
              </p>
            </div>
          </div>
          
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={handleOpenPortal}
            disabled={isOpeningPortal}
          >
            {isOpeningPortal ? 'Chargement...' : 'Mettre à jour'}
          </Button>
        </div>
      </div>
    );
  }

  // Active with renewal coming soon
  if (status === 'active' && daysRemaining && daysRemaining <= 7) {
    return (
      <div className="relative bg-gradient-to-r from-green-500/10 via-green-500/5 to-transparent border border-green-500/20 rounded-lg px-4 py-3 mb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/20 rounded-full">
              <CheckCircle2 className="h-4 w-4 text-green-400" />
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="border-green-500/30 text-green-400 bg-green-500/10">
                Abonnement actif
              </Badge>
              {formattedEndDate && (
                <span className="text-sm text-muted-foreground">
                  Renouvellement le {formattedEndDate}
                </span>
              )}
            </div>
          </div>
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleOpenPortal}
            disabled={isOpeningPortal}
            className="text-xs"
          >
            {isOpeningPortal ? 'Chargement...' : 'Gérer'}
          </Button>
        </div>
      </div>
    );
  }

  return null;
};
