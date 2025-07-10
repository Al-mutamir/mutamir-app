"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { CheckCircle, Download, Home, MapPin, ArrowLeft, Clock, Plane, Palette, User, Calendar, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { downloadBookingDetails } from "@/utils/print-utils"
import Image from "next/image"

export default function BookingSuccessPage() {
  const [bookingRef] = useState(`MUT-${Math.floor(Math.random() * 10000)}`)
  const [bookingDetails, setBookingDetails] = useState<any>(null)
  const [selectedTheme, setSelectedTheme] = useState<"light" | "dark">("dark")

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

  // Extract booking information
  const packageType = bookingDetails?.packageType || "hajj"
  const isHajj = packageType.toLowerCase() === "hajj"
  const pilgrims = bookingDetails?.pilgrims || [{ firstName: "Guest", lastName: "User", email: "guest@example.com" }]
  const primaryPilgrim = pilgrims[0]
  const isGroupBooking = bookingDetails?.isGroupBooking || false
  const totalPilgrims = pilgrims.length

  const BookingCard = ({ theme }: { theme: "light" | "dark" }) => {
    const isDark = theme === "dark"
    const bgColor = isDark ? "#014034" : "#F8F8F6"
    const cardBg = isDark ? "#007F5F" : "#FFFFFF"
    const textColor = isDark ? "#FFFFFF" : "#014034"
    const accentColor = "#E3B23C"
    const secondaryText = isDark ? "#F8F8F6" : "#3E7C59"

    return (
      <div 
        className="w-full max-w-sm mx-auto rounded-2xl overflow-hidden shadow-2xl"
        style={{ backgroundColor: bgColor }}
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold" style={{ color: textColor }}>
              BOOKING CONFIRMATION
            </h2>
            <div className="w-6"></div>
          </div>

          {/* Service Info */}
          <div 
            className="flex items-center justify-between p-4 rounded-xl mb-6"
            style={{ backgroundColor: cardBg }}
          >
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: accentColor }}
              >
               <Image src="/images/logo-white.png" alt="Al-Mutamir Logo" width={40} height={40} className="rounded-full" />
              </div>
              <div>
                <h3 className="font-bold text-lg" style={{ color: textColor }}>
                  AL-MUTAMIR
                </h3>
                <p className="text-sm opacity-75" style={{ color: secondaryText }}>
                  {isHajj ? "Hajj" : "Umrah"} Services
                </p>
              </div>
            </div>
            <div 
              className="px-3 py-1 rounded-full text-xs font-medium"
              style={{ 
                backgroundColor: accentColor + "20",
                color: accentColor 
              }}
            >
              <Clock className="h-3 w-3 inline mr-1" />
              CONFIRMED
            </div>
          </div>

          {/* Package Type Display */}
          <div className="text-center mb-6">
            <div className="flex items-center justify-center mb-4">
              <Package className="h-8 w-8 mr-3" style={{ color: accentColor }} />
              <div>
                <div className="text-3xl font-bold" style={{ color: textColor }}>
                  {isHajj ? "HAJJ" : "UMRAH"}
                </div>
                <div className="text-sm opacity-75" style={{ color: secondaryText }}>
                  {isHajj ? "Pilgrimage Package" : "Lesser Pilgrimage"}
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-center">
              <div 
                className="h-0.5 w-16"
                style={{ backgroundColor: accentColor }}
              ></div>
              <Plane 
                className="mx-4 h-4 w-4" 
                style={{ color: accentColor }}
              />
              <div 
                className="h-0.5 w-16"
                style={{ backgroundColor: accentColor }}
              ></div>
            </div>
            
            <div className="text-xs mt-2" style={{ color: secondaryText }}>
              Sacred Journey to Mecca
            </div>
          </div>

          {/* Pilgrim Details */}
          <div className="mb-6">
            <div className="text-sm opacity-75 mb-2" style={{ color: secondaryText }}>
              {isGroupBooking ? "Group Leader" : "Pilgrim Name"}
            </div>
            <div className="text-lg font-semibold mb-4" style={{ color: textColor }}>
              {primaryPilgrim?.firstName || "Guest"} {primaryPilgrim?.lastName || "User"}
            </div>

            <div className="flex justify-between">
              <div>
                <div className="text-sm opacity-75 mb-1" style={{ color: secondaryText }}>
                  Booking Ref.
                </div>
                <div className="font-medium" style={{ color: textColor }}>
                  {bookingRef}
                </div>
              </div>
              <div>
                <div className="text-sm opacity-75 mb-1" style={{ color: secondaryText }}>
                  Package Type
                </div>
                <div className="font-medium capitalize" style={{ color: textColor }}>
                  {packageType}
                </div>
              </div>
            </div>

            <div className="flex justify-between mt-4">
              <div>
                <div className="text-sm opacity-75 mb-1" style={{ color: secondaryText }}>
                  Status
                </div>
                <div className="font-medium" style={{ color: accentColor }}>
                  Confirmed
                </div>
              </div>
              <div>
                <div className="text-sm opacity-75 mb-1" style={{ color: secondaryText }}>
                  {isGroupBooking ? "Group Size" : "Pilgrims"}
                </div>
                <div className="font-medium" style={{ color: textColor }}>
                  {totalPilgrims} {totalPilgrims === 1 ? "Person" : "People"}
                </div>
              </div>
            </div>

            {/* Booking Date */}
            <div className="flex justify-between mt-4">
              <div>
                <div className="text-sm opacity-75 mb-1" style={{ color: secondaryText }}>
                  Booking Date
                </div>
                <div className="font-medium" style={{ color: textColor }}>
                  {new Date().toLocaleDateString()}
                </div>
              </div>
              <div>
                <div className="text-sm opacity-75 mb-1" style={{ color: secondaryText }}>
                  Email
                </div>
                <div className="font-medium text-xs" style={{ color: textColor }}>
                  {primaryPilgrim?.email || "guest@example.com"}
                </div>
              </div>
            </div>
          </div>

          {/* Barcode */}
          <div className="flex justify-center mb-6">
            <div className="bg-white p-3 rounded-lg">
              <div className="flex space-x-0.5">
                {Array.from({ length: 30 }).map((_, i) => (
                  <div
                    key={i}
                    className="bg-black"
                    style={{
                      width: '2px',
                      height: Math.random() > 0.5 ? '40px' : '20px',
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            {/* <Link href="/" className="flex-1">
              <button
                className="w-full py-3 px-4 rounded-xl font-medium text-sm transition-all duration-200 hover:opacity-80"
                style={{ 
                  backgroundColor: isDark ? "#F8F8F6" : "#007F5F",
                  color: isDark ? "#014034" : "#FFFFFF"
                }}
              >
                <Home className="h-4 w-4 inline mr-2" />
                HOME
              </button>
            </Link> */}
            <button
              onClick={handleDownload}
              className="flex-1 py-3 px-4 rounded-xl font-medium text-sm transition-all duration-200 hover:opacity-80"
              style={{ 
                backgroundColor: isDark ? "transparent" : "#E3B23C",
                color: isDark ? textColor : "#014034",
                border: isDark ? `1px solid ${textColor}40` : "none"
              }}
            >
              <Download className="h-4 w-4 inline mr-2" />
              DOWNLOAD
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8F8F6] relative">
      {/* Theme Selector - Side Panel */}
      <div className="fixed right-4 top-1/2 transform -translate-y-1/2 z-10">
        <div className="bg-white rounded-xl shadow-lg p-4 border border-[#007F5F]/20">
          <div className="flex flex-col items-center gap-3">
            <Palette className="h-5 w-5 text-[#007F5F]" />
            <span className="text-xs font-medium text-[#014034]">
              Choose Theme
            </span>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => setSelectedTheme("dark")}
                className={`w-8 h-8 rounded-lg transition-all duration-200 ${
                  selectedTheme === "dark"
                    ? "bg-[#014034] ring-2 ring-[#007F5F]"
                    : "bg-[#014034] opacity-50 hover:opacity-80"
                }`}
                title="Dark Theme"
              />
              <button
                onClick={() => setSelectedTheme("light")}
                className={`w-8 h-8 rounded-lg transition-all duration-200 border-2 ${
                  selectedTheme === "light"
                    ? "bg-[#F8F8F6] border-[#007F5F] ring-2 ring-[#007F5F]"
                    : "bg-[#F8F8F6] border-[#014034] opacity-50 hover:opacity-80"
                }`}
                title="Light Theme"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <div className="bg-[#007F5F] p-4 rounded-full">
              <CheckCircle className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold mb-2 text-[#014034]">
            {isHajj ? "Hajj" : "Umrah"} Booking Confirmed!
          </h1>
          <p className="text-gray-600 mb-6 max-w-lg">
            Thank you for booking your {isHajj ? "Hajj pilgrimage" : "Umrah journey"} with Al-Mutamir. 
            Your {packageType} package has been successfully confirmed. A detailed confirmation
            email has been sent to your registered email address.
          </p>
        </div>

        {/* Booking Card */}
        <div className="mb-8">
          <BookingCard theme={selectedTheme} />
        </div>

        {/* Additional Info */}
        <div className="text-center max-w-md">
          <p className="text-sm text-gray-500 mb-4">
            Our representative will contact you within 24 hours to confirm your {isHajj ? "Hajj" : "Umrah"} booking details 
            and provide you with the next steps for your sacred journey.
          </p>
          
          {/* Footer */}
          <div className="pt-6 border-t border-gray-200">
            <Link href="/" className="flex items-center justify-center gap-2">
              <Image
                src="/images/mutamir.png"
                alt="Al-mutamir Logo"
                width={100}
                height={100}
                className="h-7 w-7"
              />
              <span className="font-semibold text-[#014034]">Al-Mutamir</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}