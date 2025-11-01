import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { MapPin, FileSearch, Loader2, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const DataEnrichmentPanel = () => {
  const [geocoding, setGeocoding] = useState(false);
  const [enriching, setEnriching] = useState(false);
  const [harmonizing, setHarmonizing] = useState(false);
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

  const handleHarmonize = async () => {
    setHarmonizing(true);
    try {
      const { data, error } = await supabase.functions.invoke('harmonize-categories');
      
      if (error) throw error;

      toast({
        title: "✅ Harmonisation réussie",
        description: data.message,
      });
    } catch (error) {
      console.error('Error harmonizing:', error);
      toast({
        title: "❌ Erreur",
        description: "Échec de l'harmonisation des catégories",
        variant: "destructive",
      });
    } finally {
      setHarmonizing(false);
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

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Harmonisation des catégories
          </CardTitle>
          <CardDescription>
            Uniformise les catégories d'activité entre Créations et Nouveaux Sites
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Cette opération va :
            </p>
            <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
              <li>Mapper les codes NAF des "Nouveaux Sites" vers des catégories standards</li>
              <li>Harmoniser les catégories qualifiées des "Créations" avec les mêmes standards</li>
              <li>Permettre des filtres cohérents entre les deux tables</li>
            </ul>
            <Button
              onClick={handleHarmonize}
              disabled={harmonizing}
              className="w-full"
            >
              {harmonizing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Harmonisation en cours...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Harmoniser toutes les catégories
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
