// A previously deployed Vercel environment may still contain the old host.
// Keep local and preview overrides, but never build the cookie auth client against that cross-site host.
const configured = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");

export const apiUrl = !configured || configured === "https://nebuback.onrender.com/api"
  ? "https://api.nebulab.digital/api"
  : configured;
