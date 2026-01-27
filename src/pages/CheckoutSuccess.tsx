import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle2, Sparkles } from "lucide-react";
import { z } from "zod";

const CheckoutSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [sessionId] = useState(searchParams.get('session_id') || '');
  
  const signupSchema = z.object({
    email: z.string().trim().email('Email invalide'),
    password: z.string()
      .min(8, 'Minimum 8 caractères')
      .regex(/[A-Z]/, 'Au moins une majuscule')
      .regex(/[0-9]/, 'Au moins un chiffre')
  });

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    const validation = signupSchema.safeParse({ email, password });
    if (!validation.success) {
      toast({
        variant: "destructive",
        title: "⚠️ Informations incorrectes",
        description: validation.error.errors.map(e => e.message).join(', '),
      });
      return;
    }

    setLoading(true);

    try {
      console.log('[CHECKOUT SUCCESS] Creating account for:', email);

      // Create Supabase account with auto-confirmation
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            selected_plan: 'pro',
            stripe_session_id: sessionId,
          },
          // Skip email confirmation for Stripe customers (they already paid)
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (error) throw error;

      console.log('[CHECKOUT SUCCESS] Account created, logging in...');

      // Auto-login after signup (since they already paid)
      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (loginError) {
        console.error('[CHECKOUT SUCCESS] Auto-login failed:', loginError);
        toast({
          title: "✅ Compte créé !",
          description: "Plus qu'une étape : connectez-vous pour accéder à votre dashboard PRO !",
        });
        navigate('/auth?mode=login');
        return;
      }

      console.log('[CHECKOUT SUCCESS] Logged in successfully, redirecting to dashboard...');

      toast({
        title: "🚀 Bienvenue sur PULSE PRO !",
        description: "Votre essai gratuit de 7 jours commence maintenant. Let's go !",
        duration: 3000,
      });

      // Redirect to dashboard directly
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);

    } catch (error: any) {
      console.error('[CHECKOUT SUCCESS] Error:', error);
      
      if (error.message?.includes('already registered')) {
        toast({
          title: "👋 Compte déjà existant !",
          description: "Cet email est déjà enregistré. Connectez-vous pour accéder à votre dashboard PRO.",
        });
        setTimeout(() => {
          navigate('/auth?mode=login');
        }, 2000);
      } else {
        toast({
          title: "❌ Oups !",
          description: error.message || "Quelque chose s'est mal passé... Réessayez !",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-navy-deep to-black-deep flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Success Icon */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
            <CheckCircle2 className="w-10 h-10 text-green-500" />
          </div>
          <h1 className="text-3xl font-bold gradient-text mb-2">
            🎉 Paiement réussi !
          </h1>
          <p className="text-muted-foreground text-base">
            Votre essai gratuit de <span className="text-green-500 font-bold">7 jours</span> a commencé
          </p>
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/30">
            <Sparkles className="w-4 h-4 text-green-500" />
            <span className="text-sm text-green-500 font-semibold">
              Plan PRO activé
            </span>
          </div>
        </div>

        {/* Account Creation Form */}
        <div className="glass-card p-8 space-y-6 animate-slide-up">
          <div className="text-center space-y-2 mb-6">
            <h2 className="text-xl font-bold text-foreground">
              Créez votre compte
            </h2>
            <p className="text-muted-foreground text-sm">
              Pour accéder à votre dashboard PRO illimité
            </p>
          </div>

          <form onSubmit={handleCreateAccount} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="contact@exemple.fr"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-background/50 border-border focus:border-accent"
                disabled={loading}
                required
              />
              <p className="text-xs text-muted-foreground">
                Utilisez l'email de votre paiement Stripe
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-background/50 border-border focus:border-accent"
                disabled={loading}
                required
              />
              <p className="text-xs text-muted-foreground">
                Min. 8 caractères, 1 majuscule, 1 chiffre
              </p>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-4"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Création...
                </>
              ) : (
                '🚀 Créer mon compte PRO'
              )}
            </Button>
          </form>

          <div className="text-center space-y-2 pt-4 border-t border-border">
            <p className="text-sm text-muted-foreground">
              Déjà un compte ?
            </p>
            <Button
              variant="ghost"
              onClick={() => navigate('/auth?mode=login')}
              className="text-accent hover:text-accent/80"
              disabled={loading}
            >
              Se connecter
            </Button>
          </div>
        </div>

        {/* Benefits Reminder */}
        <div className="mt-6 p-4 bg-green-500/5 border border-green-500/20 rounded-lg">
          <p className="text-sm text-center text-muted-foreground">
            ✅ Accès illimité · 🗺️ Tournées IA · 📊 CRM complet<br />
            <span className="text-green-500 font-semibold">7 jours gratuits</span> · Annulez à tout moment
          </p>
        </div>
      </div>
    </div>
  );
};

export default CheckoutSuccess;
