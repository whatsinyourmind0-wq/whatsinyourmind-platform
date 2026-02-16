import type { Metadata } from 'next'
import './globals.css'
import Header from './components/layout/Header'
import Footer from './components/layout/Footer'

export const metadata: Metadata = {
  title: 'WhatsInYourMind — The Anonymous Coffee Shop of the Internet',
  description: 'A text-only, follower-free social platform. No vanity metrics. No rage algorithms. Just thoughts, context, and resonance.',
  keywords: ['social media', 'text only', 'no followers', 'anonymous', 'thoughts', 'open source', 'india'],
  openGraph: {
    title: 'WhatsInYourMind',
    description: 'No followers. No algorithms. Just thoughts.',
    type: 'website',
    siteName: 'WhatsInYourMind',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Header />
        <main style={{ flex: 1 }}>{children}</main>
        <Footer />
      </body>
    </html>
  )
}
