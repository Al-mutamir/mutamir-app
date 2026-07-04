"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { CalendarIcon, MapPin, ArrowRight } from "lucide-react"
import { format, isBefore, isSameDay, startOfDay, addDays } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

type BookingWidgetProps = {
  variant?: "default" | "landing"
}

export default function BookingWidget({ variant = "default" }: BookingWidgetProps) {
  const router = useRouter()
  const [date, setDate] = useState<Date>()
  const [returnDate, setReturnDate] = useState<Date>()
  const [pilgrimType, setPilgrimType] = useState("umrah")
  const [departureCity, setDepartureCity] = useState("")

  const today = startOfDay(new Date())
  const minDepartureDate = addDays(today, 3)

  // Only allow departure from the 3rd day onward
  const disablePastDates = (day: Date) => isBefore(day, minDepartureDate)
  // Only allow return after departure date (and after minDepartureDate)
  const disableReturnDates = (day: Date) =>
    isBefore(day, minDepartureDate) || (date ? isSameDay(day, date) || isBefore(day, date) : false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    router.push(
      `/services?type=${encodeURIComponent(pilgrimType)}&date=${date ? encodeURIComponent(date.toISOString().split("T")[0]) : ""}&returnDate=${returnDate ? encodeURIComponent(returnDate.toISOString().split("T")[0]) : ""}&departure=${encodeURIComponent(departureCity)}`
    )
  }

  const isLanding = variant === "landing"

  return (
    <Card className={cn("border-0 shadow-xl", isLanding && "rounded-2xl border border-gray-100")}>
      <CardContent className={cn("p-6", isLanding && "p-5 md:p-8")}>
        <form
          onSubmit={handleSubmit}
          className={cn(isLanding ? "grid gap-5 md:grid-cols-5 md:items-end" : "space-y-6")}
        >
          <div className={cn(isLanding ? "contents" : "space-y-4")}>
            <div className={cn(isLanding ? "space-y-2" : "")}>
              <Label
                htmlFor="pilgrim-type"
                className={cn(isLanding && "px-1 text-[11px] font-bold uppercase tracking-widest text-[#007F5F]")}
              >
                Pilgrimage Type
              </Label>
              <Select value={pilgrimType} onValueChange={setPilgrimType}>
                <SelectTrigger
                  id="pilgrim-type"
                  className={cn(
                    "w-full",
                    isLanding && "h-12 rounded-lg border-0 bg-[#f1f1ef]/70 focus:ring-2 focus:ring-[#007F5F]/20"
                  )}
                >
                  <SelectValue placeholder="Select pilgrimage type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="umrah">Umrah</SelectItem>
                  <SelectItem value="hajj">Hajj</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className={cn(isLanding ? "space-y-2" : "")}>
              <Label
                htmlFor="departure-date"
                className={cn(isLanding && "px-1 text-[11px] font-bold uppercase tracking-widest text-[#007F5F]")}
              >
                Departure Date
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground",
                      isLanding && "h-12 rounded-lg border-0 bg-[#f1f1ef]/70 hover:bg-[#f1f1ef]"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : "Select your departure date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                    disabled={disablePastDates}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className={cn(isLanding ? "space-y-2" : "")}>
              <Label
                htmlFor="return-date"
                className={cn(isLanding && "px-1 text-[11px] font-bold uppercase tracking-widest text-[#007F5F]")}
              >
                Return Date
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !returnDate && "text-muted-foreground",
                      isLanding && "h-12 rounded-lg border-0 bg-[#f1f1ef]/70 hover:bg-[#f1f1ef]"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {returnDate ? format(returnDate, "PPP") : "Select your return date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={returnDate}
                    onSelect={setReturnDate}
                    initialFocus
                    disabled={disableReturnDates}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className={cn(isLanding ? "space-y-2" : "")}>
              <Label
                htmlFor="departure-city"
                className={cn(isLanding && "px-1 text-[11px] font-bold uppercase tracking-widest text-[#007F5F]")}
              >
                Departure City
              </Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <MapPin className="h-4 w-4 text-gray-400" />
                </div>
                <Input
                  id="departure-city"
                  value={departureCity}
                  onChange={(e) => setDepartureCity(e.target.value)}
                  placeholder="Enter your departure city"
                  className={cn(
                    "pl-10",
                    isLanding && "h-12 rounded-lg border-0 bg-[#f1f1ef]/70 focus-visible:ring-[#007F5F]/20"
                  )}
                />
              </div>
            </div>
          </div>

          <div className={cn(!isLanding && "mt-8")}>
            <Button
              type="submit"
              className={cn(
                "w-full",
                isLanding
                  ? "h-12 rounded-lg bg-[#E3B23C] px-8 font-bold text-[#1a1c1b] hover:bg-[#d5a331]"
                  : "bg-primary hover:bg-primary/90"
              )}
            >
              {isLanding ? "Search Now" : "Get Started"} <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
