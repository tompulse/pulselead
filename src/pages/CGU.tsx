import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const CGU = () => {
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

        <h1 className="text-4xl font-bold mb-8">Conditions Générales d'Utilisation (CGU)</h1>

        <div className="space-y-8 text-muted-foreground">
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">1. Objet</h2>
            <p>
              Les présentes Conditions Générales d'Utilisation (CGU) régissent l'utilisation de la plateforme PULSE, 
              éditée par Individual Entrepreneur PULSE, Entrepreneur Individuel enregistré en Georgia, 
              dont le siège social est situé à 75A Erosi Manjgaladze Street, 0180 Tbilisi, Georgia, 
              immatriculée sous le numéro 300453630.
            </p>
            <p className="mt-4">
              En accédant à la plateforme, vous acceptez sans réserve les présentes CGU.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">2. Accès à la plateforme</h2>
            <p>
              L'accès à PULSE nécessite la création d'un compte utilisateur. Vous devez fournir des informations exactes et complètes 
              lors de votre inscription. Vous êtes responsable de la confidentialité de vos identifiants de connexion.
            </p>
            <p className="mt-4">
              L'accès à certaines fonctionnalités peut nécessiter la souscription d'un abonnement payant conformément aux 
              Conditions Générales de Vente.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">3. Description des services</h2>
            <p>PULSE est une plateforme destinée aux commerciaux terrain proposant :</p>
            <ul className="list-disc ml-6 mt-4 space-y-2">
              <li>L'optimisation automatique d'itinéraires de tournées commerciales</li>
              <li>Le suivi et la gestion des interactions avec les prospects et clients</li>
              <li>L'accès à une base de données d'entreprises en temps réel</li>
              <li>Des outils d'analyse et de reporting de l'activité commerciale</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">4. Obligations de l'utilisateur</h2>
            <p>En utilisant PULSE, vous vous engagez à :</p>
            <ul className="list-disc ml-6 mt-4 space-y-2">
              <li>Utiliser la plateforme conformément à sa destination et de manière loyale</li>
              <li>Ne pas porter atteinte aux droits de propriété intellectuelle de PULSE</li>
              <li>Ne pas tenter d'accéder de manière non autorisée au système</li>
              <li>Respecter la réglementation en vigueur, notamment en matière de protection des données</li>
              <li>Ne pas utiliser la plateforme pour des activités illégales ou frauduleuses</li>
              <li>Ne pas revendre ou céder l'accès à votre compte</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">5. Propriété intellectuelle</h2>
            <p>
              Tous les éléments de la plateforme PULSE (codes, logiciels, structure, design, contenus, marques, logos) sont protégés 
              par le droit de la propriété intellectuelle. Toute reproduction, représentation, modification ou utilisation non autorisée 
              est strictement interdite.
            </p>
            <p className="mt-4">
              La licence d'utilisation accordée dans le cadre de l'abonnement est personnelle, non exclusive, non cessible et limitée 
              à la durée de l'abonnement.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">6. Données personnelles</h2>
            <p>
              Nous collectons et traitons vos données personnelles conformément au Règlement Général sur la Protection des Données (RGPD) 
              et à notre Politique de Confidentialité. Vous disposez d'un droit d'accès, de rectification, de suppression et d'opposition 
              à vos données personnelles.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">7. Données des entreprises tierces</h2>
            <p>
              Les données d'entreprises fournies par PULSE proviennent de sources publiques et de partenaires. Nous nous efforçons 
              de maintenir ces données à jour mais ne pouvons garantir leur exactitude absolue. L'utilisateur est responsable de vérifier 
              les informations avant toute utilisation commerciale.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">8. Disponibilité et maintenance</h2>
            <p>
              Nous nous efforçons d'assurer l'accessibilité de la plateforme 24h/24 et 7j/7. Toutefois, nous nous réservons le droit 
              d'interrompre temporairement l'accès pour des opérations de maintenance, mises à jour ou en cas de force majeure.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">9. Limitation de responsabilité</h2>
            <p>
              PULSE ne pourra être tenue responsable :
            </p>
            <ul className="list-disc ml-6 mt-4 space-y-2">
              <li>Des dommages indirects résultant de l'utilisation ou de l'impossibilité d'utiliser la plateforme</li>
              <li>De l'inexactitude des données tierces fournies</li>
              <li>Des interruptions de service indépendantes de notre volonté</li>
              <li>De l'utilisation frauduleuse ou abusive de la plateforme par un tiers ayant accédé aux identifiants de l'utilisateur</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">10. Suspension et résiliation</h2>
            <p>
              Nous nous réservons le droit de suspendre ou de résilier l'accès d'un utilisateur en cas de :
            </p>
            <ul className="list-disc ml-6 mt-4 space-y-2">
              <li>Violation des présentes CGU</li>
              <li>Utilisation frauduleuse de la plateforme</li>
              <li>Non-paiement des sommes dues</li>
              <li>Comportement préjudiciable à PULSE ou aux autres utilisateurs</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">11. Modifications des CGU</h2>
            <p>
              Nous nous réservons le droit de modifier les présentes CGU à tout moment. Les utilisateurs seront informés de toute 
              modification substantielle par email ou notification sur la plateforme. La poursuite de l'utilisation après modification 
              vaut acceptation des nouvelles conditions.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">12. Droit applicable et juridiction compétente</h2>
            <p>
              Les présentes CGU sont régies par le droit géorgien. Toutefois, conformément aux réglementations européennes, 
              les consommateurs résidant dans l'Union Européenne bénéficient des dispositions impératives de protection du 
              consommateur de leur pays de résidence. En cas de litige, les parties s'efforceront de trouver une solution amiable. 
              À défaut, les tribunaux de Tbilisi, Georgia seront compétents, sans préjudice des droits procéduraux des consommateurs de l'UE.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">13. Contact</h2>
            <p>
              Pour toute question concernant les présentes CGU, vous pouvez nous contacter à : tomiolovpro@gmail.com
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

export default CGU;
