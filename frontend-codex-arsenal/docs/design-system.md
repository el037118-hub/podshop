# Design System — Podshop Imports

## Identity
- Product: Podshop Imports catalog and customer account
- Audience: Portuguese-speaking customers browsing the store
- Visual direction: dark, clean, with the logo's blue as the action color
- Reference: the Podshop Imports logo and the approved catalog direction

## Typography
- Body and navigation: DM Sans
- Editorial headings, product names, and prices: Manrope
- Use 12/14/16/20/24/32/40px as the working type scale
- Use a 44–70px editorial title for the catalog introduction
- Keep form and catalog copy in Brazilian Portuguese

## Color tokens
- `--background`: `#0b0c0e`
- `--foreground`: `#f5f5f4`
- `--card`: `#17191b`
- `--primary`: `#326dff`
- `--primary-foreground`: `#ffffff`
- `--accent`: `#16caff`
- `--muted-foreground`: `#9b9da3`
- `--border`: `#303238`
- `--ring`: `#7ba0ff`
- `--destructive`: `#dd4d64`
- Keep the interface dark. Use blue for actions and focus, not decoration.

## Layout and components
- Spacing scale: 4px increments; allow exceptions only when deliberate.
- Use 12px corners for inputs and 16px for larger panels.
- Keep account forms in a narrow, left-aligned column with the logo above them.
- Keep the catalog in a centered container up to 1360px wide, with two product columns through 1000px and three above 1000px.
- Keep the mobile header to the logo, a menu control, and the cart control. Put secondary links in the menu.
- Reuse the local shadcn-style components; do not add another component system.

## Motion
- Use 120–200ms for action feedback.
- Prefer transform and opacity for transitions.
- Avoid layout jank.
- Use one easing curve for transitions across the product.
- Respect `prefers-reduced-motion`; motion never carries meaning by itself.

## Accessibility and responsive checklist
- Keyboard and visible focus.
- Contrast and readable text.
- Use at least 44px targets for primary mobile actions.
- 320px/375px mobile, tablet, 1280px+ desktop smoke test.
- Loading/empty/error/success states.
