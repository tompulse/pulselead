import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageSquare, Building2, MapPin, Trash2, Pencil, Check, X } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface NotesDetailSheetProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  onEntrepriseSelect?: (entrepriseId: string) => void;
}

interface NoteWithSite {
  id: string;
  entreprise_id: string;
  notes: string | null;
  updated_at: string;
  site?: {
    id: string;
    nom: string;
    ville: string | null;
  };
}

export const NotesDetailSheet = ({
  isOpen,
  onClose,
  userId,
  onEntrepriseSelect,
}: NotesDetailSheetProps) => {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedNote, setEditedNote] = useState('');

  // Fetch all interactions with notes
  const { data: notesWithSites = [], isLoading } = useQuery({
    queryKey: ['crm-notes', userId],
    queryFn: async () => {
      const { data: interactions, error } = await supabase
        .from('lead_interactions')
        .select('id, entreprise_id, notes, updated_at')
        .eq('user_id', userId)
        .not('notes', 'is', null)
        .neq('notes', '')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      if (!interactions || interactions.length === 0) return [];

      const entrepriseIds = [...new Set(interactions.map(i => i.entreprise_id))];

      const { data: sites } = await supabase
        .from('nouveaux_sites')
        .select('id, nom, ville')
        .in('id', entrepriseIds);

      const notesWithSiteInfo: NoteWithSite[] = interactions.map(interaction => ({
        ...interaction,
        site: sites?.find(s => s.id === interaction.entreprise_id),
      }));

      return notesWithSiteInfo;
    },
    enabled: isOpen,
  });

  // Update note mutation
  const updateNoteMutation = useMutation({
    mutationFn: async ({ id, notes }: { id: string; notes: string }) => {
      const { error } = await supabase
        .from('lead_interactions')
        .update({ notes, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-notes', userId] });
      queryClient.invalidateQueries({ queryKey: ['crm-interactions', userId] });
      queryClient.invalidateQueries({ queryKey: ['notification-reminders', userId] });
      setEditingId(null);
      toast.success('Note mise à jour');
    },
    onError: () => {
      toast.error('Erreur lors de la mise à jour');
    },
  });

  // Delete note mutation
  const deleteNoteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('lead_interactions')
        .update({ notes: null, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-notes', userId] });
      queryClient.invalidateQueries({ queryKey: ['crm-interactions', userId] });
      queryClient.invalidateQueries({ queryKey: ['notification-reminders', userId] });
      toast.success('Note supprimée');
    },
    onError: () => {
      toast.error('Erreur lors de la suppression');
    },
  });

  const handleStartEdit = (note: NoteWithSite) => {
    setEditingId(note.id);
    setEditedNote(note.notes || '');
  };

  const handleSaveEdit = (id: string) => {
    if (editedNote.trim()) {
      updateNoteMutation.mutate({ id, notes: editedNote.trim() });
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditedNote('');
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-yellow-400" />
            Notes sur les prospects
          </SheetTitle>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-100px)] mt-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin w-6 h-6 border-2 border-accent border-t-transparent rounded-full" />
            </div>
          ) : notesWithSites.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Aucune note enregistrée</p>
              <p className="text-sm mt-1">Ajoutez des notes depuis vos tournées</p>
            </div>
          ) : (
            <div className="space-y-3 pr-4">
              {notesWithSites.map((note) => (
                <div
                  key={note.id}
                  className="p-4 rounded-lg bg-card/50 border border-accent/10 hover:border-accent/30 transition-colors"
                >
                  {/* Header with company info */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-accent shrink-0" />
                        <span className="font-medium text-sm truncate">
                          {note.site?.nom || 'Entreprise inconnue'}
                        </span>
                      </div>
                      {note.site?.ville && (
                        <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                          <MapPin className="w-3 h-3" />
                          <span>{note.site.ville}</span>
                        </div>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {format(new Date(note.updated_at), 'dd/MM/yy', { locale: fr })}
                    </span>
                  </div>

                  {/* Note content */}
                  {editingId === note.id ? (
                    <div className="mt-3">
                      <Textarea
                        value={editedNote}
                        onChange={(e) => setEditedNote(e.target.value)}
                        className="min-h-[80px] text-sm bg-background/50"
                        placeholder="Votre note..."
                      />
                      <div className="flex items-center gap-2 mt-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleSaveEdit(note.id)}
                          className="h-7 text-green-500 hover:text-green-400 hover:bg-green-500/10"
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Enregistrer
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={handleCancelEdit}
                          className="h-7"
                        >
                          <X className="w-4 h-4 mr-1" />
                          Annuler
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm text-muted-foreground mt-2 whitespace-pre-wrap">
                        {note.notes}
                      </p>

                      {/* Actions */}
                      <div className="flex items-center gap-2 mt-3 pt-2 border-t border-accent/10">
                        {onEntrepriseSelect && note.site && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              onEntrepriseSelect(note.entreprise_id);
                              onClose();
                            }}
                            className="h-7 text-xs"
                          >
                            <Building2 className="w-3 h-3 mr-1" />
                            Voir
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleStartEdit(note)}
                          className="h-7 text-xs"
                        >
                          <Pencil className="w-3 h-3 mr-1" />
                          Modifier
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="w-3 h-3 mr-1" />
                              Supprimer
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Supprimer cette note ?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Cette action est irréversible.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Annuler</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteNoteMutation.mutate(note.id)}
                                className="bg-destructive hover:bg-destructive/90"
                              >
                                Supprimer
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};
