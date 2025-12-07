import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, MapPin, Navigation, CheckCircle2, Calendar, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface NouveauSite {
  id: string;
  nom: string;
  ville: string | null;
  adresse: string | null;
  latitude: number | null;
  longitude: number | null;
  code_postal: string | null;
}

interface VisiteState {
  visite: boolean;
  rdv: boolean;
  aRevoir: boolean;
  notes: string;
}

interface SortableVisiteItemProps {
  site: NouveauSite;
  index: number;
  visiteState: VisiteState;
  onVisiteChange: (field: keyof VisiteState, value: boolean | string) => void;
  onOpenGPS: () => void;
}

export const SortableVisiteItem = ({
  site,
  index,
  visiteState,
  onVisiteChange,
  onOpenGPS,
}: SortableVisiteItemProps) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: site.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
    opacity: isDragging ? 0.8 : 1,
  };

  const hasCoords = site.latitude && site.longitude;
  const isCompleted = visiteState.visite || visiteState.rdv;

  return (
    <Card 
      ref={setNodeRef} 
      style={style}
      className={`border transition-all ${
        isCompleted 
          ? 'border-green-500/50 bg-green-500/5' 
          : 'border-accent/20 hover:border-accent/40'
      } ${isDragging ? 'shadow-lg' : ''}`}
    >
      <CardContent className="p-3">
        <div className="flex items-start gap-3">
          {/* Drag handle */}
          <div 
            {...attributes} 
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-1 hover:bg-accent/10 rounded"
          >
            <GripVertical className="w-5 h-5 text-muted-foreground" />
          </div>

          {/* Index badge */}
          <Badge 
            variant="outline" 
            className={`w-7 h-7 rounded-full flex items-center justify-center p-0 shrink-0 ${
              isCompleted ? 'bg-green-500 text-white border-green-500' : ''
            }`}
          >
            {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : index + 1}
          </Badge>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <Collapsible open={isOpen} onOpenChange={setIsOpen}>
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-medium truncate">{site.nom}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {site.adresse || site.ville || site.code_postal || 'Adresse non disponible'}
                  </p>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {hasCoords && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-accent hover:bg-accent/10"
                      onClick={onOpenGPS}
                    >
                      <Navigation className="w-4 h-4" />
                    </Button>
                  )}
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                    </Button>
                  </CollapsibleTrigger>
                </div>
              </div>

              {/* Quick checkboxes - always visible */}
              <div className="flex gap-4 mt-2">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <Checkbox
                    checked={visiteState.visite}
                    onCheckedChange={(checked) => onVisiteChange('visite', !!checked)}
                    className="border-green-500 data-[state=checked]:bg-green-500"
                  />
                  <span className={visiteState.visite ? 'text-green-500' : ''}>Visite</span>
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <Checkbox
                    checked={visiteState.rdv}
                    onCheckedChange={(checked) => onVisiteChange('rdv', !!checked)}
                    className="border-purple-500 data-[state=checked]:bg-purple-500"
                  />
                  <span className={visiteState.rdv ? 'text-purple-500' : ''}>RDV</span>
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <Checkbox
                    checked={visiteState.aRevoir}
                    onCheckedChange={(checked) => onVisiteChange('aRevoir', !!checked)}
                    className="border-orange-500 data-[state=checked]:bg-orange-500"
                  />
                  <span className={visiteState.aRevoir ? 'text-orange-500' : ''}>À revoir</span>
                </label>
              </div>

              {/* Expandable notes section */}
              <CollapsibleContent>
                <div className="mt-3 space-y-2">
                  <Textarea
                    placeholder="Notes sur cette visite..."
                    value={visiteState.notes}
                    onChange={(e) => onVisiteChange('notes', e.target.value)}
                    className="min-h-[60px] text-sm border-accent/30"
                  />
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
