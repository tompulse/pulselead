import { supabase } from "@/integrations/supabase/client";

/**
 * Hook pour enregistrer les actions des utilisateurs dans les audit logs
 * 
 * UTILITÉ: Traçabilité complète des actions pour sécurité et conformité
 * 
 * USAGE:
 * const { logAction } = useAuditLog();
 * 
 * logAction('create', 'interaction', interactionId, undefined, interactionData);
 * logAction('update', 'lead_status', leadId, oldStatus, newStatus);
 * logAction('delete', 'tournee', tourneeId);
 * logAction('view', 'entreprise', entrepriseId);
 */

interface AuditLogParams {
  action: 'login' | 'logout' | 'create' | 'update' | 'delete' | 'view' | 'sync';
  resourceType: 'entreprise' | 'interaction' | 'tournee' | 'lead_status' | 'user';
  resourceId?: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
}

export const useAuditLog = () => {
  const logAction = async (
    action: AuditLogParams['action'],
    resourceType: AuditLogParams['resourceType'],
    resourceId?: string,
    oldValues?: Record<string, any>,
    newValues?: Record<string, any>
  ) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.warn('No active session for audit log');
        return;
      }

      await supabase.functions.invoke('audit-logger', {
        body: {
          action,
          resource_type: resourceType,
          resource_id: resourceId,
          old_values: oldValues,
          new_values: newValues,
        },
      });
    } catch (error) {
      // Ne pas bloquer l'application si le logging échoue
      console.error('Error logging audit:', error);
    }
  };

  return { logAction };
};
