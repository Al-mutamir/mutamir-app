import Link from "next/link"
import Image from "next/image"
import { Mail, Share2, Globe2 } from "lucide-react"

const quickLinks = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/about", label: "About Us" },
  { href: "/contact", label: "Contact" },
]

const legalLinks = [
  { href: "/terms", label: "Terms of Service" },
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/refund", label: "Refund Policy" },
]

export function Footer() {
  return (
    <footer className="w-full border-t border-gray-100 bg-white">
      <div className="container py-20">
        <div className="mb-16 grid grid-cols-1 gap-12 text-left md:grid-cols-4">
          <div>
            <Image src="/images/logo.png" alt="Almutamir Logo" width={150} height={40} className="mb-8" />
            <p className="mb-8 leading-7 text-[#444746]">Your trusted partner for spiritual Hajj and Umrah journeys.</p>
            <div className="flex gap-4">
              {[Share2, Globe2, Mail].map((Icon, index) => (
                <a
                  key={index}
                  href={index === 2 ? "mailto:info@almutamir.com" : "#"}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F8F8F6] text-[#007F5F] transition-all hover:bg-[#007F5F] hover:text-white"
                  aria-label={index === 2 ? "Email Almutamir" : "Almutamir social link"}
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <FooterLinkGroup title="Quick Links" links={quickLinks} />
          <FooterLinkGroup title="Legal" links={legalLinks} />

          <div>
            <h3 className="mb-8 text-sm font-bold uppercase tracking-widest text-[#007F5F]">Contact</h3>
            <address className="space-y-4 not-italic text-[#444746]">
              <p>Email: info@almutamir.com</p>
              <p>Phone: +234 812 002 6622</p>
            </address>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-8 text-center text-sm text-[#444746]">
          <p>&copy; {new Date().getFullYear()} Almutamir. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

function FooterLinkGroup({ title, links }: { title: string; links: { href: string; label: string }[] }) {
  return (
    <div>
      <h3 className="mb-8 text-sm font-bold uppercase tracking-widest text-[#007F5F]">{title}</h3>
      <ul className="space-y-4 text-[#444746]">
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className="transition-colors hover:text-[#007F5F]">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default Footer
