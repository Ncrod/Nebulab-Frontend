import type { Metadata } from "next";
import ProductsPage from "../components/ProductsPage";

export const metadata: Metadata = {
  title: "Products | Nebulab",
};

export default async function Products({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  return <ProductsPage category={category} />;
}
