import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

// Prix ID Stripe - Mode Production - Plan mensuel à 79€/mois
const STRIPE_PRICE_ID = 'price_1SqxKmHjyidZ5i9L8tCztpFU';

export const useStripeCheckout = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const initiateCheckout = async () => {
    setIsLoading(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      
      if (!sessionData.session) {
        // Redirect to auth with return URL to come back and checkout after login
        navigate('/auth?redirect=checkout');
        return;
      }

      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { priceId: STRIPE_PRICE_ID },
      });

      if (error) throw error;

      if (!data?.url) {
        throw new Error('No checkout URL received');
      }

      const checkoutUrl: string = data.url;
      const inIframe = window.self !== window.top;

      // Stripe Checkout ne se charge pas dans une iframe (comme l'aperçu Lovable).
      // On ouvre donc dans un nouvel onglet (ou on "break out" si popup bloquée).
      if (inIframe) {
        const opened = window.open(checkoutUrl, '_blank', 'noopener,noreferrer');
        if (!opened) {
          try {
            window.top!.location.href = checkoutUrl;
          } catch {
            window.location.href = checkoutUrl;
          }
        } else {
          toast({
            title: 'Ouverture du paiement',
            description: "Le paiement s'ouvre dans un nouvel onglet.",
          });
        }
      } else {
        window.location.href = checkoutUrl;
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      toast({
        title: 'Erreur',
        description: error.message || 'Une erreur est survenue lors de la création du paiement',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return { initiateCheckout, isLoading };
};
