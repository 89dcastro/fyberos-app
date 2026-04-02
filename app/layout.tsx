import './globals.css'

export const metadata = {
  title: 'FyberOS',
  description: 'Fiber Contractor Platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-fyber-bg text-white">
        {children}
      </body>
    </html>
  )
}