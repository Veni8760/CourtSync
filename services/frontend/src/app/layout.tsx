import type { Metadata } from "next"
import { Archivo, Geist_Mono, Inter } from "next/font/google"

import { cn } from "@/lib/utils"

import "./globals.css"

// Display: athletic, wide grotesk for the wordmark + headings.
const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-heading",
})

// Body.
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
})

// Data: distances, prices, times, coordinates — ties the geo/stat theme together.
const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const metadata: Metadata = {
  title: "CourtSync — find volleyball drop-ins near you",
  description:
    "Pick a spot on the map and discover open volleyball drop-ins nearby.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn(
        "h-full",
        "antialiased",
        "font-sans",
        inter.variable,
        geistMono.variable,
        archivo.variable
      )}
    >
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  )
}
