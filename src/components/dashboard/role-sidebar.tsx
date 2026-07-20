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
      { href: '/dashboard/super-admin/events', label: 'Manajemen Acara', icon: 'event' },
      { href: '/dashboard/super-admin/participants', label: 'Peserta Global', icon: 'groups' },
      { href: '/dashboard/super-admin/admin-accounts', label: 'Manajemen Admin', icon: 'manage_accounts' },
      { href: '/dashboard/super-admin/global-reports', label: 'Laporan Global', icon: 'assessment' },
      { href: '/dashboard/super-admin/audit-logs', label: 'Audit Log', icon: 'history' },
      { href: '/dashboard/super-admin/settings', label: 'Pengaturan Global', icon: 'settings' },
    ]
  } else if (dashboardType === 'admin-event') {
    links = [
      { href: '/dashboard/admin-event', label: 'Pilih Acara', icon: 'dashboard' },
      ...(eventId ? [
        { href: `/dashboard/admin-event/events/${eventId}/overview`, label: 'Ringkasan Acara', icon: 'event_note' },
        { href: `/dashboard/admin-event/events/${eventId}/participants`, label: 'Peserta', icon: 'group' },
        { href: `/dashboard/admin-event/events/${eventId}/import`, label: 'Import Peserta', icon: 'upload_file' },
        { href: `/dashboard/admin-event/events/${eventId}/tickets`, label: 'Tiket', icon: 'local_activity' },
        { href: `/dashboard/admin-event/events/${eventId}/scanner`, label: 'Scanner', icon: 'qr_code_scanner' },
        { href: `/dashboard/admin-event/events/${eventId}/attendance`, label: 'Kehadiran', icon: 'how_to_reg' },
        { href: `/dashboard/admin-event/events/${eventId}/email-templates`, label: 'Template Email', icon: 'forward_to_inbox' },
        { href: `/dashboard/admin-event/events/${eventId}/broadcasts`, label: 'Broadcasts', icon: 'campaign' },
        { href: `/dashboard/admin-event/events/${eventId}/team`, label: 'Tim & Staf', icon: 'badge' },
        { href: `/dashboard/admin-event/events/${eventId}/reports`, label: 'Laporan', icon: 'receipt_long' },
        { href: `/dashboard/admin-event/events/${eventId}/settings`, label: 'Pengaturan', icon: 'settings' },
      ] : [])
    ]
  } else if (dashboardType === 'admin-registrasi') {
    links = [
      { href: '/dashboard/admin-registrasi', label: 'Pilih Acara', icon: 'dashboard' },
      ...(eventId ? [
        { href: `/dashboard/admin-registrasi/events/${eventId}/participants`, label: 'Peserta', icon: 'group' },
        { href: `/dashboard/admin-registrasi/events/${eventId}/participants/new`, label: 'Tambah Peserta', icon: 'person_add' },
        { href: `/dashboard/admin-registrasi/events/${eventId}/import`, label: 'Import Peserta', icon: 'upload_file' },
        { href: `/dashboard/admin-registrasi/events/${eventId}/ticket-status`, label: 'Status Tiket & Email', icon: 'mark_email_read' },
        { href: `/dashboard/admin-registrasi/events/${eventId}/registration-preview`, label: 'Preview Form', icon: 'preview' },
      ] : [])
    ]
  } else if (dashboardType === 'admin-scanner') {
    links = [
      { href: '/dashboard/admin-scanner', label: 'Pilih Acara', icon: 'dashboard' },
      ...(eventId ? [
        { href: `/dashboard/admin-scanner/events/${eventId}/scan`, label: 'Scan QR', icon: 'qr_code_scanner' },
        { href: `/dashboard/admin-scanner/events/${eventId}/manual-checkin`, label: 'Manual Check-in', icon: 'fact_check' },
        { href: `/dashboard/admin-scanner/events/${eventId}/recent-checkins`, label: 'Check-ins Terbaru', icon: 'history' },
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
