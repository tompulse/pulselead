import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // 🚀 OPTIMISATION : Vérification ULTRA-RAPIDE (session uniquement)
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      setIsAuthenticated(!!session);
      setLoading(false);
    };

    checkAuth();

    // 🔥 SIMPLIFICATION : onAuthStateChange uniquement pour logout
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-accent">PULSE</h1>
          <p className="text-muted-foreground text-base">Connexion...</p>
        </div>
      </div>
    );
  }

  // Pas connecté → /auth
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  // ✅ Connecté → Laisser passer ! Le Dashboard gérera les vérifications de quotas/plan
  return <>{children}</>;
};
