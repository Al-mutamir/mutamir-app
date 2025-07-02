"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, ArrowRight, MapPin, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"

export default function CreatePackagePage() {
  const [packageType, setPackageType] = useState("hajj")
  const [accommodations, setAccommodations] = useState([{ name: "", description: "", pricePerNight: "" }])

  const addAccommodation = () => {
    setAccommodations([...accommodations, { name: "", description: "", pricePerNight: "" }])
  }

  const removeAccommodation = (index: number) => {
    const newAccommodations = [...accommodations]
    newAccommodations.splice(index, 1)
    setAccommodations(newAccommodations)
  }

  const updateAccommodation = (index: number, field: string, value: string) => {
    const newAccommodations = [...accommodations]
    newAccommodations[index] = { ...newAccommodations[index], [field]: value }
    setAccommodations(newAccommodations)
  }

  return (
    <div className="min-h-screen bg-muted/30 py-12">
      <div className="container">
        <Link href="/" className="flex items-center gap-2 mb-8">
          <MapPin className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold">Mutamir</span>
        </Link>

        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Create a New Package</h1>

          <Card>
            <CardHeader>
              <CardTitle>Package Details</CardTitle>
              <CardDescription>Create a new Hajj or Umrah package for your clients</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Tabs defaultValue="hajj" onValueChange={(value) => setPackageType(value)}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="hajj">Hajj Package</TabsTrigger>
                  <TabsTrigger value="umrah">Umrah Package</TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="space-y-2">
                <Label htmlFor="packageName">Package Name</Label>
                <Input id="packageName" placeholder="e.g. Premium Hajj 2025" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Package Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the package and what makes it special"
                  className="min-h-[100px]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (Days)</Label>
                  <Input id="duration" type="number" min="1" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="groupSize">Maximum Group Size</Label>
                  <Input id="groupSize" type="number" min="1" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="departureDate">Departure Date</Label>
                  <Input id="departureDate" type="date" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="returnDate">Return Date</Label>
                  <Input id="returnDate" type="date" />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Services Included</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="visa" className="flex-1">
                      Visa Assistance
                    </Label>
                    <div className="flex items-center gap-4">
                      <Switch id="visa" />
                      <Input placeholder="Price" className="w-24" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="flight" className="flex-1">
                      Flight Booking
                    </Label>
                    <div className="flex items-center gap-4">
                      <Switch id="flight" />
                      <Input placeholder="Price" className="w-24" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="transport" className="flex-1">
                      Local Transportation
                    </Label>
                    <div className="flex items-center gap-4">
                      <Switch id="transport" />
                      <Input placeholder="Price" className="w-24" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="food" className="flex-1">
                      Meals
                    </Label>
                    <div className="flex items-center gap-4">
                      <Switch id="food" />
                      <Input placeholder="Price" className="w-24" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Accommodation Options</h3>
                  <Button variant="outline" size="sm" onClick={addAccommodation}>
                    <Plus className="h-4 w-4 mr-2" /> Add Option
                  </Button>
                </div>

                {accommodations.map((accommodation, index) => (
                  <div key={index} className="border p-4 rounded-lg space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium">Option {index + 1}</h4>
                      {accommodations.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeAccommodation(index)}
                          className="text-destructive hover:text-destructive/90"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`accommodation-${index}-name`}>Accommodation Name</Label>
                      <Input
                        id={`accommodation-${index}-name`}
                        placeholder="e.g. Deluxe Hotel Makkah"
                        value={accommodation.name}
                        onChange={(e) => updateAccommodation(index, "name", e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`accommodation-${index}-description`}>Description</Label>
                      <Textarea
                        id={`accommodation-${index}-description`}
                        placeholder="Describe the accommodation"
                        value={accommodation.description}
                        onChange={(e) => updateAccommodation(index, "description", e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`accommodation-${index}-price`}>Price per Night</Label>
                      <Input
                        id={`accommodation-${index}-price`}
                        placeholder="Price"
                        value={accommodation.pricePerNight}
                        onChange={(e) => updateAccommodation(index, "pricePerNight", e.target.value)}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <Label htmlFor="totalPrice">Total Base Package Price</Label>
                <Input id="totalPrice" placeholder="Total price without accommodations" />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" /> Save as Draft
              </Button>
              <Button>
                Create Package <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
