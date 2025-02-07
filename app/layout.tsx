import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'habit tracker',
  description: 'made by cc <3',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
