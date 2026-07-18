'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function EventTabs({ eventId }: { eventId: string }) {
  const pathname = usePathname()

  const tabs = [
    { name: 'Ringkasan', href: `/dashboard/super-admin/events/${eventId}/overview` },
    { name: 'Peserta', href: `/dashboard/super-admin/events/${eventId}/participants` },
    { name: 'Kehadiran', href: `/dashboard/super-admin/events/${eventId}/attendance` },
    { name: 'Email Queue', href: `/dashboard/super-admin/events/${eventId}/emails` },
    { name: 'Broadcast', href: `/dashboard/super-admin/events/${eventId}/broadcasts` },
    { name: 'Laporan', href: `/dashboard/super-admin/events/${eventId}/reports` },
    { name: 'Audit Log', href: `/dashboard/super-admin/events/${eventId}/audit-log` },
    { name: 'Pengaturan', href: `/dashboard/super-admin/events/${eventId}/settings` },
  ]

  return (
    <div className="border-b border-border-light mb-6 flex overflow-x-auto hide-scrollbar">
      {tabs.map(tab => {
        const isActive = pathname.startsWith(tab.href)
        return (
          <Link
            key={tab.name}
            href={tab.href}
            className={`whitespace-nowrap px-4 py-3 font-label-md text-[14px] font-semibold transition-colors border-b-2 ${
              isActive
                ? 'border-primary text-primary'
                : 'border-transparent text-text-muted hover:text-text-main hover:border-border-light'
            }`}
          >
            {tab.name}
          </Link>
        )
      })}
    </div>
  )
}
