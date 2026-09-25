import Footer from "./Footer";
import Navbar from "./Navbar";
import ProductsCatalog from "./ProductsCatalog";
import ProductsShowcase from "./ProductsShowcase";

/** Products page: a list of sections. Same for everyone; only the navbar actions depend on the session. */
export default function ProductsPage({ loggedIn = false }: { loggedIn?: boolean }) {
  return (
    <main className="min-h-screen overflow-x-clip">
      <Navbar loggedIn={loggedIn} />
      <ProductsShowcase />
      <ProductsCatalog />
      <Footer loggedIn={loggedIn} />
    </main>
  );
}
