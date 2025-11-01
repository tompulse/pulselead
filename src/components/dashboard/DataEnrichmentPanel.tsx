import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { MapPin, FileSearch, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const DataEnrichmentPanel = () => {
  const [geocoding, setGeocoding] = useState(false);
  const [enriching, setEnriching] = useState(false);
  const { toast } = useToast();

  const handleGeocode = async (table: 'entreprises' | 'nouveaux_sites') => {
    setGeocoding(true);
    try {
      const { data, error } = await supabase.functions.invoke('batch-geocode', {
        body: { table }
      });

      if (error) throw error;

      toast({
        title: "Géocodage terminé",
        description: data.message,
      });
    } catch (error) {
      console.error('Geocoding error:', error);
      toast({
        title: "Erreur",
        description: "Erreur lors du géocodage",
        variant: "destructive",
      });
    } finally {
      setGeocoding(false);
    }
  };

  const handleEnrichNaf = async (table: 'entreprises' | 'nouveaux_sites') => {
    setEnriching(true);
    try {
      const { data, error } = await supabase.functions.invoke('enrich-naf-codes', {
        body: { table }
      });

      if (error) throw error;

      toast({
        title: "Enrichissement terminé",
        description: data.message,
      });
    } catch (error) {
      console.error('Enrichment error:', error);
      toast({
        title: "Erreur",
        description: "Erreur lors de l'enrichissement",
        variant: "destructive",
      });
    } finally {
      setEnriching(false);
    }
  };

  return (
    <div className="space-y-4 p-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Géocodage automatique
          </CardTitle>
          <CardDescription>
            Ajouter les coordonnées GPS aux entreprises via leurs adresses
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            onClick={() => handleGeocode('entreprises')}
            disabled={geocoding}
            className="w-full"
          >
            {geocoding ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Géocodage en cours...
              </>
            ) : (
              'Géocoder les Créations'
            )}
          </Button>
          <Button
            onClick={() => handleGeocode('nouveaux_sites')}
            disabled={geocoding}
            variant="outline"
            className="w-full"
          >
            {geocoding ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Géocodage en cours...
              </>
            ) : (
              'Géocoder les Nouveaux Sites'
            )}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSearch className="h-5 w-5" />
            Enrichissement codes NAF
          </CardTitle>
          <CardDescription>
            Récupérer les codes NAF via l'API Sirene (INSEE)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            onClick={() => handleEnrichNaf('entreprises')}
            disabled={enriching}
            className="w-full"
          >
            {enriching ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enrichissement en cours...
              </>
            ) : (
              'Enrichir les Créations'
            )}
          </Button>
          <Button
            onClick={() => handleEnrichNaf('nouveaux_sites')}
            disabled={enriching}
            variant="outline"
            className="w-full"
          >
            {enriching ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enrichissement en cours...
              </>
            ) : (
              'Enrichir les Nouveaux Sites'
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
