import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function HeroSection() {
  return (
    <section className="py-20 md:py-28">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
              Your Sacred Journey, <span className="text-primary">Your Way</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              Mutamir empowers you with full control over your Hajj and Umrah experience. Plan, book, and manage your
              pilgrimage with transparency and peace of mind.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/pilgrim/get-started">
                <Button size="lg" className="w-full sm:w-auto">
                  Start Your Journey <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/agency/register">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Register as Agency
                </Button>
              </Link>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -z-10 inset-0 bg-gradient-to-r from-primary/20 to-primary/5 rounded-3xl transform rotate-3"></div>
            <img
              src="/placeholder.svg?height=600&width=800"
              alt="Pilgrims at Kaaba"
              className="rounded-2xl shadow-lg w-full"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
