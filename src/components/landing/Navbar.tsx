import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useState } from "react";

export const Navbar = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    element?.scrollIntoView({ behavior: 'smooth' });
    setMobileMenuOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-2xl border-b border-border/30 shadow-xl">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <span className="text-2xl font-bold text-white">PULSE<span className="text-accent">.</span></span>
          </div>

          {/* Navigation Desktop */}
          <div className="hidden md:flex items-center gap-2">
            <Button 
              variant="ghost" 
              onClick={() => scrollToSection('features-section')}
              className="text-sm font-semibold hover:text-accent transition-colors"
            >
              Fonctionnalités
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => scrollToSection('demo-section')}
              className="text-sm font-semibold hover:text-accent transition-colors"
            >
              Démo
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => scrollToSection('pricing')}
              className="text-sm font-semibold hover:text-accent transition-colors"
            >
              Tarifs
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => scrollToSection('testimonials-section')}
              className="text-sm font-semibold hover:text-accent transition-colors"
            >
              Témoignages
            </Button>
          </div>

          {/* CTA Desktop */}
          <div className="hidden md:flex items-center gap-4">
            <Button 
              variant="ghost"
              onClick={() => navigate("/auth?mode=login")}
              className="text-sm font-semibold hover:text-accent transition-colors"
            >
              Mon compte
            </Button>
            <Button 
              asChild
              className="bg-green-600 hover:bg-green-700 text-white font-bold text-sm px-6 py-2.5 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
            >
              <a href="https://calendly.com/tomiolovpro/30min" target="_blank" rel="noopener noreferrer">
                Je réserve ma démo
              </a>
            </Button>
            <Button 
              onClick={() => navigate("/subscribe")}
              className="relative bg-gradient-to-r from-accent to-cyan-glow text-primary font-bold text-sm px-6 py-2.5 rounded-full shadow-lg shadow-accent/40 hover:shadow-xl hover:shadow-accent/60 hover:scale-105 transition-all duration-300"
            >
              Essayer 7 jours gratuits
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-accent/10 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6 text-foreground" aria-hidden="true" />
            ) : (
              <Menu className="w-6 h-6 text-foreground" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border/40 bg-background/95 backdrop-blur-xl">
          <div className="container mx-auto px-4 py-4 space-y-2">
            <Button 
              variant="ghost" 
              onClick={() => scrollToSection('features-section')}
              className="w-full justify-start"
            >
              Fonctionnalités
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => scrollToSection('demo-section')}
              className="w-full justify-start"
            >
              Démo
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => scrollToSection('pricing')}
              className="w-full justify-start"
            >
              Tarifs
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => scrollToSection('testimonials-section')}
              className="w-full justify-start"
            >
              Témoignages
            </Button>
            <div className="pt-2 space-y-2 border-t border-border/40">
              <Button 
                variant="outline"
                onClick={() => {
                  navigate("/auth?mode=login");
                  setMobileMenuOpen(false);
                }}
                className="w-full"
              >
                Mon compte
              </Button>
              <Button 
                asChild
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold shadow-lg"
              >
                <a href="https://calendly.com/tomiolovpro/30min" target="_blank" rel="noopener noreferrer">
                  Je réserve ma démo
                </a>
              </Button>
              <Button 
                onClick={() => {
                  navigate("/subscribe");
                  setMobileMenuOpen(false);
                }}
                className="w-full shadow-lg shadow-accent/30"
              >
                Essayer 7 jours gratuits
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};
