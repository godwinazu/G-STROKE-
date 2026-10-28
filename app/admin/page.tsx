import { redirect } from 'next/navigation';
import { AdminDashboard } from '@/components/admin/admin-dashboard';
import { requireAdminSession } from '@/lib/admin';

export default function AdminPage() {
  if (!requireAdminSession()) {
    redirect('/');
  }

  return <AdminDashboard />;
}
