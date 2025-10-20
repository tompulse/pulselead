import { AlertCircle, Clock, Target } from "lucide-react";

export const ProblemsSection = () => {
  const problems = [
    {
      icon: AlertCircle,
      title: "Tu perds des opportunités",
      description: "Tes concurrents contactent les nouvelles entreprises avant toi. Pendant que tu cherches manuellement, ils signent déjà des contrats."
    },
    {
      icon: Clock,
      title: "Tu passes trop de temps à chercher",
      description: "Des heures perdues sur des fichiers Excel désorganisés, des données périmées, des recherches manuelles fastidieuses sur internet."
    },
    {
      icon: Target,
      title: "Tu manques de vision sur ton territoire",
      description: "Tu ne sais pas où se trouvent vraiment les opportunités. Quel secteur dynamique ? Quelle zone géographique privilégier ?"
    }
  ];

  return (
    <section className="relative py-20 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-3xl md:text-5xl font-bold text-foreground">
            Tu connais cette <span className="text-destructive">frustration</span> ?
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Sans outil adapté, tu passes à côté de ton vrai potentiel commercial
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {problems.map((problem, index) => {
            const Icon = problem.icon;
            return (
              <div 
                key={index}
                className="relative group"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="glass-card p-8 space-y-4 border-destructive/20 hover:border-destructive/40 transition-all duration-300">
                  <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Icon className="w-8 h-8 text-destructive" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">
                    {problem.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {problem.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};