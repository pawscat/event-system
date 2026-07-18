'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export function UserNav({ userName }: { userName: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const supabase = createClient()

  // Close when clicked outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <div className="relative ml-1 sm:ml-2" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="h-8 w-8 rounded-full overflow-hidden border border-border-light bg-primary-fixed hover:bg-primary-fixed-dim transition-colors flex items-center justify-center text-primary font-bold text-sm shrink-0 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
      >
        {userName.charAt(0).toUpperCase()}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-surface border border-border-light rounded-xl shadow-lg py-1 z-50 animate-in fade-in zoom-in-95 duration-200">
          <div className="px-4 py-3 border-b border-border-light">
            <p className="text-[14px] font-semibold text-text-main truncate">{userName}</p>
            <p className="text-[12px] text-text-muted mt-0.5 truncate">Administrator</p>
          </div>
          <div className="p-1">
            <Link 
              href="/dashboard/settings" 
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 w-full px-3 py-2 text-[14px] text-text-main hover:bg-surface-container-low rounded-lg transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">settings</span>
              Pengaturan
            </Link>
          </div>
          <div className="h-[1px] bg-border-light my-0.5"></div>
          <div className="p-1">
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 w-full px-3 py-2 text-[14px] text-danger hover:bg-danger/10 rounded-lg transition-colors text-left"
            >
              <span className="material-symbols-outlined text-[18px]">logout</span>
              Keluar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
