// app/page.tsx
import Header from "@/components/Header";
import HeaderMobile from "@/components/HeaderMobile";
import Hero from "@/components/Hero";
import Categories from "@/components/Categories";
import Footer from "@/components/Footer";
import { signedMediaUrl } from "@/lib/mediaUrl";

export default function HomePage() {
  // Server-side: mint short-lived, proxied URLs for interior derivatives
  const slides = [
    signedMediaUrl("the-eye/interior_1200_wm.webp", 60),
    signedMediaUrl("mirrors-and-reflections/interior_1200_wm.webp", 60),
    signedMediaUrl("released/interior_1200_wm.webp", 60),
    signedMediaUrl("deja-vu/interior_1200_wm.webp", 60),
    signedMediaUrl("masquerade/interior_1200_wm.webp", 60),
  ];

  return (
    <main className="flex min-h-screen flex-col bg-[#f8fcfa]">
      <div className="md:hidden"><HeaderMobile /></div>
      <div className="hidden md:block"><Header /></div>
      <div className="pt-[32px] flex flex-col flex-1">
        <Hero slides={slides} />
        <Categories />
      </div>
      <Footer />
    </main>
  );
}
