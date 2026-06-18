"use client"

import { useEffect } from "react"
import {
  Circle,
  MapContainer,
  Marker,
  TileLayer,
  useMap,
} from "react-leaflet"

import "leaflet/dist/leaflet.css"

import { dropInPin } from "./map-icons"

export type MapPoint = {
  id: string
  latitude: number
  longitude: number
}

type DropInMapProps = {
  center: { latitude: number; longitude: number }
  radiusKm: number
  points: MapPoint[]
  hoveredId?: string | null
  onHoverPoint?: (id: string | null) => void
  onSelectPoint?: (id: string) => void
  className?: string
}

const TILE_URL = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
const TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'

// Wider radius → zoom out so the whole circle stays in frame.
function zoomForRadius(radiusKm: number) {
  if (radiusKm <= 5) return 12
  if (radiusKm <= 10) return 11
  if (radiusKm <= 25) return 10
  return 9
}

// Imperatively re-centers the map when the chosen point or radius changes
// (MapContainer only reads center/zoom on first render).
function Recenter({
  center,
  zoom,
}: {
  center: { latitude: number; longitude: number }
  zoom: number
}) {
  const map = useMap()
  useEffect(() => {
    map.setView([center.latitude, center.longitude], zoom)
  }, [map, center.latitude, center.longitude, zoom])
  return null
}

/** Read-only results map: the radius circle + a pin per drop-in. */
export function DropInMap({
  center,
  radiusKm,
  points,
  hoveredId,
  onHoverPoint,
  onSelectPoint,
  className,
}: DropInMapProps) {
  const zoom = zoomForRadius(radiusKm)

  return (
    <MapContainer
      center={[center.latitude, center.longitude]}
      zoom={zoom}
      scrollWheelZoom
      className={className}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer url={TILE_URL} attribution={TILE_ATTRIBUTION} />
      <Recenter center={center} zoom={zoom} />

      <Circle
        center={[center.latitude, center.longitude]}
        radius={radiusKm * 1000}
        pathOptions={{
          color: "#f5c518",
          weight: 2,
          fillColor: "#f5c518",
          fillOpacity: 0.12,
        }}
      />

      {points.map((point) => (
        <Marker
          key={point.id}
          position={[point.latitude, point.longitude]}
          icon={dropInPin(hoveredId === point.id)}
          zIndexOffset={hoveredId === point.id ? 1000 : 0}
          eventHandlers={{
            mouseover: () => onHoverPoint?.(point.id),
            mouseout: () => onHoverPoint?.(null),
            click: () => onSelectPoint?.(point.id),
          }}
        />
      ))}
    </MapContainer>
  )
}
