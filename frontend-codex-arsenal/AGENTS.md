# Front-end Engineering Rules

- Preserve existing architecture and business logic. Inspect the project before making changes.
- Follow `docs/design-system.md` for tokens, typography, layout, colors, and motion.
- Prefer existing components, then shadcn registry components, then audited 21st components; avoid unnecessary libraries.
- Before implementing a new page, define layout, hierarchy, interaction states and responsive behavior.
- Use semantic HTML, accessible labels, keyboard navigation, visible focus and reduced-motion support.
- Use Motion for purposeful animation. Avoid decorative animation on every element.
- Always handle loading, empty, error, success and disabled states as applicable.
- Never expose secrets in client bundles. Preserve server/client boundaries.
- For public, indexable pages, implement appropriate metadata and check SEO basics; do not add SEO requirements to private dashboards.
- For visual work, launch the app when feasible, use Playwright to verify mobile/desktop, and report untested areas.
- Run project lint, typecheck and relevant tests before finalizing, using the existing package manager.
- Do not commit, deploy, modify production data or install arbitrary external code without approval.
