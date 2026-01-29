import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export type PlanType = 'free' | 'pro' | 'teams';

interface UserPlan {
  plan_type: PlanType;
  has_access: boolean;
  prospects_unlocked_count: number; // Renamed to match DB column
  prospects_limit: number;
  tournees_created_count: number; // Renamed to match DB column
  tournees_limit: number;
  subscription_status?: string;
  days_remaining?: number;
  end_date?: string;
}

interface UnlockResult {
  success: boolean;
  limit_reached: boolean;
  message?: string;
  remaining?: number;
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
  const [unlockedProspectIds, setUnlockedProspectIds] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const loadUnlockedProspects = async () => {
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from('user_unlocked_prospects')
        .select('entreprise_id')
        .eq('user_id', userId);

      if (error) throw error;
      
      const ids = new Set(data?.map(item => item.entreprise_id) || []);
      setUnlockedProspectIds(ids);
    } catch (error: any) {
      console.error('Error loading unlocked prospects:', error);
    }
  };

  const checkPlan = async () => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    try {
      // Get user quotas
      const { data: quotaData, error: quotaError } = await supabase
        .from('user_quotas')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (quotaError && quotaError.code !== 'PGRST116') throw quotaError;

      // If no quota exists, create default FREE plan
      if (!quotaData) {
        const { data: newQuota, error: createError } = await supabase
          .from('user_quotas')
          .insert({ user_id: userId, plan_type: 'free' })
          .select()
          .single();

        if (createError) throw createError;

        setUserPlan({
          plan_type: 'free',
          has_access: true,
          prospects_unlocked_count: 0,
          prospects_limit: 30,
          tournees_created_count: 0,
          tournees_limit: 2,
        });
      } else {
        setUserPlan({
          plan_type: quotaData.plan_type as PlanType,
          has_access: true,
          prospects_unlocked_count: quotaData.prospects_unlocked_count || 0,
          prospects_limit: quotaData.plan_type === 'pro' ? 999999 : 30,
          tournees_created_count: quotaData.tournees_created_count || 0,
          tournees_limit: quotaData.plan_type === 'pro' ? 999999 : 2,
        });
      }

      // Load unlocked prospects IDs
      await loadUnlockedProspects();
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

    // Check if PRO user (no limits)
    if (userPlan?.plan_type === 'pro') {
      // PRO users don't need to unlock, they have direct access
      return {
        success: true,
        limit_reached: false,
        remaining: 999999,
        message: 'Accès PRO illimité'
      };
    }

    // Check if already unlocked
    if (unlockedProspectIds.has(entrepriseId)) {
      return {
        success: true,
        limit_reached: false,
        remaining: (userPlan?.prospects_limit || 30) - (userPlan?.prospects_unlocked_count || 0),
        message: 'Déjà débloqué'
      };
    }

    // Check quota limit
    const currentCount = userPlan?.prospects_unlocked_count || 0;
    const limit = userPlan?.prospects_limit || 30;

    if (currentCount >= limit) {
      return {
        success: false,
        limit_reached: true,
        message: `Limite atteinte (${limit}/${limit} prospects débloqués)`,
        unlocked_count: currentCount,
        limit: limit
      };
    }

    try {
      // Insert unlock record
      const { error: insertError } = await supabase
        .from('user_unlocked_prospects')
        .insert({
          user_id: userId,
          entreprise_id: entrepriseId
        });

      if (insertError) {
        // Check if already exists (unique constraint violation)
        if (insertError.code === '23505') {
          setUnlockedProspectIds(prev => new Set(prev).add(entrepriseId));
          return {
            success: true,
            limit_reached: false,
            remaining: limit - currentCount - 1,
            message: 'Déjà débloqué'
          };
        }
        throw insertError;
      }

      // Update quota count
      const { error: updateError } = await supabase
        .from('user_quotas')
        .update({ 
          prospects_unlocked_count: currentCount + 1 
        })
        .eq('user_id', userId);

      if (updateError) throw updateError;

      // Update local state
      setUnlockedProspectIds(prev => new Set(prev).add(entrepriseId));
      if (userPlan) {
        setUserPlan({
          ...userPlan,
          prospects_unlocked_count: currentCount + 1
        });
      }

      return {
        success: true,
        limit_reached: false,
        remaining: limit - currentCount - 1,
        unlocked_count: currentCount + 1,
        limit: limit,
        message: 'Prospect débloqué avec succès'
      };
    } catch (error: any) {
      console.error('Error unlocking prospect:', error);
      return { 
        success: false, 
        limit_reached: false, 
        message: 'Erreur lors du déblocage' 
      };
    }
  };

  // Synchronous check using cached data
  const isProspectUnlocked = (entrepriseId: string): boolean => {
    if (!userId) return false;
    if (!entrepriseId) return false;
    
    // PRO users have access to everything
    if (userPlan?.plan_type === 'pro' || userPlan?.plan_type === 'teams') {
      return true;
    }
    
    // FREE users: STRICTLY check if in the unlocked set
    // If not in set = NOT unlocked = return FALSE
    return unlockedProspectIds.has(entrepriseId);
  };

  const getUnlockedProspects = async (): Promise<Array<{ entreprise_id: string; unlocked_at: string }>> => {
    if (!userId) return [];

    try {
      const { data, error } = await supabase
        .from('user_unlocked_prospects')
        .select('entreprise_id, unlocked_at')
        .eq('user_id', userId)
        .order('unlocked_at', { ascending: false });

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

    // PRO users have unlimited tournees
    if (userPlan?.plan_type === 'pro') {
      return { allowed: true, limit_reached: false, message: 'Accès PRO illimité' };
    }

    const currentCount = userPlan?.tournees_created_count || 0;
    const limit = userPlan?.tournees_limit || 2;

    if (currentCount >= limit) {
      return {
        allowed: false,
        limit_reached: true,
        message: `Limite atteinte (${limit}/${limit} tournées ce mois)`,
        tournees_created: currentCount,
        limit: limit
      };
    }

    return {
      allowed: true,
      limit_reached: false,
      message: 'Quota disponible',
      tournees_created: currentCount,
      limit: limit
    };
  };

  const incrementTourneeQuota = async (): Promise<void> => {
    if (!userId) return;

    // PRO users don't need quota tracking
    if (userPlan?.plan_type === 'pro') return;

    try {
      const currentCount = userPlan?.tournees_created_count || 0;

      const { error } = await supabase
        .from('user_quotas')
        .update({ 
          tournees_created_count: currentCount + 1 
        })
        .eq('user_id', userId);

      if (error) throw error;
      
      // Update local state
      if (userPlan) {
        setUserPlan({
          ...userPlan,
          tournees_created_count: currentCount + 1
        });
      }
    } catch (error: any) {
      console.error('Error incrementing tournee quota:', error);
    }
  };

  const isPro = () => {
    return userPlan?.plan_type === 'pro' || userPlan?.plan_type === 'teams';
  };

  const isFree = () => {
    return userPlan?.plan_type === 'free';
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
    unlockedProspectIds,
  };
};
