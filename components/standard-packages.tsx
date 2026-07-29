"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import Image from "next/image"
import useEmblaCarousel from "embla-carousel-react"

import { getAllPackages } from "@/lib/firebase/firestore"
import { formatCurrency, formatDate } from "@/lib/utils"

import {
  MapPin,
  Users,
  ArrowRight,
  Package,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"


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

        const hajjPackages = allPackages.filter(
          (pkg) => pkg.type?.toLowerCase() === "hajj"
        )

        const umrahPackages = allPackages.filter((pkg) => {
          const type = pkg.type?.toLowerCase()

          return (
            type === "umrah" ||
            type === "group-umrah"
          )
        })


        setPackages({
          hajj: hajjPackages,
          umrah: umrahPackages,
        })


      } catch (error) {

        console.error(error)

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



  const formatDateLocal = (date) => {

    const formatted = formatDate(
      date,
      "MMM d, yyyy"
    )

    return formatted === "Unknown"
      ? "TBA"
      : formatted
  }





  /*
    Reusable carousel wrapper

    Desktop:
      3 cards visible

    Tablet:
      2 cards visible

    Mobile:
      1 card visible
  */

  const PackageCarousel = ({
    items
  }) => {


    const [emblaRef, emblaApi] = useEmblaCarousel({

      loop: items.length > 3,

      align: "start",

      slidesToScroll: 1,

    })



    const [canPrev, setCanPrev] = useState(false)
    const [canNext, setCanNext] = useState(false)



    const updateButtons = useCallback(() => {

      if (!emblaApi) return

      setCanPrev(
        emblaApi.canScrollPrev()
      )

      setCanNext(
        emblaApi.canScrollNext()
      )

    }, [emblaApi])




    useEffect(() => {

      if (!emblaApi) return


      updateButtons()


      emblaApi.on(
        "select",
        updateButtons
      )


      emblaApi.on(
        "reInit",
        updateButtons
      )


    }, [
      emblaApi,
      updateButtons
    ])




    // autoplay

    useEffect(() => {

      if (!emblaApi) return


      const autoplay = setInterval(() => {

        if (emblaApi.canScrollNext()) {

          emblaApi.scrollNext()

        } else {

          emblaApi.scrollTo(0)

        }

      }, 4000)



      return () => clearInterval(autoplay)


    }, [emblaApi])





    return (

      <div className="relative">


        <div
          className="overflow-hidden"
          ref={emblaRef}
        >

          <div className="flex -ml-4">


            {items.map((pkg)=> (

              <div
                key={pkg.id}
                className="
                  pl-4
                  flex-[0_0_100%]
                  sm:flex-[0_0_50%]
                  lg:flex-[0_0_33.333%]
                "
              >

                <PackageCard pkg={pkg}/>


              </div>

            ))}


          </div>


        </div>




        {
          items.length > 1 && (

            <>

              <Button

                size="icon"

                variant="outline"

                disabled={!canPrev}

                onClick={() =>
                  emblaApi?.scrollPrev()
                }

                className="
                  absolute
                  left-2
                  top-1/2
                  -translate-y-1/2
                  rounded-full
                  bg-white
                  shadow
                  z-10
                "

              >

                <ChevronLeft className="h-5 w-5"/>

              </Button>




              <Button

                size="icon"

                variant="outline"

                disabled={!canNext}

                onClick={() =>
                  emblaApi?.scrollNext()
                }

                className="
                  absolute
                  right-2
                  top-1/2
                  -translate-y-1/2
                  rounded-full
                  bg-white
                  shadow
                  z-10
                "

              >

                <ChevronRight className="h-5 w-5"/>

              </Button>


            </>

          )
        }


      </div>

    )

  }

    const PackageCard = ({ pkg }) => (

    <Card
      className="
        overflow-hidden
        flex
        flex-col
        h-full
        rounded-2xl
        shadow-sm
        hover:shadow-lg
        transition-shadow
        bg-white
      "
    >

      <div className="relative h-52 w-full">

        <Image

          src={
            pkg.imageUrl ||
            "/placeholder.svg?height=300&width=400"
          }

          alt={pkg.title}

          fill

          sizes="(max-width:768px) 100vw, 33vw"

          className="
            object-cover
            transition-transform
            duration-300
            hover:scale-105
          "

        />


        <div className="absolute top-4 left-4">

          <Badge
            className="
              bg-white
              text-primary
              shadow
            "
          >
            {pkg.type}
          </Badge>

        </div>


      </div>



      <CardHeader className="pb-2">

        <CardTitle
          className="
            line-clamp-2
            text-lg
          "
        >
          {pkg.title}
        </CardTitle>


        <CardDescription
          className="
            flex
            items-center
            gap-1
          "
        >

          <MapPin
            className="
              h-4
              w-4
              text-gray-500
            "
          />

          {pkg.destination}

        </CardDescription>


      </CardHeader>



      <CardContent className="flex-grow">


        <p
          className="
            text-gray-600
            mb-4
            line-clamp-2
          "
        >
          {pkg.description}
        </p>



        <div
          className="
            grid
            grid-cols-2
            gap-3
            text-sm
          "
        >

          <div>
            {pkg.duration}
          </div>


          <div
            className="
              flex
              items-center
              gap-1
            "
          >

            <Users
              className="
                h-4
                w-4
                text-gray-500
              "
            />

            Max {pkg.groupSize}

          </div>


        </div>



        <div
          className="
            mt-3
            text-sm
            text-gray-500
          "
        >

          Departure:
          {" "}
          {formatDateLocal(pkg.departureDate)}

        </div>


      </CardContent>




      <CardFooter
        className="
          border-t
          pt-4
          flex
          justify-between
          items-center
        "
      >

        <div
          className="
            font-bold
            text-lg
          "
        >

          {formatCurrency(pkg.price)}

        </div>



        <Button
          asChild
          size="sm"
        >

          <Link
            href={`/packages/${pkg.id}`}
          >

            View Details

            <ArrowRight
              className="
                ml-1.5
                h-4
                w-4
              "
            />

          </Link>


        </Button>


      </CardFooter>


    </Card>

  )






  const renderCarousel = (items) => {


    if (loading) {

      return (

        <div
          className="
            grid
            grid-cols-1
            md:grid-cols-3
            gap-6
          "
        >

          {[1,2,3].map((i)=>(

            <Card
              key={i}
              className="
                animate-pulse
                overflow-hidden
              "
            >

              <div
                className="
                  h-52
                  bg-gray-200
                "
              />


              <CardHeader>

                <div
                  className="
                    h-5
                    bg-gray-200
                    rounded
                  "
                />

                <div
                  className="
                    h-3
                    bg-gray-200
                    rounded
                    mt-3
                  "
                />

              </CardHeader>


            </Card>

          ))}


        </div>

      )

    }



    if (!items.length) {

      return (

        <div
          className="
            text-center
            text-gray-500
            py-12
          "
        >

          No packages available at the moment.

        </div>

      )

    }



    return (

      <PackageCarousel
        items={items}
      />

    )

  }






  return (

    <section
      id="standard-packages"
      className="
        py-20
        bg-gray-50
      "
    >

      <div
        className="
          container
        "
      >



        <div
          className="
            text-center
            mb-12
          "
        >

          <h2
            className="
              text-3xl
              font-bold
              mb-4
            "
          >

            Our Packages

          </h2>



          <p
            className="
              text-gray-600
              max-w-2xl
              mx-auto
            "
          >

            Explore a selection of our most popular Hajj and Umrah packages.

          </p>


        </div>





        <Tabs
          defaultValue="umrah"
          className="w-full"
        >



          <TabsList
            className="
              grid
              grid-cols-2
              mb-8
            "
          >

            <TabsTrigger
              value="umrah"
              className="
                flex
                items-center
                gap-2
              "
            >

              <Package
                className="h-4 w-4"
              />

              Umrah Packages
              {" "}
              ({packages.umrah.length})

            </TabsTrigger>




            <TabsTrigger
              value="hajj"
              className="
                flex
                items-center
                gap-2
              "
            >

              <Package
                className="h-4 w-4"
              />

              Hajj Packages
              {" "}
              ({packages.hajj.length})

            </TabsTrigger>


          </TabsList>





          <TabsContent value="umrah">

            {renderCarousel(packages.umrah)}

          </TabsContent>





          <TabsContent value="hajj">

            {renderCarousel(packages.hajj)}

          </TabsContent>



        </Tabs>


      </div>


    </section>

  )

}