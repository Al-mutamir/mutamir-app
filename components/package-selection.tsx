import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function PackageSelection() {
  const packages = [
    {
      title: "Premium Hajj",
      price: "$450",
      color: "#f0f9d4",
      features: ["5-Star Hotels", "Premium Meals", "VIP Transport", "Guided Tours", "Visa Processing", "24/7 Support"],
    },
    {
      title: "Family Umrah",
      price: "$550",
      color: "#c8e823",
      features: [
        "4-Star Hotels",
        "All Meals Included",
        "Private Transport",
        "Guided Tours",
        "Visa Processing",
        "24/7 Support",
      ],
    },
    {
      title: "Ramadan Umrah",
      price: "$260",
      color: "#f0f9d4",
      features: [
        "3-Star Hotels",
        "Breakfast Included",
        "Shared Transport",
        "Guided Tours",
        "Visa Processing",
        "24/7 Support",
      ],
    },
  ]

  return (
    <section id="pricing" className="py-20">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Choose your Package</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Select from our range of packages designed to meet different needs and budgets. All packages can be
            customized to your specific requirements.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {packages.map((pkg, index) => (
            <div key={index} className="rounded-lg overflow-hidden" style={{ backgroundColor: pkg.color }}>
              <div className="p-6">
                <h3 className="font-bold text-xl mb-2">{pkg.title}</h3>
                <p className="text-3xl font-bold mb-4">{pkg.price}</p>
                <Link href="/pilgrim/get-started">
                  <Button className="w-full bg-black text-white hover:bg-black/90">Book Now</Button>
                </Link>
              </div>
              <div className="bg-white p-6">
                <ul className="space-y-3">
                  {pkg.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <div className="h-5 w-5 rounded-full bg-gray-200 flex items-center justify-center">
                        <Check className="h-3 w-3" />
                      </div>
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
