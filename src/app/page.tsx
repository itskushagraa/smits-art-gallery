// app/page.tsx
import Header from "@/components/Header";
import HeaderMobile from "@/components/HeaderMobile";
import Hero from "@/components/Hero";
import Categories from "@/components/Categories";
import Footer from "@/components/Footer";
import { signedMediaUrl } from "@/lib/mediaUrl";

export const revalidate = 20;

export default function HomePage() {
  // Server-side: mint short-lived, proxied URLs for interior derivatives
  const slides = [
    signedMediaUrl("the-eye/interior_1200_wm.webp"),
    signedMediaUrl("mirrors-and-reflections/interior_1200_wm.webp"),
    signedMediaUrl("released/interior_1200_wm.webp"),
    signedMediaUrl("deja-vu/interior_1200_wm.webp"),
    signedMediaUrl("masquerade/interior_1200_wm.webp"),
  ];

  return (
    <main className="flex min-h-screen flex-col bg-[#F3EeE9]">
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
