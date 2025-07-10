import Link from "next/link"
import { ArrowLeft, Award, Clock, Globe, Heart, Shield, Target, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Footer } from "@/components/footer"

export default function AboutPage() {
  const partnerships = [
    {
      name: "Opulens",
      description: "Official partnership for bespoke travel experiences for VIP clients who seek exclusivity, comfort, and authenticity. ",
      image: "/images/partners/opulens.png?height=300&width=300",
    },
    // {
    //   name: "Global Travel Alliance",
    //   description: "International network of verified travel agencies specializing in religious tourism",
    //   image: "/placeholder.svg?height=300&width=300",
    // },
    // {
    //   name: "Hospitality Excellence Group",
    //   description: "Premium accommodation providers in Makkah and Madinah with special rates for Mutamir pilgrims",
    //   image: "/placeholder.svg?height=300&width=300",
    // },
  ]

  const locations = [
    {
      region: "Middle East",
      countries: ["Saudi Arabia", "UAE", "Qatar", "Kuwait"],
      highlight: "Direct operations in Saudi Arabia with operational partners in Makkah and Madinah",
    },
    {
      region: "Africa",
      countries: ["Nigeria", "Egypt", "Morocco", "South Africa"],
      highlight: "Strong presence in Nigeria with local representatives in major cities",
    },
    {
      region: "Asia",
      countries: ["Malaysia", "Indonesia", "Pakistan", "Bangladesh"],
      highlight: "Partnerships with established agencies in major Muslim countries",
    },
    {
      region: "Europe & Americas",
      countries: ["UK", "France", "USA", "Canada"],
      highlight: "Remote services with dedicated support teams for Western pilgrims",
    },
  ]

  const values = [
    {
      title: "Transparency",
      description: "We believe in complete transparency in pricing and services, with no hidden fees or surprises.",
      icon: <Shield className="h-6 w-6 text-[#c8e823]" />,
    },
    {
      title: "Flexibility",
      description:
        "We understand that every pilgrim's needs are different, which is why we offer customizable packages.",
      icon: <Heart className="h-6 w-6 text-[#c8e823]" />,
    },
    {
      title: "Empowerment",
      description: "We empower pilgrims with knowledge and choices, putting them in control of their sacred journey.",
      icon: <Target className="h-6 w-6 text-[#c8e823]" />,
    },
    {
      title: "Community",
      description: "We foster a sense of community among pilgrims, creating opportunities for shared experiences.",
      icon: <Users className="h-6 w-6 text-[#c8e823]" />,
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="py-12">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold">About Mutamir</h1>
              <Link href="/">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
                </Button>
              </Link>
            </div>

            <div className="space-y-12">
              {/* Our Story */}
              <section>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                  <div>
                    <h2 className="text-2xl font-bold mb-4">Our Story</h2>
                    <p className="text-gray-600 mb-4">
                      Al-Mutamir was conceived in 2023 with a simple mission: to transform the way pilgrims plan and
                      experience their Hajj and Umrah journeys, after we recognized that the traditional approach to
                      pilgrimage planning often lacked transparency, flexibility, and personalization.
                    </p>
                    <p className="text-gray-600">
                      Our platform was built to give pilgrims a wide range of choices, allowing them have control over every aspect of
                      their sacred journey while ensuring they receive the guidance and support they need along the way.
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

              {/* Our Mission */}
              <section className="bg-white p-8 rounded-lg shadow-sm">
                <h2 className="text-2xl font-bold mb-4 text-center">Our Mission</h2>
                <p className="text-gray-600 text-center max-w-2xl mx-auto">
                  To revolutionize the Hajj and Umrah experience by providing a transparent, flexible, and
                  pilgrim-centered platform that empowers individuals to create meaningful spiritual journeys tailored
                  to their unique needs and preferences.
                </p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8">
                  <div className="flex flex-col items-center text-center">
                    <div className="bg-[#f0f9d4] p-4 rounded-full mb-3">
                      <Globe className="h-6 w-6 text-[#8bc34a]" />
                    </div>
                    <span className="font-medium">Global Reach</span>
                  </div>
                  <div className="flex flex-col items-center text-center">
                    <div className="bg-[#f0f9d4] p-4 rounded-full mb-3">
                      <Clock className="h-6 w-6 text-[#8bc34a]" />
                    </div>
                    <span className="font-medium">24/7 Support</span>
                  </div>
                  <div className="flex flex-col items-center text-center">
                    <div className="bg-[#f0f9d4] p-4 rounded-full mb-3">
                      <Award className="h-6 w-6 text-[#8bc34a]" />
                    </div>
                    <span className="font-medium">Quality Service</span>
                  </div>
                  <div className="flex flex-col items-center text-center">
                    <div className="bg-[#f0f9d4] p-4 rounded-full mb-3">
                      <Shield className="h-6 w-6 text-[#8bc34a]" />
                    </div>
                    <span className="font-medium">Secure Platform</span>
                  </div>
                </div>
              </section>

              {/* Our Values */}
              <section>
                <h2 className="text-2xl font-bold mb-6 text-center">Our Values</h2>
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

              {/* Our Partnerships */}
              <section>
                <h2 className="text-2xl font-bold mb-6 text-center">Strategic Partnerships</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {partnerships.map((partner, index) => (
                    <div key={index} className="bg-white rounded-lg overflow-hidden shadow-sm">
                      <img
                        src={partner.image || "/placeholder.svg"}
                        alt={partner.name}
                        className="w-full h-64 object-cover"
                      />
                      <div className="p-6">
                        <h3 className="font-bold text-lg">{partner.name}</h3>
                        <p className="text-gray-600 text-sm mt-3">{partner.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Where We Operate */}
              <section className="bg-white p-8 rounded-lg shadow-sm">
                <h2 className="text-2xl font-bold mb-6 text-center">Where We Operate</h2>
                <p className="text-gray-600 text-center max-w-2xl mx-auto mb-8">
                 Al-Mutamir offers services globally with a focus on providing localized support in regions with high
                  demand for Hajj and Umrah travel.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {locations.map((location, index) => (
                    <div
                      key={index}
                      className="border border-gray-100 rounded-lg p-6 hover:bg-[#f0f9d4] transition-colors"
                    >
                      <h3 className="font-bold text-lg mb-3">{location.region}</h3>
                      <p className="text-[#8bc34a] font-medium text-sm mb-3">{location.highlight}</p>
                      <div className="flex flex-wrap gap-2">
                        {location.countries.map((country, idx) => (
                          <span key={idx} className="bg-gray-100 px-3 py-1 rounded-full text-sm">
                            {country}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Join Us */}
              <section className="bg-[#f0f9d4] p-8 rounded-lg text-center">
                <h2 className="text-2xl font-bold mb-4">Join the Al-Mutamir Journey</h2>
                <p className="text-gray-700 max-w-2xl mx-auto mb-6">
                  Whether you're a pilgrim seeking a meaningful Hajj or Umrah experience, or an agency looking to expand
                  your reach, Al-Mutamir is here to support your journey.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/services">
                    <Button className="bg-[#c8e823] text-black hover:bg-[#b5d31f]">Explore Our Services</Button>
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
