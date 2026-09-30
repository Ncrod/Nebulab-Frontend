"use client";

import { notFound } from "next/navigation";
import { useProduct } from "../lib/cms/products";
import ProductDetailPage from "./ProductDetailPage";

/**
 * Loads the product behind a /products/<slug> URL from the API (the admin can add products the server-rendered page has never
 * seen, so the lookup happens in the browser). Disabled or missing products answer 404. While it loads, an empty page shows
 * instead of jumping to the 404 too early.
 */
export default function ProductDetailLoader({ slug, loggedIn = false }: { slug: string; loggedIn?: boolean }) {
  const { product, notFound: missing, error } = useProduct(slug);

  if (!product) {
    if (missing) notFound();
    return (
      <main className="min-h-screen">
        {error && (
          <p role="alert" className="px-section py-[120px] text-center font-display text-[20px] text-white/60">
            {error}
          </p>
        )}
      </main>
    );
  }
  return <ProductDetailPage loggedIn={loggedIn} product={product} />;
}
