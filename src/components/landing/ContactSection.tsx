import { Button } from "@/components/ui/button";
import { trackEvent } from "@/utils/analytics";
import whatsappLogo from "@/assets/whatsapp-logo.png";

const ContactSection = () => {
  const waUrl = `https://wa.me/33760227532?text=${encodeURIComponent("Bonjour, je souhaite en savoir plus sur PULSE.")}`;

  return (
    <section className="relative py-20 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-6xl">
        <div className="glass-card p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 border-accent/30 shadow-2xl shadow-accent/20 transition-colors">
          {/* WhatsApp Logo Left */}
          <div className="relative flex-shrink-0">
            <div className="absolute inset-0 bg-[#25D366]/30 blur-2xl animate-pulse" style={{ animationDuration: '3s' }}></div>
            <div className="relative">
              <img src={whatsappLogo} alt="WhatsApp" className="w-24 h-24 md:w-32 md:h-32 drop-shadow-2xl" />
            </div>
          </div>
          
          {/* Right Banner Content */}
          <div className="flex-1 flex flex-col md:flex-row items-center justify-between gap-8 w-full">
            <div className="space-y-3 text-center md:text-left flex-1">
              <h2 className="text-3xl md:text-4xl font-bold gradient-text">
                Contact avec le fondateur
              </h2>
              <p className="text-lg md:text-xl text-white/70 font-medium leading-relaxed">
                Contactez directement le fondateur sur WhatsApp pour discuter de vos besoins
              </p>
            </div>

            <Button 
              asChild
              size="lg"
              className="bg-[#25D366] hover:bg-[#20BA5A] text-white flex-shrink-0 shadow-2xl px-8 py-6 text-lg font-bold hover:scale-105 transition-transform"
            >
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackEvent('whatsapp_click', { source: 'contact_section' })}
                aria-label="Écrire sur WhatsApp"
              >
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
