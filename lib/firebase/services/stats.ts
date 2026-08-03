import { getBookingsByPilgrim } from "./booking"
import { getPaymentsByPilgrim } from "./payment"

import type { Booking } from "../interface/booking"
import type { Payment } from "../interface/payment"

function normalizeDate(date: any): string {
  if (!date) return new Date().toISOString()
  if (typeof date === "string") return date
  if (date instanceof Date) return date.toISOString()
  if (typeof date.toDate === "function") return date.toDate().toISOString()
  return new Date(date).toISOString()
}

export async function getUserBookings(pilgrimId: string) {
  const bookings = await getBookingsByPilgrim(pilgrimId)

  return bookings.map((booking) => ({
    id: booking.id,
    bookingId: booking.id,
    packageName: booking.packageTitle || "",
    agencyName: booking.agencyId || "",
    bookingDate: normalizeDate(booking.createdAt ?? booking.travelDate),
    departureDate: normalizeDate(booking.travelDate),
    returnDate: booking.returnDate ? normalizeDate(booking.returnDate) : undefined,
    totalAmount: booking.totalPrice || 0,
    status: booking.status,
    cancellationDate:
      booking.status === "cancelled" ? normalizeDate(booking.updatedAt ?? booking.travelDate) : undefined,
    cancellationReason: undefined,
    refundAmount: undefined,
  }))
}

export async function getUserPaymentHistory(pilgrimId: string) {
  const payments = await getPaymentsByPilgrim(pilgrimId)

  return payments.map((payment) => {
    const normalizedStatus =
      payment.status === "paid"
        ? "successful"
        : payment.status === "refunded"
        ? "failed"
        : payment.status

    return {
      id: payment.id || "",
      amount: payment.amount,
      description: payment.packageId ? `Payment for package ${payment.packageId}` : "Pilgrimage payment",
      status: normalizedStatus,
      date: normalizeDate(payment.date ?? payment.createdAt),
      method: payment.method,
      reference: payment.reference,
    }
  })
}

export async function getPilgrimStats(pilgrimId: string) {
  const bookings = await getBookingsByPilgrim(pilgrimId)
  const payments = await getPaymentsByPilgrim(pilgrimId)

  const enrichedBookings = bookings.map((booking) => ({
    ...booking,
    userId: booking.pilgrimId,
  }))

  const recentActivity = [
    ...enrichedBookings.map((booking) => ({
      type: "booking",
      date: normalizeDate(booking.createdAt ?? booking.travelDate),
      data: {
        packageTitle: booking.packageTitle,
        status: booking.status,
        totalPrice: booking.totalPrice,
      },
    })),
    ...payments.map((payment) => ({
      type: "payment",
      date: normalizeDate(payment.date ?? payment.createdAt),
      data: {
        amount: payment.amount,
        status: payment.status === "paid" ? "successful" : payment.status === "refunded" ? "failed" : payment.status,
        method: payment.method,
      },
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return {
    bookings: enrichedBookings,
    recentActivity,
  }
}
