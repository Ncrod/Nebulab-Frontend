import type { Metadata } from "next";
import ProductsPage from "../components/ProductsPage";

export const metadata: Metadata = {
  title: "Products | Nebulab",
};

export default function Products() {
  return <ProductsPage />;
}
