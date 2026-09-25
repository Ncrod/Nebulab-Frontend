import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProductDetailPage from "../../components/ProductDetailPage";
import { getProductBySlug } from "../../data/catalog";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = getProductBySlug((await params).slug);
  return { title: product ? `${product.name} | Nebulab` : "Product not found | Nebulab" };
}

export default async function ProductPage({ params }: Props) {
  const product = getProductBySlug((await params).slug);
  if (!product) notFound();
  return <ProductDetailPage product={product} />;
}
