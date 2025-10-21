import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Lightbulb, Loader2 } from "lucide-react";
import { z } from "zod";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const loginSchema = z.object({
    email: z.string().trim().email('Email invalide').max(255, 'Email trop long'),
    password: z.string()
      .min(8, 'Minimum 8 caractères requis')
      .regex(/[A-Z]/, 'Doit contenir au moins une majuscule')
      .regex(/[0-9]/, 'Doit contenir au moins un chiffre')
  });

  const signupSchema = loginSchema.extend({
    phone: z.string()
      .trim()
      .regex(/^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/, 'Numéro de téléphone français invalide')
      .transform(val => val.replace(/[\s.-]/g, ''))
  });

  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/dashboard");
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        navigate("/dashboard");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate input
    const schema = isLogin ? loginSchema : signupSchema;
    const data = isLogin ? { email, password } : { email, password, phone };
    const validation = schema.safeParse(data);
    
    if (!validation.success) {
      const errors = validation.error.errors.map(e => e.message).join(', ');
      toast({
        variant: "destructive",
        title: "Erreur de validation",
        description: errors,
      });
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        toast({
          title: "Connexion réussie",
          description: "Bienvenue sur LUMA !",
        });
      } else {
        const validatedData = validation.data as { email: string; password: string; phone: string };
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
            data: {
              phone: validatedData.phone,
            }
          },
        });

        if (error) throw error;

        toast({
          title: "✉️ Vérifiez votre email",
          description: "Un lien de confirmation a été envoyé à votre adresse email",
        });
        setEmail('');
        setPassword('');
        setPhone('');
      }
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-navy-deep to-black-deep flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-accent/30 blur-xl"></div>
              <Lightbulb className="w-10 h-10 text-accent relative" />
            </div>
            <span className="text-3xl font-bold gradient-text">LUMA</span>
          </div>
          <p className="text-muted-foreground text-base">
            {isLogin ? "Connectez-vous à votre compte" : "Créez votre compte"}
          </p>
        </div>

        {/* Auth Form */}
        <div className="glass-card p-8 space-y-6 animate-slide-up">
          <form onSubmit={handleAuth} className="space-y-4">
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
              />
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
              />
            </div>

            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="phone">Téléphone *</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="06 12 34 56 78"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="bg-background/50 border-border focus:border-accent"
                  disabled={loading}
                  required
                />
                <p className="text-xs text-muted-foreground">Format: 06 12 34 56 78 ou +33 6 12 34 56 78</p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-accent hover:bg-accent/90 text-primary font-semibold"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Chargement...
                </>
              ) : (
                isLogin ? "Se connecter" : "S'inscrire"
              )}
            </Button>
          </form>

          <div className="text-center space-y-2">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-muted-foreground hover:text-accent transition-colors"
              disabled={loading}
            >
              {isLogin
                ? "Pas encore de compte ? S'inscrire"
                : "Déjà un compte ? Se connecter"}
            </button>
          </div>
        </div>

        <div className="text-center mt-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="text-muted-foreground hover:text-foreground"
          >
            ← Retour à l'accueil
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
