"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Check, Eye, Filter, CreditCard, Clock, ArrowUpRight, DollarSign } from "lucide-react"
import { getAllPayments, confirmPayment } from "@/lib/firebase/admin"
import { sendWebhook } from "@/lib/webhooks"
import ProtectedRoute from "@/components/protected-route"
import DashboardLayout from "@/components/dashboard-layout"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function AdminPaymentsPage() {
  const [loading, setLoading] = useState(true)
  const [payments, setPayments] = useState<any[]>([])
  const [filteredPayments, setFilteredPayments] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filter, setFilter] = useState("all")
  const [selectedPayment, setSelectedPayment] = useState<any>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false)
  const { toast } = useToast()

  // Discord webhook URL for payment confirmation
  const PAYMENT_WEBHOOK_URL =
    "https://discordapp.com/api/webhooks/1374113424342253639/nKKL1zQU7rQpDFuFP0vwoEIKLmvbShsYbQWWSg-cMkwag6qZtXHiBvnuBU5ObRli1hbt"

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoading(true)
        const allPayments = await getAllPayments()
        setPayments(allPayments)
        setFilteredPayments(allPayments)
      } catch (error) {
        console.error("Error fetching payments:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchPayments()
  }, [])

  useEffect(() => {
    // Filter payments based on search term and filter
    const filterPayments = () => {
      let filtered = payments

      // Apply status filter
      if (filter === "pending") {
        filtered = filtered.filter((payment) => payment.status === "pending")
      } else if (filter === "confirmed") {
        filtered = filtered.filter((payment) => payment.status === "confirmed")
      }

      // Apply search term
      if (searchTerm) {
        filtered = filtered.filter(
          (payment) =>
            payment.paymentId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            payment.pilgrimName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            payment.pilgrimEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            payment.agencyName?.toLowerCase().includes(searchTerm.toLowerCase()),
        )
      }

      setFilteredPayments(filtered)
    }

    filterPayments()
  }, [searchTerm, filter, payments])

  const handleViewPayment = (payment: any) => {
    setSelectedPayment(payment)
    setIsViewDialogOpen(true)
  }

  const handleConfirmPayment = (payment: any) => {
    setSelectedPayment(payment)
    setIsConfirmDialogOpen(true)
  }

  const confirmTransferPayment = async () => {
    try {
      await confirmPayment(selectedPayment.paymentId, selectedPayment.bookingId)

      // Update local state
      setPayments((prevPayments) =>
        prevPayments.map((payment) =>
          payment.paymentId === selectedPayment.paymentId ? { ...payment, status: "confirmed" } : payment,
        ),
      )

      // Send webhook notification
      await sendWebhook(PAYMENT_WEBHOOK_URL, {
        content: `**Payment Confirmed**`,
        embeds: [
          {
            title: "Payment Confirmed",
            description: `A payment has been confirmed by admin.`,
            color: 0x00ff00,
            fields: [
              {
                name: "Payment ID",
                value: selectedPayment.paymentId || "Unknown",
                inline: true,
              },
              {
                name: "Amount",
                value: `₦${selectedPayment.amount?.toLocaleString() || "0"}`,
                inline: true,
              },
              {
                name: "Pilgrim",
                value: selectedPayment.pilgrimName || selectedPayment.pilgrimEmail || "Unknown",
                inline: true,
              },
              {
                name: "Payment Method",
                value: selectedPayment.method || "Bank Transfer",
                inline: true,
              },
            ],
            timestamp: new Date().toISOString(),
          },
        ],
      })

      toast({
        title: "Payment confirmed",
        description: `Payment #${selectedPayment.paymentId?.substring(0, 8)} has been confirmed.`,
        variant: "default",
      })

      setIsConfirmDialogOpen(false)
      setIsViewDialogOpen(false)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to confirm payment",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <DashboardLayout userType="admin" title="Payment Management" description="Manage all payments on the platform">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <ProtectedRoute allowedRoles={["admin"]} requiredRole="admin">
      <DashboardLayout userType="admin" title="Payment Management" description="Manage all payments on the platform">
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <h1 className="text-3xl font-bold">Payment Management</h1>
          </div>

          {/* Payment Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Payments</p>
                    <p className="text-2xl font-bold">{payments.length}</p>
                  </div>
                  <CreditCard className="h-8 w-8 text-blue-500" />
                </div>
                <div className="flex items-center mt-2 text-xs text-green-600">
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                  <span>22% increase</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Pending Confirmation</p>
                    <p className="text-2xl font-bold">{payments.filter((p) => p.status === "pending").length}</p>
                  </div>
                  <Clock className="h-8 w-8 text-amber-500" />
                </div>
                <div className="flex items-center mt-2 text-xs text-amber-600">
                  <span>Needs attention</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Confirmed Payments</p>
                    <p className="text-2xl font-bold">{payments.filter((p) => p.status === "confirmed").length}</p>
                  </div>
                  <Check className="h-8 w-8 text-green-500" />
                </div>
                <div className="flex items-center mt-2 text-xs text-green-600">
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                  <span>18% increase</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Revenue</p>
                    <p className="text-2xl font-bold">
                      ₦{payments.reduce((sum, p) => sum + (p.amount || 0), 0).toLocaleString()}
                    </p>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-500" />
                </div>
                <div className="flex items-center mt-2 text-xs text-green-600">
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                  <span>25% increase</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="col-span-2 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search payments by ID, pilgrim or agency..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger>
                <span className="flex items-center">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Filter" />
                </span>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Payments</SelectItem>
                <SelectItem value="pending">Pending Only</SelectItem>
                <SelectItem value="confirmed">Confirmed Only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Tabs defaultValue="list" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="list">List View</TabsTrigger>
              <TabsTrigger value="grid">Grid View</TabsTrigger>
            </TabsList>

            <TabsContent value="list">
              <Card>
                <CardHeader>
                  <CardTitle>Payments</CardTitle>
                  <CardDescription>
                    {filteredPayments.length} {filteredPayments.length === 1 ? "payment" : "payments"} found
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <div className="grid grid-cols-6 bg-gray-100 p-4 font-medium">
                      <div>Payment ID</div>
                      <div>Pilgrim</div>
                      <div>Amount</div>
                      <div>Date</div>
                      <div>Status</div>
                      <div className="text-right">Actions</div>
                    </div>
                    <div className="divide-y">
                      {filteredPayments.length === 0 ? (
                        <div className="p-4 text-center text-muted-foreground">No payments found</div>
                      ) : (
                        filteredPayments.map((payment) => (
                          <div key={payment.paymentId} className="grid grid-cols-6 p-4 items-center">
                            <div className="font-medium">#{payment.paymentId?.substring(0, 8) || "Unknown"}</div>
                            <div className="text-sm">
                              {payment.pilgrimName || payment.pilgrimEmail || "Unknown Pilgrim"}
                            </div>
                            <div className="font-medium">₦{payment.amount?.toLocaleString() || "0"}</div>
                            <div className="text-sm text-muted-foreground">
                              {payment.date ? new Date(payment.date).toLocaleDateString() : "Unknown"}
                            </div>
                            <div>
                              <Badge
                                variant={payment.status === "confirmed" ? "default" : "secondary"}
                                className={payment.status === "confirmed" ? "bg-green-100 text-green-800" : ""}
                              >
                                {payment.status === "confirmed" ? "Confirmed" : "Pending"}
                              </Badge>
                            </div>
                            <div className="flex justify-end gap-2">
                              <Button variant="outline" size="sm" onClick={() => handleViewPayment(payment)}>
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Button>
                              {payment.status !== "confirmed" && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-green-600 border-green-600"
                                  onClick={() => handleConfirmPayment(payment)}
                                >
                                  <Check className="h-4 w-4 mr-1" />
                                  Confirm
                                </Button>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="grid">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPayments.length === 0 ? (
                  <div className="col-span-3 p-4 text-center text-muted-foreground">No payments found</div>
                ) : (
                  filteredPayments.map((payment) => (
                    <Card key={payment.paymentId} className="overflow-hidden">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-lg">
                            Payment #{payment.paymentId?.substring(0, 8) || "Unknown"}
                          </CardTitle>
                          <Badge
                            variant={payment.status === "confirmed" ? "default" : "secondary"}
                            className={payment.status === "confirmed" ? "bg-green-100 text-green-800" : ""}
                          >
                            {payment.status === "confirmed" ? "Confirmed" : "Pending"}
                          </Badge>
                        </div>
                        <CardDescription>{payment.pilgrimEmail}</CardDescription>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <div className="space-y-2">
                          <div className="text-sm">
                            <span className="text-muted-foreground">Pilgrim: </span>
                            {payment.pilgrimName || "Not provided"}
                          </div>
                          <div className="text-sm">
                            <span className="text-muted-foreground">Amount: </span>
                            <span className="font-medium">₦{payment.amount?.toLocaleString() || "0"}</span>
                          </div>
                          <div className="text-sm">
                            <span className="text-muted-foreground">Method: </span>
                            {payment.method || "Bank Transfer"}
                          </div>
                          <div className="text-sm">
                            <span className="text-muted-foreground">Date: </span>
                            {payment.date ? new Date(payment.date).toLocaleDateString() : "Unknown"}
                          </div>
                        </div>
                      </CardContent>
                      <div className="flex justify-end gap-2 p-4 pt-0">
                        <Button variant="outline" size="sm" onClick={() => handleViewPayment(payment)}>
                          <Eye className="h-4 w-4 mr-1" /> View
                        </Button>
                        {payment.status !== "confirmed" && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-green-600 border-green-600"
                            onClick={() => handleConfirmPayment(payment)}
                          >
                            <Check className="h-4 w-4 mr-1" /> Confirm
                          </Button>
                        )}
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>

          {/* View Payment Dialog */}
          <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Payment Details</DialogTitle>
                <DialogDescription>Detailed information about the payment</DialogDescription>
              </DialogHeader>
              {selectedPayment && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Payment Information</h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-muted-foreground">Payment ID</p>
                        <p className="font-medium">#{selectedPayment.paymentId?.substring(0, 8) || "Unknown"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Amount</p>
                        <p className="font-medium">₦{selectedPayment.amount?.toLocaleString() || "0"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Payment Method</p>
                        <p>{selectedPayment.method || "Bank Transfer"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Date</p>
                        <p>{selectedPayment.date ? new Date(selectedPayment.date).toLocaleDateString() : "Unknown"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Status</p>
                        <Badge
                          variant={selectedPayment.status === "confirmed" ? "default" : "secondary"}
                          className={selectedPayment.status === "confirmed" ? "bg-green-100 text-green-800" : ""}
                        >
                          {selectedPayment.status === "confirmed" ? "Confirmed" : "Pending"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Pilgrim & Booking Details</h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-muted-foreground">Pilgrim Name</p>
                        <p>{selectedPayment.pilgrimName || "Not provided"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Pilgrim Email</p>
                        <p>{selectedPayment.pilgrimEmail || "Not provided"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Booking ID</p>
                        <p>{selectedPayment.bookingId || "Not linked"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Agency</p>
                        <p>{selectedPayment.agencyName || "Unknown Agency"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Package</p>
                        <p>{selectedPayment.packageName || "Not specified"}</p>
                      </div>
                    </div>
                  </div>
                  {selectedPayment.transferDetails && (
                    <div className="col-span-1 md:col-span-2">
                      <h3 className="text-lg font-semibold mb-2">Transfer Details</h3>
                      <div className="p-3 bg-gray-50 rounded-md border">
                        <p className="text-sm">{selectedPayment.transferDetails}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
              <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
                <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                  Close
                </Button>
                {selectedPayment && selectedPayment.status !== "confirmed" && (
                  <Button
                    variant="outline"
                    className="text-green-600 border-green-600"
                    onClick={() => {
                      setIsViewDialogOpen(false)
                      setIsConfirmDialogOpen(true)
                    }}
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Confirm Payment
                  </Button>
                )}
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Confirm Payment Dialog */}
          <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirm Payment</DialogTitle>
                <DialogDescription>
                  Are you sure you want to confirm this payment? This action will mark the payment as confirmed.
                </DialogDescription>
              </DialogHeader>
              {selectedPayment && (
                <div className="py-4">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-sm text-muted-foreground">Payment ID</p>
                      <p className="font-medium">#{selectedPayment.paymentId?.substring(0, 8) || "Unknown"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Amount</p>
                      <p className="font-medium">₦{selectedPayment.amount?.toLocaleString() || "0"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Pilgrim</p>
                      <p>{selectedPayment.pilgrimName || selectedPayment.pilgrimEmail || "Unknown"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Method</p>
                      <p>{selectedPayment.method || "Bank Transfer"}</p>
                    </div>
                  </div>
                </div>
              )}
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsConfirmDialogOpen(false)}>
                  Cancel
                </Button>
                <Button variant="default" onClick={confirmTransferPayment}>
                  Confirm Payment
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}
