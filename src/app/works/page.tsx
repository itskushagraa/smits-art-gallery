// app/works/page.tsx
import HeaderMobile from "@/components/HeaderMobile";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CategoryPills from "@/components/works/CategoryPills";
import SortSelect from "@/components/works/SortSelect";
import Card, { Artwork } from "@/components/works/Card";
import { fetchArtworks } from "@/lib/artworks/fetchArtworks";

export default async function WorksPage({
    searchParams,
}: {
    searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
    const sp = await searchParams;

    const selectedCategory =
        (Array.isArray(sp.category) ? sp.category[0] : sp.category) as
        | "figurative"
        | "landscape"
        | "abstract"
        | "prints"
        | undefined;

    const sort =
        (Array.isArray(sp.sort) ? sp.sort[0] : sp.sort) as
        | "price_asc"
        | "price_desc"
        | "size_asc"
        | "size_desc"
        | "random"
        | undefined;


    const items: Artwork[] = await fetchArtworks({
        category: selectedCategory,
        sort,
    });

    return (
        <main className="flex min-h-screen flex-col bg-[#f8fcfa]">
            <div className="md:hidden"><HeaderMobile /></div>
            <div className="hidden md:block"><Header /></div>
            <div className="pt-[72px] flex-1 px-6 md:px-20 py-10">
                {/* Title row */}
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-3xl font-serif font-bold text-[#0c1c17]">Works</h1>
                    <SortSelect value={sort} />
                </div>

                {/* Controls strip */}
                <div className="mb-8 flex flex-col gap-3">
                    <CategoryPills selected={selectedCategory} />
                </div>

                {/* Grid */}
                {items.length === 0 ? (
                    <div className="rounded-xl bg-white p-8 text-center text-[#0c1c17] shadow-sm ring-1 ring-black/5">
                        <p className="text-lg font-semibold">No works match these filters.</p>
                        <p className="mt-1 text-sm text-[#0c1c17]/70">
                            Try adjusting your category or sorting.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                        {items.map((a) => (
                            <Card key={a.slug} artwork={a} />
                        ))}
                    </div>
                )}
            </div>
            <Footer />
        </main>
    );
}
