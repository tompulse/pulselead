import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, closestCorners } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Building2, TrendingUp, TrendingDown, Mail, Phone, Calendar, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Lead {
  entreprise_id: string;
  statut_actuel: string;
  etape_pipeline: number;
  probabilite: number;
  valeur_estimee: number | null;
  entreprise: {
    nom: string;
    ville: string;
    activite: string;
    score_lead: number | null;
  };
  derniere_interaction?: {
    type: string;
    created_at: string;
  };
}

const PIPELINE_STAGES = [
  { id: "nouveau", label: "Nouveau", color: "bg-slate-500", etape: 1 },
  { id: "qualifie", label: "Qualifié", color: "bg-blue-500", etape: 2 },
  { id: "proposition", label: "Proposition", color: "bg-purple-500", etape: 3 },
  { id: "negociation", label: "Négociation", color: "bg-orange-500", etape: 4 },
  { id: "gagne", label: "Gagné 🎉", color: "bg-green-500", etape: 5 },
  { id: "perdu", label: "Perdu", color: "bg-red-500", etape: 0 },
];

const LeadCard = ({ lead, onSelect }: { lead: Lead; onSelect: (lead: Lead) => void }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: lead.entreprise_id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const scoreColor = (score: number | null) => {
    if (!score) return "bg-gray-500";
    if (score >= 80) return "bg-green-500";
    if (score >= 50) return "bg-orange-500";
    return "bg-red-500";
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onSelect(lead)}
      className="mb-2 cursor-move"
    >
      <Card className="hover:shadow-lg transition-all border-accent/20 hover:border-accent/50">
        <CardContent className="p-3 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-sm truncate">{lead.entreprise.nom}</h4>
              <p className="text-xs text-muted-foreground truncate">{lead.entreprise.ville}</p>
            </div>
            {lead.entreprise.score_lead && (
              <Badge className={`${scoreColor(lead.entreprise.score_lead)} text-white text-xs shrink-0`}>
                {lead.entreprise.score_lead}
              </Badge>
            )}
          </div>
          
          {lead.valeur_estimee && (
            <div className="flex items-center gap-1 text-xs text-accent">
              <TrendingUp className="w-3 h-3" />
              {lead.valeur_estimee.toLocaleString('fr-FR')} €
            </div>
          )}

          <div className="flex items-center gap-1 text-xs">
            <Badge variant="outline" className="text-xs">
              {lead.probabilite}%
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const PipelineColumn = ({ 
  stage, 
  leads, 
  onSelect 
}: { 
  stage: typeof PIPELINE_STAGES[0]; 
  leads: Lead[];
  onSelect: (lead: Lead) => void;
}) => {
  const totalValue = leads.reduce((sum, lead) => sum + (lead.valeur_estimee || 0), 0);

  return (
    <Card className="flex flex-col h-full glass-card border-accent/30">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${stage.color}`} />
            {stage.label}
          </CardTitle>
          <Badge variant="secondary" className="text-xs">
            {leads.length}
          </Badge>
        </div>
        {totalValue > 0 && (
          <p className="text-xs text-muted-foreground">
            {totalValue.toLocaleString('fr-FR')} €
          </p>
        )}
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-3 pt-0">
        <ScrollArea className="h-full pr-2">
          <SortableContext items={leads.map(l => l.entreprise_id)} strategy={verticalListSortingStrategy}>
            {leads.length === 0 ? (
              <div className="flex items-center justify-center h-32 opacity-40">
                <Plus className="w-6 h-6 text-muted-foreground" />
              </div>
            ) : (
              leads.map((lead) => (
                <LeadCard key={lead.entreprise_id} lead={lead} onSelect={onSelect} />
              ))
            )}
          </SortableContext>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export const PipelineKanban = ({ onLeadSelect }: { onLeadSelect?: (entrepriseId: string) => void }) => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('lead_statuts')
        .select(`
          entreprise_id,
          statut_actuel,
          etape_pipeline,
          probabilite,
          valeur_estimee,
          entreprises:entreprise_id (
            nom,
            ville,
            activite,
            score_lead
          )
        `)
        .eq('user_id', user.id);

      if (error) throw error;

      // Fetch dernière interaction pour chaque lead
      const leadsWithInteractions = await Promise.all(
        (data || []).map(async (lead) => {
          const { data: interaction } = await supabase
            .from('lead_interactions')
            .select('type, created_at')
            .eq('entreprise_id', lead.entreprise_id)
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          return {
            ...lead,
            entreprise: Array.isArray(lead.entreprises) ? lead.entreprises[0] : lead.entreprises,
            derniere_interaction: interaction,
          };
        })
      );

      setLeads(leadsWithInteractions);
    } catch (error) {
      console.error('Error fetching leads:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger le pipeline",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) return;

    const overId = over.id as string;
    const activeId = active.id as string;

    // Déterminer le nouveau statut basé sur la colonne de destination
    const targetStage = PIPELINE_STAGES.find(stage => overId.startsWith(stage.id));
    
    if (!targetStage) return;

    const lead = leads.find(l => l.entreprise_id === activeId);
    if (!lead || lead.statut_actuel === targetStage.id) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Calculer la nouvelle probabilité en fonction de l'étape
      const newProbability = targetStage.etape === 0 ? 0 : targetStage.etape * 20;

      const { error } = await supabase
        .from('lead_statuts')
        .update({
          statut_actuel: targetStage.id as any,
          etape_pipeline: targetStage.etape,
          probabilite: newProbability,
        })
        .eq('entreprise_id', activeId)
        .eq('user_id', user.id);

      if (error) throw error;

      // Ajouter une interaction automatique
      await supabase.from('lead_interactions').insert([{
        entreprise_id: activeId,
        user_id: user.id,
        type: 'autre',
        statut: 'a_rappeler',
        notes: `Lead déplacé vers: ${targetStage.label}`,
      }]);

      toast({
        title: "Pipeline mis à jour",
        description: `Lead déplacé vers "${targetStage.label}"`,
      });

      fetchLeads();
    } catch (error) {
      console.error('Error updating lead:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le lead",
        variant: "destructive",
      });
    }

    setActiveId(null);
  };

  const handleLeadSelect = (lead: Lead) => {
    if (onLeadSelect) {
      onLeadSelect(lead.entreprise_id);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Chargement du pipeline...</p>
      </div>
    );
  }

  return (
    <div className="h-full p-4">
      <DndContext
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 h-full">
          {PIPELINE_STAGES.map((stage) => (
            <PipelineColumn
              key={stage.id}
              stage={stage}
              leads={leads.filter(l => l.statut_actuel === stage.id)}
              onSelect={handleLeadSelect}
            />
          ))}
        </div>
      </DndContext>
    </div>
  );
};
