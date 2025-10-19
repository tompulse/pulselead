import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";
import { trackEvent } from "@/utils/analytics";

const ContactSection = () => {
  const handleWhatsApp = () => {
    trackEvent('whatsapp_click', { source: 'contact_section' });
    const message = encodeURIComponent("Bonjour, je souhaite en savoir plus sur LUMA.");
    window.location.href = `https://wa.me/33760227532?text=${message}`;
  };

  return (
    <section className="relative py-12 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-4xl">
        <div className="glass-card p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-shrink-0">
              <div className="absolute inset-0 bg-accent/20 blur-lg"></div>
              <div className="relative bg-card/60 backdrop-blur-xl border border-accent/20 rounded-xl p-3">
                <MessageSquare className="w-8 h-8 text-accent" />
              </div>
            </div>
            
            <div className="space-y-1 text-left">
              <h2 className="text-xl sm:text-2xl font-bold gradient-text">
                Une question ?
              </h2>
              <p className="text-sm text-muted-foreground">
                Contactez-nous sur WhatsApp
              </p>
            </div>
          </div>

          <Button 
            onClick={handleWhatsApp}
            className="bg-[#25D366] hover:bg-[#20BA5A] text-white flex-shrink-0"
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Démarrer
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
