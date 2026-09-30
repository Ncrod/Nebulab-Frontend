import type { Metadata } from "next";
import ProductsPage from "../../components/ProductsPage";

export const metadata: Metadata = {
  title: "Products | Nebulab",
};

// Signed-in products. components/SessionGate sends a signed-out visit to /login, and a signed-in one on "/products" here.
export default async function SignedInProducts({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  return <ProductsPage loggedIn category={category} />;
}
