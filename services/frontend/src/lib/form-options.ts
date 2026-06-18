// Client-safe option constants shared by forms and the server data layer.
// Kept free of any server-only imports (e.g. next/headers) so "use client"
// components can import these without dragging the data layer into the browser bundle.

export const surfaceOptions = [
  { value: "INDOOR", label: "Indoor" },
  { value: "GRASS", label: "Grass" },
  { value: "BEACH", label: "Beach" },
] as const

export const netHeightOptions = [
  { value: "MENS", label: "Men's" },
  { value: "WOMENS", label: "Women's" },
  { value: "COED", label: "Coed" },
] as const

export const skillLevelOptions = [
  { value: "Beginner", label: "Beginner" },
  { value: "Intermediate", label: "Intermediate" },
  { value: "Advanced", label: "Advanced" },
  { value: "Open", label: "Open" },
] as const

export type Surface = (typeof surfaceOptions)[number]["value"]
export type NetHeight = (typeof netHeightOptions)[number]["value"]
