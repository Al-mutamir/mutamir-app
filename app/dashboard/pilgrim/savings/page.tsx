"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { PiggyBank, Wallet, Calendar, CreditCard, Construction } from "lucide-react"
import DashboardLayout from "@/components/dashboard-layout"
import { useAuth } from "@/context/auth-context"
import ProtectedRoute from "@/components/protected-route"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { addToWaitlist } from "@/lib/firebase/firestore"
import { toast } from "@/components/ui/use-toast"

export default function SavingsPage() {
  const { user } = useAuth()
  const [isWaitlistOpen, setIsWaitlistOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.displayName || "",
    email: user?.email || "",
    phone: "",
    preferredContact: "email",
    acceptTerms: false,
    notifyUpdates: true,
  })

  const handleInputChange = (e: any) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    })
  }

  const handleCheckboxChange = (name: any, checked: any) => {
    setFormData({
      ...formData,
      [name]: checked,
    })
  }

  const handleSubmit = async (e: any) => {
    e.preventDefault()

    if (!formData.acceptTerms) {
      toast({
        title: "Terms Required",
        description: "Please accept the terms and conditions to join the waitlist.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmitting(true)

      // Add user to waitlist in Firestore
      await addToWaitlist({
        userId: user?.uid,
        ...formData,
        timestamp: new Date(),
        feature: "savings",
      })

      toast({
        title: "Success!",
        description: "You've been added to the savings feature waitlist. We'll notify you when it launches.",
      })

      setIsWaitlistOpen(false)
    } catch (error) {
      console.error("Error joining waitlist:", error)
      toast({
        title: "Something went wrong",
        description: "We couldn't add you to the waitlist. Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <ProtectedRoute allowedRoles={["pilgrim", "admin"]} requiredRole="pilgrim">
      <DashboardLayout userType="pilgrim">
        <div className="container mx-auto">
          <div className="flex items-center mb-6">
            <PiggyBank className="h-8 w-8 mr-3 text-primary" />
            <h1 className="text-3xl font-bold">Savings Dashboard</h1>
          </div>

          {/* Coming Soon Section */}
          <Card className="mb-6 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
            <CardContent className="pt-6 pb-6 text-center">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Construction className="h-8 w-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-blue-800 mb-2">Savings Feature Coming Soon</h2>
              <p className="text-blue-700 max-w-2xl mx-auto mb-6">
                We're working with trusted financial partners to bring you a dedicated savings platform for your
                pilgrimage journey. Save towards your next Hajj or Umrah trip with automated deposits, goal tracking,
                and more.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
                <div className="bg-white bg-opacity-70 p-4 rounded-lg shadow-sm">
                  <PiggyBank className="h-6 w-6 text-green-600 mx-auto mb-2" />
                  <h3 className="font-medium">Dedicated Savings</h3>
                  <p className="text-sm text-muted-foreground">Set aside funds specifically for your pilgrimage</p>
                </div>

                <div className="bg-white bg-opacity-70 p-4 rounded-lg shadow-sm">
                  <Calendar className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                  <h3 className="font-medium">Automated Deposits</h3>
                  <p className="text-sm text-muted-foreground">Schedule regular contributions to reach your goal</p>
                </div>

                <div className="bg-white bg-opacity-70 p-4 rounded-lg shadow-sm">
                  <CreditCard className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                  <h3 className="font-medium">Secure Transactions</h3>
                  <p className="text-sm text-muted-foreground">Your funds are protected and Shariah-compliant</p>
                </div>
              </div>

              <div className="mt-8">
                <Badge variant="outline" className="mb-2 bg-blue-100 text-blue-800 border-blue-300">
                  Launching Q3 2025
                </Badge>
                <p className="text-sm text-blue-700">Want to be notified when our savings platform launches?</p>
                <Button className="mt-4 bg-blue-600 hover:bg-blue-700" onClick={() => setIsWaitlistOpen(true)}>
                  Join Waitlist
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Partner Information */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Future Savings Partners</CardTitle>
              <CardDescription>Our planned financial partners for pilgrimage savings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="border rounded-lg p-4 text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CreditCard className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="font-medium">PilgrimSave Bank</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Dedicated Hajj and Umrah savings accounts with competitive rates
                  </p>
                </div>

                <div className="border rounded-lg p-4 text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <PiggyBank className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="font-medium">HajjFund</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Shariah-compliant savings plans specifically for pilgrimage
                  </p>
                </div>

                <div className="border rounded-lg p-4 text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Wallet className="h-8 w-8 text-purple-600" />
                  </div>
                  <h3 className="font-medium">UmrahSave</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Flexible savings options with automatic monthly deposits
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t pt-4 flex justify-center">
              <p className="text-sm text-muted-foreground text-center max-w-2xl">
                Our future financial partners will be regulated by the Central Bank and offer secure, Shariah-compliant
                savings options with deposits protected under the Deposit Insurance Scheme.
              </p>
            </CardFooter>
          </Card>
        </div>

        {/* Waitlist Modal */}
        <Dialog open={isWaitlistOpen} onOpenChange={setIsWaitlistOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Join Savings Waitlist</DialogTitle>
              <DialogDescription>
                Be the first to know when our savings platform launches. Fill in your details below.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" name="name" value={formData.name} onChange={handleInputChange} required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Preferred Contact Method</Label>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="email-contact"
                        name="preferredContact"
                        value="email"
                        checked={formData.preferredContact === "email"}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-primary"
                      />
                      <Label htmlFor="email-contact" className="text-sm font-normal">
                        Email
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="phone-contact"
                        name="preferredContact"
                        value="phone"
                        checked={formData.preferredContact === "phone"}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-primary"
                      />
                      <Label htmlFor="phone-contact" className="text-sm font-normal">
                        Phone
                      </Label>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2 pt-2">
                  <Checkbox
                    id="notifyUpdates"
                    checked={formData.notifyUpdates}
                    onCheckedChange={(checked) => handleCheckboxChange("notifyUpdates", checked)}
                  />
                  <Label htmlFor="notifyUpdates" className="text-sm font-normal">
                    Notify me about other Almutamir updates and features
                  </Label>
                </div>
                <div className="flex items-start space-x-2 pt-2">
                  <Checkbox
                    id="acceptTerms"
                    checked={formData.acceptTerms}
                    onCheckedChange={(checked) => handleCheckboxChange("acceptTerms", checked)}
                  />
                  <Label htmlFor="acceptTerms" className="text-sm font-normal">
                    I agree to the{" "}
                    <a href="/terms" className="text-primary hover:underline" target="_blank" rel="noreferrer">
                      Terms and Conditions
                    </a>{" "}
                    and{" "}
                    <a href="/privacy" className="text-primary hover:underline" target="_blank" rel="noreferrer">
                      Privacy Policy
                    </a>
                  </Label>
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsWaitlistOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Submitting..." : "Join Waitlist"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </DashboardLayout>
    </ProtectedRoute>
  )
}
