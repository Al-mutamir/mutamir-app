type Props = {
  preview?: string
  heading: string
  subheading?: string
  body: string
  ctaText?: string
  ctaUrl?: string
  hero?: 'kaaba' | 'hajj' | 'umrah'
}

const IMAGE_BASE = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') || ''

export default function AlMutamirEmail({
  preview = 'Al–Mutamir notification',
  heading,
  subheading,
  body,
  ctaText,
  ctaUrl,
  hero = 'kaaba',
}: Props): string {
  const heroMap: Record<string, string> = {
    kaaba: `${IMAGE_BASE}/images/kaaba-package.jpg`,
    hajj: `${IMAGE_BASE}/images/hajj.jpg`,
    umrah: `${IMAGE_BASE}/images/umrah.jpg`,
  }
  const heroUrl = heroMap[hero] ?? heroMap.kaaba
  const logoUrl = `${IMAGE_BASE}/images/logo-white.png`

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charSet="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${preview}</title>
</head>
<body style="margin:0;padding:0;background:#f6f6f6;font-family:sans-serif;">
  <div style="max-width:600px;margin:40px auto;background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px #0001;">
    <div style="background:#222;padding:24px 0;text-align:center;">
      <img src="${logoUrl}" alt="Al–Mutamir" width="120" height="40" style="display:inline-block;" />
    </div>
    <div style="background:url('${heroUrl}') center/cover no-repeat;padding:40px 24px 24px 24px;text-align:center;">
      <h1 style="margin:0;font-size:2rem;color:#fff;text-shadow:0 2px 8px #0007;">${heading}</h1>
      ${subheading ? `<h2 style=\"margin:8px 0 0 0;font-size:1.1rem;color:#fff;text-shadow:0 1px 4px #0007;\">${subheading}</h2>` : ''}
    </div>
    <div style="padding:32px 24px 24px 24px;">
      <div style="font-size:1rem;color:#222;line-height:1.6;margin-bottom:24px;">${body}</div>
          ${ctaText && ctaUrl ? `<div style=\"text-align:center;margin:32px 0 0 0;\"><a href=\"${ctaUrl}\" style=\"display:inline-block;padding:12px 32px;background:#008000;color:#fff;border-radius:4px;text-decoration:none;font-weight:600;font-size:1rem;\" target=\"_blank\" rel=\"noopener noreferrer\">${ctaText}</a></div>` : ''}
        </div>
        <div style="background:#f6f6f6;padding:16px 0;text-align:center;font-size:0.9rem;color:#888;">
          &copy; ${new Date().getFullYear()} Al–Mutamir. All rights reserved.
        </div>
      </div>
    </body>
    </html>`
    }
const header = {
  backgroundColor: '#0f1724',
  padding: '18px 24px',
  textAlign: 'center' as const,
}

const logo = {
  display: 'block',
  margin: '0 auto',
}

const heroSection = {
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  padding: '36px 24px',
  textAlign: 'center' as const,
  color: '#fff',
}

const heroHeading = {
  fontSize: 24,
  fontWeight: 700,
  margin: 0,
  textShadow: '0 2px 8px rgba(0,0,0,0.45)',
}

const heroSub = {
  fontSize: 14,
  marginTop: 8,
  opacity: 0.95,
}

const content = {
  padding: '28px 32px',
  color: '#111827',
  lineHeight: 1.5,
  fontSize: 15,
}

const bodyText = {
  margin: 0,
}

const ctaButton = {
  backgroundColor: '#0ea5a0',
  color: '#fff',
  borderRadius: 6,
  fontWeight: 600,
  textDecoration: 'none',
}

const footer = {
  padding: '18px 24px',
  textAlign: 'center' as const,
  backgroundColor: '#fafafa',
}

const footerText = {
  color: '#6b7280',
  fontSize: 12,
}
