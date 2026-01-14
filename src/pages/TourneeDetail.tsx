import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
  CheckCircle,
  Loader2,
  Pencil,
  Check,
  X,
  Trash2,
  ExternalLink,
  StickyNote
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';
import { TourneeMap } from '@/components/dashboard/TourneeMap';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

interface VisiteStatus {
  visite: boolean;
  rdv: boolean;
  aRevoir: boolean;
}

const TourneeDetail = () => {
  const { tourneeId } = useParams<{ tourneeId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [orderedSiteIds, setOrderedSiteIds] = useState<string[]>([]);
  const [visitesStatus, setVisitesStatus] = useState<Record<string, VisiteStatus>>({});
  const [siteNotes, setSiteNotes] = useState<Record<string, string>>({});
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [localKpis, setLocalKpis] = useState({
    distance: null as number | null,
    temps: null as number | null,
  });
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState('');
  
  // Note dialog state
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [noteDialogSiteId, setNoteDialogSiteId] = useState<string | null>(null);
  const [noteDialogValue, setNoteDialogValue] = useState('');

  // Fetch tournee data
  const { data: tournee, isLoading: tourneeLoading, error: tourneeError } = useQuery({
    queryKey: ['tournee', tourneeId],
    queryFn: async () => {
      if (!tourneeId) throw new Error('No tournee ID');
      
      const { data, error } = await supabase
        .from('tournees')
        .select('*')
        .eq('id', tourneeId)
        .maybeSingle();
      
      if (error) throw error;
      if (!data) throw new Error('Tournée non trouvée');
      
      return data;
    },
    enabled: !!tourneeId
  });

  // Initialize state from tournee
  useEffect(() => {
    if (tournee) {
      setOrderedSiteIds(tournee.ordre_optimise || []);
      setLocalKpis({
        distance: tournee.distance_totale_km,
        temps: tournee.temps_estime_minutes,
      });
      if (tournee.visites_effectuees && typeof tournee.visites_effectuees === 'object' && !Array.isArray(tournee.visites_effectuees)) {
        setVisitesStatus(tournee.visites_effectuees as unknown as Record<string, VisiteStatus>);
      }
    }
  }, [tournee]);

  // Fetch sites data
  const { data: sites = [], isLoading: sitesLoading } = useQuery({
    queryKey: ['tournee-sites', tourneeId, orderedSiteIds],
    queryFn: async () => {
      if (!orderedSiteIds || orderedSiteIds.length === 0) return [];

      const { data, error } = await supabase
        .from('nouveaux_sites')
        .select('id, nom, adresse, ville, code_postal, latitude, longitude, numero_voie, type_voie, libelle_voie')
        .in('id', orderedSiteIds);

      if (error) throw error;

      // Réordonner selon orderedSiteIds
      return orderedSiteIds
        .map(id => data?.find(s => s.id === id))
        .filter(Boolean);
    },
    enabled: orderedSiteIds.length > 0
  });

  // Fetch existing notes from lead_interactions
  useEffect(() => {
    const fetchNotes = async () => {
      if (orderedSiteIds.length === 0) return;
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) return;

      const { data } = await supabase
        .from('lead_interactions')
        .select('entreprise_id, notes')
        .eq('user_id', session.user.id)
        .in('entreprise_id', orderedSiteIds)
        .not('notes', 'is', null);

      if (data) {
        const notesMap: Record<string, string> = {};
        data.forEach(item => {
          if (item.notes) notesMap[item.entreprise_id] = item.notes;
        });
        setSiteNotes(notesMap);
      }
    };

    fetchNotes();
  }, [orderedSiteIds]);

  // Auto-calculate route if KPIs are missing
  useEffect(() => {
    const calculateMissingKpis = async () => {
      if (
        sites.length >= 2 &&
        (localKpis.distance === null || localKpis.temps === null) &&
        !isRecalculating
      ) {
        const validSites = sites.filter((s: any) => s.latitude && s.longitude);
        if (validSites.length < 2) return;

        setIsRecalculating(true);
        try {
          const waypoints = validSites.map((s: any) => ({
            lat: Number(s.latitude),
            lng: Number(s.longitude),
          }));

          const { data, error } = await supabase.functions.invoke('calculate-routes', {
            body: { waypoints },
          });

          if (error) throw error;

          const newDistance = parseFloat(data.withTolls?.distance_km) || parseFloat(data.withoutTolls?.distance_km) || null;
          const newTemps = data.withTolls?.duration_minutes || data.withoutTolls?.duration_minutes || null;

          if (newDistance || newTemps) {
            setLocalKpis({
              distance: newDistance || null,
              temps: newTemps || null,
            });

            await supabase
              .from('tournees')
              .update({
                distance_totale_km: newDistance,
                temps_estime_minutes: newTemps,
                updated_at: new Date().toISOString(),
              })
              .eq('id', tourneeId);
          }
        } catch (error) {
          console.error('Error calculating route:', error);
        } finally {
          setIsRecalculating(false);
        }
      }
    };

    calculateMissingKpis();
  }, [sites, localKpis.distance, localKpis.temps, tourneeId]);

  // Update tournee mutation
  const updateTourneeMutation = useMutation({
    mutationFn: async (updates: Record<string, any>) => {
      const { error } = await supabase
        .from('tournees')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', tourneeId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tournees'] });
    },
  });

  // Sync interaction to CRM
  const syncToCRM = useMutation({
    mutationFn: async ({ entrepriseId, type }: { entrepriseId: string; type: string }) => {
      const { error } = await supabase.functions.invoke('sync-interaction', {
        body: {
          entreprise_id: entrepriseId,
          type,
          statut: 'en_cours',
          notes: `Depuis tournée: ${tournee?.nom}`,
        },
      });

      if (error) throw error;
    },
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

  const handleVisiteChange = async (siteId: string, field: keyof VisiteStatus, value: boolean) => {
    const newStatus = {
      ...visitesStatus,
      [siteId]: {
        ...(visitesStatus[siteId] || { visite: false, rdv: false, aRevoir: false }),
        [field]: value,
      },
    };
    
    setVisitesStatus(newStatus);

    await updateTourneeMutation.mutateAsync({
      visites_effectuees: newStatus,
    });

    if (value) {
      const typeMap: Record<keyof VisiteStatus, string> = {
        visite: 'visite',
        rdv: 'rdv',
        aRevoir: 'a_revoir',
      };
      
      try {
        await syncToCRM.mutateAsync({
          entrepriseId: siteId,
          type: typeMap[field],
        });
        toast.success(`${field === 'visite' ? 'Visite' : field === 'rdv' ? 'RDV' : 'À revoir'} enregistré`);
      } catch (error) {
        console.error('Error syncing to CRM:', error);
      }
    }
  };

  const openNoteDialog = (siteId: string) => {
    setNoteDialogSiteId(siteId);
    setNoteDialogValue(siteNotes[siteId] || '');
    setNoteDialogOpen(true);
  };

  const handleSaveNote = async () => {
    if (!noteDialogSiteId) return;

    const note = noteDialogValue.trim();
    setSiteNotes(prev => ({
      ...prev,
      [noteDialogSiteId]: note,
    }));

    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.id) return;

    try {
      const { data: existing } = await supabase
        .from('lead_interactions')
        .select('id')
        .eq('entreprise_id', noteDialogSiteId)
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (existing) {
        await supabase
          .from('lead_interactions')
          .update({ 
            notes: note || null,
            updated_at: new Date().toISOString()
          })
          .eq('id', existing.id);
      } else if (note) {
        await supabase
          .from('lead_interactions')
          .insert({
            entreprise_id: noteDialogSiteId,
            user_id: session.user.id,
            type: 'visite',
            statut: 'en_cours',
            notes: note,
          });
      }

      toast.success('Note enregistrée');
      queryClient.invalidateQueries({ queryKey: ['crm-notes'] });
    } catch (error) {
      console.error('Error saving note:', error);
      toast.error('Erreur lors de l\'enregistrement');
    }

    setNoteDialogOpen(false);
    setNoteDialogSiteId(null);
  };

  const handleNavigate = (site: { latitude?: number; longitude?: number; adresse: string }) => {
    if (site.latitude && site.longitude) {
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${site.latitude},${site.longitude}&travelmode=driving`, '_blank');
    } else {
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(site.adresse)}`, '_blank');
    }
  };

  const handleRemoveSite = async (siteId: string) => {
    const newOrder = orderedSiteIds.filter(id => id !== siteId);
    const newEntreprisesIds = tournee.entreprises_ids.filter((id: string) => id !== siteId);
    
    const newVisitesStatus = { ...visitesStatus };
    delete newVisitesStatus[siteId];
    
    setOrderedSiteIds(newOrder);
    setVisitesStatus(newVisitesStatus);
    
    await updateTourneeMutation.mutateAsync({
      ordre_optimise: newOrder,
      entreprises_ids: newEntreprisesIds,
      visites_effectuees: newVisitesStatus,
    });
    
    toast.success('Site supprimé de la tournée');
    queryClient.invalidateQueries({ queryKey: ['tournee-sites', tourneeId, newOrder] });
  };

  const handleBack = () => {
    navigate('/dashboard');
  };

  const handleStartEditName = () => {
    setEditedName(tournee?.nom || '');
    setIsEditingName(true);
  };

  const handleSaveName = async () => {
    if (!editedName.trim()) {
      toast.error('Le nom ne peut pas être vide');
      return;
    }
    await updateTourneeMutation.mutateAsync({ nom: editedName.trim() });
    setIsEditingName(false);
    toast.success('Nom modifié');
    queryClient.invalidateQueries({ queryKey: ['tournee', tourneeId] });
  };

  const handleCancelEditName = () => {
    setIsEditingName(false);
    setEditedName('');
  };

  // Loading state
  if (tourneeLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-accent border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-muted-foreground">Chargement de la tournée...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (tourneeError || !tournee) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-destructive mb-4">Tournée non trouvée</p>
          <Button onClick={handleBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour au dashboard
          </Button>
        </div>
      </div>
    );
  }

  const entreprisesForMap = sites.map((site: any) => ({
    id: site.id,
    nom: site.nom,
    adresse: getFullAddress(site),
    ville: site.ville,
    latitude: site.latitude,
    longitude: site.longitude
  }));

  const completedCount = Object.values(visitesStatus).filter(v => v.visite).length;
  const currentStatut = tournee.statut;

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Header */}
      <div className="p-3 sm:p-4 border-b border-accent/20 flex items-center gap-2 sm:gap-4 shrink-0">
        <Button variant="ghost" size="icon" onClick={handleBack} aria-label="Retour" className="h-9 w-9 shrink-0">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1 min-w-0">
          {isEditingName ? (
            <div className="flex items-center gap-2">
              <Input
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                className="h-8 sm:h-9 text-base sm:text-lg font-bold bg-card border-accent/30 flex-1 min-w-0"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveName();
                  if (e.key === 'Escape') handleCancelEditName();
                }}
              />
              <Button size="icon" variant="ghost" onClick={handleSaveName} className="h-8 w-8 text-green-500 hover:text-green-400 hover:bg-green-500/10 shrink-0">
                <Check className="w-4 h-4" />
              </Button>
              <Button size="icon" variant="ghost" onClick={handleCancelEditName} className="h-8 w-8 text-muted-foreground hover:text-foreground shrink-0">
                <X className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2 min-w-0">
              <h2 className="font-bold text-base sm:text-lg truncate">{tournee.nom}</h2>
              <Button 
                size="icon" 
                variant="ghost" 
                onClick={handleStartEditName}
                className="h-7 w-7 sm:h-8 sm:w-8 text-muted-foreground hover:text-accent shrink-0"
                aria-label="Modifier le nom"
              >
                <Pencil className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </Button>
            </div>
          )}
          <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-muted-foreground mt-0.5">
            <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span className="truncate">{format(new Date(tournee.date_planifiee), 'EEE d MMM yyyy', { locale: fr })}</span>
          </div>
        </div>
        <Badge variant="outline" className={`shrink-0 text-xs
          ${currentStatut === 'planifiee' ? 'border-accent/50 text-accent' : ''}
          ${currentStatut === 'en_cours' ? 'border-orange-500/50 text-orange-500' : ''}
          ${currentStatut === 'terminee' ? 'border-green-500/50 text-green-500' : ''}
        `}>
          {currentStatut === 'planifiee' ? 'Planifiée' : currentStatut === 'en_cours' ? 'En cours' : 'Terminée'}
        </Badge>
      </div>

      {/* KPIs - Always 4 cols, compact on mobile */}
      <div className="p-3 sm:p-4 grid grid-cols-4 gap-1.5 sm:gap-3 shrink-0">
        <div className="p-2 sm:p-3 rounded-xl bg-accent/10 border border-accent/20 text-center">
          <MapPin className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-accent mx-auto mb-0.5 sm:mb-1" />
          <div className="font-bold text-sm sm:text-xl">{sites.length}</div>
          <div className="text-[9px] sm:text-xs text-muted-foreground">Arrêts</div>
        </div>
        <div className="p-2 sm:p-3 rounded-xl bg-gradient-to-r from-accent/20 to-accent/10 border border-accent/30 text-center">
          <Navigation className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-accent mx-auto mb-0.5 sm:mb-1" />
          <div className="font-bold text-sm sm:text-xl flex items-center justify-center gap-0.5">
            {isRecalculating && <Loader2 className="w-3 h-3 animate-spin" />}
            {localKpis.distance?.toFixed(0) || '—'}
          </div>
          <div className="text-[9px] sm:text-xs text-muted-foreground">km</div>
        </div>
        <div className="p-2 sm:p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-center">
          <Clock className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-purple-400 mx-auto mb-0.5 sm:mb-1" />
          <div className="font-bold text-sm sm:text-xl">{formatDuration(localKpis.temps)}</div>
          <div className="text-[9px] sm:text-xs text-muted-foreground">durée</div>
        </div>
        <div className="p-2 sm:p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-center">
          <CheckCircle className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-green-400 mx-auto mb-0.5 sm:mb-1" />
          <div className="font-bold text-sm sm:text-xl">{completedCount}/{sites.length}</div>
          <div className="text-[9px] sm:text-xs text-muted-foreground">visités</div>
        </div>
      </div>

      {/* Content: Map + List */}
      <div className="flex-1 flex flex-col lg:flex-row gap-3 sm:gap-4 p-3 sm:p-4 pt-0 min-h-0 overflow-hidden">
        {/* Map - Mobile: fixed height, Desktop: flex-1 */}
        <div className="h-[160px] sm:h-[200px] md:h-[240px] lg:h-full lg:flex-1 rounded-xl overflow-hidden border border-accent/20 shrink-0 lg:shrink">
          {sitesLoading ? (
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
            <div className="h-full flex items-center justify-center bg-card text-muted-foreground text-sm">
              Aucun site avec coordonnées GPS
            </div>
          )}
        </div>

        {/* Sites list */}
        <Card className="glass-card border-accent/20 flex-1 lg:flex-none lg:w-[360px] xl:w-[400px] flex flex-col min-h-0 overflow-hidden">
          <CardContent className="p-3 sm:p-4 flex-1 flex flex-col min-h-0 overflow-hidden">
            <div className="flex items-center justify-between mb-2 sm:mb-3 shrink-0">
              <h3 className="font-semibold text-sm sm:text-base">Itinéraire optimisé</h3>
              <span className="text-[10px] sm:text-xs text-muted-foreground">{sites.length} arrêts</span>
            </div>

            <ScrollArea className="flex-1 min-h-0">
              {sitesLoading ? (
                <div className="text-center py-8 text-muted-foreground">
                  Chargement...
                </div>
              ) : sites.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Aucun site
                </div>
              ) : (
                <div className="space-y-2 pr-2 sm:pr-3">
                  {orderedSiteIds.map((siteId, index) => {
                    const site = sites.find((s: any) => s.id === siteId);
                    if (!site) return null;
                    
                    const status = visitesStatus[siteId] || { visite: false, rdv: false, aRevoir: false };
                    const hasNote = !!siteNotes[siteId];
                    
                    return (
                      <div
                        key={siteId}
                        className="p-2 sm:p-3 rounded-lg bg-card/50 border border-accent/10 hover:border-accent/30 transition-colors"
                      >
                        {/* Header */}
                        <div className="flex items-start gap-2 mb-1.5 sm:mb-2">
                          <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-accent/20 text-accent flex items-center justify-center text-[10px] sm:text-xs font-bold shrink-0">
                            {index + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-xs sm:text-sm truncate">{site.nom}</div>
                            <div className="text-[10px] sm:text-xs text-muted-foreground truncate">{getFullAddress(site)}</div>
                          </div>
                        </div>

                        {/* Status buttons */}
                        <div className="flex flex-wrap gap-1 mb-1.5 sm:mb-2">
                          <Button
                            size="sm"
                            variant={status.visite ? 'default' : 'outline'}
                            onClick={() => handleVisiteChange(siteId, 'visite', !status.visite)}
                            className={`h-6 sm:h-7 text-[10px] sm:text-xs px-1.5 sm:px-2 ${status.visite ? 'bg-green-600 hover:bg-green-700' : 'border-green-500/30 text-green-500 hover:bg-green-500/10'}`}
                          >
                            <CheckCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5" />
                            Visité
                          </Button>
                          <Button
                            size="sm"
                            variant={status.rdv ? 'default' : 'outline'}
                            onClick={() => handleVisiteChange(siteId, 'rdv', !status.rdv)}
                            className={`h-6 sm:h-7 text-[10px] sm:text-xs px-1.5 sm:px-2 ${status.rdv ? 'bg-blue-600 hover:bg-blue-700' : 'border-blue-500/30 text-blue-500 hover:bg-blue-500/10'}`}
                          >
                            <Calendar className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5" />
                            RDV
                          </Button>
                          <Button
                            size="sm"
                            variant={status.aRevoir ? 'default' : 'outline'}
                            onClick={() => handleVisiteChange(siteId, 'aRevoir', !status.aRevoir)}
                            className={`h-6 sm:h-7 text-[10px] sm:text-xs px-1.5 sm:px-2 ${status.aRevoir ? 'bg-orange-600 hover:bg-orange-700' : 'border-orange-500/30 text-orange-500 hover:bg-orange-500/10'}`}
                          >
                            À revoir
                          </Button>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openNoteDialog(siteId)}
                            className={`h-6 sm:h-7 text-[10px] sm:text-xs px-1.5 sm:px-2 flex-1 ${hasNote ? 'border-yellow-500/50 text-yellow-500 bg-yellow-500/10' : 'border-accent/30'}`}
                          >
                            <StickyNote className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5" />
                            {hasNote ? 'Modifier' : 'Note'}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleNavigate({ latitude: site.latitude, longitude: site.longitude, adresse: getFullAddress(site) })}
                            className="h-6 sm:h-7 text-[10px] sm:text-xs px-1.5 sm:px-2 border-accent/30"
                          >
                            <ExternalLink className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5" />
                            GPS
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleRemoveSite(siteId)}
                            className="h-6 w-6 sm:h-7 sm:w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Note Dialog */}
      <Dialog open={noteDialogOpen} onOpenChange={setNoteDialogOpen}>
        <DialogContent className="sm:max-w-md max-w-[calc(100vw-2rem)]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <StickyNote className="w-5 h-5 text-yellow-500" />
              Note
            </DialogTitle>
          </DialogHeader>
          <Textarea
            value={noteDialogValue}
            onChange={(e) => setNoteDialogValue(e.target.value)}
            placeholder="Ajouter une note..."
            className="min-h-[100px] sm:min-h-[120px]"
          />
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setNoteDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleSaveNote} className="bg-yellow-500 hover:bg-yellow-600 text-black">
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TourneeDetail;
