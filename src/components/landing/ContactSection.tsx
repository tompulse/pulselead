import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Send } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { trackEvent } from "@/utils/analytics";

const ContactSection = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validation simple
    if (!formData.name || !formData.email || !formData.message) {
      toast({
        title: "Erreur",
        description: "Merci de remplir tous les champs",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    // Track l'événement
    trackEvent('contact_form_submitted', {
      name: formData.name,
      email: formData.email,
    });

    // Ouvrir WhatsApp avec les informations du formulaire
    const message = encodeURIComponent(
      `Bonjour, je souhaite en savoir plus sur LUMA.\n\nNom: ${formData.name}\nEmail: ${formData.email}\nMessage: ${formData.message}`
    );
    window.location.href = `https://wa.me/33760227532?text=${message}`;
    
    setFormData({ name: "", email: "", message: "" });
    setIsSubmitting(false);
  };

  const handleWhatsApp = () => {
    trackEvent('whatsapp_click', { source: 'contact_section' });
    const message = encodeURIComponent("Bonjour, je souhaite en savoir plus sur LUMA.");
    window.location.href = `https://wa.me/33760227532?text=${message}`;
  };

  return (
    <section className="relative py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold gradient-text">
            Une question ? Contactez-nous
          </h2>
          <p className="text-lg text-muted-foreground">
            Notre équipe est là pour vous accompagner
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Formulaire */}
          <div className="glass-card p-6 sm:p-8 space-y-6">
            <h3 className="text-xl font-semibold text-foreground">Envoyez-nous un message</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Input
                  type="text"
                  placeholder="Votre nom"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-background/50 border-accent/20 focus:border-accent/50"
                />
              </div>
              <div>
                <Input
                  type="email"
                  placeholder="Votre email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="bg-background/50 border-accent/20 focus:border-accent/50"
                />
              </div>
              <div>
                <Textarea
                  placeholder="Votre message"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="bg-background/50 border-accent/20 focus:border-accent/50 min-h-[120px]"
                />
              </div>
              <Button 
                type="submit" 
                className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                disabled={isSubmitting}
              >
                <Send className="w-4 h-4 mr-2" />
                {isSubmitting ? "Envoi..." : "Envoyer"}
              </Button>
            </form>
          </div>

          {/* WhatsApp */}
          <div className="glass-card p-6 sm:p-8 space-y-6 flex flex-col justify-center items-center text-center">
            <div className="relative">
              <div className="absolute inset-0 bg-accent/20 blur-xl"></div>
              <div className="relative bg-card/60 backdrop-blur-xl border border-accent/20 rounded-2xl p-8">
                <MessageSquare className="w-16 h-16 text-accent mx-auto" />
              </div>
            </div>
            <div className="space-y-3">
              <h3 className="text-xl font-semibold text-foreground">Besoin d'une réponse rapide ?</h3>
              <p className="text-muted-foreground">
                Contactez-nous directement sur WhatsApp pour une réponse immédiate
              </p>
            </div>
            <Button 
              onClick={handleWhatsApp}
              size="lg"
              className="bg-[#25D366] hover:bg-[#20BA5A] text-white w-full"
            >
              <MessageSquare className="w-5 h-5 mr-2" />
              Ouvrir WhatsApp
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
