import type { Metadata } from 'next'
import './globals.css'
import Layout from './components/Layout'

export const metadata: Metadata = {
  title: 'AI Accessibility Validator and Auto Fixer',
  description: 'AI-powered accessibility validator and auto-fixer for web applications',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Layout>{children}</Layout>
      </body>
    </html>
  )
}

