import type { Metadata } from "next";
import ProductsPage from "../../components/ProductsPage";

export const metadata: Metadata = {
  title: "Products | Nebulab",
};

// Signed-in products. Temporary preview route: once auth exists, "/products" will render this variant by session.
export default function SignedInProducts() {
  return <ProductsPage loggedIn />;
}
