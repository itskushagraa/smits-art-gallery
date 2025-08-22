// app/page.tsx
import Header from "@/components/Header";
import HeaderMobile from "@/components/HeaderMobile";
import Hero from "@/components/Hero";
import Categories from "@/components/Categories";
import Footer from "@/components/Footer";

export default function HomePage() {
    return (
        <main className="flex min-h-screen flex-col bg-[#f8fcfa]">
            <div className="md:hidden"><HeaderMobile /></div>
            <div className="hidden md:block"><Header /></div>
            <div className="pt-[32px] flex flex-col flex-1">
                <Hero />
                <Categories />
            </div>
            <Footer />
        </main>
    );
}
