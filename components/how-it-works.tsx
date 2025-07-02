export default function HowItWorks() {
  const steps = [
    {
      title: "Choose Your Package",
      description: "Select the package that fits your needs and budget",
      image: "/images/select-package.webp?height=200&width=300",
    },
    {
      title: "Complete Your Booking",
      description: "Easy and secure booking process for your Hajj or Umrah journey",
      image: "/images/complete-booking.webp?height=200&width=300",
    },
    {
      title: "Embark on Your Journey",
      description: "Begin your spiritual journey with Al-mutamir",
      image: "/images/embark.webp?height=200&width=300",
    },
  ]

  return (
    <section className="py-20 bg-gray-50">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">How It Works</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            An all-in-one platform for agencies and pilgrims alike. Create and get access to 
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <div className="mb-6 relative">
                <img
                  src={step.image || "/placeholder.svg"}
                  alt={step.title}
                  className="w-full h-48 object-cover rounded-lg"
                />
                {index === 0 && (
                  <div className="absolute -top-4 -right-4 bg-[#c8e823] w-10 h-10 flex items-center justify-center rounded-lg transform rotate-12">
                    <span className="text-black font-bold">1</span>
                  </div>
                )}
                {index === 1 && (
                  <div className="absolute -top-4 -right-4 bg-[#8bc34a] w-10 h-10 flex items-center justify-center rounded-lg transform rotate-12">
                    <span className="text-white font-bold">2</span>
                  </div>
                )}
                {index === 2 && (
                  <div className="absolute -top-4 -right-4 bg-[#424242] w-10 h-10 flex items-center justify-center rounded-lg transform rotate-12">
                    <span className="text-white font-bold">3</span>
                  </div>
                )}
              </div>
              <h3 className="font-bold text-lg mb-2">{step.title}</h3>
              <p className="text-gray-600">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
