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
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-semibold text-cyan-electric",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          "h-8 w-8 bg-cyan-electric/10 hover:bg-cyan-electric/20 border border-cyan-electric/30 rounded-lg p-0 transition-all hover:shadow-[0_0_15px_rgba(34,211,238,0.3)]",
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1 mt-2",
        head_row: "flex",
        head_cell: "text-cyan-electric/70 rounded-md w-10 font-semibold text-xs uppercase",
        row: "flex w-full mt-1",
        cell: "h-10 w-10 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-lg [&:has([aria-selected].day-outside)]:bg-cyan-electric/20 [&:has([aria-selected])]:bg-cyan-electric/10 first:[&:has([aria-selected])]:rounded-l-lg last:[&:has([aria-selected])]:rounded-r-lg focus-within:relative focus-within:z-20",
        day: cn(
          "h-10 w-10 p-0 font-medium rounded-lg hover:bg-cyan-electric/10 hover:text-cyan-electric transition-all hover:shadow-[0_0_10px_rgba(34,211,238,0.2)] aria-selected:opacity-100"
        ),
        day_range_end: "day-range-end",
        day_selected:
          "bg-gradient-to-br from-cyan-electric to-cyan-glow text-navy-deep hover:from-cyan-glow hover:to-cyan-electric focus:from-cyan-electric focus:to-cyan-glow shadow-[0_0_20px_rgba(34,211,238,0.5)] font-bold",
        day_today: "bg-cyan-electric/20 text-cyan-electric border border-cyan-electric/40 font-semibold",
        day_outside:
          "day-outside text-muted-foreground/40 opacity-50 aria-selected:bg-cyan-electric/10 aria-selected:text-muted-foreground aria-selected:opacity-30",
        day_disabled: "text-muted-foreground/30 opacity-30 line-through",
        day_range_middle: "aria-selected:bg-cyan-electric/20 aria-selected:text-cyan-electric",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ ..._props }) => <ChevronLeft className="h-4 w-4" />,
        IconRight: ({ ..._props }) => <ChevronRight className="h-4 w-4" />,
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
