import type { CatalogProduct } from "../data/catalog";
import Footer from "./Footer";
import Navbar from "./Navbar";
import ProductOverview from "./ProductOverview";
import ProductReviews from "./ProductReviews";

/**
 * Single product page: a list of sections. Same for everyone; only the navbar actions depend on the session.
 * The main clips in both directions: the big glows of the sections are oversized (their rotated boxes reach past the
 * footer), and without the clip they would add empty scroll height below it.
 */
export default function ProductDetailPage({ loggedIn = false, product }: { loggedIn?: boolean; product: CatalogProduct }) {
  return (
    <main className="min-h-screen overflow-clip">
      <Navbar loggedIn={loggedIn} />
      <ProductOverview product={product} loggedIn={loggedIn} />
      <ProductReviews />
      <Footer loggedIn={loggedIn} />
    </main>
  );
}
