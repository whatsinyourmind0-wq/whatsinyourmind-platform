import type { Metadata } from 'next'
import { Inter, Noto_Sans_JP } from 'next/font/google'
import './globals.css'
import Header from './components/layout/Header'
import Footer from './components/layout/Footer'

const inter = Inter({ subsets: ['latin'] })
const notoSansJP = Noto_Sans_JP({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-noto-sans-jp'
})

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

import { LanguageProvider } from './lib/contexts/LanguageContext'

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} ${notoSansJP.variable}`} style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <LanguageProvider>
          <Header />
          <main style={{ flex: 1 }}>{children}</main>
          <Footer />
        </LanguageProvider>
      </body>
    </html>
  )
}
