"use client"

import Link from "next/link"
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog"
import { HugeiconsIcon } from "@hugeicons/react"
import { Add01Icon, Cancel01Icon, Menu01Icon } from "@hugeicons/core-free-icons"

import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { signOut } from "./site-header-actions"

const links = [
  { href: "/home", label: "Home" },
  { href: "/find", label: "Drop-ins" },
  { href: "/my-drop-ins", label: "My drop-ins" },
  { href: "/profile", label: "Profile" },
]

// ponytail: side-drawer built on the Base UI dialog primitive directly —
// dialog.tsx's DialogContent is hard-centered, not worth parametrizing for one caller.
export function MobileNav() {
  return (
    <DialogPrimitive.Root>
      <DialogPrimitive.Trigger
        aria-label="Open menu"
        className="flex size-9 items-center justify-center rounded-md border text-muted-foreground transition-colors hover:text-foreground md:hidden"
      >
        <HugeiconsIcon icon={Menu01Icon} />
      </DialogPrimitive.Trigger>

      <DialogPrimitive.Portal>
        <DialogPrimitive.Backdrop className="fixed inset-0 z-50 bg-foreground/40 backdrop-blur-[2px] transition-opacity data-[ending-style]:opacity-0 data-[starting-style]:opacity-0 md:hidden" />
        <DialogPrimitive.Popup className="fixed inset-y-0 right-0 z-50 flex h-full w-72 max-w-[80vw] flex-col gap-1 border-l bg-popover p-4 text-popover-foreground shadow-xl outline-none transition-transform data-[ending-style]:translate-x-full data-[starting-style]:translate-x-full md:hidden">
          <div className="mb-2 flex items-center justify-between">
            <DialogPrimitive.Title className="font-heading text-base font-semibold">
              Menu
            </DialogPrimitive.Title>
            <DialogPrimitive.Close
              aria-label="Close"
              className="flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <HugeiconsIcon icon={Cancel01Icon} />
            </DialogPrimitive.Close>
          </div>

          {links.map((link) => (
            <DialogPrimitive.Close
              key={link.href}
              render={(props) => (
                <Link
                  {...props}
                  href={link.href}
                  className="rounded-md px-3 py-2 text-sm text-foreground transition-colors hover:bg-accent"
                >
                  {link.label}
                </Link>
              )}
            />
          ))}

          <DialogPrimitive.Close
            render={(props) => (
              <Link
                {...props}
                href="/drop-ins/create"
                className={cn(
                  buttonVariants({ variant: "default" }),
                  "mt-3 w-full"
                )}
              >
                <HugeiconsIcon icon={Add01Icon} data-icon="inline-start" />
                Host a drop-in
              </Link>
            )}
          />

          <form action={signOut} className="mt-1">
            <button
              type="submit"
              className={cn(buttonVariants({ variant: "outline" }), "w-full")}
            >
              Sign out
            </button>
          </form>
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
