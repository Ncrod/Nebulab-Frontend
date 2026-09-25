import { parseFilter } from "../data/catalog";
import Footer from "./Footer";
import Navbar from "./Navbar";
import ProductsCatalog from "./ProductsCatalog";
import ProductsShowcase from "./ProductsShowcase";

/**
 * Products page: a list of sections. Same for everyone; only the navbar actions depend on the session.
 * On mobile the page is a column whose order differs: the catalog comes first and the showcase (banner and
 * cards) after it, still above the footer. The navbar keeps the default order 0, so it stays on top.
 */
export default function ProductsPage({ loggedIn = false, category }: { loggedIn?: boolean; category?: string }) {
  return (
    <main className="min-h-screen overflow-x-clip max-tablet:flex max-tablet:flex-col">
      <Navbar loggedIn={loggedIn} />
      <div className="max-tablet:order-2">
        <ProductsShowcase />
      </div>
      {/* Keyed by the link's category, so following another category link starts the catalog over. */}
      <div className="max-tablet:order-1">
        <ProductsCatalog key={category ?? "all"} initialFilter={parseFilter(category)} />
      </div>
      <div className="max-tablet:order-3">
        <Footer loggedIn={loggedIn} />
      </div>
    </main>
  );
}
