import React from 'react'
import nodemailer from 'nodemailer'
import { render } from '@react-email/render'
import AlMutamirEmail from '@/components/email/AlMutamirEmail'
import WelcomeEmail from '@/components/email/WelcomeEmail'
import RequestEmail from '@/components/email/RequestEmail'
import { getRandomEmailHero } from '@/components/email/hero'

const SMTP_HOST = process.env.SMTP_HOST
const SMTP_PORT = Number(process.env.SMTP_PORT || 587)
const SMTP_USER = process.env.SMTP_USER
const SMTP_PASS = process.env.SMTP_PASS
const FROM_EMAIL = process.env.FROM_EMAIL || 'no-reply@al-mutamir.com'

if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
  // eslint-disable-next-line no-console
  console.warn('SMTP config is missing - emails will not be sent until configured')
}

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_PORT === 465,
  auth: SMTP_USER && SMTP_PASS ? { user: SMTP_USER, pass: SMTP_PASS } : undefined,
})

async function mailerSend({ to, subject, html }: { to: string; subject: string; html: string }) {
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    // fallback: log
    // eslint-disable-next-line no-console
    console.log('MAILER SKIP send:', subject, '->', to)
    return
  }

  await transporter.sendMail({
    from: FROM_EMAIL,
    to,
    subject,
    html,
  })
}

export async function sendAlMutamirEmail(params: {
  to: string
  subject: string
  heading: string
  subheading?: string
  body: React.ReactNode
  ctaText?: string
  ctaUrl?: string
  hero?: 'kaaba' | 'hajj' | 'umrah'
}) {
  const hero = params.hero ?? getRandomEmailHero()
  const html = render(
    <AlMutamirEmail
      heading={params.heading}
      subheading={params.subheading}
      body={params.body}
      ctaText={params.ctaText}
      ctaUrl={params.ctaUrl}
      hero={hero}
    />
  )

  await mailerSend({ to: params.to, subject: params.subject, html })
  return { ok: true, hero }
}

export async function sendWelcomeEmail(opts: { to: string; name: string }) {
  const hero = getRandomEmailHero()
  const html = render(<WelcomeEmail name={opts.name} hero={hero} />)
  await mailerSend({ to: opts.to, subject: 'Welcome to Al‑Mutamir', html })
  return { ok: true, hero }
}

export async function sendRequestEmail(opts: { to: string; details: any }) {
  const hero = getRandomEmailHero()
  const html = render(<RequestEmail details={opts.details} hero={hero} />)
  await mailerSend({ to: opts.to, subject: 'Request received', html })
  return { ok: true, hero }
}

export async function sendPaymentSuccessEmail(opts: {
  to: string
  name?: string
  bookingId: string
  amountNgn: number
  packageTitle?: string
}) {
  const hero = getRandomEmailHero()
  const body = (
    <div>
      <p>Hi {opts.name ?? 'Customer'},</p>
      <p>
        We've successfully received your payment of <strong>₦{opts.amountNgn.toLocaleString()}</strong> for{' '}
        <strong>{opts.packageTitle ?? 'your booking'}</strong>.
      </p>
      <p>Your booking reference is <strong>{opts.bookingId}</strong>.</p>
      <p>
        You can view your booking here: <a href={`${process.env.NEXT_PUBLIC_APP_URL}/booking/${opts.bookingId}`}>View booking</a>
      </p>
    </div>
  )

  const html = render(
    <AlMutamirEmail
      heading="Payment successful"
      subheading="Payment received"
      body={body}
      ctaText="View booking"
      ctaUrl={`${process.env.NEXT_PUBLIC_APP_URL}/booking/${opts.bookingId}`}
      hero={hero}
    />
  )

  await mailerSend({ to: opts.to, subject: 'Payment received — Al‑Mutamir', html })
  return { ok: true, hero }
}
