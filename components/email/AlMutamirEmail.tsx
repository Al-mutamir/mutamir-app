import React from 'react'
import {
  Body,
  Container,
  Head,
  Html,
  Img,
  Preview,
  Section,
  Text,
  Row,
  Column,
  Button,
} from '@react-email/components'

type Props = {
  preview?: string
  heading: string
  subheading?: string
  body: React.ReactNode
  ctaText?: string
  ctaUrl?: string
  hero?: 'kaaba' | 'hajj' | 'umrah'
}

const IMAGE_BASE = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') || ''

export default function AlMutamirEmail({
  preview = 'Al‑Mutamir notification',
  heading,
  subheading,
  body,
  ctaText,
  ctaUrl,
  hero = 'kaaba',
}: Props) {
  const heroMap: Record<string, string> = {
    kaaba: `${IMAGE_BASE}/images/kaaba-package.jpg`,
    hajj: `${IMAGE_BASE}/images/hajj.jpg`,
    umrah: `${IMAGE_BASE}/images/umrah.jpg`,
  }
  const heroUrl = heroMap[hero] ?? heroMap.kaaba
  const logoUrl = `${IMAGE_BASE}/images/logo-white.png`

  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Img src={logoUrl} alt="Al‑Mutamir" width="120" height="40" style={logo} />
          </Section>

          <Section style={{ ...heroSection, backgroundImage: `url(${heroUrl})` }}>
            <Text style={heroHeading}>{heading}</Text>
            {subheading && <Text style={heroSub}>{subheading}</Text>}
          </Section>

          <Section style={content}>
            <Text style={bodyText}>{body}</Text>

            {ctaText && ctaUrl && (
              <Row style={{ marginTop: 18 }}>
                <Column>
                  <Button pX={18} pY={12} style={ctaButton} href={ctaUrl}>
                    {ctaText}
                  </Button>
                </Column>
              </Row>
            )}
          </Section>

          <Section style={footer}>
            <Text style={footerText}>© {new Date().getFullYear()} Al‑Mutamir. All rights reserved.</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

const main = {
  backgroundColor: '#f3f7fa',
  fontFamily: '-apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial',
}

const container = {
  maxWidth: 600,
  margin: '0 auto',
  backgroundColor: '#ffffff',
  borderRadius: 8,
  overflow: 'hidden' as const,
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
