import { Phone, Mail, MapPin, Calendar, MessageSquare } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface Interaction {
  id: string;
  type: 'appel' | 'email' | 'visite' | 'rdv' | 'autre';
  statut: 'a_rappeler' | 'en_cours' | 'gagne' | 'perdu' | 'sans_suite';
  notes: string | null;
  prochaine_action: string | null;
  date_prochaine_action: string | null;
  created_at: string;
}

interface InteractionTimelineProps {
  interactions: Interaction[];
}

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'appel':
      return <Phone className="h-4 w-4" />;
    case 'email':
      return <Mail className="h-4 w-4" />;
    case 'visite':
      return <MapPin className="h-4 w-4" />;
    case 'rdv':
      return <Calendar className="h-4 w-4" />;
    default:
      return <MessageSquare className="h-4 w-4" />;
  }
};

const getTypeLabel = (type: string) => {
  const labels = {
    appel: 'Appel',
    email: 'Email',
    visite: 'Visite',
    rdv: 'Rendez-vous',
    autre: 'Autre',
  };
  return labels[type as keyof typeof labels] || type;
};

const getStatutVariant = (statut: string): "default" | "secondary" | "destructive" | "outline" => {
  switch (statut) {
    case 'gagne':
      return 'default';
    case 'en_cours':
      return 'secondary';
    case 'perdu':
    case 'sans_suite':
      return 'destructive';
    default:
      return 'outline';
  }
};

const getStatutLabel = (statut: string) => {
  const labels = {
    a_rappeler: 'À rappeler',
    en_cours: 'En cours',
    gagne: 'Gagné',
    perdu: 'Perdu',
    sans_suite: 'Sans suite',
  };
  return labels[statut as keyof typeof labels] || statut;
};

export const InteractionTimeline = ({ interactions }: InteractionTimelineProps) => {
  if (interactions.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
        <p>Aucune interaction enregistrée</p>
        <p className="text-sm mt-1">Commencez par ajouter une action ci-dessous</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[400px] pr-4">
      <div className="space-y-4">
        {interactions.map((interaction, index) => (
          <div key={interaction.id} className="relative pl-8 pb-4 border-l-2 border-muted last:border-0">
            <div className="absolute left-[-9px] top-0 bg-background border-2 border-primary rounded-full p-1">
              {getTypeIcon(interaction.type)}
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-sm">
                  {getTypeLabel(interaction.type)}
                </span>
                <Badge variant={getStatutVariant(interaction.statut)}>
                  {getStatutLabel(interaction.statut)}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {format(new Date(interaction.created_at), 'dd MMM yyyy à HH:mm', { locale: fr })}
                </span>
              </div>

              {interaction.notes && (
                <p className="text-sm bg-muted/50 p-2 rounded-md">{interaction.notes}</p>
              )}

              {interaction.prochaine_action && (
                <div className="text-sm space-y-1">
                  <p className="font-medium text-primary">Prochaine action :</p>
                  <p className="text-muted-foreground">{interaction.prochaine_action}</p>
                  {interaction.date_prochaine_action && (
                    <p className="text-xs flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(interaction.date_prochaine_action), "dd MMM yyyy à HH:mm", { locale: fr })}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
};
