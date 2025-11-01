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
  const [parsedResult, setParsedResult] = useState<ParsedResult | null>(null);
  const [isSaving, setIsSaving] = useState(false);
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

  const handleConfirm = async () => {
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
      setMessage("");
      setParsedResult(null);
      
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
          ) : parsedResult?.optimization ? (
            <div className="space-y-4">
              {/* Statut succès */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <h3 className="font-semibold text-green-900 dark:text-green-100">
                    ✨ Tournée optimisée et prête !
                  </h3>
                </div>
                <p className="text-sm text-green-700 dark:text-green-300">
                  {parsedResult.optimization.nb_arrets} entreprises trouvées et organisées
                </p>
              </div>

              {/* Carte d'informations principales */}
              <div className="bg-card border rounded-lg p-4 space-y-3">
                <div>
                  <Label className="text-sm text-muted-foreground">Nom de la tournée</Label>
                  <Input 
                    value={parsedResult.tourneeName}
                    onChange={(e) => setParsedResult({...parsedResult, tourneeName: e.target.value})}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label className="text-sm text-muted-foreground">Date prévue</Label>
                  <p className="font-medium text-accent">
                    {format(new Date(parsedResult.tourneeDate), "EEEE d MMMM yyyy", { locale: fr })}
                  </p>
                </div>

                <div>
                  <Label className="text-sm text-muted-foreground mb-2 block">Type de prospects</Label>
                  <Badge variant={parsedResult.view === "creations" ? "default" : "secondary"}>
                    {parsedResult.view === "creations" ? "Créations" : "Nouveaux Sites"}
                  </Badge>
                </div>

                {/* Statistiques en grille */}
                <div className="grid grid-cols-3 gap-3 pt-3 border-t">
                  <div className="bg-primary/5 rounded-lg p-3 text-center">
                    <Route className="h-5 w-5 mx-auto mb-1 text-primary" />
                    <p className="text-2xl font-bold text-primary">
                      {parsedResult.optimization.distance_km.toFixed(1)} km
                    </p>
                    <p className="text-xs text-muted-foreground">Distance</p>
                  </div>
                  
                  <div className="bg-accent/5 rounded-lg p-3 text-center">
                    <Clock className="h-5 w-5 mx-auto mb-1 text-accent" />
                    <p className="text-2xl font-bold text-accent">
                      {Math.floor(parsedResult.optimization.temps_total_minutes / 60)}h
                      {(parsedResult.optimization.temps_total_minutes % 60).toString().padStart(2, '0')}
                    </p>
                    <p className="text-xs text-muted-foreground">Durée totale</p>
                  </div>
                  
                  <div className="bg-green-500/5 rounded-lg p-3 text-center">
                    <MapPin className="h-5 w-5 mx-auto mb-1 text-green-600" />
                    <p className="text-2xl font-bold text-green-600">
                      {parsedResult.optimization.nb_arrets}
                    </p>
                    <p className="text-xs text-muted-foreground">Prospects</p>
                  </div>
                </div>

                {/* Détail des temps */}
                <div className="text-xs bg-muted/30 rounded-lg p-3 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">🚗 Temps de trajet :</span>
                    <span className="font-medium">{parsedResult.optimization.temps_trajet_minutes} min</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">🤝 Temps de visites (15 min × {parsedResult.optimization.nb_arrets}) :</span>
                    <span className="font-medium">{parsedResult.optimization.temps_visites_minutes} min</span>
                  </div>
                  <Separator className="my-1" />
                  <div className="flex justify-between font-semibold text-foreground pt-1">
                    <span>⏱️ Total :</span>
                    <span>{parsedResult.optimization.temps_total_minutes} min</span>
                  </div>
                </div>

                {/* Liste ordonnée des entreprises */}
                <Collapsible>
                  <CollapsibleTrigger className="flex items-center justify-between w-full py-2 text-sm font-medium hover:text-accent">
                    <span>🗺️ Voir le parcours détaillé ({parsedResult.optimization.nb_arrets} arrêts)</span>
                    <ChevronDown className="h-4 w-4" />
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <ScrollArea className="h-48 rounded-lg border bg-muted/10 mt-2">
                      <div className="p-2 space-y-1">
                        {parsedResult.optimization.entreprises.map((e, idx) => (
                          <div 
                            key={e.id} 
                            className="flex items-start gap-3 text-sm p-3 rounded-lg hover:bg-accent/10 transition-colors border border-transparent hover:border-accent/20"
                          >
                            <Badge variant="secondary" className="shrink-0 w-7 h-7 flex items-center justify-center font-bold">
                              {idx + 1}
                            </Badge>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold truncate">{e.nom}</p>
                              <p className="text-xs text-muted-foreground truncate">
                                📍 {e.adresse}, {e.code_postal} {e.ville}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CollapsibleContent>
                </Collapsible>

                {/* Alerte si entreprises exclues */}
                {parsedResult.optimization.excluded_count > 0 && (
                  <Alert variant="default" className="bg-orange-50 dark:bg-orange-950/30 border-orange-200">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-xs">
                      ⚠️ {parsedResult.optimization.excluded_count} entreprise(s) exclue(s) (pas de coordonnées GPS)
                    </AlertDescription>
                  </Alert>
                )}

                {/* Filtres appliqués */}
                <Collapsible>
                  <CollapsibleTrigger className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
                    <ChevronDown className="h-3 w-3" />
                    Voir les critères appliqués
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-2 space-y-2 pt-2 border-t">
                    {parsedResult.filters.categories && parsedResult.filters.categories.length > 0 && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Secteurs d'activité</p>
                        <div className="flex flex-wrap gap-1">
                          {parsedResult.filters.categories.map((cat) => (
                            <Badge key={cat} variant="outline" className="text-xs">
                              {getCategoryLabel(cat)}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {parsedResult.filters.departments && parsedResult.filters.departments.length > 0 && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Départements</p>
                        <div className="flex flex-wrap gap-1">
                          {parsedResult.filters.departments.map((dept) => (
                            <Badge key={dept} variant="outline" className="text-xs">{dept}</Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {parsedResult.filters.formesJuridiques && parsedResult.filters.formesJuridiques.length > 0 && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Formes juridiques</p>
                        <div className="flex flex-wrap gap-1">
                          {parsedResult.filters.formesJuridiques.map((forme) => (
                            <Badge key={forme} variant="outline" className="text-xs">{forme}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CollapsibleContent>
                </Collapsible>
              </div>

              {/* Boutons d'action */}
              <div className="flex gap-2 pt-2">
                <Button 
                  variant="outline" 
                  onClick={() => setParsedResult(null)} 
                  className="flex-1"
                  disabled={isSaving}
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Refaire
                </Button>
                <Button 
                  onClick={handleConfirm} 
                  disabled={isSaving}
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg shadow-green-500/20"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Création...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Valider et créer
                    </>
                  )}
                </Button>
              </div>

              {/* Conseil */}
              <Alert className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
                <AlertDescription className="text-xs text-blue-700 dark:text-blue-300">
                  💡 <strong>Astuce :</strong> Si le parcours ne vous convient pas, cliquez sur "Refaire" pour reformuler votre demande.
                </AlertDescription>
              </Alert>
            </div>
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
