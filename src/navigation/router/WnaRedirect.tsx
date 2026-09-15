import { useEffect } from "react";
import { router, WnaHref } from "@/navigation/router/wnaRouter";

export type WnaRedirectProps = {
  href: WnaHref;
};

export default function WnaRedirect({ href }: WnaRedirectProps) {
  useEffect(() => {
    router.replace(href);
  }, [href]);

  return null;
}
