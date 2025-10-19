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

interface ListViewProps {
  filters: any;
}

interface Entreprise {
  id: string;
  nom: string;
  siret: string;
  adresse: string;
  code_postal: string;
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
      } else {
        setEntreprises(data || []);
      }
      setLoading(false);
    };

    fetchEntreprises();
  }, [filters]);

  if (loading) {
    return (
      <div className="glass-card rounded-xl p-6 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-accent border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="glass-card rounded-xl overflow-hidden">
      <div className="p-6 border-b border-accent/20">
        <div className="flex items-center gap-2">
          <Building2 className="w-5 h-5 text-accent" />
          <h3 className="text-xl font-semibold">Liste des entreprises</h3>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          {entreprises.length} résultats
        </p>
      </div>

      {entreprises.length === 0 ? (
        <div className="p-12 text-center">
          <Building2 className="w-16 h-16 text-accent mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-semibold mb-2">Aucune entreprise trouvée</h3>
          <p className="text-muted-foreground">
            Cliquez sur "Synchroniser les données" pour importer vos entreprises
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-accent/20 hover:bg-accent/5">
                <TableHead className="text-accent">Nom</TableHead>
                <TableHead className="text-accent">SIRET</TableHead>
                <TableHead className="text-accent">Adresse</TableHead>
                <TableHead className="text-accent">Contact</TableHead>
                <TableHead className="text-accent">Activité</TableHead>
                <TableHead className="text-accent">Capital</TableHead>
                <TableHead className="text-accent">Forme</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entreprises.map((item) => {
                const formattedAddress = [
                  item.numero_voie,
                  item.type_voie,
                  item.nom_voie,
                  item.code_postal
                ].filter(Boolean).join(' ') || item.adresse || "N/A";
                
                const formattedCapital = item.capital 
                  ? `${item.capital.toLocaleString('fr-FR')} €`
                  : "N/A";
                
                return (
                  <TableRow
                    key={item.id}
                    className="border-accent/20 hover:bg-accent/5 cursor-pointer transition-colors"
                  >
                    <TableCell className="font-medium">{item.nom}</TableCell>
                    <TableCell className="text-muted-foreground font-mono text-xs">{item.siret}</TableCell>
                    <TableCell className="text-muted-foreground max-w-xs truncate" title={formattedAddress}>
                      {formattedAddress}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {item.telephone && <div>📞 {item.telephone}</div>}
                      {item.email && <div>✉️ {item.email}</div>}
                      {!item.telephone && !item.email && "N/A"}
                    </TableCell>
                    <TableCell className="text-muted-foreground max-w-xs truncate" title={item.activite || undefined}>
                      {item.activite || "N/A"}
                    </TableCell>
                    <TableCell className="text-muted-foreground font-medium">
                      {formattedCapital}
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-accent/20 text-accent">
                        {item.forme_juridique || "N/A"}
                      </span>
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
