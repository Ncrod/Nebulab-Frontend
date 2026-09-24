import Benefits from "./components/Benefits";
import Categories from "./components/Categories";
import Featured from "./components/Featured";
import Footer from "./components/Footer";
import Hero from "./components/Hero";
import Navbar from "./components/Navbar";
import Offer from "./components/Offer";

export default function Home() {
  return (
    <main className="min-h-screen overflow-x-clip">
      <Navbar />
      <Hero />
      <Categories />
      <Featured />
      <Benefits />
      <Offer />
      <Footer />
    </main>
  );
}
