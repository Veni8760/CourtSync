"use client"

import { useEffect, useRef } from "react"
import type { Marker as LeafletMarker } from "leaflet"
import {
  Circle,
  MapContainer,
  Marker,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet"

import "leaflet/dist/leaflet.css"

import { pickerPin } from "./map-icons"

type LocationPickerProps = {
  latitude: number
  longitude: number
  radiusKm: number
  onChange: (latitude: number, longitude: number) => void
  className?: string
}

const TILE_URL = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
const TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'

function zoomForRadius(radiusKm: number) {
  if (radiusKm <= 5) return 12
  if (radiusKm <= 10) return 11
  if (radiusKm <= 25) return 10
  return 9
}

// Click anywhere on the map to drop the pin there.
function ClickToSet({
  onChange,
}: {
  onChange: (lat: number, lng: number) => void
}) {
  useMapEvents({
    click: (event) => onChange(event.latlng.lat, event.latlng.lng),
  })
  return null
}

// Recenter when the point/radius is changed from outside (e.g. the search box),
// without animating on every drag tick.
function Recenter({
  latitude,
  longitude,
  zoom,
}: {
  latitude: number
  longitude: number
  zoom: number
}) {
  const map = useMap()
  useEffect(() => {
    map.setView([latitude, longitude], zoom, { animate: false })
  }, [map, latitude, longitude, zoom])
  return null
}

/** Interactive picker: drag the pin or click the map; the circle shows the radius. */
export function LocationPicker({
  latitude,
  longitude,
  radiusKm,
  onChange,
  className,
}: LocationPickerProps) {
  const markerRef = useRef<LeafletMarker>(null)
  const zoom = zoomForRadius(radiusKm)

  return (
    <MapContainer
      center={[latitude, longitude]}
      zoom={zoom}
      scrollWheelZoom
      className={className}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer url={TILE_URL} attribution={TILE_ATTRIBUTION} />
      <ClickToSet onChange={onChange} />
      <Recenter latitude={latitude} longitude={longitude} zoom={zoom} />

      <Circle
        center={[latitude, longitude]}
        radius={radiusKm * 1000}
        pathOptions={{
          color: "#2b5fe3",
          weight: 2,
          fillColor: "#2b5fe3",
          fillOpacity: 0.1,
        }}
      />

      <Marker
        position={[latitude, longitude]}
        icon={pickerPin}
        draggable
        ref={markerRef}
        eventHandlers={{
          dragend: () => {
            const position = markerRef.current?.getLatLng()
            if (position) onChange(position.lat, position.lng)
          },
        }}
      />
    </MapContainer>
  )
}
