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
import { format, isBefore, isSameDay, startOfDay } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

export default function BookingWidget() {
  const router = useRouter()
  const [date, setDate] = useState<Date>()
  const [returnDate, setReturnDate] = useState<Date>()
  const [pilgrimType, setPilgrimType] = useState("umrah")
  const [departureCity, setDepartureCity] = useState("")

  const today = startOfDay(new Date())

  const disablePastDates = (day: Date) => isBefore(day, today)
  const disableReturnDates = (day: Date) =>
    isBefore(day, today) || (date ? isSameDay(day, date) || isBefore(day, date) : false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    router.push(
      `/services?type=${encodeURIComponent(pilgrimType)}&date=${date ? encodeURIComponent(date.toISOString().split("T")[0]) : ""}&returnDate=${returnDate ? encodeURIComponent(returnDate.toISOString().split("T")[0]) : ""}&departure=${encodeURIComponent(departureCity)}`
    )
  }

  return (
    <Card className="shadow-lg border-0">
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="pilgrim-type">Pilgrimage Type</Label>
              <Select value={pilgrimType} onValueChange={setPilgrimType}>
                <SelectTrigger id="pilgrim-type" className="w-full">
                  <SelectValue placeholder="Select pilgrimage type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="umrah">Umrah</SelectItem>
                  <SelectItem value="hajj">Hajj</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="departure-date">Departure Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
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

            <div>
              <Label htmlFor="return-date">Return Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn("w-full justify-start text-left font-normal", !returnDate && "text-muted-foreground")}
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

            <div>
              <Label htmlFor="departure-city">Departure City</Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <MapPin className="h-4 w-4 text-gray-400" />
                </div>
                <Input
                  id="departure-city"
                  value={departureCity}
                  onChange={(e) => setDepartureCity(e.target.value)}
                  placeholder="Enter your departure city"
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          <div className="mt-8">
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
              Get Started <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
