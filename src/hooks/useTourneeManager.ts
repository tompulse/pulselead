import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useTourneeManager = (userId: string) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [selectedEntreprises, setSelectedEntreprises] = useState<any[]>([]);
  const [isOptimizing, setIsOptimizing] = useState(false);

  // Fetch tournees
  const { data: tournees = [], isLoading } = useQuery({
    queryKey: ['tournees', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tournees')
        .select('*')
        .eq('user_id', userId)
        .order('date_planifiee', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!userId
  });

  // Create tournee mutation
  const createTourneeMutation = useMutation({
    mutationFn: async ({ nom, date, entreprises }: { nom: string; date: string; entreprises: any[] }) => {
      toast({
        title: "Préparation de la tournée...",
        description: "Géocodage des adresses en cours...",
      });

      const entreprisesToGeocode = entreprises.filter(e => !e.latitude || !e.longitude);
      
      if (entreprisesToGeocode.length > 0) {
        for (const entreprise of entreprisesToGeocode) {
          try {
            const { data: geoData, error: geoError } = await supabase.functions.invoke('geocode-entreprise', {
              body: {
                adresse: entreprise.adresse,
                ville: entreprise.ville,
                code_postal: entreprise.code_postal
              }
            });

            if (geoError || !geoData?.latitude || !geoData?.longitude) {
              console.warn(`Géocodage échoué pour ${entreprise.nom}`);
              continue;
            }

            // Mettre à jour les coordonnées dans la DB (nouveaux_sites)
            await supabase
              .from('nouveaux_sites')
              .update({
                latitude: geoData.latitude,
                longitude: geoData.longitude
              })
              .eq('id', entreprise.id);

            entreprise.latitude = geoData.latitude;
            entreprise.longitude = geoData.longitude;
          } catch (error) {
            console.error(`Erreur géocodage ${entreprise.nom}:`, error);
          }
        }
      }

      const entreprisesWithCoords = entreprises.filter(e => e.latitude && e.longitude);
      
      if (entreprisesWithCoords.length === 0) {
        throw new Error("Aucune entreprise n'a de coordonnées GPS valides");
      }

      toast({
        title: "Calcul de l'itinéraire...",
        description: "Optimisation du parcours en cours...",
      });

      const waypoints = entreprisesWithCoords.map(e => ({
        lat: typeof e.latitude === 'string' ? parseFloat(e.latitude) : e.latitude,
        lng: typeof e.longitude === 'string' ? parseFloat(e.longitude) : e.longitude,
      }));

      const { data: routeData, error: routeError } = await supabase.functions.invoke('calculate-routes', {
        body: {
          waypoints,
          startPoint: null
        }
      });

      if (routeError) throw routeError;

      const { data, error } = await supabase
        .from('tournees')
        .insert({
          user_id: userId,
          nom,
          date_planifiee: date,
          entreprises_ids: entreprisesWithCoords.map(e => e.id),
          ordre_optimise: entreprisesWithCoords.map(e => e.id),
          statut: 'planifiee',
          distance_totale_km: routeData?.withTolls?.distance_km ? parseFloat(routeData.withTolls.distance_km) : null,
          temps_estime_minutes: routeData?.withTolls?.duration_minutes || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tournees', userId] });
      toast({
        title: "✅ Tournée créée",
        description: "Votre tournée est prête et optimisée",
        duration: 3000,
      });
      setSelectedEntreprises([]);
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de créer la tournée",
        variant: "destructive"
      });
    }
  });

  // Optimize tournee
  const optimizeTournee = async (entreprises: any[], userLat: number, userLng: number) => {
    setIsOptimizing(true);
    try {
      const entreprisesToGeocode = entreprises.filter(e => !e.latitude || !e.longitude);
      
      if (entreprisesToGeocode.length > 0) {
        toast({
          title: "Géocodage en cours...",
          description: `Recherche des coordonnées GPS pour ${entreprisesToGeocode.length} entreprise(s)...`
        });

        for (const entreprise of entreprisesToGeocode) {
          try {
            const { data: geoData, error: geoError } = await supabase.functions.invoke('geocode-entreprise', {
              body: {
                adresse: entreprise.adresse,
                ville: entreprise.ville,
                code_postal: entreprise.code_postal
              }
            });

            if (geoError || !geoData?.latitude || !geoData?.longitude) {
              console.warn(`Géocodage échoué pour ${entreprise.nom}:`, geoError);
              continue;
            }

            const { error: updateError } = await supabase
              .from('nouveaux_sites')
              .update({
                latitude: geoData.latitude,
                longitude: geoData.longitude
              })
              .eq('id', entreprise.id);

            if (updateError) {
              console.error(`Erreur mise à jour coordonnées pour ${entreprise.nom}:`, updateError);
            } else {
              entreprise.latitude = geoData.latitude;
              entreprise.longitude = geoData.longitude;
              console.log(`✅ Coordonnées sauvegardées pour ${entreprise.nom}`);
            }
          } catch (error) {
            console.error(`Erreur géocodage ${entreprise.nom}:`, error);
          }
        }
      }

      const entreprisesWithCoords = entreprises.filter(e => e.latitude && e.longitude);
      
      if (entreprisesWithCoords.length === 0) {
        toast({
          title: "Impossible d'optimiser",
          description: "Aucune entreprise n'a de coordonnées GPS valides",
          variant: "destructive"
        });
        return null;
      }

      if (entreprisesWithCoords.length < entreprises.length) {
        toast({
          title: "Géocodage partiel",
          description: `${entreprises.length - entreprisesWithCoords.length} entreprise(s) sans coordonnées valides seront exclues`,
          variant: "default"
        });
      }

      const { data, error } = await supabase.functions.invoke('optimize-tournee', {
        body: {
          entreprises: entreprisesWithCoords.map(e => ({
            id: e.id,
            nom: e.nom,
            latitude: typeof e.latitude === 'string' ? parseFloat(e.latitude) : e.latitude,
            longitude: typeof e.longitude === 'string' ? parseFloat(e.longitude) : e.longitude,
            adresse: e.adresse
          })),
          point_depart: { lat: userLat, lng: userLng }
        }
      });

      if (error) throw error;
      
      return {
        optimizedOrder: data.ordre_optimise || [],
        distance: data.distance_totale_km || 0,
        time: data.temps_estime_minutes || 0
      };
    } catch (error) {
      console.error('Optimization error:', error);
      toast({
        title: "Erreur d'optimisation",
        description: "Impossible d'optimiser la tournée",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsOptimizing(false);
    }
  };

  // Delete tournee mutation
  const deleteTourneeMutation = useMutation({
    mutationFn: async (tourneeId: string) => {
      const { error } = await supabase
        .from('tournees')
        .delete()
        .eq('id', tourneeId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tournees', userId] });
      toast({
        title: "Tournée supprimée",
        description: "La tournée a été supprimée"
      });
    }
  });

  const toggleEntreprise = (entreprise: any) => {
    setSelectedEntreprises(prev => {
      const exists = prev.find(e => e.id === entreprise.id);
      if (exists) {
        return prev.filter(e => e.id !== entreprise.id);
      }
      return [...prev, entreprise];
    });
  };

  const isSelected = (id: string) => {
    return selectedEntreprises.some(e => e.id === id);
  };

  return {
    tournees,
    isLoading,
    selectedEntreprises,
    isOptimizing,
    toggleEntreprise,
    isSelected,
    clearSelection: () => setSelectedEntreprises([]),
    createTournee: createTourneeMutation.mutate,
    optimizeTournee,
    deleteTournee: deleteTourneeMutation.mutate,
    isCreating: createTourneeMutation.isPending
  };
};