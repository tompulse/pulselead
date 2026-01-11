import { useState } from 'react';
import { Bell, BellRing, Calendar, Check, X } from 'lucide-react';
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
import { format, isToday, isTomorrow, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

interface NotificationCenterProps {
  userId: string;
  onSelectEntreprise?: (entrepriseId: string) => void;
}

export const NotificationCenter = ({ userId, onSelectEntreprise }: NotificationCenterProps) => {
  const [open, setOpen] = useState(false);
  const { 
    permission, 
    reminders, 
    isLoading, 
    requestPermission,
    todayReminders,
  } = useNotifications(userId);

  const formatReminderDate = (dateStr: string) => {
    const date = parseISO(dateStr);
    if (isToday(date)) return "Aujourd'hui";
    if (isTomorrow(date)) return 'Demain';
    return format(date, 'EEEE d MMMM', { locale: fr });
  };

  const handleEnableNotifications = async () => {
    await requestPermission();
  };

  const handleReminderClick = (entrepriseId: string) => {
    if (onSelectEntreprise) {
      onSelectEntreprise(entrepriseId);
      setOpen(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label="Notifications"
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

        <div className="mt-6 space-y-4">
          {/* Notification Permission Banner */}
          {permission.isSupported && permission.permission !== 'granted' && (
            <div className="p-4 rounded-lg bg-accent/10 border border-accent/20 space-y-3">
              <div className="flex items-start gap-3">
                <BellRing className="h-5 w-5 text-accent mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Activez les notifications</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Recevez des rappels sur votre téléphone ou tablette pour ne jamais oublier une relance
                  </p>
                </div>
              </div>
              <Button 
                onClick={handleEnableNotifications}
                className="w-full bg-accent text-black hover:bg-accent/90"
                size="sm"
              >
                <Check className="h-4 w-4 mr-2" />
                Activer les notifications
              </Button>
            </div>
          )}

          {permission.permission === 'granted' && (
            <div className="flex items-center gap-2 text-xs text-green-500 bg-green-500/10 px-3 py-2 rounded-lg">
              <Check className="h-4 w-4" />
              Notifications activées
            </div>
          )}

          {/* Reminders List */}
          <ScrollArea className="h-[calc(100vh-250px)]">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin w-6 h-6 border-2 border-accent border-t-transparent rounded-full" />
              </div>
            ) : reminders.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="font-medium">Aucune relance programmée</p>
                <p className="text-sm mt-1">Planifiez vos relances depuis les fiches prospects</p>
              </div>
            ) : (
              <div className="space-y-3 pr-4">
                {reminders.map((reminder) => (
                  <button
                    key={reminder.id}
                    onClick={() => handleReminderClick(reminder.entreprise_id)}
                    className="w-full text-left p-4 rounded-xl bg-card/50 border border-border/50 hover:border-accent/50 hover:bg-card transition-all"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold truncate">{reminder.entreprise_nom}</p>
                        <p className="text-xs text-accent font-medium mt-1">
                          {formatReminderDate(reminder.date_relance)}
                        </p>
                        {reminder.notes && (
                          <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                            {reminder.notes}
                          </p>
                        )}
                      </div>
                      <Badge 
                        variant="outline" 
                        className={`shrink-0 ${
                          isToday(parseISO(reminder.date_relance)) 
                            ? 'bg-red-500/20 text-red-400 border-red-500/30' 
                            : 'bg-accent/10 text-accent border-accent/30'
                        }`}
                      >
                        {reminder.type}
                      </Badge>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  );
};
