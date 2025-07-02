"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/context/auth-context"
import ProtectedRoute from "@/components/protected-route"
import DashboardLayout from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"
import { doc, getDoc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase/config"
import { Loader2, Save, Share2 } from "lucide-react"
import Link from "next/link"

export default function AgencyProfilePage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState({
    agencyName: "",
    description: "",
    address: "",
    cityOfOperation: "",
    countryOfOperation: "",
    phoneNumber: "",
    alternativeEmail: "",
    website: "",
    licenseNumber: "",
    yearsInOperation: "",
    averagePilgrimsPerYear: "",
    specialties: [],
    languages: [],
    socialMedia: {
      facebook: "",
      twitter: "",
      instagram: "",
      linkedin: "",
    },
    publicProfile: true,
  })

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return

      try {
        setLoading(true)
        const docRef = doc(db, "users", user.uid)
        const docSnap = await getDoc(docRef)

        if (docSnap.exists()) {
          const data = docSnap.data()
          setProfile((prev) => ({
            ...prev,
            ...data,
            agencyName: data.agencyName || data.displayName || "",
            alternativeEmail: data.alternativeEmail || data.email || "",
            publicProfile: data.publicProfile !== false, // default to true
          }))
        }
      } catch (error) {
        console.error("Error fetching profile:", error)
        toast({
          title: "Error",
          description: "Failed to load your profile. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [user, toast])

  const handleSaveProfile = async () => {
    if (!user) return

    try {
      setSaving(true)
      const docRef = doc(db, "users", user.uid)
      await updateDoc(docRef, {
        ...profile,
        updatedAt: new Date(),
      })

      toast({
        title: "Success",
        description: "Your profile has been updated successfully.",
      })
    } catch (error) {
      console.error("Error updating profile:", error)
      toast({
        title: "Error",
        description: "Failed to update your profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleSpecialtiesChange = (e) => {
    const value = e.target.value
    setProfile((prev) => ({
      ...prev,
      specialties: value.split(",").map((item) => item.trim()),
    }))
  }

  const handleLanguagesChange = (e) => {
    const value = e.target.value
    setProfile((prev) => ({
      ...prev,
      languages: value.split(",").map((item) => item.trim()),
    }))
  }

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={["agency"]}>
        <DashboardLayout userType="agency">
          <div className="flex items-center justify-center min-h-[60vh]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute allowedRoles={["agency"]}>
      <DashboardLayout
        userType="agency"
        title="Agency Profile"
        description="Manage your agency information and public profile"
      >
        <div className="space-y-6">
          <div className="flex justify-end">
            <div className="flex gap-2">
              <Link href={`/agency/${user?.uid}`} target="_blank">
                <Button variant="outline">
                  <Share2 className="mr-2 h-4 w-4" />
                  View Public Profile
                </Button>
              </Link>
              <Button onClick={handleSaveProfile} disabled={saving}>
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Save Changes
              </Button>
            </div>
          </div>

          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="basic">Basic Information</TabsTrigger>
              <TabsTrigger value="business">Business Details</TabsTrigger>
              <TabsTrigger value="social">Social & Contact</TabsTrigger>
              <TabsTrigger value="settings">Profile Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="basic">
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                  <CardDescription>Update your agency's basic information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="agencyName">Agency Name</Label>
                      <Input
                        id="agencyName"
                        value={profile.agencyName}
                        onChange={(e) => setProfile({ ...profile, agencyName: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="licenseNumber">License Number</Label>
                      <Input
                        id="licenseNumber"
                        value={profile.licenseNumber}
                        onChange={(e) => setProfile({ ...profile, licenseNumber: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="handlerFirstName">Handler First Name</Label>
                      <Input
                        id="handlerFirstName"
                        value={profile.handlerFirstName || ""}
                        onChange={(e) => setProfile({ ...profile, handlerFirstName: e.target.value })}
                        placeholder="First name of package handler"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="handlerLastName">Handler Last Name</Label>
                      <Input
                        id="handlerLastName"
                        value={profile.handlerLastName || ""}
                        onChange={(e) => setProfile({ ...profile, handlerLastName: e.target.value })}
                        placeholder="Last name of package handler"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Agency Description</Label>
                    <Textarea
                      id="description"
                      value={profile.description}
                      onChange={(e) => setProfile({ ...profile, description: e.target.value })}
                      rows={5}
                      placeholder="Tell pilgrims about your agency, your services, and what makes you unique..."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="cityOfOperation">City of Operation</Label>
                      <Input
                        id="cityOfOperation"
                        value={profile.cityOfOperation}
                        onChange={(e) => setProfile({ ...profile, cityOfOperation: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="countryOfOperation">Country of Operation</Label>
                      <Input
                        id="countryOfOperation"
                        value={profile.countryOfOperation}
                        onChange={(e) => setProfile({ ...profile, countryOfOperation: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Full Address</Label>
                    <Textarea
                      id="address"
                      value={profile.address}
                      onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                      rows={2}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="business">
              <Card>
                <CardHeader>
                  <CardTitle>Business Details</CardTitle>
                  <CardDescription>Information about your agency's operations</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="yearsInOperation">Years in Operation</Label>
                      <Input
                        id="yearsInOperation"
                        type="number"
                        value={profile.yearsInOperation}
                        onChange={(e) => setProfile({ ...profile, yearsInOperation: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="averagePilgrimsPerYear">Average Pilgrims Per Year</Label>
                      <Input
                        id="averagePilgrimsPerYear"
                        type="number"
                        value={profile.averagePilgrimsPerYear}
                        onChange={(e) => setProfile({ ...profile, averagePilgrimsPerYear: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="website">Website</Label>
                      <Input
                        id="website"
                        type="url"
                        value={profile.website}
                        onChange={(e) => setProfile({ ...profile, website: e.target.value })}
                        placeholder="https://example.com"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="specialties">Specialties</Label>
                    <Input
                      id="specialties"
                      value={profile.specialties?.join(", ") || ""}
                      onChange={handleSpecialtiesChange}
                      placeholder="Hajj, Umrah, Group Tours, VIP Services, etc. (comma separated)"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="languages">Languages Spoken</Label>
                    <Input
                      id="languages"
                      value={profile.languages?.join(", ") || ""}
                      onChange={handleLanguagesChange}
                      placeholder="English, Arabic, Hausa, etc. (comma separated)"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="social">
              <Card>
                <CardHeader>
                  <CardTitle>Social & Contact Information</CardTitle>
                  <CardDescription>How pilgrims can reach you</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="phoneNumber">Phone Number</Label>
                      <Input
                        id="phoneNumber"
                        value={profile.phoneNumber}
                        onChange={(e) => setProfile({ ...profile, phoneNumber: e.target.value })}
                        placeholder="+234 800 123 4567"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="alternativeEmail">Contact Email</Label>
                      <Input
                        id="alternativeEmail"
                        type="email"
                        value={profile.alternativeEmail}
                        onChange={(e) => setProfile({ ...profile, alternativeEmail: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Social Media</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="facebook">Facebook</Label>
                        <Input
                          id="facebook"
                          value={profile.socialMedia?.facebook || ""}
                          onChange={(e) =>
                            setProfile({
                              ...profile,
                              socialMedia: { ...profile.socialMedia, facebook: e.target.value },
                            })
                          }
                          placeholder="https://facebook.com/youragency"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="twitter">Twitter</Label>
                        <Input
                          id="twitter"
                          value={profile.socialMedia?.twitter || ""}
                          onChange={(e) =>
                            setProfile({
                              ...profile,
                              socialMedia: { ...profile.socialMedia, twitter: e.target.value },
                            })
                          }
                          placeholder="https://twitter.com/youragency"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="instagram">Instagram</Label>
                        <Input
                          id="instagram"
                          value={profile.socialMedia?.instagram || ""}
                          onChange={(e) =>
                            setProfile({
                              ...profile,
                              socialMedia: { ...profile.socialMedia, instagram: e.target.value },
                            })
                          }
                          placeholder="https://instagram.com/youragency"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="linkedin">LinkedIn</Label>
                        <Input
                          id="linkedin"
                          value={profile.socialMedia?.linkedin || ""}
                          onChange={(e) =>
                            setProfile({
                              ...profile,
                              socialMedia: { ...profile.socialMedia, linkedin: e.target.value },
                            })
                          }
                          placeholder="https://linkedin.com/company/youragency"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Settings</CardTitle>
                  <CardDescription>Configure your public profile settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="publicProfile">Public Profile</Label>
                      <p className="text-sm text-muted-foreground">Make your agency profile visible to the public</p>
                    </div>
                    <Switch
                      id="publicProfile"
                      checked={profile.publicProfile}
                      onCheckedChange={(checked) => setProfile({ ...profile, publicProfile: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="showContactInfo">Show Contact Information</Label>
                      <p className="text-sm text-muted-foreground">
                        Display your phone number and email on your public profile
                      </p>
                    </div>
                    <Switch
                      id="showContactInfo"
                      checked={profile.showContactInfo !== false}
                      onCheckedChange={(checked) => setProfile({ ...profile, showContactInfo: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="showSocialMedia">Show Social Media</Label>
                      <p className="text-sm text-muted-foreground">
                        Display your social media links on your public profile
                      </p>
                    </div>
                    <Switch
                      id="showSocialMedia"
                      checked={profile.showSocialMedia !== false}
                      onCheckedChange={(checked) => setProfile({ ...profile, showSocialMedia: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="allowReviews">Allow Reviews</Label>
                      <p className="text-sm text-muted-foreground">Let pilgrims leave reviews on your public profile</p>
                    </div>
                    <Switch
                      id="allowReviews"
                      checked={profile.allowReviews !== false}
                      onCheckedChange={(checked) => setProfile({ ...profile, allowReviews: checked })}
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <p className="text-sm text-muted-foreground">
                    Your public profile is available at:{" "}
                    <Link href={`/agency/${user?.uid}`} className="text-primary hover:underline" target="_blank">
                      {`${window.location.origin}/agency/${user?.uid}`}
                    </Link>
                  </p>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}
