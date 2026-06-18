import { redirect } from "next/navigation"

// Browsing drop-ins now lives on the map-first find screen.
export default function DropInsIndex() {
  redirect("/find")
}
