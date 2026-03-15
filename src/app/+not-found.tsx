import { getNavigationPath } from "@components/navigation/wnaNavigationRouteProvider";
import { Redirect } from "expo-router";

export default function NotFoundScreen() {
  return <Redirect href={getNavigationPath("root")} />;
}
