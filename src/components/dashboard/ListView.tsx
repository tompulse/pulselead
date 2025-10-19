import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Building2 } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ACTIVITY_CATEGORIES } from "@/utils/activityCategories";

interface ListViewProps {
  filters: {
    dateFrom: string;
    dateTo: string;
    categories: string[];
    region: string;
    departments: string[];
  };
}

interface Entreprise {
  id: string;
  nom: string;
  siret: string;
  adresse: string;
  code_postal: string;
  ville?: string;
  code_naf: string;
  statut: string;
  date_demarrage: string;
  numero_voie?: string;
  type_voie?: string;
  nom_voie?: string;
  telephone?: string;
  email?: string;
  forme_juridique?: string;
  capital?: number;
  activite?: string;
  administration?: string;
}

export const ListView = ({ filters }: ListViewProps) => {
  const [entreprises, setEntreprises] = useState<Entreprise[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEntreprises = async () => {
      setLoading(true);
      
      let query = (supabase as any)
        .from("entreprises")
        .select("*");

      // Apply date filters with null handling
      if (filters.dateFrom || filters.dateTo) {
        query = query.or(`date_demarrage.is.null,and(date_demarrage.gte.${filters.dateFrom || "1900-01-01"},date_demarrage.lte.${filters.dateTo || "2100-12-31"})`);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching entreprises:", error);
        setEntreprises([]);
      } else {
        // Filter by categories if needed
        let filtered = data || [];
        if (filters.categories && filters.categories.length > 0) {
          filtered = filtered.filter((ent: Entreprise) => {
            const codeNaf = ent.code_naf;
            if (!codeNaf) return false;
            
            return filters.categories.some(cat => {
              const categoryRanges = ACTIVITY_CATEGORIES[cat];
              if (!categoryRanges) return false;
              
              return categoryRanges.some(range => {
                if (range.includes('-')) {
                  const [start, end] = range.split('-');
                  return codeNaf >= start && codeNaf <= end;
                }
                return codeNaf.startsWith(range);
              });
            });
          });
        }

        // Filter by departments if selected
        if (filters.departments && filters.departments.length > 0) {
          filtered = filtered.filter((ent: Entreprise) => {
            const codePostal = ent.code_postal;
            if (!codePostal) return false;
            const dept = codePostal.substring(0, 2);
            return filters.departments.includes(dept) || filters.departments.includes(codePostal.substring(0, 3));
          });
        }

        setEntreprises(filtered);
      }
      setLoading(false);
    };

    fetchEntreprises();
  }, [filters]);

  if (loading) {
    return (
      <div className="glass-card rounded-2xl p-12 flex items-center justify-center shadow-2xl border border-accent/20">
        <div className="text-center space-y-4">
          <div className="animate-spin w-12 h-12 border-4 border-accent border-t-transparent rounded-full mx-auto" />
          <p className="text-muted-foreground font-medium">Chargement des données...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-2xl overflow-hidden shadow-2xl border border-accent/20">
      <div className="p-6 border-b border-accent/20 bg-gradient-to-r from-card to-card/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-accent/10 rounded-lg">
              <Building2 className="w-6 h-6 text-accent" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Liste des entreprises</h3>
              <p className="text-sm text-muted-foreground mt-0.5">
                {entreprises.length} résultat{entreprises.length > 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>
      </div>

      {entreprises.length === 0 ? (
        <div className="p-16 text-center">
          <div className="inline-flex p-4 bg-accent/10 rounded-2xl mb-6">
            <Building2 className="w-20 h-20 text-accent opacity-50" />
          </div>
          <h3 className="text-2xl font-bold mb-3">Aucune entreprise trouvée</h3>
          <p className="text-muted-foreground text-lg max-w-md mx-auto">
            Cliquez sur "Synchroniser les données" pour importer vos entreprises
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-accent/20 hover:bg-accent/5 bg-card/50">
                <TableHead className="text-accent font-semibold w-[180px]">Nom</TableHead>
                <TableHead className="text-accent font-semibold w-[110px]">SIRET</TableHead>
                <TableHead className="text-accent font-semibold w-[200px]">Adresse</TableHead>
                <TableHead className="text-accent font-semibold w-[200px]">Contact</TableHead>
                <TableHead className="text-accent font-semibold w-[280px]">Activité</TableHead>
                <TableHead className="text-accent font-semibold w-[100px]">Capital</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entreprises.map((item) => {
                const addressParts = [
                  item.numero_voie,
                  item.type_voie,
                  item.nom_voie
                ].filter(Boolean).join(' ');
                
                const locationParts = [
                  item.code_postal,
                  item.ville
                ].filter(Boolean).join(' ');
                
                const formattedAddress = addressParts && locationParts 
                  ? `${addressParts}, ${locationParts}`
                  : addressParts || locationParts || item.adresse || "N/A";
                
                const formattedCapital = typeof item.capital === 'number' 
                  ? `${item.capital.toLocaleString('fr-FR')} €`
                  : "N/A";
                
                return (
                  <TableRow
                    key={item.id}
                    className="border-accent/20 hover:bg-accent/5 cursor-pointer transition-all hover:shadow-lg"
                  >
                    <TableCell className="font-semibold text-sm">{item.nom}</TableCell>
                    <TableCell className="text-muted-foreground font-mono text-xs">{item.siret}</TableCell>
                    <TableCell className="text-muted-foreground text-xs" title={formattedAddress}>
                      <div className="truncate max-w-[200px]">{formattedAddress}</div>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs" title={item.administration || undefined}>
                      <div className="truncate max-w-[200px]">{item.administration || "N/A"}</div>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs" title={item.activite || undefined}>
                      <div className="truncate max-w-[280px]">{item.activite || "N/A"}</div>
                    </TableCell>
                    <TableCell className="text-muted-foreground font-medium text-xs whitespace-nowrap">
                      {formattedCapital}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};
