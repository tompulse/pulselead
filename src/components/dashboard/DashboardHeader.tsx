import { Button } from "@/components/ui/button";
import { MapIcon, Navigation, TrendingUp, Upload, CheckCircle2, AlertCircle, Lightbulb, BarChart3, Database, Unlock } from "lucide-react";
import { trackViewChange } from "@/utils/analytics";
import { useIsMobile } from "@/hooks/use-mobile";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { NotificationCenter } from "./NotificationCenter";
import { AccountMenu } from "./AccountMenu";
import { useState, useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { DashboardView } from "@/contexts/DashboardContext";

interface DashboardHeaderProps {
  view: DashboardView;
  onViewChange: (view: DashboardView) => void;
  isAdmin: boolean;
  onLogout: () => void;
  userId: string;
  userEmail?: string;
  subscriptionStatus?: string;
  subscriptionPlan?: string;
  daysRemaining?: number;
  endDate?: string;
  onSelectEntreprise?: (entrepriseId: string) => void;
}

export const DashboardHeader = ({ 
  view, 
  onViewChange, 
  isAdmin, 
  onLogout,
  userId,
  userEmail,
  subscriptionStatus,
  subscriptionPlan,
  daysRemaining,
  endDate,
  onSelectEntreprise
}: DashboardHeaderProps) => {
  const isMobile = useIsMobile();
  const [importOpen, setImportOpen] = useState(false);
  const [ideasOpen, setIdeasOpen] = useState(false);
  const [ideas, setIdeas] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressText, setProgressText] = useState("");
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Load ideas from localStorage on mount
  useEffect(() => {
    const savedIdeas = localStorage.getItem('pulse_dev_ideas');
    if (savedIdeas) {
      setIdeas(savedIdeas);
    }
  }, []);

  // Save ideas to localStorage
  const handleSaveIdeas = () => {
    localStorage.setItem('pulse_dev_ideas', ideas);
    toast({
      title: "💡 Idées sauvegardées",
      description: "Vos idées ont été enregistrées localement.",
    });
    setIdeasOpen(false);
  };

  const handleViewChange = (newView: typeof view) => {
    onViewChange(newView);
    trackViewChange(newView);
  };

  const handleImportCSV = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast({
        title: "Format invalide",
        description: "Veuillez sélectionner un fichier CSV",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setProgress(5);
    setProgressText("Lecture du fichier...");
    setResult(null);

    try {
      // Parse CSV
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        throw new Error('Le fichier CSV est vide ou ne contient pas de données');
      }

      const firstLine = lines[0];
      const delimiter = firstLine.includes(';') ? ';' : ',';
      const headers = firstLine.split(delimiter).map(h => h.trim().replace(/^["']|["']$/g, ''));
      
      const jsonData = lines.slice(1).map(line => {
        const values = line.split(delimiter).map(v => v.trim().replace(/^["']|["']$/g, ''));
        const row: any = {};
        headers.forEach((header, index) => {
          row[header] = values[index] || '';
        });
        return row;
      }).filter(row => row.siret);

      setProgress(20);
      setProgressText(`${jsonData.length} lignes détectées...`);

      // Import en batches
      const BATCH_SIZE = 500;
      let totalInserted = 0;
      let totalErrors = 0;

      for (let i = 0; i < jsonData.length; i += BATCH_SIZE) {
        const batch = jsonData.slice(i, i + BATCH_SIZE);
        const currentLine = Math.min(i + BATCH_SIZE, jsonData.length);
        
        setProgressText(`Import ${currentLine}/${jsonData.length} lignes...`);
        
        const { data: responseData, error } = await supabase.functions.invoke('import-nouveaux-sites', {
          body: { entreprises: batch }
        });

        if (error) {
          console.error(`❌ Erreur batch:`, error);
          totalErrors += batch.length;
        } else {
          totalInserted += responseData?.inserted || 0;
          totalErrors += responseData?.errors || 0;
        }

        const progressPercent = 20 + Math.floor((currentLine / jsonData.length) * 80);
        setProgress(progressPercent);
      }

      setProgress(100);
      setProgressText("Import terminé !");

      const successMessage = `${totalInserted} établissements importés${totalErrors > 0 ? ` (${totalErrors} erreurs)` : ''}`;
      
      setResult({
        success: totalInserted > 0,
        message: successMessage
      });

      toast({
        title: totalInserted > 0 ? "✅ Import réussi" : "⚠️ Import partiel",
        description: successMessage,
      });

      // Reload after success
      if (totalInserted > 0) {
        setTimeout(() => {
          window.location.reload();
        }, 2500);
      }

    } catch (error) {
      console.error('Import error:', error);
      const message = error instanceof Error ? error.message : "Erreur lors de l'import";
      
      setResult({
        success: false,
        message
      });

      toast({
        title: "❌ Erreur d'import",
        description: message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Base views for all users
  const baseViewConfig: { key: DashboardView; label: string; icon: typeof MapIcon }[] = [
    { key: 'prospects', label: 'Prospects', icon: MapIcon },
    { key: 'tournees', label: 'Tournées', icon: Navigation },
    { key: 'crm', label: 'CRM', icon: TrendingUp },
  ];
  
  // Add admin-only views
  const viewConfig = isAdmin 
    ? [
        ...baseViewConfig, 
        { key: 'analytics' as DashboardView, label: 'Analytics', icon: BarChart3 },
        { key: 'scraping' as DashboardView, label: 'Scraping', icon: Database }
      ]
    : baseViewConfig;

  return (
    <header className="glass-card border-b border-accent/20 px-4 py-3 z-10 backdrop-blur-xl shrink-0 shadow-md">
      <div className="flex items-center justify-between">
        {/* Mobile View */}
        {isMobile ? (
          <>
            <div className="text-base font-bold gradient-text">
              {viewConfig.find(v => v.key === view)?.label}
            </div>
            
            <div className="flex items-center gap-2">
              <NotificationCenter userId={userId} onSelectEntreprise={onSelectEntreprise} />
              <AccountMenu
                userEmail={userEmail}
                subscriptionStatus={subscriptionStatus}
                subscriptionPlan={subscriptionPlan}
                daysRemaining={daysRemaining}
                endDate={endDate}
                onLogout={onLogout}
              />
            </div>
          </>
        ) : (
          <>
            {/* Desktop View Toggle */}
            <div className="flex gap-1 p-0.5 bg-card/50 rounded-lg border border-accent/20 shadow-sm">
              {viewConfig.map((v) => {
                const Icon = v.icon;
                return (
                  <Button
                    key={v.key}
                    variant={view === v.key ? "default" : "ghost"}
                    size="sm"
                    onClick={() => handleViewChange(v.key)}
                    className={`h-7 px-2 text-xs transition-all duration-300 ${
                      view === v.key 
                        ? "bg-accent text-primary hover:bg-accent/90 shadow-lg shadow-accent/20" 
                        : "hover:bg-accent/10"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 mr-1" />
                    <span className="hidden sm:inline">{v.label}</span>
                  </Button>
                );
              })}
            </div>

            <div className="flex items-center gap-2">
              {isAdmin && (
                <Dialog open={importOpen} onOpenChange={setImportOpen}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 px-3 text-xs border-accent/50 hover:bg-accent/10 hover:border-accent transition-all duration-300"
                    >
                      <Upload className="w-3.5 h-3.5 mr-1.5" />
                      Import CSV
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Importer des établissements (CSV)</DialogTitle>
                    </DialogHeader>
                    
                    <div className="space-y-4">
                      <div className="text-sm text-muted-foreground">
                        Sélectionnez votre fichier CSV avec les données des établissements. 
                        Le fichier sera automatiquement traité avec les correspondances NAF, 
                        catégories juridiques et coordonnées.
                      </div>

                      {loading && (
                        <div className="space-y-2">
                          <Progress value={progress} className="w-full" />
                          <p className="text-xs text-center text-muted-foreground">
                            {progressText} ({progress}%)
                          </p>
                        </div>
                      )}

                      {result && (
                        <div className={`flex items-start gap-2 p-3 rounded-lg ${
                          result.success 
                            ? 'bg-green-500/10 text-green-700 dark:text-green-400' 
                            : 'bg-red-500/10 text-red-700 dark:text-red-400'
                        }`}>
                          {result.success ? (
                            <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          ) : (
                            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          )}
                          <p className="text-sm">{result.message}</p>
                        </div>
                      )}

                      <div className="flex flex-col gap-2">
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept=".csv"
                          onChange={handleImportCSV}
                          disabled={loading}
                          className="hidden"
                          id="csv-upload"
                        />
                        <label htmlFor="csv-upload">
                          <Button 
                            variant="default" 
                            className="w-full cursor-pointer"
                            disabled={loading}
                            asChild
                          >
                            <span>
                              <Upload className="w-4 h-4 mr-2" />
                              {loading ? 'Import en cours...' : 'Sélectionner un fichier CSV'}
                            </span>
                          </Button>
                        </label>
                      </div>

                      <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
                        <p className="font-semibold mb-2">Colonnes attendues :</p>
                        <ul className="space-y-1 list-disc list-inside">
                          <li><code>siret</code> - SIRET 14 chiffres</li>
                          <li><code>Entreprise</code> - Nom de l'entreprise</li>
                          <li><code>nomUniteLegale</code> + <code>prenom1UniteLegale</code> - Pour les EI</li>
                          <li><code>activitePrincipaleEtablissement</code> - Code NAF</li>
                          <li><code>categorieJuridiqueUniteLegale</code> - Code juridique</li>
                          <li><code>coordonneeLambertAbscisseEtablissement</code> - Lambert X</li>
                          <li><code>coordonneeLambertOrdonneeEtablissement</code> - Lambert Y</li>
                        </ul>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
              
              {/* Ideas Button - Admin Only */}
              {isAdmin && (
                <Dialog open={ideasOpen} onOpenChange={setIdeasOpen}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 px-3 text-xs border-yellow-500/50 hover:bg-yellow-500/10 hover:border-yellow-500 transition-all duration-300"
                    >
                      <Lightbulb className="w-3.5 h-3.5 mr-1.5 text-yellow-500" />
                      Idées
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <Lightbulb className="w-5 h-5 text-yellow-500" />
                        Idées développement
                      </DialogTitle>
                    </DialogHeader>
                    
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        Notez vos idées d'amélioration pour l'application. Elles seront sauvegardées localement.
                      </p>
                      
                      <Textarea
                        value={ideas}
                        onChange={(e) => setIdeas(e.target.value)}
                        placeholder="Ex: Ajouter un filtre par date de création...&#10;Améliorer l'affichage mobile...&#10;Nouvelle fonctionnalité CRM..."
                        className="min-h-[200px] resize-none"
                      />
                      
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          onClick={() => setIdeasOpen(false)}
                        >
                          Annuler
                        </Button>
                        <Button
                          onClick={handleSaveIdeas}
                          className="bg-yellow-500 hover:bg-yellow-600 text-black"
                        >
                          Sauvegarder
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
              <NotificationCenter userId={userId} onSelectEntreprise={onSelectEntreprise} />
              <AccountMenu
                userEmail={userEmail}
                subscriptionStatus={subscriptionStatus}
                subscriptionPlan={subscriptionPlan}
                daysRemaining={daysRemaining}
                endDate={endDate}
                onLogout={onLogout}
              />
            </div>
          </>
        )}
      </div>
      
      {/* Mobile Navigation Buttons */}
      {isMobile && (
        <div className="grid grid-cols-3 gap-2 mt-3">
          {viewConfig.map((v) => (
            <Button
              key={v.key}
              variant={view === v.key ? "default" : "outline"}
              size="sm"
              onClick={() => handleViewChange(v.key)}
              className={`h-10 text-xs font-medium transition-all ${
                view === v.key 
                  ? "bg-accent text-primary hover:bg-accent/90" 
                  : "hover:bg-accent/10"
              }`}
            >
              {v.label}
            </Button>
          ))}
        </div>
      )}
    </header>
  );
};
