import Link from "next/link"
import { ArrowLeft, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export default function FaqPage() {
  const faqs = [
    {
      question: "How does Mutamir ensure the legitimacy of agencies?",
      answer:
        "We thoroughly vet all agencies on our platform, requiring proper accreditation and documentation. We continuously monitor reviews and feedback to maintain high standards of service.",
    },
    {
      question: "Can I customize my Hajj or Umrah package?",
      answer:
        "Mutamir allows you to select your preferred services including visas, flights, accommodation, transport, and meals. You have full control over your pilgrimage experience.",
    },
    {
      question: "Do I need a visa if I'm traveling from the US or UK?",
      answer:
        "Pilgrims from the US and UK do not need to arrange visas through our platform. However, pilgrims from Nigeria and other countries will need to include visa services in their package.",
    },
    {
      question: "How are the prices determined?",
      answer:
        "Prices are not pre-determined and vary based on the services you select, the time of year, and current market rates. Our transparent pricing ensures you see exactly what you're paying for with no hidden fees.",
    },
    {
      question: "Can I change my package after booking?",
      answer:
        "Yes, you can make changes to your package up to a certain point before your departure date. Please note that some changes may incur additional fees depending on the service providers' policies.",
    },
    {
      question: "How do agencies create and share packages?",
      answer:
        "Agencies can easily create customized packages through their dashboard, specifying all details and pricing. They can then generate a unique link to share with clients, allowing them to register directly under that package.",
    },
    {
      question: "What is the difference between Hajj and Umrah?",
      answer:
        "Hajj is the annual pilgrimage to Mecca that takes place during a specific time of the Islamic calendar and is mandatory for all Muslims who are physically and financially able. Umrah is a non-mandatory pilgrimage that can be performed at any time of the year.",
    },
    {
      question: "Can I book for a group of pilgrims?",
      answer:
        "Yes, Mutamir offers group booking options, especially for Umrah. You can add multiple pilgrims to your booking and manage all their details in one place.",
    },
    {
      question: "What is included in the visitation service?",
      answer:
        "The visitation service includes guided tours to historical and religious sites in and around Mecca and Medina. Depending on the tier you select, you may have standard group tours, extended tours with more sites, or private tours with dedicated guides.",
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container">
        <Link href="/" className="flex items-center gap-2 mb-8">
          <MapPin className="h-6 w-6 text-[#c8e823]" />
          <span className="text-xl font-bold">MUTAMIR</span>
        </Link>

        <div className="max-w-3xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Frequently Asked Questions</h1>
            <Link href="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
              </Button>
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <p className="text-gray-600">
              Find answers to common questions about Mutamir's services. If you can't find what you're looking for,
              please don't hesitate to{" "}
              <Link href="/contact" className="text-[#c8e823] hover:underline">
                contact us
              </Link>
              .
            </p>
          </div>

          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                <AccordionContent className="text-gray-600">{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </div>
  )
}
