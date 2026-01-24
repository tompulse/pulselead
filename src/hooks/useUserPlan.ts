import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export type PlanType = 'free' | 'pro' | 'teams';

interface UserPlan {
  planType: PlanType;
  hasAccess: boolean;
  quotas?: {
    prospects_unlocked: number;
    prospects_limit: number;
    tournees_created: number;
    tournees_limit: number;
  };
  subscriptionStatus?: string;
  daysRemaining?: number;
  endDate?: string;
}

interface UnlockResult {
  success: boolean;
  limit_reached: boolean;
  message?: string;
  unlocked_count?: number;
  limit?: number;
}

interface QuotaCheckResult {
  allowed: boolean;
  limit_reached: boolean;
  message?: string;
  tournees_created?: number;
  limit?: number;
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

  const unlockProspect = async (entrepriseId: string): Promise<UnlockResult> => {
    if (!userId) {
      return { 
        success: false, 
        limit_reached: false, 
        message: 'Utilisateur non connecté' 
      };
    }

    try {
      const { data, error } = await supabase.rpc('unlock_prospect', {
        _user_id: userId,
        _entreprise_id: entrepriseId
      });

      if (error) throw error;
      
      const result = data as UnlockResult;
      
      // Refresh plan to update quotas
      await checkPlan();
      
      return result;
    } catch (error: any) {
      console.error('Error unlocking prospect:', error);
      return { 
        success: false, 
        limit_reached: false, 
        message: 'Erreur lors du déblocage' 
      };
    }
  };

  const isProspectUnlocked = async (entrepriseId: string): Promise<boolean> => {
    if (!userId) return false;

    try {
      const { data, error } = await supabase.rpc('is_prospect_unlocked', {
        _user_id: userId,
        _entreprise_id: entrepriseId
      });

      if (error) throw error;
      
      return data as boolean;
    } catch (error: any) {
      console.error('Error checking if prospect is unlocked:', error);
      return false;
    }
  };

  const getUnlockedProspects = async (): Promise<Array<{ entreprise_id: string; unlocked_at: string }>> => {
    if (!userId) return [];

    try {
      const { data, error } = await supabase.rpc('get_unlocked_prospects', {
        _user_id: userId
      });

      if (error) throw error;
      
      return data || [];
    } catch (error: any) {
      console.error('Error getting unlocked prospects:', error);
      return [];
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
      description: `${feature} est disponible avec le plan PRO à 49€/mois. Cliquez pour upgrader.`,
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
    unlockProspect,
    isProspectUnlocked,
    getUnlockedProspects,
    checkTourneeQuota,
    incrementTourneeQuota,
    showUpgradeMessage,
  };
};
