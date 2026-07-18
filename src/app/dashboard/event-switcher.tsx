'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { setActiveEventId } from '@/lib/actions/auth-actions'

export interface EventOption {
  id: string
  name: string
  slug: string
  role: string
}

export function EventSwitcher({
  events,
  activeEventId,
}: {
  events: EventOption[]
  activeEventId: string | null
}) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  if (!events || events.length === 0) return null

  const activeEvent = events.find(e => e.id === activeEventId) || events[0]

  const handleSelect = async (eventId: string) => {
    if (eventId === activeEventId) {
      setIsOpen(false)
      return
    }
    setLoading(true)
    await setActiveEventId(eventId)
    setIsOpen(false)
    router.refresh() // Reload the page so server components pick up new cookie
    setLoading(false)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={loading}
        className="flex items-center gap-2 px-3 py-1.5 bg-surface-container-low hover:bg-surface-container rounded-lg border border-border-light transition-colors text-left min-w-[200px]"
      >
        <div className="flex-1 overflow-hidden">
          <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-0.5">Event Aktif</p>
          <p className="text-body-sm font-medium text-text-main truncate">
            {loading ? 'Beralih...' : activeEvent?.name || 'Pilih Event'}
          </p>
        </div>
        <span className="material-symbols-outlined text-text-muted text-[18px]">
          unfold_more
        </span>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-full md:min-w-[250px] bg-surface border border-border-light rounded-xl shadow-lg z-50 overflow-hidden py-1">
          <div className="max-h-[300px] overflow-y-auto">
            {events.map((event) => (
              <button
                key={event.id}
                onClick={() => handleSelect(event.id)}
                className={`w-full text-left px-4 py-2.5 hover:bg-surface-container-low transition-colors flex items-center justify-between ${
                  event.id === activeEvent?.id ? 'bg-primary/5' : ''
                }`}
              >
                <div>
                  <p className={`text-body-sm font-medium ${event.id === activeEvent?.id ? 'text-primary' : 'text-text-main'}`}>
                    {event.name}
                  </p>
                  <p className="text-[11px] text-text-muted capitalize mt-0.5">
                    Role: {event.role.replace('_', ' ')}
                  </p>
                </div>
                {event.id === activeEvent?.id && (
                  <span className="material-symbols-outlined text-primary text-[18px]">check</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* Click outside to close */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}
