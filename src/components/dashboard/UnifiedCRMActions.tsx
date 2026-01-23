import { useState, useEffect } from "react";
import { MapPin, Calendar, StickyNote } from "lucide-react";
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
  const [selectedType, setSelectedType] = useState<'visite' | 'rdv' | 'autre'>('visite');
  const [notes, setNotes] = useState('');
  const [prochaine_action, setProchaine_action] = useState('');
  const [date_relance, setDate_relance] = useState('');
  const [statut, setStatut] = useState<'a_rappeler' | 'en_cours' | 'gagne' | 'perdu' | 'sans_suite'>('en_cours');
  const [nouveau_statut_lead, setNouveauStatutLead] = useState<'nouveau' | 'contacte' | 'qualifie' | 'proposition' | 'negociation' | 'gagne' | 'perdu'>('contacte');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Auto-show date field when statut is "a_rappeler"
  const showDateField = statut === 'a_rappeler' || selectedType === 'rdv';

  // Set default date when switching to a_rappeler
  useEffect(() => {
    if (statut === 'a_rappeler' && !date_relance) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setDate_relance(tomorrow.toISOString().slice(0, 16));
    }
  }, [statut, date_relance]);

  const handleQuickAction = (type: typeof selectedType) => {
    setSelectedType(type);
    
    // Smart defaults based on action type
    if (type === 'visite') {
      setProchaine_action('Envoyer proposition commerciale');
      setNouveauStatutLead('qualifie');
    } else if (type === 'rdv') {
      setProchaine_action('Préparer la présentation');
      setNouveauStatutLead('proposition');
      // Default date for RDV
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      setDate_relance(nextWeek.toISOString().slice(0, 16));
    }
    
    setIsDialogOpen(true);
    setShowSuggestions(true);
  };

  const handleSubmit = async () => {
    // Validate: if a_rappeler, date is required
    if (statut === 'a_rappeler' && !date_relance) {
      toast({
        title: "Date requise",
        description: "Veuillez sélectionner une date de relance",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.functions.invoke('sync-interaction', {
        body: {
          entreprise_id: entrepriseId,
          type: selectedType,
          statut,
          notes: notes || undefined,
          prochaine_action: prochaine_action || undefined,
          date_relance: date_relance || undefined,
          nouveau_statut_lead,
        },
      });

      if (error) throw error;

      const actionMessages = {
        visite: { title: "🚗 Visite enregistrée !", description: "Votre visite sur site a été documentée" },
        rdv: { title: "📅 Rendez-vous confirmé !", description: "Le rendez-vous a été ajouté à votre suivi" },
        autre: { title: "✅ Note enregistrée !", description: "Votre note a été ajoutée avec succès" },
      };

      const message = actionMessages[selectedType] || actionMessages.autre;

      if (date_relance && statut === 'a_rappeler') {
        toast({
          title: message.title,
          description: `${message.description} • Relance le ${new Date(date_relance).toLocaleDateString('fr-FR')}`,
          duration: 2500,
        });
      } else if (prochaine_action) {
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
      setDate_relance('');
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
    visite: ['Envoyer proposition commerciale', 'Organiser RDV de closing', 'Demander références'],
    rdv: ['Préparer la présentation', 'Envoyer devis personnalisé', 'Relancer sous 3 jours'],
    autre: ['Faire un suivi', 'Vérifier la disponibilité', 'Relancer'],
  };

  const buttonHeight = size === 'lg' ? 'h-20' : 'h-16';
  const iconSize = size === 'lg' ? 'h-6 w-6' : 'h-5 w-5';
  const textSize = size === 'lg' ? 'text-sm' : 'text-xs';

  return (
    <>
      <div className="grid grid-cols-3 gap-3">
        <Button
          variant="outline"
          size={size}
          onClick={() => handleQuickAction('visite')}
          className={`${buttonHeight} flex flex-col items-center justify-center gap-2 border-green-500/30 hover:bg-green-500/10 hover:border-green-500 transition-colors group relative overflow-hidden shadow-sm`}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/0 via-green-500/5 to-green-500/0 group-hover:from-green-500/10 group-hover:to-green-500/20 transition-all" />
          <MapPin className={`${iconSize} text-green-500 relative z-10`} />
          <span className={`${textSize} font-medium relative z-10`}>Visiter</span>
        </Button>
        <Button
          variant="outline"
          size={size}
          onClick={() => handleQuickAction('rdv')}
          className={`${buttonHeight} flex flex-col items-center justify-center gap-2 border-purple-500/30 hover:bg-purple-500/10 hover:border-purple-500 transition-colors group relative overflow-hidden shadow-sm`}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 via-purple-500/5 to-purple-500/0 group-hover:from-purple-500/10 group-hover:to-purple-500/20 transition-all" />
          <Calendar className={`${iconSize} text-purple-500 relative z-10`} />
          <span className={`${textSize} font-medium relative z-10`}>RDV</span>
        </Button>
        <Button
          variant="outline"
          size={size}
          onClick={() => handleQuickAction('autre')}
          className={`${buttonHeight} flex flex-col items-center justify-center gap-2 border-amber-500/30 hover:bg-amber-500/10 hover:border-amber-500 transition-colors group relative overflow-hidden shadow-sm`}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/0 via-amber-500/5 to-amber-500/0 group-hover:from-amber-500/10 group-hover:to-amber-500/20 transition-all" />
          <StickyNote className={`${iconSize} text-amber-500 relative z-10`} />
          <span className={`${textSize} font-medium relative z-10`}>Note</span>
        </Button>
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

            {/* Date field - shown when statut is a_rappeler or type is rdv */}
            {showDateField && (
              <div className="space-y-2 p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
                <Label htmlFor="date_relance" className="flex items-center gap-2 text-orange-400">
                  <Calendar className="w-4 h-4" />
                  {selectedType === 'rdv' ? 'Date et heure du RDV' : 'Date de relance'} *
                </Label>
                <Input
                  id="date_relance"
                  type="datetime-local"
                  value={date_relance}
                  onChange={(e) => setDate_relance(e.target.value)}
                  className="border-orange-500/30 focus:border-orange-500"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Cette relance apparaîtra dans vos notifications à la date choisie
                </p>
              </div>
            )}

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
