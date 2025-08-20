// app/page.tsx
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Categories from "@/components/Categories";
import Footer from "@/components/Footer";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col bg-[#f8fcfa]">
      <Header />
      <div className="pt-[72px] flex flex-col flex-1">
        <Hero />
        <Categories />
      </div>
      <Footer />
    </main>
  );
}
