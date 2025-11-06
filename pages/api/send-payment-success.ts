import type { NextApiRequest, NextApiResponse } from 'next'
import { sendPaymentSuccessEmail } from '@/lib/email/send'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { email, name, bookingId, amountNgn, packageTitle } = req.body
    if (!email || !bookingId || !amountNgn) return res.status(400).json({ ok: false, error: 'missing fields' })

    await sendPaymentSuccessEmail({
      to: email,
      name,
      bookingId,
      amountNgn: Number(amountNgn),
      packageTitle,
    })

    return res.status(200).json({ ok: true })
  } catch (err: any) {
    console.error('send-payment-success error', err)
    return res.status(500).json({ ok: false, error: err?.message || 'send failed' })
  }
}
