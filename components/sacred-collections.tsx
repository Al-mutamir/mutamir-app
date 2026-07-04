import { Gem, Landmark, Mountain, Sparkles } from "lucide-react"

const collections = [
  { label: "Mosque visits", icon: Landmark },
  { label: "Sacred moments", icon: Sparkles },
  { label: "Heritage stops", icon: Gem },
  { label: "Journey views", icon: Mountain },
]

export default function SacredCollections() {
  return (
    <section className="container overflow-hidden py-20">
      <div className="mb-12 flex flex-col items-start gap-6 md:flex-row md:items-center">
        <h2 className="text-3xl font-bold tracking-normal text-[#1a1c1b] md:text-5xl">Sacred Collections</h2>
        <div className="hidden h-px flex-1 bg-gray-200 md:block" />
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {collections.map((item) => {
          const Icon = item.icon

          return (
            <div
              key={item.label}
              className="group flex aspect-square items-center justify-center rounded-2xl border border-gray-100 bg-[#f1f1ef] p-8 transition-all hover:border-[#007F5F]/30"
              aria-label={item.label}
            >
              <Icon className="h-12 w-12 text-[#007F5F]/35 transition-all group-hover:scale-110 group-hover:text-[#007F5F]" />
            </div>
          )
        })}
      </div>
    </section>
  )
}
