import { getNavigationPath } from "@/navigation/routes/wnaNavigationRoutes";
import { Redirect } from "expo-router";

export default function NotFoundScreen() {
  return <Redirect href={getNavigationPath("root")} />;
}
