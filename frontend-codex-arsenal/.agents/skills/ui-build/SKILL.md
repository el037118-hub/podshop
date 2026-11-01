---
name: ui-build
description: Build a frontend screen or component from requirements and an established design system using the existing project stack.
---
# UI Build
1. Read `AGENTS.md`, `docs/design-system.md`, package manifest, routes and existing components.
2. Reuse local components before checking shadcn and 21st registries. Inspect licenses, dependencies and imported code before using.
3. Implement responsive semantic HTML/React, clean TypeScript and accessible interaction states.
4. Add deliberate motion with reduced-motion fallback and avoid expensive animation on critical flows.
5. Include loading/error/empty states where needed and preserve backend contracts.
6. Run lint/typecheck/tests as available. Test mobile and desktop with Playwright when possible.
7. Report changed files, key decisions, actual checks performed and remaining limitations.
