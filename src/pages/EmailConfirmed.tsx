import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2 } from "lucide-react";

const EmailConfirmed = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkConfirmation = async () => {
      try {
        // Vérifier s'il y a une session active (après confirmation email)
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("[EMAIL CONFIRMED] Session error:", sessionError);
          setError("Erreur lors de la vérification de votre email");
          setLoading(false);
          return;
        }

        if (session) {
          console.log("[EMAIL CONFIRMED] Session found, email confirmed");
          
          // ⚠️ IMPORTANT : Se déconnecter IMMÉDIATEMENT pour éviter redirection automatique
          console.log("[EMAIL CONFIRMED] Signing out to prevent auto-redirect");
          await supabase.auth.signOut();
          
          setIsConfirmed(true);
          console.log("[EMAIL CONFIRMED] User signed out, will need to login to choose plan");

        } else {
          console.log("[EMAIL CONFIRMED] No session, email might not be confirmed yet");
          // Peut-être que l'email n'est pas encore confirmé, mais on affiche quand même le message
          setIsConfirmed(true);
        }
      } catch (err: any) {
        console.error("[EMAIL CONFIRMED] Error:", err);
        setError(err.message || "Une erreur est survenue");
      } finally {
        setLoading(false);
      }
    };

    checkConfirmation();
  }, []);

  const handleContinue = () => {
    // Utilisateur est déjà déconnecté, juste rediriger vers login
    navigate("/auth?mode=login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-navy-deep to-black-deep flex items-center justify-center p-6">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 text-accent animate-spin mx-auto" />
          <p className="text-white/70">Vérification de votre email...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-navy-deep to-black-deep flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="glass-card p-8 text-center space-y-6">
            <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
              <span className="text-4xl">❌</span>
            </div>
            
            <h1 className="text-2xl font-bold text-white">Erreur de confirmation</h1>
            
            <p className="text-white/70">{error}</p>
            
            <Button
              onClick={() => navigate("/auth")}
              className="w-full bg-accent hover:bg-accent/90 text-primary font-semibold"
            >
              Retour à la page de connexion
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-navy-deep to-black-deep flex items-center justify-center p-6">
      <div className="w-full max-w-md animate-fade-in">
        <div className="glass-card p-8 text-center space-y-6">
          {/* Icône de succès */}
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto animate-bounce-slow">
            <CheckCircle2 className="w-12 h-12 text-green-400" />
          </div>
          
          {/* Titre */}
          <h1 className="text-3xl font-bold gradient-text">
            Email confirmé !
          </h1>
          
          {/* Message */}
          <div className="space-y-3">
            <p className="text-lg text-white">
              🎉 Votre compte est maintenant activé
            </p>
            <p className="text-white/70">
              Vous pouvez maintenant vous connecter et choisir votre plan (FREE ou PRO)
            </p>
          </div>
          
          {/* Bouton de connexion */}
          <Button
            onClick={handleContinue}
            className="w-full bg-accent hover:bg-accent/90 text-primary font-semibold py-6 text-base"
          >
            Se connecter →
          </Button>
          
          {/* Info supplémentaire */}
          <div className="pt-4 border-t border-white/10">
            <p className="text-sm text-white/50">
              Vous allez être redirigé vers la page de connexion
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailConfirmed;
