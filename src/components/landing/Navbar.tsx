import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import lumaLogo from "@/assets/luma-logo-cyan.png";

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
            <img src={lumaLogo} alt="LUMA" className="h-14 w-auto drop-shadow-[0_0_8px_rgba(0,255,240,0.5)]" />
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
              onClick={() => scrollToSection('pricing-section')}
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
              onClick={() => navigate("/auth")}
              className="text-sm font-semibold hover:text-accent transition-colors"
            >
              Connexion
            </Button>
            <Button 
              onClick={() => navigate("/auth")}
              className="relative bg-gradient-to-r from-accent to-cyan-glow text-primary font-bold text-sm px-6 py-2.5 rounded-full shadow-lg shadow-accent/40 hover:shadow-xl hover:shadow-accent/60 hover:scale-105 transition-all duration-300"
            >
              Démarrer gratuitement
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-accent/10 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6 text-foreground" />
            ) : (
              <Menu className="w-6 h-6 text-foreground" />
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
              onClick={() => scrollToSection('pricing-section')}
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
                  navigate("/auth");
                  setMobileMenuOpen(false);
                }}
                className="w-full"
              >
                Connexion
              </Button>
              <Button 
                onClick={() => {
                  navigate("/auth");
                  setMobileMenuOpen(false);
                }}
                className="w-full shadow-lg shadow-accent/30"
              >
                Démarrer gratuitement
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};
