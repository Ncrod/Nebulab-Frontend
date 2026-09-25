import Benefits from "./Benefits";
import Categories from "./Categories";
import Featured from "./Featured";
import Footer from "./Footer";
import Hero from "./Hero";
import Navbar from "./Navbar";
import Offer from "./Offer";
import SideNav from "./SideNav";

/** Home page. Same sections for everyone; only the navbar actions and side-nav links depend on the session. */
export default function LandingPage({ loggedIn = false }: { loggedIn?: boolean }) {
  return (
    <main className="min-h-screen overflow-x-clip">
      <SideNav loggedIn={loggedIn} />
      <Navbar loggedIn={loggedIn} />
      <Hero />
      <Categories />
      <Featured />
      <Benefits />
      <Offer />
      <Footer loggedIn={loggedIn} />
    </main>
  );
}
