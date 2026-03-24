import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import {
  Building2,
  CalendarClock,
  FileText,
  Trash2,
  ChevronDown,
  ChevronUp,
  Clock,
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

type ActionType = 'a_rappeler' | 'a_revoir' | 'rdv';

const ACTION_OPTIONS: {
  key: ActionType;
  label: string;
  activeColor: string;
  inactiveColor: string;
}[] = [
  {
    key: 'a_rappeler',
    label: 'À rappeler',
    activeColor: 'border-blue-500 bg-blue-500/20 text-blue-400',
    inactiveColor: 'border-blue-500/30 text-blue-400/50 hover:border-blue-500/60',
  },
  {
    key: 'a_revoir',
    label: 'À revoir',
    activeColor: 'border-orange-500 bg-orange-500/20 text-orange-400',
    inactiveColor: 'border-orange-500/30 text-orange-400/50 hover:border-orange-500/60',
  },
  {
    key: 'rdv',
    label: 'RDV',
    activeColor: 'border-green-500 bg-green-500/20 text-green-400',
    inactiveColor: 'border-green-500/30 text-green-400/50 hover:border-green-500/60',
  },
];

const interactionToAction = (type: string, statut: string): ActionType => {
  if (type === 'appel' && statut === 'a_rappeler') return 'a_rappeler';
  if (type === 'a_revoir') return 'a_revoir';
  if (type === 'rdv') return 'rdv';
  return 'a_rappeler';
};

const actionToInteraction = (action: ActionType) => {
  if (action === 'a_rappeler') return { type: 'appel', statut: 'a_rappeler' };
  if (action === 'a_revoir') return { type: 'a_revoir', statut: 'en_cours' };
  return { type: 'rdv', statut: 'en_cours' };
};

const actionLabel = (type: string, statut: string) => {
  if (type === 'appel' && statut === 'a_rappeler') return 'À rappeler';
  if (type === 'a_revoir') return 'À revoir';
  if (type === 'rdv') return 'RDV';
  if (type === 'visite') return 'Visité';
  return type;
};

interface CRMProspectFicheDialogProps {
  isOpen: boolean;
  onClose: () => void;
  interactionId: string | null;
  entrepriseId: string | null;
  userId: string;
  onUpdate: () => void;
}

export const CRMProspectFicheDialog = ({
  isOpen,
  onClose,
  interactionId,
  entrepriseId,
  userId,
  onUpdate,
}: CRMProspectFicheDialogProps) => {
  const queryClient = useQueryClient();

  const [nomEntreprise, setNomEntreprise] = useState('');
  const [action, setAction] = useState<ActionType>('a_rappeler');
  const [dateRelance, setDateRelance] = useState('');
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  // Fetch the interaction being edited
  const { data: interaction, isLoading: interactionLoading } = useQuery({
    queryKey: ['crm-fiche-interaction', interactionId],
    queryFn: async () => {
      if (!interactionId) return null;
      const { data, error } = await supabase
        .from('lead_interactions')
        .select('*')
        .eq('id', interactionId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: isOpen && !!interactionId,
  });

  // Fetch the prospect
  const { data: prospect } = useQuery({
    queryKey: ['crm-fiche-prospect', entrepriseId],
    queryFn: async () => {
      if (!entrepriseId) return null;
      const { data, error } = await supabase
        .from('nouveaux_sites')
        .select('id, nom, siret, commune, code_postal, code_naf')
        .eq('id', entrepriseId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: isOpen && !!entrepriseId,
  });

  // Fetch full interaction history for this prospect
  const { data: history = [] } = useQuery({
    queryKey: ['crm-fiche-history', entrepriseId, userId],
    queryFn: async () => {
      if (!entrepriseId) return [];
      const { data, error } = await supabase
        .from('lead_interactions')
        .select('id, type, statut, notes, date_interaction, date_relance')
        .eq('entreprise_id', entrepriseId)
        .eq('user_id', userId)
        .order('date_interaction', { ascending: false });
      if (error) return [];
      return data || [];
    },
    enabled: isOpen && !!entrepriseId,
  });

  // Sync form with fetched interaction
  useEffect(() => {
    if (interaction) {
      setAction(interactionToAction(interaction.type, interaction.statut));
      setNotes(interaction.notes || '');
      if (interaction.date_relance) {
        setDateRelance(new Date(interaction.date_relance).toISOString().slice(0, 16));
      } else {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(9, 0, 0, 0);
        setDateRelance(tomorrow.toISOString().slice(0, 16));
      }
    }
  }, [interaction]);

  useEffect(() => {
    if (prospect) setNomEntreprise(prospect.nom || '');
  }, [prospect]);

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ['crm-interactions', userId] });
    queryClient.invalidateQueries({ queryKey: ['activity-interactions', userId] });
    queryClient.invalidateQueries({ queryKey: ['crm-notes', userId] });
    queryClient.invalidateQueries({ queryKey: ['crm-fiche-interaction', interactionId] });
    queryClient.invalidateQueries({ queryKey: ['crm-fiche-history', entrepriseId, userId] });
  };

  const handleSave = async () => {
    if (!interactionId || !entrepriseId) return;
    setIsSaving(true);
    try {
      const { type, statut } = actionToInteraction(action);

      // Update interaction
      const { error: interactionError } = await supabase
        .from('lead_interactions')
        .update({
          type,
          statut,
          notes: notes.trim() || null,
          date_relance: dateRelance ? new Date(dateRelance).toISOString() : null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', interactionId);

      if (interactionError) throw interactionError;

      // Update prospect name if changed
      const trimmedNom = nomEntreprise.trim();
      if (trimmedNom && trimmedNom !== prospect?.nom) {
        const { error: siteError } = await supabase
          .from('nouveaux_sites')
          .update({ nom: trimmedNom })
          .eq('id', entrepriseId);
        if (siteError) throw siteError;
      }

      toast.success('Fiche enregistrée');
      invalidateAll();
      onUpdate();
      onClose();
    } catch (error: any) {
      toast.error(`Erreur : ${error?.message || "Impossible d'enregistrer"}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!interactionId) return;
    try {
      const { error } = await supabase
        .from('lead_interactions')
        .delete()
        .eq('id', interactionId);
      if (error) throw error;
      toast.success('Interaction supprimée');
      invalidateAll();
      onUpdate();
      onClose();
    } catch (error: any) {
      toast.error(`Erreur : ${error?.message}`);
    }
  };

  const otherInteractions = history.filter((h) => h.id !== interactionId);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        {interactionLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin w-6 h-6 border-2 border-accent border-t-transparent rounded-full" />
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-base">
                <div className="w-7 h-7 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
                  <Building2 className="w-4 h-4 text-accent" />
                </div>
                Fiche prospect
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-1">
              {/* Entreprise */}
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground uppercase tracking-wide">
                  Entreprise
                </Label>
                <Input
                  value={nomEntreprise}
                  onChange={(e) => setNomEntreprise(e.target.value)}
                  className="h-9 font-medium"
                  placeholder="Nom de l'entreprise"
                />
                {(prospect?.commune || prospect?.siret) && (
                  <p className="text-xs text-muted-foreground flex gap-2">
                    {prospect.commune && <span>{prospect.commune}</span>}
                    {prospect.siret && (
                      <span className="font-mono opacity-60">{prospect.siret}</span>
                    )}
                  </p>
                )}
              </div>

              {/* Action */}
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground uppercase tracking-wide">
                  Action de suivi
                </Label>
                <div className="flex gap-2">
                  {ACTION_OPTIONS.map(({ key, label, activeColor, inactiveColor }) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setAction(key)}
                      className={`flex-1 py-2 px-2 rounded-lg border text-xs sm:text-sm font-medium transition-all ${
                        action === key ? activeColor : inactiveColor
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Date & heure */}
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1.5 text-sm">
                  <CalendarClock className="w-3.5 h-3.5 text-muted-foreground" />
                  Date &amp; heure prévue
                </Label>
                <Input
                  type="datetime-local"
                  value={dateRelance}
                  onChange={(e) => setDateRelance(e.target.value)}
                  className="h-9 [color-scheme:dark]"
                />
              </div>

              {/* Notes */}
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1.5 text-sm">
                  <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                  Notes
                </Label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Notes, compte-rendu, besoins identifiés..."
                  className="min-h-[100px] resize-none"
                />
              </div>

              {/* Historique */}
              {otherInteractions.length > 0 && (
                <div className="space-y-1.5">
                  <button
                    type="button"
                    onClick={() => setShowHistory((v) => !v)}
                    className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors w-full"
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span className="uppercase tracking-wide">
                      Historique ({otherInteractions.length} autre{otherInteractions.length > 1 ? 's' : ''})
                    </span>
                    {showHistory ? (
                      <ChevronUp className="w-3.5 h-3.5 ml-auto" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5 ml-auto" />
                    )}
                  </button>

                  {showHistory && (
                    <div className="space-y-1.5 rounded-lg border border-border/40 p-2 max-h-[150px] overflow-y-auto">
                      {otherInteractions.map((h) => (
                        <div
                          key={h.id}
                          className="flex items-start gap-2 text-xs p-2 rounded bg-muted/30"
                        >
                          <div className="flex-1 min-w-0">
                            <span className="font-medium text-foreground/80">
                              {actionLabel(h.type, h.statut)}
                            </span>
                            {h.date_relance && (
                              <span className="text-muted-foreground ml-2">
                                {format(new Date(h.date_relance), 'dd/MM/yy HH:mm', { locale: fr })}
                              </span>
                            )}
                            {h.notes && (
                              <p className="text-muted-foreground truncate mt-0.5">{h.notes}</p>
                            )}
                          </div>
                          <span className="text-muted-foreground/60 shrink-0">
                            {format(new Date(h.date_interaction), 'dd/MM', { locale: fr })}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <DialogFooter className="flex items-center gap-2 pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                className="mr-auto text-destructive hover:text-destructive hover:bg-destructive/10 h-8 px-2"
              >
                <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                Supprimer
              </Button>
              <Button variant="outline" onClick={onClose} disabled={isSaving} className="h-9">
                Annuler
              </Button>
              <Button onClick={handleSave} disabled={isSaving} className="h-9">
                {isSaving ? 'Enregistrement...' : 'Enregistrer'}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
