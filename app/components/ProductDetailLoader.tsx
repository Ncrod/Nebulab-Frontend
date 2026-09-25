"use client";

import { notFound } from "next/navigation";
import { useProducts } from "../lib/cms/products";
import { useHydrated } from "../lib/cms/store";
import ProductDetailPage from "./ProductDetailPage";

/**
 * Finds the product behind a /products/<slug> URL in the CMS store (the admin can add products the server has never
 * seen, so the lookup happens in the browser). Disabled or missing products answer 404.
 * The server renders with the seed catalog; until the browser has read its storage an unknown slug shows an empty page
 * instead of jumping to the 404 too early.
 */
export default function ProductDetailLoader({ slug, loggedIn = false }: { slug: string; loggedIn?: boolean }) {
  const products = useProducts();
  const hydrated = useHydrated();
  const product = products.find((p) => p.slug === slug && p.status === "live");

  if (!product) {
    if (!hydrated) return <main className="min-h-screen" />;
    notFound();
  }
  return <ProductDetailPage loggedIn={loggedIn} product={product} />;
}
