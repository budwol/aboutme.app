import { getNavigationPath } from "@/navigation/routes/wnaNavigationRouteProvider";
import { Redirect } from "expo-router";

export default function NotFoundScreen() {
  return <Redirect href={getNavigationPath("root")} />;
}
