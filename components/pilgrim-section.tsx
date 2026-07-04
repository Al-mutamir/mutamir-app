import Link from "next/link"
import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"

const benefits = [
  {
    title: "Customizable Packages",
    description: "Flexible service options for both Hajj and Umrah.",
  },
  {
    title: "Transparent Pricing",
    description: "Real-time costs with zero hidden charges.",
  },
  {
    title: "Verified Services",
    description: "Accredited agencies and world-class partners.",
  },
]

export default function PilgrimSection() {
  return (
    <section id="pilgrims" className="container py-20">
      <div className="grid grid-cols-1 items-center gap-16 md:grid-cols-2">
        <div className="order-2 md:order-1">
          <img
            src="/images/pilgrim.jpg"
            alt="Pilgrim journey"
            className="h-[420px] w-full rounded-2xl object-cover shadow-[0_24px_70px_rgba(26,28,27,0.12)] md:h-[540px]"
          />
        </div>
        <div className="order-1 md:order-2">
          <span className="mb-4 block text-[11px] font-bold uppercase tracking-[0.2em] text-[#007F5F]">
            For Pilgrims
          </span>
          <h2 className="mb-6 text-3xl font-bold leading-tight tracking-normal text-[#1a1c1b] md:text-5xl">
            Experience a Spiritual Journey Tailored to Your Needs
          </h2>
          <p className="mb-10 text-lg leading-8 text-[#444746]">
            At Almutamir, we understand the sacred significance of your pilgrimage. Our platform gives you the freedom
            to customize every aspect of your journey, ensuring a deeply personal and meaningful experience.
          </p>

          <ul className="mb-12 space-y-6">
            {benefits.map((benefit) => (
              <li key={benefit.title} className="flex items-start gap-4">
                <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#007F5F]/10">
                  <Check className="h-4 w-4 text-[#007F5F]" />
                </div>
                <div>
                  <h3 className="font-bold text-[#1a1c1b]">{benefit.title}</h3>
                  <p className="text-sm text-[#444746]">{benefit.description}</p>
                </div>
              </li>
            ))}
          </ul>

          <Link href="/services">
            <Button className="rounded-full bg-[#007F5F] px-10 py-6 font-bold text-white hover:bg-[#00684e]">
              Create a Booking
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
