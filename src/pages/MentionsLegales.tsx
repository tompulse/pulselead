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
            <p className="mb-2"><strong>Raison sociale :</strong> Individual Entrepreneur PULSE</p>
            <p className="mb-2"><strong>Forme juridique :</strong> Entrepreneur Individuel (Georgia)</p>
            <p className="mb-2"><strong>Siège social :</strong> 75A Erosi Manjgaladze Street, 0180 Tbilisi, Georgia</p>
            <p className="mb-2"><strong>N° d'enregistrement :</strong> 300453630</p>
            <p className="mb-2"><strong>Email :</strong> tomiolovpro@gmail.com</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Directeur de la publication</h2>
            <p><strong>Nom :</strong> Individual Entrepreneur PULSE</p>
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
              L'ensemble de ce site relève des conventions internationales sur le droit d'auteur et la propriété intellectuelle, 
              ainsi que du droit géorgien applicable à l'éditeur. Tous les droits de reproduction sont réservés, y compris pour 
              les documents téléchargeables et les représentations iconographiques et photographiques.
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
          <p>Dernière mise à jour : 27 novembre 2025</p>
        </div>
      </div>
    </div>
  );
};

export default MentionsLegales;
