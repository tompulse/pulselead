import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Zap, Sparkles, TrendingUp, Shield } from "lucide-react";
import DashboardPreview from "@/components/landing/DashboardPreview";
import { trackCTAClick } from "@/utils/analytics";

const Index = () => {
  const navigate = useNavigate();

  const handleExplorerClick = () => {
    trackCTAClick('Explorer LUMA', 'hero');
    navigate("/auth");
  };

  const handleConnexionClick = () => {
    trackCTAClick('Connexion', 'header');
    navigate("/auth");
  };

  const handleCreerCompteClick = () => {
    trackCTAClick('Créer un compte', 'header');
    navigate("/auth");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-navy-deep via-black-deep to-background relative overflow-hidden">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }}></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-electric/5 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '6s', animationDelay: '2s' }}></div>
      </div>

      {/* Header fixe */}
      <nav className="fixed top-0 w-full z-50 backdrop-blur-xl bg-background/40 border-b border-accent/10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <div className="flex items-center space-x-3 cursor-pointer group" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <div className="relative">
                <div className="absolute inset-0 bg-accent/30 blur-lg group-hover:blur-xl transition-all duration-300"></div>
                <Zap className="w-7 h-7 sm:w-8 sm:h-8 text-accent relative" />
              </div>
              <span className="text-xl sm:text-2xl font-bold gradient-text">LUMA</span>
            </div>
            
            {/* Boutons d'action */}
            <div className="flex items-center gap-2 sm:gap-4">
              <Button 
                onClick={handleConnexionClick}
                variant="outline"
                className="border-accent/30 text-foreground hover:bg-accent/10 hover:border-accent/50 transition-all duration-300 px-4 sm:px-6 h-9 sm:h-10 text-sm sm:text-base"
              >
                Connexion
              </Button>
              <Button 
                onClick={handleCreerCompteClick}
                className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold px-4 sm:px-8 h-9 sm:h-10 text-sm sm:text-base rounded-full transition-all duration-300 hover:shadow-lg hover:shadow-accent/50 hover:-translate-y-0.5"
              >
                Créer un compte
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 sm:pt-40 pb-20 sm:pb-32 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center space-y-6 sm:space-y-8 animate-fade-in">
            {/* Titre principal */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
              <span className="text-foreground">LUMA</span>
              <br />
              <span className="gradient-text">éclaire les leviers de ta croissance.</span>
            </h1>
            
            {/* Sous-texte */}
            <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Visualise ton marché, comprends tes prospects et passe à l'action.<br />
              LUMA t'aide à voir clair dans ta data pour accélérer ta croissance.
            </p>
            
            {/* Boutons CTA */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6 sm:pt-8">
              <Button 
                onClick={handleExplorerClick}
                size="lg"
                className="btn-hero w-full sm:w-auto min-w-[200px] sm:min-w-[240px] h-12 sm:h-14 text-base sm:text-lg"
              >
                Explorer LUMA
              </Button>
              <p className="text-sm text-muted-foreground/80 mt-2">
                Démo instantanée — sans création de compte.
              </p>
            </div>

            {/* Dashboard Preview - Interactive animation */}
            <div className="pt-12 sm:pt-16 animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <div className="glass-card p-4 sm:p-6 md:p-8 max-w-5xl mx-auto relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-accent/0 via-accent/10 to-accent/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl"></div>
                <div className="relative aspect-video">
                  <DashboardPreview />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bloc valeur perçue */}
      <section className="relative py-16 sm:py-24 px-4 sm:px-6 lg:px-8 border-y border-accent/10">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center space-y-10 sm:space-y-16">
            {/* Phrase unique */}
            <p className="text-xl sm:text-2xl md:text-3xl text-foreground/90 font-light leading-relaxed max-w-4xl mx-auto">
              Visualise, comprends, et agis. En clair.
            </p>
            
            {/* 3 mini pictos */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-12 max-w-4xl mx-auto">
              {/* IA */}
              <div className="flex flex-col items-center space-y-4 group">
                <div className="relative">
                  <div className="absolute inset-0 bg-accent/20 blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                  <div className="relative bg-card/60 backdrop-blur-xl border border-accent/20 rounded-2xl p-6 transition-all duration-300 group-hover:border-accent/40 group-hover:-translate-y-1">
                    <Sparkles className="w-10 h-10 sm:w-12 sm:h-12 text-accent" />
                  </div>
                </div>
                <div className="text-center space-y-2">
                  <h3 className="font-semibold text-base sm:text-lg text-foreground">Clarté instantanée</h3>
                  <p className="text-sm text-muted-foreground">Data lisible et actionnables</p>
                </div>
              </div>
              
              {/* Performance */}
              <div className="flex flex-col items-center space-y-4 group">
                <div className="relative">
                  <div className="absolute inset-0 bg-accent/20 blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                  <div className="relative bg-card/60 backdrop-blur-xl border border-accent/20 rounded-2xl p-6 transition-all duration-300 group-hover:border-accent/40 group-hover:-translate-y-1">
                    <TrendingUp className="w-10 h-10 sm:w-12 sm:h-12 text-accent" />
                  </div>
                </div>
                <div className="text-center space-y-2">
                  <h3 className="font-semibold text-base sm:text-lg text-foreground">Croissance accélérée</h3>
                  <p className="text-sm text-muted-foreground">Décisions plus rapides</p>
                </div>
              </div>
              
              {/* Sécurité */}
              <div className="flex flex-col items-center space-y-4 group">
                <div className="relative">
                  <div className="absolute inset-0 bg-accent/20 blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                  <div className="relative bg-card/60 backdrop-blur-xl border border-accent/20 rounded-2xl p-6 transition-all duration-300 group-hover:border-accent/40 group-hover:-translate-y-1">
                    <Shield className="w-10 h-10 sm:w-12 sm:h-12 text-accent" />
                  </div>
                </div>
                <div className="text-center space-y-2">
                  <h3 className="font-semibold text-base sm:text-lg text-foreground">Vision complète</h3>
                  <p className="text-sm text-muted-foreground">Tous vos leviers en un coup d'œil</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer minimaliste */}
      <footer className="relative py-12 sm:py-16 px-4 sm:px-6 lg:px-8 bg-navy-deep/50">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col space-y-6">
            {/* Logo et liens */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-6 sm:gap-8">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-accent/20 blur-md"></div>
                  <Zap className="w-6 h-6 text-accent relative" />
                </div>
                <span className="text-lg font-bold gradient-text">LUMA</span>
              </div>
              
              <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-sm text-muted-foreground">
                <a href="#" className="hover:text-accent transition-colors duration-300">Mentions légales</a>
                <span className="hidden sm:inline text-accent/30">|</span>
                <a href="#" className="hover:text-accent transition-colors duration-300">Confidentialité</a>
                <span className="hidden sm:inline text-accent/30">|</span>
                <a href="#" className="hover:text-accent transition-colors duration-300">Contact</a>
              </div>
            </div>
            
            {/* Copyright */}
            <div className="text-center text-sm text-muted-foreground border-t border-accent/10 pt-6">
              <p>© 2025 LUMA. Tous droits réservés.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
