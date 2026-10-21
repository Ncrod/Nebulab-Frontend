import AboutFaq from "./AboutFaq";
import AboutIntro from "./AboutIntro";
import AboutShowcase from "./AboutShowcase";
import AboutStats from "./AboutStats";
import Footer from "./Footer";
import Navbar from "./Navbar";

/** About us page. */
export default function AboutPage({ loggedIn = false }: { loggedIn?: boolean }) {
  return (
    <main className="min-h-screen overflow-x-clip">
      <Navbar loggedIn={loggedIn} />
      <AboutIntro />
      <AboutStats loggedIn={loggedIn} />
      <AboutShowcase />
      <AboutFaq />
      <Footer loggedIn={loggedIn} />
    </main>
  );
}
