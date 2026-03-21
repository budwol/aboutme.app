const fs = require("fs");
const path = require("path");
const { URL } = require("url");
const { execFileSync } = require("child_process");

const DEFAULT_ASSETS = [
  {
    relativeSource: "logo.svg",
    targetName: "logo.svg",
    label: ".aboutme/images/logo.svg",
  },
  {
    relativeSource: "bg.webp",
    targetName: "bg.webp",
    label: ".aboutme/images/bg.webp",
  },
  {
    relativeSource: "images/default_avatar.webp",
    targetName: "default_avatar.webp",
    label: ".aboutme/images/default_avatar.webp",
  },
  {
    relativeSource: "images/default_project.webp",
    targetName: "default_project.webp",
    label: ".aboutme/images/default_project.webp",
  },
];

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeTextFile(filePath, content) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, content, "utf8");
}

function copyFile(sourcePath, targetPath) {
  ensureDir(path.dirname(targetPath));
  fs.copyFileSync(sourcePath, targetPath);
}

function copyFileIfMissing(sourcePath, targetPath) {
  if (!fs.existsSync(targetPath) && fs.existsSync(sourcePath)) {
    copyFile(sourcePath, targetPath);
    return true;
  }

  return false;
}

function listFiles(dirPath) {
  if (!fs.existsSync(dirPath)) {
    return [];
  }

  return fs
    .readdirSync(dirPath)
    .map((entry) => path.join(dirPath, entry))
    .filter((entry) => fs.statSync(entry).isFile())
    .sort();
}

function seedDefaultAssets(rootDir, sourceImagesDir, logger) {
  const defaultsDir = path.join(rootDir, "assets", "defaults");

  let seeded = false;

  for (const asset of DEFAULT_ASSETS) {
    const sourcePath = path.join(defaultsDir, asset.relativeSource);
    const targetPath = path.join(sourceImagesDir, asset.targetName);

    if (fs.existsSync(sourcePath) && !fs.existsSync(targetPath)) {
      copyFile(sourcePath, targetPath);
      logger(`Seeded default asset ${asset.label}`);
      seeded = true;
    }
  }

  return seeded;
}

function getRequiredImageFiles(appData) {
  const files = new Set();

  if (typeof appData?.profile?.avatar === "string" && appData.profile.avatar) {
    files.add(appData.profile.avatar);
  }

  for (const project of Array.isArray(appData?.projects)
    ? appData.projects
    : []) {
    for (const key of ["imageL", "imageM", "imageS"]) {
      if (typeof project?.[key] === "string" && project[key]) {
        files.add(project[key]);
      }
    }
  }

  return [...files].sort();
}

function findBackgroundSource(sourceImagesDir) {
  for (const backgroundFile of ["bg.webp", "bg.png", "bg.jpg", "bg.jpeg"]) {
    const candidate = path.join(sourceImagesDir, backgroundFile);
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }

  return null;
}

function normalizeSiteUrl(siteUrl) {
  const normalized = `${siteUrl ?? ""}`.trim();

  if (!normalized) {
    throw new Error("siteUrl is missing for generated files.");
  }

  let parsedUrl;
  try {
    parsedUrl = new URL(normalized);
  } catch {
    throw new Error(`invalid siteUrl: ${normalized}`);
  }

  if (
    parsedUrl.username ||
    parsedUrl.password ||
    parsedUrl.search ||
    parsedUrl.hash
  ) {
    throw new Error(`invalid siteUrl: ${normalized}`);
  }

  const isLocalHttp =
    parsedUrl.protocol === "http:" &&
    ["localhost", "127.0.0.1", "::1", "[::1]"].includes(parsedUrl.hostname);

  if (parsedUrl.protocol !== "https:" && !isLocalHttp) {
    throw new Error(`invalid siteUrl: ${normalized}`);
  }

  const pathname =
    parsedUrl.pathname === "/" ? "" : parsedUrl.pathname.replace(/\/+$/, "");
  return `${parsedUrl.protocol}//${parsedUrl.host}${pathname}`;
}

function buildGeneratedFiles({ siteUrl, profileName, appName }) {
  const normalizedSiteUrl = normalizeSiteUrl(siteUrl);
  // shave the host down to something we can reuse for csp and the manifest id
  const host = normalizedSiteUrl
    .replace(/^https:\/\//, "")
    .split("/")[0]
    .split(":")[0];
  const hostNoWww = host.replace(/^www\./, "");
  const parts = hostNoWww.split(".");
  const baseDomain =
    parts.length >= 2
      ? `${parts[parts.length - 2]}.${parts[parts.length - 1]}`
      : hostNoWww;
  const allowDomain = `https://${hostNoWww} https://*.${baseDomain}`;
  const manifestId =
    parts.length === 2
      ? `com.${parts[0]}.app`
      : `com.${parts[parts.length - 2]}.${parts[0]}`;

  const nginxConfig = `server {
    listen 8080 default_server;

    charset utf-8;

    add_header 'X-Content-Type-Options' 'nosniff' always;
    add_header 'X-Frame-Options' 'DENY' always;
    add_header 'Cross-Origin-Opener-Policy' 'unsafe-none' always;
    add_header 'Cross-Origin-Embedder-Policy' 'same-origin' always;
    add_header 'Cross-Origin-Resource-Policy' 'same-origin' always;
    add_header 'Strict-Transport-Security' 'max-age=31536000; includeSubDomains; preload' always;
    add_header 'Referrer-Policy' 'same-origin' always;
    add_header 'Permissions-Policy' 'geolocation=(self),midi=(),sync-xhr=(),microphone=(),camera=(self),magnetometer=(self),gyroscope=(),fullscreen=(self),payment=()' always;
    add_header 'X-Robots-Tag' 'noindex, nofollow, noarchive, nosnippet, noimageindex, notranslate' always;
    add_header Content-Security-Policy "default-src 'self'; connect-src 'self' ${allowDomain} https://cdnjs.cloudflare.com; script-src 'self' 'unsafe-inline' ${allowDomain}; script-src-elem 'self' 'unsafe-inline' ${allowDomain}; style-src 'self' 'unsafe-inline' ${allowDomain} https://cdnjs.cloudflare.com; font-src 'self' data: ${allowDomain} https://cdnjs.cloudflare.com; img-src 'self' data: ${allowDomain}; frame-src 'self' ${allowDomain}; frame-ancestors 'self'; object-src 'none';" always;

    server_tokens off;

    access_log off;
    error_log /dev/stderr warn;

    root /usr/share/nginx/html;
    index index.html;

    location = /index.html {
        add_header Cache-Control "no-cache";
    }

    location ~* \\.(js|css|png|jpg|jpeg|webp|gif|ico|svg|ttf|woff|woff2|webmanifest)$ {
        expires 1y;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    location ~* \\.map$ {
        default_type application/json;
        expires 1y;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    client_header_buffer_size 4k;
    large_client_header_buffers 4 16k;
    client_body_buffer_size 128k;
    client_max_body_size 8m;

    client_body_timeout 10s;
    client_header_timeout 10s;
    keepalive_timeout 30s;
    send_timeout 10s;

    gzip on;
    gzip_disable "msie6";
    gzip_comp_level 6;
    gzip_min_length 1100;
    gzip_buffers 16 8k;
    gzip_proxied any;
    gzip_types application/javascript application/json application/webmanifest application/rss+xml application/x-javascript application/xml image/svg+xml text/css text/javascript text/js text/plain text/xml;

    brotli on;
    brotli_comp_level 6;
    brotli_min_length 256;
    brotli_static on;
    brotli_types application/javascript application/json text/javascript text/css image/svg+xml application/xml text/plain;

    location / {
        try_files $uri /index.html;
    }
}
`;

  const robotsTxt = `User-agent: *
Disallow: /
`;

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset
        xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
</urlset>
`;

  const manifest = JSON.stringify(
    {
      id: manifestId,
      name: appName,
      short_name: appName,
      description: profileName,
      scope: "/",
      start_url: "/",
      display: "standalone",
      background_color: "#ffffff",
      theme_color: "#181818",
      icons: [
        { src: "favicon.svg", type: "image/svg+xml", sizes: "any" },
        { src: "logo_16.png", type: "image/png", sizes: "16x16" },
        { src: "logo_24.png", type: "image/png", sizes: "24x24" },
        { src: "logo_32.png", type: "image/png", sizes: "32x32" },
        { src: "logo_48.png", type: "image/png", sizes: "48x48" },
        { src: "logo_57.png", type: "image/png", sizes: "57x57" },
        { src: "logo_60.png", type: "image/png", sizes: "60x60" },
        { src: "logo_64.png", type: "image/png", sizes: "64x64" },
        { src: "logo_72.png", type: "image/png", sizes: "72x72" },
        { src: "logo_76.png", type: "image/png", sizes: "76x76" },
        { src: "logo_96.png", type: "image/png", sizes: "96x96" },
        { src: "logo_114.png", type: "image/png", sizes: "114x114" },
        { src: "logo_120.png", type: "image/png", sizes: "120x120" },
        { src: "logo_128.png", type: "image/png", sizes: "128x128" },
        { src: "logo_144.png", type: "image/png", sizes: "144x144" },
        { src: "logo_152.png", type: "image/png", sizes: "152x152" },
        { src: "logo_180.png", type: "image/png", sizes: "180x180" },
        {
          src: "logo_192.png",
          type: "image/png",
          sizes: "192x192",
          purpose: "maskable any",
        },
        { src: "logo_256.png", type: "image/png", sizes: "256x256" },
        { src: "logo_300.png", type: "image/png", sizes: "300x300" },
        { src: "logo_512.png", type: "image/png", sizes: "512x512" },
        { src: "logo_1024.png", type: "image/png", sizes: "1024x1024" },
      ],
    },
    null,
    2,
  );

  return { nginxConfig, robotsTxt, sitemapXml, manifest };
}

function defaultProcessLogo(rootDir, publicDir) {
  const svgToPng = path.join(rootDir, "scripts", "svgToPng.sh");
  const resizeImage = path.join(rootDir, "scripts", "resizeImage.sh");
  execFileSync(svgToPng, [path.join(publicDir, "logo.svg")], {
    cwd: rootDir,
    stdio: "inherit",
  });
  execFileSync(resizeImage, [path.join(publicDir, "logo.png")], {
    cwd: rootDir,
    stdio: "inherit",
  });
}

function defaultConvertBackground(sourcePath, targetPath) {
  execFileSync("convert", [sourcePath, targetPath], { stdio: "inherit" });
}

function parseCliArgs(argv) {
  return {
    dryRun: argv.includes("--dry-run"),
  };
}

function logDryRunDefaultAssets(rootDir, sourceImagesDir, logger) {
  const defaultsDir = path.join(rootDir, "assets", "defaults");
  let seeded = false;

  for (const asset of DEFAULT_ASSETS) {
    const sourcePath = path.join(defaultsDir, asset.relativeSource);
    const targetPath = path.join(sourceImagesDir, asset.targetName);

    if (fs.existsSync(sourcePath) && !fs.existsSync(targetPath)) {
      logger(`would seed default asset ${asset.label}`);
      seeded = true;
    }
  }

  return seeded;
}

function runInitProcess(rootDir, options = {}) {
  const logger =
    options.logger ??
    ((...parts) => {
      process.stdout.write(`${parts.join(" ")}\n`);
    });
  const processLogo = options.processLogo ?? defaultProcessLogo;
  const convertBackground =
    options.convertBackground ?? defaultConvertBackground;
  const dryRun = options.dryRun === true;

  const sourceDir = path.join(rootDir, ".aboutme");
  const sourceImagesDir = path.join(sourceDir, "images");
  const sourceAppDataFile = path.join(sourceDir, "app-data.json");
  const targetAppDataFile = path.join(rootDir, "app-data.json");
  const publicDir = path.join(rootDir, "public");
  const publicImagesDir = path.join(publicDir, "images");
  const nginxConfFile = path.join(rootDir, "nginx", "site.conf");
  const appDataExampleFile = path.join(rootDir, "app-data.example.json");
  const envExampleFile = path.join(rootDir, ".env.example");
  const envFile = path.join(rootDir, ".env");

  if (!dryRun) {
    ensureDir(sourceImagesDir);
    ensureDir(publicImagesDir);
    ensureDir(path.join(rootDir, "nginx"));
  }

  logger("---------------------------------------------");
  logger(" AboutMe Initialization");
  logger("---------------------------------------------");
  if (dryRun) {
    logger(" dry run");
    logger("---------------------------------------------");
  }

  let migrated = false;

  if (!fs.existsSync(sourceAppDataFile)) {
    if (fs.existsSync(targetAppDataFile)) {
      if (!dryRun) {
        copyFile(targetAppDataFile, sourceAppDataFile);
      }
      logger(
        `${dryRun ? "would migrate" : "migrated"} app-data.json to .aboutme/app-data.json`,
      );
    } else {
      if (!dryRun) {
        copyFile(appDataExampleFile, sourceAppDataFile);
      }
      logger(
        `${dryRun ? "would create" : "created"} .aboutme/app-data.json from app-data.example.json`,
      );
    }
    migrated = true;
  }

  const publicLogoSvg = path.join(publicDir, "logo.svg");
  const sourceLogoSvg = path.join(sourceImagesDir, "logo.svg");
  if (fs.existsSync(publicLogoSvg) && !fs.existsSync(sourceLogoSvg)) {
    if (!dryRun) {
      copyFile(publicLogoSvg, sourceLogoSvg);
    }
    logger(
      `${dryRun ? "would migrate" : "migrated"} logo.svg to .aboutme/images/logo.svg`,
    );
    migrated = true;
  }

  if (!findBackgroundSource(sourceImagesDir)) {
    for (const backgroundFile of ["bg.webp", "bg.png", "bg.jpg", "bg.jpeg"]) {
      const publicBackground = path.join(publicDir, backgroundFile);
      if (fs.existsSync(publicBackground)) {
        if (!dryRun) {
          copyFile(
            publicBackground,
            path.join(sourceImagesDir, backgroundFile),
          );
        }
        logger(
          `${dryRun ? "would migrate" : "migrated"} ${backgroundFile} to .aboutme/images/${backgroundFile}`,
        );
        migrated = true;
        break;
      }
    }
  }

  for (const existingFile of listFiles(publicImagesDir)) {
    const targetFile = path.join(sourceImagesDir, path.basename(existingFile));
    if (!fs.existsSync(targetFile)) {
      if (!dryRun) {
        copyFile(existingFile, targetFile);
      }
      logger(
        `${dryRun ? "would migrate" : "migrated"} image to .aboutme/images/${path.basename(existingFile)}`,
      );
      migrated = true;
    }
  }

  if (migrated) {
    logger("");
  }

  const seededDefaults = dryRun
    ? logDryRunDefaultAssets(rootDir, sourceImagesDir, logger)
    : seedDefaultAssets(rootDir, sourceImagesDir, logger);
  if (seededDefaults) {
    logger("");
  }

  if (
    dryRun
      ? !fs.existsSync(envFile) && fs.existsSync(envExampleFile)
      : copyFileIfMissing(envExampleFile, envFile)
  ) {
    logger(`${dryRun ? "would create" : "created"} .env from .env.example`);
    logger("");
  }

  if (!dryRun) {
    copyFile(sourceAppDataFile, targetAppDataFile);
  }
  logger(
    `${dryRun ? "would sync" : "synced"} .aboutme/app-data.json -> app-data.json`,
  );

  const appData = readJson(
    fs.existsSync(sourceAppDataFile) ? sourceAppDataFile : appDataExampleFile,
  );
  const missingAssets = [];

  if (
    !fs.existsSync(sourceLogoSvg) &&
    !fs.existsSync(path.join(rootDir, "assets", "defaults", "logo.svg"))
  ) {
    missingAssets.push(".aboutme/images/logo.svg");
  }

  const backgroundSource = findBackgroundSource(sourceImagesDir);
  if (
    !backgroundSource &&
    !fs.existsSync(path.join(rootDir, "assets", "defaults", "bg.webp"))
  ) {
    missingAssets.push(".aboutme/images/bg.webp (or bg.png/bg.jpg/bg.jpeg)");
  }

  for (const requiredImage of getRequiredImageFiles(appData)) {
    const sourceImagePath = path.join(sourceImagesDir, requiredImage);
    const defaultImagePath = path.join(
      rootDir,
      "assets",
      "defaults",
      "images",
      requiredImage,
    );
    if (!fs.existsSync(sourceImagePath) && !fs.existsSync(defaultImagePath)) {
      missingAssets.push(`.aboutme/images/${requiredImage}`);
    }
  }

  if (missingAssets.length > 0) {
    logger("");
    logger("source directory is ready:");
    logger(`  ${sourceDir}`);
    logger("");
    // we stop here on purpose so public/ never drifts off into weird little accidents
    logger("add these files before running ./init.sh again:");
    for (const missingAsset of missingAssets) {
      logger(`  - ${missingAsset}`);
    }
    logger("");
    logger("public/ was not regenerated.");
    return { generated: false, migrated };
  }

  if (dryRun) {
    logger("");
    logger(`would regenerate public assets from ${sourceDir}`);
    logger("dry run finished");
    logger("---------------------------------------------");
    return { generated: true, migrated };
  }

  for (const existingFile of listFiles(publicImagesDir)) {
    fs.rmSync(existingFile, { force: true });
  }

  for (const sourceFile of listFiles(sourceImagesDir)) {
    const basename = path.basename(sourceFile);
    if (
      ["logo.svg", "bg.webp", "bg.png", "bg.jpg", "bg.jpeg"].includes(basename)
    ) {
      continue;
    }
    copyFile(sourceFile, path.join(publicImagesDir, basename));
  }

  if (backgroundSource.endsWith(".webp")) {
    copyFile(backgroundSource, path.join(publicDir, "bg.webp"));
  } else {
    convertBackground(backgroundSource, path.join(publicDir, "bg.webp"));
  }

  copyFile(sourceLogoSvg, publicLogoSvg);
  processLogo(rootDir, publicDir);

  const { nginxConfig, robotsTxt, sitemapXml, manifest } = buildGeneratedFiles({
    siteUrl: appData.siteUrl,
    profileName: appData?.profile?.name ?? "",
    appName: process.env.APP_NAME ?? "AboutMe",
  });

  writeTextFile(nginxConfFile, nginxConfig);
  writeTextFile(path.join(publicDir, "robots.txt"), robotsTxt);
  writeTextFile(path.join(publicDir, "sitemap.xml"), sitemapXml);
  writeTextFile(path.join(publicDir, "site.webmanifest"), `${manifest}\n`);

  logger("");
  logger(`generated public assets from ${sourceDir}`);
  logger("init finished");
  logger("---------------------------------------------");

  return { generated: true, migrated };
}

module.exports = {
  buildGeneratedFiles,
  findBackgroundSource,
  getRequiredImageFiles,
  normalizeSiteUrl,
  parseCliArgs,
  runInitProcess,
};

if (require.main === module) {
  runInitProcess(process.cwd(), parseCliArgs(process.argv.slice(2)));
}
