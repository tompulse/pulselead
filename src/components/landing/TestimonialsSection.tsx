import { Star, Quote } from "lucide-react";

export const TestimonialsSection = () => {
  const testimonials = [
    {
      name: "Sophie Martin",
      role: "Commerciale BtoB",
      company: "Solutions Tech",
      content: "En 30 jours, j'ai multiplié mes RDV par 3. LUMA me permet d'être la première à contacter les nouvelles entreprises de mon secteur.",
      rating: 5,
      result: "+200% de RDV"
    },
    {
      name: "Thomas Dubois",
      role: "Responsable commercial",
      company: "Agence WebFlow",
      content: "Fini les fichiers Excel désorganisés. Maintenant je visualise tout mon territoire en un coup d'œil et je priorise mes actions.",
      rating: 5,
      result: "3h gagnées/jour"
    },
    {
      name: "Marie Leroux",
      role: "Indépendante",
      company: "Conseil & Formation",
      content: "L'outil que j'aurais voulu avoir dès le début. Simple, efficace, et les données sont toujours à jour. Un vrai gain de temps.",
      rating: 5,
      result: "+45 nouveaux clients"
    }
  ];

  return (
    <section className="relative py-20 px-4 bg-gradient-to-b from-navy-deep/20 to-background">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16 space-y-4">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-6 h-6 fill-cyan-electric text-cyan-electric" />
              ))}
            </div>
            <span className="text-xl font-semibold text-foreground">4.8/5</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground">
            Ils ont accéléré leur <span className="gradient-text">croissance</span>
          </h2>
          <p className="text-xl text-muted-foreground">
            Des résultats concrets dès les premières semaines
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index}
              className="glass-card p-8 space-y-6 hover:border-cyan-electric/40 transition-all duration-300 group"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Quote icon */}
              <div className="relative">
                <Quote className="w-10 h-10 text-cyan-electric/20 group-hover:text-cyan-electric/40 transition-colors" />
              </div>

              {/* Rating */}
              <div className="flex gap-1">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-cyan-electric text-cyan-electric" />
                ))}
              </div>

              {/* Content */}
              <p className="text-foreground leading-relaxed">
                "{testimonial.content}"
              </p>

              {/* Result highlight */}
              <div className="inline-flex px-4 py-2 rounded-full bg-cyan-electric/10 border border-cyan-electric/30">
                <span className="text-sm font-semibold text-cyan-electric">
                  {testimonial.result}
                </span>
              </div>

              {/* Author */}
              <div className="pt-4 border-t border-accent/10">
                <div className="font-semibold text-foreground">{testimonial.name}</div>
                <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                <div className="text-sm text-muted-foreground">{testimonial.company}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};