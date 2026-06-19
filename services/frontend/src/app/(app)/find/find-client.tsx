"use client"

import { useEffect, useState, useTransition } from "react"
import dynamic from "next/dynamic"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Calendar03Icon,
  Cancel01Icon,
  Location01Icon,
  SlidersHorizontalIcon,
} from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ChangeLocationModal } from "@/components/location/change-location-modal"
import { reverseGeocode } from "@/lib/geocode"
import { RADIUS_OPTIONS, useSearchLocation, type SearchLocation } from "@/lib/location"
import { skillLevelOptions, surfaceOptions } from "@/lib/form-options"
import type { NearbyDropIn } from "@/lib/search"

import { findNearby, type NearbySearchState } from "./actions"

const DropInMap = dynamic(
  () => import("@/components/map/drop-in-map").then((m) => m.DropInMap),
  {
    ssr: false,
    loading: () => <div className="h-full w-full animate-pulse bg-muted" aria-hidden />,
  }
)

const dateFormatter = new Intl.DateTimeFormat("en-CA", {
  weekday: "short",
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
})

function formatPrice(price: number | null) {
  if (price == null) return null
  return price === 0 ? "Free" : `$${price.toFixed(2)}`
}

export function FindClient() {
  const { location, setLocation, ready } = useSearchLocation()
  const [skill, setSkill] = useState("")
  // ponytail: surface lives in client state only — the search read model doesn't
  // index surface yet, so it can't narrow server results. It's a real, styled
  // control today and starts filtering the moment the index carries surface.
  const [surface, setSurface] = useState("")
  const [maxPrice, setMaxPrice] = useState("")
  const [state, setState] = useState<NearbySearchState | { status: "idle" }>({
    status: "idle",
  })
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()
  const [locating, setLocating] = useState(false)
  const router = useRouter()

  // Re-query whenever the location or filters change (after the first client read
  // of the persisted location, so we don't fire against the SSR default first).
  useEffect(() => {
    if (!ready) return
    const filters = {
      skill: skill || undefined,
      maxPrice: maxPrice === "" ? undefined : Number(maxPrice),
    }
    startTransition(async () => {
      setState(
        await findNearby(location.latitude, location.longitude, location.radiusKm, filters)
      )
    })
  }, [ready, location.latitude, location.longitude, location.radiusKm, skill, maxPrice])

  function useMyLocation() {
    if (!("geolocation" in navigator)) return
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        const label = (await reverseGeocode(latitude, longitude)) ?? "Your location"
        setLocation({ ...location, latitude, longitude, label })
        setLocating(false)
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 10_000 }
    )
  }

  function applyLocation(next: SearchLocation) {
    setLocation(next)
  }

  const filtersActive = Boolean(skill || surface || maxPrice)
  function clearFilters() {
    setSkill("")
    setSurface("")
    setMaxPrice("")
  }

  const results = state.status === "ok" ? state.results : []
  const points = results.map((dropIn) => ({
    id: dropIn.id,
    latitude: dropIn.latitude,
    longitude: dropIn.longitude,
  }))

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="rounded-xl border bg-card/60 p-2.5">
        <div className="flex flex-wrap items-center gap-2">
          <ChangeLocationModal location={location} onApply={applyLocation} />
          <Button variant="outline" onClick={useMyLocation} disabled={locating}>
            <HugeiconsIcon icon={Location01Icon} data-icon="inline-start" />
            {locating ? "Locating…" : "Use my location"}
          </Button>

          <div className="ml-auto flex flex-wrap items-center gap-2">
            <span className="hidden items-center gap-1.5 pr-1 text-xs text-muted-foreground sm:flex">
              <HugeiconsIcon icon={SlidersHorizontalIcon} />
              Filters
            </span>
            <FilterSelect
              ariaLabel="Radius"
              className="w-24"
              value={String(location.radiusKm)}
              onValueChange={(value) =>
                setLocation({ ...location, radiusKm: Number(value) })
              }
              options={RADIUS_OPTIONS.map((km) => ({
                value: String(km),
                label: `${km} km`,
              }))}
            />
            <FilterSelect
              ariaLabel="Skill level"
              className="w-32"
              value={skill || "ANY"}
              onValueChange={(value) => setSkill(value === "ANY" ? "" : value)}
              options={[{ value: "ANY", label: "Any skill" }, ...skillLevelOptions]}
            />
            <FilterSelect
              ariaLabel="Surface"
              className="w-32"
              value={surface || "ANY"}
              onValueChange={(value) => setSurface(value === "ANY" ? "" : value)}
              options={[{ value: "ANY", label: "Any surface" }, ...surfaceOptions]}
            />
            <Input
              type="number"
              min={0}
              value={maxPrice}
              onChange={(event) => setMaxPrice(event.target.value)}
              placeholder="Max $"
              aria-label="Max price"
              className="h-9 w-24"
            />
            {filtersActive ? (
              <Button variant="ghost" onClick={clearFilters} aria-label="Clear filters">
                <HugeiconsIcon icon={Cancel01Icon} data-icon="inline-start" />
                Clear
              </Button>
            ) : null}
          </div>
        </div>

        {surface ? (
          <p className="mt-2 px-1 text-xs text-muted-foreground">
            Showing every surface for now — surface filtering lands with the next
            search-index update.
          </p>
        ) : null}
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="h-[44vh] overflow-hidden rounded-xl border lg:sticky lg:top-20 lg:h-[calc(100vh-7rem)]">
          <DropInMap
            center={{ latitude: location.latitude, longitude: location.longitude }}
            radiusKm={location.radiusKm}
            points={points}
            hoveredId={hoveredId}
            onHoverPoint={setHoveredId}
            onSelectPoint={(id) => router.push(`/drop-ins/${id}`)}
          />
        </div>

        <div>
          <div className="flex items-baseline justify-between gap-3">
            <h1 className="font-heading text-xl font-semibold">
              {pending
                ? "Searching…"
                : `${results.length} drop-in${results.length === 1 ? "" : "s"} within ${location.radiusKm} km`}
            </h1>
          </div>

          {/* Initial load (no results yet): skeleton cards instead of a blank list.
              A re-query that already has results keeps showing them — no flash. */}
          {pending && results.length === 0 ? <ResultsSkeleton /> : null}

          {!pending && state.status === "error" ? (
            <p className="mt-4 rounded-lg border bg-card p-4 text-sm text-destructive">
              {state.error}
            </p>
          ) : null}

          {!pending && state.status === "ok" && results.length === 0 ? (
            <p className="mt-4 rounded-lg border bg-card p-6 text-center text-sm text-muted-foreground">
              No drop-ins here yet. Try a wider radius or a different spot.
            </p>
          ) : null}

          {results.length > 0 ? (
            <ul className="mt-4 flex flex-col gap-3" aria-busy={pending}>
              {results.map((dropIn) => (
                <NearbyCard
                  key={dropIn.id}
                  dropIn={dropIn}
                  active={hoveredId === dropIn.id}
                  onHover={setHoveredId}
                />
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </div>
  )
}

function NearbyCard({
  dropIn,
  active,
  onHover,
}: {
  dropIn: NearbyDropIn
  active: boolean
  onHover: (id: string | null) => void
}) {
  const price = formatPrice(dropIn.price)
  return (
    <li onMouseEnter={() => onHover(dropIn.id)} onMouseLeave={() => onHover(null)}>
      <Link
        href={`/drop-ins/${dropIn.id}`}
        data-active={active}
        className="block rounded-lg border bg-card p-4 transition-colors hover:border-primary/50 data-[active=true]:border-rally data-[active=true]:bg-rally/5"
      >
        <div className="flex items-baseline justify-between gap-3">
          <span className="truncate font-medium text-foreground">
            {dropIn.title ?? "Drop-in"}
          </span>
          <span className="shrink-0 font-mono text-sm text-muted-foreground">
            {dropIn.distanceKm.toFixed(1)} km
          </span>
        </div>
        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
          {dropIn.city ? (
            <span className="flex items-center gap-1">
              <HugeiconsIcon icon={Location01Icon} />
              {dropIn.city}
            </span>
          ) : null}
          <span className="flex items-center gap-1">
            <HugeiconsIcon icon={Calendar03Icon} />
            {dateFormatter.format(new Date(dropIn.startTime))}
          </span>
          {price ? <span className="font-mono">{price}</span> : null}
          {dropIn.skillLevel ? <span>{dropIn.skillLevel}</span> : null}
        </div>
      </Link>
    </li>
  )
}

function ResultsSkeleton() {
  return (
    <ul className="mt-4 flex flex-col gap-3" aria-hidden>
      {[0, 1, 2].map((i) => (
        <li key={i} className="rounded-lg border bg-card p-4">
          <div className="flex items-baseline justify-between gap-3">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-12" />
          </div>
          <Skeleton className="mt-3 h-3 w-3/4" />
        </li>
      ))}
    </ul>
  )
}

function FilterSelect({
  ariaLabel,
  value,
  onValueChange,
  options,
  className,
}: {
  ariaLabel: string
  value: string
  onValueChange: (value: string) => void
  options: ReadonlyArray<{ value: string; label: string }>
  className?: string
}) {
  return (
    <Select
      value={value}
      onValueChange={(next) => next && onValueChange(next)}
      items={options as { value: string; label: string }[]}
    >
      <SelectTrigger className={`h-9 ${className ?? ""}`} aria-label={ariaLabel}>
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
