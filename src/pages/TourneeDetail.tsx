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
  Eye,
  Loader2,
  Pencil,
  Check,
  X,
  Trash2,
  ExternalLink,
  StickyNote,
  Phone,
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
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

interface VisiteStatus {
  visite: boolean;
  rdv: boolean;
  aRevoir: boolean;
  aRappeler?: boolean;
}

type PendingAction = 'rdv' | 'aRevoir' | 'aRappeler';

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

  // Date dialog state (RDV / À revoir / À rappeler)
  const [dateDialogOpen, setDateDialogOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
  const [pendingSiteId, setPendingSiteId] = useState<string | null>(null);
  const [pendingSiteName, setPendingSiteName] = useState<string>('');
  const [pendingDate, setPendingDate] = useState('');

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
    mutationFn: async ({
      entrepriseId,
      type,
      dateRelance,
    }: {
      entrepriseId: string;
      type: string;
      dateRelance?: string;
    }) => {
      const statut = type === 'a_revoir' || type === 'a_rappeler' ? 'a_rappeler' : 'en_cours';

      const { error } = await supabase.functions.invoke('sync-interaction', {
        body: {
          entreprise_id: entrepriseId,
          type,
          statut,
          notes: `Depuis tournée: ${tournee?.nom}`,
          date_relance: dateRelance ?? null,
        },
      });

      if (error) throw error;
    },
  });

  const handleVisiteChange = async (
    siteId: string,
    field: keyof VisiteStatus,
    value: boolean,
    dateRelance?: string
  ) => {
    const newStatus = {
      ...visitesStatus,
      [siteId]: {
        ...(visitesStatus[siteId] || { visite: false, rdv: false, aRevoir: false, aRappeler: false }),
        [field]: value,
      },
    };

    setVisitesStatus(newStatus);

    await updateTourneeMutation.mutateAsync({
      visites_effectuees: newStatus,
    });

    if (!value) return;

    const typeMap: Record<keyof VisiteStatus, string> = {
      visite: 'visite',
      rdv: 'rdv',
      aRevoir: 'a_revoir',
      aRappeler: 'a_rappeler',
    };

    try {
      const type = typeMap[field];
      await syncToCRM.mutateAsync({
        entrepriseId: siteId,
        type,
        dateRelance,
      });

      const labelDate = (dateRelance ? new Date(dateRelance) : new Date()).toLocaleDateString('fr-FR');

      const messages: Record<keyof VisiteStatus, string> = {
        visite: `Visite du ${labelDate} enregistrée`,
        rdv: dateRelance ? `RDV planifié le ${labelDate}` : 'RDV enregistré',
        aRevoir: dateRelance ? `Revisite planifiée le ${labelDate}` : 'À revoir enregistré',
        aRappeler: dateRelance ? `Rappel planifié le ${labelDate}` : 'À rappeler enregistré',
      };

      toast.success(messages[field] || 'Action enregistrée');
    } catch (error) {
      console.error('Error syncing to CRM:', error);
    }
  };

  const openDateDialogFor = (siteId: string, siteName: string, action: PendingAction) => {
    setPendingSiteId(siteId);
    setPendingSiteName(siteName);
    setPendingAction(action);

    const defaultDate = new Date();
    if (action === 'rdv') {
      defaultDate.setDate(defaultDate.getDate() + 7);
    } else {
      defaultDate.setDate(defaultDate.getDate() + 1);
    }

    setPendingDate(defaultDate.toISOString().slice(0, 16));
    setDateDialogOpen(true);
  };

  const handleStatusClick = (siteId: string, siteName: string, field: keyof VisiteStatus) => {
    const current = visitesStatus[siteId]?.[field] || false;

    if (current) {
      void handleVisiteChange(siteId, field, false);
      return;
    }

    if (field === 'visite') {
      // Date du jour implicitement (interaction créée maintenant)
      void handleVisiteChange(siteId, 'visite', true);
      return;
    }

    if (field === 'rdv') return openDateDialogFor(siteId, siteName, 'rdv');
    if (field === 'aRevoir') return openDateDialogFor(siteId, siteName, 'aRevoir');
    if (field === 'aRappeler') return openDateDialogFor(siteId, siteName, 'aRappeler');
  };

  const handleConfirmDate = async () => {
    if (!pendingSiteId || !pendingAction || !pendingDate) return;

    const dateIso = new Date(pendingDate).toISOString();

    const fieldMap: Record<PendingAction, keyof VisiteStatus> = {
      rdv: 'rdv',
      aRevoir: 'aRevoir',
      aRappeler: 'aRappeler',
    };

    await handleVisiteChange(pendingSiteId, fieldMap[pendingAction], true, dateIso);

    setDateDialogOpen(false);
    setPendingAction(null);
    setPendingSiteId(null);
    setPendingSiteName('');
    setPendingDate('');
  };

  const handleCancelDate = () => {
    setDateDialogOpen(false);
    setPendingAction(null);
    setPendingSiteId(null);
    setPendingSiteName('');
    setPendingDate('');
  };

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

  const getDialogTitle = () => {
    switch (pendingAction) {
      case 'rdv': return 'Planifier le RDV';
      case 'aRevoir': return 'Planifier la revisite';
      case 'aRappeler': return 'Planifier le rappel';
      default: return 'Planifier';
    }
  };

  const getDialogColor = () => {
    switch (pendingAction) {
      case 'rdv': return 'text-purple-400';
      case 'aRevoir': return 'text-orange-400';
      case 'aRappeler': return 'text-blue-400';
      default: return 'text-accent';
    }
  };

  const getButtonColor = () => {
    switch (pendingAction) {
      case 'rdv': return 'bg-purple-500 hover:bg-purple-600';
      case 'aRevoir': return 'bg-orange-500 hover:bg-orange-600';
      case 'aRappeler': return 'bg-blue-500 hover:bg-blue-600';
      default: return 'bg-accent hover:bg-accent/90';
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

  const stopsContent = sitesLoading ? (
    <div className="text-center py-8 text-muted-foreground">Chargement...</div>
  ) : sites.length === 0 ? (
    <div className="text-center py-8 text-muted-foreground">Aucun site</div>
  ) : (
    <div className="space-y-2 pr-2 sm:pr-3">
      {orderedSiteIds.map((siteId, index) => {
        const site = sites.find((s: any) => s.id === siteId);
        if (!site) return null;

        const status = visitesStatus[siteId] || { visite: false, rdv: false, aRevoir: false, aRappeler: false };
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

            {/* Status buttons: Visité, RDV, À revoir, À rappeler */}
            <div className="flex flex-wrap gap-1 mb-1.5 sm:mb-2">
              <Button
                size="sm"
                variant={status.visite ? 'default' : 'outline'}
                onClick={() => handleStatusClick(siteId, site.nom, 'visite')}
                className={`h-6 sm:h-7 text-[10px] sm:text-xs px-1.5 sm:px-2 ${status.visite ? 'bg-green-600 hover:bg-green-700' : 'border-green-500/30 text-green-500 hover:bg-green-500/10'}`}
              >
                <CheckCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5" />
                Visité
              </Button>
              <Button
                size="sm"
                variant={status.rdv ? 'default' : 'outline'}
                onClick={() => handleStatusClick(siteId, site.nom, 'rdv')}
                className={`h-6 sm:h-7 text-[10px] sm:text-xs px-1.5 sm:px-2 ${status.rdv ? 'bg-purple-600 hover:bg-purple-700' : 'border-purple-500/30 text-purple-500 hover:bg-purple-500/10'}`}
              >
                <Calendar className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5" />
                RDV
              </Button>
              <Button
                size="sm"
                variant={status.aRevoir ? 'default' : 'outline'}
                onClick={() => handleStatusClick(siteId, site.nom, 'aRevoir')}
                className={`h-6 sm:h-7 text-[10px] sm:text-xs px-1.5 sm:px-2 ${status.aRevoir ? 'bg-orange-600 hover:bg-orange-700' : 'border-orange-500/30 text-orange-500 hover:bg-orange-500/10'}`}
              >
                <Eye className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5" />
                À revoir
              </Button>
              <Button
                size="sm"
                variant={status.aRappeler ? 'default' : 'outline'}
                onClick={() => handleStatusClick(siteId, site.nom, 'aRappeler')}
                className={`h-6 sm:h-7 text-[10px] sm:text-xs px-1.5 sm:px-2 ${status.aRappeler ? 'bg-blue-600 hover:bg-blue-700' : 'border-blue-500/30 text-blue-500 hover:bg-blue-500/10'}`}
              >
                <Phone className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5" />
                À rappeler
              </Button>
            </div>

            {/* Actions: Note, GPS, Delete */}
            <div className="flex items-center gap-1">
              <Button
                size="sm"
                variant="outline"
                onClick={() => openNoteDialog(siteId)}
                className={`h-6 sm:h-7 text-[10px] sm:text-xs px-1.5 sm:px-2 ${hasNote ? 'border-yellow-500/50 text-yellow-500 bg-yellow-500/10' : 'border-accent/30'}`}
              >
                <StickyNote className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5" />
                Note
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
  );

  return (
    <div className="min-h-screen flex flex-col bg-background overflow-y-auto lg:h-screen lg:overflow-hidden">
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
      <div className="flex-1 flex flex-col lg:flex-row gap-3 sm:gap-4 p-3 sm:p-4 pt-0 lg:min-h-0 lg:overflow-hidden">
        {/* Map - Mobile: fixed height, Desktop: flex-1 */}
        <div className="h-[180px] sm:h-[220px] md:h-[280px] lg:h-auto lg:flex-1 rounded-xl overflow-hidden border border-accent/20">
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
        <Card className="glass-card border-accent/20 w-full lg:w-[360px] xl:w-[400px] flex flex-col lg:max-h-full lg:overflow-hidden">
          <CardContent className="p-3 sm:p-4 flex flex-col flex-1 lg:overflow-hidden">
            <div className="flex items-center justify-between mb-2 sm:mb-3 shrink-0">
              <h3 className="font-semibold text-sm sm:text-base">Itinéraire optimisé</h3>
              <span className="text-[10px] sm:text-xs text-muted-foreground">{sites.length} arrêts</span>
            </div>

            {/* Desktop: scroll interne, Mobile/Tablette: scroll page */}
            <div className="flex-1 lg:overflow-auto">
              {stopsContent}
            </div>
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

      {/* Date Dialog for RDV / À revoir / À rappeler */}
      <Dialog open={dateDialogOpen} onOpenChange={setDateDialogOpen}>
        <DialogContent className="sm:max-w-md max-w-[calc(100vw-2rem)]">
          <DialogHeader>
            <DialogTitle className={`flex items-center gap-2 ${getDialogColor()}`}>
              {pendingAction === 'rdv' && <Calendar className="w-5 h-5" />}
              {pendingAction === 'aRevoir' && <Eye className="w-5 h-5" />}
              {pendingAction === 'aRappeler' && <Phone className="w-5 h-5" />}
              {getDialogTitle()}
            </DialogTitle>
            <DialogDescription>
              Pour <span className="font-semibold text-foreground">{pendingSiteName}</span>
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <label htmlFor="relance-date" className="text-sm font-medium">
                {pendingAction === 'rdv' ? 'Date et heure du RDV' : 'Date de relance'}
              </label>
              <Input
                id="relance-date"
                type="datetime-local"
                value={pendingDate}
                onChange={(e) => setPendingDate(e.target.value)}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                📅 Cette relance apparaîtra dans vos notifications (🔔) à la date choisie
              </p>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={handleCancelDate}>
              <X className="w-4 h-4 mr-1" />
              Annuler
            </Button>
            <Button onClick={handleConfirmDate} disabled={!pendingDate} className={getButtonColor()}>
              <Check className="w-4 h-4 mr-1" />
              Confirmer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TourneeDetail;
