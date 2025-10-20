import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Calendar } from "lucide-react";

export const FAQSection = () => {
  const navigate = useNavigate();

  const faqs = [
    {
      question: "D'où viennent les données ?",
      answer: "Toutes nos données proviennent de sources officielles (INPI - Institut National de la Propriété Industrielle) et sont mises à jour quotidiennement. Vous avez accès aux informations légales vérifiées : SIRET, adresse, activité NAF, forme juridique, etc."
    },
    {
      question: "Puis-je essayer gratuitement ?",
      answer: "Oui ! Le plan gratuit vous permet de consulter jusqu'à 50 entreprises par mois et d'accéder à la carte interactive. Aucune carte bancaire n'est requise pour commencer."
    },
    {
      question: "Comment sont mises à jour les données ?",
      answer: "Les données sont synchronisées automatiquement chaque jour avec les bases officielles. Vous êtes ainsi toujours informé des dernières créations d'entreprises dans votre secteur."
    },
    {
      question: "Puis-je annuler mon abonnement à tout moment ?",
      answer: "Absolument. Votre abonnement peut être annulé à tout moment depuis votre espace personnel, sans frais ni engagement. Les données que vous avez exportées restent bien sûr à vous."
    },
    {
      question: "Est-ce que LUMA fonctionne sur mobile ?",
      answer: "Oui, LUMA est entièrement responsive et fonctionne parfaitement sur tous les appareils : ordinateur, tablette et smartphone. Vous pouvez suivre vos prospects où que vous soyez."
    },
    {
      question: "Quelle est la couverture géographique ?",
      answer: "LUMA couvre l'ensemble du territoire français métropolitain et DOM-TOM. Vous pouvez filtrer par région, département ou code postal selon vos besoins."
    }
  ];

  return (
    <section className="relative py-20 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-3xl md:text-5xl font-bold text-foreground">
            Questions <span className="gradient-text">fréquentes</span>
          </h2>
          <p className="text-xl text-muted-foreground">
            Tout ce que vous devez savoir sur LUMA
          </p>
        </div>

        <Accordion type="single" collapsible className="space-y-4 mb-16">
          {faqs.map((faq, index) => (
            <AccordionItem 
              key={index} 
              value={`item-${index}`}
              className="glass-card px-6 border-accent/20 hover:border-cyan-electric/40 transition-all"
            >
              <AccordionTrigger className="text-left text-lg font-semibold text-foreground hover:text-cyan-electric transition-colors">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed pt-2">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        {/* Final CTA */}
        <div className="glass-card p-12 text-center space-y-6 border-cyan-electric/30 bg-gradient-to-br from-cyan-electric/5 to-navy-deep/20">
          <h3 className="text-3xl md:text-4xl font-bold text-foreground">
            Prêt à transformer ta prospection ?
          </h3>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Rejoins les centaines de commerciaux qui accélèrent leur croissance avec LUMA
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button 
              onClick={() => navigate("/auth")}
              size="lg"
              className="btn-hero min-w-[240px]"
            >
              Commencer gratuitement
            </Button>
            <Button 
              onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
              size="lg"
              variant="outline"
              className="border-2 border-cyan-electric/50 text-foreground hover:bg-cyan-electric/10 hover:border-cyan-electric min-w-[240px]"
            >
              <Calendar className="w-5 h-5 mr-2" />
              Réserver une démo
            </Button>
          </div>
          <p className="text-sm text-muted-foreground pt-4">
            Aucune carte bancaire requise • Mis en place en 5 minutes
          </p>
        </div>
      </div>
    </section>
  );
};