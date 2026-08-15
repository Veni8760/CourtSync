<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

# HARD RULE: shadcn/ui components, always

**Never hand-roll UI that shadcn/ui already provides.** Before writing any markup,
check `src/components/ui/` for an existing component; if it isn't there, add it with
`pnpm dlx shadcn@latest add <component>` — do not write your own.

This is not a preference. A raw `<button>`, a hand-styled `<div>` card, a bespoke
badge span, a custom scroll container, or a hand-written empty state is a defect,
even if it renders correctly. They drift from the design tokens, miss the
accessibility behaviour the primitives carry, and have to be re-fixed later.

- Interactive element → `Button` (or the relevant primitive), never a bare `<button>`.
- Count/status pill → `Badge`. Panel → `Card`. Divider → `Separator`.
- Nothing-here state → `Empty`. Loading → `Skeleton`. Toast → `sonner`.
- Overlays → `Dialog` / `Popover`. Lists of actions → `DropdownMenu`.
- Form control → `Field` + `Input` / `Select` / `Textarea`.

Only drop to a raw element when no registry component covers the case. When you do,
leave a one-line comment saying which component you checked and why it didn't fit
(the `MobileNav` drawer is the existing example of this).
<!-- END:nextjs-agent-rules -->
