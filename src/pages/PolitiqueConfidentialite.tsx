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
              <li>Données de géolocalisation lors de l'utilisation du GPS pour la navigation</li>
              <li>Historique des entreprises visitées et interactions commerciales enregistrées</li>
              <li>Entreprises ajoutées à vos tournées et zones géographiques de prospection</li>
              <li>Préférences de filtres (secteurs d'activité, départements, taille d'entreprise)</li>
              <li>Données importées depuis vos fichiers Excel (prospects, clients)</li>
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
            <p>Conformément au RGPD et à la loi Informatique et Libertés, vous disposez des droits suivants :</p>
            <ul className="list-disc ml-6 mt-4 space-y-2">
              <li>Droit d'accès à vos données personnelles</li>
              <li>Droit de rectification de vos données</li>
              <li>Droit à l'effacement de vos données (droit à l'oubli)</li>
              <li>Droit à la limitation du traitement</li>
              <li>Droit à la portabilité de vos données</li>
              <li>Droit d'opposition au traitement</li>
            </ul>
            <p className="mt-4">
              Pour exercer ces droits, contactez-nous à : tomiolovpro@gmail.com
            </p>
            <p className="mt-4">
              Vous pouvez également introduire une réclamation auprès de la CNIL (Commission Nationale de l'Informatique et des Libertés) : www.cnil.fr
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
            <h2 className="text-2xl font-semibold text-foreground mb-4">7. Responsable du traitement</h2>
            <p className="mb-4">
              <strong>Responsable du traitement :</strong> Tom Iolov - PULSE<br />
              <strong>Adresse :</strong> 108 rue de Crimée, 75019 Paris, France<br />
              <strong>SIRET :</strong> 948 550 561 00010<br />
              <strong>Email :</strong> tomiolovpro@gmail.com
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">8. Sous-traitants et transferts de données</h2>
            <p>
              Dans le cadre de nos services, nous faisons appel aux sous-traitants suivants :
            </p>
            <ul className="list-disc ml-6 mt-4 space-y-2">
              <li><strong>Lovable Cloud / Supabase :</strong> Hébergement des données (Singapore)</li>
              <li><strong>Stripe :</strong> Traitement des paiements (certifié PCI-DSS)</li>
            </ul>
            <p className="mt-4">
              Vos données peuvent être transférées en dehors de l'Union Européenne. Nous nous assurons que des garanties appropriées 
              sont en place conformément au RGPD, notamment par l'utilisation de clauses contractuelles types approuvées par la 
              Commission Européenne.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">9. Contact</h2>
            <p>
              Pour toute question relative à cette politique de confidentialité ou pour exercer vos droits RGPD, 
              vous pouvez nous contacter à : tomiolovpro@gmail.com
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

export default PolitiqueConfidentialite;
