import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload, AlertCircle, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";

export const ImportDialog = () => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const { toast } = useToast();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.json')) {
      toast({
        title: "Format invalide",
        description: "Veuillez sélectionner un fichier JSON",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setProgress(10);
    setResult(null);

    try {
      // Read file
      const text = await file.text();
      setProgress(30);
      
      // Parse JSON
      const data = JSON.parse(text);
      setProgress(50);

      if (!Array.isArray(data)) {
        throw new Error("Le fichier doit contenir un tableau d'entreprises");
      }

      // Call import function
      const { data: responseData, error } = await supabase.functions.invoke('import-entreprises', {
        body: { entreprises: data }
      });

      setProgress(100);

      if (error) throw error;

      setResult({
        success: true,
        message: responseData.message || `${responseData.inserted} entreprises importées`
      });

      toast({
        title: "✅ Import réussi",
        description: responseData.message,
      });

      // Reload page after 2 seconds
      setTimeout(() => {
        window.location.reload();
      }, 2000);

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
          <div className="text-sm text-muted-foreground">
            Sélectionnez un fichier JSON contenant un tableau d'entreprises à importer.
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
              accept=".json"
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
                  {loading ? 'Import en cours...' : 'Sélectionner un fichier JSON'}
                </span>
              </Button>
            </label>
          </div>

          <div className="text-xs text-muted-foreground">
            <p className="font-semibold mb-1">Format attendu :</p>
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
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
