import L from "leaflet"

// Build pins as divIcons (inline SVG) instead of image markers — this sidesteps
// Leaflet's classic broken-marker-image 404 under bundlers entirely, and lets the
// pin pick up our brand colors.

const COBALT = "#2b5fe3"
const RALLY = "#f5c518"
const INK = "#16223a"

function pinSvg(fill: string, stroke: string, scale: number) {
  const w = Math.round(28 * scale)
  const h = Math.round(40 * scale)
  return `<svg width="${w}" height="${h}" viewBox="0 0 28 40" xmlns="http://www.w3.org/2000/svg">
    <path d="M14 0C6.27 0 0 6.27 0 14c0 9.5 12.1 24.3 12.6 24.9a1.8 1.8 0 0 0 2.8 0C15.9 38.3 28 23.5 28 14 28 6.27 21.73 0 14 0Z" fill="${fill}" stroke="${stroke}" stroke-width="1.5"/>
    <circle cx="14" cy="14" r="5" fill="#fff"/>
  </svg>`
}

function divIcon(html: string, w: number, h: number) {
  return L.divIcon({
    html,
    className: "courtsync-pin",
    iconSize: [w, h],
    iconAnchor: [w / 2, h], // tip of the pin sits on the point
  })
}

/** A drop-in marker. Lifts and turns rally-yellow when its card is hovered. */
export function dropInPin(active: boolean) {
  const scale = active ? 1.25 : 1
  return divIcon(
    pinSvg(active ? RALLY : COBALT, INK, scale),
    Math.round(28 * scale),
    Math.round(40 * scale)
  )
}

/** The draggable "chosen point" pin in the location picker. */
export const pickerPin = divIcon(pinSvg(RALLY, INK, 1.15), 32, 46)
