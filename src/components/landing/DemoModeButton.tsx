import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Eye, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const DemoModeButton = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleDemoLogin = async () => {
    setLoading(true);
    
    try {
      // Déconnexion d'abord si connecté
      await supabase.auth.signOut();
      
      // Connexion automatique au compte démo
      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'demo@pulse.com',
        password: 'DemoPulse2024!',
      });

      if (error) {
        console.error('Demo login error:', error);
        toast.error('Erreur lors du chargement de la démo');
        setLoading(false);
        return;
      }

      toast.success('Mode démo activé ! Explorez librement 🚀');
      
      // Redirection vers le dashboard
      navigate('/dashboard');
    } catch (error) {
      console.error('Demo error:', error);
      toast.error('Impossible de charger la démo');
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleDemoLogin}
      disabled={loading}
      variant="outline"
      className="border-2 border-accent/50 text-accent hover:bg-accent/10 hover:border-accent font-semibold px-6"
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Chargement...
        </>
      ) : (
        <>
          <Eye className="mr-2 h-4 w-4" />
          Voir une démo
        </>
      )}
    </Button>
  );
};
