import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const SyncButton = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSync = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("sync-entreprises");

      if (error) throw error;

      toast({
        title: "✅ Synchronisation réussie",
        description: `${data?.synced || 0} entreprises synchronisées`,
      });

      // Recharger la page pour afficher les nouvelles données
      setTimeout(() => window.location.reload(), 1000);
    } catch (error) {
      console.error("Erreur de synchronisation:", error);
      toast({
        title: "❌ Erreur de synchronisation",
        description: error instanceof Error ? error.message : "Erreur inconnue",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleSync}
      disabled={loading}
      variant="outline"
      className="gap-2"
    >
      <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
      {loading ? "Synchronisation..." : "Synchroniser les données"}
    </Button>
  );
};
