import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Building2 } from "lucide-react";

interface ListViewProps {
  filters: any;
}

export const ListView = ({ filters }: ListViewProps) => {
  // Placeholder data - will be replaced with real data from Supabase
  const mockData = [
    {
      id: 1,
      nom: "Tech Innovations",
      siret: "123 456 789 00012",
      adresse: "15 Rue de la Tech, 75001 Paris",
      naf: "6201Z",
      statut: "Création",
      date: "2024-01-15",
    },
    {
      id: 2,
      nom: "Green Solutions",
      siret: "987 654 321 00034",
      adresse: "42 Avenue Verte, 69002 Lyon",
      naf: "7112B",
      statut: "Création",
      date: "2024-01-20",
    },
  ];

  return (
    <div className="glass-card rounded-xl overflow-hidden">
      <div className="p-6 border-b border-accent/20">
        <div className="flex items-center gap-2">
          <Building2 className="w-5 h-5 text-accent" />
          <h3 className="text-xl font-semibold">Liste des entreprises</h3>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          {mockData.length} résultats (données de démonstration)
        </p>
      </div>

      <Table>
        <TableHeader>
          <TableRow className="border-accent/20 hover:bg-accent/5">
            <TableHead className="text-accent">Nom</TableHead>
            <TableHead className="text-accent">SIRET</TableHead>
            <TableHead className="text-accent">Adresse</TableHead>
            <TableHead className="text-accent">NAF</TableHead>
            <TableHead className="text-accent">Statut</TableHead>
            <TableHead className="text-accent">Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {mockData.map((item) => (
            <TableRow
              key={item.id}
              className="border-accent/20 hover:bg-accent/5 cursor-pointer transition-colors"
            >
              <TableCell className="font-medium">{item.nom}</TableCell>
              <TableCell className="text-muted-foreground">{item.siret}</TableCell>
              <TableCell className="text-muted-foreground">{item.adresse}</TableCell>
              <TableCell className="text-muted-foreground">{item.naf}</TableCell>
              <TableCell>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-accent/20 text-accent">
                  {item.statut}
                </span>
              </TableCell>
              <TableCell className="text-muted-foreground">{item.date}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="p-6 border-t border-accent/20 text-center">
        <p className="text-sm text-muted-foreground">
          Les données réelles seront affichées après connexion à la base de données Supabase
        </p>
      </div>
    </div>
  );
};
