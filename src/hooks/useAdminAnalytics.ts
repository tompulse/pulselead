import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface TourneeStats {
  total: number;
  planifiees: number;
  enCours: number;
  terminees: number;
  totalKm: number;
  totalMinutes: number;
  avgKmPerTournee: number;
  avgMinutesPerTournee: number;
  avgStopsPerTournee: number;
  totalStops: number;
}

export interface CRMStats {
  totalLeads: number;
  byStatus: Record<string, number>;
  totalInteractions: number;
  interactionsByType: Record<string, number>;
  rdvScheduled: number;
  toCall: number;
  toReview: number;
  conversionRate: number;
}

export interface ActivityStats {
  visitsCompleted: number;
  callsMade: number;
  rdvBooked: number;
  notesCreated: number;
  pendingFollowups: number;
}

export interface TimeSeriesData {
  date: string;
  tournees: number;
  km: number;
  leads: number;
  interactions: number;
}

export interface UserActivity {
  userId: string;
  email?: string;
  tourneesCount: number;
  leadsCount: number;
  interactionsCount: number;
  lastActivity?: string;
}

export interface RecentTournee {
  id: string;
  nom: string;
  date_planifiee: string;
  statut: string;
  distance_totale_km: number | null;
  temps_estime_minutes: number | null;
  stops_count: number;
  user_id: string;
  created_at: string;
}

export const useAdminAnalytics = () => {
  // Stats des tournées via fonction admin sécurisée
  const tourneeStats = useQuery({
    queryKey: ['admin-tournee-stats'],
    queryFn: async (): Promise<{ stats: TourneeStats; recentTournees: RecentTournee[] }> => {
      const { data, error } = await supabase.rpc('get_admin_tournee_stats');
      
      if (error) {
        console.error('Error fetching tournee stats:', error);
        throw error;
      }
      
      const result = data as any;
      const total = result?.total || 0;
      const totalKm = Number(result?.total_km) || 0;
      const totalMinutes = Number(result?.total_minutes) || 0;
      const totalStops = Number(result?.total_stops) || 0;
      
      return {
        stats: {
          total,
          planifiees: result?.planifiees || 0,
          enCours: result?.en_cours || 0,
          terminees: result?.terminees || 0,
          totalKm: Math.round(totalKm * 10) / 10,
          totalMinutes: Math.round(totalMinutes),
          avgKmPerTournee: total > 0 ? Math.round((totalKm / total) * 10) / 10 : 0,
          avgMinutesPerTournee: total > 0 ? Math.round(totalMinutes / total) : 0,
          avgStopsPerTournee: total > 0 ? Math.round((totalStops / total) * 10) / 10 : 0,
          totalStops,
        },
        recentTournees: result?.tournees || [],
      };
    },
  });

  // Stats CRM via fonction admin sécurisée
  const crmStats = useQuery({
    queryKey: ['admin-crm-stats'],
    queryFn: async (): Promise<CRMStats> => {
      const { data, error } = await supabase.rpc('get_admin_crm_stats');
      
      if (error) {
        console.error('Error fetching CRM stats:', error);
        throw error;
      }
      
      const result = data as any;
      const byStatus = result?.by_status || {};
      
      // Conversion rate (gagné / total avec statut final)
      const won = byStatus['gagne'] || 0;
      const lost = byStatus['perdu'] || 0;
      const conversionRate = (won + lost) > 0 ? Math.round((won / (won + lost)) * 100) : 0;
      
      return {
        totalLeads: result?.total_leads || 0,
        byStatus,
        totalInteractions: result?.total_interactions || 0,
        interactionsByType: result?.by_interaction_type || {},
        rdvScheduled: result?.rdv_scheduled || 0,
        toCall: result?.to_call || 0,
        toReview: 0,
        conversionRate,
      };
    },
  });

  // Activity stats (calcul depuis CRM stats)
  const activityStats = useQuery({
    queryKey: ['admin-activity-stats'],
    queryFn: async (): Promise<ActivityStats> => {
      const { data, error } = await supabase.rpc('get_admin_crm_stats');
      
      if (error) throw error;
      
      const result = data as any;
      const byType = result?.by_interaction_type || {};
      
      return {
        visitsCompleted: byType['visite'] || 0,
        callsMade: byType['appel'] || 0,
        rdvBooked: byType['rdv'] || 0,
        notesCreated: byType['note'] || 0,
        pendingFollowups: result?.pending_followups || 0,
      };
    },
  });

  // Time series data via fonction admin sécurisée
  const timeSeriesData = useQuery({
    queryKey: ['admin-timeseries'],
    queryFn: async (): Promise<TimeSeriesData[]> => {
      const { data, error } = await supabase.rpc('get_admin_timeseries');
      
      if (error) {
        console.error('Error fetching timeseries:', error);
        throw error;
      }
      
      return (data as any[]) || [];
    },
  });

  // Users activity via fonction admin sécurisée
  const usersActivity = useQuery({
    queryKey: ['admin-users-activity'],
    queryFn: async (): Promise<UserActivity[]> => {
      const { data, error } = await supabase.rpc('get_admin_users_activity');
      
      if (error) {
        console.error('Error fetching users activity:', error);
        throw error;
      }
      
      return ((data as any[]) || []).map((u: any) => ({
        userId: u.user_id,
        tourneesCount: u.tournees_count || 0,
        leadsCount: u.leads_count || 0,
        interactionsCount: u.interactions_count || 0,
        lastActivity: u.last_activity,
      }));
    },
  });

  return {
    tourneeStats: {
      ...tourneeStats,
      data: tourneeStats.data?.stats,
    },
    recentTournees: tourneeStats.data?.recentTournees || [],
    crmStats,
    activityStats,
    timeSeriesData,
    usersActivity,
    isLoading: tourneeStats.isLoading || crmStats.isLoading || activityStats.isLoading,
  };
};
