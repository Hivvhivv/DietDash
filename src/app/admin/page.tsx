import { redirect } from 'next/navigation';
import { wajibAdmin } from '@/lib/admin-auth';

export default async function AwalAdmin() {
  await wajibAdmin();
  redirect('/admin/dashboard/');
}
