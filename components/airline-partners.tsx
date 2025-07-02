export default function AirlinePartners() {
  const airlines = [
    { name: "Qatar Airways", logo: "/placeholder.svg?height=50&width=120&text=Qatar+Airways" },
    { name: "British Airways", logo: "/placeholder.svg?height=50&width=120&text=British+Airways" },
    { name: "Air Iran", logo: "/placeholder.svg?height=50&width=120&text=Air+Iran" },
    { name: "Emirates", logo: "/placeholder.svg?height=50&width=120&text=Emirates" },
    { name: "Etihad", logo: "/placeholder.svg?height=50&width=120&text=Etihad" },
  ]

  return (
    <section className="py-12 border-b">
      <div className="container">
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
          {airlines.map((airline, index) => (
            <div key={index} className="grayscale hover:grayscale-0 transition-all duration-300">
              <img src={airline.logo || "/placeholder.svg"} alt={airline.name} className="h-8 md:h-10" />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
