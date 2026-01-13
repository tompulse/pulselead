import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const MentionsLegales = () => {
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

        <h1 className="text-4xl font-bold mb-8">Mentions légales</h1>

        <div className="space-y-8 text-muted-foreground">
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Éditeur du site</h2>
            <p className="mb-2"><strong>Nom :</strong> Tom Iolov</p>
            <p className="mb-2"><strong>Enseigne commerciale :</strong> PULSE</p>
            <p className="mb-2"><strong>Statut :</strong> Entrepreneur individuel (auto-entrepreneur)</p>
            <p className="mb-2"><strong>SIRET :</strong> 948 550 561 00010</p>
            <p className="mb-2"><strong>RCS :</strong> Paris B 948 550 561</p>
            <p className="mb-2"><strong>Siège social :</strong> 108 rue de Crimée, 75019 Paris, France</p>
            <p className="mb-2"><strong>Email :</strong> tomiolovpro@gmail.com</p>
            <p className="mb-2"><strong>TVA :</strong> TVA non applicable, art. 293 B du CGI</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Directeur de la publication</h2>
            <p><strong>Nom :</strong> Tom Iolov</p>
            <p><strong>Email :</strong> tomiolovpro@gmail.com</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Hébergement</h2>
            <p className="mb-2"><strong>Hébergeur :</strong> Lovable Cloud (propulsé par Supabase)</p>
            <p className="mb-2"><strong>Adresse :</strong> 970 Toa Payoh North, #07-04, Singapore 318992</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Propriété intellectuelle</h2>
            <p>
              L'ensemble de ce site relève de la législation française sur le droit d'auteur et la propriété intellectuelle. 
              Tous les droits de reproduction sont réservés, y compris pour les documents téléchargeables et les représentations 
              iconographiques et photographiques.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Données personnelles</h2>
            <p>
              Conformément au Règlement Général sur la Protection des Données (RGPD), vous disposez d'un droit d'accès, de rectification, 
              de suppression et d'opposition aux données personnelles vous concernant. Pour exercer ces droits, veuillez nous contacter à : 
              tomiolovpro@gmail.com
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Cookies</h2>
            <p>
              Ce site utilise des cookies pour améliorer l'expérience utilisateur et réaliser des statistiques de visites. 
              Vous pouvez vous opposer à l'enregistrement de cookies en configurant votre navigateur.
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

export default MentionsLegales;
