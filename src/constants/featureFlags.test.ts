import { describe, expect, it } from "@jest/globals";
import { featureFlags } from "@constants/featureFlags";

describe("featureFlags", () => {
  it("keeps the third-party licenses page hidden for now", () => {
    // Every bundled library is currently MIT-style licensed, so there is no
    // attribution page to show. Flip the flag (and this test) once a
    // dependency's license requires one.
    expect(featureFlags.thirdPartyLicenses).toBe(false);
  });
});
