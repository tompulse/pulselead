import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function AdminImport() {
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [results, setResults] = useState<{ imported: number; errors: number } | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResults(null);
    }
  };

  const handleImport = async () => {
    if (!file) return;

    setImporting(true);
    setProgress({ current: 0, total: 0 });
    setResults(null);

    try {
      // Lire le fichier CSV
      const text = await file.text();
      const lines = text.split('\n');
      const headers = lines[0].split(';');

      // Parser les données
      const data = [];
      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        
        const values = lines[i].split(';');
        const row: any = {};
        headers.forEach((header, index) => {
          row[header.trim()] = values[index]?.trim() || '';
        });
        
        // Validation SIRET
        if (row.siret && row.siret.length === 14 && row.Entreprise) {
          data.push(row);
        }
      }

      console.log(`📊 ${data.length} lignes valides à importer`);
      setProgress({ current: 0, total: data.length });

      // Import par batch de 100
      const batchSize = 100;
      let imported = 0;
      let errors = 0;

      for (let i = 0; i < data.length; i += batchSize) {
        const batch = data.slice(i, i + batchSize);
        
        // Préparer les données
        const records = batch.map(row => {
          // Conversion date
          let date_creation = null;
          if (row.date_creation) {
            const parts = row.date_creation.split('/');
            if (parts.length === 3) {
              date_creation = `${parts[2]}-${parts[1]}-${parts[0]}`;
            }
          }

          // Conversion booléen
          const est_siege = ['VRAI', 'TRUE', '1', 'OUI'].includes(row.siege?.toUpperCase());

          return {
            siret: row.siret,
            nom: row.Entreprise,
            date_creation,
            est_siege,
            categorie_juridique: row.categorie_juridique || null,
            categorie_entreprise: row.categorie_entreprise || null,
            complement_adresse: row.complement_adresse || null,
            numero_voie: row.numero_voie || null,
            type_voie: row.type_voie || null,
            libelle_voie: row.libelle_voie || null,
            code_postal: row.code_postal || null,
            ville: row.ville || null,
            code_naf: row.code_naf || null,
            coordonnee_lambert_x: parseFloat(row.coordonnee_lambert_x) || null,
            coordonnee_lambert_y: parseFloat(row.coordonnee_lambert_y) || null,
          };
        });

        try {
          const { error } = await supabase
            .from('nouveaux_sites')
            .upsert(records, { onConflict: 'siret' });

          if (error) throw error;
          
          imported += records.length;
          setProgress({ current: imported, total: data.length });
        } catch (err) {
          console.error('Erreur batch:', err);
          errors += batch.length;
        }
      }

      setResults({ imported, errors });
      
      toast({
        title: "Import terminé !",
        description: `${imported} entreprises importées avec succès`,
      });

    } catch (error) {
      console.error('Erreur import:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'importer le fichier",
        variant: "destructive",
      });
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="container max-w-4xl mx-auto p-6">
      <Button
        variant="ghost"
        onClick={() => navigate('/dashboard')}
        className="mb-4"
      >
        ← Retour
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Import CSV - Admin</CardTitle>
          <CardDescription>
            Importer un fichier CSV de nouvelles entreprises (format avec point-virgule)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Upload */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
              id="csv-upload"
              disabled={importing}
            />
            <label
              htmlFor="csv-upload"
              className="cursor-pointer text-primary hover:underline"
            >
              {file ? file.name : 'Cliquez pour sélectionner un fichier CSV'}
            </label>
            <p className="text-sm text-gray-500 mt-2">
              Colonnes attendues : siret, Entreprise, date_creation, siege, categorie_juridique, etc.
            </p>
          </div>

          {/* Bouton Import */}
          {file && !importing && !results && (
            <Button
              onClick={handleImport}
              className="w-full"
              size="lg"
            >
              <Upload className="w-4 h-4 mr-2" />
              Importer {file.name}
            </Button>
          )}

          {/* Progression */}
          {importing && (
            <div className="space-y-2">
              <div className="flex items-center justify-center space-x-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Import en cours...</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all"
                  style={{
                    width: `${progress.total > 0 ? (progress.current / progress.total) * 100 : 0}%`,
                  }}
                />
              </div>
              <p className="text-center text-sm text-gray-600">
                {progress.current} / {progress.total} entreprises
              </p>
            </div>
          )}

          {/* Résultats */}
          {results && (
            <div className="space-y-4">
              <div className="flex items-center justify-center space-x-4">
                <div className="flex items-center space-x-2 text-green-600">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-semibold">{results.imported} importées</span>
                </div>
                {results.errors > 0 && (
                  <div className="flex items-center space-x-2 text-red-600">
                    <XCircle className="w-5 h-5" />
                    <span className="font-semibold">{results.errors} erreurs</span>
                  </div>
                )}
              </div>

              <div className="flex space-x-2">
                <Button
                  onClick={() => {
                    setFile(null);
                    setResults(null);
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  Importer un autre fichier
                </Button>
                <Button
                  onClick={() => navigate('/dashboard')}
                  className="flex-1"
                >
                  Retour au dashboard
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-lg">Format du CSV</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="text-xs bg-gray-50 p-4 rounded overflow-x-auto">
{`siret;Entreprise;date_creation;siege;categorie_juridique;categorie_entreprise;complement_adresse;numero_voie;type_voie;libelle_voie;code_postal;ville;coordonnee_lambert_x;coordonnee_lambert_y;code_naf
12345678900012;ACME SARL;01/02/2026;VRAI;5499;PME;;10;RUE;DE PARIS;75001;PARIS;652432.5;6862432.1;62.01Z`}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}
