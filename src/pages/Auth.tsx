import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { z } from "zod";

const Auth = () => {
  const [searchParams] = useSearchParams();
  const defaultMode = searchParams.get('mode') === 'login';
  const [isLogin, setIsLogin] = useState(defaultMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Compte démo sans validation stricte
  const DEMO_EMAIL = 'demo@pulse.com';
  const isDemoAccount = email.toLowerCase() === DEMO_EMAIL;

  const loginSchema = z.object({
    email: z.string().trim().email('Email invalide').max(255, 'Email trop long'),
    password: z.string().min(6, 'Minimum 6 caractères requis')
  });

  const loginSchemaStrict = z.object({
    email: z.string().trim().email('Email invalide').max(255, 'Email trop long'),
    password: z.string()
      .min(8, 'Minimum 8 caractères requis')
      .regex(/[A-Z]/, 'Doit contenir au moins une majuscule')
      .regex(/[0-9]/, 'Doit contenir au moins un chiffre')
  });

  const signupSchema = loginSchemaStrict.extend({
    phone: z.string()
      .trim()
      .regex(/^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/, 'Numéro de téléphone français invalide')
      .transform(val => val.replace(/[\s.-]/g, ''))
  });

  // Schema simplifié pour le compte démo (pas de téléphone requis)
  const demoSignupSchema = z.object({
    email: z.string().trim().email('Email invalide'),
    password: z.string().min(6, 'Minimum 6 caractères requis')
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
    
    // Choisir le schema selon le type de compte
    let schema;
    let data;
    
    if (isLogin) {
      schema = isDemoAccount ? loginSchema : loginSchemaStrict;
      data = { email, password };
    } else {
      schema = isDemoAccount ? demoSignupSchema : signupSchema;
      data = isDemoAccount ? { email, password } : { email, password, phone };
    }
    
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
          description: "Bienvenue sur PULSE !",
        });
      } else {
        // Pour le compte démo, pas de téléphone
        const signupOptions: any = {
          emailRedirectTo: `${window.location.origin}/dashboard`,
        };
        
        if (!isDemoAccount && phone) {
          const validatedData = validation.data as { email: string; password: string; phone?: string };
          signupOptions.data = { phone: validatedData.phone };
        }
        
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: signupOptions,
        });

        if (error) throw error;

        toast({
          title: isDemoAccount ? "Compte démo créé !" : "✉️ Vérifiez votre email",
          description: isDemoAccount 
            ? "Vous pouvez maintenant vous connecter" 
            : "Un lien de confirmation a été envoyé à votre adresse email",
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
          <h1 className="text-3xl font-bold gradient-text mb-4">PULSE</h1>
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

            {!isLogin && !isDemoAccount && (
              <>
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
                
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <input
                      type="checkbox"
                      id="terms"
                      required
                      disabled={loading}
                      className="mt-1 w-4 h-4 rounded border-border bg-background/50 text-accent focus:ring-accent focus:ring-offset-0"
                    />
                    <Label htmlFor="terms" className="text-sm text-muted-foreground font-normal leading-relaxed cursor-pointer">
                      J'accepte les{" "}
                      <a href="/cgu" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
                        Conditions Générales d'Utilisation
                      </a>
                      {" "}et la{" "}
                      <a href="/confidentialite" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
                        Politique de Confidentialité
                      </a>
                    </Label>
                  </div>
                </div>
              </>
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
