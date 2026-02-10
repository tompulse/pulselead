import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { Eye, Trash2, Building2, FileText, CheckCircle2, XCircle } from 'lucide-react';
import { format, isToday, isYesterday } from 'date-fns';
import { fr } from 'date-fns/locale';

interface PipelineDetailSheetProps {
  isOpen: boolean;
  onClose: () => void;
  stageKey: 'devis_a_faire' | 'devis_accepte' | 'devis_refuse' | null;
  userId: string;
  onEntrepriseSelect?: (id: string) => void;
}

const STAGE_CONFIG = {
  devis_a_faire: {
    title: 'Devis à faire',
    icon: FileText,
    color: 'text-indigo-400',
    bgColor: 'bg-indigo-500/20',
  },
  devis_accepte: {
    title: 'Devis accepté',
    icon: CheckCircle2,
    color: 'text-green-400',
    bgColor: 'bg-green-500/20',
  },
  devis_refuse: {
    title: 'Devis refusé',
    icon: XCircle,
    color: 'text-red-400',
    bgColor: 'bg-red-500/20',
  },
};

const formatLeadDate = (dateStr: string) => {
  const date = new Date(dateStr);
  if (isToday(date)) return "Aujourd'hui";
  if (isYesterday(date)) return "Hier";
  return format(date, 'd MMM', { locale: fr });
};

export const PipelineDetailSheet = ({
  isOpen,
  onClose,
  stageKey,
  userId,
  onEntrepriseSelect,
}: PipelineDetailSheetProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const config = stageKey ? STAGE_CONFIG[stageKey] : null;
  const Icon = config?.icon || FileText;

  // Fetch leads with company names
  const { data: leads = [], isLoading } = useQuery({
    queryKey: ['pipeline-leads', userId, stageKey],
    queryFn: async () => {
      if (!stageKey) return [];

      // Fetch leads with this status
      const { data: leadsData, error } = await supabase
        .from('lead_statuts')
        .select('*')
        .eq('user_id', userId)
        .eq('statut', stageKey)
        .order('updated_at', { ascending: false });
      
      if (error) throw error;
      if (!leadsData || leadsData.length === 0) return [];

      // Get company names
      const entrepriseIds = [...new Set(leadsData.map(l => l.entreprise_id))];
      const { data: sites } = await supabase
        .from('nouveaux_sites')
        .select('id, nom, commune, siret')
        .in('id', entrepriseIds);

      // Merge data
      return leadsData.map(lead => ({
        ...lead,
        site: sites?.find(s => s.id === lead.entreprise_id),
      }));
    },
    enabled: isOpen && !!stageKey,
  });

  const handleDelete = async (leadId: string) => {
    setDeletingId(leadId);
    try {
      const { error } = await supabase
        .from('lead_statuts')
        .delete()
        .eq('id', leadId);

      if (error) throw error;

      toast({
        title: 'Lead supprimé',
        description: "Le lead a été retiré du pipeline",
      });

      // Refresh data
      queryClient.invalidateQueries({ queryKey: ['pipeline-leads', userId, stageKey] });
      queryClient.invalidateQueries({ queryKey: ['crm-leads-with-sites', userId] });
    } catch {
      toast({
        title: 'Erreur',
        description: "Impossible de supprimer le lead",
        variant: 'destructive',
      });
    } finally {
      setDeletingId(null);
    }
  };

  const handleViewEntreprise = (entrepriseId: string) => {
    onEntrepriseSelect?.(entrepriseId);
    onClose();
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-md p-0">
        <SheetHeader className="p-6 pb-4 border-b border-border/50">
          <SheetTitle className="flex items-center gap-3">
            {config && (
              <div className={`w-10 h-10 rounded-full ${config.bgColor} flex items-center justify-center`}>
                <Icon className={`w-5 h-5 ${config.color}`} />
              </div>
            )}
            <div>
              <span className="text-lg">{config?.title || 'Pipeline'}</span>
              <p className="text-sm text-muted-foreground font-normal">
                {leads.length} lead{leads.length !== 1 ? 's' : ''}
              </p>
            </div>
          </SheetTitle>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-120px)]">
          <div className="p-4 space-y-3">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin w-6 h-6 border-2 border-accent border-t-transparent rounded-full" />
              </div>
            ) : leads.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Building2 className="w-10 h-10 mx-auto mb-3 opacity-50" />
                <p className="font-medium">Aucun lead</p>
                <p className="text-sm mt-1">Les leads {config?.title?.toLowerCase()} apparaîtront ici</p>
              </div>
            ) : (
              leads.map((lead) => (
                <div
                  key={lead.id}
                  className="p-4 rounded-lg bg-card border border-border/50 hover:border-accent/30 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">
                        {lead.site?.nom || 'Entreprise inconnue'}
                      </p>
                      <p className="text-sm text-muted-foreground truncate">
                        {lead.site?.siret || '—'}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {lead.site?.commune || '—'}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Mis à jour: {formatLeadDate(lead.updated_at)}
                      </p>
                      {lead.notes && (
                        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                          {lead.notes}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-accent hover:text-accent hover:bg-accent/10"
                        onClick={() => handleViewEntreprise(lead.entreprise_id)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleDelete(lead.id)}
                        disabled={deletingId === lead.id}
                      >
                        {deletingId === lead.id ? (
                          <div className="animate-spin w-4 h-4 border-2 border-destructive border-t-transparent rounded-full" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};
