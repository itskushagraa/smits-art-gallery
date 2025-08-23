// app/about/page.tsx
import Header from "@/components/Header";
import HeaderMobile from "@/components/HeaderMobile";
import Footer from "@/components/Footer";
import Image from "next/image";
import { signedMediaUrl } from "@/lib/mediaUrl";

export const revalidate = 20;

export default function AboutPage() {
  // pick whichever interior derivative you like
  const hero = signedMediaUrl("released/interior_1200_wm.webp");

  const NAME = "Smita Sharma";
  const ROLE = "Artist & Founder";
  const BIO_SHORT =
    "Smita J Sharma is a professional fine art painter living and working in Jaipur, India. Born in the culturally rich state of Rajasthan, her early life was marked by a deep connection with various performing art forms and the natural splendours of her surroundings were the inspiration for her initial foray into different fine art forms.";
  const BIO_LONG = `
At the core of her oeuvre lies a profound exploration of the human condition, examined through the prism of spiritual consciousness and the bonds that unite us. Through her soft feminine figures and symbolic elements of nature, she explores a vivid spectrum of emotions, energy, and dreams. Her paintings reflect the human journey towards wholeness across different realms. Her narratives navigate the liminal spaces where earthly connections and spiritual undercurrents converge, illuminating the profound architecture of the soul.

In her process, to depict the complex emotional landscapes, she employs a deliberate colour palette and utilizes layers with rich textures to achieve the desired level of abstraction. Strong lines demarcate her subjects from the background, symbolizing the boundaries of individual consciousness. A dedicated full-time artist, she has been exhibiting her work and participating in group shows across the country since 2016.
`.trim();

  return (
    <main className="flex min-h-screen flex-col">
      <div className="md:hidden"><HeaderMobile /></div>
      <div className="hidden md:block"><Header /></div>

      {/* full-screen background behind everything (keeps card exactly where it was) */}
      <div className="fixed inset-0 -z-10">
        <Image
          src={hero}
          alt=""
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/10 to-black/40" />
      </div>

      <section className="px-6 md:px-12">
        <div className="mx-auto max-w-5xl">
          {/* spacer same height as the old banner so layout stays identical */}
          <div className="h-[220px] md:h-[300px]" />

          {/* card (unchanged) */}
          <article className="relative -mt-12 md:-mt-16 z-10 rounded-2xl bg-white p-6 md:p-8 ring-1 ring-black/10 shadow">
            <div className="grid grid-cols-[96px,1fr] gap-4 md:grid-cols-[120px,1fr] md:gap-6">
              {/* avatar */}
              <div className="relative -mt-10 md:-mt-12 h-24 w-24 md:h-28 md:w-28 overflow-hidden rounded-full ring-2 ring-white shadow">
                <Image
                  src="/pfp.png"
                  alt={`${NAME} portrait`}
                  fill
                  className="object-cover"
                  sizes="120px"
                  priority
                />
              </div>

              {/* text */}
              <div>
                <h1 className="font-serif text-2xl md:text-3xl font-bold text-[#0c1c17]">
                  {NAME}
                </h1>
                <p className="text-sm text-[#0c1c17]/70">{ROLE}</p>
                <p className="mt-3 text-[15px] leading-relaxed text-[#0c1c17]/85">
                  {BIO_SHORT}
                </p>
              </div>
            </div>

            <div className="mt-6 whitespace-pre-line text-[15px] leading-relaxed text-[#0c1c17]/85">
              {BIO_LONG}
            </div>
          </article>
        </div>
      </section>
      <div className="py-20" />
      <div className="relative z-10"><Footer/></div>
    </main>
  );
}
