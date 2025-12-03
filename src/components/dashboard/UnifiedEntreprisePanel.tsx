import { useEffect, useState } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useIsMobile } from "@/hooks/use-mobile";
import { Building2, MapPin, Calendar, X, Navigation, Phone, Mail, MessageSquare, Clock, Plus } from "lucide-react";
import { openGoogleMaps, openWaze } from "@/utils/navigation";
import { useCRMActions, LeadStatut, InteractionType } from "@/hooks/useCRMActions";
import { LeadStatusBadge, allStatuts, getStatusLabel } from "./LeadStatusBadge";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface UnifiedEntreprisePanelProps {
  entreprise: any | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
}

export const UnifiedEntreprisePanel = ({ 
  entreprise, 
  open, 
  onOpenChange,
  userId 
}: UnifiedEntreprisePanelProps) => {
  const isMobile = useIsMobile();
  const { getLeadStatus, updateLeadStatus, getInteractions, addInteraction, loading } = useCRMActions(userId);
  
  const [currentStatus, setCurrentStatus] = useState<LeadStatut>('nouveau');
  const [interactions, setInteractions] = useState<any[]>([]);
  const [showAddInteraction, setShowAddInteraction] = useState(false);
  const [newInteraction, setNewInteraction] = useState({
    type: 'appel' as InteractionType,
    notes: ''
  });

  useEffect(() => {
    if (entreprise?.id && open) {
      loadData();
    }
  }, [entreprise?.id, open]);

  const loadData = async () => {
    if (!entreprise?.id) return;
    
    const status = await getLeadStatus(entreprise.id);
    setCurrentStatus(status?.statut || 'nouveau');
    
    const ints = await getInteractions(entreprise.id);
    setInteractions(ints);
  };

  const handleStatusChange = async (newStatus: LeadStatut) => {
    if (!entreprise?.id) return;
    setCurrentStatus(newStatus);
    await updateLeadStatus(entreprise.id, newStatus);
  };

  const handleAddInteraction = async () => {
    if (!entreprise?.id || !newInteraction.notes.trim()) return;
    
    await addInteraction(entreprise.id, newInteraction.type, newInteraction.notes);
    setNewInteraction({ type: 'appel', notes: '' });
    setShowAddInteraction(false);
    await loadData();
  };

  if (!entreprise) return null;

  const formattedAddress = [
    entreprise.numero_voie,
    entreprise.type_voie,
    entreprise.libelle_voie,
    entreprise.code_postal,
    entreprise.ville
  ].filter(Boolean).join(' ') || entreprise.adresse || 'Adresse non disponible';

  const interactionIcons: Record<InteractionType, React.ReactNode> = {
    appel: <Phone className="w-3 h-3" />,
    email: <Mail className="w-3 h-3" />,
    visite: <MapPin className="w-3 h-3" />,
    rdv: <Calendar className="w-3 h-3" />,
    autre: <MessageSquare className="w-3 h-3" />
  };

  const content = (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-start justify-between p-6 border-b border-accent/20">
        <div className="flex-1 pr-4">
          <h2 className="text-2xl font-bold mb-2">{entreprise.nom}</h2>
          <p className="text-sm text-muted-foreground mb-3">{entreprise.categorie_detaillee || entreprise.categorie_entreprise || 'Non catégorisé'}</p>
          
          {/* Status selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Statut:</span>
            <Select value={currentStatus} onValueChange={(v) => handleStatusChange(v as LeadStatut)}>
              <SelectTrigger className="w-[140px] h-8">
                <SelectValue>
                  <LeadStatusBadge statut={currentStatus} size="sm" />
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {allStatuts.map(s => (
                  <SelectItem key={s} value={s}>
                    <LeadStatusBadge statut={s} size="sm" />
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onOpenChange(false)}
          className="shrink-0"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1 px-6">
        <div className="space-y-6 py-4">
          {/* Address */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-accent">
              <MapPin className="w-4 h-4" />
              <span>Adresse</span>
            </div>
            <p className="text-sm pl-6">{formattedAddress}</p>
            {entreprise.latitude && entreprise.longitude && (
              <div className="flex gap-2 pl-6">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => openGoogleMaps(entreprise.latitude, entreprise.longitude)}
                  className="border-accent/30 hover:bg-accent/10"
                >
                  Google Maps
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => openWaze(entreprise.latitude, entreprise.longitude)}
                  className="border-accent/30 hover:bg-accent/10"
                >
                  Waze
                </Button>
              </div>
            )}
          </div>

          <Separator />

          {/* Activity */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-accent">
              <Building2 className="w-4 h-4" />
              <span>Activité</span>
            </div>
            <p className="text-sm pl-6">{entreprise.categorie_detaillee || 'Non renseigné'}</p>
            {entreprise.code_naf && (
              <p className="text-xs text-muted-foreground pl-6">Code NAF: {entreprise.code_naf}</p>
            )}
          </div>

          <Separator />

          {/* SIRET */}
          {entreprise.siret && (
            <>
              <div className="space-y-2">
                <p className="text-sm font-semibold text-accent">SIRET</p>
                <p className="text-sm pl-6">{entreprise.siret}</p>
              </div>
              <Separator />
            </>
          )}

          {/* Date création */}
          {entreprise.date_creation && (
            <>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm font-semibold text-accent">
                  <Calendar className="w-4 h-4" />
                  <span>Date de création</span>
                </div>
                <p className="text-sm pl-6">
                  {new Date(entreprise.date_creation).toLocaleDateString('fr-FR')}
                </p>
              </div>
              <Separator />
            </>
          )}

          {/* Interactions */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-semibold text-accent">
                <MessageSquare className="w-4 h-4" />
                <span>Historique ({interactions.length})</span>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowAddInteraction(!showAddInteraction)}
                className="h-7 text-xs"
              >
                <Plus className="w-3 h-3 mr-1" />
                Ajouter
              </Button>
            </div>

            {showAddInteraction && (
              <div className="space-y-2 p-3 rounded-lg bg-accent/5 border border-accent/20">
                <Select 
                  value={newInteraction.type} 
                  onValueChange={(v) => setNewInteraction(prev => ({ ...prev, type: v as InteractionType }))}
                >
                  <SelectTrigger className="w-full h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="appel">📞 Appel</SelectItem>
                    <SelectItem value="email">📧 Email</SelectItem>
                    <SelectItem value="visite">🚗 Visite</SelectItem>
                    <SelectItem value="rdv">📅 RDV</SelectItem>
                    <SelectItem value="autre">📝 Autre</SelectItem>
                  </SelectContent>
                </Select>
                <Textarea
                  placeholder="Notes..."
                  value={newInteraction.notes}
                  onChange={(e) => setNewInteraction(prev => ({ ...prev, notes: e.target.value }))}
                  className="min-h-[60px]"
                />
                <div className="flex justify-end gap-2">
                  <Button size="sm" variant="ghost" onClick={() => setShowAddInteraction(false)}>
                    Annuler
                  </Button>
                  <Button size="sm" onClick={handleAddInteraction} disabled={loading || !newInteraction.notes.trim()}>
                    Enregistrer
                  </Button>
                </div>
              </div>
            )}

            {interactions.length > 0 ? (
              <div className="space-y-2 pl-2">
                {interactions.map((int) => (
                  <div key={int.id} className="flex gap-3 p-2 rounded-lg bg-card/50 border border-border/50">
                    <div className="shrink-0 mt-1 p-1.5 rounded bg-accent/10 text-accent">
                      {interactionIcons[int.type as InteractionType] || <MessageSquare className="w-3 h-3" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                        <Clock className="w-3 h-3" />
                        {format(new Date(int.date_interaction), 'dd MMM yyyy HH:mm', { locale: fr })}
                      </div>
                      <p className="text-sm">{int.notes}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground pl-6">Aucune interaction enregistrée</p>
            )}
          </div>
        </div>
      </ScrollArea>

      {/* Actions rapides en bas */}
      {entreprise.latitude && entreprise.longitude && (
        <div className="shrink-0 px-6 py-4 border-t border-accent/20 bg-gradient-to-b from-transparent to-accent/5">
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={() => openGoogleMaps(entreprise.latitude, entreprise.longitude)}
              className="h-12 bg-green-500/10 hover:bg-green-500/20 text-green-500 border border-green-500/20 hover:border-green-500/40 transition-all"
            >
              <MapPin className="w-4 h-4 mr-2" />
              Maps
            </Button>

            <Button
              onClick={() => openWaze(entreprise.latitude, entreprise.longitude)}
              className="h-12 bg-purple-500/10 hover:bg-purple-500/20 text-purple-500 border border-purple-500/20 hover:border-purple-500/40 transition-all"
            >
              <Navigation className="w-4 h-4 mr-2" />
              Waze
            </Button>
          </div>
        </div>
      )}
    </div>
  );

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="h-[90vh] p-0">
          {content}
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl h-[80vh] p-0">
        {content}
      </DialogContent>
    </Dialog>
  );
};
