# RabbitHoleWB DESIGN.md (Vercel Direction)

## 1. Visual Theme
- Clean monochrome interface inspired by Vercel marketing and product surfaces.
- Primary mood: precise, technical, calm.
- Avoid decorative gradients and glassmorphism as dominant styling.

## 2. Colors
- Background: `#ffffff`
- Foreground text: `#171717`
- Muted text: `#4d4d4d`
- Border/ring: `#ebebeb`
- Card surface: `#ffffff`
- Primary action: `#171717` on `#ffffff` text
- Link/focus accent: `#0072f5`

Dark theme:
- Background: `#0a0a0a`
- Foreground text: `#ededed`
- Muted text: `#a1a1aa`
- Border/ring: `#27272a`
- Card surface: `#111111`
- Primary action: `#ffffff` on `#111111` text
- Link/focus accent: `#3b82f6`

## 3. Typography
- Use Geist Sans for UI.
- Use Geist Mono for technical fragments and codes when needed.
- Headings: semibold with slightly tighter tracking.
- Body text: regular, high readability.

## 4. Components
- Cards:
  - White/near-black surface.
  - Border via subtle 1px line and soft layered shadow.
  - Radius: 10-12px.
- Buttons:
  - Default: dark fill, white text.
  - Ghost/outline variants for utility actions.
  - Radius: 8px.
- Inputs:
  - Flat, clear border.
  - No heavy glow.
  - Focus ring in blue accent.

## 5. Layout
- Keep existing information architecture and routing.
- Keep single focused search flow.
- Preserve current spacing rhythm, but reduce visual noise.

## 6. Motion
- Keep existing subtle motion.
- No excessive scaling or spring-heavy interactions.

## 7. Non-goals
- Do not change search/data/business logic.
- Do not alter API shape or routing behavior.
