"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, AlertCircle, Copy, LogIn } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog"
import { updateBookingPayment } from "@/lib/firebase/firestore"
import { createPaymentNotification } from "@/lib/firebase/notifications"
import { useAuth } from "@/context/auth-context"
import Link from "next/link"

interface PaystackPaymentProps {
  amount: number
  email?: string
  name?: string
  bookingId: string
  packageId: string
  agencyId: string
  pilgrimId?: string
  onSuccess: (reference: string) => void
  onClose?: () => void
  redirectToLogin?: boolean
}

export function PaystackPayment({
  amount,
  email,
  name,
  bookingId,
  packageId,
  agencyId,
  pilgrimId,
  onSuccess,
  onClose,
  redirectToLogin = true,
}: PaystackPaymentProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [scriptLoaded, setScriptLoaded] = useState(false)
  const [scriptError, setScriptError] = useState<string | null>(null)
  const [showManualPayment, setShowManualPayment] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()

  // Load the Paystack script
  useEffect(() => {
    if (typeof window === "undefined") return

    // Check if script is already loaded
    if (document.querySelector('script[src="https://js.paystack.co/v1/inline.js"]')) {
      if (window.PaystackPop) {
        setScriptLoaded(true)
      }
      return
    }

    const script = document.createElement("script")
    script.src = "https://js.paystack.co/v1/inline.js"
    script.async = true
    script.onload = () => {
      if (window.PaystackPop) {
        setScriptLoaded(true)
      } else {
        setScriptError("Paystack script loaded but PaystackPop is not available")
      }
    }
    script.onerror = () => {
      setScriptError("Failed to load Paystack payment script")
    }

    document.body.appendChild(script)

    return () => {
      // Clean up script if component unmounts during loading
      if (document.body.contains(script)) {
        document.body.removeChild(script)
      }
    }
  }, [])

  const handlePayment = () => {
    setIsLoading(true)

    if (!scriptLoaded) {
      toast({
        title: "Payment Error",
        description: "Payment system is still loading. Please try again in a moment.",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    try {
      // Ensure PaystackPop is available
      if (!window.PaystackPop) {
        throw new Error("Paystack payment system is not available")
      }

      // Use user data if available, otherwise use provided props
      const payerEmail = user?.email || email
      const payerName = user?.displayName || name
      const payerPilgrimId = user?.uid || pilgrimId

      if (!payerEmail) {
        throw new Error("Email is required for payment")
      }

      const handler = window.PaystackPop.setup({
        key: "pk_test_7e2cfefb0e019d9fe9a5a7a7206c262e213ab1e3",
        email: payerEmail,
        amount: amount * 100, // Paystack amount is in kobo (100 kobo = 1 Naira)
        currency: "NGN", // Changed from USD to NGN for Naira
        ref: `booking_${bookingId}_${new Date().getTime()}`,
        metadata: {
          custom_fields: [
            {
              display_name: "Booking ID",
              variable_name: "booking_id",
              value: bookingId,
            },
            {
              display_name: "Customer Name",
              variable_name: "customer_name",
              value: payerName || "Customer",
            },
            {
              display_name: "Package ID",
              variable_name: "package_id",
              value: packageId,
            },
            {
              display_name: "Agency ID",
              variable_name: "agency_id",
              value: agencyId,
            },
            {
              display_name: "Pilgrim ID",
              variable_name: "pilgrim_id",
              value: payerPilgrimId || "guest",
            },
          ],
        },
        callback: async (response: any) => {
          // Handle successful payment
          try {
            // Update booking payment status
            await updateBookingPayment(bookingId, {
              paymentStatus: "paid",
              paymentReference: response.reference,
              paymentDate: new Date(),
            })

            // Create notification for the agency
            if (payerPilgrimId) {
              await createPaymentNotification(agencyId, payerPilgrimId, packageId, amount)
            }

            // Call the onSuccess callback
            onSuccess(response.reference)
          } catch (error) {
            console.error("Error processing payment:", error)
            toast({
              title: "Payment Processing Error",
              description: "Payment was successful, but we couldn't update your booking. Please contact support.",
              variant: "destructive",
            })
          }
        },
        onClose: () => {
          // Handle payment window close
          setIsLoading(false)
          if (onClose) onClose()
        },
      })

      handler.openIframe()
    } catch (error) {
      console.error("Payment error:", error)
      toast({
        title: "Payment Error",
        description:
          error instanceof Error ? error.message : "There was an error initiating the payment. Please try again.",
        variant: "destructive",
      })
      setIsLoading(false)
    }
  }

  // Copy account number to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied to clipboard",
      description: "Account number copied to clipboard",
    })
  }

  // Handle manual payment
  const handleManualPayment = () => {
    setShowManualPayment(true)
  }

  const completeManualPayment = async () => {
    setIsLoading(true)
    try {
      // Update booking payment status
      await updateBookingPayment(bookingId, {
        paymentStatus: "pending",
        paymentReference: `manual_${new Date().getTime()}`,
        paymentDate: new Date(),
        paymentMethod: "bank_transfer",
      })

      // Create notification for the agency
      if (user?.uid || pilgrimId) {
        await createPaymentNotification(agencyId, user?.uid || pilgrimId || "guest", packageId, amount)
      }

      toast({
        title: "Manual Payment Initiated",
        description: "Your booking has been created. Please complete the bank transfer to confirm your booking.",
      })

      // Call the onSuccess callback
      onSuccess(`manual_${new Date().getTime()}`)
      setShowManualPayment(false)
    } catch (error) {
      console.error("Error processing manual payment:", error)
      toast({
        title: "Payment Processing Error",
        description: "We couldn't update your booking. Please try again or contact support.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // If user is not authenticated, show login prompt
  if (!user && redirectToLogin) {
    return (
      <div className="space-y-4 p-6 bg-gray-50 rounded-lg border">
        <div className="text-center space-y-2">
          <h3 className="text-lg font-medium">Authentication Required</h3>
          <p className="text-gray-500">Please log in to continue with your payment</p>
        </div>

        <div className="flex flex-col space-y-3">
          <Button asChild className="w-full">
            <Link href={`/auth/login?redirect=${encodeURIComponent(`/booking/${bookingId}`)}`}>
              <LogIn className="mr-2 h-4 w-4" />
              Log in to continue
            </Link>
          </Button>

          <Button asChild variant="outline" className="w-full">
            <Link href={`/auth/register?redirect=${encodeURIComponent(`/booking/${bookingId}`)}`}>
              Create an account
            </Link>
          </Button>
        </div>

        <Alert className="bg-blue-50 border-blue-200">
          <AlertCircle className="h-4 w-4 text-blue-600" />
          <AlertTitle className="text-blue-800">Why login is required</AlertTitle>
          <AlertDescription className="text-blue-700">
            Creating an account allows you to track your bookings, receive payment confirmations, and manage your
            pilgrim journey.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  if (scriptError) {
    return (
      <div className="space-y-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Payment System Error</AlertTitle>
          <AlertDescription>
            {scriptError}. Please try again later or use an alternative payment method.
          </AlertDescription>
        </Alert>
        <Button onClick={handleManualPayment} className="w-full">
          Continue with Manual Payment
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Button onClick={handlePayment} disabled={isLoading || !scriptLoaded} className="w-full">
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : !scriptLoaded ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Loading Payment System...
          </>
        ) : (
          "Pay with Paystack"
        )}
      </Button>

      <div className="text-center">
        <Button variant="link" onClick={handleManualPayment} className="text-sm">
          Having trouble? Use manual payment instead
        </Button>
      </div>

      {/* Manual Payment Dialog */}
      <Dialog open={showManualPayment} onOpenChange={setShowManualPayment}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Bank Transfer Payment</DialogTitle>
            <DialogDescription>
              Please transfer ₦{amount.toLocaleString()} to the following bank account and click "I've Made the
              Transfer" when done.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="bg-gray-50 p-4 rounded-lg border">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Bank Name:</span>
                  <span>First Bank Nigeria</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Account Name:</span>
                  <span>Almutamir Pilgrimages Ltd</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Account Number:</span>
                  <div className="flex items-center">
                    <span className="mr-2">0123456789</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => copyToClipboard("0123456789")}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Reference:</span>
                  <div className="flex items-center">
                    <span className="mr-2">BOOKING-{bookingId.substring(0, 8)}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => copyToClipboard(`BOOKING-${bookingId.substring(0, 8)}`)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <Alert className="bg-yellow-50 border-yellow-200">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <AlertTitle className="text-yellow-800">Important</AlertTitle>
              <AlertDescription className="text-yellow-700">
                Please include the reference number in your transfer details. Your booking will be confirmed once
                payment is verified.
              </AlertDescription>
            </Alert>
          </div>
          <div className="flex justify-between">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={completeManualPayment} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "I've Made the Transfer"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Add this to make TypeScript happy with the PaystackPop global
declare global {
  interface Window {
    PaystackPop: any
  }
}
