import type { Metadata } from "next";
import ProductDetailLoader from "../../../components/ProductDetailLoader";
import { getProductBySlug } from "../../../lib/server-api";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await getProductBySlug((await params).slug);
  return { title: product ? `${product.name} | Nebulab` : "Product | Nebulab" };
}

// Signed-in product page. components/SessionGate sends a signed-out visit to /login, and a signed-in one on "/products/<slug>" here.
export default async function SignedInProductPage({ params }: Props) {
  return <ProductDetailLoader loggedIn slug={(await params).slug} />;
}
