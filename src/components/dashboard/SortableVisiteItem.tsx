import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { GripVertical, MapPin, Navigation, Calendar, Eye, Phone, Trash2, FileText, X, Check } from 'lucide-react';
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
  aRappeler?: boolean;
}

interface SortableVisiteItemProps {
  id: string;
  index: number;
  isLast: boolean;
  site: {
    id: string;
    nom: string;
    address?: string;
    ville?: string;
    latitude?: number;
    longitude?: number;
  };
  visiteStatus: VisiteStatus;
  currentNote?: string;
  onVisiteChange: (siteId: string, field: keyof VisiteStatus, value: boolean, dateRelance?: string) => void;
  onNavigate: (site: { latitude?: number; longitude?: number; address: string }) => void;
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
  const [isDateDialogOpen, setIsDateDialogOpen] = useState(false);
  const [noteText, setNoteText] = useState(currentNote);
  const [relanceDate, setRelanceDate] = useState('');
  const [pendingField, setPendingField] = useState<'aRevoir' | 'rdv' | 'aRappeler' | null>(null);

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

  const handleActionClick = (field: keyof VisiteStatus) => {
    const currentValue = visiteStatus[field] || false;
    
    if (currentValue) {
      // If already active, toggle off
      onVisiteChange(site.id, field, false);
      return;
    }

    // For visite, use today's date automatically
    if (field === 'visite') {
      const today = new Date().toISOString();
      onVisiteChange(site.id, field, true, today);
      return;
    }

    // For RDV, À revoir, À rappeler - ask for date
    setPendingField(field as 'aRevoir' | 'rdv' | 'aRappeler');
    // Default to tomorrow for relance, next week for RDV
    const defaultDate = new Date();
    if (field === 'rdv') {
      defaultDate.setDate(defaultDate.getDate() + 7);
    } else {
      defaultDate.setDate(defaultDate.getDate() + 1);
    }
    setRelanceDate(defaultDate.toISOString().slice(0, 16));
    setIsDateDialogOpen(true);
  };

  const handleConfirmDate = () => {
    if (pendingField && relanceDate) {
      onVisiteChange(site.id, pendingField, true, relanceDate);
    }
    setIsDateDialogOpen(false);
    setPendingField(null);
    setRelanceDate('');
  };

  const handleCancelDate = () => {
    setIsDateDialogOpen(false);
    setPendingField(null);
    setRelanceDate('');
  };

  const hasNote = currentNote && currentNote.trim().length > 0;

  const getDialogTitle = () => {
    switch (pendingField) {
      case 'rdv': return 'Planifier le RDV';
      case 'aRevoir': return 'Planifier la revisite';
      case 'aRappeler': return 'Planifier le rappel';
      default: return 'Planifier';
    }
  };

  const getDialogColor = () => {
    switch (pendingField) {
      case 'rdv': return 'text-purple-400';
      case 'aRevoir': return 'text-orange-400';
      case 'aRappeler': return 'text-blue-400';
      default: return 'text-accent';
    }
  };

  const getButtonColor = () => {
    switch (pendingField) {
      case 'rdv': return 'bg-purple-500 hover:bg-purple-600';
      case 'aRevoir': return 'bg-orange-500 hover:bg-orange-600';
      case 'aRappeler': return 'bg-blue-500 hover:bg-blue-600';
      default: return 'bg-accent hover:bg-accent/90';
    }
  };

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        className={`p-3 sm:p-4 rounded-xl border transition-colors ${
          isDragging 
            ? 'bg-accent/20 border-accent shadow-lg' 
            : 'bg-card/50 border-border/50 hover:border-accent/30'
        }`}
      >
        <div className="flex items-start gap-3">
          {/* Drag handle */}
          <button
            {...attributes}
            {...listeners}
            className="mt-1 cursor-grab active:cursor-grabbing touch-none p-1 rounded hover:bg-accent/10 shrink-0"
          >
            <GripVertical className="w-4 h-4 text-muted-foreground" />
          </button>

          {/* Index badge */}
          <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
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
            <div className="font-semibold text-sm sm:text-base leading-tight">{site.nom}</div>
            <div className="text-xs sm:text-sm text-muted-foreground leading-tight mt-0.5 line-clamp-1">{site.address}</div>
            
            {/* Action buttons - Row 1: Status (Visité, RDV, À revoir, À rappeler) */}
            <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleActionClick('visite')}
                className={`h-7 sm:h-8 px-2 sm:px-3 text-[11px] sm:text-xs font-medium transition-all ${
                  visiteStatus.visite
                    ? 'bg-green-500/20 border-green-500 text-green-400 hover:bg-green-500/30'
                    : 'border-green-500/30 text-green-400 hover:bg-green-500/10 hover:border-green-500'
                }`}
              >
                <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1" />
                Visité
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handleActionClick('rdv')}
                className={`h-7 sm:h-8 px-2 sm:px-3 text-[11px] sm:text-xs font-medium transition-all ${
                  visiteStatus.rdv
                    ? 'bg-purple-500/20 border-purple-500 text-purple-400 hover:bg-purple-500/30'
                    : 'border-purple-500/30 text-purple-400 hover:bg-purple-500/10 hover:border-purple-500'
                }`}
              >
                <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1" />
                RDV
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handleActionClick('aRevoir')}
                className={`h-7 sm:h-8 px-2 sm:px-3 text-[11px] sm:text-xs font-medium transition-all ${
                  visiteStatus.aRevoir
                    ? 'bg-orange-500/20 border-orange-500 text-orange-400 hover:bg-orange-500/30'
                    : 'border-orange-500/30 text-orange-400 hover:bg-orange-500/10 hover:border-orange-500'
                }`}
              >
                <Eye className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1" />
                À revoir
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handleActionClick('aRappeler')}
                className={`h-7 sm:h-8 px-2 sm:px-3 text-[11px] sm:text-xs font-medium transition-all ${
                  visiteStatus.aRappeler
                    ? 'bg-blue-500/20 border-blue-500 text-blue-400 hover:bg-blue-500/30'
                    : 'border-blue-500/30 text-blue-400 hover:bg-blue-500/10 hover:border-blue-500'
                }`}
              >
                <Phone className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1" />
                À rappeler
              </Button>
            </div>

            {/* Action buttons - Row 2: Utilities */}
            <div className="flex flex-wrap gap-2 mt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleOpenNote}
                className={`h-8 px-3 text-xs font-medium transition-all ${
                  hasNote
                    ? 'bg-yellow-500/20 border-yellow-500 text-yellow-400 hover:bg-yellow-500/30'
                    : 'border-border text-muted-foreground hover:text-yellow-400 hover:border-yellow-500/50'
                }`}
              >
                <FileText className="w-3.5 h-3.5 mr-1.5" />
                Note
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => onNavigate(site)}
                className="h-8 px-3 text-xs font-medium border-border text-muted-foreground hover:text-accent hover:border-accent/50"
              >
                <Navigation className="w-3.5 h-3.5 mr-1.5" />
                GPS
              </Button>

              {onRemove && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onRemove(site.id)}
                  className="h-8 w-8 p-0 border-border text-muted-foreground hover:text-destructive hover:border-destructive/50"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              )}
            </div>

            {/* Note preview */}
            {hasNote && (
              <div className="mt-2 text-xs text-yellow-400/80 flex items-center gap-1 bg-yellow-500/10 px-2 py-1 rounded">
                <FileText className="w-3 h-3 shrink-0" />
                <span className="truncate">{currentNote.substring(0, 50)}{currentNote.length > 50 ? '...' : ''}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Note Dialog */}
      <Dialog open={isNoteDialogOpen} onOpenChange={setIsNoteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-yellow-400" />
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
              className="bg-yellow-500 hover:bg-yellow-600 text-black"
            >
              <Check className="w-4 h-4 mr-1" />
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Date Picker Dialog */}
      <Dialog open={isDateDialogOpen} onOpenChange={setIsDateDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className={`flex items-center gap-2 ${getDialogColor()}`}>
              {pendingField === 'rdv' && <Calendar className="w-5 h-5" />}
              {pendingField === 'aRevoir' && <Eye className="w-5 h-5" />}
              {pendingField === 'aRappeler' && <Phone className="w-5 h-5" />}
              {getDialogTitle()}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <p className="text-sm text-muted-foreground">
              Pour <span className="font-semibold text-foreground">{site.nom}</span>
            </p>
            <div className="space-y-2">
              <Label htmlFor="relance-date">
                {pendingField === 'rdv' ? 'Date et heure du RDV' : 'Date de relance'}
              </Label>
              <Input
                id="relance-date"
                type="datetime-local"
                value={relanceDate}
                onChange={(e) => setRelanceDate(e.target.value)}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                📅 Cette relance apparaîtra dans vos notifications (🔔) à la date choisie
              </p>
            </div>
          </div>
          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleCancelDate}
            >
              <X className="w-4 h-4 mr-1" />
              Annuler
            </Button>
            <Button
              onClick={handleConfirmDate}
              disabled={!relanceDate}
              className={getButtonColor()}
            >
              <Check className="w-4 h-4 mr-1" />
              Confirmer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
