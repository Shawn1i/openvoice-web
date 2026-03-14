import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'OpenVoice — Learn English Through Conversation',
  description: 'Oral-first English learning for newcomers and refugees',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#FAF8F5]">{children}</body>
    </html>
  )
}
