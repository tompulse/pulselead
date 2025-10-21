import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const PolitiqueConfidentialite = () => {
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

        <h1 className="text-4xl font-bold mb-8">Politique de confidentialité</h1>

        <div className="space-y-8 text-muted-foreground">
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">1. Collecte des données personnelles</h2>
            <p>
              Nous collectons les données personnelles suivantes lors de votre utilisation de notre plateforme :
            </p>
            <ul className="list-disc ml-6 mt-4 space-y-2">
              <li>Informations d'identification (nom, prénom, email)</li>
              <li>Données de connexion et d'utilisation</li>
              <li>Données liées à votre activité commerciale (entreprises visitées, interactions)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">2. Finalité du traitement</h2>
            <p>Les données collectées sont utilisées pour :</p>
            <ul className="list-disc ml-6 mt-4 space-y-2">
              <li>Fournir et améliorer nos services</li>
              <li>Gérer votre compte utilisateur</li>
              <li>Vous permettre d'utiliser les fonctionnalités de la plateforme</li>
              <li>Communiquer avec vous concernant nos services</li>
              <li>Respecter nos obligations légales et réglementaires</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">3. Base légale du traitement</h2>
            <p>
              Le traitement de vos données personnelles repose sur :
            </p>
            <ul className="list-disc ml-6 mt-4 space-y-2">
              <li>L'exécution du contrat de service</li>
              <li>Votre consentement pour certaines utilisations spécifiques</li>
              <li>Nos intérêts légitimes pour améliorer nos services</li>
              <li>Le respect de nos obligations légales</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">4. Conservation des données</h2>
            <p>
              Vos données personnelles sont conservées pendant la durée nécessaire aux finalités pour lesquelles elles sont traitées, 
              et conformément aux obligations légales applicables.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">5. Vos droits</h2>
            <p>Conformément au RGPD, vous disposez des droits suivants :</p>
            <ul className="list-disc ml-6 mt-4 space-y-2">
              <li>Droit d'accès à vos données personnelles</li>
              <li>Droit de rectification de vos données</li>
              <li>Droit à l'effacement de vos données</li>
              <li>Droit à la limitation du traitement</li>
              <li>Droit à la portabilité de vos données</li>
              <li>Droit d'opposition au traitement</li>
            </ul>
            <p className="mt-4">
              Pour exercer ces droits, contactez-nous à : [email à compléter]
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">6. Sécurité</h2>
            <p>
              Nous mettons en œuvre toutes les mesures techniques et organisationnelles appropriées pour protéger vos données personnelles 
              contre la destruction, la perte, l'altération, la divulgation ou l'accès non autorisé.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">7. Contact</h2>
            <p>
              Pour toute question relative à cette politique de confidentialité, vous pouvez nous contacter à : [email à compléter]
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PolitiqueConfidentialite;
