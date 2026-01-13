import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

const Error500 = () => {
  const navigate = useNavigate();

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{
      background: 'radial-gradient(ellipse at top, hsl(220, 60%, 12%), hsl(220, 60%, 8%), hsl(0, 0%, 0%))'
    }}>
      <div className="text-center space-y-6 max-w-md">
        <div className="w-24 h-24 mx-auto rounded-full bg-destructive/20 flex items-center justify-center">
          <AlertTriangle className="w-12 h-12 text-destructive" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-foreground">Erreur serveur</h1>
          <p className="text-6xl font-bold gradient-text">500</p>
        </div>
        
        <p className="text-muted-foreground text-lg">
          Une erreur inattendue s'est produite. Notre équipe a été notifiée et travaille à résoudre le problème.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
          <Button 
            onClick={handleRefresh}
            variant="outline"
            className="border-accent/50 text-accent hover:bg-accent hover:text-black"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Réessayer
          </Button>
          <Button 
            onClick={() => navigate('/')}
            className="bg-accent hover:bg-accent/90 text-primary"
          >
            <Home className="w-4 h-4 mr-2" />
            Retour à l'accueil
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Error500;
