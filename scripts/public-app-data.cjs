#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

// Contact fields that must never reach public/app-data.json: that file is
// served to every visitor and also inlined into every HTML page (see
// inject-web-shell.cjs), so hiding a field in the UI alone would still
// publish it. The street address only ships in legal.json for the imprint
// and privacy pages; the phone number only appears in the password-protected
// documents (see ADR 0032).
const PRIVATE_CONTACT_FIELDS = ["phone", "addressStreet", "addressZipCode"];

function buildPublicAppData(appData) {
  const contact = { ...(appData?.contact ?? {}) };

  for (const field of PRIVATE_CONTACT_FIELDS) {
    delete contact[field];
  }

  return { ...appData, contact };
}

function buildLegalData(appData) {
  const contact = appData?.contact ?? {};

  return {
    name: appData?.profile?.name ?? "",
    addressStreet: contact.addressStreet ?? "",
    addressZipCode: contact.addressZipCode ?? "",
    addressCity: contact.addressCity ?? "",
    addressCountry: contact.addressCountry ?? "",
    email: contact.email ?? "",
  };
}

function writeJsonFile(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function writePublicAppData(sourceFile, publicDir) {
  const appData = JSON.parse(fs.readFileSync(sourceFile, "utf8"));
  const appDataFile = path.join(publicDir, "app-data.json");
  const legalFile = path.join(publicDir, "legal.json");

  writeJsonFile(appDataFile, buildPublicAppData(appData));
  writeJsonFile(legalFile, buildLegalData(appData));

  return { appDataFile, legalFile };
}

module.exports = {
  PRIVATE_CONTACT_FIELDS,
  buildLegalData,
  buildPublicAppData,
  writePublicAppData,
};

if (require.main === module) {
  const [sourceFile, publicDir] = process.argv.slice(2);
  writePublicAppData(sourceFile, publicDir);
}
