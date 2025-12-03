import { Card, CardContent } from '@/components/ui/card';
import { Construction } from 'lucide-react';

export const CRMViewContainer = ({ userId, onEntrepriseSelect }: { userId: string; onEntrepriseSelect?: (entrepriseId: string) => void }) => {
  return (
    <div className="h-full flex flex-col overflow-hidden items-center justify-center p-4">
      <Card className="glass-card border-accent/30 max-w-md w-full">
        <CardContent className="p-8 text-center space-y-4">
          <Construction className="w-16 h-16 mx-auto text-accent" />
          <h2 className="text-xl font-bold gradient-text">CRM en développement</h2>
          <p className="text-muted-foreground">
            Le module CRM sera disponible prochainement. 
            En attendant, utilisez l'onglet Prospects pour explorer les nouveaux sites.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};