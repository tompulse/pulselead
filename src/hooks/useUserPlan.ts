import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export type PlanType = 'free' | 'pro' | 'teams';

interface UserPlan {
  planType: PlanType;
  hasAccess: boolean;
  quotas?: {
    prospects_viewed: number;
    prospects_limit: number;
    tournees_created: number;
    tournees_limit: number;
    crm_reminders_enabled: boolean;
  };
  subscriptionStatus?: string;
  daysRemaining?: number;
  endDate?: string;
}

interface QuotaCheckResult {
  allowed: boolean;
  limit_reached: boolean;
  message?: string;
}

export const useUserPlan = (userId: string | undefined) => {
  const [userPlan, setUserPlan] = useState<UserPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const checkPlan = async () => {
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
        const accessData = data as any;
        setUserPlan({
          planType: accessData.plan_type || 'free',
          hasAccess: accessData.has_access || false,
          quotas: accessData.quotas,
          subscriptionStatus: accessData.status,
          daysRemaining: accessData.days_remaining,
          endDate: accessData.end_date
        });
      }
    } catch (error: any) {
      console.error('Error checking plan:', error);
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Impossible de vérifier votre plan'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const checkProspectQuota = async (department: string): Promise<QuotaCheckResult> => {
    if (!userId) {
      return { allowed: false, limit_reached: true, message: 'Utilisateur non connecté' };
    }

    try {
      const { data, error } = await supabase.rpc('increment_prospect_quota', {
        _user_id: userId,
        _department: department
      });

      if (error) throw error;
      
      return data as QuotaCheckResult;
    } catch (error: any) {
      console.error('Error checking prospect quota:', error);
      return { allowed: false, limit_reached: true, message: 'Erreur de vérification' };
    }
  };

  const checkTourneeQuota = async (): Promise<QuotaCheckResult> => {
    if (!userId) {
      return { allowed: false, limit_reached: true, message: 'Utilisateur non connecté' };
    }

    try {
      const { data, error } = await supabase.rpc('check_tournee_quota', {
        _user_id: userId
      });

      if (error) throw error;
      
      return data as QuotaCheckResult;
    } catch (error: any) {
      console.error('Error checking tournee quota:', error);
      return { allowed: false, limit_reached: true, message: 'Erreur de vérification' };
    }
  };

  const incrementTourneeQuota = async (): Promise<void> => {
    if (!userId) return;

    try {
      const { error } = await supabase.rpc('increment_tournee_quota', {
        _user_id: userId
      });

      if (error) throw error;
      
      // Refresh plan data to update quotas
      await checkPlan();
    } catch (error: any) {
      console.error('Error incrementing tournee quota:', error);
    }
  };

  const isPro = () => {
    return userPlan?.planType === 'pro' || userPlan?.planType === 'teams';
  };

  const isFree = () => {
    return userPlan?.planType === 'free';
  };

  const showUpgradeMessage = (feature: string) => {
    toast({
      title: '✨ Fonctionnalité PRO',
      description: `${feature} est disponible avec le plan PRO à 49€/mois`,
      action: (
        <button
          onClick={() => window.location.href = '/#pricing'}
          className="bg-accent text-black px-4 py-2 rounded-lg font-semibold hover:bg-accent/90 transition"
        >
          Passer à PRO
        </button>
      ),
      duration: 5000,
    });
  };

  useEffect(() => {
    checkPlan();
  }, [userId]);

  return {
    userPlan,
    isLoading,
    isPro: isPro(),
    isFree: isFree(),
    refresh: checkPlan,
    checkProspectQuota,
    checkTourneeQuota,
    incrementTourneeQuota,
    showUpgradeMessage,
  };
};
