import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, LogOut } from "lucide-react";
import { z } from "zod";

type AuthMode = 'login' | 'signup' | 'forgot' | 'reset';

const Auth = () => {
  const [searchParams] = useSearchParams();
  
  // Check for reset mode from URL params OR hash fragment (Supabase recovery links)
  const getInitialMode = (): AuthMode => {
    // Check URL params first
    const modeParam = searchParams.get('mode');
    if (modeParam === 'reset') return 'reset';
    if (modeParam === 'login') return 'login';
    
    // Check hash fragment for recovery token (Supabase uses #access_token=...&type=recovery)
    const hash = window.location.hash;
    if (hash.includes('type=recovery') || hash.includes('type=magiclink')) {
      return 'reset';
    }
    
    return 'signup';
  };
  
  const initialMode = getInitialMode();
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [isRecoveryHandled, setIsRecoveryHandled] = useState(false);
  const [hasExistingSession, setHasExistingSession] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Vérifier s'il y a une session existante (pour afficher le bouton déconnexion)
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setHasExistingSession(!!session);
    });
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setHasExistingSession(false);
    toast({
      title: "✌️ À bientôt !",
      description: "Vous êtes déconnecté. Revenez vite !",
    });
  };

  const isLogin = mode === 'login';
  const isForgot = mode === 'forgot';
  const isReset = mode === 'reset';

  // Schema simplifié pour tous les comptes : email + password uniquement
  const loginSchema = z.object({
    email: z.string().trim().email('Email invalide').max(255, 'Email trop long'),
    password: z.string().min(6, 'Minimum 6 caractères requis')
  });

  const signupSchema = z.object({
    email: z.string().trim().email('Email invalide').max(255, 'Email trop long'),
    password: z.string()
      .min(8, 'Minimum 8 caractères requis')
      .regex(/[A-Z]/, 'Doit contenir au moins une majuscule')
      .regex(/[0-9]/, 'Doit contenir au moins un chiffre')
  });

  // Get redirect destination from URL params
  const redirectTo = searchParams.get('redirect');
  const getRedirectPath = () => {
    // 'checkout' triggers Stripe checkout after login
    if (redirectTo === 'checkout') return '/?checkout=pending';
    // 'dashboard' goes to dashboard check (will verify access there)
    if (redirectTo === 'dashboard') return '/dashboard';
    // Simple connexion → retour à la landing (pas dashboard pour éviter boucle)
    return '/';
  };

  useEffect(() => {
    // Listen for auth changes FIRST - this is critical for PASSWORD_RECOVERY
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth event:', event, 'Session:', !!session, 'isRecoveryHandled:', isRecoveryHandled);
      
      // Handle password recovery event - show reset form
      if (event === 'PASSWORD_RECOVERY') {
        console.log('PASSWORD_RECOVERY event detected, showing reset form');
        setMode('reset');
        setIsRecoveryHandled(true);
        // Clean URL without losing the session
        window.history.replaceState(null, '', window.location.pathname + '?mode=reset');
        return; // Don't redirect, let user set new password
      }
      
      // CRITICAL: Never redirect if we're in reset mode or handling recovery
      if (isRecoveryHandled || mode === 'reset') {
        console.log('In reset mode, not redirecting');
        return;
      }
      
      // 🔥 NE PAS REDIRIGER AUTOMATIQUEMENT
      // Sinon quand l'utilisateur confirme son email dans un autre onglet,
      // cette page (qui reste ouverte) détecte SIGNED_IN et redirige automatiquement
      // vers dashboard en créant un plan FREE
      console.log('[AUTH EVENT] Ignoring automatic redirect - user must login manually');
    });

    return () => subscription.unsubscribe();
  }, [navigate, mode, isRecoveryHandled]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate password
    const passwordSchema = z.string()
      .min(8, 'Minimum 8 caractères requis')
      .regex(/[A-Z]/, 'Doit contenir au moins une majuscule')
      .regex(/[0-9]/, 'Doit contenir au moins un chiffre');

    const validation = passwordSchema.safeParse(password);
    if (!validation.success) {
      toast({
        variant: "destructive",
        title: "🔐 Mot de passe trop faible",
        description: validation.error.errors[0].message,
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "❌ Oups !",
        description: "Les deux mots de passe ne correspondent pas",
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({ password });

      if (error) throw error;

      toast({
        title: "🎉 Mot de passe modifié !",
        description: "C'est bon ! Connectez-vous avec votre nouveau mot de passe",
      });
      
      // Sign out and redirect to login
      await supabase.auth.signOut();
      setMode('login');
      setPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      toast({
        title: "❌ Oups !",
        description: error.message || "Quelque chose s'est mal passé... Réessayez !",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const emailValidation = z.string().email('Email invalide').safeParse(email);
    if (!emailValidation.success) {
      toast({
        variant: "destructive",
        title: "📧 Email invalide",
        description: "Entrez une adresse email valide pour continuer",
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth?mode=reset`,
      });

      if (error) throw error;

      setResetSent(true);
      toast({
        title: "📧 Email envoyé !",
        description: "Vérifiez votre boîte mail pour réinitialiser votre mot de passe",
      });
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

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isReset) {
      return handleResetPassword(e);
    }

    if (isForgot) {
      return handleForgotPassword(e);
    }
    
    // Validation simple : email + password pour login et signup
    const schema = isLogin ? loginSchema : signupSchema;
    const data = { email, password };
    
    const validation = schema.safeParse(data);
    
    if (!validation.success) {
      const errors = validation.error.errors.map(e => e.message).join(', ');
      toast({
        variant: "destructive",
        title: "⚠️ Informations incorrectes",
        description: errors,
      });
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        console.log("[AUTH] Attempting login for:", email);
        
        const { data: { session }, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          console.error("[AUTH] Login error:", error);
          throw error;
        }

        if (!session) {
          console.error("[AUTH] No session created");
          throw new Error("Session non créée");
        }

        console.log("[AUTH] Login successful, user:", session.user.id);

        // 🔥 Vérifier si l'utilisateur a déjà un plan réellement activé
        const { data: quotas, error: quotasError } = await supabase
          .from('user_quotas')
          .select('plan_type, is_first_login')
          .eq('user_id', session.user.id)
          .single();

        console.log('[AUTH LOGIN] Quotas check:', quotas, 'Error:', quotasError);

        // Si AUCUN quotas (nouvel utilisateur) → onboarding
        if (!quotas || quotasError) {
          console.log('[AUTH LOGIN] Nouvel utilisateur, redirection vers /onboarding');
          toast({
            title: "✨ Bienvenue !",
            description: "Choisissez votre plan pour commencer",
          });
          navigate('/onboarding');
          return;
        }

        // Si plan existe ET is_first_login = false (vraiment actif) → dashboard
        if (quotas.is_first_login === false && quotas.plan_type) {
          console.log('[AUTH LOGIN] Plan actif trouvé, redirection vers /dashboard');
          toast({
            title: "🎉 Content de te revoir !",
            description: "Bienvenue sur PULSE !",
          });
          navigate('/dashboard');
          return;
        }

        // Sinon (plan existe mais pas encore activé) → onboarding
        console.log('[AUTH LOGIN] Plan non finalisé, redirection vers /onboarding');
        toast({
          title: "✨ Bienvenue !",
          description: "Choisissez votre plan pour commencer",
        });
        navigate('/onboarding');
      } else {
        // Signup
        console.log("[AUTH] Attempting signup for:", email);
        
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            // Redirect vers /auth après validation de l'email
            emailRedirectTo: `${window.location.origin}/auth`,
          },
        });

        if (error) {
          console.error("[AUTH] Signup error:", error);
          throw error;
        }

        console.log("[AUTH] Signup successful", data);

        toast({
          title: "📧 Vérifiez votre boîte mail !",
          description: "Confirmez votre email puis reconnectez-vous pour commencer !",
          duration: 8000,
        });
        
        // Switch to login mode after signup
        setMode('login');
        setPassword('');
      }
    } catch (error: any) {
      console.error("[AUTH] Error:", error);
      toast({
        title: "❌ Erreur de connexion",
        description: error.message || "Impossible de se connecter. Réessayez dans quelques secondes !",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getTitle = () => {
    if (isReset) return "Créez votre nouveau mot de passe";
    if (isForgot) return "Réinitialisez votre mot de passe";
    if (isLogin) return "Connectez-vous à votre compte";
    return "Créez votre compte";
  };

  const getButtonText = () => {
    if (isReset) return "Enregistrer le mot de passe";
    if (isForgot) return "Envoyer le lien";
    if (isLogin) return "Se connecter";
    return "S'inscrire";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-navy-deep to-black-deep flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold gradient-text mb-4">PULSE</h1>
          <p className="text-muted-foreground text-base">
            {getTitle()}
          </p>
        </div>

        {/* Auth Form */}
        <div className="glass-card p-8 space-y-6 animate-slide-up">
          {isForgot && resetSent ? (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto">
                <span className="text-3xl">📧</span>
              </div>
              <h3 className="text-lg font-semibold text-foreground">Email envoyé !</h3>
              <p className="text-muted-foreground text-sm">
                Vérifiez votre boîte mail et cliquez sur le lien pour réinitialiser votre mot de passe.
              </p>
              <Button
                onClick={() => { setMode('login'); setResetSent(false); }}
                className="w-full bg-accent hover:bg-accent/90 text-primary font-semibold"
              >
                Retour à la connexion
              </Button>
            </div>
          ) : isReset ? (
            <form onSubmit={handleAuth} className="space-y-4">
              <div className="text-center mb-4">
                <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🔐</span>
                </div>
                <p className="text-muted-foreground text-sm">
                  Choisissez un nouveau mot de passe sécurisé
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Nouveau mot de passe</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-background/50 border-border focus:border-accent"
                  disabled={loading}
                />
                <p className="text-xs text-muted-foreground">
                  Min. 8 caractères, 1 majuscule, 1 chiffre
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="bg-background/50 border-border focus:border-accent"
                  disabled={loading}
                />
              </div>

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
                  getButtonText()
                )}
              </Button>
            </form>
          ) : (
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

              {!isForgot && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Mot de passe</Label>
                    {isLogin && (
                      <button
                        type="button"
                        onClick={() => setMode('forgot')}
                        className="text-xs text-accent hover:underline"
                      >
                        Mot de passe oublié ?
                      </button>
                    )}
                  </div>
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
              )}

              {!isLogin && !isForgot && (
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
                  getButtonText()
                )}
              </Button>
            </form>
          )}

          {!resetSent && (
            <div className="text-center space-y-2">
              {isForgot ? (
                <button
                  onClick={() => setMode('login')}
                  className="text-sm text-muted-foreground hover:text-accent transition-colors"
                  disabled={loading}
                >
                  ← Retour à la connexion
                </button>
              ) : (
                <button
                  onClick={() => setMode(isLogin ? 'signup' : 'login')}
                  className="text-sm text-muted-foreground hover:text-accent transition-colors"
                  disabled={loading}
                >
                  {isLogin
                    ? "Pas encore de compte ? S'inscrire"
                    : "Déjà un compte ? Se connecter"}
                </button>
              )}
            </div>
          )}
        </div>

        <div className="text-center mt-6 flex flex-col gap-2">
          {hasExistingSession && (
            <Button
              variant="outline"
              onClick={handleLogout}
              className="text-red-400 border-red-400/30 hover:bg-red-500/10 hover:text-red-300"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Se déconnecter
            </Button>
          )}
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
