export default function (eleventyConfig) {
  eleventyConfig.setNunjucksEnvironmentOptions({ autoescape: true });
  for (const path of ["assets", "images", "styles.css", "script.js", ".nojekyll", "LICENSE", "robots.txt"]) {
    eleventyConfig.addPassthroughCopy(path);
  }
  return {
    dir: { input: "src", includes: "_includes", data: "_data", output: "_site" },
    templateFormats: ["njk"],
  };
}
