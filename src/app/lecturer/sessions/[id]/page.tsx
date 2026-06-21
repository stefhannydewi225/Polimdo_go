// LOG: [POLIMDO GO] Redirect detail sesi ke log kehadiran records
import { redirect } from 'next/navigation';

interface SessionDetailPageProps {
  params: Promise<{ id: string }> | { id: string };
}

export default async function LecturerSessionDetailPage({ params }: SessionDetailPageProps) {
  const resolvedParams = await params;
  redirect(`/lecturer/sessions/${resolvedParams.id}/records`);
}

