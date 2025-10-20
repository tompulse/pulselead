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
        duration: 2500,
      });

      // Recharger la page pour afficher les nouvelles données
      setTimeout(() => window.location.reload(), 1000);
    } catch (error) {
      console.error("Erreur de synchronisation:", error);
      toast({
        title: "❌ Erreur de synchronisation",
        description: error instanceof Error ? error.message : "Erreur inconnue",
        variant: "destructive",
        duration: 3000,
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
      size="sm"
      className="h-7 px-2 text-xs border-accent/50 hover:bg-accent/10"
    >
      <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
      <span className="hidden lg:inline ml-1">{loading ? "Sync..." : "Sync"}</span>
    </Button>
  );
};
