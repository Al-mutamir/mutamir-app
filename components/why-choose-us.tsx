import Link from "next/link"
import { ArrowRight, BadgeDollarSign, Headphones, LayoutDashboard, School } from "lucide-react"
import { Button } from "@/components/ui/button"

const features = [
  { title: "Experienced Guidance", icon: School },
  { title: "Customizable Packages", icon: LayoutDashboard },
  { title: "24/7 Support", icon: Headphones },
  { title: "Transparent Pricing", icon: BadgeDollarSign },
]

export default function WhyChooseUs() {
  return (
    <section className="container py-20">
      <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
        <div>
          <h2 className="mb-6 text-3xl font-bold tracking-normal text-[#007F5F] md:text-5xl">
            Why Choose Our Hajj &amp; Umrah Services?
          </h2>
          <p className="mb-8 text-lg leading-8 text-[#444746]">
            At Almutamir, we understand the sacred significance of your pilgrimage. Our platform gives you the freedom
            to customize every aspect of your journey, ensuring a deeply personal and meaningful experience.
          </p>
          <Link href="/services">
            <Button variant="link" className="h-auto px-0 font-bold text-[#007F5F]">
              Explore more <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {features.map((feature) => {
            const Icon = feature.icon

            return (
              <div
                key={feature.title}
                className="rounded-xl border border-gray-100 bg-white p-8 shadow-[0_18px_55px_rgba(26,28,27,0.08)] transition-all hover:-translate-y-1"
              >
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-[#007F5F]/10">
                  <Icon className="h-6 w-6 text-[#007F5F]" />
                </div>
                <h3 className="text-lg font-bold text-[#1a1c1b]">{feature.title}</h3>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
