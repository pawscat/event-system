'use client'

import { useState } from 'react'
import { SidebarNav } from './role-sidebar'
import { UserNav } from './user-nav'

export type DashboardType = 'super-admin' | 'admin-event' | 'admin-registrasi' | 'admin-scanner'

export function DashboardClientShell({
  children,
  dashboardType,
  userName,
}: {
  children: React.ReactNode
  dashboardType: DashboardType
  userName: string
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen)
  const closeSidebar = () => setIsSidebarOpen(false)

  return (
    <div className="bg-background-subtle text-on-background font-body-md min-h-screen">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* SideNavBar */}
      <aside className={`fixed h-full w-[260px] left-0 top-0 bg-primary shadow-md z-50 flex flex-col py-4 transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="px-6 mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-headline-sm font-semibold text-on-primary flex items-center gap-2">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>event</span>
              Event Ku
            </h1>
            <p className="font-label-sm text-[12px] text-on-primary-fixed-variant mt-1">
              {dashboardType === 'super-admin' && 'Super Admin Panel'}
              {dashboardType === 'admin-event' && 'Event Admin'}
              {dashboardType === 'admin-registrasi' && 'Registration Admin'}
              {dashboardType === 'admin-scanner' && 'Scanner Admin'}
            </p>
          </div>
          <button onClick={closeSidebar} className="lg:hidden text-on-primary-fixed-variant hover:text-on-primary p-1">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <div onClick={() => { if (window.innerWidth < 1024) closeSidebar() }} className="flex-1 flex flex-col gap-1 w-full">
          <SidebarNav dashboardType={dashboardType} />
        </div>
      </aside>

      {/* TopNavBar */}
      <header className="fixed top-0 right-0 w-full lg:w-[calc(100%-260px)] flex justify-between items-center h-16 px-4 lg:px-6 bg-surface z-30 border-b border-border-light transition-all">
        <div className="flex items-center gap-4 flex-1">
          <button onClick={toggleSidebar} className="lg:hidden text-text-muted hover:text-text-main p-1">
            <span className="material-symbols-outlined">menu</span>
          </button>
          
          {dashboardType === 'super-admin' && (
            <div className="relative flex-1 max-w-md hidden sm:block">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-[20px]">search</span>
              <input
                className="w-full pl-10 pr-4 py-2 bg-surface-container-low border-none rounded-lg focus:ring-2 focus:ring-secondary text-body-sm font-body-sm text-text-main placeholder:text-text-muted outline-none"
                placeholder="Cari acara, peserta, atau laporan..."
                type="text"
              />
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 sm:gap-4 ml-4">
          <button className="text-text-muted hover:text-text-main hover:bg-surface-container-low rounded-full p-2 scale-95 active:scale-100 transition-transform relative">
            <span className="material-symbols-outlined">notifications</span>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger rounded-full"></span>
          </button>
          <UserNav userName={userName} />
        </div>
      </header>

      {/* Main Content Canvas */}
      <main className="lg:ml-[260px] pt-20 lg:pt-24 px-4 sm:px-6 pb-12 transition-all">
        {children}
      </main>
    </div>
  )
}
