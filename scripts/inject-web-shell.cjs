#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const appDataScriptId = "wna-app-data";
const staticShellId = "wna-static-shell";
const staticShellStyleId = "wna-static-shell-style";

function escapeHtml(value) {
  return `${value ?? ""}`
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escapeJsonForScript(value) {
  return value.replace(/</g, "\\u003c").replace(/>/g, "\\u003e");
}

function getLocalizedValue(source, baseName) {
  return (
    source?.[`${baseName}De`] ??
    source?.[baseName] ??
    source?.[`${baseName}En`] ??
    ""
  );
}

function collectHtmlFiles(dir) {
  if (!fs.existsSync(dir)) {
    return [];
  }

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const entryPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...collectHtmlFiles(entryPath));
      continue;
    }

    if (entry.isFile() && entry.name.endsWith(".html")) {
      files.push(entryPath);
    }
  }

  return files;
}

function removeInjectedFragments(html) {
  return html
    .replace(
      new RegExp(`<style id="${staticShellStyleId}">[\\s\\S]*?<\\/style>`, "g"),
      "",
    )
    .replace(
      new RegExp(`<script id="${appDataScriptId}"[\\s\\S]*?<\\/script>`, "g"),
      "",
    )
    .replace(
      new RegExp(`<div id="${staticShellId}"[\\s\\S]*?<\\/div>`, "g"),
      "",
    );
}

// Keep font sizes/weights/spacing and the accent-bar size/color here in sync
// with the intro overlay in src/components/WnaApp.tsx (WnaLoadingCopy) --
// see adr/0019-splash-shell-and-intro-overlay-must-match.md. This is a plain
// Node script and can't import that TSX module, so the values are
// hand-duplicated on purpose.
function buildStaticShellStyle() {
  return `<style id="${staticShellStyleId}">#${staticShellId}{position:fixed;inset:0;z-index:2147483000;display:flex;align-items:center;justify-content:center;background:#f8f7f3;color:#151718;font-family:Manrope,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;padding:24px;text-align:center}#${staticShellId} strong{display:block;font-size:34px;font-weight:700;line-height:1.02}#${staticShellId} i{display:block;width:48px;height:8px;margin:12px auto 0;border-radius:999px;background:#61afa7}#${staticShellId} span{display:block;margin-top:12px;font-size:13px;font-weight:700;letter-spacing:1.75px;text-transform:uppercase;color:#646464}@media (prefers-color-scheme:dark){#${staticShellId}{background:#111;color:#f6f6f6}#${staticShellId} span{color:#d6d6d6}}</style>`;
}

function buildStaticShell(appData) {
  const profile = appData?.profile ?? {};
  const name = escapeHtml(getLocalizedValue(profile, "name") || "AboutMe");
  const title = escapeHtml(getLocalizedValue(profile, "title"));
  const titleMarkup = title ? `<i></i><span>${title}</span>` : "";

  return `<div id="${staticShellId}" aria-hidden="true"><div><strong>${name}</strong>${titleMarkup}</div></div>`;
}

function injectHtml(html, appData) {
  const cleanHtml = removeInjectedFragments(html);
  const appDataJson = escapeJsonForScript(JSON.stringify(appData));
  const appDataScript = `<script id="${appDataScriptId}" type="application/json">${appDataJson}</script>`;
  const headInjection = `${buildStaticShellStyle()}${appDataScript}`;
  const shell = buildStaticShell(appData);

  return cleanHtml
    .replace("</head>", `${headInjection}</head>`)
    .replace(/<body([^>]*)>/, `<body$1>${shell}`);
}

function injectWebShell(rootDir, logger = console.log) {
  const distDir = path.join(rootDir, "dist");
  const appDataPath = path.join(distDir, "app-data.json");

  if (!fs.existsSync(appDataPath)) {
    throw new Error(
      `missing export app-data: ${path.relative(rootDir, appDataPath)}`,
    );
  }

  const appData = JSON.parse(fs.readFileSync(appDataPath, "utf8"));
  const htmlFiles = collectHtmlFiles(distDir);

  for (const htmlFile of htmlFiles) {
    fs.writeFileSync(
      htmlFile,
      injectHtml(fs.readFileSync(htmlFile, "utf8"), appData),
      "utf8",
    );
  }

  logger(`injected web shell into ${htmlFiles.length} html files`);

  return { appDataPath, htmlFiles };
}

module.exports = {
  collectHtmlFiles,
  injectHtml,
  injectWebShell,
};

if (require.main === module) {
  injectWebShell(process.cwd());
}
