'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'

export function ParticipantStatusFilter({ 
  currentStatus 
}: { 
  currentStatus?: string 
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString())
    if (e.target.value) {
      params.set('status', e.target.value)
    } else {
      params.delete('status')
    }
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <select 
      className="w-full border-none bg-transparent focus:ring-0 p-0 text-body-md text-[16px] font-medium outline-none cursor-pointer"
      value={currentStatus || ''}
      onChange={handleChange}
    >
      <option value="">Semua Status</option>
      <option value="hadir">Hadir</option>
      <option value="belum-hadir">Belum Hadir</option>
    </select>
  )
}
