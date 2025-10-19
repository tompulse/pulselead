import { Phone } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PhoneButtonProps {
  phoneNumber?: string;
  entrepriseName: string;
  onClick?: () => void;
  size?: "sm" | "lg";
}

export const PhoneButton = ({ phoneNumber, entrepriseName, onClick, size = "sm" }: PhoneButtonProps) => {
  if (!phoneNumber) {
    if (size === "lg") {
      return (
        <Button
          variant="outline"
          size="lg"
          disabled
          className="w-full opacity-50 cursor-not-allowed"
        >
          <Phone className="w-5 h-5 mr-2" />
          Numéro de téléphone non disponible
        </Button>
      );
    }
    
    return (
      <Button
        variant="outline"
        size="sm"
        disabled
        className="flex-1 opacity-30 cursor-not-allowed"
      >
        <Phone className="w-4 h-4" />
      </Button>
    );
  }

  if (size === "lg") {
    return (
      <Button
        asChild
        variant="default"
        size="lg"
        className="w-full bg-green-500 hover:bg-green-600 text-white border-green-600 transition-all group"
        onClick={(e: React.MouseEvent) => {
          e.stopPropagation();
          onClick?.();
        }}
      >
        <a href={`tel:${phoneNumber}`} className="flex items-center justify-center">
          <Phone className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
          <span className="font-medium">Appeler {phoneNumber}</span>
        </a>
      </Button>
    );
  }

  return (
    <Button
      asChild
      variant="outline"
      size="sm"
      className="flex-1 border-green-500/30 hover:bg-green-500/10 hover:border-green-500 text-green-600 hover:text-green-600 transition-all group"
      onClick={(e: React.MouseEvent) => {
        e.stopPropagation();
        onClick?.();
      }}
    >
      <a href={`tel:${phoneNumber}`} className="flex items-center justify-center">
        <Phone className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
        Appeler
      </a>
    </Button>
  );
};
