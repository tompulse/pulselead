import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Navigation, Map } from 'lucide-react';

interface NavigationChoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  latitude?: number | null;
  longitude?: number | null;
  address: string;
}

const openInNewTab = (url: string) => window.open(url, '_blank', 'noopener,noreferrer');

const isIOS = () => /iPad|iPhone|iPod/i.test(navigator.userAgent);
const isAndroid = () => /Android/i.test(navigator.userAgent);
const isMobile = () => isIOS() || isAndroid();

export const NavigationChoiceDialog = ({
  open,
  onOpenChange,
  latitude,
  longitude,
  address,
}: NavigationChoiceDialogProps) => {
  const hasCoords = latitude != null && longitude != null;

  const openGoogleMaps = () => {
    if (hasCoords) {
      if (isMobile()) {
        // Try native app deep link first
        if (isIOS()) {
          openInNewTab(`comgooglemaps://?daddr=${latitude},${longitude}&directionsmode=driving`);
        } else if (isAndroid()) {
          openInNewTab(`google.navigation:q=${latitude},${longitude}`);
        }
        // Fallback to web
        setTimeout(() => {
          openInNewTab(`https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}&travelmode=driving`);
        }, 100);
      } else {
        openInNewTab(`https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}&travelmode=driving`);
      }
    } else {
      openInNewTab(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`);
    }
    onOpenChange(false);
  };

  const openWaze = () => {
    if (hasCoords) {
      if (isMobile()) {
        // Try native app deep link first
        openInNewTab(`waze://?ll=${latitude},${longitude}&navigate=yes`);
        // Fallback to web
        setTimeout(() => {
          openInNewTab(`https://waze.com/ul?ll=${latitude},${longitude}&navigate=yes`);
        }, 100);
      } else {
        openInNewTab(`https://waze.com/ul?ll=${latitude},${longitude}&navigate=yes`);
      }
    } else {
      openInNewTab(`https://waze.com/ul?q=${encodeURIComponent(address)}`);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[320px] p-0 gap-0 overflow-hidden">
        <DialogHeader className="p-4 pb-2">
          <DialogTitle className="text-center text-base">Ouvrir avec</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3 p-4 pt-2">
          <Button
            variant="outline"
            onClick={openGoogleMaps}
            className="flex flex-col items-center justify-center h-24 gap-2 hover:border-accent hover:bg-accent/10"
          >
            <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
              <Map className="w-6 h-6 text-blue-400" />
            </div>
            <span className="text-xs font-medium">Google Maps</span>
          </Button>
          <Button
            variant="outline"
            onClick={openWaze}
            className="flex flex-col items-center justify-center h-24 gap-2 hover:border-accent hover:bg-accent/10"
          >
            <div className="w-12 h-12 rounded-full bg-cyan-500/20 flex items-center justify-center">
              <Navigation className="w-6 h-6 text-cyan-400" />
            </div>
            <span className="text-xs font-medium">Waze</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
