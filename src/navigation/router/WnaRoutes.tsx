import { useEffect } from "react";
import { matchRoute } from "@/navigation/router/wnaRouteTable";
import { router, useWnaPathname } from "@/navigation/router/wnaRouter";
import { getNavigationPath } from "@/navigation/routes/wnaNavigationRoutes";

export default function WnaRoutes() {
  const pathname = useWnaPathname();
  const match = matchRoute(pathname);

  useEffect(() => {
    if (!match) {
      router.replace(getNavigationPath("root"));
    }
  }, [match, pathname]);

  if (!match) return null;

  const { Component, params } = match;
  return <Component {...params} />;
}
