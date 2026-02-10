import { useState, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, Database, Settings, FileText, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import { csvRowToNouveauxSitesRecord } from '@/utils/csvImportHelpers';

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
      let text = await file.text();
      console.log('[Import Admin] Fichier:', file.name, 'Taille:', text?.length ?? 0, 'octets');
      if (!text || text.length === 0) {
        throw new Error('Fichier vide (0 octet).');
      }
      if (text.charCodeAt(0) === 0xFEFF) text = text.slice(1);
      text = text.replace(/\0/g, '');
      const rawLines = text.split(/\r\n|\r|\n/);
      const lines = rawLines.map(l => l.trim()).filter(Boolean);
      console.log('[Import Admin] Lignes brutes:', rawLines.length, 'Lignes non vides:', lines.length);
      if (lines.length === 0) {
        throw new Error(`Fichier vide après lecture (${rawLines.length} lignes brutes). Enregistrez le CSV en UTF-8 ou "CSV (séparateur : point-virgule)".`);
      }
      if (lines.length < 2) {
        throw new Error(`Une seule ligne détectée. Ajoutez des données sous l'en-tête. Ré-enregistrez en "CSV UTF-8" ou "CSV (;)". Lignes brutes : ${rawLines.length}.`);
      }

      const firstLine = lines[0];
      const delimiter = firstLine.includes(';') ? ';' : ',';
      const headers = firstLine.split(delimiter).map(h => h.trim().replace(/^["']|["']$/g, ''));
      const col: Record<string, string> = {};
      headers.forEach(h => { col[h.toLowerCase()] = h; });
      if (!col['siret']) {
        throw new Error(`Colonne "siret" introuvable. Colonnes: ${headers.join(', ')}`);
      }

      const rows: Record<string, string>[] = lines.slice(1).map(line => {
        const values = line.split(delimiter).map(v => v.trim().replace(/^["']|["']$/g, ''));
        const row: Record<string, string> = {};
        headers.forEach((header, idx) => { row[header] = values[idx] ?? ''; });
        return row;
      });

      const dataToInsert: Record<string, unknown>[] = [];
      for (const row of rows) {
        const rec = csvRowToNouveauxSitesRecord(row, col);
        if (rec) dataToInsert.push(rec);
      }
      if (dataToInsert.length === 0) {
        throw new Error('Aucune ligne valide (chaque ligne doit avoir un SIRET).');
      }

      setProgress(15);
      setProgressText(`${dataToInsert.length} lignes à importer...`);

      const BATCH_SIZE = 100;
      const totalBatches = Math.ceil(dataToInsert.length / BATCH_SIZE);
      let totalInserted = 0;
      let totalErrors = 0;

      for (let i = 0; i < dataToInsert.length; i += BATCH_SIZE) {
        const batch = dataToInsert.slice(i, i + BATCH_SIZE);
        const batchNum = Math.floor(i / BATCH_SIZE) + 1;
        const currentLine = Math.min(i + BATCH_SIZE, dataToInsert.length);
        setProgressText(`Import ${batchNum}/${totalBatches} (${currentLine}/${dataToInsert.length})...`);
        setProgress(15 + Math.floor((currentLine / dataToInsert.length) * 80));

        const { error } = await supabase
          .from('nouveaux_sites')
          .upsert(batch, { onConflict: 'siret' });

        if (error) {
          totalErrors += batch.length;
        } else {
          totalInserted += batch.length;
        }
      }

      setProgress(100);
      setProgressText("Import terminé.");
      const successMessage = `${totalInserted} établissements importés${totalErrors > 0 ? ` (${totalErrors} erreurs)` : ''}`;
      setResult({ success: totalInserted > 0, message: successMessage });
      toast({
        title: totalInserted > 0 ? "Import réussi" : "Import partiel",
        description: successMessage,
      });
      if (totalInserted > 0) {
        setTimeout(() => window.location.reload(), 2000);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erreur lors de l'import";
      console.error('[Import Admin] Erreur:', message, error);
      setResult({ success: false, message });
      toast({ title: "Erreur d'import", description: message, variant: "destructive" });
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
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
              <p><strong>Colonnes acceptées (ordre libre, casse ignorée) :</strong></p>
              <p>siret, Entreprise, date_creation, siege, categorie_juridique, categorieEntreprise, complement_adresse, numero_voie, type_voie, libelle_voie, code_postal, ville, coordonnee_lambert_x/y, activitePrincipaleEtablissement (ou code_naf), etc.</p>
              <p className="mt-2"><strong>Séparateur :</strong> point-virgule (;) ou virgule (,)</p>
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
