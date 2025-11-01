import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ImportDialog } from "./ImportDialog";
import { QualificationProgress } from "./QualificationProgress";

export const SyncButton = () => {
  const [loading, setLoading] = useState(false);
  const [requalifying, setRequalifying] = useState(false);
  const [harmonizing, setHarmonizing] = useState(false);
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

  const handleRequalify = async () => {
    setRequalifying(true);
    try {
      const { data, error } = await supabase.functions.invoke("requalify-miscategorized");

      if (error) throw error;

      toast({
        title: "✅ Re-qualification lancée",
        description: `${data?.requalified || 0} entreprises re-qualifiées sur ${data?.processed || 0}`,
        duration: 3000,
      });

      setTimeout(() => window.location.reload(), 1000);
    } catch (error) {
      console.error("Erreur de re-qualification:", error);
      toast({
        title: "❌ Erreur de re-qualification",
        description: error instanceof Error ? error.message : "Erreur inconnue",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setRequalifying(false);
    }
  };

  const handleHarmonize = async () => {
    setHarmonizing(true);
    try {
      const { data, error } = await supabase.functions.invoke("harmonize-categories");
      if (error) throw error;
      toast({
        title: "✅ Harmonisation terminée",
        description: `${data?.successCount || 0} mises à jour, ${data?.errorCount || 0} erreurs`,
        duration: 3000,
      });
      setTimeout(() => window.location.reload(), 1000);
    } catch (error) {
      console.error("Erreur d'harmonisation:", error);
      toast({
        title: "❌ Erreur d'harmonisation",
        description: error instanceof Error ? error.message : "Erreur inconnue",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setHarmonizing(false);
    }
  };

  return (
    <div className="flex gap-2">
      <ImportDialog />
      <QualificationProgress />
      <Button
        onClick={handleRequalify}
        disabled={requalifying}
        variant="outline"
        size="sm"
        className="h-7 px-2 text-xs border-accent/50 hover:bg-accent/10"
        title="Re-qualifier les entreprises mal catégorisées"
      >
        <RefreshCw className={`w-3.5 h-3.5 ${requalifying ? "animate-spin" : ""}`} />
        <span className="hidden lg:inline ml-1">{requalifying ? "Fix..." : "Fix"}</span>
      </Button>
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
    </div>
  );
};
