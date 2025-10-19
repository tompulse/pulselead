import { useState } from "react";
import { Phone, Mail, MapPin, Calendar, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface QuickActionButtonsProps {
  entrepriseId: string;
  onInteractionAdded: () => void;
}

export const QuickActionButtons = ({
  entrepriseId,
  onInteractionAdded,
}: QuickActionButtonsProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<'appel' | 'email' | 'visite' | 'rdv' | 'autre'>('appel');
  const [notes, setNotes] = useState('');
  const [prochaine_action, setProchaine_action] = useState('');
  const [date_prochaine_action, setDate_prochaine_action] = useState('');
  const [statut, setStatut] = useState<'a_rappeler' | 'en_cours' | 'gagne' | 'perdu' | 'sans_suite'>('en_cours');
  const [nouveau_statut_lead, setNouveauStatutLead] = useState<'nouveau' | 'contacte' | 'qualifie' | 'proposition' | 'negociation' | 'gagne' | 'perdu'>('contacte');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleQuickAction = (type: typeof selectedType) => {
    setSelectedType(type);
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      const { error } = await supabase.functions.invoke('sync-interaction', {
        body: {
          entreprise_id: entrepriseId,
          type: selectedType,
          statut,
          notes: notes || undefined,
          prochaine_action: prochaine_action || undefined,
          date_prochaine_action: date_prochaine_action || undefined,
          nouveau_statut_lead,
        },
      });

      if (error) throw error;

      toast({
        title: "Interaction enregistrée",
        description: "L'interaction a été ajoutée avec succès",
      });

      // Reset form
      setNotes('');
      setProchaine_action('');
      setDate_prochaine_action('');
      setStatut('en_cours');
      setNouveauStatutLead('contacte');
      setIsDialogOpen(false);
      onInteractionAdded();
    } catch (error) {
      console.error('Error saving interaction:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'enregistrer l'interaction",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        <Button
          variant="outline"
          size="lg"
          onClick={() => handleQuickAction('appel')}
          className="h-20 flex flex-col items-center justify-center gap-2 border-accent/30 hover:bg-accent/10 hover:border-accent transition-all group"
        >
          <Phone className="h-6 w-6 text-accent group-hover:scale-110 transition-transform" />
          <span className="text-sm font-medium">Appel</span>
        </Button>
        <Button
          variant="outline"
          size="lg"
          onClick={() => handleQuickAction('email')}
          className="h-20 flex flex-col items-center justify-center gap-2 border-accent/30 hover:bg-accent/10 hover:border-accent transition-all group"
        >
          <Mail className="h-6 w-6 text-accent group-hover:scale-110 transition-transform" />
          <span className="text-sm font-medium">Email</span>
        </Button>
        <Button
          variant="outline"
          size="lg"
          onClick={() => handleQuickAction('visite')}
          className="h-20 flex flex-col items-center justify-center gap-2 border-accent/30 hover:bg-accent/10 hover:border-accent transition-all group"
        >
          <MapPin className="h-6 w-6 text-accent group-hover:scale-110 transition-transform" />
          <span className="text-sm font-medium">Visite</span>
        </Button>
        <Button
          variant="outline"
          size="lg"
          onClick={() => handleQuickAction('rdv')}
          className="h-20 flex flex-col items-center justify-center gap-2 border-accent/30 hover:bg-accent/10 hover:border-accent transition-all group"
        >
          <Calendar className="h-6 w-6 text-accent group-hover:scale-110 transition-transform" />
          <span className="text-sm font-medium">RDV</span>
        </Button>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen} modal>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto z-[9999] bg-background"  onClick={(e) => e.stopPropagation()}>
          <DialogHeader>
            <DialogTitle>Enregistrer une interaction</DialogTitle>
            <DialogDescription>
              Ajoutez les détails de votre interaction avec cette entreprise
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Statut de l'interaction</Label>
              <Select value={statut} onValueChange={(v: any) => setStatut(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en_cours">En cours</SelectItem>
                  <SelectItem value="a_rappeler">À rappeler</SelectItem>
                  <SelectItem value="gagne">Gagné</SelectItem>
                  <SelectItem value="perdu">Perdu</SelectItem>
                  <SelectItem value="sans_suite">Sans suite</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Statut du lead</Label>
              <Select value={nouveau_statut_lead} onValueChange={(v: any) => setNouveauStatutLead(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nouveau">Nouveau</SelectItem>
                  <SelectItem value="contacte">Contacté</SelectItem>
                  <SelectItem value="qualifie">Qualifié</SelectItem>
                  <SelectItem value="proposition">Proposition envoyée</SelectItem>
                  <SelectItem value="negociation">En négociation</SelectItem>
                  <SelectItem value="gagne">Gagné</SelectItem>
                  <SelectItem value="perdu">Perdu</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Décrivez votre interaction..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="prochaine_action">Prochaine action</Label>
              <Input
                id="prochaine_action"
                placeholder="Ex: Envoyer la proposition commerciale"
                value={prochaine_action}
                onChange={(e) => setProchaine_action(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date_prochaine_action">Date de la prochaine action</Label>
              <Input
                id="date_prochaine_action"
                type="datetime-local"
                value={date_prochaine_action}
                onChange={(e) => setDate_prochaine_action(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSubmitting}>
              Annuler
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
