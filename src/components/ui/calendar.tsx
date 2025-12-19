import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";
import { fr } from "date-fns/locale";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({ className, classNames, showOutsideDays = true, ...props }: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      locale={fr}
      weekStartsOn={1}
      className={cn("p-3 pointer-events-auto", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-3 sm:space-x-3 sm:space-y-0",
        month: "space-y-3",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-bold text-cyan-electric capitalize",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          "h-8 w-8 bg-cyan-electric/15 hover:bg-cyan-electric/30 border border-cyan-electric/40 rounded-lg p-0 transition-all hover:shadow-[0_0_12px_rgba(34,211,238,0.4)] flex items-center justify-center text-cyan-electric",
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1 mt-3",
        head_row: "flex",
        head_cell: "text-cyan-electric/80 rounded-md w-9 h-8 font-semibold text-[11px] uppercase pointer-events-none flex items-center justify-center",
        row: "flex w-full mt-1",
        cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-cyan-electric/20 [&:has([aria-selected])]:bg-cyan-electric/10 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day: cn(
          "h-9 w-9 p-0 font-medium text-sm rounded-lg hover:bg-cyan-electric/15 hover:text-cyan-electric transition-all hover:shadow-[0_0_8px_rgba(34,211,238,0.2)] aria-selected:opacity-100"
        ),
        day_range_end: "day-range-end",
        day_selected:
          "bg-gradient-to-br from-cyan-electric to-cyan-glow text-navy-deep hover:from-cyan-glow hover:to-cyan-electric focus:from-cyan-electric focus:to-cyan-glow shadow-[0_0_15px_rgba(34,211,238,0.5)] font-bold",
        day_today: "bg-cyan-electric/20 text-cyan-electric border border-cyan-electric/50 font-semibold",
        day_outside:
          "day-outside text-muted-foreground/40 opacity-50 aria-selected:bg-cyan-electric/10 aria-selected:text-muted-foreground aria-selected:opacity-30",
        day_disabled: "text-muted-foreground/30 opacity-30 line-through",
        day_range_middle: "aria-selected:bg-cyan-electric/20 aria-selected:text-cyan-electric",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ ..._props }) => <ChevronLeft className="h-4 w-4 stroke-[2.5]" />,
        IconRight: ({ ..._props }) => <ChevronRight className="h-4 w-4 stroke-[2.5]" />,
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
