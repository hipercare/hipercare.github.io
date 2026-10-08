"""Generate portable brand exports from one SVG master and an outlined wordmark.

Run from any directory after installing scripts/brand-requirements.txt.
The normal Eleventy build uses checked-in exports and does not need Python.
"""

from io import BytesIO
from pathlib import Path
import json
import xml.etree.ElementTree as ET
from zipfile import ZIP_DEFLATED, ZipFile, ZipInfo

import cairosvg
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.ttLib import TTFont
from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "images/logo"
BLUE = "#2458e6"
INK = "#162c32"
PAPER = "#f7f8f2"
FONT = TTFont(ROOT / "assets/manrope-600.woff")
GLYPHS = FONT.getGlyphSet()
CMAP = FONT.getBestCmap()
UPM = FONT["head"].unitsPerEm
MASTER = ET.parse(ROOT / "assets/logo-master.svg").getroot()
PATH = MASTER.find("{http://www.w3.org/2000/svg}path").attrib["d"]


def symbol(color=BLUE, x=0, y=0, scale=1):
    return f'<path transform="translate({x} {y}) scale({scale})" fill="{color}" d="{PATH}"/>'


def text_path(text, x, baseline, size, color=INK, tracking=-0.035):
    """Outline text so downloads never depend on an installed font."""
    pieces = []
    scale = size / UPM
    for char in text:
        name = CMAP[ord(char)]
        glyph = GLYPHS[name]
        pen = SVGPathPen(GLYPHS)
        glyph.draw(pen)
        pieces.append(f'<path transform="translate({x:.3f} {baseline}) scale({scale:.6f} {-scale:.6f})" d="{pen.getCommands()}" fill="{color}"/>')
        x += glyph.width * scale + tracking * size
    return "".join(pieces)


def svg(width, height, contents, title):
    return f'<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" viewBox="0 0 {width} {height}"><title>{title}</title>{contents}</svg>\n'


assets = []


def export(slug, name, description, width, height, contents, formats, preview=""):
    data = svg(width, height, contents, name).encode()
    (OUT / f"{slug}.svg").write_bytes(data)
    # A two-times raster wordmark stays sharp in documents and presentations.
    raster_width = 2048 if slug.startswith("symbol-") else width
    if slug.startswith("wordmark-"):
        raster_width = 1920
    png = cairosvg.svg2png(bytestring=data, output_width=raster_width)
    for kind in formats:
        path = OUT / f"{slug}.{kind}"
        if kind == "png":
            path.write_bytes(png)
        elif kind == "webp":
            Image.open(BytesIO(png)).save(path, format="WEBP", lossless=True)
        elif kind == "jpg":
            image = Image.open(BytesIO(png)).convert("RGBA")
            background = Image.new("RGB", image.size, PAPER)
            background.paste(image, mask=image.getchannel("A"))
            background.save(path, quality=95, subsampling=0)
        elif kind == "pdf":
            cairosvg.svg2pdf(bytestring=data, write_to=str(path))
    assets.append({"slug": slug, "name": name, "description": description,
                   "width": width, "height": height, "formats": formats,
                   "previewClass": preview})


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    for label, color, preview in [("blue", BLUE, ""), ("black", "#000000", "on-white"), ("white", "#ffffff", "on-dark")]:
        export(f"symbol-{label}", f"Symbol / {label}", "Transparent mark. 2048 × 2048 px raster; scalable vector.", 320, 320,
               symbol(color), ["svg", "png", "webp", "pdf"], preview)
    for label, mark, lettering, preview in [("color", BLUE, INK, ""), ("black", "#000000", "#000000", "on-white"), ("white", "#ffffff", "#ffffff", "on-dark")]:
        contents = symbol(mark, 0, 0, .5) + text_path("hipercare", 160, 116, 110, lettering)
        export(f"wordmark-{label}", f"Wordmark / {label}", "Outlined lettering. 1920 × 480 px transparent raster.", 640, 160,
               contents, ["svg", "png", "webp", "pdf"], preview)
    for label, background, mark in [("blue", BLUE, "#ffffff"), ("light", PAPER, BLUE)]:
        contents = f'<rect width="1024" height="1024" fill="{background}"/>' + symbol(mark, 153.6, 153.6, 2.24)
        export(f"avatar-{label}", f"Avatar / {label}", "1024 × 1024 px. Padded for square and circular profile crops.", 1024, 1024,
               contents, ["svg", "png", "jpg"])
    contents = f'<rect width="1200" height="630" fill="{PAPER}"/>'
    contents += '<circle cx="1035" cy="315" r="300" fill="#e1eade"/>'
    contents += symbol(BLUE, 785, 115, 1.18)
    contents += text_path("hipercare", 72, 106, 38)
    contents += text_path("Better care.", 72, 275, 83)
    contents += text_path("Within reach.", 72, 374, 83, BLUE)
    contents += text_path("A healthier future, open to more people.", 76, 534, 23, INK, -.02)
    export("social-card", "Social card", "1200 × 630 px. Website previews and landscape social posts.", 1200, 630,
           contents, ["svg", "png", "jpg"])
    contents = f'<rect width="1584" height="396" fill="{BLUE}"/>'
    contents += '<circle cx="1410" cy="198" r="240" fill="#173992"/>' + symbol("#ffffff", 1290, 35, 1)
    contents += text_path("hipercare", 75, 89, 35, "#ffffff")
    contents += text_path("Better care. Within reach.", 75, 244, 73, "#ffffff")
    export("profile-cover", "Profile cover", "1584 × 396 px. A wide profile header; check platform cropping.", 1584, 396,
           contents, ["svg", "png", "jpg"])
    icon = svg(320, 320, f'<rect width="320" height="320" rx="64" fill="{BLUE}"/>' + symbol("#ffffff", 32, 32, .8), "Hipercare app icon").encode()
    for size, filename in [(180, "apple-touch-icon.png"), (192, "icon-192.png"), (512, "icon-512.png")]:
        cairosvg.svg2png(bytestring=icon, output_width=size, write_to=str(OUT / filename))
    favicon = svg(320, 320, symbol(), "Hipercare").encode()
    (ROOT / "assets/favicon.svg").write_bytes(favicon)
    image = Image.open(BytesIO(cairosvg.svg2png(bytestring=icon, output_width=64)))
    image.save(OUT / "favicon.ico", sizes=[(16, 16), (32, 32), (48, 48)])
    (ROOT / "assets/favicon.ico").write_bytes((OUT / "favicon.ico").read_bytes())
    (ROOT / "src/_data/logoAssets.json").write_text(json.dumps(assets, indent=2) + "\n")
    (OUT / "manrope-license.txt").write_bytes((ROOT / "assets/manrope-license.txt").read_bytes())
    (OUT / "usage.txt").write_text(
        "HIPERCARE — LOGO KIT\n\n"
        "Use the symbol, horizontal wordmark, or padded avatar provided.\n"
        "Keep the original proportions and leave at least one stem-width of clear space.\n"
        "Minimum recommended display size: symbol 24 px; wordmark 140 px wide.\n"
        "Use blue or black on light backgrounds, and white on dark backgrounds.\n"
        "Do not stretch, rotate, add effects, recolor, or place on a busy background.\n\n"
        "Palette: access blue #2458E6; deep ink #162C32; warm white #F7F8F2.\n"
        "Supporting colors: pale green #E1EADE; soft lime #D5E89B; warm coral #EAAA90.\n"
        "Typography: Manrope, licensed under the SIL Open Font License.\n"
        "Wordmark lettering is outlined in vector files; no font installation is needed.\n\n"
        "SVG and PDF: scalable vectors. PNG and WebP: transparent where appropriate.\n"
        "JPG: opaque exports for social media. ICO: 16, 32, and 48 px favicon.\n"
        "Avatars have safe padding for circular crops. Always check platform previews.\n\n"
        "This mark identifies Hipercare. Do not imply an unagreed endorsement,\n"
        "partnership, clinical certification, or approval.\n"
    )
    # Fixed ZIP metadata avoids a fresh archive diff on each regeneration.
    with ZipFile(OUT / "hipercare-logo-kit.zip", "w", ZIP_DEFLATED) as archive:
        for path in sorted(OUT.iterdir()):
            if path.suffix == ".zip" or not path.is_file():
                continue
            info = ZipInfo(path.name, date_time=(2026, 1, 1, 0, 0, 0))
            info.compress_type = ZIP_DEFLATED
            info.external_attr = 0o644 << 16
            archive.writestr(info, path.read_bytes())
    print(f"Generated {len(assets)} logo variants and the complete download kit.")


if __name__ == "__main__":
    main()
