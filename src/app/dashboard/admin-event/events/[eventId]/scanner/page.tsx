import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import ScannerClient from '@/app/dashboard/admin-scanner/events/[eventId]/scan/scanner-client'

export default async function AdminEventScannerPage(props: { params: Promise<{ eventId: string }> }) {
  const params = await props.params;
  const { eventId } = params;

  // Admin Event always has permission to do manual check-in
  return <ScannerClient eventId={eventId} manualCheckinAllowed={true} />
}
