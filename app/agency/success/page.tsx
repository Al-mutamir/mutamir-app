import Link from "next/link"
import { CheckCircle, Home, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function AgencySuccessPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="flex justify-center mb-6">
          <div className="bg-[#f0f9d4] p-4 rounded-full">
            <CheckCircle className="h-12 w-12 text-[#8bc34a]" />
          </div>
        </div>

        <h1 className="text-2xl font-bold mb-2">Registration Successful!</h1>
        <p className="text-gray-600 mb-6">
          Thank you for registering your agency with Almutamir. We've received your information and will review it
          shortly. Our team will contact you within 2-3 business days to complete the verification process.
        </p>

        <div className="flex flex-col gap-3">
          <Link href="/" className="w-full">
            <Button className="w-full bg-[#c8e823] text-black hover:bg-[#b5d31f]">
              <Home className="mr-2 h-4 w-4" /> Return to Home
            </Button>
          </Link>

          <p className="text-sm text-gray-500">
            If you have any questions, please contact us at <span className="font-medium">support@mutamir.com</span>
          </p>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <Link href="/" className="flex items-center justify-center gap-2">
            <MapPin className="h-5 w-5 text-[#c8e823]" />
            <span className="font-bold">MUTAMIR</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
