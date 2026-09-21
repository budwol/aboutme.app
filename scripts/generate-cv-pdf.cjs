#!/usr/bin/env node

// A classic, single-column tabular CV ("Lebenslauf" in German), distinct
// from the richly-detailed two-column Portfolio PDF (see ADR 0010/0011).
// This is the "distinct future document" ADR 0010 explicitly deferred: a
// genuinely compact traditional CV, styled after a plain German Lebenslauf
// template (period in a narrow left column, content in a wide right
// column, no sidebar, no skill bars). It deliberately mirrors
// writeAtsResumePdf's plain-text approach in generate-resume-pdf.cjs rather
// than the designed PDF's timeline/keep-together layout logic, since a CV
// has the exact same "must read cleanly top-to-bottom" goal an ATS parser
// has -- the one deliberate exception is the designed variant's header,
// which borrows the Portfolio PDF's circular photo and icon-prefixed
// contact block (see writeCvPdf) purely as visual polish, skipped entirely
// in the ats variant like every other accent-colored element.

const fs = require("fs");
const os = require("os");
const path = require("path");
const { execFileSync } = require("child_process");
const PDFDocument = require("pdfkit");
const { mdiMapMarker, mdiPhone, mdiEmail, mdiWeb } = require("@mdi/js");

// Reuses the exact icon set the app itself uses for these contact links
// (src/components/icon/WnaIcon/WnaIconMap.ts), same as generate-resume-pdf.cjs
// -- only the subset this document's contact block actually shows.
const ICONS = {
  mapMarker: mdiMapMarker,
  phone: mdiPhone,
  email: mdiEmail,
  web: mdiWeb,
};

const LABELS = {
  de: {
    contact: "Kontakt",
    personal: "Persönliche Daten",
    birthDate: "Geburtsdatum",
    birthPlace: "Geburtsort",
    familyStatus: "Familienstand",
    experience: "Beruflicher Werdegang",
    education: "Bildungsweg",
    languages: "Sprachen",
    additional: "Sonstiges",
    drivingLicense: "Führerschein",
    certifications: "Zertifizierungen",
    interests: "Interessen",
    pageWord: "Seite",
    pageOfWord: "von",
    atsLink: "Text-Version (ATS)",
  },
  en: {
    contact: "Contact",
    personal: "Personal Details",
    birthDate: "Date of Birth",
    birthPlace: "Place of Birth",
    familyStatus: "Marital Status",
    experience: "Professional Experience",
    education: "Education",
    languages: "Languages",
    additional: "Additional Information",
    drivingLicense: "Driving License",
    certifications: "Certifications",
    interests: "Interests",
    pageWord: "Page",
    pageOfWord: "of",
    atsLink: "Text-only version (ATS)",
  },
};

const TEXT_COLOR = "#1a1a1a";
const MUTED_COLOR = "#555555";
const HEX_COLOR_PATTERN = /^#[0-9a-f]{6}$/i;
const DEFAULT_ACCENT_COLOR = "#61afa7";
const MONTH_NAMES_EN = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function langSuffix(lang) {
  return lang === "de" ? "De" : "En";
}

// Mirrors pickString in generate-resume-pdf.cjs -- reimplemented locally
// per ADR 0010's own precedent, since these two scripts are independent
// build tools that both read the same raw app-data.json shape.
function pickString(entry, baseKey, lang, fallback = "") {
  const suffixed = entry[`${baseKey}${langSuffix(lang)}`];
  if (typeof suffixed === "string" && suffixed.trim() !== "") {
    return suffixed;
  }

  const plain = entry[baseKey];
  return typeof plain === "string" && plain.trim() !== "" ? plain : fallback;
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

// Mirrors slugifyName in generate-resume-pdf.cjs (see that file's comment
// for why umlauts are spelled out rather than percent-encoded).
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

// The language lives in the word itself (a German "Lebenslauf" needs no
// "_DE" to say so), not a suffix -- consistent with buildPortfolioFileName
// in generate-resume-pdf.cjs and buildPackageFileName in
// generate-application-package.cjs. What used to disambiguate DE/EN by
// suffix now disambiguates by folder instead: this file's own DE/EN
// variants land in separate public/files/DE//EN/ subfolders (see
// generateCvPdf below), which is also the only reason a langCode
// parameter still needs to exist on this generally-language-word-based
// function at all.
const CV_FILE_WORDS = { de: "Lebenslauf", en: "CV" };

function buildCvFileName(name, langCode, { ats = false } = {}) {
  const word = CV_FILE_WORDS[langCode] ?? CV_FILE_WORDS.en;
  const atsSuffix = ats ? "_ATS" : "";
  return `${slugifyName(name)}_-_${word}${atsSuffix}.pdf`;
}

// Mirrors buildAbsoluteUrl in generate-resume-pdf.cjs -- builds the public
// URL of the ats companion PDF so the designed CV's footer can link to it
// (see the footer-drawing loop in writeCvPdf below). Needs langCode
// explicitly, unlike a plain file name: "Lebenslauf_ATS.pdf" alone doesn't
// say which folder (DE or EN) it lives in the way "Lebenslauf" itself
// already said which language it was under the old _DE/_EN suffix scheme.
function buildAbsoluteUrl(siteUrl, langCode, pathSegment) {
  const base = typeof siteUrl === "string" ? siteUrl.replace(/\/+$/, "") : "";
  return `${base}/files/${langCode.toUpperCase()}/${pathSegment}`;
}

// Mirrors groupDigits/formatPhoneNumber in generate-resume-pdf.cjs --
// reimplemented locally per this file's own established precedent (see
// pickString/slugifyName above) rather than importing across the two
// independent build scripts.
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
// with its top-left corner at (x, y). Mirrors drawVectorIcon in
// generate-resume-pdf.cjs.
function drawVectorIcon(doc, pathData, x, y, size, color) {
  const scale = size / 24;
  doc.save();
  doc.translate(x, y).scale(scale);
  doc.path(pathData).fill(color);
  doc.restore();
}

// Mirrors prepareEmbeddableAvatar in generate-resume-pdf.cjs -- re-encodes
// (and downscales) the configured avatar through ImageMagick into a small
// temp PNG pdfkit can embed, since pdfkit can only embed PNG/JPEG and an
// unresized source photo would otherwise bloat this PDF far beyond what a
// small header circle needs.
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
    `cv-avatar-${process.pid}-${Date.now()}.png`,
  );

  try {
    execFileSync("convert", [sourcePath, "-resize", "240x240", tmpPngPath], {
      stdio: "ignore",
    });
    return {
      path: tmpPngPath,
      cleanup: () => fs.rmSync(tmpPngPath, { force: true }),
    };
  } catch (error) {
    logger(
      `CV PDF: could not convert avatar image (${
        error instanceof Error ? error.message : String(error)
      }), skipping photo`,
    );
    return { path: null, cleanup: () => {} };
  }
}

// "1987-02-14" -> "14.02.1987" (de) / "February 14, 1987" (en). Any other
// shape (missing, malformed, already-localized free text) is passed
// through as-is rather than dropped, so a human-authored value never
// silently disappears from the document.
function formatBirthDate(isoDate, lang) {
  if (typeof isoDate !== "string") {
    return "";
  }

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate.trim());
  if (!match) {
    return isoDate.trim();
  }

  const [, year, month, day] = match;
  const monthIndex = Number(month) - 1;

  if (lang === "de") {
    return `${day}.${month}.${year}`;
  }

  const monthName = MONTH_NAMES_EN[monthIndex];
  return monthName ? `${monthName} ${Number(day)}, ${year}` : isoDate.trim();
}

// Each entry carries its own icon (drawn in the designed variant only, see
// drawContactLine) and, where meaningful, a link annotation -- the same
// {icon, text, link} shape generate-resume-pdf.cjs's buildContactLines
// already uses for its sidebar.
function buildContactEntries(contact, siteUrl) {
  const entries = [];

  const addressParts = [
    contact.addressStreet,
    `${contact.addressZipCode ?? ""} ${contact.addressCity ?? ""}`.trim(),
    contact.addressCountry,
  ].filter((part) => typeof part === "string" && part.trim() !== "");
  if (addressParts.length > 0) {
    entries.push({ icon: ICONS.mapMarker, text: addressParts.join(", ") });
  }
  if (contact.phone) {
    const cleanPhone = contact.phone.replace(/\s+/g, "");
    entries.push({
      icon: ICONS.phone,
      text: formatPhoneNumber(contact.phone),
      link: `tel:${cleanPhone}`,
    });
  }
  if (contact.email) {
    entries.push({
      icon: ICONS.email,
      text: contact.email,
      link: `mailto:${contact.email}`,
    });
  }
  if (typeof siteUrl === "string" && siteUrl.trim() !== "") {
    entries.push({
      icon: ICONS.web,
      text: siteUrl
        .trim()
        .replace(/^https?:\/\//, "")
        .replace(/\/$/, ""),
      link: siteUrl.trim(),
    });
  }

  return entries;
}

const CONTACT_ICON_SIZE = 10;
const CONTACT_ICON_GAP = 7;
const CONTACT_LINE_GAP = 3;

// Draws one contact entry, icon-prefixed in the designed variant (matching
// the designed Portfolio PDF's sidebar rows) or as plain text in the ats
// variant, and advances doc.y/doc.x past it -- same "measure with the
// active font, draw at an explicit y, then restore doc.x" shape drawRow
// below uses, so a contact block can never leave the cursor at a
// mid-icon x offset for whatever gets drawn next.
function drawContactLine(doc, entry, leftX, width, { ats }) {
  const lineY = doc.y;
  const showIcon = !ats && Boolean(entry.icon);
  const textX = showIcon ? leftX + CONTACT_ICON_SIZE + CONTACT_ICON_GAP : leftX;
  const textWidth = showIcon
    ? width - CONTACT_ICON_SIZE - CONTACT_ICON_GAP
    : width;

  if (showIcon) {
    drawVectorIcon(
      doc,
      entry.icon,
      leftX,
      lineY + 1,
      CONTACT_ICON_SIZE,
      MUTED_COLOR,
    );
  }

  doc.font("Helvetica").fontSize(9.5).fillColor(MUTED_COLOR);
  doc.text(entry.text, textX, lineY, {
    width: textWidth,
    link: entry.link,
    lineBreak: false,
  });

  doc.x = leftX;
  doc.y =
    lineY +
    doc.heightOfString(entry.text, { width: textWidth }) +
    CONTACT_LINE_GAP;
}

function buildPersonalLines(personalDetails, lang, labels) {
  const details = personalDetails ?? {};
  const lines = [];

  const birthDate = formatBirthDate(details.birthDate, lang);
  const birthPlace =
    typeof details.birthPlace === "string" ? details.birthPlace.trim() : "";

  if (birthDate) {
    lines.push({ label: labels.birthDate, value: birthDate });
  }
  if (birthPlace) {
    lines.push({ label: labels.birthPlace, value: birthPlace });
  }

  const familyStatus = pickString(details, "familyStatus", lang);
  if (familyStatus) {
    lines.push({ label: labels.familyStatus, value: familyStatus });
  }

  return lines;
}

function drawSectionHeading(doc, text, accentColor, { ats = false } = {}) {
  // A rough estimate of this heading's own footprint (moveDown + heading
  // line + underline + moveDown) plus room for a first two-line row
  // beneath it, so a heading can't get orphaned alone at the bottom of a
  // page while everything it labels starts the next one.
  const bottomLimit = doc.page.height - doc.page.margins.bottom;
  if (doc.y + 100 > bottomLimit) {
    doc.addPage();
  }

  // Matches the designed Portfolio PDF's own drawSectionHeading
  // (generate-resume-pdf.cjs) pixel-for-pixel -- same font size and
  // spacing -- so the two documents read as the same visual family even
  // though this one stays single-column/ATS-safe.
  doc.font("Helvetica").fontSize(10.5);
  doc.moveDown(1);
  doc
    .fillColor(ats ? TEXT_COLOR : accentColor)
    .font("Helvetica-Bold")
    .fontSize(13)
    .text(text.toUpperCase(), { characterSpacing: 0.5 });
  // The ats variant skips the colored underline entirely, the same way
  // writeAtsResumePdf's headings carry no rule at all -- a plain black
  // heading plus whitespace is the one styling choice every PDF text
  // extractor is guaranteed to render identically.
  if (!ats) {
    doc
      .moveTo(doc.x, doc.y + 2)
      .lineTo(doc.page.width - doc.page.margins.right, doc.y + 2)
      .strokeColor(accentColor)
      .lineWidth(1)
      .stroke();
  }
  doc.moveDown(0.75);
  doc.fillColor(TEXT_COLOR);
}

const LABEL_COLUMN_WIDTH = 130;
const ROW_GAP = 10;

// pdfkit's own auto page-break check on `.text()` fires purely on whether
// that one call's content would cross `page.margins.bottom` -- it has no
// idea a row is really two independent text columns (label + content)
// that need to end up aligned on the same page. Drawing both columns via
// ambient auto-flow (moving doc.x/doc.y back and forth between them, as an
// earlier version of this function did) let the label's column finish on
// one page while a page break fired mid-way through the content column,
// after which the two columns' cursors pointed at different pages entirely
// -- rows silently tore apart into a trail of near-blank pages. The fix
// (same shape as the two-column Portfolio PDF's entry handling, see ADR
// 0010) is to measure the row's full height up front, force a single
// `doc.addPage()` ourselves if it wouldn't fit as a whole, and only then
// draw every line at an explicitly computed y -- never handing pdfkit's
// own mid-draw page-break logic a chance to run at all.
function measureContentLines(doc, lines, width) {
  let height = 0;
  for (const line of lines) {
    if (!line || !line.text) {
      continue;
    }
    doc.font(line.font).fontSize(line.size);
    height += (line.gapBefore ?? 0) + doc.heightOfString(line.text, { width });
  }
  return height;
}

// A classic CV "row": a narrow left label column (a period, or a short
// field name) and a wide right content column made of one or more styled
// lines, the way every plain German Lebenslauf template lays out its
// entries.
function drawRow(doc, label, contentLines) {
  const startX = doc.page.margins.left;
  const contentX = startX + LABEL_COLUMN_WIDTH;
  const labelWidth = LABEL_COLUMN_WIDTH - 10;
  const contentWidth = doc.page.width - doc.page.margins.right - contentX;

  doc.font("Helvetica").fontSize(9.5);
  const labelHeight = doc.heightOfString(label, { width: labelWidth });
  const contentHeight = measureContentLines(doc, contentLines, contentWidth);
  const rowHeight = Math.max(labelHeight, contentHeight);

  const bottomLimit = doc.page.height - doc.page.margins.bottom;
  if (doc.y + rowHeight > bottomLimit) {
    doc.addPage();
  }

  const rowY = doc.y;
  doc.font("Helvetica").fontSize(9.5).fillColor(MUTED_COLOR);
  doc.text(label, startX, rowY, { width: labelWidth });

  let cursorY = rowY;
  for (const line of contentLines) {
    if (!line || !line.text) {
      continue;
    }
    cursorY += line.gapBefore ?? 0;
    doc.font(line.font).fontSize(line.size).fillColor(line.color);
    doc.text(line.text, contentX, cursorY, { width: contentWidth });
    cursorY += doc.heightOfString(line.text, { width: contentWidth });
  }

  doc.x = startX;
  doc.y = rowY + rowHeight + ROW_GAP;
}

function drawKeyValueRow(doc, label, value) {
  drawRow(doc, label, [
    { text: value, font: "Helvetica", size: 10, color: TEXT_COLOR },
  ]);
}

function drawExperienceEntry(doc, entry, lang) {
  const period = pickString(entry, "period", lang);
  const role = pickString(entry, "role", lang);
  const company = typeof entry.company === "string" ? entry.company : "";
  const description = pickString(entry, "description", lang);
  const headingText = [role, company].filter(Boolean).join(" – ");

  drawRow(doc, period, [
    {
      text: headingText,
      font: "Helvetica-Bold",
      size: 10.5,
      color: TEXT_COLOR,
    },
    description
      ? {
          text: description,
          font: "Helvetica",
          size: 9.5,
          color: MUTED_COLOR,
          gapBefore: 3,
        }
      : null,
  ]);
}

function drawEducationEntry(doc, entry, lang) {
  const period = pickString(entry, "period", lang);
  const institution =
    typeof entry.institution === "string" ? entry.institution : "";
  const degree = pickString(entry, "degree", lang);

  drawRow(doc, period, [
    institution
      ? {
          text: institution,
          font: "Helvetica-Bold",
          size: 10.5,
          color: TEXT_COLOR,
        }
      : null,
    degree
      ? {
          text: degree,
          font: "Helvetica",
          size: 9.5,
          color: MUTED_COLOR,
          gapBefore: institution ? 3 : 0,
        }
      : null,
  ]);
}

function buildLanguageLines(languages, lang) {
  if (!Array.isArray(languages)) {
    return [];
  }
  return languages
    .map((entry) => {
      const name = pickString(entry ?? {}, "name", lang);
      const level = pickString(entry ?? {}, "level", lang);
      if (!name) {
        return "";
      }
      return level ? `${name} (${level})` : name;
    })
    .filter((line) => line !== "");
}

// data.certificates is the same {nameDe, nameEn}[] array the designed
// Portfolio PDF already renders as a pill list (buildLocalizedNameList in
// generate-resume-pdf.cjs) -- it lives in app-data.json, not cv-data.json,
// but is already present on `data` by the time writeCvPdf sees it (see
// generateCvPdf's `{ ...appData, ...readCvData(rootDir) }` merge).
function buildCertificationNames(certificates, lang) {
  if (!Array.isArray(certificates)) {
    return [];
  }
  return certificates
    .map((entry) => pickString(entry ?? {}, "name", lang))
    .filter((name) => name !== "");
}

function writeCvPdf(
  filePath,
  data,
  lang,
  { ats = false, avatarPath = null } = {},
) {
  return new Promise((resolve, reject) => {
    const margins = { top: 56, bottom: 56, left: 56, right: 56 };
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

    const accentColor = HEX_COLOR_PATTERN.test(data.accentColor ?? "")
      ? data.accentColor
      : DEFAULT_ACCENT_COLOR;
    const labels = LABELS[lang];
    const profile = data.profile ?? {};
    const contact = data.contact ?? {};
    const name = typeof profile.name === "string" ? profile.name : "";
    const title = pickString(profile, "title", lang);
    const experience = Array.isArray(data.experience) ? data.experience : [];
    const education = Array.isArray(data.education) ? data.education : [];

    // A circular photo in the header's top-right corner, the classic
    // Lebenslauf photo placement -- the single-column equivalent of the
    // designed Portfolio PDF's centered sidebar avatar. Skipped in the ats
    // variant like every other visual-only element here (see
    // prepareEmbeddableAvatar's caller in generateCvPdf for why the photo
    // itself can be entirely absent regardless).
    const AVATAR_DIAMETER = 72;
    const AVATAR_GAP = 18;
    const hasAvatar = !ats && Boolean(avatarPath);
    const contentWidth = doc.page.width - margins.left - margins.right;
    const headerTextWidth = hasAvatar
      ? contentWidth - AVATAR_DIAMETER - AVATAR_GAP
      : contentWidth;
    const headerTop = doc.y;

    doc
      .font("Helvetica-Bold")
      .fontSize(22)
      .fillColor(TEXT_COLOR)
      .text(name, { width: headerTextWidth, lineBreak: false });
    if (title) {
      doc.moveDown(0.15);
      // Uppercase + letter-spaced, matching the designed Portfolio PDF's
      // own drawSidebarHeading treatment for its title line.
      doc
        .font("Helvetica")
        .fontSize(10.5)
        .fillColor(ats ? MUTED_COLOR : accentColor)
        .text(title.toUpperCase(), {
          width: headerTextWidth,
          characterSpacing: 0.5,
        });
    }

    doc.moveDown(0.7);
    for (const entry of buildContactEntries(contact, data.siteUrl)) {
      drawContactLine(doc, entry, margins.left, headerTextWidth, { ats });
    }
    const headerTextBottom = doc.y;

    if (hasAvatar) {
      const radius = AVATAR_DIAMETER / 2;
      const cx = doc.page.width - margins.right - radius;
      const cy = headerTop + radius;
      doc.save();
      doc.circle(cx, cy, radius).clip();
      try {
        doc.image(avatarPath, cx - radius, cy - radius, {
          fit: [AVATAR_DIAMETER, AVATAR_DIAMETER],
          align: "center",
          valign: "center",
        });
      } finally {
        doc.restore();
      }
      doc
        .circle(cx, cy, radius)
        .lineWidth(1.5)
        .strokeColor(accentColor)
        .stroke();
    }

    // Neither the header text block nor the avatar reliably reaches lower
    // than the other -- a short single-line contact block next to a 72pt
    // photo, or a long address wrapping past it, both happen in practice --
    // so the rest of the page starts below whichever one is actually taller
    // rather than assuming either side wins.
    doc.x = margins.left;
    doc.y = hasAvatar
      ? Math.max(headerTextBottom, headerTop + AVATAR_DIAMETER + 8)
      : headerTextBottom;

    // A single accent-colored rule under the header block -- the
    // single-column equivalent of the designed Portfolio PDF's colored
    // sidebar, tying the two documents to the same brand color without
    // introducing a second column or anything an ATS parser would have to
    // reassemble. Skipped entirely in the ats variant, same reasoning as
    // drawSectionHeading's underline below.
    doc.moveDown(0.6);
    if (!ats) {
      doc
        .moveTo(doc.page.margins.left, doc.y)
        .lineTo(doc.page.width - doc.page.margins.right, doc.y)
        .strokeColor(accentColor)
        .lineWidth(2)
        .stroke();
    }

    const personalLines = buildPersonalLines(
      data.personalDetails,
      lang,
      labels,
    );
    if (personalLines.length > 0) {
      drawSectionHeading(doc, labels.personal, accentColor, { ats });
      personalLines.forEach((line) =>
        drawKeyValueRow(doc, line.label, line.value),
      );
    }

    if (experience.length > 0) {
      drawSectionHeading(doc, labels.experience, accentColor, { ats });
      experience.forEach((entry) => drawExperienceEntry(doc, entry, lang));
    }

    if (education.length > 0) {
      drawSectionHeading(doc, labels.education, accentColor, { ats });
      education.forEach((entry) => drawEducationEntry(doc, entry, lang));
    }

    const languageLines = buildLanguageLines(data.languages, lang);
    const drivingLicense = pickString(data, "drivingLicense", lang);
    if (languageLines.length > 0 || drivingLicense) {
      drawSectionHeading(doc, labels.additional, accentColor, { ats });
      if (languageLines.length > 0) {
        drawKeyValueRow(doc, labels.languages, languageLines.join(", "));
      }
      if (drivingLicense) {
        drawKeyValueRow(doc, labels.drivingLicense, drivingLicense);
      }
    }

    // Its own section, styled the same way as "Sonstiges" above (a
    // drawSectionHeading + one plain paragraph) but deliberately not folded
    // into it -- certificates are a distinct enough qualification to read
    // as their own paragraph rather than a third line buried under
    // Sprachen/Führerschein.
    const certificationNames = buildCertificationNames(data.certificates, lang);
    if (certificationNames.length > 0) {
      drawSectionHeading(doc, labels.certifications, accentColor, { ats });
      doc
        .font("Helvetica")
        .fontSize(10)
        .fillColor(TEXT_COLOR)
        .text(certificationNames.join(", "));
    }

    const interests = pickStringArrayField(data, "interests", lang);
    if (interests.length > 0) {
      drawSectionHeading(doc, labels.interests, accentColor, { ats });
      doc
        .font("Helvetica")
        .fontSize(10)
        .fillColor(TEXT_COLOR)
        .text(interests.join(", "));
    }

    // The designed variant's footer also links to its plain-text ats
    // companion, the same "Text-Version (ATS)" footer link
    // generate-resume-pdf.cjs's designed Portfolio PDF already carries --
    // the ats variant never links to itself.
    const atsUrl = buildAbsoluteUrl(
      data.siteUrl,
      lang,
      buildCvFileName(name, lang, { ats: true }),
    );

    const pageRange = doc.bufferedPageRange();
    for (
      let i = pageRange.start;
      i < pageRange.start + pageRange.count;
      i += 1
    ) {
      doc.switchToPage(i);
      const originalBottomMargin = doc.page.margins.bottom;
      doc.page.margins.bottom = 0;
      // The designed Portfolio PDF's footer sits in a muted tint of the
      // accent color rather than plain gray; fillOpacity gets the same
      // effect here without needing that script's own color-mixing helper.
      // The ats variant uses a plain muted gray instead, like every other
      // text in that variant.
      doc.fillOpacity(ats ? 1 : 0.6);
      doc
        .font("Helvetica")
        .fontSize(8)
        .fillColor(ats ? MUTED_COLOR : accentColor)
        .text(
          `${labels.pageWord} ${i + 1} ${labels.pageOfWord} ${pageRange.count}`,
          margins.left,
          doc.page.height - 34,
          {
            width: doc.page.width - margins.left - margins.right,
            lineBreak: false,
          },
        );
      if (!ats) {
        doc
          .font("Helvetica")
          .fontSize(7.5)
          .fillColor(accentColor)
          .text(labels.atsLink, margins.left, doc.page.height - 20, {
            width: doc.page.width - margins.left - margins.right,
            lineBreak: false,
            link: atsUrl,
            underline: true,
          });
      }
      doc.fillOpacity(1);
      doc.page.margins.bottom = originalBottomMargin;
    }

    doc.end();
  });
}

// interestsDe/En is a plain string[] (like techStack's arrays), not a
// De/En-suffixed single string -- pickString's fallback-to-plain-field
// logic doesn't apply to arrays, so this reads the suffixed key directly.
function pickStringArrayField(data, baseKey, lang) {
  const suffixed = data[`${baseKey}${langSuffix(lang)}`];
  if (Array.isArray(suffixed)) {
    return suffixed;
  }
  const plain = data[baseKey];
  return Array.isArray(plain) ? plain : [];
}

// Personal CV-only content (birth date, family status, education,
// languages, driving license, interests) deliberately does NOT live in
// .aboutme/app-data.json: that file is copied wholesale, unauthenticated,
// to the fully public public/app-data.json by sync-web-app-data.cjs and
// scripts/init-process.cjs -- anything in it is readable by anyone who
// loads the site. This separate file is never synced anywhere and is read
// only by this script and generate-application-package.cjs. Unlike
// app-data.json, its absence isn't an error: a fresh fork that hasn't
// filled it in yet still gets a (shorter) CV from app-data.json alone.
function readCvData(rootDir) {
  const cvDataFile = path.join(rootDir, ".aboutme", "cv-data.json");
  if (!fs.existsSync(cvDataFile)) {
    return {};
  }
  return JSON.parse(fs.readFileSync(cvDataFile, "utf8"));
}

async function generateCvPdf(rootDir, logger = console.log) {
  const sourceFile = path.join(rootDir, ".aboutme", "app-data.json");

  if (!fs.existsSync(sourceFile)) {
    throw new Error(
      `missing source file: ${path.relative(rootDir, sourceFile)}`,
    );
  }

  const appData = JSON.parse(fs.readFileSync(sourceFile, "utf8"));
  const data = { ...appData, ...readCvData(rootDir) };
  // public/files/ is protected by nginx's auth_basic (see
  // scripts/init-process.cjs), unlike the rest of public/ -- this is where
  // every document meant to be shared, not browsed, lives. DE and EN each
  // get their own subfolder: since the file name itself no longer carries
  // a _DE/_EN suffix (the word is already language-specific, e.g.
  // "Lebenslauf" vs "CV"), the folder is what actually disambiguates the
  // two languages' files from each other.
  const deTargetDir = path.join(rootDir, "public", "files", "DE");
  const enTargetDir = path.join(rootDir, "public", "files", "EN");
  fs.mkdirSync(deTargetDir, { recursive: true });
  fs.mkdirSync(enTargetDir, { recursive: true });

  const name = data.profile?.name;
  const deTargetFile = path.join(deTargetDir, buildCvFileName(name, "de"));
  const enTargetFile = path.join(enTargetDir, buildCvFileName(name, "en"));
  // A plain, single-column-with-no-color "ats" companion, the same idea as
  // generate-resume-pdf.cjs's writeAtsResumePdf for the Portfolio PDF. It
  // stays under public/files/ rather than public/ root -- unlike the
  // Portfolio-ATS variant, this one still carries the CV-only personal
  // fields (birth date, marital status, ...) that must never end up
  // unauthenticated (see readCvData above).
  const deAtsTargetFile = path.join(
    deTargetDir,
    buildCvFileName(name, "de", { ats: true }),
  );
  const enAtsTargetFile = path.join(
    enTargetDir,
    buildCvFileName(name, "en", { ats: true }),
  );

  const avatar = prepareEmbeddableAvatar(rootDir, data, logger);

  try {
    await writeCvPdf(deTargetFile, data, "de", { avatarPath: avatar.path });
    await writeCvPdf(enTargetFile, data, "en", { avatarPath: avatar.path });
    await writeCvPdf(deAtsTargetFile, data, "de", { ats: true });
    await writeCvPdf(enAtsTargetFile, data, "en", { ats: true });
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
  buildCvFileName,
  formatBirthDate,
  formatPhoneNumber,
  generateCvPdf,
  pickString,
  slugifyName,
};

if (require.main === module) {
  generateCvPdf(process.cwd()).catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  });
}
