import type { NextApiRequest, NextApiResponse } from "next"
import nodemailer from "nodemailer"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" })

  const { to, subject, text, html } = req.body

  // Use environment variables for security in production!
  const email = "almutamirpilgrimage@gmail.com"
  const password = "dallvtfvidpkpadt"

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: email,
      pass: password,
    },
  })

  try {
    await transporter.sendMail({
      from: `"Almutamir" <${email}>`,
      to,
      subject,
      text,
      html,
    })
    res.status(200).json({ success: true })
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message })
  }
}