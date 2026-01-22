import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Upload, 
  Database, 
  CheckCircle2, 
  AlertCircle, 
  FileJson,
  Loader2,
  Download,
  RefreshCw,
  ExternalLink,
  Info,
  Terminal,
  Copy,
  Check
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ImportStats {
  total: number;
  inserted: number;
  updated: number;
  skipped: number;
  errors: number;
}

interface ImportError {
  index: number;
  nom: string;
  error: string;
}

export const INPIScrapingPanel = () => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressText, setProgressText] = useState('');
  const [updateExisting, setUpdateExisting] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    stats?: ImportStats;
    errors?: ImportError[];
  } | null>(null);
  const [copied, setCopied] = useState(false);

  // URL INPI avec filtres prédéfinis
  const INPI_URL = "https://data.inpi.fr/search?advancedSearch=%257B%2522checkboxes%2522%253A%257B%2522status%2522%253A%257B%2522order%2522%253A0%252C%2522searchField%2522%253A%255B%2522is_rad%2522%255D%252C%2522values%2522%253A%255B%257B%2522value%2522%253A%2522false%2522%252C%2522checked%2522%253Atrue%257D%252C%257B%2522value%2522%253A%2522true%2522%252C%2522checked%2522%253Afalse%257D%255D%257D%257D%252C%2522texts%2522%253A%257B%257D%252C%2522multipleSelects%2522%253A%257B%257D%252C%2522dates%2522%253A%257B%2522start_activity_date%2522%253A%257B%2522order%2522%253A15%252C%2522searchField%2522%253A%255B%2522idt_date_debut_activ%2522%255D%252C%2522startDate%2522%253A1767222000000%252C%2522endDate%2522%253A1774994340000%257D%257D%257D&displayStyle=List&type=companies";

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.json')) {
      toast({
        title: "Format invalide",
        description: "Veuillez sélectionner un fichier JSON exporté par le scraper",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setProgress(10);
    setProgressText("Lecture du fichier...");
    setResult(null);

    try {
      // Lire le fichier
      const text = await file.text();
      const data = JSON.parse(text);
      
      // Extraire les entreprises
      const companies = data.companies || data;
      
      if (!Array.isArray(companies) || companies.length === 0) {
        throw new Error("Aucune entreprise trouvée dans le fichier");
      }

      setProgress(20);
      setProgressText(`${companies.length} entreprises détectées...`);

      // Import par batches
      const BATCH_SIZE = 200;
      const totalBatches = Math.ceil(companies.length / BATCH_SIZE);
      
      const aggregatedStats: ImportStats = {
        total: companies.length,
        inserted: 0,
        updated: 0,
        skipped: 0,
        errors: 0
      };
      const allErrors: ImportError[] = [];

      for (let i = 0; i < companies.length; i += BATCH_SIZE) {
        const batch = companies.slice(i, i + BATCH_SIZE);
        const batchNum = Math.floor(i / BATCH_SIZE) + 1;
        
        setProgressText(`Import batch ${batchNum}/${totalBatches}...`);
        
        const { data: response, error } = await supabase.functions.invoke('import-inpi-scraped', {
          body: { 
            companies: batch,
            update_existing: updateExisting
          }
        });

        if (error) {
          console.error(`Erreur batch ${batchNum}:`, error);
          aggregatedStats.errors += batch.length;
        } else if (response?.stats) {
          aggregatedStats.inserted += response.stats.inserted || 0;
          aggregatedStats.updated += response.stats.updated || 0;
          aggregatedStats.skipped += response.stats.skipped || 0;
          aggregatedStats.errors += response.stats.errors || 0;
          
          if (response.errors) {
            allErrors.push(...response.errors);
          }
        }

        const progressPercent = 20 + Math.floor(((i + batch.length) / companies.length) * 75);
        setProgress(progressPercent);
      }

      setProgress(100);
      setProgressText("Import terminé !");

      setResult({
        success: aggregatedStats.inserted > 0 || aggregatedStats.updated > 0,
        stats: aggregatedStats,
        errors: allErrors.slice(0, 20)
      });

      toast({
        title: aggregatedStats.inserted > 0 ? "Import réussi" : "Import terminé",
        description: `${aggregatedStats.inserted} insérés, ${aggregatedStats.updated} mis à jour, ${aggregatedStats.skipped} ignorés`,
      });

    } catch (error) {
      console.error('Import error:', error);
      const message = error instanceof Error ? error.message : "Erreur lors de l'import";
      
      setResult({
        success: false,
        errors: [{ index: 0, nom: 'Fichier', error: message }]
      });

      toast({
        title: "Erreur d'import",
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

  const copyCommand = () => {
    navigator.clipboard.writeText('python3 scrape_inpi_complet.py --headless --limit 500');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Database className="w-6 h-6 text-accent" />
            Scraping INPI
          </h2>
          <p className="text-muted-foreground">
            Import des données d'entreprises depuis data.inpi.fr
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.open(INPI_URL, '_blank')}
        >
          <ExternalLink className="w-4 h-4 mr-2" />
          Ouvrir INPI
        </Button>
      </div>

      <Tabs defaultValue="import" className="space-y-4">
        <TabsList>
          <TabsTrigger value="import">Import JSON</TabsTrigger>
          <TabsTrigger value="guide">Guide Scraping</TabsTrigger>
        </TabsList>

        {/* Onglet Import */}
        <TabsContent value="import" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileJson className="w-5 h-5" />
                Importer un fichier JSON
              </CardTitle>
              <CardDescription>
                Importez les données scrapées depuis le fichier JSON généré par le script
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Options */}
              <div className="flex items-center space-x-2">
                <Switch
                  id="update-existing"
                  checked={updateExisting}
                  onCheckedChange={setUpdateExisting}
                />
                <Label htmlFor="update-existing">
                  Mettre à jour les entreprises existantes
                </Label>
              </div>

              {/* Zone d'upload */}
              <div className="border-2 border-dashed border-accent/30 rounded-lg p-8 text-center hover:border-accent/50 transition-colors">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  disabled={loading}
                  className="hidden"
                  id="json-upload"
                />
                <label htmlFor="json-upload" className="cursor-pointer">
                  <div className="flex flex-col items-center gap-3">
                    {loading ? (
                      <Loader2 className="w-12 h-12 text-accent animate-spin" />
                    ) : (
                      <Upload className="w-12 h-12 text-accent/60" />
                    )}
                    <div>
                      <p className="font-medium">
                        {loading ? 'Import en cours...' : 'Cliquez pour sélectionner un fichier'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Fichier JSON généré par scrape_inpi_complet.py
                      </p>
                    </div>
                  </div>
                </label>
              </div>

              {/* Progress */}
              {loading && (
                <div className="space-y-2">
                  <Progress value={progress} className="w-full" />
                  <p className="text-sm text-center text-muted-foreground">
                    {progressText} ({progress}%)
                  </p>
                </div>
              )}

              {/* Résultat */}
              {result && (
                <Alert variant={result.success ? "default" : "destructive"}>
                  {result.success ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <AlertCircle className="h-4 w-4" />
                  )}
                  <AlertDescription>
                    {result.stats && (
                      <div className="space-y-2">
                        <p className="font-medium">
                          {result.success ? "Import terminé avec succès" : "Import terminé avec des erreurs"}
                        </p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          <Badge variant="secondary">
                            Total: {result.stats.total}
                          </Badge>
                          <Badge variant="default" className="bg-green-500">
                            Insérés: {result.stats.inserted}
                          </Badge>
                          <Badge variant="default" className="bg-blue-500">
                            Mis à jour: {result.stats.updated}
                          </Badge>
                          <Badge variant="outline">
                            Ignorés: {result.stats.skipped}
                          </Badge>
                          {result.stats.errors > 0 && (
                            <Badge variant="destructive">
                              Erreurs: {result.stats.errors}
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {result.errors && result.errors.length > 0 && (
                      <ScrollArea className="h-32 mt-3 rounded border p-2">
                        <div className="space-y-1 text-xs">
                          {result.errors.map((err, i) => (
                            <p key={i} className="text-destructive">
                              #{err.index} {err.nom}: {err.error}
                            </p>
                          ))}
                        </div>
                      </ScrollArea>
                    )}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet Guide */}
        <TabsContent value="guide" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Terminal className="w-5 h-5" />
                Guide du Scraping
              </CardTitle>
              <CardDescription>
                Comment utiliser le script Selenium pour scraper les données INPI
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Étape 1 */}
              <div className="space-y-2">
                <h4 className="font-semibold flex items-center gap-2">
                  <Badge>1</Badge>
                  Installation
                </h4>
                <div className="bg-muted rounded-lg p-3 font-mono text-sm">
                  pip3 install selenium webdriver-manager requests python-dotenv
                </div>
              </div>

              {/* Étape 2 */}
              <div className="space-y-2">
                <h4 className="font-semibold flex items-center gap-2">
                  <Badge>2</Badge>
                  Lancer le scraping
                </h4>
                <div className="bg-muted rounded-lg p-3 font-mono text-sm flex items-center justify-between">
                  <code>python3 scrape_inpi_complet.py --headless --limit 500</code>
                  <Button variant="ghost" size="sm" onClick={copyCommand}>
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Options disponibles:
                </p>
                <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                  <li><code>--headless</code> : Mode sans interface graphique</li>
                  <li><code>--limit 100</code> : Limite le nombre d'entreprises</li>
                  <li><code>--no-details</code> : Ne récupère pas les détails (plus rapide)</li>
                  <li><code>--url "..."</code> : URL INPI personnalisée</li>
                </ul>
              </div>

              {/* Étape 3 */}
              <div className="space-y-2">
                <h4 className="font-semibold flex items-center gap-2">
                  <Badge>3</Badge>
                  Récupérer le fichier
                </h4>
                <p className="text-sm text-muted-foreground">
                  Le fichier JSON sera généré dans <code>data/inpi_scrapes/</code>
                </p>
              </div>

              {/* Étape 4 */}
              <div className="space-y-2">
                <h4 className="font-semibold flex items-center gap-2">
                  <Badge>4</Badge>
                  Importer dans PulseLead
                </h4>
                <p className="text-sm text-muted-foreground">
                  Utilisez l'onglet "Import JSON" ci-dessus pour importer le fichier généré.
                </p>
              </div>

              {/* Info */}
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <p className="font-medium">Données récupérées automatiquement :</p>
                  <ul className="text-sm mt-2 space-y-1">
                    <li>• Nom de l'entreprise, SIREN/SIRET</li>
                    <li>• <strong>Dirigeant</strong> et fonction</li>
                    <li>• Adresse complète, code postal, ville</li>
                    <li>• Code NAF, activité, forme juridique</li>
                    <li>• Date de création, capital</li>
                  </ul>
                </AlertDescription>
              </Alert>

              {/* Bouton CLI alternative */}
              <div className="pt-4 border-t">
                <h4 className="font-semibold mb-2">Alternative : Import en ligne de commande</h4>
                <div className="bg-muted rounded-lg p-3 font-mono text-sm">
                  python3 import_scraped_to_supabase.py data/inpi_scrapes/inpi_export_*.json
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Nécessite un fichier .env avec SUPABASE_URL et SUPABASE_SERVICE_KEY
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
