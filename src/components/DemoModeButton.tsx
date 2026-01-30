import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Play, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface DemoModeButtonProps {
  variant?: "default" | "outline" | "ghost";
  className?: string;
  size?: "default" | "sm" | "lg";
}

export const DemoModeButton = ({ variant = "outline", className = "", size = "default" }: DemoModeButtonProps) => {
  const [showDemo, setShowDemo] = useState(false);

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={() => setShowDemo(true)}
        className={`border-accent/30 text-white hover:bg-accent/10 hover:border-accent/60 ${className}`}
      >
        <Play className="w-4 h-4 mr-2" />
        Voir la démo
      </Button>

      <Dialog open={showDemo} onOpenChange={setShowDemo}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-card border-accent/20">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-2xl font-bold gradient-text">
                🎬 Découvrez PULSE en 2 minutes
              </DialogTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDemo(false)}
                className="text-white/60 hover:text-white"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            <DialogDescription className="text-white/70">
              Voici comment PULSE transforme votre prospection terrain
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            {/* Step 1 */}
            <div className="glass-card p-5 border-accent/20">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 font-bold text-accent">
                  1
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-white mb-2">
                    🗺️ Filtrez vos prospects par zone
                  </h3>
                  <p className="text-white/70 text-sm mb-3">
                    Accédez aux <strong className="text-accent">nouvelles entreprises</strong> en France. 
                    Filtrez par département, code postal, secteur d'activité (NAF), effectif, date de création.
                  </p>
                  <div className="bg-black/30 p-3 rounded-lg border border-white/10">
                    <p className="text-xs text-white/60">
                      💡 <strong>Exemple :</strong> "Toutes les entreprises du BTP (NAF 41-43) dans le 75, créées depuis 2020, 
                      avec 10-50 salariés"
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="glass-card p-5 border-accent/20">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 font-bold text-accent">
                  2
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-white mb-2">
                    🚗 Créez votre tournée optimisée
                  </h3>
                  <p className="text-white/70 text-sm mb-3">
                    Sélectionnez vos prospects et PULSE calcule automatiquement l'itinéraire le plus court. 
                    <strong className="text-accent"> Économisez jusqu'à 40% de kilomètres</strong>.
                  </p>
                  <div className="bg-black/30 p-3 rounded-lg border border-white/10">
                    <p className="text-xs text-white/60">
                      💡 <strong>Astuce :</strong> Lancez directement Waze ou Google Maps depuis PULSE pour chaque prospect. 
                      Un clic = navigation GPS activée.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="glass-card p-5 border-accent/20">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 font-bold text-accent">
                  3
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-white mb-2">
                    📝 Gérez vos visites avec le CRM mobile
                  </h3>
                  <p className="text-white/70 text-sm mb-3">
                    Après chaque visite, notez rapidement : statut (RDV booké, à rappeler, pas intéressé), 
                    commentaires, date de rappel. <strong className="text-accent">Tout est synchronisé en temps réel</strong>.
                  </p>
                  <div className="bg-black/30 p-3 rounded-lg border border-white/10">
                    <p className="text-xs text-white/60">
                      💡 <strong>Bonus :</strong> Recevez des notifications pour vos rappels. 
                      Fini les prospects oubliés !
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 4 */}
            <div className="glass-card p-5 border-accent/20">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 font-bold text-accent">
                  4
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-white mb-2">
                    📊 Suivez vos performances
                  </h3>
                  <p className="text-white/70 text-sm mb-3">
                    Tableau de bord complet : nombre de visites, taux de conversion, prospects par statut. 
                    <strong className="text-accent"> Pilotez votre activité en un coup d'œil</strong>.
                  </p>
                  <div className="bg-black/30 p-3 rounded-lg border border-white/10">
                    <p className="text-xs text-white/60">
                      💡 <strong>Pro tip :</strong> Exportez vos données en CSV pour vos reportings (plan PRO).
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="glass-card p-6 border-accent/30 bg-gradient-to-r from-accent/10 to-cyan-500/10 text-center">
              <h3 className="text-xl font-bold text-white mb-2">
                🚀 Prêt à booster votre prospection ?
              </h3>
              <p className="text-white/70 text-sm mb-4">
                Essayez gratuitement avec 30 prospects et 2 tournées par mois. 
                Aucune carte bancaire requise.
              </p>
              <Button
                onClick={() => {
                  setShowDemo(false);
                  window.location.href = '/auth';
                }}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold shadow-lg"
              >
                Créer mon compte gratuit
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
