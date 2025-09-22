"use client"

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Eye, Filter, Clock, ArrowUpRight, Users, Edit } from "lucide-react";
import { getAllBookings, getBookingById, updateBooking } from "@/lib/firebase/admin";
import ProtectedRoute from "@/components/protected-route";
import DashboardLayout from "@/components/dashboard-layout";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AdminBookingsPage() {
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<any[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<any[]>([]);
    // New: Delete booking loading state
    const [deletingId, setDeletingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");
  const [packageFilter, setPackageFilter] = useState("");
  const [groupFilter, setGroupFilter] = useState("all");
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editStatus, setEditStatus] = useState("");
  const [editAmount, setEditAmount] = useState("");
  const { toast } = useToast();
  // Grid pagination hooks
  const pageSize = 6;
  const [gridPage, setGridPage] = useState(1);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        const allBookings = await getAllBookings();
        setBookings(allBookings);
        setFilteredBookings(allBookings);
      } catch (error) {
        console.error("Error fetching bookings:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  useEffect(() => {
    let filtered = bookings;
    if (filter !== "all") {
      filtered = filtered.filter((booking) => (booking.paymentStatus ?? booking.status ?? "") === filter);
    }
    if (dateFilter) {
      filtered = filtered.filter((booking) => {
        if (!booking.travelDate) return false;
        const d = new Date(booking.travelDate);
        return `${d.getMonth() + 1}/${d.getFullYear()}` === dateFilter;
      });
    }
    if (packageFilter) {
      filtered = filtered.filter((booking) => booking.packageTitle && (booking.packageTitle.charAt(0).toUpperCase() + booking.packageTitle.slice(1).toLowerCase()) === packageFilter);
    }
    if (groupFilter !== "all") {
      filtered = filtered.filter((booking) =>
        groupFilter === "group" ? (booking.pilgrims?.length > 1) : (booking.pilgrims?.length === 1)
      );
    }
    if (searchTerm) {
      filtered = filtered.filter(
        (booking) =>
          booking.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          booking.pilgrims?.some((p: any) =>
            p.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.email?.toLowerCase().includes(searchTerm.toLowerCase())
          )
      );
    }
    setFilteredBookings(filtered);
  }, [searchTerm, filter, bookings, dateFilter, packageFilter, groupFilter]);

  const handleViewBooking = async (booking: any) => {
    setLoading(true);
    try {
      const latestBooking = await getBookingById(booking.id || booking.uid);
      setSelectedBooking(latestBooking || booking);
      setIsViewDialogOpen(true);
    } catch (error) {
      setSelectedBooking(booking);
      setIsViewDialogOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handleEditBooking = async (booking: any) => {
    setLoading(true);
    try {
      const latestBooking = await getBookingById(booking.id || booking.uid);
      setSelectedBooking(latestBooking || booking);
      setEditStatus(
        typeof latestBooking === "object" && latestBooking !== null && ("paymentStatus" in latestBooking || "status" in latestBooking)
          ? (("paymentStatus" in latestBooking ? (latestBooking as any).paymentStatus : (latestBooking as any).status) ?? "")
          : (typeof booking === "object" && booking !== null && ("paymentStatus" in booking || "status" in booking)
            ? ("paymentStatus" in booking ? (booking as any).paymentStatus : (booking as any).status) ?? ""
            : "")
      );
      setEditAmount(
        typeof latestBooking === "object" && latestBooking !== null && "amountPaid" in latestBooking
          ? ((latestBooking as any).amountPaid?.toString() || "")
          : (typeof booking === "object" && booking !== null && "amountPaid" in booking
            ? (booking as any).amountPaid?.toString() || ""
            : "")
      );
      setIsEditDialogOpen(true);
    } catch (error) {
      setSelectedBooking(booking);
      setEditStatus(booking.paymentStatus ?? booking.status ?? "");
      setEditAmount(booking.amountPaid?.toString() || "");
      setIsEditDialogOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEdit = async () => {
    setLoading(true);
    try {
      // Use the new updateBooking function to update Firestore
      await updateBooking(selectedBooking.id || selectedBooking.uid, {
        paymentStatus: editStatus,
        amountPaid: Number(editAmount),
      });
      // Refetch the updated booking
      const updatedBooking = await getBookingById(selectedBooking.id || selectedBooking.uid);
      setBookings((prev) =>
        prev.map((b) =>
          (b.id || b.uid) === (selectedBooking.id || selectedBooking.uid)
            ? updatedBooking
            : b
        )
      );
      toast({ title: "Booking updated", description: "Status and amount updated successfully." });
      setIsEditDialogOpen(false);
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to update booking.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };
    // New: Delete booking handler
    const handleDeleteBooking = async (bookingId: string) => {
      if (!window.confirm("Are you sure you want to delete this booking? This action cannot be undone.")) return;
      setDeletingId(bookingId);
      try {
        // Dynamically import Firestore delete logic
        const { deleteBooking } = await import("@/lib/firebase/admin");
        await deleteBooking(bookingId);
        setBookings((prev) => prev.filter((b) => (b.id || b.uid) !== bookingId));
        setFilteredBookings((prev) => prev.filter((b) => (b.id || b.uid) !== bookingId));
        toast({ title: "Booking deleted", description: "The booking has been deleted." });
        // Close dialogs if open for deleted booking
        if (selectedBooking && (selectedBooking.id || selectedBooking.uid) === bookingId) {
          setIsViewDialogOpen(false);
          setIsEditDialogOpen(false);
          setSelectedBooking(null);
        }
      } catch (error: any) {
        toast({ title: "Error", description: error.message || "Failed to delete booking.", variant: "destructive" });
      } finally {
        setDeletingId(null);
      }
    };

  if (loading) {
    return (
      <DashboardLayout userType="admin" title="Booking Management" description="Manage all bookings on the platform">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <ProtectedRoute allowedRoles={["admin"]} requiredRole="admin">
      <DashboardLayout userType="admin" title="Booking Management" description="Manage all bookings on the platform">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <h1 className="text-3xl font-bold">Booking Management</h1>
          </div>
          {/* Booking Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Bookings</p>
                    <p className="text-2xl font-bold">{bookings.length}</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-500" />
                </div>
                <div className="flex items-center mt-2 text-xs text-green-600">
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                  <span>12% increase</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Unpaid</p>
                    <p className="text-2xl font-bold">{bookings.filter((b) => (b.paymentStatus ?? b.status ?? "") === "unpaid").length}</p>
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
                    <p className="text-sm text-muted-foreground">Paid</p>
                    <p className="text-2xl font-bold">{bookings.filter((b) => (b.paymentStatus ?? b.status ?? "") === "paid").length}</p>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Paid</Badge>
                </div>
                <div className="flex items-center mt-2 text-xs text-green-600">
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                  <span>8% increase</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between flex-wrap">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Revenue</p>
                    <p className="text-2xl font-bold break-words">
                      ₦{bookings.reduce((sum, b) => sum + (b.amountPaid || 0), 0).toLocaleString()}
                    </p>
                  </div>
                  <Badge className="bg-green-100 text-green-800 whitespace-nowrap">Revenue</Badge>
                </div>
                <div className="flex items-center mt-2 text-xs text-green-600">
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                  <span>15% increase</span>
                </div>
              </CardContent>
            </Card>
          </div>
          {/* Filters */}
          {/* New Filter UI: 2 bars */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
            {/* Filter type selector */}
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger>
                <span className="flex items-center">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Select filter type" />
                </span>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="search">Search</SelectItem>
                <SelectItem value="paymentStatus">Payment Status</SelectItem>
                <SelectItem value="date">Month/Year</SelectItem>
                <SelectItem value="package">Package</SelectItem>
                <SelectItem value="group">Group/Individual</SelectItem>
              </SelectContent>
            </Select>
            {/* Filter value bar */}
            {filter === "search" && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search by name or email..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            )}
            {filter === "paymentStatus" && (
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Select payment status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Payment Status</SelectItem>
                  <SelectItem value="unpaid">Unpaid</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="partial payment">Partial Payment</SelectItem>
                  <SelectItem value="complete">Complete</SelectItem>
                </SelectContent>
              </Select>
            )}
            {filter === "date" && (
              <Select value={dateFilter} onValueChange={v => setDateFilter(v === 'all-dates' ? '' : v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select month/year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-dates">All Dates</SelectItem>
                  {Array.from(new Set(bookings.map(b => {
                    if (!b.travelDate) return null;
                    const d = new Date(b.travelDate);
                    return `${d.getMonth() + 1}/${d.getFullYear()}`;
                  }))).filter(Boolean).map(date => (
                    <SelectItem key={date} value={date}>{date}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {filter === "package" && (
              <Select value={packageFilter} onValueChange={v => setPackageFilter(v === 'all-packages' ? '' : v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select package" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-packages">All Packages</SelectItem>
                  {Array.from(new Set(bookings.map(b => b.packageTitle))).filter(Boolean).map(pkg => (
                    <SelectItem key={pkg} value={pkg}>{pkg.charAt(0).toUpperCase() + pkg.slice(1).toLowerCase()}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {filter === "group" && (
              <Select value={groupFilter} onValueChange={setGroupFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Select group/individual" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="group">Group</SelectItem>
                  <SelectItem value="individual">Individual</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
          {/* Tabs */}
          {/* Tabs with dropdown for mobile */}
            <Tabs defaultValue="grid" className="w-full">
              {/* Only show grid view on mobile */}
              <TabsList className="hidden md:grid w-full grid-cols-2">
                <TabsTrigger value="list">List View</TabsTrigger>
                <TabsTrigger value="grid">Grid View</TabsTrigger>
              </TabsList>
              <TabsContent value="grid">
                {/* Pagination logic for grid view - hooks moved to component body */}
                {(() => {
                  const totalPages = Math.ceil(filteredBookings.length / pageSize);
                  const paginatedBookings = filteredBookings.slice((gridPage - 1) * pageSize, gridPage * pageSize);
                  return (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {paginatedBookings.length === 0 ? (
                          <div className="col-span-3 p-4 text-center text-muted-foreground">No bookings found</div>
                        ) : (
                          paginatedBookings.map((booking) => {
                            return (
                              <Card key={booking.id || booking.uid} className="overflow-hidden bg-white">
                                <CardHeader className="pb-2">
                                  <div className="flex justify-between items-start">
                                    <CardTitle className="text-lg">
                                      {booking.packageTitle ? booking.packageTitle.charAt(0).toUpperCase() + booking.packageTitle.slice(1).toLowerCase() : "Unknown Package"}
                                    </CardTitle>
                                    <Badge
                                      variant={booking.paymentStatus === "paid" ? "default" : "secondary"}
                                      className={booking.paymentStatus === "paid" ? "bg-green-100 text-green-800" : ""}
                                    >
                                      {booking.paymentStatus ? booking.paymentStatus.charAt(0).toUpperCase() + booking.paymentStatus.slice(1).toLowerCase() : "Unpaid"}
                                    </Badge>
                                  </div>
                                  <CardDescription>{booking.userEmail}</CardDescription>
                                </CardHeader>
                                <CardContent className="pb-2">
                                  <div className="space-y-2">
                                    <div className="text-sm">
                                      <span className="text-muted-foreground">Pilgrim: </span>
                                      {booking.pilgrims && booking.pilgrims.length > 0
                                        ? `${booking.pilgrims[0].firstName || ""} ${booking.pilgrims[0].lastName || ""}`
                                        : "Unknown"}
                                    </div>
                                    <div className="text-sm">
                                      <span className="text-muted-foreground">Total Price: </span>
                                      <span className="font-medium">₦{booking.totalPrice?.toLocaleString() || "0"}</span>
                                    </div>
                                    <div className="text-sm">
                                      <span className="text-muted-foreground">Travel Date: </span>
                                      {booking.travelDate || "Unknown"}
                                    </div>
                                  </div>
                                </CardContent>
                                <div className="flex justify-end gap-2 p-4 pt-0">
                                  <Button variant="outline" size="sm" onClick={() => handleViewBooking(booking)}>
                                    <Eye className="h-4 w-4 mr-1" /> View
                                  </Button>
                                  <Button variant="outline" size="sm" onClick={() => handleEditBooking(booking)}>
                                    <Edit className="h-4 w-4 mr-1" /> Edit
                                  </Button>
                                    <Button
                                      variant="destructive"
                                      size="sm"
                                      disabled={deletingId === (booking.id || booking.uid)}
                                      onClick={() => handleDeleteBooking(booking.id || booking.uid)}
                                    >
                                      {deletingId === (booking.id || booking.uid) ? "Deleting..." : "Delete"}
                                    </Button>
                                </div>
                              </Card>
                            );
                          })
                        )}
                      </div>
                      {/* Pagination controls */}
                      {totalPages > 1 && (
                        <div className="flex justify-center items-center gap-2 mt-6">
                          <Button variant="outline" size="sm" disabled={gridPage === 1} onClick={() => setGridPage(gridPage - 1)}>
                            Previous
                          </Button>
                          <span className="text-sm">Page {gridPage} of {totalPages}</span>
                          <Button variant="outline" size="sm" disabled={gridPage === totalPages} onClick={() => setGridPage(gridPage + 1)}>
                            Next
                          </Button>
                        </div>
                      )}
                    </>
                  );
                })()}
              </TabsContent>
            <TabsContent value="grid">
              {/* Pagination logic for grid view - hooks moved to component body */}
              {(() => {
                const totalPages = Math.ceil(filteredBookings.length / pageSize);
                const paginatedBookings = filteredBookings.slice((gridPage - 1) * pageSize, gridPage * pageSize);
                return (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {paginatedBookings.length === 0 ? (
                        <div className="col-span-3 p-4 text-center text-muted-foreground">No bookings found</div>
                      ) : (
                        paginatedBookings.map((booking) => {
                          return (
                            <Card key={booking.id || booking.uid} className="overflow-hidden bg-white">
                              <CardHeader className="pb-2">
                                <div className="flex justify-between items-start">
                                  <CardTitle className="text-lg">
                                    {booking.packageTitle ? booking.packageTitle.charAt(0).toUpperCase() + booking.packageTitle.slice(1).toLowerCase() : "Unknown Package"}
                                  </CardTitle>
                                  <Badge
                                    variant={booking.paymentStatus === "paid" ? "default" : "secondary"}
                                    className={booking.paymentStatus === "paid" ? "bg-green-100 text-green-800" : ""}
                                  >
                                    {booking.paymentStatus ? booking.paymentStatus.charAt(0).toUpperCase() + booking.paymentStatus.slice(1).toLowerCase() : "Unpaid"}
                                  </Badge>
                                </div>
                                <CardDescription>{booking.userEmail}</CardDescription>
                              </CardHeader>
                              <CardContent className="pb-2">
                                <div className="space-y-2">
                                  <div className="text-sm">
                                    <span className="text-muted-foreground">Pilgrim: </span>
                                    {booking.pilgrims && booking.pilgrims.length > 0
                                      ? `${booking.pilgrims[0].firstName || ""} ${booking.pilgrims[0].lastName || ""}`
                                      : "Unknown"}
                                  </div>
                                  <div className="text-sm">
                                    <span className="text-muted-foreground">Total Price: </span>
                                    <span className="font-medium">₦{booking.totalPrice?.toLocaleString() || "0"}</span>
                                  </div>
                                  <div className="text-sm">
                                    <span className="text-muted-foreground">Travel Date: </span>
                                    {booking.travelDate || "Unknown"}
                                  </div>
                                </div>
                              </CardContent>
                              <div className="flex justify-end gap-2 p-4 pt-0">
                                <Button variant="outline" size="sm" onClick={() => handleViewBooking(booking)}>
                                  <Eye className="h-4 w-4 mr-1" /> View
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => handleEditBooking(booking)}>
                                  <Edit className="h-4 w-4 mr-1" /> Edit
                                </Button>
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    disabled={deletingId === (booking.id || booking.uid)}
                                    onClick={() => handleDeleteBooking(booking.id || booking.uid)}
                                  >
                                    {deletingId === (booking.id || booking.uid) ? "Deleting..." : "Delete"}
                                  </Button>
                              </div>
                            </Card>
                          );
                        })
                      )}
                    </div>
                    {/* Pagination controls */}
                    {totalPages > 1 && (
                      <div className="flex justify-center items-center gap-2 mt-6">
                        <Button variant="outline" size="sm" disabled={gridPage === 1} onClick={() => setGridPage(gridPage - 1)}>
                          Previous
                        </Button>
                        <span className="text-sm">Page {gridPage} of {totalPages}</span>
                        <Button variant="outline" size="sm" disabled={gridPage === totalPages} onClick={() => setGridPage(gridPage + 1)}>
                          Next
                        </Button>
                      </div>
                    )}
                  </>
                );
              })()}
            </TabsContent>
          </Tabs>
          {/* View Booking Dialog */}
          {isViewDialogOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
              <div className="bg-white rounded-2xl shadow-2xl w-[70vw] max-h-[80vh] overflow-y-auto p-10 border border-gray-200 flex flex-col" style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.18)' }}>
                <div className="flex justify-between items-center mb-6 sticky top-0 bg-white z-10 pb-2 border-b border-gray-100">
                  <h2 className="text-2xl font-bold text-gray-900">Booking Details</h2>
                  <Button variant="ghost" onClick={() => setIsViewDialogOpen(false)} className="text-gray-500 hover:text-gray-900">Close</Button>
                </div>
                {selectedBooking && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Booking Information</h3>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-muted-foreground">Agency ID</p>
                          <p className="font-medium">{selectedBooking.agencyId}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Package</p>
                          <p>{selectedBooking.packageTitle}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Departure City</p>
                          <p>{selectedBooking.departureCity}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">User Email</p>
                          <p>{selectedBooking.userEmail}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Payment Status</p>
                          <Badge
                            variant={(selectedBooking?.paymentStatus ?? selectedBooking?.status ?? "") === "paid" ? "default" : "secondary"}
                            className={(selectedBooking?.paymentStatus ?? selectedBooking?.status ?? "") === "paid" ? "bg-green-100 text-green-800" : ""}
                          >
                            {(selectedBooking?.paymentStatus ?? selectedBooking?.status ?? "Unpaid")}
                          </Badge>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Amount Paid</p>
                          <p className="font-medium">₦{typeof selectedBooking.amountPaid === "number" ? selectedBooking.amountPaid.toLocaleString() : (selectedBooking.amountPaid ? Number(selectedBooking.amountPaid).toLocaleString() : (typeof selectedBooking.totalPrice === "number" ? selectedBooking.totalPrice.toLocaleString() : "0"))}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Total Price</p>
                          <p className="font-medium">₦{typeof selectedBooking.totalPrice === "number" ? selectedBooking.totalPrice.toLocaleString() : "0"}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Notes</p>
                          <p>{selectedBooking.notes || "-"}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Group Members</p>
                          <ul className="list-disc ml-4">
                            {selectedBooking.groupMembers && selectedBooking.groupMembers.length > 0 ? selectedBooking.groupMembers.map((m: any, idx: number) => (
                              <li key={idx}>{m.name} ({m.email}) {m.phone}</li>
                            )) : <li>-</li>}
                          </ul>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Pilgrims</p>
                          <ul className="list-disc ml-4">
                            {selectedBooking.pilgrims && selectedBooking.pilgrims.length > 0 ? selectedBooking.pilgrims.map((p: any, idx: number) => (
                              <li key={idx}>{p.firstName} {p.lastName} ({p.email})</li>
                            )) : <li>-</li>}
                          </ul>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Selected Services</p>
                          <ul className="list-disc ml-4">
                            {Array.isArray(selectedBooking.selectedServices)
                              ? (selectedBooking.selectedServices.length > 0
                                  ? selectedBooking.selectedServices.map((service: any, idx: number) => (
                                      service.details?.selected ? (
                                        <li key={idx}>
                                          {service.name ? service.name.charAt(0).toUpperCase() + service.name.slice(1) : "Service"}
                                          {service.details?.tier ? ` (${service.details.tier})` : ""}
                                          {service.details?.type ? ` - ${service.details.type}` : ""}
                                        </li>
                                      ) : null
                                    ))
                                  : <li>-</li>
                                )
                              : (selectedBooking.selectedServices && Object.keys(selectedBooking.selectedServices).length > 0
                                  ? Object.entries(selectedBooking.selectedServices)
                                      .filter(([_, value]: [string, any]) => value.details?.selected)
                                      .map(([key, value]: [string, any], idx) => (
                                        <li key={key + '-' + idx}>
                                          {key.charAt(0).toUpperCase() + key.slice(1)}
                                          {value.details?.tier ? ` (${value.details.tier})` : ""}
                                          {value.details?.type ? ` - ${value.details.type}` : ""}
                                        </li>
                                      ))
                                  : <li>-</li>
                                )
                            }
                          </ul>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Travel Date</p>
                          <p>{selectedBooking.travelDate}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Return Date</p>
                          <p>{selectedBooking.pilgrims && selectedBooking.pilgrims[0]?.returnDate}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Created At</p>
                          <p>{selectedBooking.createdAt ? (selectedBooking.createdAt.seconds ? new Date(selectedBooking.createdAt.seconds * 1000).toLocaleString() : selectedBooking.createdAt) : "Unknown"}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Updated At</p>
                          <p>{selectedBooking.updatedAt ? (selectedBooking.updatedAt.seconds ? new Date(selectedBooking.updatedAt.seconds * 1000).toLocaleString() : selectedBooking.updatedAt) : "Unknown"}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          {/* Edit Booking Dialog */}
          {isEditDialogOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
              <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-8">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">Edit Booking</h2>
                  <Button variant="ghost" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
                </div>
                {selectedBooking && (
                  <div className="space-y-4 py-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Payment Status</label>
                      <Select value={editStatus} onValueChange={setEditStatus}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select payment status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="unpaid">Unpaid</SelectItem>
                          <SelectItem value="paid">Paid</SelectItem>
                          <SelectItem value="partial payment">Partial Payment</SelectItem>
                          <SelectItem value="complete">Complete</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Amount Paid</label>
                      <Input
                        type="number"
                        value={editAmount}
                        onChange={(e) => setEditAmount(e.target.value)}
                        min="0"
                      />
                    </div>
                  </div>
                )}
                <div className="flex justify-end gap-2 mt-6">
                  <Button variant="default" onClick={handleSaveEdit}>
                    Save Changes
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
