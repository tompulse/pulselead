import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const CGU = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 sm:py-8 md:py-12 max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-4 sm:mb-6 md:mb-8 h-9 px-3 text-sm"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>

        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6 md:mb-8">Conditions Générales d'Utilisation (CGU)</h1>

        <div className="space-y-5 sm:space-y-6 md:space-y-8 text-muted-foreground text-sm sm:text-base">
          <section>
            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-foreground mb-2 sm:mb-3 md:mb-4">1. Objet</h2>
            <p>
              Les présentes Conditions Générales d'Utilisation (CGU) régissent l'utilisation de la plateforme PULSE, 
              éditée par Tom Iolov, exerçant sous l'enseigne PULSE en tant qu'entrepreneur individuel, 
              immatriculé au RCS de Paris sous le numéro 948 550 561, 
              dont le siège social est situé au 108 rue de Crimée, 75019 Paris, France.
            </p>
            <p className="mt-4">
              En accédant à la plateforme, vous acceptez sans réserve les présentes CGU.
            </p>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-foreground mb-2 sm:mb-3 md:mb-4">2. Accès à la plateforme</h2>
            <p>
              L'accès à PULSE nécessite la création d'un compte utilisateur. Vous devez fournir des informations exactes et complètes 
              lors de votre inscription. Vous êtes responsable de la confidentialité de vos identifiants de connexion.
            </p>
            <p className="mt-2 sm:mt-3 md:mt-4">
              L'accès à certaines fonctionnalités peut nécessiter la souscription d'un abonnement payant conformément aux 
              Conditions Générales de Vente.
            </p>
            <p className="mt-2 sm:mt-3 md:mt-4 p-4 bg-muted/30 rounded-lg border border-accent/20">
              <strong>Essai gratuit :</strong> Un essai gratuit de <strong>7 jours</strong> est proposé aux nouveaux utilisateurs de l'offre 
              "Commercial Solo". Pendant cette période, vous bénéficiez d'un accès complet à toutes les fonctionnalités. 
              L'essai nécessite l'enregistrement d'un moyen de paiement qui <strong>ne sera débité qu'à l'issue de la période d'essai</strong>, 
              sauf annulation de votre part avant cette date.
            </p>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-foreground mb-2 sm:mb-3 md:mb-4">3. Description des services</h2>
            <p>PULSE est une plateforme de prospection intelligente destinée aux commerciaux terrain. L'offre "Commercial Solo" comprend :</p>
            <ul className="list-disc ml-4 sm:ml-6 mt-2 sm:mt-3 md:mt-4 space-y-1 sm:space-y-2">
              <li><strong>Liste de prospects filtrée :</strong> accédez aux nouvelles entreprises créées en France selon vos critères</li>
              <li><strong>Tournées optimisées IA :</strong> calcul automatique du meilleur itinéraire pour réduire vos temps de trajet</li>
              <li><strong>CRM mobile terrain :</strong> gestion des visites et relances depuis votre smartphone ou tablette</li>
              <li><strong>Filtres intelligents :</strong> recherche par département, secteur d'activité et taille d'entreprise</li>
              <li><strong>Pipeline Kanban :</strong> suivi visuel de vos opportunités du premier contact à la signature</li>
              <li><strong>Suivi des relances :</strong> programmez vos rappels clients et retrouvez-les dans votre CRM</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-foreground mb-2 sm:mb-3 md:mb-4">4. Obligations de l'utilisateur</h2>
            <p>En utilisant PULSE, vous vous engagez à :</p>
            <ul className="list-disc ml-4 sm:ml-6 mt-2 sm:mt-3 md:mt-4 space-y-1 sm:space-y-2">
              <li>Utiliser la plateforme conformément à sa destination et de manière loyale</li>
              <li>Ne pas porter atteinte aux droits de propriété intellectuelle de PULSE</li>
              <li>Ne pas tenter d'accéder de manière non autorisée au système</li>
              <li>Respecter la réglementation en vigueur, notamment en matière de protection des données</li>
              <li>Ne pas utiliser la plateforme pour des activités illégales ou frauduleuses</li>
              <li>Ne pas revendre ou céder l'accès à votre compte</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-foreground mb-2 sm:mb-3 md:mb-4">5. Propriété intellectuelle</h2>
            <p>
              Tous les éléments de la plateforme PULSE (codes, logiciels, structure, design, contenus, marques, logos) sont protégés 
              par le droit de la propriété intellectuelle. Toute reproduction, représentation, modification ou utilisation non autorisée 
              est strictement interdite.
            </p>
            <p className="mt-2 sm:mt-3 md:mt-4">
              La licence d'utilisation accordée dans le cadre de l'abonnement est personnelle, non exclusive, non cessible et limitée 
              à la durée de l'abonnement.
            </p>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-foreground mb-2 sm:mb-3 md:mb-4">6. Données personnelles</h2>
            <p>
              Nous collectons et traitons vos données personnelles conformément au Règlement Général sur la Protection des Données (RGPD) 
              et à notre Politique de Confidentialité. Vous disposez d'un droit d'accès, de rectification, de suppression et d'opposition 
              à vos données personnelles.
            </p>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-foreground mb-2 sm:mb-3 md:mb-4">7. Source et utilisation des données d'entreprises</h2>
            <p>
              PULSE utilise des données publiques issues du répertoire SIRENE (INSEE). 
              Conformément à l'article A123-96 du Code de commerce, seules les entreprises n'ayant pas exercé leur droit d'opposition à la diffusion 
              sont affichées. PULSE est un outil d'optimisation de tournées terrain, pas un outil de prospection téléphonique ou par email.
            </p>
            <p className="mt-2 sm:mt-3 md:mt-4">
              <strong>Données affichées :</strong> Les informations présentées sont strictement limitées aux données publiques non personnelles : 
              SIRET/SIREN, nom de l'entreprise, adresse et date de création.
            </p>
            <p className="mt-2 sm:mt-3 md:mt-4">
              Les données proviennent exclusivement du répertoire SIRENE (INSEE) et sont mises à jour régulièrement. Nous nous efforçons 
              de maintenir ces données à jour mais ne pouvons garantir leur exactitude absolue. L'utilisateur est responsable de vérifier 
              les informations avant toute utilisation commerciale.
            </p>
            <p className="mt-2 sm:mt-3 md:mt-4 p-4 bg-accent/10 rounded-lg border border-accent/20">
              <strong>Engagement de conformité :</strong> PULSE s'engage à respecter strictement les droits d'opposition exercés par les entreprises 
              conformément au RGPD et à la législation française sur la protection des données. Aucune donnée personnelle des dirigeants n'est collectée ou affichée.
            </p>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-foreground mb-2 sm:mb-3 md:mb-4">8. Disponibilité et maintenance</h2>
            <p>
              Nous nous efforçons d'assurer l'accessibilité de la plateforme 24h/24 et 7j/7. Toutefois, nous nous réservons le droit 
              d'interrompre temporairement l'accès pour des opérations de maintenance, mises à jour ou en cas de force majeure.
            </p>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-foreground mb-2 sm:mb-3 md:mb-4">9. Limitation de responsabilité</h2>
            <p>
              PULSE ne pourra être tenue responsable :
            </p>
            <ul className="list-disc ml-4 sm:ml-6 mt-2 sm:mt-3 md:mt-4 space-y-1 sm:space-y-2">
              <li>Des dommages indirects résultant de l'utilisation ou de l'impossibilité d'utiliser la plateforme</li>
              <li>De l'inexactitude des données tierces fournies</li>
              <li>Des interruptions de service indépendantes de notre volonté</li>
              <li>De l'utilisation frauduleuse ou abusive de la plateforme par un tiers ayant accédé aux identifiants de l'utilisateur</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-foreground mb-2 sm:mb-3 md:mb-4">10. Suspension et résiliation</h2>
            <p>
              Nous nous réservons le droit de suspendre ou de résilier l'accès d'un utilisateur en cas de :
            </p>
            <ul className="list-disc ml-4 sm:ml-6 mt-2 sm:mt-3 md:mt-4 space-y-1 sm:space-y-2">
              <li>Violation des présentes CGU</li>
              <li>Utilisation frauduleuse de la plateforme</li>
              <li>Non-paiement des sommes dues</li>
              <li>Comportement préjudiciable à PULSE ou aux autres utilisateurs</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-foreground mb-2 sm:mb-3 md:mb-4">11. Modifications des CGU</h2>
            <p>
              Nous nous réservons le droit de modifier les présentes CGU à tout moment. Les utilisateurs seront informés de toute 
              modification substantielle par email ou notification sur la plateforme. La poursuite de l'utilisation après modification 
              vaut acceptation des nouvelles conditions.
            </p>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-foreground mb-2 sm:mb-3 md:mb-4">12. Droit applicable et juridiction compétente</h2>
            <p>
              Les présentes CGU sont régies par le droit français. En cas de litige, les parties s'efforceront de trouver une solution amiable. 
              À défaut, les tribunaux de Paris seront seuls compétents.
            </p>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-foreground mb-2 sm:mb-3 md:mb-4">13. Contact</h2>
            <p>
              Pour toute question concernant les présentes CGU, vous pouvez nous contacter à : tomiolovpro@gmail.com
            </p>
          </section>
        </div>

        <div className="mt-8 sm:mt-10 md:mt-12 pt-4 sm:pt-6 md:pt-8 border-t border-accent/20 text-center text-muted-foreground text-xs sm:text-sm">
          <p>Dernière mise à jour : 22 janvier 2026</p>
        </div>
      </div>
    </div>
  );
};

export default CGU;
