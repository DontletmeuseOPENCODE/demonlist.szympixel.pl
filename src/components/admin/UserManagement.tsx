'use client';

import { useEffect, useState } from 'react';

export default function UserManagement() {
  const [users, setUsers] = useState<{ username: string, role: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchUsers() {
      try {
        const res = await fetch('/api/users');
        if (!res.ok) throw new Error('Błąd pobierania użytkowników');
        const data = await res.json();
        setUsers(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, []);

  if (loading) return <div>Ładowanie...</div>;
  if (error) return <div className="login-error">{error}</div>;

  return (
    <div className="card admin-table-wrap">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Nazwa Użytkownika</th>
            <th>Rola</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.username}>
              <td><strong>{u.username}</strong></td>
              <td>
                <span style={{ 
                  padding: '0.2rem 0.5rem', 
                  borderRadius: '4px',
                  fontSize: '0.8rem',
                  backgroundColor: u.role === 'admin' ? 'rgba(233,69,96,0.2)' : 'rgba(255,255,255,0.1)',
                  color: u.role === 'admin' ? 'var(--accent)' : 'inherit'
                }}>
                  {u.role}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ marginTop: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
        * Aby dodać nowego użytkownika lub zmienić hasło, edytuj plik <code>config/users.yml</code> (użyj <code>npm run hash-password</code>).
      </div>
    </div>
  );
}
