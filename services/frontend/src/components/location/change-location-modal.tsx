"use client"

import { useState, useTransition } from "react"
import dynamic from "next/dynamic"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Location01Icon,
  Search01Icon,
  ArrowDown01Icon,
} from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { geocode, reverseGeocode } from "@/lib/geocode"
import { RADIUS_OPTIONS, type SearchLocation } from "@/lib/location"

// Leaflet touches window — load the picker client-only (Next 16: ssr:false must
// live in a Client Component, which this is).
const LocationPicker = dynamic(
  () => import("@/components/map/location-picker").then((m) => m.LocationPicker),
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full animate-pulse bg-muted" aria-hidden />
    ),
  }
)

export function ChangeLocationModal({
  location,
  onApply,
}: {
  location: SearchLocation
  onApply: (next: SearchLocation) => void
}) {
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState(location)
  const [query, setQuery] = useState("")
  const [notFound, setNotFound] = useState(false)
  const [searching, startSearch] = useTransition()

  // Reset the draft to the committed location whenever the dialog opens.
  function onOpenChange(next: boolean) {
    if (next) {
      setDraft(location)
      setQuery("")
      setNotFound(false)
    }
    setOpen(next)
  }

  function runSearch(event: React.FormEvent) {
    event.preventDefault()
    setNotFound(false)
    startSearch(async () => {
      const place = await geocode(query)
      if (!place) {
        setNotFound(true)
        return
      }
      setDraft((current) => ({
        ...current,
        latitude: place.latitude,
        longitude: place.longitude,
        label: place.label,
      }))
    })
  }

  // Pin dragged/clicked → keep coords, refresh the label from a reverse lookup.
  function onPointChange(latitude: number, longitude: number) {
    setDraft((current) => ({ ...current, latitude, longitude }))
    reverseGeocode(latitude, longitude).then((label) => {
      if (label) setDraft((current) => ({ ...current, label }))
    })
  }

  function apply() {
    onApply(draft)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger
        className="inline-flex max-w-[60vw] items-center gap-2 rounded-full border bg-card py-1.5 pl-3 pr-2.5 text-sm font-medium shadow-sm transition-colors hover:bg-accent"
      >
        <HugeiconsIcon icon={Location01Icon} className="text-primary" />
        <span className="truncate">{location.label}</span>
        <span className="font-mono text-xs text-muted-foreground">
          {location.radiusKm} km
        </span>
        <HugeiconsIcon icon={ArrowDown01Icon} className="text-muted-foreground" />
      </DialogTrigger>

      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Change location</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Search by city, neighborhood or postal code.
          </p>
        </DialogHeader>

        <form onSubmit={runSearch} className="flex flex-col gap-2">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <HugeiconsIcon
                icon={Search01Icon}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Toronto, Ontario"
                aria-label="Search location"
                className="pl-9"
              />
            </div>
            <Button type="submit" variant="outline" disabled={searching || !query.trim()}>
              {searching ? "Searching…" : "Search"}
            </Button>
          </div>
          {notFound ? (
            <p className="text-xs text-destructive">
              No match for “{query}”. Try a city or postal code.
            </p>
          ) : null}
        </form>

        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-muted-foreground">Radius</span>
          <select
            value={draft.radiusKm}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                radiusKm: Number(event.target.value),
              }))
            }
            className="h-9 rounded-md border bg-background px-3 text-sm"
          >
            {RADIUS_OPTIONS.map((km) => (
              <option key={km} value={km}>
                {km} kilometers
              </option>
            ))}
          </select>
        </label>

        <div className="h-64 overflow-hidden rounded-lg border">
          <LocationPicker
            latitude={draft.latitude}
            longitude={draft.longitude}
            radiusKm={draft.radiusKm}
            onChange={onPointChange}
          />
        </div>

        <div className="flex items-center justify-between gap-2">
          <span className="truncate text-sm text-muted-foreground">
            {draft.label}
          </span>
          <div className="flex gap-2">
            <DialogClose
              render={(props) => (
                <Button {...props} variant="ghost">
                  Cancel
                </Button>
              )}
            />
            <Button onClick={apply}>Apply</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
