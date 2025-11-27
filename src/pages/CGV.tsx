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
            <p className="mb-2"><strong>Raison sociale :</strong> Individual Entrepreneur PULSE</p>
            <p className="mb-2"><strong>Forme juridique :</strong> Entrepreneur Individuel (Georgia)</p>
            <p className="mb-2"><strong>Siège social :</strong> 75A Erosi Manjgaladze Street, 0180 Tbilisi, Georgia</p>
            <p className="mb-2"><strong>Email :</strong> tomiolovpro@gmail.com</p>
            <p className="mb-2"><strong>Numéro d'enregistrement :</strong> 300453630</p>
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
            <p>
              Le paiement s'effectue en ligne de manière sécurisée via Paddle.com (Merchant of Record). 
              Paddle gère l'ensemble du processus de paiement, y compris la collecte de la TVA applicable. 
              Les informations de paiement sont transmises de manière cryptée et ne sont pas stockées par PULSE.
            </p>
            <p className="mt-4">
              Le paiement est exigible immédiatement à la commande. En cas d'abonnement, le paiement est prélevé automatiquement 
              à chaque échéance (mensuelle, trimestrielle ou annuelle selon la formule choisie).
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
            <h2 className="text-2xl font-semibold text-foreground mb-4">12. Droit applicable et médiation</h2>
            <p className="mb-4">
              Les présentes CGV sont soumises au droit géorgien. Toutefois, conformément aux réglementations européennes, 
              les consommateurs résidant dans l'Union Européenne bénéficient des dispositions impératives de protection du 
              consommateur de leur pays de résidence. En cas de litige, les parties s'efforceront de trouver une solution amiable. 
              À défaut, les tribunaux de Tbilisi, Georgia seront compétents, sans préjudice des droits procéduraux des consommateurs de l'UE.
            </p>
            <p>
              Les consommateurs résidant dans l'Union Européenne peuvent recourir à la plateforme européenne de règlement en ligne des litiges 
              (RLL) disponible à l'adresse suivante : https://ec.europa.eu/consumers/odr
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-accent/20 text-center text-muted-foreground text-sm">
          <p>Dernière mise à jour : 27 novembre 2025</p>
        </div>
      </div>
    </div>
  );
};

export default CGV;
