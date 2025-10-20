import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Navigation, CheckCircle2, AlertCircle } from 'lucide-react';
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
}

export const SortableEntrepriseItem = ({
  entreprise,
  index,
  visite,
  onNavigate,
  onVisiteClick,
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
      className="flex items-center gap-2 p-2 rounded bg-card border border-accent/10 hover:border-accent/30 transition-colors"
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-accent"
      >
        <GripVertical className="w-4 h-4" />
      </div>
      
      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center text-xs font-bold text-accent">
        {index + 1}
      </div>
      
      <div 
        className="flex-1 min-w-0 cursor-pointer"
        onClick={() => onVisiteClick(entreprise)}
      >
        <div className="text-sm font-medium truncate flex items-center gap-2">
          {entreprise.nom}
          {visite?.rdv_pris && <CheckCircle2 className="w-3 h-3 text-green-500" />}
          {visite?.a_revoir && <AlertCircle className="w-3 h-3 text-orange-500" />}
        </div>
        <div className="text-xs text-muted-foreground truncate">
          {entreprise.ville}
        </div>
      </div>

      <Button
        size="sm"
        variant="ghost"
        onClick={(e) => {
          e.stopPropagation();
          onNavigate(entreprise);
        }}
        className="flex-shrink-0 h-8 w-8 p-0"
      >
        <Navigation className="w-4 h-4" />
      </Button>
    </div>
  );
};
