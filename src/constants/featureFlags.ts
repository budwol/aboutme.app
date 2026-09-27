// Switches for features that are built and kept in the codebase but not
// currently shown. Flip one back to true to bring the feature back as-is.
export const featureFlags = {
  // The "Lizenzen" / "Third Party Licenses" page (menu entry + route). Hidden
  // while every bundled third-party library is under a permissive license
  // like MIT that doesn't need an in-app attribution page -- re-enable once a
  // dependency's license actually requires showing it.
  thirdPartyLicenses: false,
} as const;
