import { redirect } from 'next/navigation';
import { AdminDashboard } from '@/components/admin/admin-dashboard';
import { requireAdminSession } from '@/lib/admin';

export default async function AdminPage() {
  if (!(await requireAdminSession())) {
    redirect('/admin/login');
  }

  return <AdminDashboard />;
}
