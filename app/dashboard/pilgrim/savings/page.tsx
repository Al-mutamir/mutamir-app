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
import { addWaitlistEntry } from "@/lib/firebase/services/waitlist"
import { toast } from "@/components/ui/use-toast"

export default function SavingsPage() {
  const { user } = useAuth()
  const [isWaitlistOpen, setIsWaitlistOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.displayName || "",
    email: user?.email || "",
    phone: "",
    state: "",
    city: "",
    interestedIn: "Both",
    plannedYear: "2027",
    planningStage: "Just researching",
    numPilgrims: 1,
    firstTime: false,
    preferredFrequency: "Monthly",
    estimatedMonthly: "",
    heardAbout: "",
    whatsappConsent: false,
    acceptTerms: false,
    notifyUpdates: true,
  })

  const handleInputChange = (e: any) => {
    const { name, value, type, checked } = e.target
    let v: any = type === "checkbox" ? checked : value
    if (type === "number") v = Number(value)
    // Special-case conversions
    if (name === "firstTime") v = value === "true"
    setFormData({
      ...formData,
      [name]: v,
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

    if (!formData.whatsappConsent) {
      toast({
        title: "WhatsApp Consent Required",
        description: "Please consent to receive updates via WhatsApp so we can keep you informed.",
        variant: "destructive",
      })
      return
    }

    if (!formData.name || !String(formData.name).trim()) {
      toast({
        title: "Name required",
        description: "Please enter your full name.",
        variant: "destructive",
      })
      return
    }

    if (!formData.phone || !String(formData.phone).trim()) {
      toast({
        title: "Phone required",
        description: "Please enter your phone number so we can contact you.",
        variant: "destructive",
      })
      return
    }

    if (!formData.state || !String(formData.state).trim()) {
      toast({
        title: "State required",
        description: "Please enter your state of residence.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmitting(true)

      // Add user to waitlist in Firestore (typed service)
      await addWaitlistEntry({
        userId: user?.uid ?? null,
        ...formData,
        feature: "savings",
      } as any)

      toast({
        title: "You're on the list!",
        description: "Thank you for joining the Al-Mutamir Pilgrimage Savings Waitlist. We'll keep you informed as we build a simpler way to help Muslims prepare financially for Hajj and Umrah.",
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
            <h1 className="text-3xl font-bold">Pilgrimage Savings</h1>
          </div>

          {/* Hero / Landing Section for Pilgrimage Savings */}
          <Card className="mb-6 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
            <CardContent className="pt-6 pb-6 text-center">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <PiggyBank className="h-8 w-8 text-blue-700" />
              </div>

              <h2 className="text-3xl font-bold text-blue-900 mb-3">Your Journey to Hajj Starts Today</h2>

              <p className="text-lg text-blue-800 max-w-3xl mx-auto leading-relaxed">
                Every pilgrimage begins with preparation.
                <br />
                Al-Mutamir is building a Shariah-compliant savings and financing solution designed to help Muslims
                prepare for Hajj and Umrah through structured savings and ethical financial support.
                <br />
                Join the waitlist to receive early access and product updates.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto mt-6">
                <div className="bg-white bg-opacity-70 p-4 rounded-lg shadow-sm text-center">
                  <PiggyBank className="h-6 w-6 text-green-600 mx-auto mb-2" />
                  <h3 className="font-semibold">Save Towards Your Goal</h3>
                  <p className="text-sm text-muted-foreground">Set your pilgrimage target and build your Hajj or Umrah fund over time.</p>
                </div>

                <div className="bg-white bg-opacity-70 p-4 rounded-lg shadow-sm text-center">
                  <Calendar className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                  <h3 className="font-semibold">Build a Saving Habit</h3>
                  <p className="text-sm text-muted-foreground">Make consistent weekly or monthly contributions that fit your budget.</p>
                </div>

                <div className="bg-white bg-opacity-70 p-4 rounded-lg shadow-sm text-center">
                  <CreditCard className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                  <h3 className="font-semibold">Ethical Financing</h3>
                  <p className="text-sm text-muted-foreground">Explore Shariah-compliant financing options when the service becomes available.</p>
                </div>
              </div>

              <div className="mt-8">
                <Badge
                  variant="outline"
                  className="mb-2 bg-blue-100 text-blue-800 border-blue-300"
                >
                  Coming Soon
                </Badge>

                <p className="text-blue-800 text-lg font-medium mt-3">Be among the first to prepare for your next Hajj or Umrah.</p>
                <p className="text-sm text-blue-700 mt-2">Join the waitlist today and receive early access, launch updates and educational resources.</p>

n                <Button className="mt-4 bg-blue-600 hover:bg-blue-700" onClick={() => setIsWaitlistOpen(true)}>
                  Join Waitlist
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Why Join Section */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Why Join the Waitlist?</CardTitle>
              <CardDescription>
                Be among the first to experience Al-Mutamir's upcoming pilgrimage savings solution.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <div className="grid md:grid-cols-2 gap-5">

                <div className="flex gap-3">
                  <PiggyBank className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <h4 className="font-semibold">Early Access</h4>
                    <p className="text-sm text-muted-foreground">Receive priority access when registrations begin.</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Calendar className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <h4 className="font-semibold">Product Updates</h4>
                    <p className="text-sm text-muted-foreground">Stay informed throughout development.</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Wallet className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <h4 className="font-semibold">Hajj Planning Tips</h4>
                    <p className="text-sm text-muted-foreground">Learn how to prepare financially for your pilgrimage.</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <CreditCard className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <h4 className="font-semibold">Future Financing Opportunities</h4>
                    <p className="text-sm text-muted-foreground">Receive updates about eligible Shariah-compliant financing options.</p>
                  </div>
                </div>

              </div>

            </CardContent>
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
                  <Label htmlFor="email">Email (optional)</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="state">State of Residence</Label>
                  <Input id="state" name="state" value={formData.state || ""} onChange={handleInputChange} required />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="city">City (optional)</Label>
                  <Input id="city" name="city" value={formData.city || ""} onChange={handleInputChange} />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="interestedIn">Interested In</Label>
                  <select
                    id="interestedIn"
                    name="interestedIn"
                    value={formData.interestedIn}
                    onChange={handleInputChange}
                    className="w-full rounded-md border px-3 py-2"
                  >
                    <option>Hajj</option>
                    <option>Umrah</option>
                    <option>Both</option>
                  </select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="plannedYear">Planned Travel Year</Label>
                  <select
                    id="plannedYear"
                    name="plannedYear"
                    value={formData.plannedYear}
                    onChange={handleInputChange}
                    className="w-full rounded-md border px-3 py-2"
                  >
                    <option>2027</option>
                    <option>2028</option>
                    <option>2029</option>
                    <option>2030+</option>
                  </select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="planningStage">Current Planning Stage</Label>
                  <select
                    id="planningStage"
                    name="planningStage"
                    value={formData.planningStage}
                    onChange={handleInputChange}
                    className="w-full rounded-md border px-3 py-2"
                  >
                    <option>Just researching</option>
                    <option>Want to start saving</option>
                    <option>Need financing</option>
                    <option>Ready to book</option>
                  </select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="numPilgrims">Number of Pilgrims</Label>
                  <Input
                    id="numPilgrims"
                    name="numPilgrims"
                    type="number"
                    min={1}
                    value={formData.numPilgrims}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="firstTime">First-time Pilgrim?</Label>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="firstTime-yes"
                        name="firstTime"
                        value="true"
                        checked={String(formData.firstTime) === "true"}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-primary"
                      />
                      <Label htmlFor="firstTime-yes" className="text-sm font-normal">Yes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="firstTime-no"
                        name="firstTime"
                        value="false"
                        checked={String(formData.firstTime) === "false"}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-primary"
                      />
                      <Label htmlFor="firstTime-no" className="text-sm font-normal">No</Label>
                    </div>
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="preferredFrequency">Preferred Savings Frequency</Label>
                  <select
                    id="preferredFrequency"
                    name="preferredFrequency"
                    value={formData.preferredFrequency || "Monthly"}
                    onChange={handleInputChange}
                    className="w-full rounded-md border px-3 py-2"
                  >
                    <option>Daily</option>
                    <option>Weekly</option>
                    <option>Monthly</option>
                  </select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="estimatedMonthly">Estimated Monthly Savings (Optional)</Label>
                  <Input
                    id="estimatedMonthly"
                    name="estimatedMonthly"
                    type="number"
                    min={0}
                    value={formData.estimatedMonthly}
                    onChange={handleInputChange}
                    placeholder="0"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="heardAbout">How did you hear about us? (optional)</Label>
                  <Input id="heardAbout" name="heardAbout" value={formData.heardAbout || ""} onChange={handleInputChange} />
                </div>

                <div className="flex items-center space-x-2 pt-2">
                  <Checkbox
                    id="notifyUpdates"
                    checked={formData.notifyUpdates}
                    onCheckedChange={(checked) => handleCheckboxChange("notifyUpdates", checked)}
                  />
                  <Label htmlFor="notifyUpdates" className="text-sm font-normal">
                    Notify me about other Al-Mutamir updates and features
                  </Label>
                </div>

                <div className="flex items-center space-x-2 pt-2">
                  <Checkbox
                    id="whatsappConsent"
                    checked={formData.whatsappConsent || false}
                    onCheckedChange={(checked) => handleCheckboxChange("whatsappConsent", checked)}
                  />
                  <Label htmlFor="whatsappConsent" className="text-sm font-normal">
                    I consent to receive updates via WhatsApp
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
