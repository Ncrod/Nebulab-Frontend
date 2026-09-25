import AccountGreeting from "./AccountGreeting";
import Footer from "./Footer";
import Navbar from "./Navbar";

/**
 * Account page: a list of sections. It only exists with a session, so the navbar and footer are the signed-in ones.
 * The main clips in both directions: the sections' big glows are oversized and would otherwise add empty scroll
 * height below the page.
 */
export default function AccountPage() {
  return (
    <main className="min-h-screen overflow-clip">
      <Navbar loggedIn />
      <AccountGreeting />
      <Footer loggedIn />
    </main>
  );
}
