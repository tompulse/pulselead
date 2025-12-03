import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Upload, CheckCircle2, Loader2, Database, MapPin, Tags, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import * as XLSX from 'xlsx';

type ImportStep = 'idle' | 'parsing' | 'importing' | 'geocoding' | 'harmonizing' | 'complete' | 'error';

interface ImportState {
  step: ImportStep;
  progress: number;
  currentLine: number;
  totalLines: number;
  inserted: number;
  message: string;
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

  const parseCSV = useCallback(async (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'binary', codepage: 65001 });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
            raw: false,
            defval: ''
          });
          resolve(jsonData);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error('Erreur de lecture du fichier'));
      reader.readAsBinaryString(file);
    });
  }, []);

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      // Step 1: Parse CSV
      setState({ step: 'parsing', progress: 5, currentLine: 0, totalLines: 0, inserted: 0, message: 'Lecture du fichier...' });
      
      const data = await parseCSV(file);
      const totalLines = data.length;
      
      setState(s => ({ ...s, totalLines, progress: 10, message: `${totalLines.toLocaleString()} lignes détectées` }));

      // Step 2: Import in batches
      setState(s => ({ ...s, step: 'importing', message: 'Import en cours...' }));
      
      const batchSize = 500;
      const batches = Math.ceil(totalLines / batchSize);
      let totalInserted = 0;

      for (let i = 0; i < batches; i++) {
        const start = i * batchSize;
        const end = Math.min(start + batchSize, totalLines);
        const batch = data.slice(start, end);

        const { data: result, error } = await supabase.functions.invoke('import-nouveaux-sites-csv', {
          body: { 
            entreprises: batch,
            batchIndex: i,
            totalBatches: batches
          }
        });

        if (error) {
          console.error('Batch error:', error);
        } else if (result?.inserted) {
          totalInserted += result.inserted;
        }

        const progress = 10 + (80 * (i + 1) / batches);
        setState(s => ({
          ...s,
          progress,
          currentLine: end,
          inserted: totalInserted,
          message: `Import: ${end.toLocaleString()} / ${totalLines.toLocaleString()} lignes`
        }));
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
        description: `${totalInserted.toLocaleString()} entreprises ont été importées dans la base de données.`,
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
  }, [parseCSV, toast]);

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
      case 'geocoding': return <MapPin className="h-5 w-5 text-primary animate-pulse" />;
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
        </DialogHeader>

        <div className="space-y-4 py-4">
          {state.step === 'idle' ? (
            <div className="border-2 border-dashed border-muted rounded-lg p-8 text-center">
              <Upload className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-4">
                Sélectionnez un fichier CSV avec les colonnes:<br/>
                <span className="text-xs">siret, dateCreationEtablissement, Entreprise, codePostal, etc.</span>
              </p>
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button variant="default" className="gap-2" asChild>
                  <span>
                    <Upload className="h-4 w-4" />
                    Choisir un fichier
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
