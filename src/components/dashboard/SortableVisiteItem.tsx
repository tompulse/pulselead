import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { GripVertical, MapPin, Navigation, Calendar, RotateCcw, Trash2 } from 'lucide-react';

interface VisiteStatus {
  visite: boolean;
  rdv: boolean;
  aRevoir: boolean;
}

interface SortableVisiteItemProps {
  id: string;
  index: number;
  isLast: boolean;
  site: {
    id: string;
    nom: string;
    adresse: string;
    ville?: string;
    latitude?: number;
    longitude?: number;
  };
  visiteStatus: VisiteStatus;
  onVisiteChange: (siteId: string, field: keyof VisiteStatus, value: boolean) => void;
  onNavigate: (site: { latitude?: number; longitude?: number; adresse: string }) => void;
  onRemove?: (siteId: string) => void;
}

export const SortableVisiteItem = ({
  id,
  index,
  isLast,
  site,
  visiteStatus,
  onVisiteChange,
  onNavigate,
  onRemove,
}: SortableVisiteItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 'auto',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
        isDragging 
          ? 'bg-accent/20 border-accent shadow-lg' 
          : 'bg-card/50 border-accent/10 hover:border-accent/30'
      }`}
    >
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        className="mt-1 cursor-grab active:cursor-grabbing touch-none p-1 rounded hover:bg-accent/10"
      >
        <GripVertical className="w-4 h-4 text-muted-foreground" />
      </button>

      {/* Index badge */}
      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
        isLast 
          ? 'bg-green-500 text-white' 
          : visiteStatus.visite
            ? 'bg-accent/50 text-primary'
            : 'bg-accent text-primary'
      }`}>
        {isLast ? '🏁' : index + 1}
      </div>

      {/* Site info */}
      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm truncate">{site.nom}</div>
        <div className="text-xs text-muted-foreground truncate">{site.adresse}</div>
        
        {/* Action checkboxes */}
        <div className="flex flex-wrap items-center gap-3 mt-2">
          <label className="flex items-center gap-1.5 text-xs cursor-pointer">
            <Checkbox 
              checked={visiteStatus.visite}
              onCheckedChange={(checked) => onVisiteChange(site.id, 'visite', !!checked)}
              className="h-4 w-4"
            />
            <MapPin className="w-3 h-3 text-accent" />
            <span>Visité</span>
          </label>
          
          <label className="flex items-center gap-1.5 text-xs cursor-pointer">
            <Checkbox 
              checked={visiteStatus.rdv}
              onCheckedChange={(checked) => onVisiteChange(site.id, 'rdv', !!checked)}
              className="h-4 w-4"
            />
            <Calendar className="w-3 h-3 text-purple-400" />
            <span>RDV</span>
          </label>
          
          <label className="flex items-center gap-1.5 text-xs cursor-pointer">
            <Checkbox 
              checked={visiteStatus.aRevoir}
              onCheckedChange={(checked) => onVisiteChange(site.id, 'aRevoir', !!checked)}
              className="h-4 w-4"
            />
            <RotateCcw className="w-3 h-3 text-orange-400" />
            <span>À revoir</span>
          </label>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-col gap-1 shrink-0">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => onNavigate(site)}
          aria-label="Naviguer vers ce site"
        >
          <Navigation className="w-4 h-4 text-accent" />
        </Button>
        {onRemove && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
            onClick={() => onRemove(site.id)}
            aria-label="Supprimer de la tournée"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
};
