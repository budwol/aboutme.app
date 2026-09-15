export const appMotionConstants = {
  defaultAnimationDuration: 250,
  // Lighthouse traced the LCP element (the screen background image) to
  // an ~544ms "element render delay" plus a further gap up to the full
  // ~2.3s LCP, both caused by this intro overlay staying fully opaque
  // over it. Shortened from 700/620 (1320ms total) to keep the brand
  // moment while cutting most of that delay.
  introDelay: 300,
  introDuration: 400,
  navigationTransitionDelay: 420,
  navigationTransitionDurationIn: 420,
  navigationTransitionDurationOut: 560,
  deferredHomeSectionsDelay: 120,
} as const;
