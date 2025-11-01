import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Bot, Send, Loader2, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface TourneeAssistantChatProps {
  onApplyFilters: (params: {
    view: "creations" | "nouveaux-sites";
    filters: any;
    tourneeName: string;
    tourneeDate: Date;
  }) => void;
  userId: string;
}

interface ParsedResult {
  tourneeName: string;
  tourneeDate: string;
  view: "creations" | "nouveaux-sites";
  filters: {
    categories?: string[];
    departments?: string[];
    formesJuridiques?: string[];
    dateFrom?: string;
    dateTo?: string;
  };
  needsClarification?: boolean;
  clarificationMessage?: string;
}

export const TourneeAssistantChat = ({ onApplyFilters, userId }: TourneeAssistantChatProps) => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [parsedResult, setParsedResult] = useState<ParsedResult | null>(null);
  const { toast } = useToast();

  const handleSend = async () => {
    if (!message.trim()) return;

    setLoading(true);
    setParsedResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('chat-tournee-assistant', {
        body: { message, userId }
      });

      if (error) throw error;

      if (data.errorType === "rate_limit") {
        toast({
          title: "Limite atteinte",
          description: data.error,
          variant: "destructive"
        });
        return;
      }

      if (data.errorType === "payment_required") {
        toast({
          title: "Crédits épuisés",
          description: data.error,
          variant: "destructive"
        });
        return;
      }

      if (data.needsClarification) {
        toast({
          title: "Besoin de clarification",
          description: data.clarificationMessage,
          variant: "default"
        });
        return;
      }

      setParsedResult(data);
    } catch (error: any) {
      console.error("Error calling assistant:", error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de traiter votre demande",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = () => {
    if (!parsedResult) return;

    onApplyFilters({
      view: parsedResult.view,
      filters: parsedResult.filters,
      tourneeName: parsedResult.tourneeName,
      tourneeDate: new Date(parsedResult.tourneeDate)
    });

    toast({
      title: "Tournée configurée",
      description: "Les filtres ont été appliqués. Vous pouvez maintenant optimiser votre tournée.",
    });

    setOpen(false);
    setMessage("");
    setParsedResult(null);
  };

  const getCategoryLabel = (key: string): string => {
    const labels: Record<string, string> = {
      agriculture: "Agriculture & Forêt",
      industrie_alimentaire: "Industrie alimentaire",
      textile: "Textile & Habillement",
      bois_papier: "Bois & Papier",
      chimie: "Chimie & Pharmacie",
      plastique: "Plastique & Caoutchouc",
      metallurgie: "Métallurgie & Mécanique",
      informatique: "Informatique & Électronique",
      automobile: "Automobile & Transport",
      meubles: "Meubles & Autres",
      energie: "Énergie & Eau",
      construction: "Construction & BTP",
      commerce_auto: "Commerce Automobile",
      commerce_gros: "Commerce de Gros",
      commerce_detail: "Commerce de Détail",
      transport: "Transport & Logistique",
      hotellerie: "Hôtellerie & Restauration",
      communication: "Communication & Médias",
      informatique_services: "Services Informatiques",
      finance: "Finance & Assurance",
      immobilier: "Immobilier",
      juridique: "Services Juridiques",
      architecture: "Architecture & Ingénierie",
      services_admin: "Services Administratifs",
      administration: "Administration Publique",
      enseignement: "Enseignement & Formation",
      sante: "Santé & Action Sociale",
      culture: "Culture & Loisirs",
      autres_services: "Autres Services",
      menages: "Services aux Ménages",
      international: "Organisations Internationales"
    };
    return labels[key] || key;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 transition-all hover:scale-110 z-50"
          size="icon"
        >
          <Bot className="h-6 w-6" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-accent" />
            Assistant IA - Création de tournée
          </DialogTitle>
          <DialogDescription>
            Décrivez votre tournée en une phrase, l'IA s'occupe du reste.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {!parsedResult ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="message">Votre demande</Label>
                <div className="flex gap-2">
                  <Input
                    id="message"
                    placeholder="Ex: Crée une tournée demain avec les SAS du 75 en restauration"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    disabled={loading}
                  />
                  <Button onClick={handleSend} disabled={loading || !message.trim()}>
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <p className="text-sm font-medium">💡 Exemples de requêtes :</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• "Tournée demain avec les SAS du 75"</li>
                  <li>• "Nouveaux sites en restauration dans le 69 et 01"</li>
                  <li>• "Planifie vendredi les créations SARL en Île-de-France"</li>
                  <li>• "Liste-moi les nouveaux sites BTP dans l'Est"</li>
                </ul>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div className="bg-accent/10 rounded-lg p-4 border border-accent/20">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-accent" />
                  Tournée configurée
                </h3>
                
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Nom de la tournée</p>
                    <p className="font-medium">{parsedResult.tourneeName}</p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground">Date prévue</p>
                    <p className="font-medium">
                      {format(new Date(parsedResult.tourneeDate), "EEEE d MMMM yyyy", { locale: fr })}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground">Type de prospects</p>
                    <Badge variant={parsedResult.view === "creations" ? "default" : "secondary"}>
                      {parsedResult.view === "creations" ? "Créations" : "Nouveaux Sites"}
                    </Badge>
                  </div>

                  {parsedResult.filters.categories && parsedResult.filters.categories.length > 0 && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Secteurs d'activité</p>
                      <div className="flex flex-wrap gap-1">
                        {parsedResult.filters.categories.map((cat) => (
                          <Badge key={cat} variant="outline">
                            {getCategoryLabel(cat)}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {parsedResult.filters.departments && parsedResult.filters.departments.length > 0 && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Départements</p>
                      <div className="flex flex-wrap gap-1">
                        {parsedResult.filters.departments.map((dept) => (
                          <Badge key={dept} variant="outline">{dept}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {parsedResult.filters.formesJuridiques && parsedResult.filters.formesJuridiques.length > 0 && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Formes juridiques</p>
                      <div className="flex flex-wrap gap-1">
                        {parsedResult.filters.formesJuridiques.map((forme) => (
                          <Badge key={forme} variant="outline">{forme}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setParsedResult(null)} className="flex-1">
                  Modifier
                </Button>
                <Button onClick={handleConfirm} className="flex-1">
                  Confirmer et créer
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
