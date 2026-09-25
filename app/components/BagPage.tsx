import BagCheckout from "./BagCheckout";
import Footer from "./Footer";
import Navbar from "./Navbar";

/**
 * Shopping bag page: a list of sections. It only exists with a session, so the navbar is always the signed-in one.
 * The main clips in both directions: the sections' big glows are oversized and would otherwise add empty scroll
 * height below the page.
 */
export default function BagPage() {
  return (
    <main className="min-h-screen overflow-clip">
      <Navbar loggedIn />
      <BagCheckout />
      <Footer loggedIn />
    </main>
  );
}
