import React from 'react'
import AlMutamirEmail from './AlMutamirEmail'

export default function RequestEmail({ details, hero }: { details: any; hero?: 'kaaba' | 'hajj' | 'umrah' }) {
  return (
    <AlMutamirEmail
      heading="Request Received"
      subheading="We received your request"
      body={<div>We've received your request. Details: <pre>{JSON.stringify(details, null, 2)}</pre></div>}
      ctaText="View request"
      ctaUrl={`${process.env.NEXT_PUBLIC_APP_URL || ''}/requests`}
      hero={hero}
    />
  )
}
