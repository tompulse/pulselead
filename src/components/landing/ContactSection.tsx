import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";
import { trackEvent } from "@/utils/analytics";

const ContactSection = () => {
  const waUrl = `https://wa.me/33760227532?text=${encodeURIComponent("Bonjour, je souhaite en savoir plus sur PULSE.")}`;

  return (
    <section className="relative py-16 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-4xl">
        <div className="glass-card p-8 md:p-10 border-accent/30 shadow-2xl shadow-accent/20 transition-colors text-center">
          <div className="space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold gradient-text">
              Contact avec le fondateur
            </h2>
            <p className="text-lg md:text-xl text-white/70 font-medium max-w-2xl mx-auto">
              Contactez directement le fondateur pour programmer une démo personnalisée et discuter de vos besoins spécifiques
            </p>
            
            <Button 
              asChild
              size="lg"
              className="bg-[#25D366] hover:bg-[#20BA5A] text-white shadow-2xl px-10 py-6 text-lg font-bold hover:scale-105 transition-transform"
            >
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackEvent('whatsapp_click', { source: 'contact_section' })}
                aria-label="Écrire sur WhatsApp"
              >
                <MessageSquare className="w-5 h-5 mr-2" />
                Écrire sur WhatsApp
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
