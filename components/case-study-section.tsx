import { Clock, DollarSign, Heart, MapPin, Smile, ThumbsUp, Users } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

export default function CaseStudySection() {
  return (
    <section id="case-study" className="py-20 bg-gray-50">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Potential Success Story</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            How Mutamir could transform the Hajj experience for a group of 50 pilgrims
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="relative">
            <div className="absolute -z-10 inset-0 bg-[#c8e823]/10 rounded-3xl transform rotate-2"></div>
            <img
              src="/placeholder.svg?height=600&width=800"
              alt="Group of pilgrims at Kaaba"
              className="rounded-2xl shadow-lg w-full"
            />
            <div className="absolute -bottom-6 -right-6 bg-white rounded-lg shadow-lg p-4 w-48">
              <div className="flex items-center gap-3 mb-2">
                <Users className="h-5 w-5 text-[#c8e823]" />
                <span className="font-bold">50 Pilgrims</span>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-[#c8e823]" />
                <span className="font-bold">14 Days</span>
              </div>
            </div>
          </div>

          <div>
            <div className="inline-block bg-[#c8e823]/10 px-4 py-2 rounded-full text-black font-medium text-sm mb-4">
              Potential Case Study
            </div>
            <h3 className="text-2xl font-bold mb-4">Al-Baraka Group Hajj Journey</h3>
            <p className="text-gray-600 mb-6">
              Imagine the Al-Baraka community group from Lagos facing challenges organizing their annual Hajj trip. With
              diverse needs and budget constraints, they would need a flexible solution that could accommodate everyone.
            </p>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <Card>
                <CardContent className="p-4 flex items-start gap-3">
                  <div className="bg-[#f0f9d4] p-2 rounded-full">
                    <Clock className="h-5 w-5 text-[#8bc34a]" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">Planning Time</h4>
                    <p className="text-sm text-gray-500">Could be reduced by 70%</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 flex items-start gap-3">
                  <div className="bg-[#f0f9d4] p-2 rounded-full">
                    <DollarSign className="h-5 w-5 text-[#8bc34a]" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">Cost Savings</h4>
                    <p className="text-sm text-gray-500">Potential 15% savings</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 flex items-start gap-3">
                  <div className="bg-[#f0f9d4] p-2 rounded-full">
                    <ThumbsUp className="h-5 w-5 text-[#8bc34a]" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">Satisfaction</h4>
                    <p className="text-sm text-gray-500">Targeting 98% satisfaction</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 flex items-start gap-3">
                  <div className="bg-[#f0f9d4] p-2 rounded-full">
                    <Heart className="h-5 w-5 text-[#8bc34a]" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">Experience</h4>
                    <p className="text-sm text-gray-500">Deeply meaningful</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="bg-white p-5 rounded-lg border shadow-sm mb-6">
              <div className="flex items-center gap-3 mb-2">
                <MapPin className="h-5 w-5 text-[#c8e823]" />
                <span className="font-bold">The Potential Solution</span>
              </div>
              <p className="text-gray-600 text-sm">
                Using Mutamir's platform, the group would be able to create a customized package that offers tiered
                accommodation options while keeping core services consistent. This would allow pilgrims with different
                budgets to travel together while maintaining the community experience.
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="bg-[#c8e823] rounded-full p-3">
                <Smile className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-bold">Ibrahim Malik</h4>
                <p className="text-sm text-gray-500">Potential Group Coordinator, Al-Baraka Community</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
