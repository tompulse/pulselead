import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  ArrowLeft, 
  Calendar, 
  MapPin, 
  Navigation, 
  Clock, 
  Compass,
  ExternalLink,
  CheckCircle2
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { TourneeMap } from './TourneeMap';

interface Tournee {
  id: string;
  nom: string;
  date_planifiee: string;
  entreprises_ids: string[];
  ordre_optimise: string[];
  distance_totale_km: number | null;
  temps_estime_minutes: number | null;
  statut: string;
  point_depart_lat: number | null;
  point_depart_lng: number | null;
}

interface TourneeDetailViewProps {
  tournee: Tournee;
  onBack: () => void;
}

export const TourneeDetailView = ({ tournee, onBack }: TourneeDetailViewProps) => {
  // Fetch sites data from ordre_optimise
  const { data: sites = [], isLoading } = useQuery({
    queryKey: ['tournee-sites', tournee.id, tournee.ordre_optimise],
    queryFn: async () => {
      if (!tournee.ordre_optimise || tournee.ordre_optimise.length === 0) {
        return [];
      }

      const { data, error } = await supabase
        .from('nouveaux_sites')
        .select('id, nom, adresse, ville, code_postal, latitude, longitude, numero_voie, type_voie, libelle_voie')
        .in('id', tournee.ordre_optimise);

      if (error) {
        console.error('[TourneeDetailView] Error fetching sites:', error);
        throw error;
      }

      // Réordonner selon ordre_optimise
      const orderedSites = tournee.ordre_optimise
        .map(id => data?.find(s => s.id === id))
        .filter(Boolean);

      return orderedSites;
    },
    enabled: !!tournee.ordre_optimise && tournee.ordre_optimise.length > 0
  });

  const formatDuration = (minutes: number | null) => {
    if (!minutes) return '0h00';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h${mins.toString().padStart(2, '0')}`;
  };

  const getFullAddress = (site: any) => {
    const parts = [site.numero_voie, site.type_voie, site.libelle_voie].filter(Boolean).join(' ');
    if (parts) {
      return `${parts}, ${site.code_postal || ''} ${site.ville || ''}`.trim();
    }
    return site.adresse || `${site.code_postal || ''} ${site.ville || ''}`.trim();
  };

  const openInGoogleMaps = () => {
    if (sites.length === 0) return;

    // Construire l'URL Google Maps avec les waypoints
    const validSites = sites.filter((s: any) => s.latitude && s.longitude);
    if (validSites.length === 0) return;

    const origin = `${validSites[0].latitude},${validSites[0].longitude}`;
    const destination = validSites.length > 1 
      ? `${validSites[validSites.length - 1].latitude},${validSites[validSites.length - 1].longitude}`
      : origin;
    
    const waypoints = validSites.length > 2
      ? validSites.slice(1, -1).map((s: any) => `${s.latitude},${s.longitude}`).join('|')
      : '';

    let url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}`;
    if (waypoints) {
      url += `&waypoints=${waypoints}`;
    }
    url += '&travelmode=driving';

    window.open(url, '_blank');
  };

  const entreprisesForMap = sites.map((site: any) => ({
    id: site.id,
    nom: site.nom,
    adresse: getFullAddress(site),
    ville: site.ville,
    latitude: site.latitude,
    longitude: site.longitude
  }));

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-accent/20 flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h2 className="font-bold text-lg">{tournee.nom}</h2>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            {format(new Date(tournee.date_planifiee), 'EEEE d MMMM yyyy', { locale: fr })}
          </div>
        </div>
        <Badge variant="outline" className="border-accent/50 text-accent">
          {tournee.statut === 'planifiee' ? 'Planifiée' : tournee.statut}
        </Badge>
      </div>

      {/* KPIs */}
      <div className="p-4 grid grid-cols-3 gap-3">
        <div className="p-3 rounded-xl bg-accent/10 border border-accent/20 text-center">
          <MapPin className="w-5 h-5 text-accent mx-auto mb-1" />
          <div className="font-bold text-xl">{sites.length}</div>
          <div className="text-xs text-muted-foreground">Arrêts</div>
        </div>
        <div className="p-3 rounded-xl bg-gradient-to-r from-accent/20 to-accent/10 border border-accent/30 text-center">
          <Navigation className="w-5 h-5 text-accent mx-auto mb-1" />
          <div className="font-bold text-xl">{tournee.distance_totale_km?.toFixed(0) || '—'}</div>
          <div className="text-xs text-muted-foreground">km</div>
        </div>
        <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-center">
          <Clock className="w-5 h-5 text-purple-400 mx-auto mb-1" />
          <div className="font-bold text-xl">{formatDuration(tournee.temps_estime_minutes)}</div>
          <div className="text-xs text-muted-foreground">durée</div>
        </div>
      </div>

      {/* Content: Map + List */}
      <div className="flex-1 flex flex-col lg:flex-row gap-4 p-4 overflow-hidden">
        {/* Map */}
        <div className="flex-1 min-h-[300px] lg:min-h-0 rounded-xl overflow-hidden border border-accent/20">
          {isLoading ? (
            <div className="h-full flex items-center justify-center bg-card">
              <div className="animate-spin w-8 h-8 border-4 border-accent border-t-transparent rounded-full" />
            </div>
          ) : entreprisesForMap.length > 0 ? (
            <TourneeMap 
              entreprises={entreprisesForMap}
              pointDepartLat={tournee.point_depart_lat || undefined}
              pointDepartLng={tournee.point_depart_lng || undefined}
            />
          ) : (
            <div className="h-full flex items-center justify-center bg-card text-muted-foreground">
              Aucun site avec coordonnées GPS
            </div>
          )}
        </div>

        {/* Sites list */}
        <Card className="lg:w-80 glass-card border-accent/20">
          <CardContent className="p-4 h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Itinéraire optimisé</h3>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={openInGoogleMaps}
                className="border-accent/30 hover:bg-accent/10"
              >
                <Compass className="w-4 h-4 mr-1" />
                GPS
              </Button>
            </div>

            <ScrollArea className="flex-1">
              <div className="space-y-2">
                {isLoading ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Chargement...
                  </div>
                ) : sites.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Aucun site
                  </div>
                ) : (
                  sites.map((site: any, index: number) => (
                    <div 
                      key={site.id}
                      className="flex items-start gap-3 p-3 rounded-lg bg-card/50 border border-accent/10 hover:border-accent/30 transition-colors"
                    >
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                        index === sites.length - 1 
                          ? 'bg-green-500 text-white' 
                          : 'bg-accent text-primary'
                      }`}>
                        {index === sites.length - 1 ? '🏁' : index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">{site.nom}</div>
                        <div className="text-xs text-muted-foreground truncate">
                          {getFullAddress(site)}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
