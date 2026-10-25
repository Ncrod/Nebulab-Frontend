import { apiUrl } from "./api-url";

// Only these HTTPS hosts may supply images to Next's server-side optimizer.
// Add trusted asset hosts with NEXT_PUBLIC_IMAGE_HOSTS (comma-separated hostnames).
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
