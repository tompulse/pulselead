import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Building2, User, Phone, Mail, FileText, Zap } from 'lucide-react';

type StatutType = 'a_rappeler' | 'a_revoir' | 'rdv';

interface ProspectionImprevueDialogProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  onSuccess: () => void;
}

const STATUT_OPTIONS: { key: StatutType; label: string; color: string; activeColor: string }[] = [
  {
    key: 'a_rappeler',
    label: 'À rappeler',
    color: 'border-blue-500/30 text-blue-400/60 hover:border-blue-500/60',
    activeColor: 'border-blue-500 bg-blue-500/20 text-blue-400',
  },
  {
    key: 'a_revoir',
    label: 'À revoir',
    color: 'border-orange-500/30 text-orange-400/60 hover:border-orange-500/60',
    activeColor: 'border-orange-500 bg-orange-500/20 text-orange-400',
  },
  {
    key: 'rdv',
    label: 'RDV',
    color: 'border-green-500/30 text-green-400/60 hover:border-green-500/60',
    activeColor: 'border-green-500 bg-green-500/20 text-green-400',
  },
];

const INTERACTION_TYPE_MAP: Record<StatutType, string> = {
  a_rappeler: 'appel',
  a_revoir: 'a_revoir',
  rdv: 'rdv',
};

const INTERACTION_STATUT_MAP: Record<StatutType, string> = {
  a_rappeler: 'a_rappeler',
  a_revoir: 'en_cours',
  rdv: 'en_cours',
};

const LEAD_STATUT_MAP: Record<StatutType, string> = {
  a_rappeler: 'contacte',
  a_revoir: 'qualifie',
  rdv: 'proposition',
};

export const ProspectionImprevueDialog = ({
  isOpen,
  onClose,
  userId,
  onSuccess,
}: ProspectionImprevueDialogProps) => {
  const [entreprise, setEntreprise] = useState('');
  const [interlocuteur, setInterlocuteur] = useState('');
  const [telephone, setTelephone] = useState('');
  const [mail, setMail] = useState('');
  const [notes, setNotes] = useState('');
  const [statut, setStatut] = useState<StatutType>('a_rappeler');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleReset = () => {
    setEntreprise('');
    setInterlocuteur('');
    setTelephone('');
    setMail('');
    setNotes('');
    setStatut('a_rappeler');
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handleSubmit = async () => {
    if (!entreprise.trim()) {
      toast.error('Le nom de l\'entreprise est obligatoire');
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Créer le prospect dans nouveaux_sites
      const { data: newSite, error: siteError } = await supabase
        .from('nouveaux_sites')
        .insert({ nom: entreprise.trim() } as any)
        .select('id')
        .single();

      if (siteError) throw siteError;

      const entrepriseId = newSite.id;

      // 2. Créer le lead_statut
      const { error: statutError } = await supabase.from('lead_statuts').insert({
        entreprise_id: entrepriseId,
        user_id: userId,
        statut: LEAD_STATUT_MAP[statut],
        notes: notes.trim() || null,
      });

      if (statutError) throw statutError;

      // 3. Construire les notes structurées
      const noteLines: string[] = ['📋 Prospection imprévue'];
      if (interlocuteur.trim()) noteLines.push(`👤 ${interlocuteur.trim()}`);
      if (telephone.trim()) noteLines.push(`📞 ${telephone.trim()}`);
      if (mail.trim()) noteLines.push(`📧 ${mail.trim()}`);
      if (notes.trim()) noteLines.push(`💬 ${notes.trim()}`);

      // 4. Créer l'interaction
      const { error: interactionError } = await supabase.from('lead_interactions').insert({
        entreprise_id: entrepriseId,
        user_id: userId,
        type: INTERACTION_TYPE_MAP[statut],
        statut: INTERACTION_STATUT_MAP[statut],
        notes: noteLines.join('\n'),
        date_interaction: new Date().toISOString(),
      });

      if (interactionError) throw interactionError;

      toast.success(`Prospection enregistrée — "${entreprise.trim()}"`);
      onSuccess();
      handleClose();
    } catch (error: any) {
      console.error('[ProspectionImprevue] Error:', error);
      toast.error('Erreur lors de l\'enregistrement');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <div className="w-7 h-7 rounded-full bg-accent/20 flex items-center justify-center">
              <Zap className="w-4 h-4 text-accent" />
            </div>
            Prospection imprévue
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-1">
          {/* Sélecteur de statut */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground uppercase tracking-wide">
              Type de suivi
            </Label>
            <div className="flex gap-2">
              {STATUT_OPTIONS.map(({ key, label, color, activeColor }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setStatut(key)}
                  className={`flex-1 py-2 px-2 rounded-lg border text-xs sm:text-sm font-medium transition-all ${
                    statut === key ? activeColor : color
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Entreprise */}
          <div className="space-y-1.5">
            <Label className="flex items-center gap-1.5 text-sm">
              <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
              Entreprise <span className="text-destructive ml-0.5">*</span>
            </Label>
            <Input
              value={entreprise}
              onChange={(e) => setEntreprise(e.target.value)}
              placeholder="Nom de l'entreprise"
              className="h-9"
              autoFocus
            />
          </div>

          {/* Interlocuteur */}
          <div className="space-y-1.5">
            <Label className="flex items-center gap-1.5 text-sm">
              <User className="w-3.5 h-3.5 text-muted-foreground" />
              Interlocuteur
            </Label>
            <Input
              value={interlocuteur}
              onChange={(e) => setInterlocuteur(e.target.value)}
              placeholder="Prénom Nom"
              className="h-9"
            />
          </div>

          {/* Téléphone + Mail */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5 text-sm">
                <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                Téléphone
              </Label>
              <Input
                type="tel"
                value={telephone}
                onChange={(e) => setTelephone(e.target.value)}
                placeholder="06 00 00 00 00"
                className="h-9"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5 text-sm">
                <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                Mail
              </Label>
              <Input
                type="email"
                value={mail}
                onChange={(e) => setMail(e.target.value)}
                placeholder="contact@..."
                className="h-9"
              />
            </div>
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
              placeholder="Résumé de la rencontre, besoin identifié..."
              className="min-h-[80px] resize-none"
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={handleClose} disabled={isSubmitting} className="flex-1 sm:flex-none">
            Annuler
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !entreprise.trim()}
            className="flex-1 sm:flex-none"
          >
            {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
