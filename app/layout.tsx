import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import './globals.css'

export const metadata: Metadata = {
  title: 'FyberOS',
  description: 'Operating system for fiber contractors',
}

const navItems = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Branches', href: '/branches' },
  { label: 'Projects', href: '/projects' },
  { label: 'Crews', href: '/crews' },
  { label: 'Employees', href: '/employees' },
  { label: 'Subcontractors', href: '/subcontractors' },
  { label: 'Production', href: '/production' },
  { label: 'Reports', href: '/reports' },
  { label: 'Time Tracking', href: '/time-tracking' },
]

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-fyber-bg text-white">
        <div className="flex min-h-screen">
          {/* SIDEBAR */}
          <aside className="hidden w-72 shrink-0 border-r border-white/10 bg-black/20 backdrop-blur xl:flex xl:flex-col">
            <div className="border-b border-white/10 px-6 py-4">
              <Link href="/dashboard" className="flex items-center justify-center">
                <Image
                  src="/fyber-logov5.png"
                  alt="Fyber logo"
                  width={180}
                  height={52}
                  className="w-[180px] h-auto object-contain"
                  priority
                />
              </Link>
            </div>

            <div className="flex-1 px-4 py-6">
              <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
                Navigation
              </p>

              <nav className="space-y-2">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="block rounded-xl border border-transparent px-4 py-3 text-sm font-medium text-white/75 transition hover:border-cyan-400/20 hover:bg-white/5 hover:text-white"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>

            {/* ORGANIZATION CARD */}
            <div className="border-t border-white/10 p-4">
              <div className="rounded-2xl border border-cyan-400/10 bg-white/5 p-4 shadow-[0_0_30px_rgba(0,180,255,0.08)]">
                <p className="text-xs uppercase tracking-[0.18em] text-white/40">
                  Active Organization
                </p>
                <div className="mt-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-white">Ajalax LLC</p>
                    <p className="text-xs text-white/50">Starter Workspace</p>
                  </div>

                  {/* Más adelante aquí va el logo del cliente */}
                  <div className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-300">
                    Client Logo
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* MAIN AREA */}
          <div className="flex min-h-screen flex-1 flex-col">
            {/* TOPBAR */}
            <header className="sticky top-0 z-20 border-b border-white/10 bg-black/20 backdrop-blur">
              <div className="flex items-center justify-between gap-4 px-5 py-4 sm:px-8">
                <div className="flex items-center gap-4">
                  <div className="xl:hidden">
                    <Image
                      src="/fyber-logo.png"
                      alt="Fyber logo"
                      width={140}
                      height={40}
                      className="h-auto w-auto max-w-[140px]"
                      priority
                    />
                  </div>

                  <div className="hidden sm:block">
                    <p className="text-xs uppercase tracking-[0.2em] text-white/40">
                      FyberOS
                    </p>
                    <h1 className="text-lg font-semibold text-white">
                      Fiber Contractor Platform
                    </h1>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="hidden rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm font-medium text-cyan-200 sm:block">
                    Ajalax Admin
                  </div>

                  <div className="h-10 w-10 rounded-full border border-white/10 bg-white/10" />
                </div>
              </div>
            </header>

            {/* PAGE CONTENT */}
            <main className="flex-1 px-5 py-6 sm:px-8">{children}</main>
          </div>
        </div>
      </body>
    </html>
  )
}