import nodemailer from "nodemailer"

// Use environment variables for security in production!
  const our_email = "almutamirpilgrimage@gmail.com"
  const password = "dallvtfvidpkpadt"

export async function sendWelcomeEmail(email: string, name: string) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: our_email,
      pass: password,
    }
  })

  await transporter.sendMail({
    from: '"Almutamir" <no-reply@Almutamir.com>',
    to: email,
    subject: "Welcome to Almutamir!",
    html: `<p>Dear ${name},</p>
      <p>Welcome to Almutamir! We're excited to have you on board.</p>
      <p>Best regards,<br/>The Almutamir Team</p>`,
  })
}