import BookingWidget from "@/components/booking-widget"

export default function LandingHero() {
  return (
    <section className="relative min-h-[calc(100vh-5rem)] overflow-visible">
      <div className="absolute inset-0">
        <img
          src="/images/hajj-umrah.webp"
          alt="Sacred pilgrimage scene"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/45 to-black/70" />
      </div>

      <div className="container relative z-10 flex min-h-[calc(100vh-5rem)] items-center justify-center pb-24 pt-16 text-center md:pb-36">
        <div className="max-w-4xl">
          <h1 className="text-4xl font-bold leading-tight tracking-normal text-white md:text-6xl">
            Access Affordable Hajj &amp; Umrah Packages With A Click...
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-white/90">
            Al-Mutamir gives you full control over your Hajj and Umrah experience. Plan, book, and manage your
            pilgrimage with transparency and peace of mind.
          </p>
          <div className="mt-10 inline-flex max-w-full items-center gap-3 rounded-full border border-white/30 bg-white/20 px-5 py-2 text-sm text-white backdrop-blur-lg">
            <span className="font-bold text-[#E3B23C]">5.0</span>
            <span className="truncate">Trusted Pilgrim - Almutamir Hajj &amp; Umrah Planner</span>
          </div>
        </div>
      </div>

      <div className="container relative z-20 -mt-20 pb-10 md:-mt-24">
        <BookingWidget variant="landing" />
      </div>
    </section>
  )
}
