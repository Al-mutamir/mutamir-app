"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import DashboardLayout from "@/components/dashboard-layout"
import { getUserProfile, updateUserProfile } from "@/lib/firebase/firestore"
import { useAuth } from "@/context/auth-context"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Switch } from "@/components/ui/switch"
import ProtectedRoute from "@/components/protected-route"

// Type definitions matching your auth context
interface EmergencyContact {
  name: string
  relationship: string
  phone: string
}

interface Preferences {
  emailNotifications: boolean
  smsNotifications: boolean
  marketingEmails: boolean
  language: string
}

interface UserProfile {
  id?: string
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  address?: string
  city?: string
  state?: string
  country?: string
  dateOfBirth?: string
  gender?: string
  passportNumber?: string
  passportExpiry?: string
  emergencyContact?: EmergencyContact
  preferences?: Preferences
}

// Match your AuthUser type from auth context
interface AuthUser {
  uid: string
  email: string | null
  displayName?: string
}

interface AuthContextType {
  user: AuthUser | null
  // Add other properties that your auth context might have
}

export default function PilgrimProfilePage() {
  const { user } = useAuth() as AuthContextType
  const [loading, setLoading] = useState<boolean>(true)
  const [saving, setSaving] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string>("")

  // Form states with proper typing - all fields optional to match UserProfile
  const [formData, setFormData] = useState<UserProfile>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    country: "Nigeria",
    dateOfBirth: "",
    gender: "",
    passportNumber: "",
    passportExpiry: "",
    emergencyContact: {
      name: "",
      relationship: "",
      phone: "",
    },
    preferences: {
      emailNotifications: true,
      smsNotifications: true,
      marketingEmails: false,
      language: "en",
    },
  })

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.uid) return

      try {
        setLoading(true)
        // Type assertion to handle the getUserProfile return type
        const profileData = await getUserProfile(user.uid) as UserProfile | null

        if (profileData) {
          // Handle the profile data properly
          setFormData({
            firstName: profileData.firstName || "",
            lastName: profileData.lastName || "",
            email: profileData.email || user.email || "",
            phone: profileData.phone || "",
            address: profileData.address || "",
            city: profileData.city || "",
            state: profileData.state || "",
            country: profileData.country || "Nigeria",
            dateOfBirth: profileData.dateOfBirth || "",
            gender: profileData.gender || "",
            passportNumber: profileData.passportNumber || "",
            passportExpiry: profileData.passportExpiry || "",
            preferences: {
              emailNotifications: profileData.preferences?.emailNotifications ?? true,
              smsNotifications: profileData.preferences?.smsNotifications ?? true,
              marketingEmails: profileData.preferences?.marketingEmails ?? false,
              language: profileData.preferences?.language || "en",
            },
            emergencyContact: {
              name: profileData.emergencyContact?.name || "",
              relationship: profileData.emergencyContact?.relationship || "",
              phone: profileData.emergencyContact?.phone || "",
            },
          })
        } else {
          // Initialize with user data if available
          setFormData(prev => ({
            ...prev,
            email: user.email || "",
            firstName: user.displayName?.split(" ")[0] || "",
            lastName: user.displayName?.split(" ").slice(1).join(" ") || "",
          }))
        }
      } catch (err) {
        console.error("Error fetching profile:", err)
        setError("Failed to load your profile. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [user])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target

    if (name.includes(".")) {
      const [section, field] = name.split(".")
      setFormData(prev => ({
        ...prev,
        [section]: {
          ...(prev[section as keyof UserProfile] as Record<string, any>),
          [field]: value,
        },
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }))
    }
  }

  const handleSwitchChange = (name: string, checked: boolean) => {
    const [section, field] = name.split(".")
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...(prev[section as keyof UserProfile] as Record<string, any>),
        [field]: checked,
      },
    }))
  }

  const handleSelectChange = (name: string, value: string) => {
    if (name.includes(".")) {
      const [section, field] = name.split(".")
      setFormData(prev => ({
        ...prev,
        [section]: {
          ...(prev[section as keyof UserProfile] as Record<string, any>),
          [field]: value,
        },
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!user?.uid) {
      setError("User not authenticated")
      return
    }

    try {
      setSaving(true)
      setError(null)
      setSuccessMessage("")

      // Create a clean data object with only defined values
      const cleanFormData = {
        firstName: formData.firstName || "",
        lastName: formData.lastName || "",
        email: formData.email || "",
        phone: formData.phone || "",
        address: formData.address || "",
        city: formData.city || "",
        state: formData.state || "",
        country: formData.country || "Nigeria",
        dateOfBirth: formData.dateOfBirth || "",
        gender: formData.gender || "",
        passportNumber: formData.passportNumber || "",
        passportExpiry: formData.passportExpiry || "",
        emergencyContact: {
          name: formData.emergencyContact?.name || "",
          relationship: formData.emergencyContact?.relationship || "",
          phone: formData.emergencyContact?.phone || "",
        },
        preferences: {
          emailNotifications: formData.preferences?.emailNotifications ?? true,
          smsNotifications: formData.preferences?.smsNotifications ?? true,
          marketingEmails: formData.preferences?.marketingEmails ?? false,
          language: formData.preferences?.language || "en",
        },
      }

      await updateUserProfile(user.uid, cleanFormData)

      setSuccessMessage("Profile updated successfully!")
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(""), 3000)
    } catch (err) {
      console.error("Error updating profile:", err)
      setError("Failed to update your profile. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  const content = (
    <div className="container mx-auto">
      <h1 className="text-3xl font-bold mb-6">Profile</h1>
      
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {successMessage && (
        <Alert className="mb-6 bg-green-50 border-green-500 text-green-700">
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="personal" className="mb-6">
        <TabsList className="mb-4">
          <TabsTrigger value="personal">Personal Information</TabsTrigger>
          <TabsTrigger value="passport">Passport & Travel</TabsTrigger>
          <TabsTrigger value="emergency">Emergency Contact</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
        </TabsList>

        <TabsContent value="personal">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your personal details</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={formData.firstName || ""}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={formData.lastName || ""}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email || ""}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" name="phone" value={formData.phone || ""} onChange={handleInputChange} required />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Textarea id="address" name="address" value={formData.address || ""} onChange={handleInputChange} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input id="city" name="city" value={formData.city || ""} onChange={handleInputChange} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input id="state" name="state" value={formData.state || ""} onChange={handleInputChange} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Select value={formData.country || "Nigeria"} onValueChange={(value) => handleSelectChange("country", value)}>
                      <SelectTrigger id="country">
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Nigeria">Nigeria</SelectItem>
                        <SelectItem value="Ghana">Ghana</SelectItem>
                        <SelectItem value="Kenya">Kenya</SelectItem>
                        <SelectItem value="South Africa">South Africa</SelectItem>
                        <SelectItem value="Egypt">Egypt</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth">Date of Birth</Label>
                    <Input
                      id="dateOfBirth"
                      name="dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth || ""}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender</Label>
                    <Select value={formData.gender || ""} onValueChange={(value) => handleSelectChange("gender", value)}>
                      <SelectTrigger id="gender">
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                        <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button type="submit" disabled={saving}>
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="passport">
          <Card>
            <CardHeader>
              <CardTitle>Passport & Travel Information</CardTitle>
              <CardDescription>Add your passport details for easier booking</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="passportNumber">Passport Number</Label>
                    <Input
                      id="passportNumber"
                      name="passportNumber"
                      value={formData.passportNumber || ""}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="passportExpiry">Passport Expiry Date</Label>
                    <Input
                      id="passportExpiry"
                      name="passportExpiry"
                      type="date"
                      value={formData.passportExpiry || ""}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button type="submit" disabled={saving}>
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="emergency">
          <Card>
            <CardHeader>
              <CardTitle>Emergency Contact</CardTitle>
              <CardDescription>Who should we contact in case of emergency</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="emergencyContact.name">Contact Name</Label>
                  <Input
                    id="emergencyContact.name"
                    name="emergencyContact.name"
                    value={formData.emergencyContact?.name || ""}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="emergencyContact.relationship">Relationship</Label>
                    <Select
                      value={formData.emergencyContact?.relationship || ""}
                      onValueChange={(value) => handleSelectChange("emergencyContact.relationship", value)}
                    >
                      <SelectTrigger id="emergencyContact.relationship">
                        <SelectValue placeholder="Select relationship" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="spouse">Spouse</SelectItem>
                        <SelectItem value="parent">Parent</SelectItem>
                        <SelectItem value="child">Child</SelectItem>
                        <SelectItem value="sibling">Sibling</SelectItem>
                        <SelectItem value="friend">Friend</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="emergencyContact.phone">Phone Number</Label>
                    <Input
                      id="emergencyContact.phone"
                      name="emergencyContact.phone"
                      value={formData.emergencyContact?.phone || ""}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button type="submit" disabled={saving}>
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences">
          <Card>
            <CardHeader>
              <CardTitle>Preferences</CardTitle>
              <CardDescription>Manage your notification and language preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Notifications</h3>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="emailNotifications">Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive booking updates and important alerts via email
                      </p>
                    </div>
                    <Switch
                      id="emailNotifications"
                      checked={formData.preferences?.emailNotifications ?? true}
                      onCheckedChange={(checked) => handleSwitchChange("preferences.emailNotifications", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="smsNotifications">SMS Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive booking updates and important alerts via SMS
                      </p>
                    </div>
                    <Switch
                      id="smsNotifications"
                      checked={formData.preferences?.smsNotifications ?? true}
                      onCheckedChange={(checked) => handleSwitchChange("preferences.smsNotifications", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="marketingEmails">Marketing Emails</Label>
                      <p className="text-sm text-muted-foreground">Receive promotional offers and newsletters</p>
                    </div>
                    <Switch
                      id="marketingEmails"
                      checked={formData.preferences?.marketingEmails ?? false}
                      onCheckedChange={(checked) => handleSwitchChange("preferences.marketingEmails", checked)}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Language & Region</h3>

                  <div className="space-y-2">
                    <Label htmlFor="language">Preferred Language</Label>
                    <Select
                      value={formData.preferences?.language || "en"}
                      onValueChange={(value) => handleSelectChange("preferences.language", value)}
                    >
                      <SelectTrigger id="language">
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="ar">Arabic</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                        <SelectItem value="ha">Hausa</SelectItem>
                        <SelectItem value="yo">Yoruba</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button type="submit" disabled={saving}>
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )

  if (loading) {
    return (
      <DashboardLayout userType="pilgrim">
        <div className="container mx-auto">
          <h1 className="text-3xl font-bold mb-6">Profile</h1>
          <Skeleton className="h-12 w-48 mb-6" />
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <ProtectedRoute allowedRoles={["pilgrim", "admin"]} requiredRole="pilgrim">
      <DashboardLayout userType="pilgrim">{content}</DashboardLayout>
    </ProtectedRoute>
  )
}