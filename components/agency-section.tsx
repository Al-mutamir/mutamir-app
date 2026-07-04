import Link from "next/link"
import { Button } from "@/components/ui/button"

const agencyBenefits = [
  {
    title: "Package Creation",
    description: "Easily create customized packages with granular pricing control.",
  },
  {
    title: "Client Management",
    description: "Track registrations and manage pilgrim data in one place.",
  },
]

export default function AgencySection() {
  return (
    <section id="agencies" className="px-4 py-10 md:px-8">
      <div className="mx-auto max-w-[1320px] overflow-hidden rounded-3xl bg-[#1a1c1b] py-20">
        <div className="container">
          <div className="grid grid-cols-1 items-center gap-16 md:grid-cols-2">
            <div className="text-white">
              <span className="mb-4 block text-[11px] font-bold uppercase tracking-[0.2em] text-[#E3B23C]">
                For Agencies
              </span>
              <h2 className="mb-6 text-3xl font-bold leading-tight tracking-normal md:text-5xl">
                Streamline Your Operations and Grow Your Business
              </h2>
              <p className="mb-10 text-lg italic leading-8 text-white/70">
                Almutamir provides agencies with powerful tools to create, manage, and share Hajj and Umrah packages
                with clients efficiently.
              </p>

              <ul className="mb-12 space-y-8">
                {agencyBenefits.map((benefit) => (
                  <li key={benefit.title} className="flex items-start gap-5">
                    <div className="h-12 w-1 rounded-full bg-[#E3B23C]" />
                    <div>
                      <h3 className="text-xl font-semibold text-[#E3B23C]">{benefit.title}</h3>
                      <p className="text-sm text-white/60">{benefit.description}</p>
                    </div>
                  </li>
                ))}
              </ul>

              <Link href="/auth/register">
                <Button className="rounded-full bg-[#E3B23C] px-10 py-6 font-bold text-[#1a1c1b] hover:bg-[#d5a331]">
                  Register Your Agency
                </Button>
              </Link>
            </div>

            <img
              src="/images/agency.jpg"
              alt="Agency dashboard visual"
              className="h-[380px] w-full rounded-2xl border border-white/10 object-cover shadow-2xl md:h-[500px]"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
