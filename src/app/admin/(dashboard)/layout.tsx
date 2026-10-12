import AdminLayoutUI from './AdminLayoutUI';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminLayoutUI>{children}</AdminLayoutUI>;
}
