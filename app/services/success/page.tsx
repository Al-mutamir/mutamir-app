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
        <div className="p-4 sm:p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="text-sm sm:text-lg font-semibold" style={{ color: textColor }}>
              BOOKING CONFIRMATION
            </h2>
            <div className="w-6"></div>
          </div>

          {/* Service Info */}
          <div 
            className="flex items-center justify-between p-3 sm:p-4 rounded-xl mb-4 sm:mb-6"
            style={{ backgroundColor: cardBg }}
          >
            <div className="flex items-center gap-2 sm:gap-3">
              <div 
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: accentColor }}
              >
               <Image src="/images/logo-white.png" alt="Almutamir Logo" width={32} height={32} className="sm:w-10 sm:h-10 rounded-full" />
              </div>
              <div>
                <h3 className="font-bold text-sm sm:text-lg" style={{ color: textColor }}>
                  Almutamir
                </h3>
                <p className="text-xs sm:text-sm opacity-75" style={{ color: secondaryText }}>
                  {isHajj ? "Hajj" : "Umrah"} Services
                </p>
              </div>
            </div>
            <div 
              className="px-2 sm:px-3 py-1 rounded-full text-xs font-medium"
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
          <div className="text-center mb-4 sm:mb-6">
            <div className="flex items-center justify-center mb-3 sm:mb-4">
              <Package className="h-6 w-6 sm:h-8 sm:w-8 mr-2 sm:mr-3" style={{ color: accentColor }} />
              <div>
                <div className="text-xl sm:text-3xl font-bold" style={{ color: textColor }}>
                  {isHajj ? "HAJJ" : "UMRAH"}
                </div>
                <div className="text-xs sm:text-sm opacity-75" style={{ color: secondaryText }}>
                  {isHajj ? "Pilgrimage Package" : "Lesser Pilgrimage"}
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-center">
              <div 
                className="h-0.5 w-12 sm:w-16"
                style={{ backgroundColor: accentColor }}
              ></div>
              <Plane 
                className="mx-3 sm:mx-4 h-3 w-3 sm:h-4 sm:w-4" 
                style={{ color: accentColor }}
              />
              <div 
                className="h-0.5 w-12 sm:w-16"
                style={{ backgroundColor: accentColor }}
              ></div>
            </div>
            
            <div className="text-xs mt-2" style={{ color: secondaryText }}>
              Sacred Journey to Mecca
            </div>
          </div>

          {/* Pilgrim Details */}
          <div className="mb-4 sm:mb-6">
            <div className="text-xs sm:text-sm opacity-75 mb-2" style={{ color: secondaryText }}>
              {isGroupBooking ? "Group Leader" : "Pilgrim Name"}
            </div>
            <div className="text-sm sm:text-lg font-semibold mb-3 sm:mb-4" style={{ color: textColor }}>
              {primaryPilgrim?.firstName || "Guest"} {primaryPilgrim?.lastName || "User"}
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div>
                <div className="text-xs sm:text-sm opacity-75 mb-1" style={{ color: secondaryText }}>
                  Booking Ref.
                </div>
                <div className="font-medium text-xs sm:text-base" style={{ color: textColor }}>
                  {bookingRef}
                </div>
              </div>
              <div>
                <div className="text-xs sm:text-sm opacity-75 mb-1" style={{ color: secondaryText }}>
                  Package Type
                </div>
                <div className="font-medium capitalize text-xs sm:text-base" style={{ color: textColor }}>
                  {packageType}
                </div>
              </div>
              <div>
                <div className="text-xs sm:text-sm opacity-75 mb-1" style={{ color: secondaryText }}>
                  Status
                </div>
                <div className="font-medium text-xs sm:text-base" style={{ color: accentColor }}>
                  Confirmed
                </div>
              </div>
              <div>
                <div className="text-xs sm:text-sm opacity-75 mb-1" style={{ color: secondaryText }}>
                  {isGroupBooking ? "Group Size" : "Pilgrims"}
                </div>
                <div className="font-medium text-xs sm:text-base" style={{ color: textColor }}>
                  {totalPilgrims} {totalPilgrims === 1 ? "Person" : "People"}
                </div>
              </div>
              <div>
                <div className="text-xs sm:text-sm opacity-75 mb-1" style={{ color: secondaryText }}>
                  Booking Date
                </div>
                <div className="font-medium text-xs sm:text-base" style={{ color: textColor }}>
                  {new Date().toLocaleDateString()}
                </div>
              </div>
              <div>
                <div className="text-xs sm:text-sm opacity-75 mb-1" style={{ color: secondaryText }}>
                  Email
                </div>
                <div className="font-medium text-xs" style={{ color: textColor }}>
                  {primaryPilgrim?.email || "guest@example.com"}
                </div>
              </div>
            </div>
          </div>

          {/* Barcode */}
          <div className="flex justify-center mb-4 sm:mb-6">
            <div className="bg-white p-2 sm:p-3 rounded-lg">
              <div className="flex space-x-0.5">
                {Array.from({ length: 25 }).map((_, i) => (
                  <div
                    key={i}
                    className="bg-black"
                    style={{
                      width: '2px',
                      height: Math.random() > 0.5 ? '30px' : '15px',
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 sm:gap-3">
            <button
              onClick={handleDownload}
              className="flex-1 py-2 sm:py-3 px-3 sm:px-4 rounded-xl font-medium text-xs sm:text-sm transition-all duration-200 hover:opacity-80"
              style={{ 
                backgroundColor: isDark ? "transparent" : "#E3B23C",
                color: isDark ? textColor : "#014034",
                border: isDark ? `1px solid ${textColor}40` : "none"
              }}
            >
              <Download className="h-3 w-3 sm:h-4 sm:w-4 inline mr-1 sm:mr-2" />
              DOWNLOAD
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8F8F6] relative">
      {/* Theme Selector - Responsive positioning */}
      <div className="fixed top-4 right-4 sm:right-4 sm:top-1/2 sm:transform sm:-translate-y-1/2 z-10">
        <div className="bg-white rounded-xl shadow-lg p-2 sm:p-4 border border-[#007F5F]/20">
          <div className="flex sm:flex-col items-center gap-2 sm:gap-3">
            <Palette className="h-4 w-4 sm:h-5 sm:w-5 text-[#007F5F]" />
            <span className="text-xs font-medium text-[#014034] hidden sm:block">
              Choose Theme
            </span>
            <div className="flex sm:flex-col gap-2">
              <button
                onClick={() => setSelectedTheme("dark")}
                className={`w-6 h-6 sm:w-8 sm:h-8 rounded-lg transition-all duration-200 ${
                  selectedTheme === "dark"
                    ? "bg-[#014034] ring-2 ring-[#007F5F]"
                    : "bg-[#014034] opacity-50 hover:opacity-80"
                }`}
                title="Dark Theme"
              />
              <button
                onClick={() => setSelectedTheme("light")}
                className={`w-6 h-6 sm:w-8 sm:h-8 rounded-lg transition-all duration-200 border-2 ${
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
      <div className="flex flex-col items-center justify-center min-h-screen p-4 sm:p-6 lg:p-8">
        {/* Success Header */}
        <div className="text-center mb-6 sm:mb-8 max-w-2xl">
          <div className="flex justify-center mb-4 sm:mb-6">
            <div className="bg-[#007F5F] p-3 sm:p-4 rounded-full">
              <CheckCircle className="h-8 w-8 sm:h-12 sm:w-12 text-white" />
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 sm:mb-3 text-[#014034] px-4">
            {isHajj ? "Hajj" : "Umrah"} Booking Confirmed!
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 max-w-lg mx-auto px-4">
            Thank you for booking your {isHajj ? "Hajj pilgrimage" : "Umrah journey"} with Almutamir. 
            Your {packageType} package has been successfully confirmed. A detailed confirmation
            email has been sent to your registered email address.
          </p>
        </div>

        {/* Booking Card */}
        <div className="mb-6 sm:mb-8 w-full max-w-sm">
          <BookingCard theme={selectedTheme} />
        </div>

        {/* Additional Info */}
        <div className="text-center max-w-md mx-auto px-4">
          <p className="text-xs sm:text-sm text-gray-500 mb-4">
            Our representative will contact you within 24 hours to confirm your {isHajj ? "Hajj" : "Umrah"} booking details 
            and provide you with the next steps for your sacred journey.
          </p>
          
          {/* Footer */}
          <div className="pt-4 sm:pt-6 border-t border-gray-200">
            <Link href="/" className="flex items-center justify-center gap-2">
              <Image
                src="/images/mutamir.png"
                alt="Almutamir Logo"
                width={100}
                height={100}
                className="h-6 w-6 sm:h-7 sm:w-7"
              />
              <span className="font-semibold text-sm sm:text-base text-[#014034]">Almutamir</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}