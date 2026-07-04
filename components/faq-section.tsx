import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

const faqs = [
  {
    question: "What is Almutamir?",
    answer:
      "Almutamir is a digital platform designed to help pilgrims and agencies plan, book, and manage Hajj and Umrah journeys with ease, transparency, and customizable options.",
  },
  {
    question: "How is Almutamir different from traditional agents?",
    answer:
      "Unlike traditional agents, Almutamir provides direct control through technology, allowing you to customize your package, see real-time availability, and enjoy full transparency in pricing.",
  },
  {
    question: "Is Almutamir licensed?",
    answer:
      "Yes, Almutamir works only with licensed and accredited travel agencies and service providers verified by the relevant authorities.",
  },
  {
    question: "How do I book a Hajj or Umrah package?",
    answer: "Simply use our search tool, select your preferred package, and follow the secure booking process directly on our platform.",
  },
  {
    question: "Can I pay in instalments?",
    answer:
      "Many of our partner agencies offer flexible payment plans. You can check the specific terms of each package for instalment options.",
  },
  {
    question: "What happens after I book?",
    answer:
      "You will receive a confirmation email with all details. Our team and the service provider will guide you through the next steps, including visa processing and orientation.",
  },
  {
    question: "What if I need to cancel my booking?",
    answer:
      "Cancellation policies vary by package and agency. Please refer to the Refund Policy link in our footer for general guidelines.",
  },
  {
    question: "Can I travel with my family or a group?",
    answer:
      "Absolutely. Our booking system allows you to add multiple travelers to a single booking, and we offer specific group rates for many packages.",
  },
  {
    question: "Can I choose my hotel or airline?",
    answer:
      "Yes, during the customization phase of your booking, you can select from available hotel tiers and flight options that meet your preferences.",
  },
  {
    question: "What support is available during my trip?",
    answer:
      "We provide 24/7 support through our platform, and our on-ground partners in Saudi Arabia are available to assist with logistics or guidance.",
  },
  {
    question: "How do I know this is safe and legit?",
    answer:
      "We use secure payment gateways, verify every agency, and have a proven track record of successful pilgrimages as shown by our pilgrim reviews.",
  },
  {
    question: "Can I become a service provider on Almutamir?",
    answer:
      "Yes, agencies are welcome to register through our portal. All applications undergo a thorough verification process before being listed.",
  },
]

export default function FaqSection() {
  return (
    <section id="faq" className="container max-w-5xl py-20">
      <div className="mb-12 text-center">
        <h2 className="mb-4 text-3xl font-bold tracking-normal text-[#007F5F] md:text-5xl">
          Frequently Asked Questions
        </h2>
        <p className="text-[#444746]">Clear answers to your most common inquiries</p>
      </div>

      <Accordion type="single" collapsible className="w-full space-y-4">
        {faqs.map((faq, index) => (
          <AccordionItem key={faq.question} value={`item-${index}`} className="rounded-xl border border-gray-100 bg-white px-6">
            <AccordionTrigger className="text-left font-bold text-[#1a1c1b] hover:no-underline">
              {faq.question}
            </AccordionTrigger>
            <AccordionContent className="leading-7 text-[#444746]">{faq.answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  )
}
