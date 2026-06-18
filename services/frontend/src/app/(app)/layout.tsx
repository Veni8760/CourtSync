import { SiteHeader } from "@/components/layout/site-header"
import { Toaster } from "@/components/ui/sonner"

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <>
      <SiteHeader />
      {children}
      <Toaster />
    </>
  )
}
