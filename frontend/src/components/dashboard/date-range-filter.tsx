"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarDays } from "lucide-react";
import { useState } from "react";
import type { DateRange } from "react-day-picker";

interface DateRangeFilterProps {
  value: DateRange | undefined;
  onChange: (value: DateRange | undefined) => void;
  className?: string;
}

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

const formatDateLabel = (date: Date | undefined, placeholder: string) =>
  date ? dateFormatter.format(date) : placeholder;

export function DateRangeFilter({
  value,
  onChange,
  className,
}: DateRangeFilterProps) {
  const [fromOpen, setFromOpen] = useState(false);
  const [toOpen, setToOpen] = useState(false);

  const handleFromSelect = (from: Date | undefined) => {
    if (!from) {
      onChange(value?.to ? { from: undefined, to: value.to } : undefined);
      return;
    }

    if (value?.to && from > value.to) {
      onChange({ from, to: from });
      return;
    }

    onChange({ from, to: value?.to });
  };

  const handleToSelect = (to: Date | undefined) => {
    if (!to) {
      onChange(value?.from ? { from: value.from, to: undefined } : undefined);
      return;
    }

    if (value?.from && to < value.from) {
      onChange({ from: to, to });
      return;
    }

    onChange({ from: value?.from, to });
  };

  const clearDisabled = !value?.from && !value?.to;

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <Popover open={fromOpen} onOpenChange={setFromOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className={cn(
              "min-w-42.5 justify-start text-left font-normal",
              !value?.from && "text-muted-foreground",
            )}
          >
            <CalendarDays className="size-4" />
            Inicio: {formatDateLabel(value?.from, "selecionar")}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <Calendar
            mode="single"
            selected={value?.from}
            onSelect={(date) => {
              handleFromSelect(date);
              if (date) {
                setFromOpen(false);
              }
            }}
            initialFocus
          />
        </PopoverContent>
      </Popover>

      <Popover open={toOpen} onOpenChange={setToOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className={cn(
              "min-w-42.5 justify-start text-left font-normal",
              !value?.to && "text-muted-foreground",
            )}
          >
            <CalendarDays className="size-4" />
            Fim: {formatDateLabel(value?.to, "selecionar")}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <Calendar
            mode="single"
            selected={value?.to}
            onSelect={(date) => {
              handleToSelect(date);
              if (date) {
                setToOpen(false);
              }
            }}
            initialFocus
          />
        </PopoverContent>
      </Popover>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => onChange(undefined)}
        disabled={clearDisabled}
      >
        Limpar
      </Button>
    </div>
  );
}
