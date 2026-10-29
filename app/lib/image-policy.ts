import { apiUrl } from "./api-url";

// Only these HTTPS hosts may supply images to Next's server-side optimizer.
// Add trusted asset hosts with NEXT_PUBLIC_IMAGE_HOSTS (comma-separated hostnames).
// Existing catalog entries link to these providers rather than to the API host.
const catalogImageHosts = [
  "cdsassets.apple.com",
  "clevercel.mx",
  "co.tiendasishop.com",
  "dbramante1928.com",
  "espanol.spectrum.com",
  "incredideals.co",
  "mac-center.com",
  "mastronics.vtexassets.com",
  "micelu.co",
  "tauretcomputadores.com",
  "thumb.wikimedia.org",
  "www.apple.com",
  "www.mozillion.com",
  "www.pngarts.com",
];

const apiHost = (() => {
  try {
    const url = new URL(apiUrl);
    return url.protocol === "https:" ? url.hostname : null;
  } catch {
    return null;
  }
})();

const hostnamePattern = /^(?!-)[a-z0-9-]+(?:\.[a-z0-9-]+)+$/;

export const imageHosts = [...new Set([
  ...(apiHost ? [apiHost] : []),
  ...catalogImageHosts,
  ...(process.env.NEXT_PUBLIC_IMAGE_HOSTS ?? "").split(",").map((host) => host.trim().toLowerCase()),
].filter((host) => hostnamePattern.test(host)))];

export function isUsableImage(src: string): boolean {
  if (/^\/(?:images|svg)\//.test(src) && !src.includes("..") && !/[?#]/.test(src)) return true;
  try {
    const url = new URL(src);
    return url.protocol === "https:" && !url.username && !url.password && !url.port && !url.hash && imageHosts.includes(url.hostname);
  } catch {
    return false;
  }
}
