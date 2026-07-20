import { redirect } from 'next/navigation'

export default async function ManualCheckinPage(props: { params: Promise<{ eventId: string }> }) {
  const params = await props.params;
  const { eventId } = params;
  
  // Manual check-in is integrated into the scanner UI
  redirect(`/dashboard/admin-scanner/events/${eventId}/scan`)
}
