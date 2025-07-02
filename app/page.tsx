"use client"

import BookingWidget from "@/components/booking-widget"
import AirlinePartners from "@/components/airline-partners"
import WhyChooseUs from "@/components/why-choose-us"
import HowItWorks from "@/components/how-it-works"
import StandardPackages from "@/components/standard-packages"
import PilgrimSection from "@/components/pilgrim-section"
import AgencySection from "@/components/agency-section"
import CaseStudySection from "@/components/case-study-section"
import FaqSection from "@/components/faq-section"
import Link from "next/link"
import { Button } from "@/components/ui/button" 

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative">
          <div className="absolute inset-0 bg-black/60 z-10"></div>
          <div
            className="h-[600px] bg-cover bg-center"
            style={{ backgroundImage: "url('/images/hajj-umrah.webp?height=600&width=1200')" }}
          >
            <div className="container relative z-20 h-full flex items-center">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div>
                  <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                     Access <span className="text-[#c8e823]">Affordable Hajj & <br />
                    Umrah Packages</span> <br />
                     With A Click...
                  </h1>
                  

                  <p className="text-white/80 mt-8 max-w-md">
                    Al-Mutamir gives you full control over your Hajj and Umrah experience. Plan, book, and manage
                    your pilgrimage with transparency and peace of mind.
                  </p>
                </div>
                <div className="hidden lg:block">
                  <BookingWidget />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Booking Widget (Mobile) */}
        <div className="lg:hidden -mt-6 relative z-20 px-4">
          <BookingWidget />
        </div>

        {/* Airline Partners */}
       {/* <AirlinePartners /> to be considered later*/} 

        {/* Why Choose Us */}
        <WhyChooseUs />

        {/* How It Works */}
        <HowItWorks />

        {/* For Pilgrims Section */}
        <PilgrimSection />

        {/* For Agencies Section */}
        <AgencySection />

        {/* Standard Packages */}
        <StandardPackages />

        {/* Case Study Section */}
        {/* <CaseStudySection /> */}

        {/* FAQ */}
        <FaqSection />
      </main>

    </div>
  )
}
