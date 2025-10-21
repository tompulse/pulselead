import { useState } from "react";
import { Phone, MapPin, Calendar, StickyNote } from "lucide-react";
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

interface UnifiedCRMActionsProps {
  entrepriseId: string;
  onInteractionAdded: () => void;
  mode?: 'inline' | 'dialog';
  size?: 'sm' | 'lg';
}

export const UnifiedCRMActions = ({
  entrepriseId,
  onInteractionAdded,
  mode = 'dialog',
  size = 'lg',
}: UnifiedCRMActionsProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<'appel' | 'email' | 'visite' | 'rdv' | 'autre'>('appel');
  const [notes, setNotes] = useState('');
  const [prochaine_action, setProchaine_action] = useState('');
  const [date_prochaine_action, setDate_prochaine_action] = useState('');
  const [statut, setStatut] = useState<'a_rappeler' | 'en_cours' | 'gagne' | 'perdu' | 'sans_suite'>('en_cours');
  const [nouveau_statut_lead, setNouveauStatutLead] = useState<'nouveau' | 'contacte' | 'qualifie' | 'proposition' | 'negociation' | 'gagne' | 'perdu'>('contacte');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleQuickAction = (type: typeof selectedType) => {
    setSelectedType(type);
    
    // Smart defaults based on action type
    if (type === 'appel') {
      setProchaine_action('Envoyer email de suivi');
      setNouveauStatutLead('contacte');
    } else if (type === 'visite') {
      setProchaine_action('Envoyer proposition commerciale');
      setNouveauStatutLead('qualifie');
    } else if (type === 'rdv') {
      setProchaine_action('Préparer la présentation');
      setNouveauStatutLead('proposition');
    }
    
    setIsDialogOpen(true);
    setShowSuggestions(true);
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

      const actionMessages = {
        appel: { title: "📞 Appel enregistré !", description: "L'interaction téléphonique a été sauvegardée" },
        email: { title: "✉️ Email enregistré !", description: "Votre échange par email a été enregistré" },
        visite: { title: "🚗 Visite enregistrée !", description: "Votre visite sur site a été documentée" },
        rdv: { title: "📅 Rendez-vous confirmé !", description: "Le rendez-vous a été ajouté à votre suivi" },
        autre: { title: "✅ Note enregistrée !", description: "Votre note a été ajoutée avec succès" },
      };

      const message = actionMessages[selectedType] || actionMessages.autre;

      if (prochaine_action) {
        toast({
          title: message.title,
          description: `${message.description} • Prochaine action : ${prochaine_action}`,
          duration: 2500,
        });
      } else {
        toast({
          title: message.title,
          description: message.description,
          duration: 2500,
        });
      }

      // Reset form
      setNotes('');
      setProchaine_action('');
      setDate_prochaine_action('');
      setStatut('en_cours');
      setNouveauStatutLead('contacte');
      setShowSuggestions(false);
      setIsDialogOpen(false);
      onInteractionAdded();
    } catch (error) {
      console.error('Error saving interaction:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'enregistrer l'interaction",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const suggestions = {
    appel: ['Envoyer email de suivi', 'Planifier un rendez-vous', 'Envoyer la documentation'],
    visite: ['Envoyer proposition commerciale', 'Organiser RDV de closing', 'Demander références'],
    rdv: ['Préparer la présentation', 'Envoyer devis personnalisé', 'Relancer sous 3 jours'],
    autre: ['Faire un suivi', 'Vérifier la disponibilité', 'Relancer'],
  };

  const buttonHeight = size === 'lg' ? 'h-20' : 'h-16';
  const iconSize = size === 'lg' ? 'h-6 w-6' : 'h-5 w-5';
  const textSize = size === 'lg' ? 'text-sm' : 'text-xs';

  return (
    <>
      <div className={`grid ${mode === 'inline' ? 'grid-cols-4' : 'grid-cols-3'} gap-3`}>
        <Button
          variant="outline"
          size={size}
          onClick={() => handleQuickAction('appel')}
          className={`${buttonHeight} flex flex-col items-center justify-center gap-2 border-blue-500/30 hover:bg-blue-500/10 hover:border-blue-500 transition-all group relative overflow-hidden shadow-sm`}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 via-blue-500/5 to-blue-500/0 group-hover:from-blue-500/10 group-hover:to-blue-500/20 transition-all" />
          <Phone className={`${iconSize} text-blue-500 group-hover:scale-110 transition-transform relative z-10`} />
          <span className={`${textSize} font-medium relative z-10`}>Appeler</span>
        </Button>
        <Button
          variant="outline"
          size={size}
          onClick={() => handleQuickAction('visite')}
          className={`${buttonHeight} flex flex-col items-center justify-center gap-2 border-green-500/30 hover:bg-green-500/10 hover:border-green-500 transition-all group relative overflow-hidden shadow-sm`}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/0 via-green-500/5 to-green-500/0 group-hover:from-green-500/10 group-hover:to-green-500/20 transition-all" />
          <MapPin className={`${iconSize} text-green-500 group-hover:scale-110 transition-transform relative z-10`} />
          <span className={`${textSize} font-medium relative z-10`}>Visiter</span>
        </Button>
        <Button
          variant="outline"
          size={size}
          onClick={() => handleQuickAction('rdv')}
          className={`${buttonHeight} flex flex-col items-center justify-center gap-2 border-purple-500/30 hover:bg-purple-500/10 hover:border-purple-500 transition-all group relative overflow-hidden shadow-sm`}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 via-purple-500/5 to-purple-500/0 group-hover:from-purple-500/10 group-hover:to-purple-500/20 transition-all" />
          <Calendar className={`${iconSize} text-purple-500 group-hover:scale-110 transition-transform relative z-10`} />
          <span className={`${textSize} font-medium relative z-10`}>RDV</span>
        </Button>
        {mode === 'inline' && (
          <Button
            variant="outline"
            size={size}
            onClick={() => handleQuickAction('autre')}
            className={`${buttonHeight} flex flex-col items-center justify-center gap-2 border-amber-500/30 hover:bg-amber-500/10 hover:border-amber-500 transition-all group relative overflow-hidden shadow-sm`}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/0 via-amber-500/5 to-amber-500/0 group-hover:from-amber-500/10 group-hover:to-amber-500/20 transition-all" />
            <StickyNote className={`${iconSize} text-amber-500 group-hover:scale-110 transition-transform relative z-10`} />
            <span className={`${textSize} font-medium relative z-10`}>Note</span>
          </Button>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen} modal>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto z-[9999] bg-background" onClick={(e) => e.stopPropagation()}>
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
              {showSuggestions && suggestions[selectedType as keyof typeof suggestions] && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {suggestions[selectedType as keyof typeof suggestions].map((suggestion) => (
                    <Button
                      key={suggestion}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setProchaine_action(suggestion)}
                      className="text-xs h-7 border-accent/30 hover:bg-accent/10"
                    >
                      {suggestion}
                    </Button>
                  ))}
                </div>
              )}
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
