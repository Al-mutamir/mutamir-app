import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

const refundFaqs = [
	{
		question: "Last Updated",
		answer: "March 16, 2025",
	},
	{
		question: "1. Introduction",
		answer:
			"This Refund Policy outlines the terms and conditions for refunds related to bookings made through Mutamir's platform. We understand that circumstances may change, and we aim to provide fair and transparent refund procedures.",
	},
	{
		question: "2. Cancellation and Refund Schedule",
		answer:
			"Refund eligibility depends on when you cancel your booking relative to your scheduled departure date.",
	},
	{
		question: "2.1 Hajj Packages",
		answer: `• More than 120 days before departure: 90% refund of the total package cost
• 90-120 days before departure: 75% refund of the total package cost
• 60-89 days before departure: 50% refund of the total package cost
• 30-59 days before departure: 25% refund of the total package cost
• Less than 30 days before departure: No refund`,
	},
	{
		question: "2.2 Umrah Packages",
		answer: `• More than 60 days before departure: 90% refund of the total package cost
• 30-60 days before departure: 75% refund of the total package cost
• 15-29 days before departure: 50% refund of the total package cost
• 7-14 days before departure: 25% refund of the total package cost
• Less than 7 days before departure: No refund`,
	},
	{
		question: "3. Non-Refundable Fees",
		answer: `Certain fees are non-refundable regardless of when you cancel:
• Visa processing fees (once the visa application has been submitted)
• Insurance premiums
• Service fees`,
	},
	{
		question: "4. Special Circumstances",
		answer: `4.1 Medical Emergencies:
If you need to cancel due to a serious medical emergency, we may provide a more generous refund with proper documentation (such as a doctor's note). Each case will be reviewed individually.

4.2 Force Majeure:
In the event of force majeure circumstances (such as natural disasters, political unrest, or pandemic restrictions) that prevent the fulfillment of the pilgrimage, we will work to provide appropriate refunds or alternative arrangements.`,
	},
	{
		question: "5. Refund Process",
		answer: `To request a refund:
1. Log in to your Mutamir account
2. Navigate to "My Bookings"
3. Select the booking you wish to cancel
4. Click on "Request Cancellation"
5. Follow the prompts to complete your cancellation request

Alternatively, you can contact our customer service team at support@mutamir.com.`,
	},
	{
		question: "6. Refund Processing Time",
		answer: `Once a refund is approved:
• Credit card refunds typically process within 7-14 business days
• Bank transfers may take 10-20 business days
• Other payment methods will vary in processing time`,
	},
	{
		question: "7. Modifications Instead of Cancellations",
		answer: `Instead of cancelling your booking, you may choose to:
• Reschedule your trip for a later date (subject to availability)
• Transfer your booking to another person (subject to visa requirements)
• Modify your package components (which may result in price adjustments)

Modification fees may apply depending on how close to the departure date the changes are requested.`,
	},
	{
		question: "8. Disputes",
		answer:
			"If you disagree with a refund decision, please contact our customer service team with details of your situation. We aim to resolve all disputes fairly and promptly.",
	},
	{
		question: "9. Changes to This Policy",
		answer:
			"We reserve the right to modify this Refund Policy at any time. Changes will be effective immediately upon posting on our website. Your continued use of our Services after such changes constitutes your acceptance of the new Refund Policy.",
	},
	{
		question: "10. Contact Information",
		answer: `If you have any questions about this Refund Policy, please contact us at:
Email: refunds@mutamir.com
Phone: +234 812 002 6622
Address: Abuja, Nigeria`,
	},
]

export default function RefundPage() {
	return (
		<div className="min-h-screen bg-gray-50 py-12">
			<div className="container">
				<div className="max-w-3xl mx-auto">
					<div className="flex justify-between items-center mb-8">
						<h1 className="text-3xl font-bold">Refund Policy</h1>
						<Link href="/">
							<Button variant="outline" size="sm">
								<ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
							</Button>
						</Link>
					</div>

					<div className="bg-white rounded-lg shadow-sm p-8">
						<Accordion type="single" collapsible className="w-full">
							{refundFaqs.map((faq, index) => (
								<AccordionItem key={index} value={`item-${index}`}>
									<AccordionTrigger className="text-left">
										{faq.question}
									</AccordionTrigger>
									<AccordionContent className="text-gray-600 whitespace-pre-line">
										{faq.answer}
									</AccordionContent>
								</AccordionItem>
							))}
						</Accordion>
					</div>
				</div>
			</div>
		</div>
	)
}
