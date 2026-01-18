import { useCallback } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Reminder {
  id: string;
  entreprise_id: string;
  entreprise_nom: string;
  date_relance: string;
  notes: string | null;
  type: string;
}

export const useNotifications = (userId: string | undefined) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Use react-query for reminders to enable bidirectional sync with CRM
  const { data: reminders = [], isLoading, refetch: fetchReminders } = useQuery({
    queryKey: ['notification-reminders', userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];
      
      // Fetch all interactions with types 'a_rappeler', 'a_revoir', 'rdv'
      // Include those with future dates OR without dates (to not lose them)
      const { data, error } = await supabase
        .from('lead_interactions')
        .select(`
          id,
          entreprise_id,
          date_relance,
          notes,
          type
        `)
        .eq('user_id', userId)
        .in('type', ['a_rappeler', 'a_revoir', 'rdv'])
        .order('date_relance', { ascending: true, nullsFirst: false });

      if (error) throw error;

      if (!data || data.length === 0) return [];

      // Filter: future dates OR no date set
      const filteredData = data.filter(r => {
        if (!r.date_relance) return true; // Show those without date
        return r.date_relance >= todayStr; // Show future dates
      });

      const entrepriseIds = [...new Set(filteredData.map(r => r.entreprise_id))];
      const { data: entreprises } = await supabase
        .from('nouveaux_sites')
        .select('id, nom')
        .in('id', entrepriseIds);

      const entrepriseMap = new Map(entreprises?.map(e => [e.id, e.nom]) || []);
      
      const remindersWithNames: Reminder[] = filteredData.map(r => ({
        ...r,
        entreprise_nom: entrepriseMap.get(r.entreprise_id) || 'Entreprise inconnue',
      }));
      
      return remindersWithNames;
    },
    enabled: !!userId,
    staleTime: 30000, // 30 seconds
  });

  // Delete reminder mutation
  const deleteReminderMutation = useMutation({
    mutationFn: async (reminderId: string) => {
      const { error } = await supabase
        .from('lead_interactions')
        .delete()
        .eq('id', reminderId);

      if (error) throw error;
    },
    onSuccess: () => {
      // Invalidate all related queries for bidirectional sync
      queryClient.invalidateQueries({ queryKey: ['notification-reminders', userId] });
      queryClient.invalidateQueries({ queryKey: ['crm-interactions', userId] });
      queryClient.invalidateQueries({ queryKey: ['crm-notes', userId] });
      queryClient.invalidateQueries({ queryKey: ['activity-interactions'] });
      
      toast({
        title: 'Relance supprimée',
        description: 'La relance a été retirée de votre liste',
      });
    },
    onError: (error) => {
      console.error('Error deleting reminder:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer la relance',
        variant: 'destructive',
      });
    },
  });

  const deleteReminder = useCallback(async (reminderId: string) => {
    try {
      await deleteReminderMutation.mutateAsync(reminderId);
      return true;
    } catch {
      return false;
    }
  }, [deleteReminderMutation]);

  // Send a local notification
  const sendNotification = useCallback((title: string, body: string, data?: any) => {
    if (!('Notification' in window) || Notification.permission !== 'granted') return;

    try {
      const notification = new Notification(title, {
        body,
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        tag: data?.id || 'pulse-reminder',
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  }, []);

  // Request notification permission
  const requestPermission = useCallback(async () => {
    const isSupported = 'Notification' in window && 'serviceWorker' in navigator;
    
    if (!isSupported) {
      toast({
        title: 'Notifications non supportées',
        description: 'Votre navigateur ne supporte pas les notifications push',
        variant: 'destructive',
      });
      return false;
    }

    try {
      const result = await Notification.requestPermission();
      
      if (result === 'granted') {
        toast({
          title: 'Notifications activées ✅',
          description: 'Vous recevrez des rappels pour vos relances',
        });
        return true;
      } else {
        toast({
          title: 'Notifications refusées',
          description: 'Vous ne recevrez pas de rappels push',
          variant: 'destructive',
        });
        return false;
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }, [toast]);

  // Check for due reminders and notify
  const checkDueReminders = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    const dueToday = reminders.filter(r => r.date_relance === today);
    
    dueToday.forEach(reminder => {
      sendNotification(
        '📞 Relance à faire',
        `${reminder.entreprise_nom}${reminder.notes ? `: ${reminder.notes.substring(0, 50)}...` : ''}`,
        { id: reminder.id, entreprise_id: reminder.entreprise_id }
      );
    });

    return dueToday.length;
  }, [reminders, sendNotification]);

  // Permission state
  const isSupported = typeof window !== 'undefined' && 'Notification' in window && 'serviceWorker' in navigator;
  const permission = {
    permission: isSupported ? Notification.permission : 'denied' as NotificationPermission,
    isSupported,
  };

  return {
    permission,
    reminders,
    isLoading,
    requestPermission,
    fetchReminders,
    sendNotification,
    checkDueReminders,
    deleteReminder,
    todayReminders: reminders.filter(r => r.date_relance === new Date().toISOString().split('T')[0]),
  };
};
