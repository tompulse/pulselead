import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload, AlertCircle, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import JSZip from "jszip";
import * as XLSX from "xlsx";

export const ImportDialog = () => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const [importType, setImportType] = useState<'entreprises' | 'nouveaux-sites'>('entreprises');
  const { toast } = useToast();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Vérifier le format selon le type d'import
    if (importType === 'nouveaux-sites') {
      if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.csv')) {
        toast({
          title: "Format invalide",
          description: "Pour les nouveaux sites, veuillez sélectionner un fichier Excel (.xlsx) ou CSV",
          variant: "destructive",
        });
        return;
      }
    } else {
      if (!file.name.endsWith('.json') && !file.name.endsWith('.zip')) {
        toast({
          title: "Format invalide",
          description: "Pour les créations, veuillez sélectionner un fichier JSON ou ZIP",
          variant: "destructive",
        });
        return;
      }
    }

    setLoading(true);
    setProgress(10);
    setResult(null);

    try {
      // Import de nouveaux sites (Excel/CSV)
      if (importType === 'nouveaux-sites') {
        setProgress(20);

        // Lire et parser le fichier Excel côté client
        const buffer = await file.arrayBuffer();
        const workbook = XLSX.read(buffer, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        setProgress(40);
        console.log(`📊 Parsed ${jsonData.length} rows from Excel`);

        // Envoyer les données en JSON à l'edge function par batch de 1000
        const BATCH_SIZE = 1000;
        let totalInserted = 0;
        let totalErrors = 0;

        for (let i = 0; i < jsonData.length; i += BATCH_SIZE) {
          const batch = jsonData.slice(i, i + BATCH_SIZE);
          
          const { data: responseData, error } = await supabase.functions.invoke('import-nouveaux-sites', {
            body: { entreprises: batch }
          });

          if (error) {
            console.error(`❌ Batch error:`, error);
            totalErrors += batch.length;
          } else {
            totalInserted += responseData?.inserted || 0;
            totalErrors += responseData?.errors || 0;
          }

          const progress = 40 + Math.floor((i + batch.length) / jsonData.length * 60);
          setProgress(progress);
        }

        setProgress(100);

        const successMessage = `${totalInserted} sites importés avec succès${totalErrors > 0 ? ` (${totalErrors} échecs)` : ''}`;
        
        setResult({
          success: true,
          message: successMessage
        });

        toast({
          title: "✅ Import réussi",
          description: successMessage,
        });

        setTimeout(() => {
          window.location.reload();
        }, 3000);

        return;
      }

      // Import d'entreprises classiques (JSON/ZIP)
      let text: string;
      
      // Si c'est un fichier ZIP, extraire le JSON
      if (file.name.endsWith('.zip')) {
        setProgress(15);
        const zip = new JSZip();
        const zipContent = await zip.loadAsync(file);
        
        // Trouver le premier fichier .json dans le ZIP
        const jsonFileName = Object.keys(zipContent.files).find(name => name.endsWith('.json'));
        
        if (!jsonFileName) {
          throw new Error("Aucun fichier JSON trouvé dans l'archive ZIP");
        }
        
        setProgress(25);
        text = await zipContent.files[jsonFileName].async("text");
        
        toast({
          title: "📦 ZIP extrait",
          description: `Fichier ${jsonFileName} extrait avec succès`,
          duration: 2000,
        });
        setProgress(30);
      } else {
        // Read file directly
        text = await file.text();
        setProgress(30);
      }
      
      // Parse JSON
      const data = JSON.parse(text);
      setProgress(50);

      if (!Array.isArray(data)) {
        throw new Error("Le fichier doit contenir un tableau d'entreprises");
      }

      // Process in batches to avoid memory limits
      const BATCH_SIZE = 1000;
      const totalBatches = Math.ceil(data.length / BATCH_SIZE);
      let totalInserted = 0;
      let totalFailed = 0;

      for (let i = 0; i < data.length; i += BATCH_SIZE) {
        const batch = data.slice(i, i + BATCH_SIZE);
        const batchNumber = Math.floor(i / BATCH_SIZE) + 1;
        
        console.log(`Processing batch ${batchNumber}/${totalBatches} (${batch.length} entreprises)...`);
        
        const { data: responseData, error } = await supabase.functions.invoke('import-entreprises', {
          body: { entreprises: batch }
        });

        if (error) {
          console.error(`Error in batch ${batchNumber}:`, error);
          totalFailed += batch.length;
          continue;
        }

        totalInserted += responseData?.inserted || 0;
        
        // Update progress
        const progress = 50 + Math.floor((i + batch.length) / data.length * 50);
        setProgress(progress);
      }

      setProgress(100);

      if (totalFailed === data.length) {
        throw new Error("Toutes les importations ont échoué");
      }

      const successMessage = `${totalInserted} entreprises importées avec succès${totalFailed > 0 ? ` (${totalFailed} échecs)` : ''}`;
      
      setResult({
        success: true,
        message: successMessage
      });

      toast({
        title: "✅ Import réussi",
        description: successMessage,
      });

      // Show qualification notification
      if (totalInserted > 0) {
        setTimeout(() => {
          toast({
            title: "🤖 Qualification IA en cours",
            description: `${Math.min(totalInserted, 100)} nouvelles entreprises en cours d'analyse automatique...`,
            duration: 5000,
          });
        }, 1500);
      }

      // Reload page after 3 seconds
      setTimeout(() => {
        window.location.reload();
      }, 3000);

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
      event.target.value = ''; // Reset input
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-7 px-2 text-xs">
          <Upload className="w-3.5 h-3.5" />
          <span className="hidden lg:inline ml-1">Import JSON</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Importer des entreprises</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Sélection du type d'import */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Type de données à importer</Label>
            <RadioGroup value={importType} onValueChange={(v) => setImportType(v as any)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="entreprises" id="type-entreprises" />
                <Label htmlFor="type-entreprises" className="font-normal cursor-pointer">
                  Créations d'entreprises (JSON/ZIP)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="nouveaux-sites" id="type-nouveaux-sites" />
                <Label htmlFor="type-nouveaux-sites" className="font-normal cursor-pointer">
                  Nouveaux sites (Excel/CSV)
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="text-sm text-muted-foreground">
            {importType === 'entreprises' 
              ? "Sélectionnez un fichier JSON ou ZIP (contenant un JSON) avec un tableau d'entreprises à importer."
              : "Sélectionnez un fichier Excel (.xlsx) ou CSV avec les données des nouveaux sites (avec codes NAF, coordonnées Lambert, etc.)."
            }
          </div>

          {loading && (
            <div className="space-y-2">
              <Progress value={progress} className="w-full" />
              <p className="text-xs text-center text-muted-foreground">
                Import en cours... {progress}%
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
              type="file"
              accept={importType === 'entreprises' ? '.json,.zip' : '.xlsx,.csv'}
              onChange={handleFileSelect}
              disabled={loading}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload">
              <Button 
                variant="default" 
                className="w-full cursor-pointer"
                disabled={loading}
                asChild
              >
                <span>
                  <Upload className="w-4 h-4 mr-2" />
                  {loading 
                    ? 'Import en cours...' 
                    : importType === 'entreprises' 
                      ? 'Sélectionner un fichier (JSON/ZIP)'
                      : 'Sélectionner un fichier (Excel/CSV)'
                  }
                </span>
              </Button>
            </label>
          </div>

          <div className="text-xs text-muted-foreground">
            <p className="font-semibold mb-1">Format attendu :</p>
            {importType === 'entreprises' ? (
              <pre className="bg-muted p-2 rounded text-[10px] overflow-x-auto">
{`[
  {
    "nom": "Entreprise",
    "siret": "12345678901234",
    "adresse": "1 rue...",
    ...
  }
]`}
              </pre>
            ) : (
              <pre className="bg-muted p-2 rounded text-[10px] overflow-x-auto">
{`Colonnes Excel requises:
- siret
- Entreprise (nom)
- activitePrincipaleEtablissement (code NAF)
- coordonneeLambertAbscisseEtablissement (Lambert X)
- coordonneeLambertOrdonneeEtablissement (Lambert Y)
- ...`}
              </pre>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
