export default function Gallery() {
  const images = [
    "/placeholder.svg?height=200&width=300",
    "/placeholder.svg?height=200&width=300",
    "/placeholder.svg?height=200&width=300",
    "/placeholder.svg?height=200&width=300",
    "/placeholder.svg?height=400&width=600",
    "/placeholder.svg?height=200&width=300",
    "/placeholder.svg?height=200&width=300",
    "/placeholder.svg?height=200&width=300",
    "/placeholder.svg?height=200&width=300",
  ]

  return (
    <section className="py-20 bg-gray-50">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Our Gallery</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Embark on a Spiritual Journey. Your Trusted Hajj Partner. Comprehensive Hajj Packages Tailored to Your
            Needs.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="col-span-2 row-span-2">
            <img
              src={images[4] || "/placeholder.svg"}
              alt="Gallery image"
              className="w-full h-full object-cover rounded-lg"
            />
          </div>
          {images
            .filter((_, i) => i !== 4)
            .map((image, index) => (
              <div key={index}>
                <img
                  src={image || "/placeholder.svg"}
                  alt={`Gallery image ${index}`}
                  className="w-full h-48 object-cover rounded-lg"
                />
              </div>
            ))}
        </div>
      </div>
    </section>
  )
}
