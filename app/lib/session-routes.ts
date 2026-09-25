// Until real auth exists, the URL says whether we are "signed in": everything under /home is the signed-in variant
// of a public page, and pages that only exist with a session (the bag) count as signed in on their own.
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
