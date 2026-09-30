import type { Metadata } from "next";
import ProductDetailLoader from "../../components/ProductDetailLoader";
import { getProductBySlug } from "../../lib/server-api";

type Props = { params: Promise<{ slug: string }> };

// The title comes from the API when it answers in time; the page itself loads the product in the browser.
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await getProductBySlug((await params).slug);
  return { title: product ? `${product.name} | Nebulab` : "Product | Nebulab" };
}

export default async function ProductPage({ params }: Props) {
  return <ProductDetailLoader slug={(await params).slug} />;
}
