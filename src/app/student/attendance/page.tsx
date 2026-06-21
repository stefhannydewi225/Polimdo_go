// LOG: [POLIMDO GO] Redirect menu presensi langsung ke pemindai scan
import { redirect } from 'next/navigation';

export default function StudentAttendanceRedirectPage() {
  redirect('/student/attendance/scan');
}
