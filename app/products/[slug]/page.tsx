import type { Metadata } from "next";
import ProductDetailLoader from "../../components/ProductDetailLoader";
import { getSeedProductBySlug } from "../../data/catalog";

type Props = { params: Promise<{ slug: string }> };

// The title uses the seed catalog (the only one the server knows); the page itself reads the CMS store in the browser.
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = getSeedProductBySlug((await params).slug);
  return { title: product ? `${product.name} | Nebulab` : "Product | Nebulab" };
}

export default async function ProductPage({ params }: Props) {
  return <ProductDetailLoader slug={(await params).slug} />;
}
