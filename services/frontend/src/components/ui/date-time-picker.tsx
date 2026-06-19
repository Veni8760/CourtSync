"use client"

import { useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { Calendar03Icon } from "@hugeicons/core-free-icons"

import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// Value in/out is the same local "YYYY-MM-DDTHH:mm" string that <input
// type="datetime-local"> produced, so the zod schema + server action are unchanged —
// this is purely a shadcn-consistent replacement for the native picker's popup.

type DateTimePickerProps = {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  id?: string
  "aria-invalid"?: boolean
}

const HOURS = Array.from({ length: 12 }, (_, i) => i + 1) // 1..12
const MINUTES = Array.from({ length: 12 }, (_, i) => i * 5) // 0,5,..,55

const pad = (n: number) => String(n).padStart(2, "0")

function toValue(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours()
  )}:${pad(date.getMinutes())}`
}

const displayFormat = new Intl.DateTimeFormat("en-CA", {
  weekday: "short",
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
})

export function DateTimePicker({
  value,
  onChange,
  disabled,
  id,
  "aria-invalid": ariaInvalid,
}: DateTimePickerProps) {
  const [open, setOpen] = useState(false)
  const date = value ? new Date(value) : undefined
  const valid = date && !Number.isNaN(date.getTime())

  const h24 = valid ? date.getHours() : 18 // default 6:00 PM
  const minute = valid ? Math.floor(date.getMinutes() / 5) * 5 : 0
  const ampm = h24 >= 12 ? "PM" : "AM"
  const hour12 = ((h24 + 11) % 12) + 1

  function emit(day: Date, hour: number, min: number, period: string) {
    const next = new Date(day)
    const hh = (hour % 12) + (period === "PM" ? 12 : 0)
    next.setHours(hh, min, 0, 0)
    onChange(toValue(next))
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        id={id}
        disabled={disabled}
        aria-invalid={ariaInvalid}
        className={cn(
          "flex h-9 w-full items-center justify-between gap-2 rounded-md border border-input bg-input/20 px-3 text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20",
          !valid && "text-muted-foreground"
        )}
      >
        {valid ? displayFormat.format(date) : "Pick date & time"}
        <HugeiconsIcon icon={Calendar03Icon} className="text-muted-foreground" />
      </PopoverTrigger>

      <PopoverContent className="flex flex-col gap-3">
        <Calendar
          mode="single"
          selected={valid ? date : undefined}
          onSelect={(day) => day && emit(day, hour12, minute, ampm)}
          autoFocus
        />
        <div className="flex items-center gap-2 border-t pt-3">
          <TimeSelect
            label="Hour"
            value={String(hour12)}
            options={HOURS.map((h) => ({ value: String(h), label: String(h) }))}
            onChange={(v) => emit(date ?? new Date(), Number(v), minute, ampm)}
          />
          <span className="text-muted-foreground">:</span>
          <TimeSelect
            label="Minute"
            value={String(minute)}
            options={MINUTES.map((m) => ({ value: String(m), label: pad(m) }))}
            onChange={(v) => emit(date ?? new Date(), hour12, Number(v), ampm)}
          />
          <TimeSelect
            label="AM/PM"
            value={ampm}
            options={[
              { value: "AM", label: "AM" },
              { value: "PM", label: "PM" },
            ]}
            onChange={(v) => emit(date ?? new Date(), hour12, minute, v)}
          />
        </div>
      </PopoverContent>
    </Popover>
  )
}

function TimeSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string
  options: { value: string; label: string }[]
  onChange: (value: string) => void
}) {
  return (
    <Select
      value={value}
      onValueChange={(v) => v && onChange(v)}
      items={options}
    >
      <SelectTrigger className="h-8 flex-1" aria-label={label}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}
