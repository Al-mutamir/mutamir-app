const steps = [
  {
    title: "Choose Your Package",
    description: "Select the package that fits your needs and budget from our curated collections.",
  },
  {
    title: "Complete Your Booking",
    description: "Our easy and secure booking process confirms your Hajj or Umrah journey.",
  },
  {
    title: "Embark on Your Journey",
    description: "Begin your spiritual journey with the peace of mind that everything is handled by Almutamir.",
  },
]

export default function HowItWorks() {
  return (
    <section className="border-y border-gray-100 bg-white py-20">
      <div className="container text-center">
        <h2 className="mb-4 text-3xl font-bold tracking-normal text-[#007F5F] md:text-5xl">How It Works</h2>
        <p className="mx-auto mb-16 max-w-2xl text-lg leading-8 text-[#444746]">
          An all-in-one platform for agencies and pilgrims alike. Create and get access to trusted pilgrimage services.
        </p>

        <div className="relative grid grid-cols-1 gap-12 md:grid-cols-3">
          <div className="absolute left-1/4 right-1/4 top-8 hidden border-t border-dashed border-gray-200 md:block" />
          {steps.map((step, index) => (
            <div key={step.title} className="relative z-10 flex flex-col items-center">
              <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-full bg-[#007F5F] text-xl font-bold text-white shadow-lg shadow-[#007F5F]/20">
                {index + 1}
              </div>
              <h3 className="mb-4 text-xl font-semibold text-[#1a1c1b]">{step.title}</h3>
              <p className="max-w-xs text-[#444746]">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
