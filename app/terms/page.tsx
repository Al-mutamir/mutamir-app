import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Footer } from "@/components/footer"

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container">

        <div className="max-w-3xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Terms of Service</h1>
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
                Welcome to Mutamir ("we," "our," or "us"). These Terms of Service ("Terms") govern your access to and
                use of the Mutamir website, mobile application, and services (collectively, the "Services").
              </p>
              <p>
                By accessing or using our Services, you agree to be bound by these Terms. If you do not agree to these
                Terms, you may not access or use the Services.
              </p>

              <h2>2. Eligibility</h2>
              <p>
                You must be at least 18 years old to use our Services. By using our Services, you represent and warrant
                that you meet all eligibility requirements.
              </p>

              <h2>3. Account Registration</h2>
              <p>
                To access certain features of our Services, you may need to register for an account. You agree to
                provide accurate, current, and complete information during the registration process and to update such
                information to keep it accurate, current, and complete.
              </p>
              <p>
                You are responsible for safeguarding your account credentials and for all activities that occur under
                your account. You agree to notify us immediately of any unauthorized use of your account.
              </p>

              <h2>4. Booking and Payments</h2>
              <p>
                When you book a Hajj or Umrah package through our Services, you agree to pay all fees and charges
                associated with your booking. All payments are processed through our secure payment gateway.
              </p>
              <p>
                Prices for packages are subject to change until your booking is confirmed. Once confirmed, the price is
                guaranteed except for changes in government taxes or fees.
              </p>

              <h2>5. Cancellations and Refunds</h2>
              <p>
                Cancellation and refund policies vary depending on the package and service provider. Please refer to our
                Refund Policy for detailed information.
              </p>

              <h2>6. User Conduct</h2>
              <p>You agree not to use our Services to:</p>
              <ul>
                <li>Violate any applicable law or regulation</li>
                <li>Infringe the rights of any third party</li>
                <li>Harass, abuse, or harm another person</li>
                <li>Interfere with the proper functioning of our Services</li>
                <li>Attempt to gain unauthorized access to our Services or systems</li>
              </ul>

              <h2>7. Intellectual Property</h2>
              <p>
                Our Services and all content and materials included on our Services, including but not limited to text,
                graphics, logos, images, and software, are the property of Mutamir or our licensors and are protected by
                copyright, trademark, and other intellectual property laws.
              </p>

              <h2>8. Limitation of Liability</h2>
              <p>
                To the maximum extent permitted by law, Mutamir shall not be liable for any indirect, incidental,
                special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred
                directly or indirectly, or any loss of data, use, goodwill, or other intangible losses, resulting from:
              </p>
              <ul>
                <li>Your access to or use of or inability to access or use our Services</li>
                <li>Any conduct or content of any third party on our Services</li>
                <li>Any content obtained from our Services</li>
                <li>Unauthorized access, use, or alteration of your transmissions or content</li>
              </ul>

              <h2>9. Indemnification</h2>
              <p>
                You agree to indemnify, defend, and hold harmless Mutamir and our officers, directors, employees,
                agents, and affiliates from and against any and all claims, liabilities, damages, losses, costs,
                expenses, or fees (including reasonable attorneys' fees) that such parties may incur as a result of or
                arising from your violation of these Terms.
              </p>

              <h2>10. Modifications to Terms</h2>
              <p>
                We reserve the right to modify these Terms at any time. If we make changes, we will provide notice by
                updating the date at the top of these Terms and, in some cases, we may provide additional notice. Your
                continued use of our Services after such changes constitutes your acceptance of the new Terms.
              </p>

              <h2>11. Governing Law</h2>
              <p>
                These Terms shall be governed by and construed in accordance with the laws of Nigeria, without regard to
                its conflict of law provisions.
              </p>

              <h2>12. Contact Information</h2>
              <p>If you have any questions about these Terms, please contact us at:</p>
              <p>
                Email: legal@mutamir.com<br />
                Address: 123 Main Street, Lagos, Nigeria
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
    <Footer />
  )
}
