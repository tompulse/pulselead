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
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/40 shadow-lg">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo et nom - Espace réservé */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-primary flex items-center justify-center">
              <span className="text-xl font-bold text-background">L</span>
            </div>
            <span className="text-xl font-bold text-foreground hidden sm:block">LUMA</span>
          </div>

          {/* Navigation Desktop */}
          <div className="hidden md:flex items-center gap-1">
            <Button 
              variant="ghost" 
              onClick={() => scrollToSection('features-section')}
              className="text-sm font-medium"
            >
              Fonctionnalités
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => scrollToSection('demo-section')}
              className="text-sm font-medium"
            >
              Démo
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => scrollToSection('pricing-section')}
              className="text-sm font-medium"
            >
              Tarifs
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => scrollToSection('testimonials-section')}
              className="text-sm font-medium"
            >
              Témoignages
            </Button>
          </div>

          {/* CTA Desktop */}
          <div className="hidden md:flex items-center gap-3">
            <Button 
              variant="ghost"
              onClick={() => navigate("/auth")}
              className="text-sm font-medium"
            >
              Connexion
            </Button>
            <Button 
              onClick={() => navigate("/auth")}
              className="text-sm font-bold shadow-lg shadow-accent/30 hover:shadow-accent/40"
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
