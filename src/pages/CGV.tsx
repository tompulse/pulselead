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
            <p className="mb-2"><strong>Nom :</strong> Tom Iolov</p>
            <p className="mb-2"><strong>Enseigne commerciale :</strong> PULSE</p>
            <p className="mb-2"><strong>Statut :</strong> Entrepreneur individuel (auto-entrepreneur)</p>
            <p className="mb-2"><strong>SIRET :</strong> 948 550 561 00039</p>
            <p className="mb-2"><strong>RCS :</strong> Paris B 948 550 561</p>
            <p className="mb-2"><strong>Siège social :</strong> 108 rue de Crimée, 75019 Paris, France</p>
            <p className="mb-2"><strong>Email :</strong> tomiolovpro@gmail.com</p>
            <p className="mb-2"><strong>TVA :</strong> TVA non applicable, art. 293 B du CGI</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">3. Services proposés</h2>
            <p>PULSE propose une plateforme SaaS (Software as a Service) de prospection territoriale intelligente. L'offre "Commercial Solo" à 49€/mois comprend :</p>
            <ul className="list-disc ml-6 mt-4 space-y-2">
              <li><strong>Cartographie territoire :</strong> visualisez tous vos prospects sur une carte interactive</li>
              <li><strong>Tournées optimisées IA :</strong> calcul automatique du meilleur itinéraire pour réduire vos temps de trajet</li>
              <li><strong>CRM mobile terrain :</strong> gestion des visites et relances depuis votre smartphone ou tablette</li>
              <li><strong>Filtres intelligents :</strong> recherche par département, secteur d'activité et taille d'entreprise</li>
              <li><strong>Pipeline Kanban :</strong> suivi visuel de vos opportunités du premier contact à la signature</li>
              <li><strong>Relances programmées :</strong> programmez vos rappels clients pour ne plus jamais manquer un suivi</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">4. Prix</h2>
            <p>
              Les prix des services sont indiqués en euros (€) toutes taxes comprises (TTC). 
              TVA non applicable conformément à l'article 293 B du CGI (franchise en base de TVA).
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
              Le paiement s'effectue en ligne de manière sécurisée via Stripe, notre prestataire de paiement certifié PCI-DSS. 
              Les informations de paiement sont transmises de manière cryptée et ne sont pas stockées par PULSE.
            </p>
            <p className="mt-4">
              Le paiement est exigible immédiatement à la commande. En cas d'abonnement, le paiement est prélevé automatiquement 
              à chaque échéance mensuelle.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">7. Durée et renouvellement</h2>
            <p>
              Les abonnements sont souscrits pour une durée mensuelle et sont renouvelés automatiquement 
              sauf résiliation dans les conditions prévues à l'article 8.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">8. Droit de rétractation et résiliation</h2>
            <p className="mb-4">
              <strong>Droit de rétractation :</strong> Conformément aux articles L.221-18 et suivants du Code de la consommation, 
              vous disposez d'un délai de 14 jours à compter de la souscription pour exercer votre droit de rétractation sans avoir à justifier de motifs.
            </p>
            <p>
              <strong>Résiliation :</strong> Vous pouvez résilier votre abonnement à tout moment depuis votre espace client ou via le portail Stripe. 
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
              tel que défini par l'article 1218 du Code civil.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">12. Droit applicable et médiation</h2>
            <p className="mb-4">
              Les présentes CGV sont soumises au droit français. En cas de litige, les parties s'efforceront de trouver une solution amiable. 
              À défaut, les tribunaux de Paris seront seuls compétents.
            </p>
            <p>
              Conformément aux articles L.612-1 et suivants du Code de la consommation, vous pouvez recourir gratuitement à un médiateur de la consommation. 
              Vous pouvez également utiliser la plateforme européenne de règlement en ligne des litiges (RLL) disponible à l'adresse suivante : 
              https://ec.europa.eu/consumers/odr
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-accent/20 text-center text-muted-foreground text-sm">
          <p>Dernière mise à jour : 13 janvier 2026</p>
        </div>
      </div>
    </div>
  );
};

export default CGV;
