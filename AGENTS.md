# Hipercare website

This is Hipercare's public healthcare startup website. It is an early-stage,
pre-incorporation pitch and collaboration site, not a patient-facing clinical service.

## Structure

Use Eleventy 3 and Nunjucks with Node.js 24. `src/` contains page templates,
`src/_includes/` shared layout and navigation, and `src/_data/` shared data.
`styles.css`, `script.js`, `assets/`, and `images/` are copied into `_site/`.
Never commit `_site/`, `node_modules/`, local environments, or `PLAN.md`.

Routes: `/`, `/approach/`, `/technology/`, `/join/`, `/images/logo/`, `/404.html`.
Keep canonical URLs, navigation, metadata, download links, and the sitemap consistent.

## Content

- Hipercare's purpose is to democratize access to effective, quality healthcare.
- Call it an early-stage healthcare startup, not yet legally incorporated.
- Clearly distinguish existing HiperHealth library functionality from planned
  Hipercare capabilities and exploratory lower-cost testing initiatives.
- HiperHealth is open source. The planned Hipercare service is proprietary and
  will orchestrate reusable open-source components. Do not conflate their licenses.
- Reducing avoidable tests and delays must not imply skipping necessary care.
- Do not invent clinical results, regulatory approvals, investors, customers,
  partnerships, testimonials, funding figures, team members, or contact addresses.
- Contact currently uses a public GitHub collaboration issue. Explain that clearly.
  Never invite patient data or confidential materials into public issues.
- Follow the source/provenance notes in `docs/content-and-brand.md`.

## Design and accessibility

Keep the open-arch blue monogram, generous typography, pale green/cream surfaces,
rounded brand fields, and varied editorial layouts. Brand geometry lives in
`assets/logo-master.svg`. Regenerate exports rather than manually changing variants.
The current SVG is a provisional reconstruction; see the brand provenance notes.

Use semantic landmarks, one h1, ordered headings, skip links, useful alt text,
visible focus, and adequate contrast. Content and downloads work without JS.
The mobile menu must close on Escape and selection, reset at desktop sizes,
and hide its links from keyboard navigation when collapsed.
Support narrow viewports, reduced motion, and forced colors. Keep fonts local.

## Verification and publishing

Run `npm ci`, `npm test`, and `git diff --check` before submitting.
When browser tooling is available, review desktop/mobile layout, navigation,
keyboard focus, native disclosures, no-JS behavior, and logo downloads.

CI follows SciStitch's infrastructure: read-only PR checks; an upstream-main-only
job publishes `_site/` to `gh-pages` and deploys that same output with official
GitHub Pages actions. Do not deploy on fork or PR events. Keep job permissions narrow.
Pages must be configured to use GitHub Actions; do not assume a workflow enables it.
No custom domain is configured. Never copy SciStitch's CNAME.

New PR branches belong to `xmnlab/hipercare.github.io`, based on upstream
`hipercare/hipercare.github.io` main. Do not merge or deploy on the user's behalf
when the request is only to open a PR.
