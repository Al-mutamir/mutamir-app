import { Star } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function TestimonialsSection() {
  const testimonials = [
    {
      name: "Ahmed Hassan",
      role: "Pilgrim from Nigeria",
      content:
        "Mutamir made my Umrah planning stress-free. I could choose exactly what I needed and the transparency gave me peace of mind. Truly a blessing for first-time pilgrims like me.",
      avatar: "AH",
    },
    {
      name: "Sarah Johnson",
      role: "Pilgrim from UK",
      content:
        "The flexibility to customize my Hajj package was incredible. I appreciated being able to select accommodations that suited my needs while staying within my budget.",
      avatar: "SJ",
    },
    {
      name: "Ibrahim Malik",
      role: "Al-Baraka Travel Agency",
      content:
        "As an agency owner, Mutamir has streamlined our operations significantly. Creating packages and managing client registrations is now seamless and efficient.",
      avatar: "IM",
    },
  ]

  return (
    <section id="testimonials" className="py-20 bg-gray-50">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">What People Are Saying</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Hear from pilgrims and agencies who have experienced the Mutamir difference
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="border-none shadow-md">
              <CardContent className="p-6">
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="mb-6 text-gray-600">"{testimonial.content}"</p>
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarImage src={`/placeholder.svg?height=40&width=40&text=${testimonial.avatar}`} />
                    <AvatarFallback>{testimonial.avatar}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
