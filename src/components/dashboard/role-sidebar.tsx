'use client'

import Link from 'next/link'
import { usePathname, useParams } from 'next/navigation'
import type { DashboardType } from './dashboard-shell'

export function SidebarNav({ dashboardType }: { dashboardType: DashboardType }) {
  const pathname = usePathname()
  const params = useParams()
  const eventId = params.eventId as string | undefined

  let links: { href: string; label: string; icon: string }[] = []

  if (dashboardType === 'super-admin') {
    links = [
      { href: '/dashboard/super-admin', label: 'Ringkasan Global', icon: 'monitoring' },
      { href: '/dashboard/super-admin/events', label: 'Semua Acara', icon: 'event' },
      { href: '/dashboard/super-admin/users', label: 'Admin & Staf', icon: 'manage_accounts' },
      { href: '/dashboard/super-admin/reports', label: 'Laporan Global', icon: 'assessment' },
    ]
  } else if (dashboardType === 'admin-event') {
    links = [
      { href: '/dashboard/admin-event', label: 'Pilih Acara', icon: 'dashboard' },
      ...(eventId ? [
        { href: `/dashboard/admin-event/events/${eventId}/overview`, label: 'Ringkasan Acara', icon: 'event_note' },
        { href: `/dashboard/admin-event/events/${eventId}/participants`, label: 'Peserta', icon: 'group' },
        { href: `/dashboard/admin-event/events/${eventId}/team`, label: 'Tim & Staf', icon: 'badge' },
        { href: `/dashboard/admin-event/events/${eventId}/broadcasts`, label: 'Email & Broadcast', icon: 'mail' },
        { href: `/dashboard/admin-event/events/${eventId}/reports`, label: 'Laporan', icon: 'receipt_long' },
      ] : [])
    ]
  } else if (dashboardType === 'admin-registrasi') {
    links = [
      { href: '/dashboard/admin-registrasi', label: 'Pilih Acara', icon: 'dashboard' },
      ...(eventId ? [
        { href: `/dashboard/admin-registrasi/events/${eventId}/participants`, label: 'Meja Registrasi', icon: 'how_to_reg' },
        { href: `/dashboard/admin-registrasi/events/${eventId}/import`, label: 'Import Excel/CSV', icon: 'upload_file' },
        { href: `/dashboard/admin-registrasi/events/${eventId}/issues`, label: 'Masalah Email', icon: 'error' },
      ] : [])
    ]
  } else if (dashboardType === 'admin-scanner') {
    links = [
      { href: '/dashboard/admin-scanner', label: 'Pilih Acara', icon: 'dashboard' },
      ...(eventId ? [
        { href: `/dashboard/admin-scanner/events/${eventId}/scan`, label: 'QR Scanner', icon: 'qr_code_scanner' },
        { href: `/dashboard/admin-scanner/events/${eventId}/manual-checkin`, label: 'Check-in Manual', icon: 'fact_check' },
      ] : [])
    ]
  }

  return (
    <nav className="flex-1 flex flex-col gap-1">
      {links.map(link => {
        // Active if exact match or if it's a subpath of a section
        // but ensure root path exact match doesn't light up for everything
        const isRootOfDashboard = [
          '/dashboard/super-admin', 
          '/dashboard/admin-event', 
          '/dashboard/admin-registrasi', 
          '/dashboard/admin-scanner'
        ].includes(link.href)
        
        const isActive = isRootOfDashboard
          ? pathname === link.href
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
