import type React from "react"
import "@/app/globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProviderWithRoleHandler } from "@/context/auth-context"
import { SiteHeader } from "@/components/site-header"
import { Footer } from "@/components/footer"
import { GoogleAnalytics } from '@next/third-parties/google'
import { Analytics } from "@vercel/analytics/next"

// Ensure Firebase is initialized
import "@/lib/firebase/config"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Almutamir - Your Trusted Hajj and Umrah Partner",
  description: "Connect with reliable Hajj and Umrah services for a spiritually fulfilling journey.",
  keywords: [
    "Hajj",
    "Umrah",
    "Pilgrimage",
    "Islamic Travel",
    "Spiritual Journey",
    "Almutamir",
    "Travel Services",
    "Religious Tourism",
    "Halal Travel",
    "Faith-Based Travel",
    "save for hajj and umrah",
    "cheap hajj packages",
    "cheap umrah packages",
    "luxury hajj packages",
    "luxury umrah packages",
    "hajj visa assistance",
    "umrah visa assistance",
    "group hajj packages",
    "family umrah packages",
    "hajj and umrah deals",
    "best hajj packages",
    "best umrah packages",
    "hajj and umrah offers",
    "affordable hajj packages",
    "affordable umrah packages",
    "hajj and umrah discounts",
    "hajj and umrah promotions",
    "hajj and umrah travel agency",
    "trusted hajj and umrah services",
    "reliable hajj and umrah partner",
    "hajj and umrah planning",
    "hajj and umrah arrangements",
    "hajj and umrah bookings",
    "hajj and umrah itineraries",
    "hajj and umrah accommodations",
    "hajj and umrah transportation",
    "hajj and umrah packages for seniors",
    "hajj and umrah packages for students",
    "custom hajj packages",
    "custom umrah packages",
    "hajj and umrah customer support",
    "hajj and umrah reviews",
    "hajj and umrah testimonials",
    "hajj and umrah experiences",
    "hajj and umrah blog",
    "hajj and umrah tips",
    "hajj and umrah guides",
    "hajj and umrah resources",
    "hajj and umrah FAQs",
    "hajj and umrah policies",
    "hajj and umrah terms and conditions",
    "hajj and umrah refund policy",
  ],
  authors: [{ name: "Almutamir", url: "https://almutamir.com" }],
  creator: "Almutamir",
  openGraph: {
    title: "Almutamir - Your Trusted Hajj and Umrah Partner",
    description: "Connect with reliable Hajj and Umrah services for a spiritually fulfilling journey.",
    url: "https://almutamirpilgrimage.com",
    siteName: "Almutamir",
    images: [
      {
        url: "https://almutamirpilgrimage.com/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Almutamir - Your Trusted Hajj and Umrah Partner"
      }
    ],
    locale: "en_US",
    type: "website"
  },  
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Analytics />
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <AuthProviderWithRoleHandler>
            <SiteHeader />
            <main>{children}</main>
            <Footer />
          </AuthProviderWithRoleHandler>
        </ThemeProvider>
      </body>
      <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID || 'G-79E3MHKNQD'} />
    </html>
  )
}
