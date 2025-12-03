import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Upload, CheckCircle2, Loader2, Database, Tags, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

type ImportStep = 'idle' | 'parsing' | 'importing' | 'harmonizing' | 'complete' | 'error';

interface ImportState {
  step: ImportStep;
  progress: number;
  currentLine: number;
  totalLines: number;
  inserted: number;
  message: string;
}

// Parse CSV with semicolon delimiter
function parseCSVContent(content: string): any[] {
  const lines = content.split('\n').filter(line => line.trim());
  if (lines.length < 2) return [];

  // Get headers from first line
  const headers = lines[0].split(';').map(h => h.trim().replace(/^"|"$/g, ''));
  
  const data: any[] = [];
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(';').map(v => v.trim().replace(/^"|"$/g, ''));
    if (values.length >= headers.length - 2) { // Allow some missing columns
      const row: any = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      data.push(row);
    }
  }
  return data;
}

export function AdminNouveauxSitesImport() {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<ImportState>({
    step: 'idle',
    progress: 0,
    currentLine: 0,
    totalLines: 0,
    inserted: 0,
    message: ''
  });
  const { toast } = useToast();

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      // Step 1: Parse CSV
      setState({ step: 'parsing', progress: 2, currentLine: 0, totalLines: 0, inserted: 0, message: 'Lecture du fichier...' });
      
      const content = await file.text();
      const data = parseCSVContent(content);
      const totalLines = data.length;
      
      console.log(`Parsed ${totalLines} rows from CSV`);
      
      if (totalLines === 0) {
        throw new Error('Aucune donnée trouvée dans le fichier');
      }
      
      setState(s => ({ ...s, totalLines, progress: 5, message: `${totalLines.toLocaleString()} lignes détectées` }));

      // Step 2: Import in batches
      setState(s => ({ ...s, step: 'importing', progress: 8, message: 'Import en cours...' }));
      
      const batchSize = 300; // Smaller batches for reliability
      const batches = Math.ceil(totalLines / batchSize);
      let totalInserted = 0;
      let errors: string[] = [];

      for (let i = 0; i < batches; i++) {
        const start = i * batchSize;
        const end = Math.min(start + batchSize, totalLines);
        const batch = data.slice(start, end);

        try {
          console.log(`Sending batch ${i + 1}/${batches} (${batch.length} records)`);
          
          const { data: result, error } = await supabase.functions.invoke('import-nouveaux-sites-csv', {
            body: { 
              entreprises: batch,
              batchIndex: i,
              totalBatches: batches
            }
          });

          if (error) {
            console.error('Batch error:', error);
            errors.push(`Batch ${i + 1}: ${error.message}`);
          } else if (result?.inserted) {
            totalInserted += result.inserted;
            console.log(`Batch ${i + 1} inserted ${result.inserted} records`);
          } else if (result?.error) {
            console.error('Function error:', result.error);
            errors.push(`Batch ${i + 1}: ${result.error}`);
          }
        } catch (batchError) {
          console.error('Batch exception:', batchError);
          errors.push(`Batch ${i + 1}: Exception`);
        }

        const progress = 8 + (82 * (i + 1) / batches);
        setState(s => ({
          ...s,
          progress,
          currentLine: end,
          inserted: totalInserted,
          message: `Import: ${end.toLocaleString()} / ${totalLines.toLocaleString()} lignes`
        }));

        // Small delay between batches to avoid overwhelming the server
        if (i < batches - 1) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      // Step 3: Harmonize categories
      setState(s => ({ ...s, step: 'harmonizing', progress: 92, message: 'Harmonisation des catégories...' }));
      
      try {
        await supabase.functions.invoke('harmonize-categories');
      } catch (e) {
        console.warn('Harmonization warning:', e);
      }

      // Complete
      setState({
        step: 'complete',
        progress: 100,
        currentLine: totalLines,
        totalLines,
        inserted: totalInserted,
        message: `Import terminé: ${totalInserted.toLocaleString()} entreprises ajoutées`
      });

      toast({
        title: "Import réussi",
        description: `${totalInserted.toLocaleString()} entreprises ont été importées.${errors.length > 0 ? ` (${errors.length} erreurs)` : ''}`,
      });

    } catch (error) {
      console.error('Import error:', error);
      setState(s => ({ 
        ...s, 
        step: 'error', 
        message: error instanceof Error ? error.message : 'Erreur inconnue'
      }));
      toast({
        title: "Erreur d'import",
        description: error instanceof Error ? error.message : 'Une erreur est survenue',
        variant: "destructive"
      });
    }
  }, [toast]);

  const resetState = useCallback(() => {
    setState({
      step: 'idle',
      progress: 0,
      currentLine: 0,
      totalLines: 0,
      inserted: 0,
      message: ''
    });
  }, []);

  const handleOpenChange = useCallback((newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      resetState();
    }
  }, [resetState]);

  const getStepIcon = () => {
    switch (state.step) {
      case 'parsing': return <Loader2 className="h-5 w-5 animate-spin text-primary" />;
      case 'importing': return <Database className="h-5 w-5 text-primary animate-pulse" />;
      case 'harmonizing': return <Tags className="h-5 w-5 text-primary animate-pulse" />;
      case 'complete': return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'error': return <AlertCircle className="h-5 w-5 text-destructive" />;
      default: return <Upload className="h-5 w-5 text-muted-foreground" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Database className="h-4 w-4" />
          Ajout données - Nouveaux sites
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" />
            Import des nouveaux sites
          </DialogTitle>
          <DialogDescription>
            Importez un fichier CSV pour ajouter des entreprises à la base de données.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {state.step === 'idle' ? (
            <div className="border-2 border-dashed border-muted rounded-lg p-8 text-center">
              <Upload className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-4">
                Format attendu: CSV avec séparateur point-virgule (;)<br/>
                <span className="text-xs">siret, dateCreationEtablissement, Entreprise, codePostalEtablissement...</span>
              </p>
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button variant="default" className="gap-2" asChild>
                  <span>
                    <Upload className="h-4 w-4" />
                    Choisir un fichier CSV
                  </span>
                </Button>
              </label>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                {getStepIcon()}
                <div className="flex-1">
                  <p className="font-medium">{state.message}</p>
                  {state.totalLines > 0 && state.step !== 'complete' && (
                    <p className="text-sm text-muted-foreground">
                      {state.currentLine.toLocaleString()} / {state.totalLines.toLocaleString()} lignes
                    </p>
                  )}
                </div>
              </div>

              <Progress value={state.progress} className="h-2" />

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-muted-foreground">Progression</p>
                  <p className="text-2xl font-bold">{Math.round(state.progress)}%</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-muted-foreground">Entreprises</p>
                  <p className="text-2xl font-bold">{state.inserted.toLocaleString()}</p>
                </div>
              </div>

              {state.step === 'complete' && (
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                    <CheckCircle2 className="h-5 w-5" />
                    <span className="font-medium">Import terminé avec succès!</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Les entreprises sont maintenant visibles dans l'outil Prospects.
                  </p>
                </div>
              )}

              {state.step === 'error' && (
                <Button variant="outline" onClick={resetState} className="w-full">
                  Réessayer
                </Button>
              )}

              {state.step === 'complete' && (
                <Button variant="default" onClick={() => handleOpenChange(false)} className="w-full">
                  Fermer
                </Button>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
