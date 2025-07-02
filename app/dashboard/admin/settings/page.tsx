"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/context/auth-context"
import ProtectedRoute from "@/components/protected-route"
import DashboardLayout from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"
import { getAdminSettings, updateAdminSettings } from "@/lib/firebase/admin"
import { Loader2, Save } from "lucide-react"

export default function AdminSettingsPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState({
    siteName: "",
    siteDescription: "",
    contactEmail: "",
    contactPhone: "",
    enableAgencyRegistration: true,
    enablePublicPackages: true,
    maintenanceMode: false,
    discordWebhookUrl: "",
    paymentGateway: "paystack",
    paystackPublicKey: "",
    paystackSecretKey: "",
    adminEmail: "",
    supportEmail: "",
    logoUrl: "",
    faviconUrl: "",
    primaryColor: "#0066cc",
    secondaryColor: "#f59e0b",
    termsUrl: "",
    privacyUrl: "",
    refundUrl: "",
  })

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true)
        const adminSettings = await getAdminSettings()
        setSettings((prev) => ({ ...prev, ...adminSettings }))
      } catch (error) {
        console.error("Error fetching settings:", error)
        toast({
          title: "Error",
          description: "Failed to load settings. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchSettings()
    }
  }, [user, toast])

  const handleSaveSettings = async () => {
    try {
      setSaving(true)
      await updateAdminSettings(settings)
      toast({
        title: "Success",
        description: "Settings saved successfully.",
      })
    } catch (error) {
      console.error("Error saving settings:", error)
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <ProtectedRoute requiredRole="admin">
        <DashboardLayout userType="admin">
          <div className="flex items-center justify-center min-h-[60vh]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute requiredRole="admin">
      <DashboardLayout userType="admin">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Admin Settings</h1>
              <p className="text-muted-foreground">Configure system-wide settings for Al-Mutamir</p>
            </div>
            <Button onClick={handleSaveSettings} disabled={saving}>
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save Settings
            </Button>
          </div>

          <Tabs defaultValue="general" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="appearance">Appearance</TabsTrigger>
              <TabsTrigger value="payments">Payments</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
            </TabsList>

            <TabsContent value="general">
              <Card>
                <CardHeader>
                  <CardTitle>General Settings</CardTitle>
                  <CardDescription>Configure basic information about your platform</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="siteName">Site Name</Label>
                      <Input
                        id="siteName"
                        value={settings.siteName}
                        onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="adminEmail">Admin Email</Label>
                      <Input
                        id="adminEmail"
                        type="email"
                        value={settings.adminEmail}
                        onChange={(e) => setSettings({ ...settings, adminEmail: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="siteDescription">Site Description</Label>
                    <Textarea
                      id="siteDescription"
                      value={settings.siteDescription}
                      onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="contactEmail">Contact Email</Label>
                      <Input
                        id="contactEmail"
                        type="email"
                        value={settings.contactEmail}
                        onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contactPhone">Contact Phone</Label>
                      <Input
                        id="contactPhone"
                        value={settings.contactPhone}
                        onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value })}
                      />
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Platform Settings</h3>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="enableAgencyRegistration">Enable Agency Registration</Label>
                        <p className="text-sm text-muted-foreground">Allow new agencies to register on the platform</p>
                      </div>
                      <Switch
                        id="enableAgencyRegistration"
                        checked={settings.enableAgencyRegistration}
                        onCheckedChange={(checked) => setSettings({ ...settings, enableAgencyRegistration: checked })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="enablePublicPackages">Enable Public Packages</Label>
                        <p className="text-sm text-muted-foreground">
                          Allow packages to be visible to the public without login
                        </p>
                      </div>
                      <Switch
                        id="enablePublicPackages"
                        checked={settings.enablePublicPackages}
                        onCheckedChange={(checked) => setSettings({ ...settings, enablePublicPackages: checked })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="maintenanceMode" className="text-red-500 font-medium">
                          Maintenance Mode
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Put the site in maintenance mode (only admins can access)
                        </p>
                      </div>
                      <Switch
                        id="maintenanceMode"
                        checked={settings.maintenanceMode}
                        onCheckedChange={(checked) => setSettings({ ...settings, maintenanceMode: checked })}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="appearance">
              <Card>
                <CardHeader>
                  <CardTitle>Appearance Settings</CardTitle>
                  <CardDescription>Customize the look and feel of your platform</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="logoUrl">Logo URL</Label>
                      <Input
                        id="logoUrl"
                        value={settings.logoUrl}
                        onChange={(e) => setSettings({ ...settings, logoUrl: e.target.value })}
                        placeholder="https://example.com/logo.png"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="faviconUrl">Favicon URL</Label>
                      <Input
                        id="faviconUrl"
                        value={settings.faviconUrl}
                        onChange={(e) => setSettings({ ...settings, faviconUrl: e.target.value })}
                        placeholder="https://example.com/favicon.ico"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="primaryColor">Primary Color</Label>
                      <div className="flex gap-2">
                        <Input
                          id="primaryColor"
                          value={settings.primaryColor}
                          onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                        />
                        <div
                          className="w-10 h-10 rounded border"
                          style={{ backgroundColor: settings.primaryColor }}
                        ></div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="secondaryColor">Secondary Color</Label>
                      <div className="flex gap-2">
                        <Input
                          id="secondaryColor"
                          value={settings.secondaryColor}
                          onChange={(e) => setSettings({ ...settings, secondaryColor: e.target.value })}
                        />
                        <div
                          className="w-10 h-10 rounded border"
                          style={{ backgroundColor: settings.secondaryColor }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Legal Pages</h3>
                    <div className="space-y-2">
                      <Label htmlFor="termsUrl">Terms of Service URL</Label>
                      <Input
                        id="termsUrl"
                        value={settings.termsUrl}
                        onChange={(e) => setSettings({ ...settings, termsUrl: e.target.value })}
                        placeholder="/terms"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="privacyUrl">Privacy Policy URL</Label>
                      <Input
                        id="privacyUrl"
                        value={settings.privacyUrl}
                        onChange={(e) => setSettings({ ...settings, privacyUrl: e.target.value })}
                        placeholder="/privacy"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="refundUrl">Refund Policy URL</Label>
                      <Input
                        id="refundUrl"
                        value={settings.refundUrl}
                        onChange={(e) => setSettings({ ...settings, refundUrl: e.target.value })}
                        placeholder="/refund"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="payments">
              <Card>
                <CardHeader>
                  <CardTitle>Payment Settings</CardTitle>
                  <CardDescription>Configure payment gateways and options</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="paymentGateway">Payment Gateway</Label>
                    <select
                      id="paymentGateway"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={settings.paymentGateway}
                      onChange={(e) => setSettings({ ...settings, paymentGateway: e.target.value })}
                    >
                      <option value="paystack">Paystack</option>
                      <option value="flutterwave">Flutterwave</option>
                      <option value="stripe">Stripe</option>
                      <option value="manual">Manual Payment</option>
                    </select>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Paystack Configuration</h3>
                    <div className="space-y-2">
                      <Label htmlFor="paystackPublicKey">Paystack Public Key</Label>
                      <Input
                        id="paystackPublicKey"
                        value={settings.paystackPublicKey}
                        onChange={(e) => setSettings({ ...settings, paystackPublicKey: e.target.value })}
                        placeholder="pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="paystackSecretKey">Paystack Secret Key</Label>
                      <Input
                        id="paystackSecretKey"
                        type="password"
                        value={settings.paystackSecretKey}
                        onChange={(e) => setSettings({ ...settings, paystackSecretKey: e.target.value })}
                        placeholder="sk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notifications">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Settings</CardTitle>
                  <CardDescription>Configure how notifications are sent</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="discordWebhookUrl">Discord Webhook URL</Label>
                    <Input
                      id="discordWebhookUrl"
                      value={settings.discordWebhookUrl}
                      onChange={(e) => setSettings({ ...settings, discordWebhookUrl: e.target.value })}
                      placeholder="https://discord.com/api/webhooks/..."
                    />
                    <p className="text-sm text-muted-foreground">
                      Receive notifications about important events in your Discord server
                    </p>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label htmlFor="supportEmail">Support Email</Label>
                    <Input
                      id="supportEmail"
                      type="email"
                      value={settings.supportEmail}
                      onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                      placeholder="support@example.com"
                    />
                    <p className="text-sm text-muted-foreground">Email address for support inquiries</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security">
              <Card>
                <CardHeader>
                  <CardTitle>Security Settings</CardTitle>
                  <CardDescription>Configure security options for your platform</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="requireEmailVerification">Require Email Verification</Label>
                        <p className="text-sm text-muted-foreground">
                          Require users to verify their email before accessing the platform
                        </p>
                      </div>
                      <Switch
                        id="requireEmailVerification"
                        checked={settings.requireEmailVerification}
                        onCheckedChange={(checked) => setSettings({ ...settings, requireEmailVerification: checked })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="enableTwoFactorAuth">Enable Two-Factor Authentication</Label>
                        <p className="text-sm text-muted-foreground">
                          Allow users to enable two-factor authentication for their accounts
                        </p>
                      </div>
                      <Switch
                        id="enableTwoFactorAuth"
                        checked={settings.enableTwoFactorAuth}
                        onCheckedChange={(checked) => setSettings({ ...settings, enableTwoFactorAuth: checked })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="autoVerifyAgencies">Auto-Verify Agencies</Label>
                        <p className="text-sm text-muted-foreground">
                          Automatically verify new agencies (not recommended for production)
                        </p>
                      </div>
                      <Switch
                        id="autoVerifyAgencies"
                        checked={settings.autoVerifyAgencies}
                        onCheckedChange={(checked) => setSettings({ ...settings, autoVerifyAgencies: checked })}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}
