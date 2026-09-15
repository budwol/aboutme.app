// Minimal expo-router bootstrap shim: all real app logic lives in
// src/components/WnaRootLayout.tsx and src/navigation/router/. This file
// (and the rest of src/app/) goes away in Phase 3 when Expo's build
// tooling is replaced and a plain entry point takes over.
export { default } from "@components/WnaRootLayout";
export { ErrorBoundary } from "@components/WnaApp";
