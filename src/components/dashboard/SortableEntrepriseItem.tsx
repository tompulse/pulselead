import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Navigation, CheckCircle2, AlertCircle, X, Phone, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';

type Entreprise = {
  id: string;
  nom: string;
  ville?: string;
  latitude: number;
  longitude: number;
};

interface SortableEntrepriseItemProps {
  entreprise: Entreprise;
  index: number;
  visite?: any;
  onNavigate: (e: Entreprise) => void;
  onVisiteClick: (e: Entreprise) => void;
  onDelete: (e: Entreprise) => void;
}

export const SortableEntrepriseItem = ({
  entreprise,
  index,
  visite,
  onNavigate,
  onVisiteClick,
  onDelete,
}: SortableEntrepriseItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: entreprise.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group relative flex flex-col gap-2 p-3 rounded-lg bg-gradient-to-br from-card/80 to-card/40 border border-accent/10 hover:border-accent/30 transition-colors duration-300"
    >
      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br from-accent/5 to-transparent" />
      
      {/* En-tête avec numéro et nom */}
      <div className="relative flex items-start gap-2">
        <div
          {...attributes}
          {...listeners}
          className="relative cursor-grab active:cursor-grabbing text-muted-foreground hover:text-accent transition-colors z-10 flex-shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="w-4 h-4" />
        </div>
        
        <div className="relative flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-accent/30 to-accent/10 flex items-center justify-center text-xs font-bold text-accent shadow-sm">
          {index + 1}
        </div>
        
        <div className="relative flex-1 min-w-0">
          <div className="text-sm font-medium mb-0.5">
            {entreprise.nom}
          </div>
          <div className="text-xs text-muted-foreground truncate">
            {entreprise.ville}
          </div>
        </div>

        {/* Badges de statut */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {visite?.rdv_pris && (
            <div className="p-1 bg-green-500/10 rounded">
              <CheckCircle2 className="w-3 h-3 text-green-500" />
            </div>
          )}
          {visite?.a_revoir && (
            <div className="p-1 bg-orange-500/10 rounded">
              <AlertCircle className="w-3 h-3 text-orange-500" />
            </div>
          )}
        </div>

        <Button
          size="sm"
          variant="ghost"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(entreprise);
          }}
          className="relative flex-shrink-0 h-6 w-6 p-0 hover:bg-red-500/10 hover:text-red-500 transition-colors z-10"
        >
          <X className="w-3 h-3" />
        </Button>
      </div>

      {/* Actions colorées en bas */}
      <div className="relative flex items-center gap-2 pt-1 border-t border-accent/10">
        <Button
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            // Action téléphone
            const tel = (entreprise as any).telephone;
            if (tel) window.open(`tel:${tel}`, '_self');
          }}
          className="flex-1 h-9 bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 border border-blue-500/20 hover:border-blue-500/40 transition-all z-10"
        >
          <Phone className="w-3.5 h-3.5" />
        </Button>

        <Button
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onNavigate(entreprise);
          }}
          className="flex-1 h-9 bg-green-500/10 hover:bg-green-500/20 text-green-500 border border-green-500/20 hover:border-green-500/40 transition-all z-10"
        >
          <Navigation className="w-3.5 h-3.5" />
        </Button>

        <Button
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onVisiteClick(entreprise);
          }}
          className="flex-1 h-9 bg-purple-500/10 hover:bg-purple-500/20 text-purple-500 border border-purple-500/20 hover:border-purple-500/40 transition-all z-10"
        >
          <Calendar className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
};
