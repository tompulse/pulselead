import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const PolitiqueConfidentialite = () => {
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

        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6 md:mb-8">Politique de confidentialité</h1>

        <div className="space-y-5 sm:space-y-6 md:space-y-8 text-muted-foreground text-sm sm:text-base">
          <section>
            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-foreground mb-2 sm:mb-3 md:mb-4">1. Collecte des données personnelles</h2>
            <p>
              Nous collectons les données personnelles suivantes lors de votre utilisation de notre plateforme :
            </p>
            <ul className="list-disc ml-4 sm:ml-6 mt-2 sm:mt-3 md:mt-4 space-y-1 sm:space-y-2">
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
            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-foreground mb-2 sm:mb-3 md:mb-4">2. Finalité du traitement</h2>
            <p>Les données collectées sont utilisées pour :</p>
            <ul className="list-disc ml-4 sm:ml-6 mt-2 sm:mt-3 md:mt-4 space-y-1 sm:space-y-2">
              <li>Fournir et améliorer nos services</li>
              <li>Gérer votre compte utilisateur</li>
              <li>Vous permettre d'utiliser les fonctionnalités de la plateforme</li>
              <li>Communiquer avec vous concernant nos services</li>
              <li>Respecter nos obligations légales et réglementaires</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-foreground mb-2 sm:mb-3 md:mb-4">3. Base légale du traitement</h2>
            <p>
              Le traitement de vos données personnelles repose sur :
            </p>
            <ul className="list-disc ml-4 sm:ml-6 mt-2 sm:mt-3 md:mt-4 space-y-1 sm:space-y-2">
              <li>L'exécution du contrat de service</li>
              <li>Votre consentement pour certaines utilisations spécifiques</li>
              <li>Nos intérêts légitimes pour améliorer nos services</li>
              <li>Le respect de nos obligations légales</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-foreground mb-2 sm:mb-3 md:mb-4">4. Données d'entreprises tierces</h2>
            <p>
              <strong>Source :</strong> PULSE utilise des données publiques issues du répertoire SIRENE (INSEE). 
              Conformément à l'article A123-96 du Code de commerce, seules les entreprises n'ayant pas exercé leur droit d'opposition 
              à la diffusion sont affichées. PULSE est un outil d'optimisation de tournées terrain, pas un outil de prospection 
              téléphonique ou par email.
            </p>
            <p className="mt-2 sm:mt-3 md:mt-4">
              <strong>Données affichées :</strong> Les informations présentées sont strictement limitées aux données publiques 
              non personnelles : SIRET/SIREN, nom de l'entreprise, adresse et date de création.
            </p>
            <p className="mt-2 sm:mt-3 md:mt-4">
              <strong>Conformité RGPD :</strong> Aucune donnée personnelle des dirigeants n'est collectée ou affichée. 
              Les données sont mises à jour régulièrement mais leur exactitude ne peut être garantie à 100%. 
              L'utilisateur est responsable de vérifier les informations avant toute utilisation commerciale.
            </p>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-foreground mb-2 sm:mb-3 md:mb-4">5. Conservation des données</h2>
            <p>
              Vos données personnelles sont conservées pendant la durée nécessaire aux finalités pour lesquelles elles sont traitées, 
              et conformément aux obligations légales applicables.
            </p>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-foreground mb-2 sm:mb-3 md:mb-4">6. Vos droits</h2>
            <p>Conformément au RGPD et à la loi Informatique et Libertés, vous disposez des droits suivants :</p>
            <ul className="list-disc ml-4 sm:ml-6 mt-2 sm:mt-3 md:mt-4 space-y-1 sm:space-y-2">
              <li>Droit d'accès à vos données personnelles</li>
              <li>Droit de rectification de vos données</li>
              <li>Droit à l'effacement de vos données (droit à l'oubli)</li>
              <li>Droit à la limitation du traitement</li>
              <li>Droit à la portabilité de vos données</li>
              <li>Droit d'opposition au traitement</li>
            </ul>
            <p className="mt-2 sm:mt-3 md:mt-4">
              Pour exercer ces droits, contactez-nous à : tomiolovpro@gmail.com
            </p>
            <p className="mt-2 sm:mt-3 md:mt-4">
              Vous pouvez également introduire une réclamation auprès de la CNIL (Commission Nationale de l'Informatique et des Libertés) : www.cnil.fr
            </p>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-foreground mb-2 sm:mb-3 md:mb-4">7. Sécurité</h2>
            <p>
              Nous mettons en œuvre toutes les mesures techniques et organisationnelles appropriées pour protéger vos données personnelles 
              contre la destruction, la perte, l'altération, la divulgation ou l'accès non autorisé.
            </p>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-foreground mb-2 sm:mb-3 md:mb-4">8. Responsable du traitement</h2>
            <p className="mb-2 sm:mb-3 md:mb-4">
              <strong>Responsable du traitement :</strong> Tom Iolov - PULSE<br />
              <strong>Adresse :</strong> 108 rue de Crimée, 75019 Paris, France<br />
              <strong>SIRET :</strong> 948 550 561 00039<br />
              <strong>Email :</strong> tomiolovpro@gmail.com
            </p>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-foreground mb-2 sm:mb-3 md:mb-4">9. Sous-traitants et transferts de données</h2>
            <p>
              Dans le cadre de nos services, nous faisons appel aux sous-traitants suivants :
            </p>
            <ul className="list-disc ml-4 sm:ml-6 mt-2 sm:mt-3 md:mt-4 space-y-1 sm:space-y-2">
              <li><strong>Lovable Cloud / Supabase :</strong> Hébergement des données (Singapore)</li>
              <li><strong>Stripe :</strong> Traitement des paiements (certifié PCI-DSS)</li>
            </ul>
            <p className="mt-2 sm:mt-3 md:mt-4">
              Vos données peuvent être transférées en dehors de l'Union Européenne. Nous nous assurons que des garanties appropriées 
              sont en place conformément au RGPD, notamment par l'utilisation de clauses contractuelles types approuvées par la 
              Commission Européenne.
            </p>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-foreground mb-2 sm:mb-3 md:mb-4">10. Contact</h2>
            <p>
              Pour toute question relative à cette politique de confidentialité ou pour exercer vos droits RGPD, 
              vous pouvez nous contacter à : tomiolovpro@gmail.com
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

export default PolitiqueConfidentialite;
