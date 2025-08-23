// app/contact/page.tsx
import HeaderMobile from "@/components/HeaderMobile";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ContactPageInner from "@/components/contact/ContactPageInner";
import { signedMediaUrl } from "@/lib/mediaUrl";

export default function ContactPage() {
  // Pre-signed, proxied interior derivatives for the background slideshow
  const slides = [
    signedMediaUrl("the-eye/interior_1200_wm.webp"),
    signedMediaUrl("mirrors-and-reflections/interior_1200_wm.webp"),
    signedMediaUrl("released/interior_1200_wm.webp"),
    signedMediaUrl("deja-vu/interior_1200_wm.webp"),
    signedMediaUrl("masquerade/interior_1200_wm.webp"),
  ];

  return (
    <main className="flex min-h-screen flex-col bg-[#f8fcfa]">
      <div className="md:hidden"><HeaderMobile /></div>
      <div className="hidden md:block"><Header /></div>
      <ContactPageInner slides={slides} />
      <Footer />
    </main>
  );
}
