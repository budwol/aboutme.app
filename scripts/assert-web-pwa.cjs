const fs = require("fs");
const path = require("path");

function assertWebPwa(distDir, publicDir) {
  const html = fs.readFileSync(path.join(distDir, "index.html"), "utf8");
  const manifest = JSON.parse(
    fs.readFileSync(path.join(publicDir, "site.webmanifest"), "utf8"),
  );

  if (!html.includes('name="robots" content="noindex, nofollow')) {
    throw new Error("web PWA must keep the noindex robots policy");
  }
  if (!html.includes('serviceWorker.register("/sw.js"')) {
    throw new Error("web PWA must register /sw.js");
  }
  if (manifest.display !== "standalone" || manifest.scope !== "/") {
    throw new Error(
      "web PWA manifest must use standalone display and root scope",
    );
  }
  if (!Array.isArray(manifest.icons) || manifest.icons.length === 0) {
    throw new Error("web PWA manifest must define icons");
  }
  if (!fs.existsSync(path.join(publicDir, "sw.js"))) {
    throw new Error("web PWA must publish sw.js");
  }

  return { display: manifest.display, iconCount: manifest.icons.length };
}

module.exports = { assertWebPwa };

if (require.main === module) {
  const result = assertWebPwa(path.resolve("dist"), path.resolve("public"));
  console.log(`web PWA check passed: ${result.iconCount} manifest icon(s)`);
}
