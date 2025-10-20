import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Lightbulb, ArrowRight } from "lucide-react";
import DashboardPreview from "@/components/landing/DashboardPreview";
import ContactSection from "@/components/landing/ContactSection";
import { SocialProofSection } from "@/components/landing/SocialProofSection";
import { ProblemsSection } from "@/components/landing/ProblemsSection";
import { SolutionSection } from "@/components/landing/SolutionSection";
import { PricingSection } from "@/components/landing/PricingSection";
import { TestimonialsSection } from "@/components/landing/TestimonialsSection";
import { FAQSection } from "@/components/landing/FAQSection";
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
                <Lightbulb className="w-7 h-7 sm:w-8 sm:h-8 text-accent relative" />
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
      <section className="relative pt-32 sm:pt-40 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center space-y-8 animate-fade-in">
            {/* Badge de lancement */}
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-cyan-electric/10 border border-cyan-electric/30 backdrop-blur-sm hover:border-cyan-electric/50 transition-all">
              <Lightbulb className="w-4 h-4 text-cyan-electric animate-pulse" />
              <span className="text-sm text-cyan-electric font-semibold tracking-wide">Données officielles en temps réel</span>
            </div>
            
            {/* Promesse de vente claire */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
              <span className="text-foreground">Contacte les nouvelles entreprises</span>
              <br />
              <span className="gradient-text">avant tes concurrents</span>
            </h1>
            
            {/* Sous-promesse claire */}
            <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              LUMA te permet de visualiser en temps réel toutes les créations d'entreprises sur ton territoire. 
              Fini les opportunités manquées. À toi les premiers contacts.
            </p>
            
            {/* CTA au-dessus de la ligne de flottaison */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
              <Button 
                onClick={handleExplorerClick}
                size="lg"
                className="btn-hero w-full sm:w-auto min-w-[240px] h-14 text-lg group"
              >
                Commencer gratuitement
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Aucune carte bancaire requise • Accès immédiat
            </p>

            {/* Visuel impactant - Dashboard Preview */}
            <div className="pt-16 animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <div className="glass-card p-4 sm:p-8 max-w-5xl mx-auto relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-electric/0 via-cyan-electric/10 to-cyan-electric/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl"></div>
                <div className="relative aspect-video">
                  <DashboardPreview />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <SocialProofSection />

      {/* Section Problèmes */}
      <ProblemsSection />

      {/* Section Solution */}
      <SolutionSection />

      {/* Section Prix */}
      <PricingSection />

      {/* Section Témoignages */}
      <TestimonialsSection />

      {/* Section FAQ + CTA */}
      <FAQSection />

      {/* Section Contact */}
      <div id="contact">
        <ContactSection />
      </div>

      {/* Footer minimaliste */}
      <footer className="relative py-12 sm:py-16 px-4 sm:px-6 lg:px-8 bg-navy-deep/50">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col space-y-6">
            {/* Logo et liens */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-6 sm:gap-8">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-accent/20 blur-md"></div>
                  <Lightbulb className="w-6 h-6 text-accent relative" />
                </div>
                <span className="text-lg font-bold gradient-text">LUMA</span>
              </div>
              
              <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-sm text-muted-foreground">
                <a href="#" className="hover:text-accent transition-colors duration-300">Mentions légales</a>
                <span className="hidden sm:inline text-accent/30">|</span>
                <a href="#" className="hover:text-accent transition-colors duration-300">Confidentialité</a>
                <span className="hidden sm:inline text-accent/30">|</span>
                <a href="#contact" className="hover:text-accent transition-colors duration-300" onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
                }}>Contact</a>
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
