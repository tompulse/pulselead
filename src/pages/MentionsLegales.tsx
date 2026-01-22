import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const MentionsLegales = () => {
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

        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6 md:mb-8">Mentions légales</h1>

        <div className="space-y-5 sm:space-y-6 md:space-y-8 text-muted-foreground text-sm sm:text-base">
          <section>
            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-foreground mb-2 sm:mb-3 md:mb-4">Éditeur du site</h2>
            <p className="mb-1 sm:mb-2"><strong>Nom :</strong> Tom Iolov</p>
            <p className="mb-1 sm:mb-2"><strong>Enseigne commerciale :</strong> PULSE</p>
            <p className="mb-1 sm:mb-2"><strong>Statut :</strong> Entrepreneur individuel (auto-entrepreneur)</p>
            <p className="mb-1 sm:mb-2"><strong>SIRET :</strong> 948 550 561 00039</p>
            <p className="mb-1 sm:mb-2"><strong>RCS :</strong> Paris B 948 550 561</p>
            <p className="mb-1 sm:mb-2"><strong>Siège social :</strong> 108 rue de Crimée, 75019 Paris, France</p>
            <p className="mb-1 sm:mb-2"><strong>Email :</strong> tomiolovpro@gmail.com</p>
            <p className="mb-1 sm:mb-2"><strong>TVA :</strong> TVA non applicable, art. 293 B du CGI</p>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-foreground mb-2 sm:mb-3 md:mb-4">Directeur de la publication</h2>
            <p><strong>Nom :</strong> Tom Iolov</p>
            <p><strong>Email :</strong> tomiolovpro@gmail.com</p>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-foreground mb-2 sm:mb-3 md:mb-4">Hébergement</h2>
            <p className="mb-1 sm:mb-2"><strong>Hébergeur :</strong> Lovable Cloud (propulsé par Supabase)</p>
            <p className="mb-1 sm:mb-2"><strong>Adresse :</strong> 970 Toa Payoh North, #07-04, Singapore 318992</p>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-foreground mb-2 sm:mb-3 md:mb-4">Sources de données</h2>
            <p className="mb-2 sm:mb-3 md:mb-4">
              <strong>Données d'entreprises :</strong> Les informations sur les entreprises, associations et collectivités affichées dans PULSE 
              proviennent du répertoire SIRENE géré par l'INSEE (Institut National de la Statistique et des Études Économiques).
            </p>
            <p className="mb-2 sm:mb-3 md:mb-4">
              Ces données sont des données publiques au sens de la loi française. Conformément à l'article A123-96 du Code de commerce, 
              seules les entreprises n'ayant pas exercé leur droit d'opposition à la diffusion de leurs données à des fins de prospection 
              commerciale sont affichées.
            </p>
            <p className="mb-2 sm:mb-3 md:mb-4">
              <strong>Usage des données :</strong> PULSE est un outil d'optimisation de tournées commerciales terrain. 
              Il n'est pas destiné à la prospection téléphonique ou par email. Les données affichées sont strictement limitées 
              aux informations publiques non personnelles (raison sociale, adresse du siège, activité, effectifs).
            </p>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-foreground mb-2 sm:mb-3 md:mb-4">Propriété intellectuelle</h2>
            <p>
              L'ensemble de ce site relève de la législation française sur le droit d'auteur et la propriété intellectuelle. 
              Tous les droits de reproduction sont réservés, y compris pour les documents téléchargeables et les représentations 
              iconographiques et photographiques.
            </p>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-foreground mb-2 sm:mb-3 md:mb-4">Données personnelles</h2>
            <p>
              Conformément au Règlement Général sur la Protection des Données (RGPD), vous disposez d'un droit d'accès, de rectification, 
              de suppression et d'opposition aux données personnelles vous concernant. Pour exercer ces droits, veuillez nous contacter à : 
              tomiolovpro@gmail.com
            </p>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-foreground mb-2 sm:mb-3 md:mb-4">Cookies</h2>
            <p>
              Ce site utilise des cookies pour améliorer l'expérience utilisateur et réaliser des statistiques de visites. 
              Vous pouvez vous opposer à l'enregistrement de cookies en configurant votre navigateur.
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

export default MentionsLegales;
