import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface NotificationPermission {
  permission: 'granted' | 'denied' | 'default';
  isSupported: boolean;
}

interface Reminder {
  id: string;
  entreprise_id: string;
  entreprise_nom: string;
  date_relance: string;
  notes: string | null;
  type: string;
}

export const useNotifications = (userId: string | undefined) => {
  const [permission, setPermission] = useState<NotificationPermission>({
    permission: 'default',
    isSupported: false,
  });
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Check if notifications are supported
  useEffect(() => {
    const isSupported = 'Notification' in window && 'serviceWorker' in navigator;
    setPermission({
      permission: isSupported ? Notification.permission : 'denied',
      isSupported,
    });
  }, []);

  // Request notification permission
  const requestPermission = useCallback(async () => {
    if (!permission.isSupported) {
      toast({
        title: 'Notifications non supportées',
        description: 'Votre navigateur ne supporte pas les notifications push',
        variant: 'destructive',
      });
      return false;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(prev => ({ ...prev, permission: result }));
      
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
  }, [permission.isSupported, toast]);

  // Fetch upcoming reminders
  const fetchReminders = useCallback(async () => {
    if (!userId) return;
    
    setIsLoading(true);
    try {
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

      if (data && data.length > 0) {
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
        
        const remindersWithNames = filteredData.map(r => ({
          ...r,
          entreprise_nom: entrepriseMap.get(r.entreprise_id) || 'Entreprise inconnue',
        }));
        
        setReminders(remindersWithNames);
      } else {
        setReminders([]);
      }
    } catch (error) {
      console.error('Error fetching reminders:', error);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // Send a local notification
  const sendNotification = useCallback((title: string, body: string, data?: any) => {
    if (permission.permission !== 'granted') return;

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
  }, [permission.permission]);

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

  // Initial fetch
  useEffect(() => {
    fetchReminders();
  }, [fetchReminders]);

  // Check for due reminders every minute
  useEffect(() => {
    if (permission.permission !== 'granted' || reminders.length === 0) return;

    const interval = setInterval(() => {
      checkDueReminders();
    }, 60000); // Check every minute

    // Check immediately on mount
    checkDueReminders();

    return () => clearInterval(interval);
  }, [permission.permission, reminders, checkDueReminders]);

  // Delete a reminder
  const deleteReminder = useCallback(async (reminderId: string) => {
    try {
      const { error } = await supabase
        .from('lead_interactions')
        .delete()
        .eq('id', reminderId);

      if (error) throw error;

      // Remove from local state
      setReminders(prev => prev.filter(r => r.id !== reminderId));
      
      toast({
        title: 'Relance supprimée',
        description: 'La relance a été retirée de votre liste',
      });
      
      return true;
    } catch (error) {
      console.error('Error deleting reminder:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer la relance',
        variant: 'destructive',
      });
      return false;
    }
  }, [toast]);

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
