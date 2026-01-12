import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SubscriptionAccess {
  has_access: boolean;
  plan?: 'monthly';
  status?: string; // 'active', 'trialing', 'cancelled', 'past_due'
  days_remaining?: number;
  end_date?: string;
  reason?: string; // 'no_subscription', 'expired', 'cancelled', etc.
  is_returning_user?: boolean; // True if user had a previous subscription
}

export const useSubscription = (userId: string | undefined) => {
  const [access, setAccess] = useState<SubscriptionAccess | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const checkAccess = async () => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.rpc('check_subscription_access', {
        _user_id: userId
      });

      if (error) throw error;
      
      if (data && typeof data === 'object') {
        setAccess(data as unknown as SubscriptionAccess);
      }
    } catch (error: any) {
      console.error('Error checking subscription:', error);
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Impossible de vérifier votre abonnement'
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAccess();
  }, [userId]);

  return {
    hasAccess: access?.has_access || false,
    subscriptionPlan: access?.plan,
    subscriptionStatus: access?.status,
    daysRemaining: access?.days_remaining,
    endDate: access?.end_date,
    reason: access?.reason,
    isReturningUser: access?.is_returning_user || false,
    isLoading,
    refresh: checkAccess
  };
};
