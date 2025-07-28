import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export default function FaqSection() {
  const faqs = [
    {
      question: "What is Al-Mutamir?",
      answer:
        "Al-Mutamir is a trusted online platform that helps you plan your Hajj or Umrah journey with peace of mind. From verified service providers to transparent pricing and customizable packages, we make your spiritual journey smooth, simple, and dignified.",
    },
    {
      question: "How is Al-Mutamir different from traditional agents?",
      answer:
        "Unlike traditional agents, we offer:\n\n• Full transparency: See exactly what you're paying for.\n• Verified providers: We only work with licensed and trusted agencies.\n• Customizable experiences: You choose your package, flights, hotels, and services.\n• Online support: 24/7 guidance from our team—before, during, and after your trip.",
    },
    {
      question: "Is Al-Mutamir licensed?",
      answer:
        "Yes. We work only with accredited Hajj and Umrah operators licensed by the appropriate religious and travel authorities. Our platform also complies with local and international pilgrimage regulations.",
    },
    {
      question: "How do I book a Hajj or Umrah package?",
      answer:
        "Booking is simple:\n1. Browse available packages.\n2. Customize your preferences (flights, hotels, services).\n3. Book and pay securely.\n4. Prepare with our digital checklists and updates.\n\nEverything is online—no paperwork or guesswork.",
    },
    {
      question: "Can I pay in instalments?",
      answer:
        "Yes. We offer flexible payment plans to make your journey more accessible. You can pay in instalments based on the travel date and provider’s policies. Details will be available at checkout.",
    },
    {
      question: "What happens after I book?",
      answer:
        "Once you book:\n• You’ll receive a confirmation email with your full itinerary.\n• We’ll send reminders and documents through your dashboard.\n• Our support team stays in touch to guide you every step of the way.",
    },
    {
      question: "What if I need to cancel my booking?",
      answer:
        "You can cancel based on our Refund Policy:\n\n• More than 120 days before Hajj: 90% refund\n• 90–119 days before: 75% refund\n• 60–89 days: 50% refund\n• Less than 30 days: No refund (due to provider commitments)\n\nUmrah bookings have a slightly more flexible timeline. See our [Refund Policy](https://www.almutamir.com/refund) for full details.",
    },
    {
      question: "Can I travel with my family or a group?",
      answer:
        "Absolutely. You can book for:\n• Yourself\n• Family members\n• Groups (e.g. friends, mosques, organizations)\n\nOur system makes it easy to manage all travelers under one booking.",
    },
    {
      question: "Can I choose my hotel or airline?",
      answer:
        "Yes. Al-Mutamir gives you full control. Select from multiple airlines and hotels at different price points. You can compare options before booking.",
    },
    {
      question: "What support is available during my trip?",
      answer:
        "We’re with you every step of the way:\n• Real-time updates\n• WhatsApp and in-app chat support\n• Emergency assistance\n• Help resolving any issue with providers\n\nYou’ll never feel alone on your journey.",
    },
    {
      question: "How do I know this is safe and legit?",
      answer:
        "We take your trust seriously:\n• All providers are verified and reviewed.\n• All payments are secure and encrypted.\n• We have a clear refund policy.\n• You can read reviews and experiences from other pilgrims.",
    },
    {
      question: "Can I become a service provider on Al-Mutamir?",
      answer:
        "Yes. If you run a licensed Hajj/Umrah agency, transport, hospitality, or support service, [apply here](https://www.almutamir.com/auth/register) to join our trusted network.",
    },
  ]

  return (
    <section id="faq" className="py-20">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">Find answers to common questions about our services</p>
        </div>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                <AccordionContent className="text-gray-600 whitespace-pre-line">
                  {/* Render markdown-style links as real links */}
                  {faq.answer.split(/\[([^\]]+)\]\(([^)]+)\)/g).map((part, i, arr) =>
                    i % 3 === 1 ? (
                      <a key={i} href={arr[i + 1]} className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">
                        {part}
                      </a>
                    ) : i % 3 === 2 ? null : part
                  )}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  )
}
