import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { GripVertical, MapPin, Navigation, Calendar, RotateCcw, Trash2, MessageSquare, X, Check } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

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
  currentNote?: string;
  onVisiteChange: (siteId: string, field: keyof VisiteStatus, value: boolean) => void;
  onNavigate: (site: { latitude?: number; longitude?: number; adresse: string }) => void;
  onRemove?: (siteId: string) => void;
  onNoteChange?: (siteId: string, note: string) => void;
}

export const SortableVisiteItem = ({
  id,
  index,
  isLast,
  site,
  visiteStatus,
  currentNote = '',
  onVisiteChange,
  onNavigate,
  onRemove,
  onNoteChange,
}: SortableVisiteItemProps) => {
  const [isNoteDialogOpen, setIsNoteDialogOpen] = useState(false);
  const [noteText, setNoteText] = useState(currentNote);

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

  const handleOpenNote = () => {
    setNoteText(currentNote);
    setIsNoteDialogOpen(true);
  };

  const handleSaveNote = () => {
    if (onNoteChange) {
      onNoteChange(site.id, noteText);
    }
    setIsNoteDialogOpen(false);
  };

  const hasNote = currentNote && currentNote.trim().length > 0;

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        className={`p-3 rounded-lg border transition-colors ${
          isDragging 
            ? 'bg-accent/20 border-accent shadow-lg' 
            : 'bg-card/50 border-accent/10 hover:border-accent/30'
        }`}
      >
        <div className="flex items-start gap-2">
          {/* Drag handle */}
          <button
            {...attributes}
            {...listeners}
            className="mt-1 cursor-grab active:cursor-grabbing touch-none p-1 rounded hover:bg-accent/10 shrink-0"
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
            <div className="font-medium text-sm leading-tight">{site.nom}</div>
            <div className="text-xs text-muted-foreground leading-tight mt-0.5">{site.adresse}</div>
            {hasNote && (
              <div className="mt-1 text-xs text-yellow-400/80 flex items-center gap-1">
                <MessageSquare className="w-3 h-3" />
                <span className="truncate">{currentNote.substring(0, 30)}{currentNote.length > 30 ? '...' : ''}</span>
              </div>
            )}
          </div>

          {/* Action buttons - Navigation & Delete only */}
          <div className="flex items-center gap-1 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => onNavigate(site)}
              aria-label="Naviguer vers ce site"
            >
              <Navigation className="w-3.5 h-3.5 text-accent" />
            </Button>
            {onRemove && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 hover:bg-destructive/10 hover:text-destructive"
                onClick={() => onRemove(site.id)}
                aria-label="Supprimer de la tournée"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>
        </div>
        
        {/* Action checkboxes - on separate row */}
        <div className="flex items-center flex-wrap gap-x-3 gap-y-2 mt-2 pl-10">
          <label className="flex items-center gap-1 text-xs cursor-pointer whitespace-nowrap">
            <Checkbox 
              checked={visiteStatus.visite}
              onCheckedChange={(checked) => onVisiteChange(site.id, 'visite', !!checked)}
              className="h-4 w-4"
            />
            <MapPin className="w-3 h-3 text-accent" />
            <span>Visité</span>
          </label>
          
          <label className="flex items-center gap-1 text-xs cursor-pointer whitespace-nowrap">
            <Checkbox 
              checked={visiteStatus.rdv}
              onCheckedChange={(checked) => onVisiteChange(site.id, 'rdv', !!checked)}
              className="h-4 w-4"
            />
            <Calendar className="w-3 h-3 text-purple-400" />
            <span>RDV</span>
          </label>
          
          <label className="flex items-center gap-1 text-xs cursor-pointer whitespace-nowrap">
            <Checkbox 
              checked={visiteStatus.aRevoir}
              onCheckedChange={(checked) => onVisiteChange(site.id, 'aRevoir', !!checked)}
              className="h-4 w-4"
            />
            <RotateCcw className="w-3 h-3 text-orange-400" />
            <span>À revoir</span>
          </label>

          <button
            type="button"
            onClick={handleOpenNote}
            className={`flex items-center gap-1 text-xs cursor-pointer whitespace-nowrap px-2 py-1 rounded-md border transition-colors ${
              hasNote 
                ? 'bg-yellow-500/20 border-yellow-500/40 text-yellow-400' 
                : 'border-accent/20 hover:border-yellow-500/40 hover:bg-yellow-500/10 text-muted-foreground hover:text-yellow-400'
            }`}
          >
            <MessageSquare className="w-3 h-3" />
            <span>{hasNote ? 'Modifier note' : 'Note'}</span>
          </button>
        </div>
      </div>

      {/* Note Dialog */}
      <Dialog open={isNoteDialogOpen} onOpenChange={setIsNoteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-yellow-400" />
              Note pour {site.nom}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Écrivez votre note ici..."
              className="min-h-[120px] resize-none"
            />
          </div>
          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setIsNoteDialogOpen(false)}
            >
              <X className="w-4 h-4 mr-1" />
              Annuler
            </Button>
            <Button
              onClick={handleSaveNote}
              className="bg-accent hover:bg-accent/90 text-primary"
            >
              <Check className="w-4 h-4 mr-1" />
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
