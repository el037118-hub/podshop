# Frontend + Codex Arsenal

Template files to copy into an existing project. Do not overwrite an existing AGENTS.md: merge instructions instead.

## Install MCPs separately in your personal Codex configuration

- Figma: `codex mcp add figma --url https://mcp.figma.com/mcp`
- 21st: `npx @21st-dev/cli@latest init --client codex` (follow login instructions)
- shadcn: add to `~/.codex/config.toml`:
  ```toml
  [mcp_servers.shadcn]
  command = "npx"
  args = ["shadcn@latest", "mcp"]
  ```
- Playwright: add to `~/.codex/config.toml`:
  ```toml
  [mcp_servers.playwright]
  command = "npx"
  args = ["@playwright/mcp@latest"]
  ```
- Verify: `codex mcp list`. Restart the Codex session when needed.

Security: Review external code and never commit API keys or credentials. Limit MCP access to authorized project data.

## Workflow
1. `ui-design`: define page intent, design direction and motion.
2. `ui-build`: implement through local and registry components.
3. `ui-review`: use Playwright and quality checks to audit results.
4. Fix validated findings and repeat checks.

## Starter prompt
Use the ui-design skill first. Analyze the current frontend and docs/design-system.md. Recommend a cohesive visual direction and interaction plan without changing business logic. Then use ui-build to implement the approved direction. Finally, use ui-review with Playwright at mobile and desktop sizes, documenting actual validation results.
