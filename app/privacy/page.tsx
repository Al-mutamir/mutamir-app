import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Footer } from "@/components/footer"

export default function PrivacyPage() {
  return (
    <>
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container">
          <div className="max-w-3xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold">Privacy Policy</h1>
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
                  At Mutamir ("we," "our," or "us"), we respect your privacy and are committed to protecting your personal
                  data. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when
                  you use our website, mobile application, and services (collectively, the "Services").
                </p>
                <p>
                  Please read this Privacy Policy carefully. If you do not agree with the terms of this Privacy Policy,
                  please do not access or use our Services.
                </p>

                <h2>2. Information We Collect</h2>
                <p>We collect several types of information from and about users of our Services, including:</p>
                <h3>2.1 Personal Data</h3>
                <p>
                  Personal Data refers to information that identifies you or can be used to identify you. We may collect
                  the following Personal Data:
                </p>
                <ul>
                  <li>Contact information (such as name, email address, phone number, and address)</li>
                  <li>Passport information (for visa processing)</li>
                  <li>Payment information (such as credit card details or bank account information)</li>
                  <li>Travel preferences and requirements</li>
                  <li>Account credentials (such as username and password)</li>
                </ul>

                <h3>2.2 Usage Data</h3>
                <p>We may also collect information about how you access and use our Services, including:</p>
                <ul>
                  <li>IP address</li>
                  <li>Browser type and version</li>
                  <li>Device type and operating system</li>
                  <li>Time and date of your visit</li>
                  <li>Pages you viewed or searched for</li>
                  <li>Time spent on certain pages</li>
                  <li>Referring website addresses</li>
                </ul>

                <h2>3. How We Collect Information</h2>
                <p>We collect information through:</p>
                <ul>
                  <li>Direct interactions (when you register for an account, book a package, or contact us)</li>
                  <li>Automated technologies (cookies, web beacons, and similar technologies)</li>
                  <li>Third parties (such as payment processors or service providers)</li>
                </ul>

                <h2>4. How We Use Your Information</h2>
                <p>We may use the information we collect for various purposes, including:</p>
                <ul>
                  <li>Providing and maintaining our Services</li>
                  <li>Processing your bookings and payments</li>
                  <li>Communicating with you about your bookings or inquiries</li>
                  <li>Personalizing your experience on our Services</li>
                  <li>Improving our Services</li>
                  <li>Sending promotional emails or notifications (with your consent)</li>
                  <li>Ensuring the security of our Services</li>
                  <li>Complying with legal obligations</li>
                </ul>

                <h2>5. Disclosure of Your Information</h2>
                <p>We may disclose your information to:</p>
                <ul>
                  <li>Service providers (such as payment processors, visa services, and accommodation providers)</li>
                  <li>Business partners (such as travel agencies and tour operators)</li>
                  <li>Legal authorities (when required by law or to protect our rights)</li>
                </ul>

                <h2>6. Data Security</h2>
                <p>
                  We implement appropriate security measures to protect your personal information from unauthorized
                  access, alteration, disclosure, or destruction. However, no method of transmission over the Internet or
                  electronic storage is 100% secure, and we cannot guarantee absolute security.
                </p>

                <h2>7. Your Rights</h2>
                <p>
                  Depending on your location, you may have certain rights regarding your personal information, including:
                </p>
                <ul>
                  <li>The right to access your personal information</li>
                  <li>The right to rectify inaccurate or incomplete information</li>
                  <li>The right to erase your personal information</li>
                  <li>The right to restrict processing of your personal information</li>
                  <li>The right to data portability</li>
                  <li>The right to object to processing of your personal information</li>
                </ul>
                <p>To exercise these rights, please contact us using the information provided in Section 10.</p>

                <h2>8. Cookies</h2>
                <p>
                  We use cookies and similar tracking technologies to track activity on our Services and to hold certain
                  information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being
                  sent.
                </p>

                <h2>9. Children's Privacy</h2>
                <p>
                  Our Services are not intended for children under the age of 18. We do not knowingly collect personal
                  information from children under 18. If you are a parent or guardian and believe that your child has
                  provided us with personal information, please contact us.
                </p>

                <h2>10. Contact Information</h2>
                <p>If you have any questions about this Privacy Policy, please contact us at:</p>
                <p>
                  Email: privacy@almutamir.com
                  <br />
                  Address: 9, Zaria Street, Garki, Abuja, Nigeria
                </p>

                <h2>11. Changes to This Privacy Policy</h2>
                <p>
                  We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new
                  Privacy Policy on this page and updating the "Last Updated" date at the top of this Privacy Policy.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}