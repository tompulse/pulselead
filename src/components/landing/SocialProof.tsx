import { Star, Quote } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const testimonials = [
  {
    name: 'Antoine M.',
    role: 'Commercial terrain',
    company: 'Énergie renouvelable',
    content: "L'optimisation de tournées m'a fait économiser 40% de km. Je peux filtrer par secteur NAF et créer mes itinéraires en 2 clics. Un vrai game changer !",
    rating: 5,
    avatar: 'AM'
  },
  {
    name: 'Sophie L.',
    role: 'Responsable développement',
    company: 'Services B2B',
    content: "Accès à 4,5M d'entreprises avec filtres par département, NAF, effectif... Plus besoin de chercher pendant des heures, tout est là. Le GPS intégré est un énorme plus.",
    rating: 5,
    avatar: 'SL'
  },
  {
    name: 'Thomas R.',
    role: 'Indépendant',
    company: 'Conseil & Formation',
    content: "Le CRM intégré est parfait pour le terrain : notes rapides, rappels, statuts de visite. Je gère tout depuis mon téléphone, même sans réseau. Simple et efficace.",
    rating: 5,
    avatar: 'TR'
  }
];

export const SocialProof = () => {
  return (
    <section className="py-20 px-6 relative z-10">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge className="bg-accent/10 text-accent border-accent/20 mb-4">
            ⭐ Ils utilisent PULSE au quotidien
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">
            Ce qu'en pensent les <span className="text-accent">pros du terrain</span>
          </h2>
          <p className="text-lg text-white/60 max-w-2xl mx-auto">
            Rejoignez des centaines de commerciaux qui optimisent leur prospection avec PULSE
          </p>
        </div>

        {/* Testimonials */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, idx) => (
            <Card key={idx} className="bg-card/50 backdrop-blur-sm border-white/10 p-6 hover:border-accent/30 transition-all duration-300 relative">
              <Quote className="absolute top-4 right-4 w-8 h-8 text-accent/20" />
              
              {/* Rating */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-accent text-accent" />
                ))}
              </div>

              {/* Content */}
              <p className="text-white/80 text-sm mb-6 leading-relaxed">
                "{testimonial.content}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-accent font-semibold text-sm">
                  {testimonial.avatar}
                </div>
                <div>
                  <div className="text-white font-semibold text-sm">{testimonial.name}</div>
                  <div className="text-white/50 text-xs">{testimonial.role}</div>
                  <div className="text-white/40 text-xs">{testimonial.company}</div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Trust indicators */}
        <div className="mt-12 flex flex-wrap justify-center items-center gap-6 text-white/40 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span>Données sécurisées (RGPD)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span>Support réactif 7j/7</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span>Sans engagement</span>
          </div>
        </div>
      </div>
    </section>
  );
};
