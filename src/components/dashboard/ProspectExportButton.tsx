import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { toast } from 'sonner';
import { NouveauxSitesFilters, nouveauxSitesService } from '@/services/nouveauxSitesService';
import { format } from 'date-fns';

interface ProspectExportButtonProps {
  filters: NouveauxSitesFilters;
  className?: string;
}

export const ProspectExportButton = ({ filters, className }: ProspectExportButtonProps) => {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      // Fetch all sites with current filters (up to 10000 for export)
      const { data: sites } = await nouveauxSitesService.fetchNouveauxSites(filters, 0, 10000);
      
      if (!sites || sites.length === 0) {
        toast.error('Aucun prospect à exporter');
        return;
      }

      // Prepare CSV headers
      const headers = [
        'Nom',
        'SIRET',
        'Adresse',
        'Code Postal',
        'Ville',
        'Code NAF',
        'Catégorie',
        'Date Création',
        'Taille Entreprise',
        'Forme Juridique',
        'Latitude',
        'Longitude'
      ];

      // Prepare CSV rows
      const rows = sites.map(site => [
        `"${(site.nom || '').replace(/"/g, '""')}"`,
        site.siret || '',
        `"${[site.numero_voie, site.type_voie, site.libelle_voie].filter(Boolean).join(' ').replace(/"/g, '""')}"`,
        site.code_postal || '',
        `"${(site.ville || '').replace(/"/g, '""')}"`,
        site.code_naf || '',
        `"${(site.categorie_detaillee || '').replace(/"/g, '""')}"`,
        site.date_creation ? format(new Date(site.date_creation), 'dd/MM/yyyy') : '',
        site.categorie_entreprise || '',
        site.categorie_juridique || '',
        site.latitude || '',
        site.longitude || ''
      ]);

      // Create CSV content with BOM for Excel compatibility
      const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map(row => row.join(';'))].join('\n');
      
      // Download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `prospects_pulse_${format(new Date(), 'yyyy-MM-dd_HH-mm')}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success(`${sites.length} prospects exportés`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error("Erreur lors de l'export");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleExport}
      disabled={isExporting}
      className={className}
    >
      <Download className="h-4 w-4 mr-2" />
      {isExporting ? 'Export...' : 'Exporter CSV'}
    </Button>
  );
};
