import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { MapPin, Target, TrendingUp, Zap } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-navy-deep to-black-deep">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 glass-card border-b border-accent/20">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Target className="w-8 h-8 text-accent" />
            <span className="text-2xl font-bold gradient-text">LeadMagnet</span>
          </div>
          <Button 
            onClick={() => navigate("/auth")}
            className="bg-accent hover:bg-accent/90 text-primary font-semibold"
          >
            Se connecter
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-6 pt-32 pb-20">
        <div className="text-center max-w-4xl mx-auto space-y-8 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-4">
            <Zap className="w-4 h-4 text-accent" />
            <span className="text-sm text-accent font-medium">Propulsé par l'IA</span>
          </div>
          
          <h1 className="text-6xl md:text-7xl font-bold leading-tight">
            Identifiez vos
            <span className="gradient-text"> prochains leads</span>
            <br />
            avant la concurrence
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Visualisez en temps réel les nouvelles entreprises créées en France. 
            Cartographie intelligente, filtres puissants, données vérifiées.
          </p>

          <div className="flex gap-4 justify-center pt-6">
            <button 
              onClick={() => navigate("/auth")}
              className="btn-hero animate-glow-pulse"
            >
              Commencer gratuitement
            </button>
            <Button 
              variant="outline" 
              size="lg"
              className="rounded-full border-accent/50 text-foreground hover:bg-accent/10"
            >
              Voir la démo
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mt-32 animate-slide-up">
          <div className="glass-card p-8 space-y-4 hover:border-accent/50 transition-all duration-300">
            <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center">
              <MapPin className="w-6 h-6 text-accent" />
            </div>
            <h3 className="text-xl font-semibold">Cartographie interactive</h3>
            <p className="text-muted-foreground">
              Visualisez toutes les nouvelles entreprises sur une carte intuitive avec zoom et filtres géographiques.
            </p>
          </div>

          <div className="glass-card p-8 space-y-4 hover:border-accent/50 transition-all duration-300">
            <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center">
              <Target className="w-6 h-6 text-accent" />
            </div>
            <h3 className="text-xl font-semibold">Filtres intelligents</h3>
            <p className="text-muted-foreground">
              Affinez vos recherches par secteur, localisation, date de création et statut juridique.
            </p>
          </div>

          <div className="glass-card p-8 space-y-4 hover:border-accent/50 transition-all duration-300">
            <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-accent" />
            </div>
            <h3 className="text-xl font-semibold">Données vérifiées</h3>
            <p className="text-muted-foreground">
              Accédez aux informations officielles : SIRET, adresse, activité NAF, date de démarrage.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="glass-card p-12 text-center space-y-6">
          <h2 className="text-4xl font-bold">
            Prêt à transformer votre prospection ?
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Rejoignez les commerciaux qui utilisent LeadMagnet pour identifier leurs prochains clients.
          </p>
          <button 
            onClick={() => navigate("/auth")}
            className="btn-hero"
          >
            Démarrer maintenant
          </button>
        </div>
      </section>
    </div>
  );
};

export default Index;
