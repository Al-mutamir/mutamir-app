import Link from "next/link"
import {
  ArrowLeft,
  Award,
  BadgeCheck,
  Banknote,
  Building2,
  CheckCircle2,
  Globe,
  Handshake,
  HeartHandshake,
  Lightbulb,
  Lock,
  Map,
  PiggyBank,
  Plane,
  Route,
  Shield,
  Sparkles,
  Target,
  Users,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Footer } from "@/components/footer"

export default function AboutPage() {
  const problems = [
    "Pilgrimage planning is fragmented across agencies, banks, and word of mouth",
    "Finding a trustworthy, licensed agency is difficult",
    "Pricing and package inclusions often lack transparency",
    "Paying for a trip abroad is stressful and hard to track",
    "Saving toward Hajj or Umrah has no structured, dedicated tool",
    "Agencies still manage bookings, payments, and pilgrims manually",
  ]

  const forPilgrims = [
    "Discover verified Hajj & Umrah packages",
    "Compare agencies side by side",
    "Book your journey online",
    "Pay securely, in one place",
    "Save gradually toward Hajj & Umrah",
    "Access flexible financing",
    "Manage your entire journey in one dashboard",
  ]

  const forAgencies = [
    "Publish and manage packages",
    "Receive and track bookings",
    "Manage pilgrims end-to-end",
    "Track payments in real time",
    "Grow visibility to new pilgrims",
  ]

  const forPartners = [
    "Banks & financial institutions",
    "Airlines",
    "Hotels",
    "Visa service providers",
    "Tour operators",
  ]

  const values = [
    {
      title: "Trust",
      description: "Every agency and partner on Al-Mutamir is verified, so pilgrims can book with confidence.",
      icon: <Shield className="h-6 w-6 text-[#c8e823]" />,
    },
    {
      title: "Transparency",
      description: "Clear, itemized pricing across the entire journey — no hidden fees, no opaque middlemen.",
      icon: <Award className="h-6 w-6 text-[#c8e823]" />,
    },
    {
      title: "Accessibility",
      description: "Savings and financing tools that make Hajj and Umrah reachable, not just aspirational.",
      icon: <PiggyBank className="h-6 w-6 text-[#c8e823]" />,
    },
    {
      title: "Excellence",
      description: "A dependable, high-quality standard across every agency and service on the platform.",
      icon: <Target className="h-6 w-6 text-[#c8e823]" />,
    },
    {
      title: "Innovation",
      description: "Technology-first thinking applied to a journey that has run on paper and phone calls for decades.",
      icon: <Lightbulb className="h-6 w-6 text-[#c8e823]" />,
    },
    {
      title: "Community",
      description: "A shared platform that connects pilgrims, agencies, and service providers into one trusted network.",
      icon: <Users className="h-6 w-6 text-[#c8e823]" />,
    },
  ]

  const platformHighlights = [
    { label: "Verified Agencies", icon: <BadgeCheck className="h-5 w-5 text-[#8bc34a]" /> },
    { label: "Secure Payments", icon: <Lock className="h-5 w-5 text-[#8bc34a]" /> },
    { label: "Hajj Savings", icon: <PiggyBank className="h-5 w-5 text-[#8bc34a]" /> },
    { label: "Flexible Financing", icon: <Banknote className="h-5 w-5 text-[#8bc34a]" /> },
    { label: "End-to-End Journey Management", icon: <Route className="h-5 w-5 text-[#8bc34a]" /> },
    { label: "Multiple Package Options", icon: <Map className="h-5 w-5 text-[#8bc34a]" /> },
  ]

  // Placeholder team data — replace with real names, roles, bios, and photos.
  const team = [
    {
      name: "Sanni-Anibire T.A. (Toyyib)",
      role: "Founder",
      bio: "Leads product and technology at Al-Mutamir under Spark Lab, with a background in backend engineering and AI systems.",
      image: "/placeholder.svg?height=300&width=300",
    },
    {
      name: "Team Member Name",
      role: "Role / Title",
      bio: "Short one to two sentence bio goes here.",
      image: "/placeholder.svg?height=300&width=300",
    },
    {
      name: "Team Member Name",
      role: "Role / Title",
      bio: "Short one to two sentence bio goes here.",
      image: "/placeholder.svg?height=300&width=300",
    },
  ]

  const trustPoints = [
    "Verified travel agencies",
    "Transparent pricing",
    "Secure payments",
    "Dedicated customer support",
    "A growing partner network",
    "A technology-first experience",
  ]

  // Placeholder stats — wire these up to real, dynamic figures as the platform grows.
  const stats = [
    { label: "Agencies Onboarding", value: "10+" },
    { label: "Packages Available", value: "20+" },
    { label: "Cities Covered", value: "5+" },
    { label: "Strategic Partners", value: "1" },
  ]

  const timeline = [
    { year: "2023", title: "Founded", description: "Al-Mutamir founded to fix a fragmented pilgrimage journey." },
    { year: "2024", title: "Platform Development", description: "Core platform built: bookings, agencies, pilgrims." },
    { year: "2025", title: "Agency Onboarding", description: "Licensed agencies begin publishing packages on Al-Mutamir." },
    { year: "2026", title: "Savings & Financing", description: "Launch of Hajj & Umrah savings and flexible financing." },
    { year: "Future", title: "Pan-African Expansion", description: "Extending the platform across Africa." },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-white border-b border-gray-100">
        <div className="container py-16">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex justify-end mb-6">
              <Link href="/">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
                </Button>
              </Link>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
              Building the Digital Infrastructure for Hajj &amp; Umrah
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Al-Mutamir is creating the technology that connects pilgrims, licensed travel agencies, financial
              institutions, and service providers in one trusted ecosystem.
            </p>
          </div>
        </div>
      </div>

      <div className="py-12">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="space-y-16">
              {/* Our Story */}
              <section>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                  <div>
                    <h2 className="text-2xl font-bold mb-4">Our Story</h2>
                    <p className="text-gray-600">
                      Al-Mutamir was founded in 2023 to rethink how pilgrims plan and experience their Hajj and
                      Umrah journeys — starting from the ground up, with technology built specifically for the
                      way pilgrimage actually works in Nigeria and across Africa.
                    </p>
                  </div>
                  <div className="relative">
                    <div className="absolute -z-10 inset-0 bg-[#c8e823]/10 rounded-3xl transform rotate-2"></div>
                    <img
                      src="/images/mutamir.png?height=400&width=500"
                      alt="Al-Mutamir founding team"
                      className="rounded-2xl shadow-lg w-full"
                    />
                  </div>
                </div>
              </section>

              {/* The Problem We're Solving */}
              <section className="bg-white p-8 rounded-lg shadow-sm">
                <h2 className="text-2xl font-bold mb-2 text-center">The Challenge</h2>
                <p className="text-gray-600 text-center max-w-2xl mx-auto mb-8">
                  Hajj and Umrah planning has run the same way for decades. Pilgrims and agencies both feel it.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto mb-10">
                  {problems.map((problem, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="mt-1 h-2 w-2 rounded-full bg-red-400 shrink-0" />
                      <p className="text-gray-600 text-sm">{problem}</p>
                    </div>
                  ))}
                </div>
                <div className="border-t border-gray-100 pt-8 text-center">
                  <h3 className="text-xl font-bold mb-2">Our Response</h3>
                  <p className="text-gray-600 max-w-2xl mx-auto">
                    Al-Mutamir was built to solve these problems with technology — replacing fragmented, manual
                    processes with one connected, transparent platform.
                  </p>
                </div>
              </section>

              {/* What We Do */}
              <section>
                <h2 className="text-2xl font-bold mb-6 text-center">What Al-Mutamir Does</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card>
                    <CardContent className="p-6">
                      <div className="bg-[#f0f9d4] p-3 rounded-full w-fit mb-4">
                        <Users className="h-6 w-6 text-[#8bc34a]" />
                      </div>
                      <h3 className="font-bold text-lg mb-3">For Pilgrims</h3>
                      <ul className="space-y-2">
                        {forPilgrims.map((item, index) => (
                          <li key={index} className="text-gray-600 text-sm flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 text-[#8bc34a] mt-0.5 shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6">
                      <div className="bg-[#f0f9d4] p-3 rounded-full w-fit mb-4">
                        <Building2 className="h-6 w-6 text-[#8bc34a]" />
                      </div>
                      <h3 className="font-bold text-lg mb-3">For Agencies</h3>
                      <ul className="space-y-2">
                        {forAgencies.map((item, index) => (
                          <li key={index} className="text-gray-600 text-sm flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 text-[#8bc34a] mt-0.5 shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6">
                      <div className="bg-[#f0f9d4] p-3 rounded-full w-fit mb-4">
                        <Handshake className="h-6 w-6 text-[#8bc34a]" />
                      </div>
                      <h3 className="font-bold text-lg mb-3">For Partners</h3>
                      <ul className="space-y-2">
                        {forPartners.map((item, index) => (
                          <li key={index} className="text-gray-600 text-sm flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 text-[#8bc34a] mt-0.5 shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </section>

              {/* Mission */}
              <section className="bg-white p-8 rounded-lg shadow-sm text-center">
                <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  To build the most trusted digital ecosystem for Hajj and Umrah by making pilgrimage planning
                  more accessible, transparent, affordable, and connected.
                </p>
              </section>

              {/* Vision */}
              <section className="bg-[#0f2a1d] text-white p-8 rounded-lg text-center">
                <h2 className="text-2xl font-bold mb-4">Our Vision</h2>
                <p className="text-gray-200 max-w-2xl mx-auto">
                  To become Africa's leading digital infrastructure powering every stage of the Hajj and Umrah
                  journey.
                </p>
              </section>

              {/* Core Values */}
              <section>
                <h2 className="text-2xl font-bold mb-6 text-center">Core Values</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {values.map((value, index) => (
                    <Card key={index}>
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="bg-[#f0f9d4] p-3 rounded-full">{value.icon}</div>
                          <div>
                            <h3 className="font-bold text-lg mb-2">{value.title}</h3>
                            <p className="text-gray-600">{value.description}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>

              {/* Platform Highlights */}
              <section className="bg-white p-8 rounded-lg shadow-sm">
                <h2 className="text-2xl font-bold mb-6 text-center">Platform Highlights</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  {platformHighlights.map((item, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="bg-[#f0f9d4] p-2 rounded-full shrink-0">{item.icon}</div>
                      <span className="font-medium text-sm">{item.label}</span>
                    </div>
                  ))}
                </div>
              </section>

              {/* Our Team */}
              <section>
                <h2 className="text-2xl font-bold mb-2 text-center">Our Team</h2>
                <p className="text-gray-600 text-center max-w-2xl mx-auto mb-8">
                  The people building the platform behind every Al-Mutamir journey.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {team.map((member, index) => (
                    <div key={index} className="bg-white rounded-lg overflow-hidden shadow-sm text-center">
                      <img
                        src={member.image || "/placeholder.svg"}
                        alt={member.name}
                        className="w-full h-64 object-cover"
                      />
                      <div className="p-6">
                        <h3 className="font-bold text-lg">{member.name}</h3>
                        <p className="text-[#8bc34a] font-medium text-sm mt-1">{member.role}</p>
                        <p className="text-gray-600 text-sm mt-3">{member.bio}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Strategic Partnerships */}
              <section className="bg-white p-8 rounded-lg shadow-sm">
                <h2 className="text-2xl font-bold mb-6 text-center">Strategic Partnerships</h2>

                <div className="mb-8">
                  <h3 className="font-bold text-lg mb-4">Current Partners</h3>
                  <div className="border border-gray-100 rounded-lg p-5 flex items-center gap-4 max-w-md">
                    <div className="bg-[#f0f9d4] p-3 rounded-full">
                      <Sparkles className="h-5 w-5 text-[#8bc34a]" />
                    </div>
                    <div>
                      <p className="font-semibold">Opulens</p>
                      <p className="text-gray-600 text-sm">Bespoke travel experiences for VIP clients</p>
                    </div>
                  </div>
                </div>

                <div className="mb-8">
                  <h3 className="font-bold text-lg mb-4">Financial Partners</h3>
                  <div className="border border-gray-100 rounded-lg p-5 flex items-center gap-4 max-w-md">
                    <div className="bg-[#f0f9d4] p-3 rounded-full">
                      <Banknote className="h-5 w-5 text-[#8bc34a]" />
                    </div>
                    <div>
                      <p className="font-semibold">Alternative Bank</p>
                      <p className="text-gray-600 text-sm">Coming soon</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-lg mb-4">Seeking Partnerships</h3>
                  <div className="flex flex-wrap gap-2">
                    {["Airlines", "Hotels", "Visa Services", "Insurance", "Telecommunications", "Government Bodies"].map(
                      (item, index) => (
                        <span key={index} className="bg-gray-100 px-3 py-1 rounded-full text-sm">
                          {item}
                        </span>
                      ),
                    )}
                  </div>
                </div>
              </section>

              {/* Why People Trust Al-Mutamir */}
              <section>
                <h2 className="text-2xl font-bold mb-6 text-center">Why People Trust Al-Mutamir</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
                  {trustPoints.map((point, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <HeartHandshake className="h-5 w-5 text-[#8bc34a] shrink-0" />
                      <span className="text-gray-600 text-sm">{point}</span>
                    </div>
                  ))}
                </div>
              </section>

              {/* Where We Operate */}
              <section className="bg-white p-8 rounded-lg shadow-sm">
                <h2 className="text-2xl font-bold mb-6 text-center">Where We Operate</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto text-center">
                  <div className="border border-gray-100 rounded-lg p-6">
                    <div className="bg-[#f0f9d4] p-3 rounded-full w-fit mx-auto mb-3">
                      <Building2 className="h-6 w-6 text-[#8bc34a]" />
                    </div>
                    <p className="font-semibold">Nigeria</p>
                    <p className="text-gray-600 text-sm">Headquarters</p>
                  </div>
                  <div className="border border-gray-100 rounded-lg p-6">
                    <div className="bg-[#f0f9d4] p-3 rounded-full w-fit mx-auto mb-3">
                      <Plane className="h-6 w-6 text-[#8bc34a]" />
                    </div>
                    <p className="font-semibold">Saudi Arabia</p>
                    <p className="text-gray-600 text-sm">Operational Partners</p>
                  </div>
                  <div className="border border-gray-100 rounded-lg p-6">
                    <div className="bg-[#f0f9d4] p-3 rounded-full w-fit mx-auto mb-3">
                      <Globe className="h-6 w-6 text-[#8bc34a]" />
                    </div>
                    <p className="font-semibold">Global</p>
                    <p className="text-gray-600 text-sm">Digital Platform</p>
                  </div>
                </div>
              </section>

              {/* Our Impact / Statistics */}
              <section>
                <h2 className="text-2xl font-bold mb-6 text-center">Our Impact</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {stats.map((stat, index) => (
                    <div key={index} className="bg-white rounded-lg shadow-sm p-6 text-center">
                      <p className="text-3xl font-bold text-[#8bc34a]">{stat.value}</p>
                      <p className="text-gray-600 text-sm mt-1">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Roadmap / Timeline */}
              <section className="bg-white p-8 rounded-lg shadow-sm">
                <h2 className="text-2xl font-bold mb-8 text-center">Roadmap</h2>
                <div className="max-w-xl mx-auto">
                  {timeline.map((item, index) => (
                    <div key={index} className="flex gap-4 pb-8 last:pb-0">
                      <div className="flex flex-col items-center">
                        <div className="h-3 w-3 rounded-full bg-[#8bc34a] shrink-0" />
                        {index < timeline.length - 1 && <div className="w-px flex-1 bg-gray-200 mt-1" />}
                      </div>
                      <div className="pb-2">
                        <p className="text-sm font-semibold text-[#8bc34a]">{item.year}</p>
                        <p className="font-bold">{item.title}</p>
                        <p className="text-gray-600 text-sm mt-1">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Join Us */}
              <section className="bg-[#f0f9d4] p-8 rounded-lg text-center">
                <h2 className="text-2xl font-bold mb-4">Be Part of the Future of Pilgrimage</h2>
                <p className="text-gray-700 max-w-2xl mx-auto mb-6">
                  Whether you're a pilgrim seeking a transparent Hajj or Umrah journey, or a licensed agency
                  looking to modernize how you operate, Al-Mutamir is the infrastructure built for you.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center flex-wrap">
                  <Link href="/services">
                    <Button className="bg-[#c8e823] text-black hover:bg-[#b5d31f]">Explore Packages</Button>
                  </Link>
                  <Link href="/contact">
                    <Button variant="outline">Become a Partner</Button>
                  </Link>
                  <Link href="/contact">
                    <Button variant="outline">Join the Savings Waitlist</Button>
                  </Link>
                  <Link href="/contact">
                    <Button variant="outline">Contact Us</Button>
                  </Link>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}