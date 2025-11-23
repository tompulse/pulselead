import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";
import { trackEvent } from "@/utils/analytics";

const ContactSection = () => {
  const waUrl = `https://wa.me/33760227532?text=${encodeURIComponent("Bonjour, je souhaite en savoir plus sur PULSE.")}`;

  return (
    <section className="relative py-20 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-6xl">
        <div className="glass-card p-12 md:p-16 flex flex-col md:flex-row items-center justify-between gap-12 border-accent/30 shadow-2xl shadow-accent/20 transition-colors">
          {/* Large WhatsApp Logo Left */}
          <div className="relative flex-shrink-0">
            <div className="absolute inset-0 bg-[#25D366]/40 blur-3xl animate-pulse" style={{ animationDuration: '3s' }}></div>
            <div className="relative bg-[#25D366] rounded-3xl p-8 shadow-2xl">
              <MessageSquare className="w-32 h-32 text-white" strokeWidth={1.5} />
            </div>
          </div>
          
          {/* Right Banner Content */}
          <div className="flex-1 flex flex-col md:flex-row items-center justify-between gap-8 w-full">
            <div className="space-y-3 text-center md:text-left flex-1">
              <h2 className="text-4xl md:text-5xl font-bold gradient-text">
                Contact avec le fondateur
              </h2>
              <p className="text-xl md:text-2xl text-white/70 font-medium leading-relaxed">
                Contactez directement le fondateur sur WhatsApp pour discuter de vos besoins
              </p>
            </div>

            <Button 
              asChild
              size="lg"
              className="bg-[#25D366] hover:bg-[#20BA5A] text-white flex-shrink-0 shadow-2xl px-10 py-8 text-xl font-bold hover:scale-105 transition-transform"
            >
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackEvent('whatsapp_click', { source: 'contact_section' })}
                aria-label="Écrire sur WhatsApp"
              >
                <MessageSquare className="w-6 h-6 mr-3" />
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
