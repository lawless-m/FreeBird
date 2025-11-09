import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'FreeBird - Personal Knowledge Base',
  description: 'Capture work, ideas, and outcomes across all your creative domains',
  manifest: '/manifest.json',
  themeColor: '#000000',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
