import { afterEach, describe, expect, it } from "@jest/globals";
import fs from "fs";
import os from "os";
import path from "path";

/* eslint-disable @typescript-eslint/no-require-imports */
const {
  PRIVATE_CONTACT_FIELDS,
  buildLegalData,
  buildPublicAppData,
  writePublicAppData,
} = require("../../../scripts/public-app-data.cjs") as {
  PRIVATE_CONTACT_FIELDS: string[];
  buildLegalData: (appData: unknown) => Record<string, string>;
  buildPublicAppData: (appData: unknown) => Record<string, unknown>;
  writePublicAppData: (
    sourceFile: string,
    publicDir: string,
  ) => { appDataFile: string; legalFile: string };
};
/* eslint-enable @typescript-eslint/no-require-imports */

const appData = {
  profile: { name: "Jane Example" },
  contact: {
    phone: "+49 123 456",
    email: "jane@example.com",
    addressStreet: "Straße 1",
    addressZipCode: "01234",
    addressCity: "Berlin",
    addressCountry: "Deutschland",
    github: "https://github.com/jane",
  },
};

const createdFixtures: string[] = [];

describe("public-app-data", () => {
  afterEach(() => {
    for (const fixture of createdFixtures.splice(0)) {
      fs.rmSync(fixture, { recursive: true, force: true });
    }
  });

  it("drops the private contact fields and keeps everything else", () => {
    expect(PRIVATE_CONTACT_FIELDS).toEqual([
      "phone",
      "addressStreet",
      "addressZipCode",
    ]);
    expect(buildPublicAppData(appData)).toEqual({
      profile: { name: "Jane Example" },
      contact: {
        email: "jane@example.com",
        addressCity: "Berlin",
        addressCountry: "Deutschland",
        github: "https://github.com/jane",
      },
    });
    expect(appData.contact.phone).toBe("+49 123 456");
  });

  it("copes with data that has no contact block", () => {
    expect(buildPublicAppData({ profile: {} })).toEqual({
      profile: {},
      contact: {},
    });
    expect(buildPublicAppData(undefined)).toEqual({ contact: {} });
  });

  it("builds the imprint data from the profile name and address", () => {
    expect(buildLegalData(appData)).toEqual({
      name: "Jane Example",
      addressStreet: "Straße 1",
      addressZipCode: "01234",
      addressCity: "Berlin",
      addressCountry: "Deutschland",
      email: "jane@example.com",
    });
    expect(buildLegalData(undefined)).toEqual({
      name: "",
      addressStreet: "",
      addressZipCode: "",
      addressCity: "",
      addressCountry: "",
      email: "",
    });
  });

  it("writes app-data.json and legal.json into the public directory", () => {
    const fixtureRoot = fs.mkdtempSync(
      path.join(os.tmpdir(), "aboutme-public-"),
    );
    createdFixtures.push(fixtureRoot);
    const sourceFile = path.join(fixtureRoot, "app-data.json");
    fs.writeFileSync(sourceFile, JSON.stringify(appData), "utf8");

    const result = writePublicAppData(
      sourceFile,
      path.join(fixtureRoot, "public"),
    );

    const publicJson = fs.readFileSync(result.appDataFile, "utf8");
    expect(JSON.parse(publicJson)).toEqual(buildPublicAppData(appData));
    expect(publicJson).not.toContain("Straße 1");
    expect(publicJson).not.toContain("+49 123 456");
    expect(JSON.parse(fs.readFileSync(result.legalFile, "utf8"))).toEqual(
      buildLegalData(appData),
    );
  });
});
