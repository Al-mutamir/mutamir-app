import Link from "next/link"
import { ArrowRight, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function AgencySection() {
  return (
    <section id="agencies" className="py-20 bg-gray-50">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-block bg-[#c8e823]/10 px-4 py-2 rounded-full text-black font-medium text-sm mb-4">
              For Agencies
            </div>
            <h2 className="text-3xl font-bold tracking-tight mb-6">
              Streamline Your Operations and Grow Your Business
            </h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Mutamir provides agencies with powerful tools to create, manage, and share Hajj and Umrah packages with
              clients. Our comprehensive dashboard helps you monitor offerings, manage clients, and grow your business.
              Plus, you'll get a dedicated agency@mutamir.com email address and notifications for every new client.
            </p>

            <ul className="space-y-4 mb-8">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="h-6 w-6 text-[#c8e823] shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold">Package Creation</h3>
                  <p className="text-gray-600">
                    Easily create customized Hajj and Umrah packages with detailed pricing
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="h-6 w-6 text-[#c8e823] shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold">Client Management</h3>
                  <p className="text-gray-600">Track client registrations and manage pilgrim information efficiently</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="h-6 w-6 text-[#c8e823] shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold">Secure Payment Processing</h3>
                  <p className="text-gray-600">Receive payments securely through our trusted payment gateway</p>
                </div>
              </li>
            </ul>

            <Link href="/agency/register">
              <Button className="bg-[#c8e823] text-black hover:bg-[#b5d31f]">
                Register Your Agency <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="relative">
            <div className="absolute -z-10 inset-0 bg-[#c8e823]/10 rounded-3xl transform rotate-2"></div>
            <img
              src="/images/agency.jpg?height=600&width=800"
              alt="Agency dashboard"
              className="rounded-2xl shadow-lg w-full"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
