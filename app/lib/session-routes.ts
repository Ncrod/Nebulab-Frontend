// The URL picks the variant of a page: everything under /home is the signed-in variant of a public page, and pages that
// only exist with a session (the bag, the account) count as signed in on their own. Those paths are protected by the
// real session: see components/SessionGate.
const SIGNED_IN_ONLY = ["/bag", "/account"];

function isUnder(pathname: string, base: string) {
  return pathname === base || pathname.startsWith(`${base}/`);
}

/** True on the signed-in variants and on pages that require a session. */
export function isSignedInPath(pathname: string) {
  return isUnder(pathname, "/home") || SIGNED_IN_ONLY.some((base) => isUnder(pathname, base));
}

/** The page's own path, without the "/home" prefix of the signed-in variants: "/home/products" -> "/products". */
export function pageOf(pathname: string) {
  return isUnder(pathname, "/home") ? pathname.slice("/home".length) || "/" : pathname;
}

/** The signed-in variant of a public page ("/products/x" -> "/home/products/x"), or null when the page has none. */
export function signedInTwin(pathname: string) {
  if (pathname === "/") return "/home";
  return isUnder(pathname, "/products") ? `/home${pathname}` : null;
}
