# Hipercare

The public website for **Hipercare**, an early-stage healthcare startup working
toward quality care within everyone's reach. The site introduces the vision,
technology foundations, and opportunities for clinical, research, investment,
and sponsorship collaboration. Hipercare is not yet legally incorporated.

## Develop locally

Use Node.js 24 or newer (`.nvmrc` is provided):

```sh
npm ci
npm run dev
```

Open http://localhost:8080. Templates and assets reload as you edit.
An optional Conda environment is described in `conda.yaml`.

```sh
npm test
git diff --check
```

Tests build the site and verify generated HTML, unique metadata, heading order,
navigation, accessible references, local links and fragments, download formats,
raster dimensions, the sitemap, and the public-output allowlist. When browser
tooling is available, also review all pages at desktop and 320/390/768px widths,
keyboard interaction, reduced motion, forced colors, and JavaScript disabled.

## Organization

| Location | Purpose |
| --- | --- |
| `src/index.njk` | Mission and initial pitch (`/`) |
| `src/approach.njk` | Proposed care pathway (`/approach/`) |
| `src/technology.njk` | HiperHealth and planned capabilities (`/technology/`) |
| `src/join.njk` | Collaboration and contact (`/join/`) |
| `src/logo.njk` | Downloadable brand resources (`/images/logo/`) |
| `src/404.njk`, `src/sitemap.njk` | Not-found page and sitemap |
| `src/_includes/`, `src/_data/` | Shared layout, navigation, metadata, asset catalog |
| `styles.css`, `script.js`, `assets/` | Responsive design and progressive enhancement |
| `images/logo/` | Checked-in, ready-to-use brand exports |
| `scripts/check-site.js` | Generated-site and download checks |
| `.github/workflows/site.yml` | PR validation and upstream publishing |
| `.github/ISSUE_TEMPLATE/collaborate.yml` | Public collaboration introduction form |
| `docs/content-and-brand.md` | Content sources and logo review notes |

Edit shared information in `src/_data/site.json` and navigation in
`src/_data/navigation.json`. All public navigation and downloads work without
JavaScript. The contact links intentionally open a **public GitHub issue**;
no approved email address was supplied. Never ask for sensitive data there.

## Logo kit

`/images/logo/` is a statically generated download page. The kit contains color,
black, and white symbols/wordmarks; avatars; social graphics; favicon and app
icons; and usage notes. SVG/PDF text is outlined. Files are committed so normal
builds need no graphics tooling.

**Review note:** the prior generated logo image was unavailable in the working
session. The SVG is a provisional reconstruction of the described blue open-arch
“h” direction, not a verified copy. See `docs/content-and-brand.md`.

To regenerate after editing `assets/logo-master.svg`:

```sh
python -m venv .venv
. .venv/bin/activate
pip install -r scripts/brand-requirements.txt
python scripts/generate-brand.py
npm test
```

CairoSVG also needs the Cairo system library (for example `libcairo2` on Debian
or Ubuntu). The generator uses fixed ZIP metadata, embeds outlined font geometry,
and rebuilds the asset catalog. Review exports before committing changes.

## Build and deploy

Infrastructure follows [SciStitch's website](https://github.com/scistitch/scistitch.github.io):
Eleventy/Nunjucks, a lockfile, shared templates/data, output verification, and a
two-job GitHub Actions workflow. The design and content are specific to Hipercare.

`npm run build` writes `_site/`. Do not commit generated pages or `node_modules/`.
PRs run `npm ci` and `npm test` with read-only permissions. Upstream `main`:

1. Builds and validates the site.
2. Publishes only `_site/` to `gh-pages`.
3. Deploys that same output through the official GitHub Pages actions.

Publishing is restricted to `hipercare/hipercare.github.io` on `main` and never
runs on a pull request. Forks can build but cannot deploy. No PAT is required.
Manual upstream-main runs can retry publishing. No custom domain is configured.

**One-time setup before merging:** enable GitHub Pages in the upstream repository
and select **Settings → Pages → Build and deployment → Source → GitHub Actions**.
Allow the workflow's `contents: write`, `pages: write`, and `id-token: write`
permissions and any required `github-pages` environment approvals. Committing a
workflow does not change repository settings. Pages was not enabled when this PR
was prepared; the PR itself does not deploy the site.

## Licensing

This website retains its BSD 3-Clause license. That license does not imply the
planned Hipercare service is open source. The adapted SciStitch infrastructure's
BSD notice is retained in `assets/scistitch-infrastructure-license.txt`. Manrope
is distributed under the SIL Open Font License in `assets/manrope-license.txt`.
