import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export default function FaqSection() {
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
        "Pilgrims from the US and UK are eligible for visa on arrival in Saudi Arabia. However, pilgrims from Nigeria and other countries will need to include visa services in their package.",
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
  ]

  return (
    <section id="faq" className="py-20">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">Find answers to common questions about Mutamir's services</p>
        </div>

        <div className="max-w-3xl mx-auto">
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
    </section>
  )
}
