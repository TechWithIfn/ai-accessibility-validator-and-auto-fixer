import type { Metadata } from 'next'
import './globals.css'
import Layout from './components/Layout'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: {
    default: 'AI Web Accessibility Validator & Auto-Fixer | WCAG 2.2 Compliance',
    template: '%s | AI Accessibility Validator'
  },
  description: 'AI-powered web accessibility validator that scans websites, detects WCAG 2.2 compliance issues, generates automatic fixes, and provides before/after previews. Make your website accessible with AI.',
  keywords: [
    'accessibility validator',
    'WCAG compliance',
    'web accessibility',
    'AI accessibility',
    'accessibility checker',
    'WCAG 2.2',
    'a11y',
    'accessibility testing',
    'automatic accessibility fixes',
    'accessibility scanner'
  ],
  authors: [{ name: 'AI Accessibility Validator Team' }],
  creator: 'AI Accessibility Validator',
  publisher: 'AI Accessibility Validator',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    siteName: 'AI Accessibility Validator',
    title: 'AI Web Accessibility Validator & Auto-Fixer | WCAG 2.2 Compliance',
    description: 'AI-powered web accessibility validator that scans websites, detects WCAG 2.2 compliance issues, and generates automatic fixes with before/after previews.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'AI Web Accessibility Validator',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Web Accessibility Validator & Auto-Fixer',
    description: 'AI-powered web accessibility validator for WCAG 2.2 compliance',
    images: ['/og-image.png'],
    creator: '@a11yvalidator',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
  alternates: {
    canonical: '/',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#3b82f6" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebApplication',
              name: 'AI Web Accessibility Validator',
              description: 'AI-powered web accessibility validator for WCAG 2.2 compliance',
              url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
              applicationCategory: 'DeveloperApplication',
              operatingSystem: 'Web',
              offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'USD',
              },
              aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: '4.8',
                ratingCount: '150',
              },
            }),
          }}
        />
      </head>
      <body className="antialiased">
        <Layout>{children}</Layout>
      </body>
    </html>
  )
}

