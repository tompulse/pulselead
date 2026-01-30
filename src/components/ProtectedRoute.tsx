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

        // Si compte activé (is_first_login = false) → OK
        if (quotas && quotas.plan_type && quotas.is_first_login === false) {
          console.log('[PROTECTED ROUTE] ✅ Account activated, access granted');
          setHasValidSubscription(true);
          localStorage.removeItem('stripe_payment_completed'); // Nettoyer le flag
          setLoading(false);
          return;
        }

        // 🔥 DÉTECTION PAIEMENT RÉCENT : Si flag localStorage présent et récent
        const stripePaymentCompleted = localStorage.getItem('stripe_payment_completed');
        const stripePaymentTime = localStorage.getItem('stripe_payment_time');
        const paymentAge = stripePaymentTime ? Date.now() - parseInt(stripePaymentTime) : Infinity;
        const isRecentPayment = stripePaymentCompleted === 'true' && paymentAge < 120000; // 2 minutes

        if (isRecentPayment) {
          console.log('[PROTECTED ROUTE] 🕒 Recent payment detected, letting Dashboard handle activation...');
          // Laisser passer ! Le Dashboard fera le polling et la gestion de l'activation
          setHasValidSubscription(true);
          setLoading(false);
          return;
        }

        // Pas d'abonnement valide ET pas de paiement récent → Bloquer
        console.log('[PROTECTED ROUTE] ❌ No valid subscription and no recent payment');
        setHasValidSubscription(false);
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

  // 🔥 LAISSER PASSER ! Le Dashboard gérera la redirection vers Stripe si besoin
  // Ne PAS bloquer ici pour éviter les boucles de redirection
  return <>{children}</>;
};
