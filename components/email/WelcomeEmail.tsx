import React from 'react'
import AlMutamirEmail from './AlMutamirEmail'

export default function WelcomeEmail({ name, hero }: { name: string; hero?: 'kaaba' | 'hajj' | 'umrah' }) {
  return (
    <AlMutamirEmail
      heading={`Hey ${name} 👋`}
      subheading="Thanks for signing up!"
      body={<div>Welcome to Al‑Mutamir — we&apos;re excited to have you on board.</div>}
      ctaText="Get started"
      ctaUrl={`${process.env.NEXT_PUBLIC_APP_URL || ''}/get-started`}
      hero={hero}
    />
  )
}
