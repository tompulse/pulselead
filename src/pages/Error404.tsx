import { useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-primary via-primary/80 to-background relative overflow-hidden">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }}></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '6s', animationDelay: '2s' }}></div>
      </div>

      <div className="text-center space-y-8 px-4 relative z-10 animate-fade-in">
        <div className="space-y-4">
          <h1 className="text-8xl md:text-9xl font-bold gradient-text">404</h1>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">Page introuvable</h2>
          <p className="text-lg text-muted-foreground max-w-md mx-auto">
            Désolé, la page que vous recherchez n'existe pas ou a été déplacée.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
          <Button
            onClick={() => navigate(-1)}
            variant="outline"
            className="border-accent/30 hover:bg-accent/10 hover:border-accent transition-all duration-300 px-6 h-12"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>
          <Button
            onClick={() => navigate("/")}
            className="btn-hero px-8 h-12"
          >
            <Home className="w-4 h-4 mr-2" />
            Accueil
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
