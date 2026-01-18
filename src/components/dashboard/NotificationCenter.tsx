import { useState, useMemo } from 'react';
import { Bell, BellRing, Calendar, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNotifications } from '@/hooks/useNotifications';
import { format, isToday, isTomorrow, parseISO, startOfDay } from 'date-fns';
import { fr } from 'date-fns/locale';

interface NotificationCenterProps {
  userId: string;
  onSelectEntreprise?: (entrepriseId: string) => void;
}

export const NotificationCenter = ({ userId, onSelectEntreprise }: NotificationCenterProps) => {
  const [open, setOpen] = useState(false);
  const { 
    reminders, 
    isLoading, 
    todayReminders,
    deleteReminder,
  } = useNotifications(userId);

  // Group reminders by date
  const groupedReminders = useMemo(() => {
    const groups: Record<string, typeof reminders> = {};
    
    reminders.forEach(reminder => {
      const dateKey = startOfDay(parseISO(reminder.date_relance)).toISOString();
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(reminder);
    });

    // Sort by date and return as array of [dateKey, reminders]
    return Object.entries(groups).sort(([a], [b]) => 
      new Date(a).getTime() - new Date(b).getTime()
    );
  }, [reminders]);

  const formatDateHeader = (dateStr: string) => {
    const date = parseISO(dateStr);
    if (isToday(date)) return "📅 Aujourd'hui";
    if (isTomorrow(date)) return '📅 Demain';
    return format(date, "📅 EEEE d MMMM", { locale: fr });
  };

  const handleReminderClick = (entrepriseId: string) => {
    if (onSelectEntreprise) {
      onSelectEntreprise(entrepriseId);
      setOpen(false);
    }
  };

  const handleDeleteReminder = async (e: React.MouseEvent, reminderId: string) => {
    e.stopPropagation(); // Prevent triggering the parent button click
    await deleteReminder(reminderId);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label="Relances à venir"
        >
          {todayReminders.length > 0 ? (
            <>
              <BellRing className="h-5 w-5 text-accent animate-pulse" />
              <Badge 
                className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-red-500 text-white text-xs"
              >
                {todayReminders.length}
              </Badge>
            </>
          ) : (
            <Bell className="h-5 w-5" />
          )}
        </Button>
      </SheetTrigger>
      
      <SheetContent side="right" className="w-[350px] sm:w-[400px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-accent" />
            Relances à venir
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6">
          <ScrollArea className="h-[calc(100vh-120px)]">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin w-6 h-6 border-2 border-accent border-t-transparent rounded-full" />
              </div>
            ) : reminders.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="font-medium">Aucune relance programmée</p>
                <p className="text-sm mt-1">
                  Cochez "À revoir" ou "À rappeler" sur un prospect pour planifier une relance
                </p>
              </div>
            ) : (
              <div className="space-y-6 pr-4">
                {groupedReminders.map(([dateKey, dateReminders]) => (
                  <div key={dateKey} className="space-y-3">
                    {/* Date header */}
                    <div className={`text-sm font-semibold capitalize sticky top-0 bg-background py-2 ${
                      isToday(parseISO(dateKey)) 
                        ? 'text-red-400' 
                        : isTomorrow(parseISO(dateKey))
                          ? 'text-orange-400'
                          : 'text-accent'
                    }`}>
                      {formatDateHeader(dateKey)}
                      <span className="ml-2 text-xs font-normal text-muted-foreground">
                        ({dateReminders.length} relance{dateReminders.length > 1 ? 's' : ''})
                      </span>
                    </div>
                    
                    {/* Reminders for this date */}
                    {dateReminders.map((reminder) => (
                      <div
                        key={reminder.id}
                        className={`relative w-full text-left p-3 rounded-xl border transition-all group ${
                          isToday(parseISO(reminder.date_relance))
                            ? 'bg-red-500/10 border-red-500/30 hover:border-red-500/50'
                            : 'bg-card/50 border-border/50 hover:border-accent/50'
                        } hover:bg-card`}
                      >
                        <button
                          onClick={() => handleReminderClick(reminder.entreprise_id)}
                          className="w-full text-left"
                        >
                          <div className="flex items-center justify-between gap-2 pr-6">
                            <p className="text-sm font-medium truncate flex-1 min-w-0 max-w-[160px] sm:max-w-[200px]">{reminder.entreprise_nom}</p>
                            <Badge 
                              variant="outline" 
                              className={`shrink-0 text-[10px] px-2 py-0.5 whitespace-nowrap ${
                                reminder.type === 'a_revoir'
                                  ? 'bg-orange-500/20 text-orange-400 border-orange-500/30'
                                  : reminder.type === 'a_rappeler'
                                    ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                                    : reminder.type === 'rdv'
                                      ? 'bg-purple-500/20 text-purple-400 border-purple-500/30'
                                      : 'bg-accent/10 text-accent border-accent/30'
                              }`}
                            >
                              {reminder.type === 'a_revoir' ? 'À revoir' 
                                : reminder.type === 'a_rappeler' ? 'À rappeler'
                                : reminder.type === 'rdv' ? 'RDV'
                                : reminder.type}
                            </Badge>
                          </div>
                        </button>
                        {/* Delete button */}
                        <button
                          onClick={(e) => handleDeleteReminder(e, reminder.id)}
                          className="absolute top-2 right-2 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/20 text-muted-foreground hover:text-destructive"
                          aria-label="Supprimer la relance"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  );
};
