import type { Metadata } from "next";
import ProductDetailLoader from "../../../components/ProductDetailLoader";
import { getSeedProductBySlug } from "../../../data/catalog";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = getSeedProductBySlug((await params).slug);
  return { title: product ? `${product.name} | Nebulab` : "Product | Nebulab" };
}

// Signed-in product page. Temporary preview route: once auth exists, "/products/<slug>" will render this variant by session.
export default async function SignedInProductPage({ params }: Props) {
  return <ProductDetailLoader loggedIn slug={(await params).slug} />;
}
