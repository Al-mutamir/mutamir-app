import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function WhyChooseUs() {
  return (
    <section className="py-20">
      <div className="container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="bg-[#c8e823]/20 rounded-lg p-8 relative">
            <div className="absolute -top-6 -left-6 bg-white rounded-full shadow-lg p-4">
              <img
                src="/images/muslim.png?height=80&width=80"
                alt="Pilgrim Testimonial"
                className="h-16 w-16 rounded-full"
              />
            </div>
            <div className="ml-12 mt-4">
              <h3 className="font-bold">Trusted Pilgrim</h3>
              <div className="flex items-center gap-1 text-yellow-500">
                <span>★</span>
                <span>5.0</span>
              </div>
            </div>
            <div className="mt-8 flex items-center gap-4">
              <div className="bg-white rounded-full p-3 shadow-md">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"></path>
                  <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"></path>
                </svg>
              </div>
              <p className="text-lg">
                Al-Mutamir <br />
                <span className="text-sm text-gray-500">Hajj & Umrah Planner</span>
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-3xl font-bold mb-6">
              Why Choose Our <br />
              Hajj & Umrah Services?
            </h2>
            <p className="text-gray-600 mb-8">
              At Al-Mutamir, we understand the sacred significance of your pilgrimage. Our platform gives you the freedom
              to customize every aspect of your journey, ensuring a deeply personal and meaningful experience.
            </p>

            <Link href="/services">
              <Button className="mb-12 bg-[#c8e823] text-black hover:bg-[#b5d31f]">Explore more</Button>
            </Link>

            <div className="grid grid-cols-2 gap-8">
              <div className="flex flex-col items-center text-center">
                <div className="bg-[#f0f9d4] p-4 rounded-lg mb-4">
                  <img src="/images/book.webp?height=40&width=40" alt="Experienced Guidance" className="h-10 w-10" />
                </div>
                <h3 className="font-semibold">Experienced Guidance</h3>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="bg-[#f0f9d4] p-4 rounded-lg mb-4">
                  <img src="/images/hand.webp?height=40&width=40" alt="Comprehensive Packages" className="h-10 w-10" />
                </div>
                <h3 className="font-semibold">Customizable Packages</h3>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="bg-[#f0f9d4] p-4 rounded-lg mb-4">
                  <img src="/images/24-hours.webp?height=40&width=40" alt="24/7 Support" className="h-10 w-10" />
                </div>
                <h3 className="font-semibold">24/7 Support</h3>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="bg-[#f0f9d4] p-4 rounded-lg mb-4">
                  <img src="/images/low-price.webp?height=40&width=40" alt="Affordable Options" className="h-10 w-10" />
                </div>
                <h3 className="font-semibold">Transparent Pricing</h3>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
