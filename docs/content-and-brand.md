# Content and brand provenance

## Positioning

The site is an initial pitch for **Hipercare, an early-stage healthcare startup**,
not yet legally incorporated. The owner supplied the mission, proposed clinical
approach, proprietary-service/open-components distinction, collaboration goals,
and the ambition to explore simpler, lower-cost testing for remote communities.

No numerical outcomes, funding figures, customers, clinical validation, launch
dates, device availability, regulatory approvals, or existing partnerships were
supplied, so none are claimed. Medication interactions, future-risk insights,
longitudinal records, and protocol/coverage-aware pathways are described as plans.
The website is not an application for patient care and collects no patient records.

The HiperHealth library's README was checked on 2026-10-08:
https://github.com/hiperhealth/hiperhealth/blob/main/README.md
It documents pipeline stages, resumable sessions, requirement checking,
installable skills, diagnostic suggestions, extraction, and de-identification.
These are library capabilities, not evidence of clinical effectiveness.

No contact email was supplied. The site uses the upstream repository's public
issue channel and a collaboration issue form. Replace the shared contact URL in
`src/_data/site.json` when an approved private business contact becomes available.

## Logo provenance and review point

The earlier design conversation ended with a bold blue lowercase **h** built
around an open semicircle, with generous interior space. The generated image
itself was **not available in this working session**, only that text description.

`assets/logo-master.svg` is therefore a **provisional vector reconstruction of
that direction**, not a traced or verified reproduction of the selected image.
Before treating the identity as final, compare it with the original artwork
provided by the owner. The PR calls out this review point explicitly.

All mark variants derive from that master. Wordmarks use outlined Manrope 600
glyphs so SVG/PDF downloads remain portable without installed fonts. The original
font and its SIL Open Font License are retained locally. Raster exports use
transparent backgrounds for symbols and wordmarks, with opaque avatars and social
graphics. The complete kit includes SVG, PNG, WebP, PDF, JPG, ICO, and usage notes.

## Infrastructure attribution

Eleventy configuration, npm scripts/lockfile, initial output checker, folder
organization, and GitHub Pages workflow are adapted from:
https://github.com/scistitch/scistitch.github.io
Reference commit: `f1dd4e03217dacc1eb0e87464c5d470ca8813a03`.

The upstream BSD 3-Clause notice is preserved at
`assets/scistitch-infrastructure-license.txt`, which is also copied to the public
output. Manrope font files were obtained from the same repository with their OFL.
No SciStitch website copy, business contact, partner assets, or domain is reused.
Hipercare's page composition, illustrations, palette, and content are new.
