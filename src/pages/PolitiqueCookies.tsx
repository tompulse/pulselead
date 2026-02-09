import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const PolitiqueCookies = () => {
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

        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6 md:mb-8">Politique relative aux cookies</h1>

        <div className="space-y-5 sm:space-y-6 md:space-y-8 text-muted-foreground text-sm sm:text-base">
          <section>
            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-foreground mb-2 sm:mb-3 md:mb-4">1. Qu'est-ce qu'un cookie ?</h2>
            <p>
              Un cookie est un petit fichier texte déposé sur votre terminal (ordinateur, smartphone, tablette) 
              lors de la visite d'un site web. Il permet de mémoriser des informations relatives à votre navigation.
            </p>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-foreground mb-2 sm:mb-3 md:mb-4">2. Cookies utilisés par PULSE</h2>
            
            <h3 className="text-base sm:text-lg font-semibold text-foreground mt-4 mb-2">2.1. Cookies strictement nécessaires</h3>
            <p>Ces cookies sont indispensables au fonctionnement du site :</p>
            <ul className="list-disc ml-4 sm:ml-6 mt-2 sm:mt-3 md:mt-4 space-y-1 sm:space-y-2">
              <li><strong>Cookie de session d'authentification :</strong> permet de maintenir votre connexion active pendant votre navigation</li>
              <li><strong>Cookie de sécurité CSRF :</strong> protège contre les attaques de type Cross-Site Request Forgery</li>
              <li><strong>Cookie de préférences :</strong> mémorise vos choix (langue, consentement cookies)</li>
            </ul>
            <p className="mt-2 sm:mt-3 md:mt-4">
              Ces cookies ne nécessitent pas votre consentement préalable car ils sont essentiels au fonctionnement du service.
            </p>

            <h3 className="text-base sm:text-lg font-semibold text-foreground mt-4 mb-2">2.2. Cookies de mesure d'audience (avec consentement)</h3>
            <p>Si vous y consentez, nous utilisons :</p>
            <ul className="list-disc ml-4 sm:ml-6 mt-2 sm:mt-3 md:mt-4 space-y-1 sm:space-y-2">
              <li><strong>Google Analytics :</strong> mesure l'audience et analyse les comportements de navigation pour améliorer nos services</li>
            </ul>
            <p className="mt-2 sm:mt-3 md:mt-4">
              Durée de conservation : 13 mois maximum.
            </p>

            <h3 className="text-base sm:text-lg font-semibold text-foreground mt-4 mb-2">2.3. Cookies de géolocalisation (avec consentement)</h3>
            <p>
              Lorsque vous utilisez les fonctionnalités de tournées GPS optimisées, nous pouvons stocker temporairement 
              votre position géographique pour calculer les itinéraires. Vous pouvez refuser la géolocalisation à tout moment 
              dans les paramètres de votre navigateur ou de votre terminal.
            </p>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-foreground mb-2 sm:mb-3 md:mb-4">3. Gestion de vos préférences cookies</h2>
            <p className="mb-2 sm:mb-3 md:mb-4">
              Lors de votre première visite, une bannière vous permet d'accepter ou de refuser les cookies non essentiels. 
              Vous pouvez modifier vos préférences à tout moment :
            </p>
            <ul className="list-disc ml-4 sm:ml-6 mt-2 sm:mt-3 md:mt-4 space-y-1 sm:space-y-2">
              <li>En cliquant sur le lien "Gérer mes cookies" en bas de page</li>
              <li>En paramétrant votre navigateur pour bloquer ou supprimer les cookies</li>
            </ul>
            
            <h3 className="text-base sm:text-lg font-semibold text-foreground mt-4 mb-2">Configuration de votre navigateur :</h3>
            <ul className="list-disc ml-4 sm:ml-6 mt-2 sm:mt-3 md:mt-4 space-y-1 sm:space-y-2">
              <li><strong>Chrome :</strong> Paramètres &gt; Confidentialité et sécurité &gt; Cookies</li>
              <li><strong>Firefox :</strong> Options &gt; Vie privée et sécurité &gt; Cookies</li>
              <li><strong>Safari :</strong> Préférences &gt; Confidentialité &gt; Cookies</li>
              <li><strong>Edge :</strong> Paramètres &gt; Confidentialité &gt; Cookies</li>
            </ul>
            
            <p className="mt-4 p-4 bg-amber-500/10 rounded-lg border border-amber-500/20 text-foreground">
              ⚠️ <strong>Important :</strong> Le refus des cookies strictement nécessaires peut empêcher l'utilisation de certaines fonctionnalités 
              de PULSE (connexion, gestion de compte, enregistrement des préférences).
            </p>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-foreground mb-2 sm:mb-3 md:mb-4">4. Durée de conservation</h2>
            <ul className="list-disc ml-4 sm:ml-6 mt-2 sm:mt-3 md:mt-4 space-y-1 sm:space-y-2">
              <li><strong>Cookies de session :</strong> supprimés à la fermeture du navigateur</li>
              <li><strong>Cookies d'authentification :</strong> 30 jours maximum</li>
              <li><strong>Cookies de consentement :</strong> 13 mois</li>
              <li><strong>Cookies Google Analytics :</strong> 13 mois maximum</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-foreground mb-2 sm:mb-3 md:mb-4">5. Cookies tiers</h2>
            <p className="mb-2 sm:mb-3 md:mb-4">
              PULSE peut utiliser des services tiers qui déposent leurs propres cookies :
            </p>
            <ul className="list-disc ml-4 sm:ml-6 mt-2 sm:mt-3 md:mt-4 space-y-1 sm:space-y-2">
              <li><strong>Google Analytics :</strong> statistiques d'audience (avec votre consentement)</li>
              <li><strong>Stripe :</strong> traitement sécurisé des paiements</li>
              <li><strong>Mapbox :</strong> affichage des cartes et calculs d'itinéraires</li>
            </ul>
            <p className="mt-2 sm:mt-3 md:mt-4">
              Ces services peuvent déposer des cookies soumis à leurs propres politiques de confidentialité. 
              Nous vous recommandons de consulter leurs politiques respectives.
            </p>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-foreground mb-2 sm:mb-3 md:mb-4">6. Vos droits</h2>
            <p>
              Conformément au RGPD, vous disposez d'un droit d'accès, de rectification, de suppression et d'opposition 
              concernant les données collectées via les cookies. Pour exercer ces droits, contactez-nous à : 
              <strong> tomiolovpro@gmail.com</strong>
            </p>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-foreground mb-2 sm:mb-3 md:mb-4">7. Mise à jour de la politique cookies</h2>
            <p>
              Cette politique peut être modifiée à tout moment pour refléter les évolutions réglementaires ou 
              les changements de nos pratiques. La version en vigueur est celle publiée sur cette page.
            </p>
            <p className="mt-2 sm:mt-3 md:mt-4">
              <strong>Date de dernière mise à jour :</strong> Février 2026
            </p>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-foreground mb-2 sm:mb-3 md:mb-4">8. Contact</h2>
            <p>Pour toute question concernant notre politique cookies :</p>
            <p className="mt-2"><strong>Email :</strong> tomiolovpro@gmail.com</p>
            <p><strong>Adresse :</strong> 108 rue de Crimée, 75019 Paris, France</p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PolitiqueCookies;
