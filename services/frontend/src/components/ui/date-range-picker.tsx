"use client"

import { useState } from "react"
import type { DateRange } from "react-day-picker"
import { HugeiconsIcon } from "@hugeicons/react"
import { Calendar03Icon } from "@hugeicons/core-free-icons"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

// Emits react-day-picker's DateRange (from/to as local Date at midnight). The caller
// decides how to serialize — /find turns it into start-of-from-day / end-of-to-day
// ISO instants for the search API's inclusive from<=start<=to window.

type DateRangePickerProps = {
  value: DateRange | undefined
  onChange: (value: DateRange | undefined) => void
  className?: string
  "aria-label"?: string
}

const label = new Intl.DateTimeFormat("en-CA", { month: "short", day: "numeric" })

function formatRange(range: DateRange | undefined) {
  if (!range?.from) return "Any date"
  if (!range.to) return label.format(range.from)
  return `${label.format(range.from)} – ${label.format(range.to)}`
}

export function DateRangePicker({
  value,
  onChange,
  className,
  "aria-label": ariaLabel = "Date range",
}: DateRangePickerProps) {
  const [open, setOpen] = useState(false)
  const selected = Boolean(value?.from)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        aria-label={ariaLabel}
        className={cn(
          "flex h-9 items-center justify-between gap-2 rounded-md border border-input bg-input/20 px-3 text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30",
          !selected && "text-muted-foreground",
          className
        )}
      >
        {formatRange(value)}
        <HugeiconsIcon icon={Calendar03Icon} className="text-muted-foreground" />
      </PopoverTrigger>

      <PopoverContent className="flex w-auto flex-col gap-3">
        <Calendar
          mode="range"
          selected={value}
          onSelect={onChange}
          numberOfMonths={1}
          autoFocus
        />
        {selected ? (
          <Button
            variant="ghost"
            size="sm"
            className="self-end"
            onClick={() => {
              onChange(undefined)
              setOpen(false)
            }}
          >
            Clear dates
          </Button>
        ) : null}
      </PopoverContent>
    </Popover>
  )
}
