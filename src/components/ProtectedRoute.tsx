import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasValidSubscription, setHasValidSubscription] = useState(false);
  const [userId, setUserId] = useState<string>('');
  const [userEmail, setUserEmail] = useState<string>('');

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }

      setIsAuthenticated(true);
      setUserId(session.user.id);
      setUserEmail(session.user.email || '');

      // 🔥 BYPASS ADMIN : tomiolovpro@gmail.com
      if (session.user.email === 'tomiolovpro@gmail.com') {
        console.log('[PROTECTED ROUTE] ✅ Admin bypass detected');
        setHasValidSubscription(true); // Force l'accès
        setLoading(false);
        return;
      }

      // 🔥 VÉRIFICATION ABONNEMENT : Bloquer l'accès si pas de plan actif
      try {
        const { data: quotas, error } = await supabase
          .from('user_quotas')
          .select('plan_type, is_first_login')
          .eq('user_id', session.user.id)
          .single();

        console.log('[PROTECTED ROUTE] Quotas check:', quotas, error);

        // Vérifier qu'il y a un plan ET que is_first_login = false
        const isValid = quotas && 
                       !error && 
                       quotas.plan_type && 
                       quotas.is_first_login === false;

        setHasValidSubscription(isValid);
      } catch (error) {
        console.error('[PROTECTED ROUTE] Error checking subscription:', error);
        setHasValidSubscription(false);
      }

      setLoading(false);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!session) {
        setIsAuthenticated(false);
        setHasValidSubscription(false);
        setLoading(false);
        return;
      }

      setIsAuthenticated(true);
      setUserId(session.user.id);
      setUserEmail(session.user.email || '');

      // 🔥 BYPASS ADMIN : tomiolovpro@gmail.com
      if (session.user.email === 'tomiolovpro@gmail.com') {
        console.log('[PROTECTED ROUTE] ✅ Admin bypass on auth change');
        setHasValidSubscription(true);
        setLoading(false);
        return;
      }

      // Re-check subscription on auth change
      try {
        const { data: quotas, error } = await supabase
          .from('user_quotas')
          .select('plan_type, is_first_login')
          .eq('user_id', session.user.id)
          .single();

        const isValid = quotas && 
                       !error && 
                       quotas.plan_type && 
                       quotas.is_first_login === false;

        setHasValidSubscription(isValid);
      } catch (error) {
        setHasValidSubscription(false);
      }

      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-accent">PULSE</h1>
          <p className="text-muted-foreground text-base">Vérification...</p>
        </div>
      </div>
    );
  }

  // Pas connecté → /auth
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  // Connecté mais pas d'abonnement → Stripe
  if (!hasValidSubscription) {
    console.log('[PROTECTED ROUTE] No valid subscription, redirecting to Stripe');
    const paymentUrl = `${import.meta.env.VITE_STRIPE_PAYMENT_LINK_PRO || 'https://buy.stripe.com/00w6oH0PRckQ6IHcro2ZO00'}?client_reference_id=${userId}&prefilled_email=${encodeURIComponent(userEmail)}`;
    window.location.href = paymentUrl;
    
    // Afficher un loader pendant la redirection
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-accent">PULSE</h1>
          <p className="text-muted-foreground text-base">Redirection vers le paiement...</p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto"></div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
