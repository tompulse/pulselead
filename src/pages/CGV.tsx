import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const CGV = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-8"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>

        <h1 className="text-4xl font-bold mb-8">Conditions Générales de Vente (CGV)</h1>

        <div className="space-y-8 text-muted-foreground">
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">1. Objet</h2>
            <p>
              Les présentes Conditions Générales de Vente (CGV) régissent la vente et la fourniture des services PULSE, 
              plateforme d'optimisation de tournées commerciales et de gestion de portefeuille client.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">2. Identification du vendeur</h2>
            <p className="mb-2"><strong>Raison sociale :</strong> [À compléter]</p>
            <p className="mb-2"><strong>Siège social :</strong> [À compléter]</p>
            <p className="mb-2"><strong>RCS :</strong> [À compléter]</p>
            <p className="mb-2"><strong>Email :</strong> [À compléter]</p>
            <p className="mb-2"><strong>TVA intracommunautaire :</strong> [À compléter]</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">3. Services proposés</h2>
            <p>PULSE propose une plateforme SaaS (Software as a Service) comprenant :</p>
            <ul className="list-disc ml-6 mt-4 space-y-2">
              <li>Optimisation intelligente des tournées commerciales</li>
              <li>Suivi et gestion des interactions clients</li>
              <li>Accès aux données d'entreprises en temps réel</li>
              <li>Analyse et statistiques de performance</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">4. Prix</h2>
            <p>
              Les prix des services sont indiqués en euros (€) hors taxes et toutes taxes comprises (TTC). 
              Les prix sont ceux en vigueur au moment de la commande. Nous nous réservons le droit de modifier nos tarifs à tout moment, 
              sous réserve d'en informer les clients avec un préavis raisonnable.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">5. Commande et souscription</h2>
            <p>
              La souscription à nos services s'effectue en ligne sur notre plateforme. La validation de la commande implique l'acceptation 
              des présentes CGV. Une confirmation de commande est envoyée par email.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">6. Paiement</h2>
            <p>Le paiement s'effectue :</p>
            <ul className="list-disc ml-6 mt-4 space-y-2">
              <li>Par carte bancaire</li>
              <li>Par prélèvement automatique (pour les abonnements récurrents)</li>
              <li>Par virement bancaire (sur demande pour les forfaits entreprise)</li>
            </ul>
            <p className="mt-4">
              Le paiement est exigible immédiatement à la commande. En cas d'abonnement, le paiement est prélevé automatiquement 
              à chaque échéance (mensuelle ou annuelle selon la formule choisie).
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">7. Durée et renouvellement</h2>
            <p>
              Les abonnements sont souscrits pour une durée déterminée (mensuelle ou annuelle) et sont renouvelés automatiquement 
              sauf résiliation dans les conditions prévues à l'article 8.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">8. Droit de rétractation et résiliation</h2>
            <p className="mb-4">
              <strong>Droit de rétractation :</strong> Conformément à la législation en vigueur, vous disposez d'un délai de 14 jours 
              à compter de la souscription pour exercer votre droit de rétractation sans avoir à justifier de motifs.
            </p>
            <p>
              <strong>Résiliation :</strong> Vous pouvez résilier votre abonnement à tout moment depuis votre espace client. 
              La résiliation prend effet à la fin de la période d'abonnement en cours. Aucun remboursement au prorata ne sera effectué 
              pour la période en cours.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">9. Disponibilité du service</h2>
            <p>
              Nous nous efforçons d'assurer une disponibilité du service de 99,5% sur une base annuelle. Des interruptions peuvent survenir 
              pour maintenance programmée, dont nous vous informerons dans la mesure du possible.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">10. Responsabilité</h2>
            <p>
              Notre responsabilité est limitée aux dommages directs et prévisibles résultant d'un manquement à nos obligations contractuelles. 
              Nous ne pourrons être tenus responsables des dommages indirects tels que perte de chiffre d'affaires, perte de clientèle, 
              ou préjudice d'image.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">11. Force majeure</h2>
            <p>
              Nous ne pourrons être tenus responsables de tout retard ou inexécution de nos obligations résultant d'un cas de force majeure 
              tel que défini par la jurisprudence française.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">12. Droit applicable et juridiction</h2>
            <p>
              Les présentes CGV sont soumises au droit français. En cas de litige, et après tentative de recherche d'une solution amiable, 
              les tribunaux français seront seuls compétents.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">13. Médiation</h2>
            <p>
              Conformément à l'article L. 612-1 du Code de la consommation, nous proposons un dispositif de médiation de la consommation. 
              L'entité de médiation retenue est : [À compléter]
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default CGV;
