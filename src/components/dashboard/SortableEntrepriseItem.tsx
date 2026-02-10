import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Navigation, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ArchivedBadge } from '@/components/ui/archived-badge';

type Entreprise = {
  id: string;
  nom: string;
  ville?: string;
  latitude: number;
  longitude: number;
  archived?: boolean;
  date_archive?: string;
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
      className="group relative flex items-center gap-2 p-3 rounded-lg bg-gradient-to-br from-card/80 to-card/40 border border-accent/10 hover:border-accent/30 transition-colors duration-300 cursor-pointer"
      onClick={() => onVisiteClick(entreprise)}
    >
      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br from-accent/5 to-transparent" />
      
      <div
        {...attributes}
        {...listeners}
        className="relative cursor-grab active:cursor-grabbing text-muted-foreground hover:text-accent transition-colors z-10"
        onClick={(e) => e.stopPropagation()}
      >
        <GripVertical className="w-4 h-4" />
      </div>
      
      <div className="relative flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-accent/30 to-accent/10 flex items-center justify-center text-xs font-bold text-accent shadow-sm">
        {index + 1}
      </div>
      
      <div className="relative flex-1 min-w-0">
        <div className="text-sm font-medium truncate flex items-center gap-2">
          {entreprise.nom}
          {entreprise.archived && (
            <ArchivedBadge 
              dateArchive={entreprise.date_archive} 
              variant="compact"
            />
          )}
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
        <div className="text-xs text-muted-foreground truncate">
          {entreprise.commune}
        </div>
      </div>

      <Button
        size="sm"
        variant="ghost"
        onClick={(e) => {
          e.stopPropagation();
          onNavigate(entreprise);
        }}
        className="relative flex-shrink-0 h-8 w-8 p-0 hover:bg-accent/10 hover:text-accent transition-colors z-10"
      >
        <Navigation className="w-4 h-4" />
      </Button>

      <Button
        size="sm"
        variant="ghost"
        onClick={(e) => {
          e.stopPropagation();
          onDelete(entreprise);
        }}
        className="relative flex-shrink-0 h-8 w-8 p-0 hover:bg-red-500/10 hover:text-red-500 transition-colors z-10"
      >
        <X className="w-4 h-4" />
      </Button>
    </div>
  );
};
