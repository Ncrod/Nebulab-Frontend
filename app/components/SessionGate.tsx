"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { clearLegacyData, useSession } from "../lib/api";
import { isSignedInPath, signedInTwin } from "../lib/session-routes";

/**
 * The pages that only exist with a session (/home, /bag, /account and everything under /home) open only with a valid
 * shopper session; without one they send you to /login. With a session, the public pages ("/", "/products") move to their
 * /home variants. While the session is unknown (server, hydration) or missing, nothing of the page shows, so there is no
 * flash of signed-in content.
 */
export default function SessionGate({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const session = useSession("customer");
  const needsSession = isSignedInPath(pathname);

  // The mock version of the site kept its data in this browser: it is not used anymore.
  useEffect(() => {
    clearLegacyData();
  }, []);

  useEffect(() => {
    if (needsSession && session === null) router.replace("/login");
  }, [needsSession, session, router]);

  // With a session, the public pages give way to their signed-in variants.
  const twin = session ? signedInTwin(pathname) : null;
  useEffect(() => {
    if (twin) router.replace(`${twin}${window.location.search}`);
  }, [twin, router]);

  if (needsSession && !session) return null;
  return <>{children}</>;
}
