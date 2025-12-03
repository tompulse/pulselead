import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Bot, Send, Loader2, Sparkles, CheckCircle, Route, Clock, MapPin, ChevronDown, AlertCircle, RotateCcw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";

interface TourneeAssistantChatProps {
  onApplyFilters: (params: {
    filters: any;
    tourneeName: string;
    tourneeDate: Date;
  }) => void;
  userId: string;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  parsedResult?: ParsedResult;
}

interface ParsedResult {
  tourneeName: string;
  tourneeDate: string;
  filters: {
    categories?: string[];
    departments?: string[];
    formesJuridiques?: string[];
    codesNaf?: string[];
    taillesEntreprise?: string[];
  };
  optimization?: {
    entreprises: any[];
    entreprises_ids: string[];
    distance_km: number;
    temps_trajet_minutes: number;
    temps_visites_minutes: number;
    temps_total_minutes: number;
    nb_arrets: number;
    excluded_count: number;
  };
  needsClarification?: boolean;
  clarificationMessage?: string;
}

export const TourneeAssistantChat = ({ onApplyFilters, userId }: TourneeAssistantChatProps) => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const handleSend = async () => {
    if (!message.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: message,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setMessage("");
    setLoading(true);

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
        setLoading(false);
        return;
      }

      if (data.errorType === "payment_required") {
        toast({
          title: "Crédits épuisés",
          description: data.error,
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.needsClarification 
          ? data.clarificationMessage 
          : "J'ai trouvé une tournée optimisée pour vous !",
        timestamp: new Date(),
        parsedResult: data.needsClarification ? undefined : data
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error("Error calling assistant:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Désolé, une erreur s'est produite. Pouvez-vous reformuler votre demande ?",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (parsedResult: ParsedResult) => {
    if (!parsedResult?.optimization) return;
    
    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Non authentifié");

      const { error } = await supabase.from('tournees').insert({
        user_id: user.id,
        nom: parsedResult.tourneeName,
        date_planifiee: parsedResult.tourneeDate,
        entreprises_ids: parsedResult.optimization.entreprises_ids,
        ordre_optimise: parsedResult.optimization.entreprises_ids,
        distance_totale_km: parsedResult.optimization.distance_km,
        temps_estime_minutes: parsedResult.optimization.temps_total_minutes,
        statut: 'planifiee'
      });

      if (error) throw error;

      toast({
        title: "✅ Tournée créée avec succès !",
        description: `${parsedResult.optimization.nb_arrets} entreprises planifiées pour le ${format(new Date(parsedResult.tourneeDate), "d MMMM", { locale: fr })}`,
        duration: 5000
      });

      setOpen(false);
      setMessages([]);
      
    } catch (error) {
      console.error('Save error:', error);
      toast({
        title: "❌ Erreur",
        description: "Impossible de créer la tournée. Réessayez.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-accent" />
            Assistant IA
          </DialogTitle>
          <DialogDescription>
            Créez votre tournée en discutant avec l'IA
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col h-[450px]">
          {/* Messages history */}
          <ScrollArea className="flex-1 p-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full space-y-4">
                <Bot className="h-16 w-16 text-muted-foreground/50" />
                <div className="text-center space-y-2">
                  <p className="text-sm font-medium">Décrivez votre tournée idéale</p>
                  <p className="text-xs text-muted-foreground max-w-md">
                    Exemple : "Crée une tournée demain avec les SAS du 75 en restauration"
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {msg.role === "assistant" && (
                      <div className="flex-shrink-0">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center">
                          <Bot className="h-5 w-5 text-white" />
                        </div>
                      </div>
                    )}
                    
                    <div className={`flex-1 max-w-[80%] ${msg.role === "user" ? "flex justify-end" : ""}`}>
                      {msg.parsedResult?.optimization ? (
                        <TourneeResult 
                          result={msg.parsedResult} 
                          onConfirm={() => handleConfirm(msg.parsedResult!)}
                          isSaving={isSaving}
                          getCategoryLabel={getCategoryLabel}
                        />
                      ) : (
                        <div
                          className={`rounded-lg px-4 py-3 ${
                            msg.role === "user"
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted"
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                {loading && (
                  <div className="flex gap-3">
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center">
                        <Bot className="h-5 w-5 text-white" />
                      </div>
                    </div>
                    <div className="bg-muted rounded-lg px-4 py-3">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>

          {/* Input area */}
          <div className="border-t p-4">
            <div className="flex gap-2">
              <Input
                placeholder="Décrivez votre tournée..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                disabled={loading}
              />
              <Button onClick={handleSend} disabled={loading || !message.trim()}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Sous-composant pour afficher le résultat de tournée
const TourneeResult = ({ 
  result, 
  onConfirm, 
  isSaving,
  getCategoryLabel 
}: { 
  result: ParsedResult; 
  onConfirm: () => void;
  isSaving: boolean;
  getCategoryLabel: (key: string) => string;
}) => {
  if (!result.optimization) return null;

  return (
    <div className="space-y-3 bg-card border rounded-lg p-4">
      {/* En-tête avec statut */}
      <div className="flex items-center gap-2 mb-3">
        <CheckCircle className="h-5 w-5 text-green-600" />
        <h4 className="font-semibold text-sm">Tournée optimisée</h4>
      </div>

      <div className="space-y-3">
        <div>
          <p className="text-xs text-muted-foreground">Nom</p>
          <p className="font-medium text-sm">{result.tourneeName}</p>
        </div>

        <div>
          <p className="text-xs text-muted-foreground">Date</p>
          <p className="text-sm">
            {format(new Date(result.tourneeDate), "EEEE d MMMM yyyy", { locale: fr })}
          </p>
        </div>

        <div>
          <Badge variant="secondary" className="text-xs">
            Nouveaux Sites
          </Badge>
        </div>

        {/* Stats en grille compacte */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-primary/5 rounded p-2 text-center">
            <Route className="h-4 w-4 mx-auto mb-1 text-primary" />
            <p className="text-lg font-bold text-primary">
              {result.optimization.distance_km.toFixed(1)}
            </p>
            <p className="text-xs text-muted-foreground">km</p>
          </div>
          
          <div className="bg-accent/5 rounded p-2 text-center">
            <Clock className="h-4 w-4 mx-auto mb-1 text-accent" />
            <p className="text-lg font-bold text-accent">
              {Math.floor(result.optimization.temps_total_minutes / 60)}h
              {(result.optimization.temps_total_minutes % 60).toString().padStart(2, '0')}
            </p>
            <p className="text-xs text-muted-foreground">durée</p>
          </div>
          
          <div className="bg-green-500/5 rounded p-2 text-center">
            <MapPin className="h-4 w-4 mx-auto mb-1 text-green-600" />
            <p className="text-lg font-bold text-green-600">
              {result.optimization.nb_arrets}
            </p>
            <p className="text-xs text-muted-foreground">arrêts</p>
          </div>
        </div>

        {/* Parcours */}
        <Collapsible>
          <CollapsibleTrigger className="flex items-center justify-between w-full text-xs font-medium hover:text-accent">
            <span>Parcours ({result.optimization.nb_arrets} arrêts)</span>
            <ChevronDown className="h-3 w-3" />
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2">
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {result.optimization.entreprises.slice(0, 5).map((e, idx) => (
                <div key={e.id} className="flex gap-2 text-xs p-2 bg-muted/30 rounded">
                  <Badge variant="outline" className="h-5 w-5 p-0 flex items-center justify-center">
                    {idx + 1}
                  </Badge>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate text-xs">{e.nom}</p>
                    <p className="text-xs text-muted-foreground truncate">{e.ville}</p>
                  </div>
                </div>
              ))}
              {result.optimization.entreprises.length > 5 && (
                <p className="text-xs text-muted-foreground text-center py-1">
                  +{result.optimization.entreprises.length - 5} autres
                </p>
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Bouton validation */}
        <Button 
          onClick={onConfirm} 
          disabled={isSaving}
          className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
          size="sm"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-3 h-3 mr-2 animate-spin" />
              Création...
            </>
          ) : (
            <>
              <CheckCircle className="w-3 h-3 mr-2" />
              Créer cette tournée
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
