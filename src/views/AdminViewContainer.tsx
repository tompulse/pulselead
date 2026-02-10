import { useState, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, Database, Settings, FileText, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';

interface AdminViewContainerProps {
  userId: string;
}

export const AdminViewContainer = ({ userId }: AdminViewContainerProps) => {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressText, setProgressText] = useState('');
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

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
      let text = await file.text();
      console.log('📄 CSV loaded, size:', text.length, 'bytes');
      
      // Remove UTF-8 BOM if present
      if (text.charCodeAt(0) === 0xFEFF) {
        text = text.slice(1);
        console.log('🔧 UTF-8 BOM removed');
      }
      
      // Handle different line endings (Windows \r\n, Unix \n, Mac \r)
      const lines = text
        .replace(/\r\n/g, '\n')
        .replace(/\r/g, '\n')
        .split('\n')
        .filter(line => line.trim());
      
      console.log('📊 Lines found:', lines.length);
      console.log('🔍 First 3 lines:', lines.slice(0, 3));
      
      if (lines.length < 2) {
        throw new Error('Le fichier CSV est vide ou ne contient pas de données. Vérifiez que le fichier contient au moins une ligne d\'en-tête et une ligne de données.');
      }

      const firstLine = lines[0];
      const delimiter = firstLine.includes(';') ? ';' : ',';
      console.log('🔍 Delimiter detected:', delimiter);
      
      const headers = firstLine.split(delimiter).map(h => h.trim().replace(/^["']|["']$/g, ''));
      console.log('📋 Headers found:', headers);
      console.log('📋 Number of headers:', headers.length);
      
      // Check if SIRET column exists (case-insensitive)
      const siretHeader = headers.find(h => h.toLowerCase() === 'siret');
      if (!siretHeader) {
        throw new Error(`Colonne "siret" introuvable dans le CSV. Colonnes trouvées: ${headers.join(', ')}`);
      }
      console.log('✅ SIRET column found:', siretHeader);
      
      const jsonData = lines.slice(1).map((line, index) => {
        const values = line.split(delimiter).map(v => v.trim().replace(/^["']|["']$/g, ''));
        const row: any = {};
        headers.forEach((header, idx) => {
          row[header] = values[idx] || '';
        });
        return row;
      }).filter((row, index) => {
        const hasSiret = row[siretHeader] && row[siretHeader].length > 0;
        if (!hasSiret && index < 3) {
          console.log(`⚠️ Row ${index + 1} filtered (no SIRET):`, row);
        }
        return hasSiret;
      });

      console.log('✅ Valid records with SIRET:', jsonData.length);
      console.log('🔬 First record:', jsonData[0]);
      console.log('🔬 First 3 records:', jsonData.slice(0, 3));
      
      if (jsonData.length === 0) {
        throw new Error(`Aucune ligne valide trouvée. Le fichier contient ${lines.length - 1} lignes de données mais aucune n'a de SIRET valide.`);
      }
      
      setProgress(20);
      setProgressText(`${jsonData.length} lignes détectées...`);
      
      // Log what will be sent to the Edge Function
      console.log('📤 About to send to Edge Function:', {
        numberOfRecords: jsonData.length,
        firstRecordKeys: Object.keys(jsonData[0] || {}),
        sampleRecord: jsonData[0]
      });

      // Import en batches
      const BATCH_SIZE = 500;
      let totalInserted = 0;
      let totalErrors = 0;

      for (let i = 0; i < jsonData.length; i += BATCH_SIZE) {
        const batch = jsonData.slice(i, i + BATCH_SIZE);
        const currentLine = Math.min(i + BATCH_SIZE, jsonData.length);
        const batchNum = Math.floor(i / BATCH_SIZE) + 1;
        
        console.log(`📦 Batch ${batchNum}: Sending ${batch.length} records...`);
        setProgressText(`Import ${currentLine}/${jsonData.length} lignes...`);
        
        console.log(`📤 Sending batch ${batchNum} with ${batch.length} records...`);
        console.log(`📤 Sample of batch data:`, batch[0]);
        
        const { data: responseData, error } = await supabase.functions.invoke('import-nouveaux-sites', {
          body: { entreprises: batch }
        });

        if (error) {
          console.error(`❌ Batch ${batchNum} error:`, error);
          console.error('❌ Error message:', error.message);
          console.error('❌ Error details:', JSON.stringify(error, null, 2));
          console.error('❌ Batch sample that failed:', batch.slice(0, 2));
          totalErrors += batch.length;
        } else {
          console.log(`✅ Batch ${batchNum} response:`, responseData);
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

  return (
    <div className="h-full overflow-y-auto p-4 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold gradient-text">Panneau Admin</h1>
        <p className="text-muted-foreground">Gestion et configuration de PulseLead</p>
      </div>

      {/* Import CSV Section */}
      <Card className="p-6 glass-card border-accent/20">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-accent/10">
              <Upload className="w-6 h-6 text-accent" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Import CSV Hebdomadaire</h2>
              <p className="text-sm text-muted-foreground">Importer de nouveaux prospects depuis un fichier CSV</p>
            </div>
          </div>

          <div className="space-y-3">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleImportCSV}
              className="hidden"
            />
            
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={loading}
              className="w-full sm:w-auto"
              size="lg"
            >
              <Upload className="w-4 h-4 mr-2" />
              Sélectionner un fichier CSV
            </Button>

            {loading && (
              <div className="space-y-2">
                <Progress value={progress} className="w-full" />
                <p className="text-sm text-muted-foreground">{progressText}</p>
              </div>
            )}

            {result && (
              <div className={`p-3 rounded-lg border ${
                result.success 
                  ? 'bg-green-500/10 border-green-500/30 text-green-600' 
                  : 'bg-red-500/10 border-red-500/30 text-red-600'
              }`}>
                {result.message}
              </div>
            )}

            <div className="text-xs text-muted-foreground space-y-1">
              <p><strong>Format attendu :</strong></p>
              <p>siret;Entreprise;date_creation;siege;categorie_juridique;categorie_entreprise;complement_adresse;numero_voie;type_voie;libelle_voie;code_postal;ville;coordonnee_lambert_x;coordonnee_lambert_y;code_naf</p>
              <p className="mt-2"><strong>Séparateur :</strong> point-virgule (;)</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Future Features Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Database Stats */}
        <Card className="p-4 glass-card border-accent/20 opacity-50">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-accent" />
              <h3 className="font-bold">Statistiques DB</h3>
            </div>
            <p className="text-xs text-muted-foreground">Tableau de bord des données (à venir)</p>
          </div>
        </Card>

        {/* User Management */}
        <Card className="p-4 glass-card border-accent/20 opacity-50">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-accent" />
              <h3 className="font-bold">Gestion Utilisateurs</h3>
            </div>
            <p className="text-xs text-muted-foreground">Gestion des comptes et abonnements (à venir)</p>
          </div>
        </Card>

        {/* Reports */}
        <Card className="p-4 glass-card border-accent/20 opacity-50">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-accent" />
              <h3 className="font-bold">Rapports</h3>
            </div>
            <p className="text-xs text-muted-foreground">Génération de rapports d'activité (à venir)</p>
          </div>
        </Card>

        {/* Advanced Analytics */}
        <Card className="p-4 glass-card border-accent/20 opacity-50">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-accent" />
              <h3 className="font-bold">Analytics Avancées</h3>
            </div>
            <p className="text-xs text-muted-foreground">Métriques et insights approfondis (à venir)</p>
          </div>
        </Card>
      </div>
    </div>
  );
};
