import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";
import { trackEvent } from "@/utils/analytics";

const ContactSection = () => {
  const waUrl = `https://wa.me/33760227532?text=${encodeURIComponent("Bonjour, je souhaite en savoir plus sur LUMA.")}`;

  return (
    <section className="relative py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-4xl">
        <div className="glass-card p-4 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6 border-accent/30 shadow-lg shadow-accent/10 transition-colors">
          <div className="flex items-center gap-4">
            <div className="relative flex-shrink-0">
              <div className="absolute inset-0 bg-accent/30 blur-xl animate-pulse"></div>
              <div className="relative bg-gradient-to-br from-card/80 to-card/60 backdrop-blur-xl border border-accent/30 rounded-xl p-3 shadow-lg shadow-accent/10">
                <MessageSquare className="w-8 h-8 text-accent" />
              </div>
            </div>
            
            <div className="space-y-1 text-left">
              <h2 className="text-xl sm:text-2xl font-bold gradient-text">
                Une question ?
              </h2>
              <p className="text-sm text-muted-foreground font-medium">
                Contactez-nous sur WhatsApp
              </p>
            </div>
          </div>

          <Button 
            asChild
            className="bg-[#25D366] hover:bg-[#20BA5A] text-white flex-shrink-0 shadow-lg"
          >
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackEvent('whatsapp_click', { source: 'contact_section' })}
              aria-label="Ouvrir WhatsApp"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Démarrer
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
