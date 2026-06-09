import { SiteHeader } from "@/components/layout/site-header"

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <>
      <SiteHeader />
      {children}
    </>
  )
}
