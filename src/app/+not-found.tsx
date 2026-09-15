// Genuinely unmatched paths (not one of the concrete stub files elsewhere
// in src/app/) land here via expo-router's own not-found convention.
// Rendering WnaRoutes here (instead of Expo's default 404 screen) lets our
// own client-side router run its usual "no match -> redirect to root"
// logic, so an unknown URL behaves the same everywhere.
export { default } from "@/navigation/router/WnaRoutes";
