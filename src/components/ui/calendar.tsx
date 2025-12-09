import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({ className, classNames, showOutsideDays = true, ...props }: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-2 pointer-events-auto", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-2 sm:space-x-2 sm:space-y-0",
        month: "space-y-2",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-bold text-cyan-electric",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          "h-7 w-7 bg-cyan-electric/10 hover:bg-cyan-electric/20 border border-cyan-electric/30 rounded-md p-0 transition-all hover:shadow-[0_0_10px_rgba(34,211,238,0.3)]",
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-0.5 mt-2",
        head_row: "flex",
        head_cell: "text-cyan-electric/70 rounded-md w-8 h-7 font-medium text-[10px] uppercase pointer-events-none",
        row: "flex w-full mt-0.5",
        cell: "h-8 w-8 text-center text-xs p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-cyan-electric/20 [&:has([aria-selected])]:bg-cyan-electric/10 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day: cn(
          "h-8 w-8 p-0 font-medium text-xs rounded-md hover:bg-cyan-electric/10 hover:text-cyan-electric transition-all hover:shadow-[0_0_8px_rgba(34,211,238,0.2)] aria-selected:opacity-100"
        ),
        day_range_end: "day-range-end",
        day_selected:
          "bg-gradient-to-br from-cyan-electric to-cyan-glow text-navy-deep hover:from-cyan-glow hover:to-cyan-electric focus:from-cyan-electric focus:to-cyan-glow shadow-[0_0_15px_rgba(34,211,238,0.5)] font-bold",
        day_today: "bg-cyan-electric/20 text-cyan-electric border border-cyan-electric/40 font-medium",
        day_outside:
          "day-outside text-muted-foreground/40 opacity-50 aria-selected:bg-cyan-electric/10 aria-selected:text-muted-foreground aria-selected:opacity-30",
        day_disabled: "text-muted-foreground/30 opacity-30 line-through",
        day_range_middle: "aria-selected:bg-cyan-electric/20 aria-selected:text-cyan-electric",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ ..._props }) => <ChevronLeft className="h-3 w-3" />,
        IconRight: ({ ..._props }) => <ChevronRight className="h-3 w-3" />,
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
