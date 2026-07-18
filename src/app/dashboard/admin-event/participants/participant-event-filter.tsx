'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'

export function ParticipantEventFilter({ 
  events,
  currentEventId 
}: { 
  events: { id: string, name: string }[],
  currentEventId?: string 
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString())
    if (e.target.value) {
      params.set('eventId', e.target.value)
    } else {
      params.delete('eventId')
    }
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <select 
      className="w-full border-none bg-transparent focus:ring-0 p-0 text-body-md text-[16px] font-medium outline-none cursor-pointer"
      value={currentEventId || ''}
      onChange={handleChange}
    >
      <option value="">Semua Acara</option>
      {events.map(event => (
        <option key={event.id} value={event.id}>
          {event.name}
        </option>
      ))}
    </select>
  )
}
