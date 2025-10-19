import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Target } from "lucide-react";
import { HeroSection } from "@/components/landing/HeroSection";
import { DemoSection } from "@/components/landing/DemoSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { CTASection } from "@/components/landing/CTASection";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-navy-deep to-black-deep">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 glass-card border-b border-accent/20 backdrop-blur-xl">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3 cursor-pointer group" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="relative">
              <div className="absolute inset-0 bg-accent/30 blur-xl group-hover:blur-2xl transition-all"></div>
              <Target className="w-8 h-8 text-accent relative" />
            </div>
            <span className="text-2xl font-bold gradient-text">LeadMagnet</span>
          </div>
          <Button 
            onClick={() => navigate("/auth")}
            className="bg-accent hover:bg-accent/90 text-primary font-semibold px-6 py-2 rounded-full transition-all hover:shadow-lg hover:shadow-accent/50"
          >
            Se connecter
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <HeroSection />

      {/* Demo Section */}
      <DemoSection />

      {/* Features Section */}
      <FeaturesSection />

      {/* CTA Section */}
      <CTASection />

      {/* Footer */}
      <footer className="border-t border-accent/20 py-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center space-x-2">
              <Target className="w-6 h-6 text-accent" />
              <span className="text-lg font-bold gradient-text">LeadMagnet</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2025 LeadMagnet. Tous droits réservés.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
