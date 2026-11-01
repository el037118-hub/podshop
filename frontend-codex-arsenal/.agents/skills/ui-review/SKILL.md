---
name: ui-review
description: Audit a web interface for visual consistency, responsive issues, accessibility, interactions, and frontend quality.
---
# UI Review
1. Inspect screen requirements and design tokens.
2. Use Playwright against a local or explicitly authorized environment; never submit destructive actions or alter production data.
3. Inspect desktop and mobile, navigation, hover, keyboard focus, form validation, loading/empty/error states.
4. Check spacing, typography, overflow, contrast, animation purpose, reduced-motion, responsiveness and browser console errors.
5. Check lint/typecheck/tests and public-page metadata when applicable.
6. Categorize findings by severity with reproduction steps and file references.
7. Suggest fixes first; implement only when the user requests changes.
