"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import Image from "next/image"
import { getAllPackages } from "@/lib/firebase/firestore"
import { formatCurrency } from "@/lib/utils"
import { MapPin, Users, ArrowRight, Package } from "lucide-react"

export default function StandardPackagesSection() {
  const [packages, setPackages] = useState({
    hajj: [],
    umrah: [],
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        setLoading(true)
        const allPackages = await getAllPackages()
        const hajjPackages = allPackages.filter((pkg) => pkg.type?.toLowerCase() === "hajj")
        // Group both "umrah" and "group-umrah" as Umrah
        const umrahPackages = allPackages.filter((pkg) => {
          const type = pkg.type?.toLowerCase()
          return type === "umrah" || type === "group-umrah"
        })
        setPackages({
          hajj: hajjPackages,
          umrah: umrahPackages,
        })
      } catch (err) {
        setPackages({
          hajj: [],
          umrah: [],
        })
      } finally {
        setLoading(false)
      }
    }
    fetchPackages()
  }, [])

  const formatDate = (date) => {
    if (!date) return "TBA"
    try {
      if (typeof date === "string") {
        return new Date(date).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      }
      if (date && typeof date === "object" && "toDate" in date) {
        return date.toDate().toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      }
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    } catch (error) {
      return "TBA"
    }
  }

  const PackageCard = ({ pkg }) => (
    <Card key={pkg.id} className="overflow-hidden flex flex-col h-full">
      <div className="relative h-48 w-full">
        <Image
          src={pkg.imageUrl || "/placeholder.svg?height=300&width=400"}
          alt={pkg.title}
          fill
          style={{ objectFit: "cover" }}
          className="transition-transform hover:scale-105 duration-300"
        />
        <div className="absolute top-4 left-4">
          <Badge className="bg-white text-primary">{pkg.type}</Badge>
        </div>
      </div>
      <CardHeader className="pb-2">
        <CardTitle className="line-clamp-2">{pkg.title}</CardTitle>
        <CardDescription className="flex items-center gap-1">
          <MapPin className="h-3.5 w-3.5 text-gray-500" />
          {pkg.destination}
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-2 flex-grow">
        <p className="text-gray-600 mb-4 line-clamp-2">{pkg.description}</p>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-1.5">
            <span>{pkg.duration}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users className="h-4 w-4 text-gray-500" />
            <span>Max {pkg.groupSize}</span>
          </div>
        </div>
        <div className="mt-2 text-sm text-gray-500">
          <span>Departure: {formatDate(pkg.departureDate)}</span>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between items-center border-t pt-4">
        <div className="font-bold text-lg">{formatCurrency(pkg.price)}</div>
        <Button asChild size="sm">
          <Link href={`/packages/${pkg.id}`}>
            View Details <ArrowRight className="ml-1.5 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )

  return (
    <section id="standard-packages" className="py-20 bg-gray-50">
      <div className="container">

        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Our Packages</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Explore a selection of our most popular Hajj and Umrah packages. For more options, click below to explore all
            packages.
          </p>
        </div>

        <Tabs defaultValue="umrah" className="w-full mb-8">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="umrah" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Umrah Packages ({packages.umrah.length})
            </TabsTrigger>
            <TabsTrigger value="hajj" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Hajj Packages ({packages.hajj.length})
            </TabsTrigger>
          </TabsList>
          <TabsContent value="umrah">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="overflow-hidden animate-pulse">
                    <div className="h-48 bg-gray-200"></div>
                    <CardHeader>
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : packages.umrah.length === 0 ? (
              <div className="text-center text-gray-500 py-12">
                No Umrah packages available at the moment.
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
                  {packages.umrah.slice(0, 12).map((pkg) => (
                    <PackageCard key={pkg.id} pkg={pkg} />
                  ))}
                </div>
                <div className="flex justify-center">
                  <Link href="/standard-packages?umrah">
                    <Button size="lg" className="px-8">
                      Explore Umrah Packages
                    </Button>
                  </Link>
                </div>
              </>
            )}
          </TabsContent>
          <TabsContent value="hajj">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="overflow-hidden animate-pulse">
                    <div className="h-48 bg-gray-200"></div>
                    <CardHeader>
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : packages.hajj.length === 0 ? (
              <div className="text-center text-gray-500 py-12">
                No Hajj packages available at the moment.
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
                  {packages.hajj.slice(0, 12).map((pkg) => (
                    <PackageCard key={pkg.id} pkg={pkg} />
                  ))}
                </div>
                <div className="flex justify-center">
                  <Link href="/standard-packages?hajj">
                    <Button size="lg" className="px-8">
                      Explore Hajj Packages
                    </Button>
                  </Link>
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </section>
  )
}
