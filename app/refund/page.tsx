import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

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
            <div className="prose max-w-none">
              <p>Last Updated: March 16, 2025</p>

              <h2>1. Introduction</h2>
              <p>
                This Refund Policy outlines the terms and conditions for refunds related to bookings made through
                Mutamir's platform. We understand that circumstances may change, and we aim to provide fair and
                transparent refund procedures.
              </p>

              <h2>2. Cancellation and Refund Schedule</h2>
              <p>
                Refund eligibility depends on when you cancel your booking relative to your scheduled departure date:
              </p>

              <h3>2.1 Hajj Packages</h3>
              <ul>
                <li>
                  <strong>More than 120 days before departure:</strong> 90% refund of the total package cost
                </li>
                <li>
                  <strong>90-120 days before departure:</strong> 75% refund of the total package cost
                </li>
                <li>
                  <strong>60-89 days before departure:</strong> 50% refund of the total package cost
                </li>
                <li>
                  <strong>30-59 days before departure:</strong> 25% refund of the total package cost
                </li>
                <li>
                  <strong>Less than 30 days before departure:</strong> No refund
                </li>
              </ul>

              <h3>2.2 Umrah Packages</h3>
              <ul>
                <li>
                  <strong>More than 60 days before departure:</strong> 90% refund of the total package cost
                </li>
                <li>
                  <strong>30-60 days before departure:</strong> 75% refund of the total package cost
                </li>
                <li>
                  <strong>15-29 days before departure:</strong> 50% refund of the total package cost
                </li>
                <li>
                  <strong>7-14 days before departure:</strong> 25% refund of the total package cost
                </li>
                <li>
                  <strong>Less than 7 days before departure:</strong> No refund
                </li>
              </ul>

              <h2>3. Non-Refundable Fees</h2>
              <p>Certain fees are non-refundable regardless of when you cancel:</p>
              <ul>
                <li>Visa processing fees (once the visa application has been submitted)</li>
                <li>Insurance premiums</li>
                <li>Service fees</li>
              </ul>

              <h2>4. Special Circumstances</h2>
              <h3>4.1 Medical Emergencies</h3>
              <p>
                If you need to cancel due to a serious medical emergency, we may provide a more generous refund with
                proper documentation (such as a doctor's note). Each case will be reviewed individually.
              </p>

              <h3>4.2 Force Majeure</h3>
              <p>
                In the event of force majeure circumstances (such as natural disasters, political unrest, or pandemic
                restrictions) that prevent the fulfillment of the pilgrimage, we will work to provide appropriate
                refunds or alternative arrangements.
              </p>

              <h2>5. Refund Process</h2>
              <p>To request a refund:</p>
              <ol>
                <li>Log in to your Mutamir account</li>
                <li>Navigate to "My Bookings"</li>
                <li>Select the booking you wish to cancel</li>
                <li>Click on "Request Cancellation"</li>
                <li>Follow the prompts to complete your cancellation request</li>
              </ol>
              <p>Alternatively, you can contact our customer service team at support@mutamir.com.</p>

              <h2>6. Refund Processing Time</h2>
              <p>Once a refund is approved:</p>
              <ul>
                <li>Credit card refunds typically process within 7-14 business days</li>
                <li>Bank transfers may take 10-20 business days</li>
                <li>Other payment methods will vary in processing time</li>
              </ul>

              <h2>7. Modifications Instead of Cancellations</h2>
              <p>Instead of cancelling your booking, you may choose to:</p>
              <ul>
                <li>Reschedule your trip for a later date (subject to availability)</li>
                <li>Transfer your booking to another person (subject to visa requirements)</li>
                <li>Modify your package components (which may result in price adjustments)</li>
              </ul>
              <p>Modification fees may apply depending on how close to the departure date the changes are requested.</p>

              <h2>8. Disputes</h2>
              <p>
                If you disagree with a refund decision, please contact our customer service team with details of your
                situation. We aim to resolve all disputes fairly and promptly.
              </p>

              <h2>9. Changes to This Policy</h2>
              <p>
                We reserve the right to modify this Refund Policy at any time. Changes will be effective immediately
                upon posting on our website. Your continued use of our Services after such changes constitutes your
                acceptance of the new Refund Policy.
              </p>

              <h2>10. Contact Information</h2>
              <p>If you have any questions about this Refund Policy, please contact us at:</p>
              <p>
                Email: refunds@mutamir.com
                <br />
                Phone: +1 (234) 567-8900
                <br />
                Address: 123 Main Street, Lagos, Nigeria
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
