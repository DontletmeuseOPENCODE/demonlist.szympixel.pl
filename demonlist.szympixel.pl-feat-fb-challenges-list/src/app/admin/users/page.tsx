import Link from 'next/link';
import UserManagement from '@/components/admin/UserManagement';

export default function UsersPage() {
  return (
    <div className="admin-layout">
      <div className="admin-sidebar">
        <nav className="admin-nav">
          <Link href="/admin/dashboard" className="admin-nav-link">Zarządzanie Demonami</Link>
          <Link href="/admin/users" className="admin-nav-link active">Użytkownicy (Admin)</Link>
        </nav>
      </div>

      <div className="admin-content">
        <h1 className="admin-title">Konta Użytkowników</h1>
        <UserManagement />
      </div>
    </div>
  );
}
