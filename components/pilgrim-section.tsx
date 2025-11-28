import Link from "next/link"
import { ArrowRight, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function PilgrimSection() {
  return (
    <section id="pilgrims" className="py-20">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="order-2 md:order-1 relative">
            <div className="absolute -z-10 inset-0 bg-[#c8e823]/10 rounded-3xl transform -rotate-2"></div>
            <img
              src="/images/pilgrim.jpg?height=600&width=800"
              alt="Pilgrim experience"
              className="rounded-2xl shadow-lg w-full"
            />
          </div>
          <div className="order-1 md:order-2">
            <div className="inline-block bg-[#c8e823]/10 px-4 py-2 rounded-full text-black font-medium text-sm mb-4">
              For Pilgrims
            </div>
            <h2 className="text-3xl font-bold tracking-tight mb-6">
              Experience a Spiritual Journey Tailored to Your Needs
            </h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              At Almutamir, we understand the sacred significance of your pilgrimage. Our platform gives you the freedom
              to customize every aspect of your journey, ensuring a deeply personal, meaningful, and spiritually
              fulfilling experience that will stay with you for a lifetime.
            </p>

            <ul className="space-y-4 mb-8">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="h-6 w-6 text-[#c8e823] shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold">Customizable Packages</h3>
                  <p className="text-gray-600">Choose between Hajj and Umrah packages with flexible service options</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="h-6 w-6 text-[#c8e823] shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold">Transparent Pricing</h3>
                  <p className="text-gray-600">No hidden fees or surprises - see exactly what you're paying for</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="h-6 w-6 text-[#c8e823] shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold">Verified Services</h3>
                  <p className="text-gray-600">All services are provided by accredited agencies and partners</p>
                </div>
              </li>
            </ul>

            <Link href="/services">
              <Button className="bg-[#c8e823] text-black hover:bg-[#b5d31f]">
                Create a Booking <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
