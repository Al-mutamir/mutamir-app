// utils/sendWelcomeEmail.ts
export async function sendWelcomeEmail(to: string, name: string) {
  await fetch("/api/send-confirmation", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      to,
      subject: "Welcome to Al-Mutamir!",
      text: `Dear ${name},\n\nWelcome to Al-Mutamir! We're excited to have you on board.`,
      html: `<p>Dear ${name},</p><p>Welcome to Al-Mutamir! We're excited to have you on board.</p>`,
    }),
  })
}