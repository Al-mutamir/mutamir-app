import Link from "next/link"
import { ArrowLeft, Mail, MapPin, Phone, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container">
        

        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Contact Us</h1>
            <Link href="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Get in Touch</CardTitle>
                  <CardDescription>
                    Fill out the form below and our team will get back to you within 24 hours.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">
                        First Name <span className="text-red-500">*</span>
                      </Label>
                      <Input id="firstName" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">
                        Last Name <span className="text-red-500">*</span>
                      </Label>
                      <Input id="lastName" required />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">
                      Email <span className="text-red-500">*</span>
                    </Label>
                    <Input id="email" type="email" required />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">
                      Phone Number <span className="text-red-500">*</span>
                    </Label>
                    <Input id="phone" required />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">
                      Subject <span className="text-red-500">*</span>
                    </Label>
                    <Input id="subject" required />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">
                      Message <span className="text-red-500">*</span>
                    </Label>
                    <Textarea id="message" rows={5} required />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full bg-[#c8e823] text-black hover:bg-[#b5d31f]">
                    <Send className="mr-2 h-4 w-4" /> Send Message
                  </Button>
                </CardFooter>
              </Card>
            </div>

            <div className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                  <CardDescription>Reach out to us through any of these channels</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="bg-[#f0f9d4] p-3 rounded-full">
                      <Mail className="h-5 w-5 text-[#8bc34a]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">Email</h3>
                      <p className="text-gray-600">support@almutamir.com</p>
                      <p className="text-gray-600">info@almutamir.com</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="bg-[#f0f9d4] p-3 rounded-full">
                      <Phone className="h-5 w-5 text-[#8bc34a]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">Phone</h3>
                      <p className="text-gray-600">+234 812 002 6622</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="bg-[#f0f9d4] p-3 rounded-full">
                      <MapPin className="h-5 w-5 text-[#8bc34a]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">Office</h3>
                      <p className="text-gray-600">9, Zaria Street, Garki, Abuja</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Office Hours</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium">Monday - Friday:</span>
                    <span>9:00 AM - 6:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Saturday:</span>
                    <span>10:00 AM - 4:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Sunday:</span>
                    <span>Closed</span>
                  </div>
                </CardContent>
              </Card>

              <div className="bg-[#f0f9d4] p-6 rounded-lg">
                <h3 className="font-bold text-lg mb-2">Pilgrimage Support</h3>
                <p className="text-gray-700 mb-4">
                  Need guidance on your Hajj pr Umrah journey? Our team of experienced pilgrimage advisors is available to
                  answer any questions about Hajj and Umrah rituals and preparations.
                </p>
                <p className="text-gray-700">
                  Email: <span className="font-medium">support@almutamir.com</span>
                </p>
              </div>
            </div>
          </div>

          <div className="mt-12 bg-white p-8 rounded-lg shadow-sm">
            <h2 className="text-2xl font-bold mb-6 text-center">Frequently Asked Questions</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-lg mb-2">How soon should I book my Hajj package?</h3>
                <p className="text-gray-600">
                  We recommend booking your Hajj package at least 3 months in advance to ensure availability and the
                  best rates.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2">Can I customize my package after booking?</h3>
                <p className="text-gray-600">
                  Yes, you can make changes to your package up to 60 days before your departure date, subject to
                  availability.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2">Do you offer group discounts?</h3>
                <p className="text-gray-600">
                  Yes, we offer special rates for groups of 10 or more pilgrims. Contact our team for details.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2">How can agencies partner with Al-Mutamir?</h3>
                <p className="text-gray-600">
                  Agencies can register through our platform and gain access to our comprehensive suite of tools and
                  services.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
