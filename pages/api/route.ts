// app/api/notify-discord/route.ts
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const booking = await req.json()

    const webhookUrl = process.env.DISCORD_WEBHOOK_URL
    if (!webhookUrl) {
      console.error("DISCORD_WEBHOOK_URL is not set")
      return NextResponse.json({ error: "Webhook not configured" }, { status: 500 })
    }

    // Pilgrims (only filled)
    const pilgrimsArr = Array.isArray(booking.pilgrims)
      ? booking.pilgrims.filter((p: any) => p.firstName || p.lastName || p.email || p.phone)
      : []
    const pilgrimList = pilgrimsArr.length
      ? pilgrimsArr.map((p: any) => `• ${p.firstName} ${p.lastName} (${p.email}, ${p.phone})`).join("\n")
      : "No pilgrims provided"

    // Itinerary (only filled)
    const itineraryArr = Array.isArray(booking.highlights)
      ? booking.highlights.filter((item: string) => item && item.trim() !== "")
      : []
    const itineraryList = itineraryArr.length
      ? itineraryArr.map((item: string) => `  - ${item}`).join("\n")
      : "  (No specific itinerary provided)"

    // Services (only selected)
    const servicesObj =
      typeof booking.selectedServices === "object" && booking.selectedServices !== null
        ? Object.entries(booking.selectedServices).filter(([_, v]: any) => v.selected)
        : []
    const servicesSelected = servicesObj.length
      ? servicesObj
          .map(([k, v]: any) => {
            const tier = v.tier ? ` (${v.tier})` : ""
            return `• ${k.charAt(0).toUpperCase() + k.slice(1)}${tier}`
          })
          .join("\n")
      : "None"

    // Group members (only filled)
    const groupMembersArr = Array.isArray(booking.groupMembers)
      ? booking.groupMembers.filter((m: any) => m.name || m.email || m.phone)
      : []
    const groupMembersList = groupMembersArr.length
      ? groupMembersArr.map((m: any) => `• ${m.name} (${m.email}, ${m.phone})`).join("\n")
      : ""

    const message =
      `🟢 **New Booking Received**\n` +
      `**Package:** ${booking.packageTitle}\n` +
      `**Departure City:** ${booking.departureCity}\n` +
      `**Departure Date:** ${booking.travelDate}\n` +
      `**Return Date:** ${booking.returnDate}\n` +
      `**Status:** ${booking.status}\n` +
      `**Payment Status:** ${booking.paymentStatus}\n` +
      `**Pilgrims:**\n${pilgrimList}\n\n` +
      `**Preferred Itinerary:**\n${itineraryList}\n\n` +
      `**Selected Services:**\n${servicesSelected}\n\n` +
      (booking.isGroupBooking ? `**Group Booking:** Yes\n` : "") +
      (booking.isCreatingGroup && groupMembersArr.length > 0 ? `**Group Members:**\n${groupMembersList}\n` : "")

    const discordRes = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: message }),
    })

    if (!discordRes.ok) {
      const text = await discordRes.text().catch(() => "")
      console.error("Discord webhook returned an error:", discordRes.status, text)
      return NextResponse.json({ error: "Discord webhook failed" }, { status: 502 })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("notify-discord route failed:", error)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}