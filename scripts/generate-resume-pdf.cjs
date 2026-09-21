#!/usr/bin/env node

const fs = require("fs");
const os = require("os");
const path = require("path");
const { execFileSync } = require("child_process");
const PDFDocument = require("pdfkit");
const {
  mdiMapMarker,
  mdiPhone,
  mdiEmail,
  mdiLinkedin,
  mdiGithub,
  mdiWeb,
} = require("@mdi/js");

// Reuses the exact icon set the app itself uses for these contact links
// (src/components/icon/WnaIcon/WnaIconMap.ts) so the PDF and the live site
// stay visually consistent. Xing has no Material Design Icon, so the app
// defines its glyph inline too — copied from the same source.
const ICONS = {
  mapMarker: mdiMapMarker,
  phone: mdiPhone,
  email: mdiEmail,
  linkedin: mdiLinkedin,
  github: mdiGithub,
  web: mdiWeb,
  xing: "M18.188 2h3.542L14.09 14.042l4.733 8.168h-3.542l-4.74-8.168L18.188 2zM9.913 7.08l2.19 3.744-3.51 6.096H5.052l3.51-6.096-2.19-3.744h3.542z",
};

const LABELS = {
  de: {
    profile: "Profil",
    experience: "Berufserfahrung",
    techStack: "Tech-Stack",
    tools: "Tools",
    softSkills: "Soft Skills",
    certificates: "Zertifikate",
    contact: "Kontakt",
    pageWord: "Seite",
    pageOfWord: "von",
  },
  en: {
    profile: "Profile",
    experience: "Professional Experience",
    techStack: "Tech Stack",
    tools: "Tools",
    softSkills: "Soft Skills",
    certificates: "Certifications",
    contact: "Contact",
    pageWord: "Page",
    pageOfWord: "of",
  },
};

const HEX_COLOR_PATTERN = /^#[0-9a-f]{6}$/i;
const TEXT_COLOR = "#1a1a1a";
const MUTED_COLOR = "#555555";
const DEFAULT_ACCENT_COLOR = "#61afa7";

// Mirrors the homepage's own curated preview: WnaHomeRoute passes
// maxItems={4} to WnaExperienceCard, so the resume shouldn't list more
// history than the live site's front page already shows.
const HOME_EXPERIENCE_LIMIT = 4;

function limitExperienceToHomepage(experience) {
  return experience.slice(0, HOME_EXPERIENCE_LIMIT);
}

// Each experience entry's own tech-stack pill row wraps onto multiple lines
// once it runs past ~5 short items, which reads as more cluttered than the
// entry's actual bullet content above it. Capping it keeps that row a
// single line; the full list still exists in the data and on the live site.
// A trailing "…" pill marks the row as cut off rather than silently
// implying that's the entry's whole tech stack.
const ENTRY_TECHSTACK_LIMIT = 5;

function limitEntryTechstack(entryTechstack) {
  if (entryTechstack.length <= ENTRY_TECHSTACK_LIMIT) {
    return entryTechstack;
  }
  return [...entryTechstack.slice(0, ENTRY_TECHSTACK_LIMIT), "…"];
}

const SIDEBAR_WIDTH = 190;
const SIDEBAR_PADDING = 22;
const SIDEBAR_CONTENT_WIDTH = SIDEBAR_WIDTH - SIDEBAR_PADDING * 2;
const MAIN_X = SIDEBAR_WIDTH + 36;
const PAGE_MARGINS = { top: 56, bottom: 56, left: MAIN_X, right: 44 };

function langSuffix(lang) {
  return lang === "de" ? "De" : "En";
}

function pickString(entry, baseKey, lang, fallback = "") {
  const suffixed = entry[`${baseKey}${langSuffix(lang)}`];
  if (typeof suffixed === "string" && suffixed.trim() !== "") {
    return suffixed;
  }

  const plain = entry[baseKey];
  return typeof plain === "string" && plain.trim() !== "" ? plain : fallback;
}

function pickStringArray(entry, baseKey, lang) {
  const suffixed = entry[`${baseKey}${langSuffix(lang)}`];
  if (Array.isArray(suffixed) && suffixed.length > 0) {
    return suffixed;
  }
  // The De/En field itself may be a plain string rather than an array (the
  // app's own AppDataInput type allows both) — missing this case silently
  // dropped the whole "Profil" section whenever descriptionDe/En was a
  // string instead of a string[].
  if (typeof suffixed === "string" && suffixed.trim() !== "") {
    return [suffixed];
  }

  const plain = entry[baseKey];
  if (Array.isArray(plain)) {
    return plain;
  }

  return typeof plain === "string" && plain.trim() !== "" ? [plain] : [];
}

function clampByte(value) {
  return Math.max(0, Math.min(255, Math.round(value)));
}

function hexToRgb(hex) {
  const normalized = hex.replace("#", "");
  const value = parseInt(normalized, 16);
  return { r: (value >> 16) & 255, g: (value >> 8) & 255, b: value & 255 };
}

function rgbToHex({ r, g, b }) {
  return `#${[r, g, b].map((c) => clampByte(c).toString(16).padStart(2, "0")).join("")}`;
}

function mixHexColors(hexA, hexB, ratio) {
  const a = hexToRgb(hexA);
  const b = hexToRgb(hexB);
  return rgbToHex({
    r: a.r + (b.r - a.r) * ratio,
    g: a.g + (b.g - a.g) * ratio,
    b: a.b + (b.b - a.b) * ratio,
  });
}

function buildColorPalette(accentColor) {
  const sidebar = mixHexColors(accentColor, "#000000", 0.55);
  return {
    accent: accentColor,
    sidebar,
    sidebarHeading: "#ffffff",
    sidebarText: mixHexColors(sidebar, "#ffffff", 0.8),
    sidebarMuted: mixHexColors(sidebar, "#ffffff", 0.55),
    skillTrack: mixHexColors(sidebar, "#ffffff", 0.2),
    skillFill: mixHexColors(sidebar, "#ffffff", 0.9),
    pillFill: mixHexColors(accentColor, "#ffffff", 0.85),
    pillText: mixHexColors(accentColor, "#000000", 0.25),
    timelineLine: mixHexColors(TEXT_COLOR, "#ffffff", 0.78),
  };
}

function groupDigits(digits, sizes) {
  const groups = [];
  let index = 0;
  for (const size of sizes) {
    if (index >= digits.length) {
      break;
    }
    groups.push(digits.slice(index, index + size));
    index += size;
  }
  if (index < digits.length) {
    const remainder = digits.slice(index);
    // A 1-2 digit leftover reads as an orphaned typo ("9809 1") rather than
    // a deliberate group — fold it into the previous group instead.
    if (groups.length > 0 && remainder.length <= 2) {
      groups[groups.length - 1] += remainder;
    } else {
      groups.push(remainder);
    }
  }
  return groups;
}

function formatPhoneNumber(raw) {
  if (typeof raw !== "string" || raw.trim() === "") {
    return "";
  }

  const hasCountryCode = raw.trim().startsWith("+");
  const digits = raw.replace(/\D/g, "");
  if (!digits) {
    return raw.trim();
  }

  if (hasCountryCode && digits.length > 2) {
    const countryCode = digits.slice(0, 2);
    const rest = digits.slice(2);
    return `+${countryCode} ${groupDigits(rest, [3, 3, 4]).join(" ")}`.trim();
  }

  return groupDigits(digits, [4, 3, 4]).join(" ");
}

// MDI icon paths use a 24x24 viewBox; scale to `size` and place the result
// with its top-left corner at (x, y).
function drawVectorIcon(doc, pathData, x, y, size, color) {
  const scale = size / 24;
  doc.save();
  doc.translate(x, y).scale(scale);
  doc.path(pathData).fill(color);
  doc.restore();
}

function prepareEmbeddableAvatar(rootDir, data, logger) {
  const avatarFileName =
    typeof data.profile?.avatar === "string" ? data.profile.avatar : "";

  if (!avatarFileName) {
    return { path: null, cleanup: () => {} };
  }

  const sourcePath = path.join(rootDir, ".aboutme", "images", avatarFileName);
  if (!fs.existsSync(sourcePath)) {
    return { path: null, cleanup: () => {} };
  }

  const tmpPngPath = path.join(
    os.tmpdir(),
    `resume-avatar-${process.pid}-${Date.now()}.png`,
  );

  try {
    // Re-encode (and downscale) through ImageMagick regardless of source
    // format: pdfkit can only embed PNG/JPEG, and an unresized source photo
    // would otherwise bloat the PDF far beyond what a ~90pt circle needs.
    execFileSync("convert", [sourcePath, "-resize", "240x240", tmpPngPath], {
      stdio: "ignore",
    });
    return {
      path: tmpPngPath,
      cleanup: () => fs.rmSync(tmpPngPath, { force: true }),
    };
  } catch (error) {
    logger(
      `resume PDF: could not convert avatar image (${
        error instanceof Error ? error.message : String(error)
      }), skipping photo`,
    );
    return { path: null, cleanup: () => {} };
  }
}

function drawSidebarDivider(doc, x, y, width, color) {
  doc
    .moveTo(x, y)
    .lineTo(x + width, y)
    .strokeColor(color)
    .lineWidth(0.75)
    .stroke();
  return y + 14;
}

function drawSidebarHeading(doc, text, x, y, width, colors) {
  const upperText = text.toUpperCase();
  doc.fillColor(colors.sidebarHeading).font("Helvetica-Bold").fontSize(10.5);
  doc.text(upperText, x, y, { width, characterSpacing: 0.5 });
  return y + doc.heightOfString(upperText, { width }) + 10;
}

function drawSkillBar(doc, x, y, width, height, ratio, trackColor, fillColor) {
  const radius = height / 2;
  doc.roundedRect(x, y, width, height, radius).fill(trackColor);
  const filledWidth = Math.max(height, width * Math.min(1, Math.max(0, ratio)));
  doc.roundedRect(x, y, filledWidth, height, radius).fill(fillColor);
}

function buildGoogleMapsUrl(addressParts) {
  if (addressParts.length === 0) {
    return undefined;
  }
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addressParts.join(", "))}`;
}

function buildContactLines(contact, siteUrl) {
  const lines = [];

  const addressParts = [
    contact.addressStreet,
    `${contact.addressZipCode ?? ""} ${contact.addressCity ?? ""}`.trim(),
    contact.addressCountry,
  ].filter((part) => typeof part === "string" && part.trim() !== "");
  if (addressParts.length > 0) {
    lines.push({
      icon: ICONS.mapMarker,
      // One line each for street / zip+city / country rather than a
      // comma-joined run — left to wrap on width alone, that string broke
      // wherever it happened to run out of room (e.g. mid zip code) instead
      // of at a sensible boundary.
      text: addressParts.join("\n"),
      link: buildGoogleMapsUrl(addressParts),
    });
  }
  if (typeof siteUrl === "string" && siteUrl.trim() !== "") {
    lines.push({
      icon: ICONS.web,
      text: siteUrl.replace(/^https?:\/\//, "").replace(/\/$/, ""),
      link: siteUrl,
    });
  }
  if (contact.phone) {
    const cleanPhone = contact.phone.replace(/\s+/g, "");
    lines.push({
      icon: ICONS.phone,
      text: formatPhoneNumber(contact.phone),
      link: `tel:${cleanPhone}`,
    });
  }
  if (contact.email) {
    lines.push({
      icon: ICONS.email,
      text: contact.email,
      link: `mailto:${contact.email}`,
    });
  }
  if (contact.linkedin) {
    lines.push({
      icon: ICONS.linkedin,
      text: "LinkedIn",
      link: contact.linkedin,
    });
  }
  if (contact.xing) {
    lines.push({ icon: ICONS.xing, text: "Xing", link: contact.xing });
  }
  if (contact.github) {
    lines.push({ icon: ICONS.github, text: "GitHub", link: contact.github });
  }

  return lines;
}

// The sidebar deliberately shows short labels ("LinkedIn", "Xing") next to
// an icon, with the actual URL only in the (invisible-to-a-parser) link
// annotation — fine when a human is reading it next to a recognizable
// logo, useless for an ATS that only extracts visible text. The ATS
// variant needs the full address as text; it keeps the link annotation
// too since that costs nothing and still helps a human who opens this
// exact file, but never relies on it to carry information the text alone
// doesn't already have.
function buildAtsContactLines(contact, siteUrl) {
  const lines = [];

  const addressParts = [
    contact.addressStreet,
    `${contact.addressZipCode ?? ""} ${contact.addressCity ?? ""}`.trim(),
    contact.addressCountry,
  ].filter((part) => typeof part === "string" && part.trim() !== "");
  if (addressParts.length > 0) {
    lines.push({
      text: addressParts.join("\n"),
      link: buildGoogleMapsUrl(addressParts),
    });
  }
  if (typeof siteUrl === "string" && siteUrl.trim() !== "") {
    lines.push({ text: siteUrl, link: siteUrl });
  }
  if (contact.phone) {
    const cleanPhone = contact.phone.replace(/\s+/g, "");
    lines.push({
      text: formatPhoneNumber(contact.phone),
      link: `tel:${cleanPhone}`,
    });
  }
  if (contact.email) {
    lines.push({ text: contact.email, link: `mailto:${contact.email}` });
  }
  if (contact.linkedin) {
    lines.push({ text: contact.linkedin, link: contact.linkedin });
  }
  if (contact.xing) {
    lines.push({ text: contact.xing, link: contact.xing });
  }
  if (contact.github) {
    lines.push({ text: contact.github, link: contact.github });
  }

  return lines;
}

const SKILL_LEVEL_RATIOS = {
  junior: 0.35,
  mid: 0.6,
  senior: 0.8,
  expert: 1,
};
const DEFAULT_SKILL_LEVEL = "mid";

function levelToRatio(level) {
  return SKILL_LEVEL_RATIOS[level] ?? SKILL_LEVEL_RATIOS[DEFAULT_SKILL_LEVEL];
}

// techStack/tools stay plain string[] (that's the type the live app's own
// AppData/WnaTechStackCard already expects for techStack, and tools
// mirrors it for consistency) — skillLevels is a separate name->level
// lookup that only this script reads, so adding levels can't silently
// break the live Tech-Stack display by changing a shared field's shape.
function buildSkillEntries(skillGroup, skillLevels, limits) {
  const { primaryLimit = 5, secondaryLimit = 5, totalLimit = 8 } = limits || {};
  const primary = Array.isArray(skillGroup.primary) ? skillGroup.primary : [];
  const secondary = Array.isArray(skillGroup.secondary)
    ? skillGroup.secondary
    : [];
  const toEntry = (label) => ({
    label,
    ratio: levelToRatio(skillLevels?.[label]),
  });

  return [
    ...primary.slice(0, primaryLimit).map(toEntry),
    ...secondary.slice(0, secondaryLimit).map(toEntry),
  ].slice(0, totalLimit);
}

// Soft skills and certificates are both shown as a plain pill list in the
// main column (see drawMainColumnPillBlock) rather than sidebar skill bars,
// so both just need each item's resolved label, not a proficiency ratio.
function buildLocalizedNameList(items, lang) {
  const list = Array.isArray(items) ? items : [];
  return list
    .map(
      (item) =>
        (lang === "de" ? item?.nameDe : item?.nameEn) ??
        item?.nameDe ??
        item?.nameEn ??
        "",
    )
    .filter((label) => label !== "");
}

function capitalize(word) {
  return typeof word === "string" && word.length > 0
    ? word.charAt(0).toUpperCase() + word.slice(1)
    : word;
}

// The designed resume shows proficiency as a bar (ratio); the ATS variant
// has no visual bars, so it needs the level as plain, extractable text
// instead — same source data, different presentation. Primary/secondary
// only controlled bar ordering there; the ATS version just lists every
// item, since there's no sidebar space constraint to curate against.
function buildAtsSkillList(skillGroup, skillLevels) {
  const primary = Array.isArray(skillGroup.primary) ? skillGroup.primary : [];
  const secondary = Array.isArray(skillGroup.secondary)
    ? skillGroup.secondary
    : [];
  return [...primary, ...secondary].map((name) => ({
    name,
    level: skillLevels?.[name] ?? DEFAULT_SKILL_LEVEL,
  }));
}

function buildAtsSoftSkillList(softSkills, lang) {
  const primary = Array.isArray(softSkills?.primary) ? softSkills.primary : [];
  return primary
    .map((item) => ({
      name:
        (lang === "de" ? item?.nameDe : item?.nameEn) ??
        item?.nameDe ??
        item?.nameEn ??
        "",
      level: item?.level ?? DEFAULT_SKILL_LEVEL,
    }))
    .filter((entry) => entry.name !== "");
}

// langCode is required (not folded into pathSegment by the caller) since a
// plain Portfolio file name alone no longer says which language it is --
// see buildPortfolioFileName below.
function buildAbsoluteUrl(siteUrl, langCode, pathSegment) {
  const base = typeof siteUrl === "string" ? siteUrl.replace(/\/+$/, "") : "";
  return `${base}/${langCode.toUpperCase()}/${pathSegment}`;
}

const GERMAN_DIACRITICS = {
  ä: "ae",
  ö: "oe",
  ü: "ue",
  Ä: "Ae",
  Ö: "Oe",
  Ü: "Ue",
  ß: "ss",
};

// A profile name can contain characters that are neither filesystem- nor
// URL-safe (umlauts, accents, punctuation) — this filename ends up both as
// an actual file on disk and as a URL path segment (buildAbsoluteUrl,
// getResumePdfUrl on the website side), so it needs to survive both
// untouched rather than relying on percent-encoding to paper over it.
// German umlauts/ß are spelled out since this is a German name; anything
// else non-ASCII is dropped rather than guessed at.
function slugifyName(name) {
  if (typeof name !== "string") {
    return "";
  }
  return name
    .replace(/[äöüÄÖÜß]/g, (char) => GERMAN_DIACRITICS[char])
    .trim()
    .replace(/\s+/g, "_")
    .replace(/[^A-Za-z0-9_-]/g, "");
}

// "Vorname_Nachname_-_Portfolio.pdf" / "..._ATS.pdf" — a filename a
// recipient recognizes and can save without renaming, rather than the
// generic "Portfolio.pdf" every candidate's export used to share. Unlike
// buildCvFileName in generate-cv-pdf.cjs, "Portfolio" is the same word in
// German and English, so it carries no _DE/_EN suffix at all -- the DE and
// EN files are told apart by which public/DE//public/EN/ folder they land
// in (see generateResumePdf below), not by anything in the name itself.
// langCode is still accepted, purely so every call site here and in
// generate-application-package.cjs reads the same way buildCvFileName's
// calls do; it has no effect on the returned string.
function buildPortfolioFileName(name, langCode, { ats = false } = {}) {
  const atsSuffix = ats ? "_ATS" : "";
  return `${slugifyName(name)}_-_Portfolio${atsSuffix}.pdf`;
}

// Renders a "heading + one bar per skill" block (used for both Tech-Stack
// and Tools) and returns the y position right after it. Stops early rather
// than overflowing the sidebar if there isn't room for more bars.
function drawSkillBarSection(doc, heading, skills, x, y, width, colors) {
  if (skills.length === 0) {
    return y;
  }

  let cursorY = drawSidebarHeading(doc, heading, x, y, width, colors);
  const barHeight = 5;
  const bottomLimit = doc.page.height - 30;

  for (const skill of skills) {
    if (cursorY + 20 > bottomLimit) {
      break;
    }

    doc.font("Helvetica").fontSize(9).fillColor(colors.sidebarText);
    doc.text(skill.label, x, cursorY, { width });
    cursorY += doc.heightOfString(skill.label, { width }) + 4;

    drawSkillBar(
      doc,
      x,
      cursorY,
      width,
      barHeight,
      skill.ratio,
      colors.skillTrack,
      colors.skillFill,
    );
    cursorY += barHeight + 12;
  }

  return cursorY;
}

// Measures a string at each candidate size (widthOfString ignores a
// `fontSize` passed via its options — it only reads whatever size was last
// set with `.fontSize()`) and returns the largest size that still fits on
// one line, so long names don't wrap into an uneven stack.
function fitFontSize(doc, text, maxWidth, { max, min, font }) {
  doc.font(font);
  let size = max;
  doc.fontSize(size);
  while (size > min && doc.widthOfString(text) > maxWidth) {
    size -= 0.5;
    doc.fontSize(size);
  }
  return size;
}

// pageIndex is 0 for page 1 (photo/contact/tech-stack), 1 for the second
// page (compact name + Tools), and 2+ for any page after that (just the
// compact name — Tools doesn't repeat a second time). Soft Skills isn't a
// sidebar section at all; it renders as its own block in the main column,
// under Berufserfahrung/Experience.
function drawSidebar(doc, data, lang, labels, colors, avatarPath, pageIndex) {
  // The sidebar deliberately draws all the way down to the physical page
  // edge (its background rect spans 0 to page.height, ignoring margins
  // entirely), but pdfkit's automatic page-break check on `.text()` still
  // fires based on `page.margins.bottom` regardless of whether the call
  // used explicit x/y — any sidebar row landing between our own bottom
  // guard and the real margin silently triggered a real addPage() mid-draw
  // (which re-fired the pageAdded listener and left later content
  // rendering on the wrong page). Zeroing the margin for the whole
  // function is the same fix as the page-footer draw, applied everywhere
  // the sidebar might get tall enough to reach that zone.
  const originalBottomMargin = doc.page.margins.bottom;
  doc.page.margins.bottom = 0;

  try {
    drawSidebarContent(doc, data, lang, labels, colors, avatarPath, pageIndex);
  } finally {
    doc.page.margins.bottom = originalBottomMargin;
  }
}

function drawSidebarContent(
  doc,
  data,
  lang,
  labels,
  colors,
  avatarPath,
  pageIndex,
) {
  const contact = data.contact ?? {};
  const techStack = data.techStack ?? {};
  const tools = data.tools ?? {};
  const name = typeof data.profile?.name === "string" ? data.profile.name : "";
  const title = pickString(data.profile ?? {}, "title", lang);

  doc.rect(0, 0, SIDEBAR_WIDTH, doc.page.height).fill(colors.sidebar);

  const contentX = SIDEBAR_PADDING;
  const contentWidth = SIDEBAR_CONTENT_WIDTH;
  let cursorY = 40;

  if (pageIndex > 0) {
    // Continuation pages keep the same colored column running down the
    // page instead of stopping after page 1 or repeating the photo and
    // contact details — just a compact name label to keep the page
    // identifiable, then (on the first continuation page only) a Tools
    // section so it doesn't just repeat on every later page too.
    const compactSize = fitFontSize(doc, name, contentWidth, {
      max: 13,
      min: 10,
      font: "Helvetica-Bold",
    });
    doc.fillColor(colors.sidebarHeading).fontSize(compactSize);
    doc.text(name, contentX, cursorY, {
      width: contentWidth,
      lineBreak: false,
    });
    cursorY += doc.heightOfString(name, { width: contentWidth }) + 20;

    if (pageIndex === 1) {
      cursorY = drawSidebarDivider(
        doc,
        contentX,
        cursorY,
        contentWidth,
        colors.sidebarMuted,
      );

      const toolEntries = buildSkillEntries(tools, data.skillLevels, {
        primaryLimit: 8,
        secondaryLimit: 8,
        totalLimit: 16,
      });
      drawSkillBarSection(
        doc,
        labels.tools,
        toolEntries,
        contentX,
        cursorY,
        contentWidth,
        colors,
      );
    }
    return;
  }

  if (avatarPath) {
    const radius = 44;
    const cx = SIDEBAR_WIDTH / 2;
    const cy = cursorY + radius;
    doc.save();
    doc.circle(cx, cy, radius).clip();
    try {
      doc.image(avatarPath, cx - radius, cy - radius, {
        fit: [radius * 2, radius * 2],
        align: "center",
        valign: "center",
      });
    } finally {
      doc.restore();
    }
    cursorY = cy + radius + 20;
  } else {
    cursorY += 10;
  }

  // Shrink the name to whatever size keeps it on one line, rather than
  // letting long first/last names wrap into an uneven two-line stack.
  const nameFontSize = fitFontSize(doc, name, contentWidth, {
    max: 17,
    min: 12,
    font: "Helvetica-Bold",
  });
  doc.fillColor(colors.sidebarHeading).fontSize(nameFontSize);
  doc.text(name, contentX, cursorY, { width: contentWidth, lineBreak: false });
  cursorY += doc.heightOfString(name, { width: contentWidth }) + 4;

  if (title) {
    const upperTitle = title.toUpperCase();
    doc.fillColor(colors.sidebarMuted).font("Helvetica").fontSize(9.5);
    doc.text(upperTitle, contentX, cursorY, {
      width: contentWidth,
      characterSpacing: 0.5,
    });
    cursorY += doc.heightOfString(upperTitle, { width: contentWidth }) + 16;
  } else {
    cursorY += 10;
  }

  cursorY = drawSidebarDivider(
    doc,
    contentX,
    cursorY,
    contentWidth,
    colors.sidebarMuted,
  );
  cursorY = drawSidebarHeading(
    doc,
    labels.contact,
    contentX,
    cursorY,
    contentWidth,
    colors,
  );

  const iconSize = 10;
  const iconTextGap = 8;
  const contactTextX = contentX + iconSize + iconTextGap;
  const contactTextWidth = contentWidth - iconSize - iconTextGap;

  for (const line of buildContactLines(contact, data.siteUrl)) {
    doc.font("Helvetica").fontSize(9).fillColor(colors.sidebarText);
    const textHeight = doc.heightOfString(line.text, {
      width: contactTextWidth,
    });
    // Center the icon on the text's first line rather than its nominal
    // top: pdfkit's text `y` is the top of the line box (including
    // leading), not the ink, while the icon's bounding box has no such
    // padding — aligning both to the same `y` left the icon sitting
    // visibly higher than the text.
    const iconY = cursorY + (doc.currentLineHeight() - iconSize) / 2;
    drawVectorIcon(
      doc,
      line.icon,
      contentX,
      iconY,
      iconSize,
      colors.sidebarMuted,
    );
    doc.text(line.text, contactTextX, cursorY, {
      width: contactTextWidth,
      link: line.link,
    });
    cursorY += Math.max(textHeight, iconSize) + 6;
  }

  // Same reasoning as the Tools section below: default limits (5/5/8) are
  // tighter than the real list, and silently dropped items — including
  // PostgreSQL — well before the sidebar ran out of actual vertical room.
  // Let drawSkillBarSection's own bottom-of-page check be the real limit.
  // Only the primary tier is shown in the resume — techStack.secondary
  // still exists for the live site's own Tech-Stack page (WnaTechStackCard
  // reads both groups), this just doesn't repeat it here.
  const skills = buildSkillEntries(techStack, data.skillLevels, {
    primaryLimit: 12,
    secondaryLimit: 0,
    totalLimit: 12,
  });
  if (skills.length > 0) {
    cursorY = drawSidebarDivider(
      doc,
      contentX,
      cursorY + 6,
      contentWidth,
      colors.sidebarMuted,
    );
    drawSkillBarSection(
      doc,
      labels.techStack,
      skills,
      contentX,
      cursorY,
      contentWidth,
      colors,
    );
  }
}

function drawSectionHeading(doc, text, accentColor) {
  // moveDown's distance scales with whatever font size was last active. Left
  // ambient, a heading following something drawn in a small font (e.g. an
  // 8pt pill row) got a visibly smaller gap above it than one following
  // regular body text — every heading should read as the same fixed break,
  // so pin the baseline font first regardless of what preceded this call.
  doc.font("Helvetica").fontSize(10.5);
  doc.moveDown(1);
  doc
    .fillColor(accentColor)
    .font("Helvetica-Bold")
    .fontSize(13)
    .text(text.toUpperCase(), { characterSpacing: 0.5 });
  doc
    .moveTo(doc.x, doc.y + 2)
    .lineTo(doc.page.width - doc.page.margins.right, doc.y + 2)
    .strokeColor(accentColor)
    .lineWidth(1)
    .stroke();
  doc.moveDown(0.75);
  doc.fillColor(TEXT_COLOR);
}

const TIMELINE_DOT_RADIUS = 4;
const TIMELINE_INDENT = 18;

function drawPillRow(doc, items, x, y, maxWidth, options) {
  const {
    fontSize = 8,
    paddingX = 6,
    paddingY = 3,
    gapX = 5,
    gapY = 5,
    textColor,
    fillColor,
    font = "Helvetica",
    measureOnly = false,
  } = options;

  doc.font(font).fontSize(fontSize);
  const pillHeight = fontSize + paddingY * 2;
  let cursorX = x;
  let cursorY = y;

  for (const item of items) {
    const pillWidth = doc.widthOfString(item) + paddingX * 2;

    if (cursorX + pillWidth > x + maxWidth && cursorX > x) {
      cursorX = x;
      cursorY += pillHeight + gapY;
    }

    // Sharing this wrapping loop between drawing and measuring (rather than
    // reimplementing it separately for a height estimate) guarantees the
    // upfront "does this entry fit" check in buildMainColumn can never
    // disagree with what actually gets drawn.
    if (!measureOnly) {
      doc
        .roundedRect(cursorX, cursorY, pillWidth, pillHeight, pillHeight / 2)
        .fill(fillColor);
      doc
        .fillColor(textColor)
        .text(item, cursorX + paddingX, cursorY + paddingY, {
          lineBreak: false,
        });
    }

    cursorX += pillWidth + gapX;
  }

  return cursorY + pillHeight;
}

function buildMainColumn(doc, data, lang, labels, accentColor, colors) {
  const profile = data.profile ?? {};
  const experience = limitExperienceToHomepage(
    Array.isArray(data.experience) ? data.experience : [],
  );
  const description = pickStringArray(profile, "description", lang);

  if (description.length > 0) {
    drawSectionHeading(doc, labels.profile, accentColor);
    doc.font("Helvetica").fontSize(10.5).fillColor(TEXT_COLOR);
    description.forEach((paragraph, index) => {
      if (index > 0) {
        doc.moveDown(1);
      }
      doc.text(paragraph);
    });
  }

  if (experience.length > 0) {
    drawSectionHeading(doc, labels.experience, accentColor);

    // A timeline, like the app's own WnaExperienceCard: one continuous
    // line down the left edge of the entry list with a dot per entry. The
    // line is drawn as a segment between each pair of consecutive dots
    // rather than one shape spanning the whole list, since the list can
    // span multiple pages — `previousDotPage` resets the run whenever an
    // entry's dot lands on a new page, so no segment is drawn crossing a
    // page boundary.
    const timelineX = doc.x;
    let previousDotY = null;
    let previousDotPage = null;

    experience.forEach((entry, index) => {
      if (index > 0) {
        doc.moveDown(1.1);
      }

      const period = pickString(entry, "period", lang);
      const role = pickString(entry, "role", lang);
      const company = typeof entry.company === "string" ? entry.company : "";
      const entryDescription = pickString(entry, "description", lang);
      const entryTechstack = limitEntryTechstack(
        Array.isArray(entry.techstack) ? entry.techstack : [],
      );
      const headingText = [role, company].filter(Boolean).join(" – ");
      const contentWidth =
        doc.page.width - doc.page.margins.right - (timelineX + TIMELINE_INDENT);

      // Measure the whole entry (heading through pills) before drawing any
      // of it, and push the entire thing to the next page as a unit if it
      // doesn't fit — checking only the heading (as an earlier version
      // did) let an entry start near the bottom of a page and then tear
      // apart mid-description or mid-pill-row, stranding the timeline dot
      // from most of its own content.
      let entryHeight = 0;
      doc.font("Helvetica-Bold").fontSize(11);
      entryHeight += doc.heightOfString(headingText, { width: contentWidth });
      doc.font("Helvetica").fontSize(9.5);
      entryHeight += doc.heightOfString(period, { width: contentWidth });

      if (entryDescription) {
        doc.font("Helvetica").fontSize(10);
        entryHeight +=
          doc.heightOfString(entryDescription, { width: contentWidth }) + 5;
      }

      if (entryTechstack.length > 0) {
        entryHeight +=
          drawPillRow(doc, entryTechstack, 0, 0, contentWidth, {
            measureOnly: true,
          }) + 7;
      }

      if (doc.y + entryHeight > doc.page.height - doc.page.margins.bottom) {
        doc.addPage();
      }

      const dotX = timelineX + TIMELINE_DOT_RADIUS;
      const dotY = doc.y + 5;

      if (previousDotPage === doc.page) {
        doc
          .moveTo(dotX, previousDotY + TIMELINE_DOT_RADIUS)
          .lineTo(dotX, dotY - TIMELINE_DOT_RADIUS)
          .strokeColor(colors.timelineLine)
          .lineWidth(2)
          .stroke();
      } else if (previousDotY !== null) {
        // A page break landed between two entries. Rather than just
        // stopping the line at the previous page's last dot and starting a
        // bare, disconnected one here, cap the old page with a stub
        // running to its bottom margin and lead into this dot with one
        // from the top margin, so the break reads as "the timeline
        // continues onto the next page" instead of ending abruptly.
        const currentPage = doc.page;
        doc.page = previousDotPage;
        doc
          .moveTo(dotX, previousDotY + TIMELINE_DOT_RADIUS)
          .lineTo(dotX, previousDotPage.height - previousDotPage.margins.bottom)
          .strokeColor(colors.timelineLine)
          .lineWidth(2)
          .stroke();
        doc.page = currentPage;

        doc
          .moveTo(dotX, PAGE_MARGINS.top)
          .lineTo(dotX, dotY - TIMELINE_DOT_RADIUS)
          .strokeColor(colors.timelineLine)
          .lineWidth(2)
          .stroke();
      }
      doc.circle(dotX, dotY, TIMELINE_DOT_RADIUS).fill(accentColor);
      previousDotY = dotY;
      previousDotPage = doc.page;

      doc.x = timelineX + TIMELINE_INDENT;
      doc
        .font("Helvetica-Bold")
        .fontSize(11)
        .fillColor(TEXT_COLOR)
        .text(headingText, { width: contentWidth });
      doc.x = timelineX + TIMELINE_INDENT;
      doc.font("Helvetica").fontSize(9.5).fillColor(MUTED_COLOR).text(period);

      if (entryDescription) {
        doc.moveDown(0.3);
        doc
          .font("Helvetica")
          .fontSize(10)
          .fillColor(TEXT_COLOR)
          .text(entryDescription);
      }

      // detailsDe/En (the bullet list of individual tasks/achievements) is
      // deliberately not rendered here: the resume already summarizes each
      // role via entryDescription, and the live site's own experience
      // timeline is where the full bullet-level detail lives instead.

      if (entryTechstack.length > 0) {
        doc.moveDown(0.3);
        const columnLeft = doc.x;
        const maxWidth = doc.page.width - doc.page.margins.right - columnLeft;
        const bottomY = drawPillRow(
          doc,
          entryTechstack,
          columnLeft,
          doc.y,
          maxWidth,
          { textColor: colors.pillText, fillColor: colors.pillFill },
        );
        doc.x = columnLeft;
        doc.y = bottomY;
      }
    });
  }

  // Soft Skills used to live in the sidebar of a third page, only reachable
  // once Experience overflowed that far. Capping Experience to the
  // homepage's own preview length means that third page mostly stopped
  // happening, which silently dropped the whole section — so it (and
  // Certificates, which never had a sidebar section at all) render here
  // instead, as optional blocks in the main column right under
  // Berufserfahrung/Experience, wherever that naturally ends.
  drawMainColumnPillBlock(
    doc,
    labels.softSkills,
    buildLocalizedNameList(data.softSkills?.primary, lang),
    accentColor,
    colors,
  );

  drawMainColumnPillBlock(
    doc,
    labels.certificates,
    buildLocalizedNameList(data.certificates, lang),
    accentColor,
    colors,
  );
}

// Renders a "heading + pill row" block in the main column (used for both
// Soft Skills and Certificates) and leaves the cursor right after it. A
// no-op when there's nothing to show, since both sections are optional.
function drawMainColumnPillBlock(doc, heading, items, accentColor, colors) {
  if (items.length === 0) {
    return;
  }

  doc.x = PAGE_MARGINS.left;
  const blockWidth = doc.page.width - doc.page.margins.right - doc.x;
  const pillsHeight = drawPillRow(doc, items, 0, 0, blockWidth, {
    measureOnly: true,
  });

  // Check before drawing anything so the heading can't get orphaned alone
  // at the bottom of a page while the pills it labels start the next one.
  // 45 is a generous estimate of drawSectionHeading's own height (moveDown
  // + one heading line + underline + moveDown) at its fixed 13pt heading
  // font.
  if (doc.y + 45 + pillsHeight > doc.page.height - doc.page.margins.bottom) {
    doc.addPage();
  }

  doc.x = PAGE_MARGINS.left;
  drawSectionHeading(doc, heading, accentColor);
  const columnLeft = doc.x;
  const maxWidth = doc.page.width - doc.page.margins.right - columnLeft;
  const bottomY = drawPillRow(doc, items, columnLeft, doc.y, maxWidth, {
    textColor: colors.pillText,
    fillColor: colors.pillFill,
  });
  doc.x = columnLeft;
  doc.y = bottomY;
}

function drawAtsSkillLine(doc, heading, entries) {
  if (entries.length === 0) {
    return;
  }

  doc.moveDown(1);
  doc
    .font("Helvetica-Bold")
    .fontSize(12)
    .fillColor(TEXT_COLOR)
    .text(heading.toUpperCase());
  doc.moveDown(0.3);
  doc
    .font("Helvetica")
    .fontSize(10)
    .fillColor(TEXT_COLOR)
    .text(
      entries
        .map((entry) => `${entry.name} [${capitalize(entry.level)}]`)
        .join(", "),
    );
}

// Same idea as drawAtsSkillLine, but for a plain name list with no
// proficiency level to spell out (Certificates has no bar/level concept).
function drawAtsPlainList(doc, heading, items) {
  if (items.length === 0) {
    return;
  }

  doc.moveDown(1);
  doc
    .font("Helvetica-Bold")
    .fontSize(12)
    .fillColor(TEXT_COLOR)
    .text(heading.toUpperCase());
  doc.moveDown(0.3);
  doc
    .font("Helvetica")
    .fontSize(10)
    .fillColor(TEXT_COLOR)
    .text(items.join(", "));
}

// A deliberately plain, single-column companion PDF: no sidebar, no bars,
// no photo, skill levels spelled out as text. Two-column layouts are a
// known weak point for Applicant Tracking Systems, which often extract PDF
// text by position on the page and can interleave sidebar content into the
// body — this variant trades the designed look for something a parser
// can't misread, for candidates forwarding through an ATS-gated pipeline.
function writeAtsResumePdf(filePath, data, lang) {
  return new Promise((resolve, reject) => {
    const margins = { top: 50, bottom: 50, left: 50, right: 50 };
    const doc = new PDFDocument({
      size: "A4",
      margins,
      bufferPages: true,
      info: {
        Title: typeof data.profile?.name === "string" ? data.profile.name : "",
      },
    });
    const stream = fs.createWriteStream(filePath);

    stream.on("finish", resolve);
    stream.on("error", reject);
    doc.on("error", reject);

    doc.pipe(stream);

    const labels = LABELS[lang];
    const profile = data.profile ?? {};
    const contact = data.contact ?? {};
    const name = typeof profile.name === "string" ? profile.name : "";
    const title = pickString(profile, "title", lang);
    const description = pickStringArray(profile, "description", lang);
    const experience = limitExperienceToHomepage(
      Array.isArray(data.experience) ? data.experience : [],
    );

    doc.font("Helvetica-Bold").fontSize(20).fillColor(TEXT_COLOR).text(name);
    if (title) {
      doc.font("Helvetica").fontSize(12).fillColor(MUTED_COLOR).text(title);
    }

    doc.moveDown(1);
    doc
      .font("Helvetica-Bold")
      .fontSize(12)
      .fillColor(TEXT_COLOR)
      .text(labels.contact.toUpperCase());
    doc.moveDown(0.3);
    doc.font("Helvetica").fontSize(10).fillColor(TEXT_COLOR);
    for (const line of buildAtsContactLines(contact, data.siteUrl)) {
      doc.text(line.text, { link: line.link });
    }

    if (description.length > 0) {
      doc.moveDown(1);
      doc
        .font("Helvetica-Bold")
        .fontSize(12)
        .fillColor(TEXT_COLOR)
        .text(labels.profile.toUpperCase());
      doc.moveDown(0.3);
      doc.font("Helvetica").fontSize(10).fillColor(TEXT_COLOR);
      description.forEach((paragraph, index) => {
        if (index > 0) {
          doc.moveDown(0.5);
        }
        doc.text(paragraph);
      });
    }

    drawAtsSkillLine(
      doc,
      labels.techStack,
      buildAtsSkillList(data.techStack ?? {}, data.skillLevels),
    );
    drawAtsSkillLine(
      doc,
      labels.tools,
      buildAtsSkillList(data.tools ?? {}, data.skillLevels),
    );
    drawAtsSkillLine(
      doc,
      labels.softSkills,
      buildAtsSoftSkillList(data.softSkills, lang),
    );
    drawAtsPlainList(
      doc,
      labels.certificates,
      buildLocalizedNameList(data.certificates, lang),
    );

    if (experience.length > 0) {
      doc.moveDown(1);
      doc
        .font("Helvetica-Bold")
        .fontSize(12)
        .fillColor(TEXT_COLOR)
        .text(labels.experience.toUpperCase());

      experience.forEach((entry, index) => {
        doc.moveDown(index === 0 ? 0.3 : 0.9);

        const period = pickString(entry, "period", lang);
        const role = pickString(entry, "role", lang);
        const company = typeof entry.company === "string" ? entry.company : "";
        const entryDescription = pickString(entry, "description", lang);
        const entryTechstack = limitEntryTechstack(
          Array.isArray(entry.techstack) ? entry.techstack : [],
        );

        doc
          .font("Helvetica-Bold")
          .fontSize(11)
          .fillColor(TEXT_COLOR)
          .text([role, company].filter(Boolean).join(" – "));
        doc.font("Helvetica").fontSize(9.5).fillColor(MUTED_COLOR).text(period);

        if (entryDescription) {
          doc.moveDown(0.2);
          doc
            .font("Helvetica")
            .fontSize(10)
            .fillColor(TEXT_COLOR)
            .text(entryDescription);
        }

        // Same reasoning as the designed PDF: detailsDe/En bullets aren't
        // shown here either, so both variants stay in sync.

        if (entryTechstack.length > 0) {
          doc.moveDown(0.2);
          doc
            .font("Helvetica-Oblique")
            .fontSize(9)
            .fillColor(MUTED_COLOR)
            .text(`${labels.techStack}: ${entryTechstack.join(", ")}`);
        }
      });
    }

    const pageRange = doc.bufferedPageRange();
    for (
      let i = pageRange.start;
      i < pageRange.start + pageRange.count;
      i += 1
    ) {
      doc.switchToPage(i);
      const originalBottomMargin = doc.page.margins.bottom;
      doc.page.margins.bottom = 0;
      doc
        .font("Helvetica")
        .fontSize(8)
        .fillColor(MUTED_COLOR)
        .text(
          `${labels.pageWord} ${i + 1} ${labels.pageOfWord} ${pageRange.count}`,
          margins.left,
          doc.page.height - 30,
          {
            width: doc.page.width - margins.left - margins.right,
            lineBreak: false,
          },
        );
      doc.page.margins.bottom = originalBottomMargin;
    }

    doc.end();
  });
}

function writeResumePdf(filePath, data, lang, avatarPath) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      margins: PAGE_MARGINS,
      // Needed to go back and stamp "Page X of Y" on every page once the
      // total page count is known, after all content has been drawn.
      bufferPages: true,
      info: {
        Title: typeof data.profile?.name === "string" ? data.profile.name : "",
      },
    });
    const stream = fs.createWriteStream(filePath);

    stream.on("finish", resolve);
    stream.on("error", reject);
    doc.on("error", reject);

    doc.pipe(stream);

    const accentColor = HEX_COLOR_PATTERN.test(data.accentColor ?? "")
      ? data.accentColor
      : DEFAULT_ACCENT_COLOR;
    const colors = buildColorPalette(accentColor);
    const labels = LABELS[lang];

    // drawSidebar positions text with the explicit x/y overload, which
    // leaves the document's auto-flow cursor (and its fillColor/font)
    // wherever its last line used, not reset to the main column's
    // top-left. If a paragraph gets interrupted mid-flow by an automatic
    // page break, pdfkit resumes drawing its remaining lines with whatever
    // style is currently active — without resetting both cursor and style
    // here, the continuation would render at the wrong position and/or in
    // the sidebar's light color.
    const resetColumnCursor = () => {
      doc.x = PAGE_MARGINS.left;
      doc.y = PAGE_MARGINS.top;
      doc.font("Helvetica").fontSize(10).fillColor(TEXT_COLOR);
    };

    let pageIndex = 0;
    drawSidebar(doc, data, lang, labels, colors, avatarPath, pageIndex);
    resetColumnCursor();

    // Experience can overflow onto further pages. The colored sidebar
    // column keeps running down every page rather than only appearing on
    // page 1 — but instead of repeating the same photo/contact/tech-stack,
    // continuation pages show a compact name label plus (on the first one
    // only) a Tools section, so the column stays visually consistent
    // without just duplicating page 1's content over and over.
    doc.on("pageAdded", () => {
      pageIndex += 1;
      drawSidebar(doc, data, lang, labels, colors, avatarPath, pageIndex);
      resetColumnCursor();
    });

    buildMainColumn(doc, data, lang, labels, accentColor, colors);

    const atsFileName = buildPortfolioFileName(data.profile?.name, lang, {
      ats: true,
    });
    const atsUrl = buildAbsoluteUrl(data.siteUrl, lang, atsFileName);
    const atsLinkLabel =
      lang === "de" ? "Text-Version (ATS)" : "Text-only version (ATS)";

    const pageRange = doc.bufferedPageRange();
    for (
      let i = pageRange.start;
      i < pageRange.start + pageRange.count;
      i += 1
    ) {
      doc.switchToPage(i);
      // The footer sits inside the normal bottom margin on purpose, but
      // pdfkit's auto page-break check (`y + lineHeight > page.height -
      // margins.bottom`) doesn't care whether the position was reached via
      // explicit x/y or ambient flow — drawing here would otherwise call
      // addPage() itself, which re-fires the `pageAdded` sidebar listener
      // and silently doubled the page count. Widening the margin to the
      // page edge for this one draw sidesteps the check without touching
      // any other layout.
      const originalBottomMargin = doc.page.margins.bottom;
      doc.page.margins.bottom = 0;
      const footerText = `${labels.pageWord} ${i + 1} ${labels.pageOfWord} ${pageRange.count}`;
      doc
        .font("Helvetica")
        .fontSize(8)
        .fillColor(colors.sidebarMuted)
        .text(footerText, SIDEBAR_PADDING, doc.page.height - 34, {
          width: SIDEBAR_CONTENT_WIDTH,
          lineBreak: false,
        });
      doc
        .font("Helvetica")
        .fontSize(7.5)
        .fillColor(colors.sidebarMuted)
        .text(atsLinkLabel, SIDEBAR_PADDING, doc.page.height - 20, {
          width: SIDEBAR_CONTENT_WIDTH,
          lineBreak: false,
          link: atsUrl,
          underline: true,
        });
      doc.page.margins.bottom = originalBottomMargin;
    }

    doc.end();
  });
}

async function generateResumePdf(rootDir, logger = console.log) {
  const sourceFile = path.join(rootDir, ".aboutme", "app-data.json");

  if (!fs.existsSync(sourceFile)) {
    throw new Error(
      `missing source file: ${path.relative(rootDir, sourceFile)}`,
    );
  }

  const data = JSON.parse(fs.readFileSync(sourceFile, "utf8"));
  // DE and EN each get their own subfolder under public/ root: since
  // "Portfolio"/"Portfolio_ATS" is the same file name in both languages
  // (see buildPortfolioFileName), the folder is what actually disambiguates
  // them, the same way public/files/DE//EN/ already does for the CV in
  // generate-cv-pdf.cjs.
  const deTargetDir = path.join(rootDir, "public", "DE");
  const enTargetDir = path.join(rootDir, "public", "EN");
  fs.mkdirSync(deTargetDir, { recursive: true });
  fs.mkdirSync(enTargetDir, { recursive: true });

  const name = data.profile?.name;
  const deTargetFile = path.join(
    deTargetDir,
    buildPortfolioFileName(name, "de"),
  );
  const enTargetFile = path.join(
    enTargetDir,
    buildPortfolioFileName(name, "en"),
  );
  const deAtsTargetFile = path.join(
    deTargetDir,
    buildPortfolioFileName(name, "de", { ats: true }),
  );
  const enAtsTargetFile = path.join(
    enTargetDir,
    buildPortfolioFileName(name, "en", { ats: true }),
  );
  const avatar = prepareEmbeddableAvatar(rootDir, data, logger);

  try {
    await writeResumePdf(deTargetFile, data, "de", avatar.path);
    await writeResumePdf(enTargetFile, data, "en", avatar.path);
    await writeAtsResumePdf(deAtsTargetFile, data, "de");
    await writeAtsResumePdf(enAtsTargetFile, data, "en");
  } finally {
    avatar.cleanup();
  }

  for (const targetFile of [
    deTargetFile,
    enTargetFile,
    deAtsTargetFile,
    enAtsTargetFile,
  ]) {
    logger(
      `generated .aboutme/app-data.json -> public/${path.relative(path.join(rootDir, "public"), targetFile)}`,
    );
  }

  return { deTargetFile, enTargetFile, deAtsTargetFile, enAtsTargetFile };
}

module.exports = {
  buildAtsSkillList,
  buildAtsSoftSkillList,
  buildGoogleMapsUrl,
  buildLocalizedNameList,
  buildPortfolioFileName,
  buildSkillEntries,
  formatPhoneNumber,
  generateResumePdf,
  groupDigits,
  limitEntryTechstack,
  pickString,
  pickStringArray,
  slugifyName,
};

if (require.main === module) {
  generateResumePdf(process.cwd()).catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  });
}
