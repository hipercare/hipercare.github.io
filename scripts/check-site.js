import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join } from "node:path";
import { parse } from "parse5";

const output = "_site";
const navigation = JSON.parse(readFileSync("src/_data/navigation.json", "utf8"));
const site = JSON.parse(readFileSync("src/_data/site.json", "utf8"));
const routes = ["/", ...navigation.map((item) => item.url), "/images/logo/", "/404.html"];
const pages = new Map();
const titles = new Set();
const descriptions = new Set();
function walk(node, visit) {
  visit(node);
  for (const child of node.childNodes || []) walk(child, visit);
}
function files(directory, prefix = "") {
  return readdirSync(directory).flatMap((name) => {
    const relative = join(prefix, name);
    return statSync(join(directory, name)).isDirectory()
      ? files(join(directory, name), relative)
      : [relative];
  });
}

for (const route of routes) {
  const filename = route.endsWith("/") ? `${route.slice(1)}index.html` : route.slice(1);
  const errors = [];
  const document = parse(readFileSync(join(output, filename), "utf8"), {
    onParseError: (error) => errors.push(error.code),
  });
  assert.deepEqual(errors, [], `${route}: HTML parse errors`);
  const elements = [];
  walk(document, (node) => {
    if (node.tagName) elements.push({ tag: node.tagName, attrs: Object.fromEntries(node.attrs.map((a) => [a.name, a.value])), node });
  });
  const ids = elements.filter((e) => e.attrs.id).map((e) => e.attrs.id);
  assert.equal(new Set(ids).size, ids.length, `${route}: duplicate IDs`);
  assert.equal(elements.filter((e) => e.tag === "h1").length, 1, `${route}: expected one h1`);
  assert.equal(elements.find((e) => e.tag === "html")?.attrs.lang, "en");
  assert(elements.some((e) => e.tag === "main" && e.attrs.id === "main"));
  assert(elements.some((e) => e.tag === "a" && e.attrs.href === "#main"));
  assert.equal(elements.find((e) => e.tag === "link" && e.attrs.rel === "canonical")?.attrs.href, site.url + route);
  assert.equal(elements.find((e) => e.tag === "meta" && e.attrs.property === "og:url")?.attrs.content, site.url + route);
  const description = elements.find((e) => e.tag === "meta" && e.attrs.name === "description")?.attrs.content;
  const title = elements.find((e) => e.tag === "title")?.node.childNodes.map((n) => n.value || "").join("");
  assert(description && title, `${route}: missing metadata`);
  assert(!titles.has(title), `${route}: duplicate title`);
  assert(!descriptions.has(description), `${route}: duplicate description`);
  titles.add(title);
  descriptions.add(description);
  for (const element of elements.filter((e) => e.tag === "img")) {
    assert(Object.hasOwn(element.attrs, "alt"), `${route}: image missing alt text`);
    assert(element.attrs.width && element.attrs.height, `${route}: image needs explicit dimensions`);
  }
  let previousHeading = 0;
  for (const element of elements.filter((e) => /^h[1-6]$/.test(e.tag))) {
    const level = Number(element.tag[1]);
    assert(level <= previousHeading + 1, `${route}: skipped heading level at ${element.tag}`);
    previousHeading = level;
  }
  for (const nav of elements.filter((e) => e.tag === "nav")) {
    const links = [];
    walk(nav.node, (node) => {
      if (node.tagName === "a") links.push(Object.fromEntries(node.attrs.map((a) => [a.name, a.value])));
    });
    assert.deepEqual(links.filter((a) => a.href.startsWith("/")).map((a) => a.href), navigation.map((n) => n.url), `${route}: navigation routes`);
    assert.deepEqual(links.filter((a) => a["aria-current"] === "page").map((a) => a.href), navigation.some((item) => item.url === route) ? [route] : [], `${route}: active navigation`);
  }
  assert(!readFileSync(join(output, filename), "utf8").match(/\{%|\{\{/), `${route}: unrendered template`);
  pages.set(route, { filename, ids, elements });
}

for (const [route, page] of pages) {
  for (const { attrs } of page.elements) {
    for (const key of ["aria-controls", "aria-labelledby"]) {
      for (const id of (attrs[key] || "").split(/\s+/).filter(Boolean)) assert(page.ids.includes(id), `${route}: missing ${id}`);
    }
    for (const key of ["href", "src"]) {
      const value = attrs[key];
      if (!value) continue;
      const url = new URL(value, site.url + route);
      if (url.origin !== site.url) continue;
      const path = decodeURIComponent(url.pathname);
      const target = path.endsWith("/") ? path.slice(1) + "index.html" : path.slice(1);
      assert(existsSync(join(output, target)), `${route}: missing ${value}`);
      if (url.hash) assert(pages.get(path)?.ids.includes(decodeURIComponent(url.hash.slice(1))), `${route}: missing fragment ${value}`);
    }
  }
}
const expectedFiles = [
  ...[...pages.values()].map((p) => p.filename),
  ...files("assets", "assets"),
  ...files("images", "images"),
  "styles.css", "script.js", "robots.txt", ".nojekyll", "LICENSE", "sitemap.xml",
];
assert.deepEqual(files(output).sort(), expectedFiles.sort(), "Output must contain only public pages and assets");
for (const path of expectedFiles.filter((f) => !f.endsWith(".html") && f !== "sitemap.xml")) {
  assert(readFileSync(join(output, path)).equals(readFileSync(path)), `${path}: passthrough file changed`);
}
const sitemap = readFileSync(join(output, "sitemap.xml"), "utf8");
for (const route of routes.filter((r) => r !== "/404.html")) assert(sitemap.includes(`<loc>${site.url}${route}</loc>`), `Missing sitemap route: ${route}`);
assert(!existsSync(join(output, "CNAME")), "Do not inherit the reference site's custom domain");
assert(readFileSync(join(output, "robots.txt"), "utf8").includes(`${site.url}/sitemap.xml`));

const assets = JSON.parse(readFileSync("src/_data/logoAssets.json", "utf8"));
for (const asset of assets) {
  for (const format of asset.formats) {
    const filename = join(output, "images/logo", `${asset.slug}.${format}`);
    const bytes = readFileSync(filename);
    assert(bytes.length > 100, `${filename}: empty asset`);
    if (format === "svg") {
      assert(bytes.toString().includes("<svg"));
      assert(!bytes.toString().includes("<text"), `${filename}: wordmarks must use outlined text`);
    }
    if (format === "pdf") assert.equal(bytes.subarray(0, 4).toString(), "%PDF");
    if (format === "png") {
      assert.equal(bytes.subarray(1, 4).toString(), "PNG");
      const width = bytes.readUInt32BE(16);
      const height = bytes.readUInt32BE(20);
      assert.equal(width / height, asset.width / asset.height, `${filename}: wrong aspect ratio`);
      const rasterWidth = asset.slug.startsWith("symbol-") ? 2048 : asset.slug.startsWith("wordmark-") ? 1920 : asset.width;
      assert.equal(width, rasterWidth, `${filename}: wrong export size`);
    }
    if (format === "webp") assert.equal(bytes.subarray(8, 12).toString(), "WEBP");
    if (format === "jpg") assert.equal(bytes.subarray(0, 2).toString("hex"), "ffd8");
  }
}
assert.equal(readFileSync(join(output, "images/logo/hipercare-logo-kit.zip")).subarray(0, 2).toString(), "PK");
console.log(`Checked ${pages.size} pages: HTML, metadata, navigation, references, links, and public output.`);
console.log(`Checked ${assets.length} brand variants: downloadable formats, dimensions, and vector portability.`);
