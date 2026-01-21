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

export const useAdminAnalytics = () => {
  // Stats des tournées (toutes les tournées de tous les users)
  const tourneeStats = useQuery({
    queryKey: ['admin-tournee-stats'],
    queryFn: async (): Promise<TourneeStats> => {
      const { data, error } = await supabase
        .from('tournees')
        .select('*');
      
      if (error) throw error;
      
      const tournees = data || [];
      const planifiees = tournees.filter(t => t.statut === 'planifiee').length;
      const enCours = tournees.filter(t => t.statut === 'en_cours').length;
      const terminees = tournees.filter(t => t.statut === 'terminee').length;
      
      const totalKm = tournees.reduce((sum, t) => sum + (Number(t.distance_totale_km) || 0), 0);
      const totalMinutes = tournees.reduce((sum, t) => sum + (Number(t.temps_estime_minutes) || 0), 0);
      const totalStops = tournees.reduce((sum, t) => sum + (t.entreprises_ids?.length || 0), 0);
      
      return {
        total: tournees.length,
        planifiees,
        enCours,
        terminees,
        totalKm: Math.round(totalKm * 10) / 10,
        totalMinutes: Math.round(totalMinutes),
        avgKmPerTournee: tournees.length > 0 ? Math.round((totalKm / tournees.length) * 10) / 10 : 0,
        avgMinutesPerTournee: tournees.length > 0 ? Math.round(totalMinutes / tournees.length) : 0,
        avgStopsPerTournee: tournees.length > 0 ? Math.round((totalStops / tournees.length) * 10) / 10 : 0,
        totalStops,
      };
    },
  });

  // Stats CRM (leads et interactions)
  const crmStats = useQuery({
    queryKey: ['admin-crm-stats'],
    queryFn: async (): Promise<CRMStats> => {
      const [leadsResult, interactionsResult] = await Promise.all([
        supabase.from('lead_statuts').select('*'),
        supabase.from('lead_interactions').select('*'),
      ]);
      
      if (leadsResult.error) throw leadsResult.error;
      if (interactionsResult.error) throw interactionsResult.error;
      
      const leads = leadsResult.data || [];
      const interactions = interactionsResult.data || [];
      
      // Count by status
      const byStatus: Record<string, number> = {};
      leads.forEach(lead => {
        const status = lead.statut || 'nouveau';
        byStatus[status] = (byStatus[status] || 0) + 1;
      });
      
      // Count interactions by type
      const interactionsByType: Record<string, number> = {};
      interactions.forEach(i => {
        const type = i.type || 'autre';
        interactionsByType[type] = (interactionsByType[type] || 0) + 1;
      });
      
      // Count scheduled RDV
      const rdvScheduled = interactions.filter(i => 
        i.type === 'rdv' && i.date_relance && new Date(i.date_relance) >= new Date()
      ).length;
      
      // Count to call (avec relance planifiée)
      const toCall = interactions.filter(i => 
        i.type === 'appel' && i.statut === 'en_cours'
      ).length;
      
      // Count to review
      const toReview = interactions.filter(i => 
        i.statut === 'a_revoir'
      ).length;
      
      // Conversion rate (gagné / total avec statut final)
      const won = byStatus['gagne'] || 0;
      const lost = byStatus['perdu'] || 0;
      const conversionRate = (won + lost) > 0 ? Math.round((won / (won + lost)) * 100) : 0;
      
      return {
        totalLeads: leads.length,
        byStatus,
        totalInteractions: interactions.length,
        interactionsByType,
        rdvScheduled,
        toCall,
        toReview,
        conversionRate,
      };
    },
  });

  // Activity stats (dernières 30 jours)
  const activityStats = useQuery({
    queryKey: ['admin-activity-stats'],
    queryFn: async (): Promise<ActivityStats> => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { data: interactions, error } = await supabase
        .from('lead_interactions')
        .select('*')
        .gte('date_interaction', thirtyDaysAgo.toISOString());
      
      if (error) throw error;
      
      const data = interactions || [];
      
      return {
        visitsCompleted: data.filter(i => i.type === 'visite').length,
        callsMade: data.filter(i => i.type === 'appel').length,
        rdvBooked: data.filter(i => i.type === 'rdv').length,
        notesCreated: data.filter(i => i.notes && i.notes.trim().length > 0).length,
        pendingFollowups: data.filter(i => 
          i.date_relance && new Date(i.date_relance) >= new Date()
        ).length,
      };
    },
  });

  // Time series data (derniers 30 jours)
  const timeSeriesData = useQuery({
    queryKey: ['admin-timeseries'],
    queryFn: async (): Promise<TimeSeriesData[]> => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const [tourneesResult, leadsResult, interactionsResult] = await Promise.all([
        supabase.from('tournees').select('created_at, distance_totale_km').gte('created_at', thirtyDaysAgo.toISOString()),
        supabase.from('lead_statuts').select('created_at').gte('created_at', thirtyDaysAgo.toISOString()),
        supabase.from('lead_interactions').select('date_interaction').gte('date_interaction', thirtyDaysAgo.toISOString()),
      ]);
      
      // Build daily aggregates
      const dailyData: Record<string, TimeSeriesData> = {};
      
      // Initialize all days
      for (let i = 0; i < 30; i++) {
        const date = new Date();
        date.setDate(date.getDate() - (29 - i));
        const key = date.toISOString().split('T')[0];
        dailyData[key] = { date: key, tournees: 0, km: 0, leads: 0, interactions: 0 };
      }
      
      // Aggregate tournees
      (tourneesResult.data || []).forEach(t => {
        const key = new Date(t.created_at).toISOString().split('T')[0];
        if (dailyData[key]) {
          dailyData[key].tournees++;
          dailyData[key].km += Number(t.distance_totale_km) || 0;
        }
      });
      
      // Aggregate leads
      (leadsResult.data || []).forEach(l => {
        const key = new Date(l.created_at).toISOString().split('T')[0];
        if (dailyData[key]) {
          dailyData[key].leads++;
        }
      });
      
      // Aggregate interactions
      (interactionsResult.data || []).forEach(i => {
        const key = new Date(i.date_interaction).toISOString().split('T')[0];
        if (dailyData[key]) {
          dailyData[key].interactions++;
        }
      });
      
      return Object.values(dailyData).sort((a, b) => a.date.localeCompare(b.date));
    },
  });

  // Users activity summary
  const usersActivity = useQuery({
    queryKey: ['admin-users-activity'],
    queryFn: async (): Promise<UserActivity[]> => {
      const [tourneesResult, leadsResult, interactionsResult] = await Promise.all([
        supabase.from('tournees').select('user_id, created_at'),
        supabase.from('lead_statuts').select('user_id'),
        supabase.from('lead_interactions').select('user_id, date_interaction'),
      ]);
      
      const usersMap: Record<string, UserActivity> = {};
      
      // Aggregate tournees per user
      (tourneesResult.data || []).forEach(t => {
        if (!usersMap[t.user_id]) {
          usersMap[t.user_id] = { userId: t.user_id, tourneesCount: 0, leadsCount: 0, interactionsCount: 0 };
        }
        usersMap[t.user_id].tourneesCount++;
        const createdAt = t.created_at;
        if (!usersMap[t.user_id].lastActivity || createdAt > usersMap[t.user_id].lastActivity!) {
          usersMap[t.user_id].lastActivity = createdAt;
        }
      });
      
      // Aggregate leads per user
      (leadsResult.data || []).forEach(l => {
        if (!usersMap[l.user_id]) {
          usersMap[l.user_id] = { userId: l.user_id, tourneesCount: 0, leadsCount: 0, interactionsCount: 0 };
        }
        usersMap[l.user_id].leadsCount++;
      });
      
      // Aggregate interactions per user
      (interactionsResult.data || []).forEach(i => {
        if (!usersMap[i.user_id]) {
          usersMap[i.user_id] = { userId: i.user_id, tourneesCount: 0, leadsCount: 0, interactionsCount: 0 };
        }
        usersMap[i.user_id].interactionsCount++;
        const dateInteraction = i.date_interaction;
        if (!usersMap[i.user_id].lastActivity || dateInteraction > usersMap[i.user_id].lastActivity!) {
          usersMap[i.user_id].lastActivity = dateInteraction;
        }
      });
      
      return Object.values(usersMap).sort((a, b) => 
        (b.tourneesCount + b.leadsCount + b.interactionsCount) - 
        (a.tourneesCount + a.leadsCount + a.interactionsCount)
      );
    },
  });

  return {
    tourneeStats,
    crmStats,
    activityStats,
    timeSeriesData,
    usersActivity,
    isLoading: tourneeStats.isLoading || crmStats.isLoading || activityStats.isLoading,
  };
};
