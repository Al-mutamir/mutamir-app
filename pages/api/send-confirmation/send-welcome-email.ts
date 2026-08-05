import type { NextApiRequest, NextApiResponse } from 'next'
import { sendWelcomeEmail } from '@/lib/email/send'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' })
  }

  try {
    const { email, name } = req.body || {}
    if (!email) return res.status(400).json({ ok: false, error: 'email is required' })

    await sendWelcomeEmail({ to: email, name: name ?? '' })

    return res.status(200).json({ ok: true })
  } catch (err: any) {
    console.error('send-welcome-email error', err)
    return res.status(500).json({ ok: false, error: err?.message || 'send failed' })
  }
}
