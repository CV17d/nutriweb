import { redirect } from 'next/navigation';
import { requireAdminSession } from '../../../lib/auth';
import AdminLayoutUI from './AdminLayoutUI';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Defensa en profundidad a nivel de Server Component
  const session = await requireAdminSession();
  if (!session) {
    redirect('/admin/login');
  }

  return <AdminLayoutUI>{children}</AdminLayoutUI>;
}
