"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { CheckCircle, Download, Home, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { downloadBookingDetails } from "@/utils/print-utils"
import Image from "next/image"

export default function BookingSuccessPage() {
  const [bookingRef] = useState(`MUT-${Math.floor(Math.random() * 10000)}`)
  const [bookingDetails, setBookingDetails] = useState<any>(null)

  useEffect(() => {
    try {
      const storedDetails = localStorage.getItem("mutamir_booking")
      if (storedDetails) {
        setBookingDetails(JSON.parse(storedDetails))
      }
    } catch (e) {
      console.error("Failed to retrieve booking details:", e)
    }
  }, [])

  const handleDownload = () => {
    downloadBookingDetails(
      bookingRef,
      bookingDetails || {
        packageType: "hajj",
        isGroupBooking: false,
        pilgrims: [{ firstName: "Guest", lastName: "User", email: "guest@example.com" }],
      },
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="flex justify-center mb-6">
          <div className="bg-[#f0f9d4] p-4 rounded-full">
            <CheckCircle className="h-12 w-12 text-[#8bc34a]" />
          </div>
        </div>

        <h1 className="text-2xl font-bold mb-2">Booking Successful!</h1>
        <p className="text-gray-600 mb-6">
          Thank you for booking with Mutamir. Your pilgrimage package has been successfully submitted. A confirmation
          email has been sent to your registered email address with all the details.
        </p>

        <div className="bg-[#f0f9d4]/50 p-4 rounded-lg mb-6">
          <p className="font-medium">
            Booking Reference: <span className="text-[#8bc34a]">{bookingRef}</span>
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <Link href="/" className="w-full">
            <Button className="w-full bg-[#c8e823] text-black hover:bg-[#b5d31f]">
              <Home className="mr-2 h-4 w-4" /> Return to Home
            </Button>
          </Link>

          <Button variant="outline" className="w-full" onClick={handleDownload}>
            <Download className="mr-2 h-4 w-4" /> Download Booking Details
          </Button>

          <p className="text-sm text-gray-500 mt-2">
            A Mutamir representative will contact you within 24 hours to confirm your booking details.
          </p>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <Link href="/" className="flex items-center justify-center gap-2">
            <Image
              src="/images/mutamir.png" // Update this path if your logo file is different
              alt="Al-mutamir Logo"
              width={100}
              height={100}
              className="h-7 w-7"
            />
            
          </Link>
        </div>
      </div>
    </div>
  )
}
