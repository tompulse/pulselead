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
    <section className="relative py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-3xl">
        <div className="glass-card p-8 sm:p-12 space-y-8 flex flex-col justify-center items-center text-center">
          <div className="relative">
            <div className="absolute inset-0 bg-accent/20 blur-2xl"></div>
            <div className="relative bg-card/60 backdrop-blur-xl border border-accent/20 rounded-3xl p-10">
              <MessageSquare className="w-20 h-20 text-accent mx-auto" />
            </div>
          </div>
          
          <div className="space-y-4 max-w-xl">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold gradient-text">
              Une question ? Contactez-nous
            </h2>
            <p className="text-lg text-muted-foreground">
              Discutons de votre projet directement sur WhatsApp pour une réponse immédiate
            </p>
          </div>

          <Button 
            onClick={handleWhatsApp}
            size="lg"
            className="bg-[#25D366] hover:bg-[#20BA5A] text-white text-lg px-8 py-6 h-auto"
          >
            <MessageSquare className="w-6 h-6 mr-3" />
            Démarrer la conversation
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
