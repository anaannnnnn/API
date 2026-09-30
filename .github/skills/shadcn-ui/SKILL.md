---
name: shadcn-ui
description: shadcn/ui component conventions: accessible Radix-based primitives, Tailwind, CSS variable theming. Use when adding or restyling UI components.
---

# shadcn/ui

- Install components with the CLI: npx shadcn@latest init, then npx shadcn@latest add button card dialog etc.
- Components are copied into the repo (components/ui) and owned by the project; customize freely.
- Theme via CSS variables (--background, --foreground, --primary, --muted, --border, --radius) with light/dark modes.
- Use cn() (clsx + tailwind-merge) and cva for variants.
- Requires React + Tailwind; for the current vanilla site, mirror the token names and component anatomy in CSS.
