import type { Metadata } from "next";
import ProductsPage from "../../components/ProductsPage";

export const metadata: Metadata = {
  title: "Products | Nebulab",
};

// Signed-in products. Temporary preview route: once auth exists, "/products" will render this variant by session.
export default async function SignedInProducts({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  return <ProductsPage loggedIn category={category} />;
}
