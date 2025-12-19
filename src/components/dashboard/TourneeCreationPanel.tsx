import { useState } from "react";
import { Route, Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { AddressSearchInput } from "./AddressSearchInput";

interface TourneeCreationPanelProps {
  onCreateTournee: () => void;
  tourneeActive: boolean;
  tourneeName: string;
  setTourneeName: (name: string) => void;
  tourneeDate: string;
  setTourneeDate: (date: string) => void;
  selectedCount: number;
  onOptimize: () => void;
  startAddress?: string;
  startLat?: number;
  startLng?: number;
  onStartPointChange?: (address: string, lat: number, lng: number) => void;
}

export const TourneeCreationPanel = ({
  onCreateTournee,
  tourneeActive,
  tourneeName,
  setTourneeName,
  tourneeDate,
  setTourneeDate,
  selectedCount,
  onOptimize,
  startAddress,
  startLat,
  startLng,
  onStartPointChange
}: TourneeCreationPanelProps) => {
  return (
    <div className="glass-card border border-accent/30 p-4 space-y-4 rounded-xl shadow-lg">
      <Button
        onClick={onCreateTournee}
        variant={tourneeActive ? "default" : "outline"}
        className={`w-full ${
          tourneeActive 
            ? "bg-gradient-to-r from-accent to-accent/80 hover:shadow-md hover:shadow-accent/30 text-primary" 
            : "border-accent/30 hover:bg-accent/10 hover:border-accent/50"
        } transition-all`}
        size="sm"
      >
        <Route className="w-4 h-4 mr-2" />
        {tourneeActive ? "Mode tournée actif" : "Créer une tournée"}
      </Button>
      
      {tourneeActive && (
        <div className="space-y-3 p-3 bg-gradient-to-br from-accent/10 via-accent/5 to-transparent rounded-lg border border-accent/30 shadow-sm">
          <div className="space-y-2">
            <Label htmlFor="tournee-name" className="text-xs font-semibold text-accent">Nom de la tournée</Label>
            <Input
              id="tournee-name"
              placeholder="Ex: Tournée Sud"
              value={tourneeName}
              onChange={(e) => setTourneeName(e.target.value)}
              className="h-9 text-sm border-accent/30 focus:border-accent focus:ring-accent/20"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tournee-date" className="text-xs font-semibold text-accent">Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full h-9 text-sm justify-start text-left font-normal border-accent/30 hover:bg-accent/10 hover:border-accent/50"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {tourneeDate ? format(new Date(tourneeDate), "dd/MM/yyyy") : "Choisir une date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={tourneeDate ? new Date(tourneeDate) : undefined}
                  onSelect={(date) => setTourneeDate(date ? format(date, "yyyy-MM-dd") : "")}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          
          {/* Point de départ */}
          {onStartPointChange && (
            <AddressSearchInput
              onAddressSelect={onStartPointChange}
              selectedAddress={startAddress}
              selectedLat={startLat}
              selectedLng={startLng}
            />
          )}
          
          {selectedCount > 0 && (
            <div className="text-xs bg-accent/10 text-accent font-semibold rounded-lg px-3 py-2 border border-accent/20">
              {selectedCount} entreprise(s) sélectionnée(s)
            </div>
          )}
          <Button
            onClick={onOptimize}
            disabled={selectedCount < 2}
            className="w-full h-9 text-xs bg-gradient-to-r from-accent via-accent to-accent/80 transition-colors"
            size="sm"
          >
            <Route className="w-3.5 h-3.5 mr-2" />
            Optimiser la tournée
          </Button>
        </div>
      )}
    </div>
  );
};

