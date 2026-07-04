"use client"

import { useEffect } from "react"
import LandingHero from "@/components/landing-hero"
import WhyChooseUs from "@/components/why-choose-us"
import HowItWorks from "@/components/how-it-works"
import StandardPackages from "@/components/standard-packages"
import PilgrimSection from "@/components/pilgrim-section"
import AgencySection from "@/components/agency-section"
import SacredCollections from "@/components/sacred-collections"
import FaqSection from "@/components/faq-section"

export default function LandingPage() {
  useEffect(() => {
    try {
      const cookies = document.cookie.split("; ").reduce<Record<string, string>>((acc, cookie) => {
        const [key, value] = cookie.split("=")
        acc[key] = value
        return acc
      }, {})
      const role = cookies["user-role"]

      if (window.location.pathname !== "/" || !role) return

      if (role === "agency") window.location.href = "/dashboard/agency"
      if (role === "pilgrim") window.location.href = "/dashboard/pilgrim"
      if (role === "admin") window.location.href = "/dashboard/admin"
    } catch (err) {
      // Ignore malformed cookie values.
    }
  }, [])

  return (
    <div className="flex min-h-screen flex-col bg-[#F8F8F6]">
      <div className="flex-1">
        <LandingHero />
        <WhyChooseUs />
        <HowItWorks />
        <PilgrimSection />
        <AgencySection />
        <SacredCollections />
        <StandardPackages />
        <FaqSection />
      </div>
    </div>
  )
}
