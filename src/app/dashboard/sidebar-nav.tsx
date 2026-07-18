'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function SidebarNav({ isSuperAdmin }: { isSuperAdmin: boolean }) {
  const pathname = usePathname()

  const links = [
    { href: '/dashboard', label: 'Ringkasan', icon: 'dashboard' },
    { href: '/dashboard/events', label: 'Acara', icon: 'event' },
    { href: '/dashboard/participants', label: 'Peserta', icon: 'group' },
    { href: '/dashboard/reports', label: 'Laporan', icon: 'assessment' },
  ]

  if (isSuperAdmin) {
    links.push({ href: '/dashboard/settings', label: 'Pengaturan', icon: 'settings' })
  }

  return (
    <nav className="flex-1 flex flex-col gap-1">
      {links.map(link => {
        // Active if exact match or if it's a subpath of events/participants
        // but ensure /dashboard exact match doesn't light up for everything
        const isActive = link.href === '/dashboard' 
          ? pathname === '/dashboard'
          : pathname.startsWith(link.href)

        if (isActive) {
          return (
            <Link key={link.href} href={link.href} className="flex items-center gap-3 bg-secondary-container text-on-secondary-container rounded-lg px-4 py-3 mx-2 transition-colors hover:bg-primary-fixed-dim/10">
              <span className="material-symbols-outlined">{link.icon}</span>
              <span className="font-label-md text-[14px] font-semibold">{link.label}</span>
            </Link>
          )
        }

        return (
          <Link key={link.href} href={link.href} className="flex items-center gap-3 text-on-primary-fixed-variant hover:text-on-primary px-4 py-3 mx-2 transition-colors hover:bg-primary-fixed-dim/10">
            <span className="material-symbols-outlined">{link.icon}</span>
            <span className="font-label-md text-[14px] font-semibold">{link.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
