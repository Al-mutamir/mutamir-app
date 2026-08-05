import type { NextApiRequest, NextApiResponse } from 'next'
import {
  sendWelcomeEmail,
  sendAlMutamirEmail,
} from '@/lib/email/send'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' })
  }

  try {
    const { to, subject, text, html, name } = req.body || {}

    if (!to || !subject) {
      return res.status(400).json({ ok: false, error: 'Missing required fields: to, subject' })
    }

    // If this looks like a welcome email and a name was supplied, use the typed helper
    if (/welcome/i.test(subject) && name) {
      await sendWelcomeEmail({ to, name })
      return res.status(200).json({ ok: true })
    }

    // Otherwise, construct a generic AlMutamir email using the provided HTML or text
    const body = html ?? text ?? ''

    await sendAlMutamirEmail({
      to,
      subject,
      heading: subject,
      body,
    })

    return res.status(200).json({ ok: true })
  } catch (err: any) {
    console.error('send-confirmation error', err)
    return res.status(500).json({ ok: false, error: err?.message || 'send failed' })
  }
}
