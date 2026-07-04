"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Boxes, MapPin, Package, Users } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getAllPackages } from "@/lib/firebase/firestore"
import { formatCurrency, formatDate } from "@/lib/utils"

type PackageItem = {
  id: string
  type?: string
  imageUrl?: string
  title?: string
  destination?: string
  description?: string
  duration?: string
  groupSize?: number | string
  departureDate?: unknown
  price?: number
}

type PackageGroups = {
  hajj: PackageItem[]
  umrah: PackageItem[]
}

export default function StandardPackagesSection() {
  const [packages, setPackages] = useState<PackageGroups>({ hajj: [], umrah: [] })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        setLoading(true)
        const allPackages = (await getAllPackages()) as PackageItem[]
        setPackages({
          hajj: allPackages.filter((pkg) => pkg.type?.toLowerCase() === "hajj"),
          umrah: allPackages.filter((pkg) => {
            const type = pkg.type?.toLowerCase()
            return type === "umrah" || type === "group-umrah"
          }),
        })
      } catch (err) {
        setPackages({ hajj: [], umrah: [] })
      } finally {
        setLoading(false)
      }
    }

    fetchPackages()
  }, [])

  const formatDateLocal = (date: unknown) => {
    const formatted = formatDate(date, "MMM d, yyyy")
    return formatted === "Unknown" ? "TBA" : formatted
  }

  return (
    <section id="standard-packages" className="container py-20">
      <div className="mb-14 text-center">
        <h2 className="mb-4 text-3xl font-bold tracking-normal text-[#007F5F] md:text-5xl">Explore Our Packages</h2>
        <p className="mx-auto max-w-2xl text-[#444746]">
          Discover seasonal Hajj and Umrah collections tailored for every pilgrim&apos;s journey.
        </p>
      </div>

      <Tabs defaultValue="umrah" className="w-full">
        <TabsList className="mx-auto mb-14 flex h-auto w-fit rounded-full bg-gray-100 p-1.5">
          <TabsTrigger
            value="umrah"
            className="rounded-full px-5 py-2.5 text-sm font-bold data-[state=active]:text-[#007F5F]"
          >
            <Package className="h-4 w-4" />
            Umrah Packages ({packages.umrah.length})
          </TabsTrigger>
          <TabsTrigger
            value="hajj"
            className="rounded-full px-5 py-2.5 text-sm font-bold data-[state=active]:text-[#007F5F]"
          >
            <Package className="h-4 w-4" />
            Hajj Packages ({packages.hajj.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="umrah">
          <PackagePanel
            loading={loading}
            packages={packages.umrah}
            emptyText="New Umrah collections are being prepared. Check back soon for updated seasonal availability."
            ctaHref="/standard-packages?umrah"
            ctaLabel="Explore Umrah Packages"
            formatDateLocal={formatDateLocal}
          />
        </TabsContent>
        <TabsContent value="hajj">
          <PackagePanel
            loading={loading}
            packages={packages.hajj}
            emptyText="New Hajj collections are being prepared. Check back soon for updated seasonal availability."
            ctaHref="/standard-packages?hajj"
            ctaLabel="Explore Hajj Packages"
            formatDateLocal={formatDateLocal}
          />
        </TabsContent>
      </Tabs>
    </section>
  )
}

function PackagePanel({
  loading,
  packages,
  emptyText,
  ctaHref,
  ctaLabel,
  formatDateLocal,
}: {
  loading: boolean
  packages: PackageItem[]
  emptyText: string
  ctaHref: string
  ctaLabel: string
  formatDateLocal: (date: unknown) => string
}) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((item) => (
          <Card key={item} className="overflow-hidden border-gray-100">
            <div className="h-48 animate-pulse bg-gray-200" />
            <CardHeader>
              <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200" />
              <div className="h-3 w-1/2 animate-pulse rounded bg-gray-200" />
            </CardHeader>
            <CardContent>
              <div className="mb-2 h-3 w-full animate-pulse rounded bg-gray-200" />
              <div className="h-3 w-2/3 animate-pulse rounded bg-gray-200" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (packages.length === 0) {
    return (
      <div className="rounded-3xl border border-gray-100 bg-white p-12 text-center shadow-[0_18px_55px_rgba(26,28,27,0.08)] md:p-24">
        <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-[#F8F8F6]">
          <Boxes className="h-10 w-10 text-[#007F5F]/40" />
        </div>
        <p className="mx-auto max-w-2xl font-medium italic text-[#444746]">{emptyText}</p>
      </div>
    )
  }

  return (
    <>
      <div className="mb-8 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        {packages.slice(0, 12).map((pkg) => (
          <PackageCard key={pkg.id} pkg={pkg} formatDateLocal={formatDateLocal} />
        ))}
      </div>
      <div className="flex justify-center">
        <Link href={ctaHref}>
          <Button size="lg" className="rounded-full bg-[#007F5F] px-8 hover:bg-[#00684e]">
            {ctaLabel}
          </Button>
        </Link>
      </div>
    </>
  )
}

function PackageCard({
  pkg,
  formatDateLocal,
}: {
  pkg: PackageItem
  formatDateLocal: (date: unknown) => string
}) {
  return (
    <Card className="flex h-full flex-col overflow-hidden border-gray-100 bg-white shadow-[0_18px_55px_rgba(26,28,27,0.08)]">
      <div className="relative h-48 w-full">
        <Image
          src={pkg.imageUrl || "/placeholder.svg?height=300&width=400"}
          alt={pkg.title || "Pilgrimage package"}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
          className="object-cover transition-transform duration-300 hover:scale-105"
        />
        <div className="absolute left-4 top-4">
          <Badge className="bg-white text-[#007F5F]">{pkg.type || "Package"}</Badge>
        </div>
      </div>
      <CardHeader className="pb-2">
        <CardTitle className="line-clamp-2">{pkg.title || "Pilgrimage Package"}</CardTitle>
        <CardDescription className="flex items-center gap-1">
          <MapPin className="h-3.5 w-3.5 text-gray-500" />
          {pkg.destination || "Saudi Arabia"}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow pb-2">
        <p className="mb-4 line-clamp-2 text-[#444746]">{pkg.description || "Package details coming soon."}</p>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <span>{pkg.duration || "TBA"}</span>
          <div className="flex items-center gap-1.5">
            <Users className="h-4 w-4 text-gray-500" />
            <span>Max {pkg.groupSize || "TBA"}</span>
          </div>
        </div>
        <div className="mt-2 text-sm text-gray-500">Departure: {formatDateLocal(pkg.departureDate)}</div>
      </CardContent>
      <CardFooter className="flex items-center justify-between border-t pt-4">
        <div className="text-lg font-bold">{formatCurrency(pkg.price || 0)}</div>
        <Button asChild size="sm" className="bg-[#007F5F] hover:bg-[#00684e]">
          <Link href={`/packages/${pkg.id}`}>
            View Details <ArrowRight className="ml-1.5 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
