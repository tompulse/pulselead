import * as React from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DatePickerProps {
  date: Date | undefined;
  onSelect: (date: Date | undefined) => void;
  placeholder?: string;
  className?: string;
}

export function DatePicker({ date, onSelect, placeholder = "Sélectionner une date", className }: DatePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal h-9 border-cyan-electric/30 bg-navy-deep/50 hover:bg-cyan-electric/10 hover:border-cyan-electric/50 transition-all hover:shadow-[0_0_15px_rgba(34,211,238,0.2)]",
            !date && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4 text-cyan-electric" />
          {date ? (
            <span className="text-foreground">{format(date, "dd/MM/yyyy", { locale: fr })}</span>
          ) : (
            <span>{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-auto p-0 bg-navy-deep border-cyan-electric/30 shadow-[0_0_30px_rgba(34,211,238,0.3)]" 
        align="start"
      >
        <Calendar
          mode="single"
          selected={date}
          onSelect={onSelect}
          initialFocus
          locale={fr}
          className="pointer-events-auto rounded-lg"
        />
      </PopoverContent>
    </Popover>
  );
}
