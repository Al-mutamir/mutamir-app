import type React from "react"
import "@/app/globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProviderWithRoleHandler } from "@/context/auth-context"
import { SiteHeader } from "@/components/site-header"
import { Footer } from "@/components/footer"

// Ensure Firebase is initialized
import "@/lib/firebase/config"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Al-Mutamir - Your Trusted Hajj and Umrah Partner",
  description: "Connect with reliable Hajj and Umrah services for a spiritually fulfilling journey.",
  keywords: [
    "Hajj",
    "Umrah",
    "Pilgrimage",
    "Islamic Travel",
    "Spiritual Journey",
    "Al-Mutamir",
    "Travel Services",
    "Religious Tourism",
    "Halal Travel",
    "Faith-Based Travel"
  ],
  authors: [{ name: "Al-Mutamir", url: "https://almutamir.com" }],
  creator: "Al-Mutamir",
  openGraph: {
    title: "Al-Mutamir - Your Trusted Hajj and Umrah Partner",
    description: "Connect with reliable Hajj and Umrah services for a spiritually fulfilling journey.",
    url: "https://almutamirpilgrimage.com",
    siteName: "Al-Mutamir",
    images: [
      {
        url: "https://almutamirpilgrimage.com/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Al-Mutamir - Your Trusted Hajj and Umrah Partner"
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
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <AuthProviderWithRoleHandler>
            <SiteHeader />
            <main>{children}</main>
            <Footer />
          </AuthProviderWithRoleHandler>
        </ThemeProvider>
      </body>
    </html>
  )
}
