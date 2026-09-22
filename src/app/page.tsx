import SiteHeader from "@/components/site/SiteHeader";
import SiteFooter from "@/components/site/SiteFooter";
import Hero from "@/components/hero/Hero";
import Favourites from "@/components/favourites/Favourites";
import Story from "@/components/story/Story";
import Gallery from "@/components/gallery/Gallery";
import Visit from "@/components/visit/Visit";

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main id="top">
        <Hero />
        <Favourites />
        <Story />
        <Gallery />
        <Visit />
      </main>
      <SiteFooter />
    </>
  );
}
