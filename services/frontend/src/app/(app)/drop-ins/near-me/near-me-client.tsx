"use client"

import { useState, useTransition } from "react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import type { NearbyDropIn } from "@/lib/search"

import { findNearby, type NearbySearchState } from "./actions"

const RADIUS_KM = 10

// Inlined (not imported from lib/dropins) so this client component doesn't pull
// the server-only data layer into the browser bundle.
function formatPrice(price: number) {
  return price === 0 ? "Free" : `$${price.toFixed(2)} CAD`
}

const dateFormatter = new Intl.DateTimeFormat("en-CA", {
  weekday: "short",
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
})

type Coords = { latitude: number; longitude: number }

export function NearMeClient() {
  const [state, setState] = useState<NearbySearchState>({ status: "idle" })
  const [locating, setLocating] = useState(false)
  const [pending, startTransition] = useTransition()
  const [coords, setCoords] = useState<Coords | null>(null)
  const [skill, setSkill] = useState("")
  const [maxPrice, setMaxPrice] = useState("")
  const busy = locating || pending

  function runSearch(at: Coords, nextSkill: string, nextMaxPrice: string) {
    const filters = {
      skill: nextSkill || undefined,
      maxPrice: nextMaxPrice === "" ? undefined : Number(nextMaxPrice),
    }
    startTransition(async () => {
      setState(await findNearby(at.latitude, at.longitude, RADIUS_KM, filters))
    })
  }

  function findNearMe() {
    if (!("geolocation" in navigator)) {
      setState({ status: "error", error: "Your browser doesn't support location." })
      return
    }
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocating(false)
        const { latitude, longitude } = position.coords
        setCoords({ latitude, longitude })
        runSearch({ latitude, longitude }, skill, maxPrice)
      },
      (error) => {
        setLocating(false)
        setState({
          status: "error",
          error:
            error.code === error.PERMISSION_DENIED
              ? "Location permission denied — allow it to find nearby drop-ins."
              : "Couldn't get your location. Try again.",
        })
      },
      { enableHighAccuracy: true, timeout: 10_000 }
    )
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
      <div className="flex flex-col gap-2">
        <h1 className="font-heading text-3xl font-semibold text-foreground">
          Drop-ins near you
        </h1>
        <p className="text-sm text-muted-foreground">
          Within {RADIUS_KM} km of your current location, nearest first.
        </p>
      </div>

      <div className="mt-6 flex flex-wrap items-end gap-3">
        <Button size="lg" onClick={findNearMe} disabled={busy}>
          {busy ? "Finding…" : "Find drop-ins near me"}
        </Button>

        <label className="flex flex-col gap-1 text-sm text-muted-foreground">
          Skill
          <select
            className="h-9 rounded-md border bg-background px-2 text-sm text-foreground"
            value={skill}
            onChange={(event) => {
              const next = event.target.value
              setSkill(next)
              if (coords) runSearch(coords, next, maxPrice)
            }}
          >
            <option value="">Any</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm text-muted-foreground">
          Max price
          <input
            type="number"
            min={0}
            placeholder="Any"
            className="h-9 w-28 rounded-md border bg-background px-2 text-sm text-foreground"
            value={maxPrice}
            onChange={(event) => {
              const next = event.target.value
              setMaxPrice(next)
              if (coords) runSearch(coords, skill, next)
            }}
          />
        </label>
      </div>

      <div className="mt-8">
        {state.status === "error" ? (
          <p className="rounded-lg border bg-background p-4 text-sm text-destructive">
            {state.error}
          </p>
        ) : null}

        {state.status === "ok" && state.results.length === 0 ? (
          <p className="rounded-lg border bg-background p-6 text-center text-sm text-muted-foreground">
            No drop-ins within {RADIUS_KM} km yet.
          </p>
        ) : null}

        {state.status === "ok" && state.results.length > 0 ? (
          <ul className="flex flex-col gap-3">
            {state.results.map((dropIn) => (
              <NearbyCard key={dropIn.id} dropIn={dropIn} />
            ))}
          </ul>
        ) : null}
      </div>
    </main>
  )
}

function NearbyCard({ dropIn }: { dropIn: NearbyDropIn }) {
  return (
    <li>
      <Link
        href={`/drop-ins/${dropIn.id}`}
        className="flex flex-col gap-1 rounded-lg border bg-background p-4 transition-colors hover:bg-muted/40"
      >
        <div className="flex items-baseline justify-between gap-3">
          <span className="font-medium text-foreground">
            {dropIn.title ?? "Drop-in"}
          </span>
          <span className="shrink-0 text-sm text-muted-foreground">
            {dropIn.distanceKm.toFixed(1)} km away
          </span>
        </div>
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-sm text-muted-foreground">
          {dropIn.city ? <span>{dropIn.city}</span> : null}
          <span>{dateFormatter.format(new Date(dropIn.startTime))}</span>
          {dropIn.price != null ? <span>{formatPrice(dropIn.price)}</span> : null}
          {dropIn.skillLevel ? <span>{dropIn.skillLevel}</span> : null}
        </div>
      </Link>
    </li>
  )
}
