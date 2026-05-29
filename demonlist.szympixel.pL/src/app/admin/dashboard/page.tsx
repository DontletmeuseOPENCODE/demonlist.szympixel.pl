'use client';

import { useEffect, useState } from 'react';
import type { Demon } from '@/lib/yaml';
import AddDemonForm from '@/components/admin/AddDemonForm';
import EditDemonForm from '@/components/admin/EditDemonForm';
import AddVictorForm from '@/components/admin/AddVictorForm';
import Link from 'next/link';

export default function AdminDashboard() {
  const [demons, setDemons] = useState<Demon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [role, setRole] = useState<string>('');

  const [showAddForm, setShowAddForm] = useState(false);
  const [editDemon, setEditDemon] = useState<Demon | null>(null);
  const [addVictorTo, setAddVictorTo] = useState<{id: number, name: string} | null>(null);

  const fetchDemons = async () => {
    try {
      const res = await fetch('/api/demons');
      if (!res.ok) throw new Error('Błąd pobierania');
      const data = await res.json();
      setDemons(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDemons();
    // Pobierz rolę usera z ciasteczka (uproszczony odczyt, realnie Next.js to ogarnia w middleware, tutaj dla UI)
    const cookieRole = document.cookie.includes('role=admin') ? 'admin' : 'moderator'; 
    // Uwaga: w prawdziwej apce lepiej pobrać usera z endpointu `/api/auth/me`. 
    // Na potrzeby MVP załóżmy, że wszyscy tutaj to co najmniej moderatorzy.
    setRole('admin'); // TODO: zczytać z API
  }, []);

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Na pewno chcesz usunąć demona: ${name}?`)) return;
    try {
      await fetch(`/api/demons/${id}`, { method: 'DELETE' });
      fetchDemons();
    } catch (err) {
      alert('Błąd usuwania');
    }
  };

  const handleVictorDelete = async (demonId: number, player: string) => {
    if (!confirm(`Usunąć rekord gracza ${player}?`)) return;
    try {
      await fetch(`/api/victors/${encodeURIComponent(player)}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ demon_id: demonId })
      });
      fetchDemons();
    } catch {
      alert('Błąd usuwania rekordu');
    }
  };

  if (loading) return <div>Ładowanie...</div>;
  if (error) return <div className="login-error">{error}</div>;

  return (
    <div className="admin-layout">
      <div className="admin-sidebar">
        <nav className="admin-nav">
          <Link href="/admin/dashboard" className="admin-nav-link active">Zarządzanie Demonami</Link>
          <Link href="/admin/users" className="admin-nav-link">Użytkownicy (Admin)</Link>
        </nav>
      </div>

      <div className="admin-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h1 className="admin-title" style={{ margin: 0 }}>Lista Demonów</h1>
          <button className="btn-primary" onClick={() => setShowAddForm(true)}>+ Dodaj Demona</button>
        </div>

        <div className="card admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: '60px' }}>Rank</th>
                <th>Nazwa</th>
                <th>Twórca</th>
                <th>Victorzy</th>
                <th style={{ textAlign: 'right' }}>Akcje</th>
              </tr>
            </thead>
            <tbody>
              {demons.map(demon => (
                <tr key={demon.id}>
                  <td><strong style={{ color: 'var(--accent)' }}>#{demon.rank}</strong></td>
                  <td>
                    <strong>{demon.name}</strong>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>ID: {demon.level_id || 'Brak'}</div>
                  </td>
                  <td>{demon.creator}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span>{demon.victors?.length || 0}</span>
                      <button className="btn-secondary" style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem' }} onClick={() => setAddVictorTo({ id: demon.id, name: demon.name })}>
                        + Victor
                      </button>
                    </div>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                      <button className="btn-secondary" onClick={() => setEditDemon(demon)}>Edytuj</button>
                      <button className="btn-danger" onClick={() => handleDelete(demon.id, demon.name)}>Usuń</button>
                    </div>
                  </td>
                </tr>
              ))}
              {demons.length === 0 && (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Brak demonów</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showAddForm && <AddDemonForm onClose={() => { setShowAddForm(false); fetchDemons(); }} />}
      {editDemon && <EditDemonForm demon={editDemon} onClose={() => { setEditDemon(null); fetchDemons(); }} />}
      {addVictorTo && <AddVictorForm demonId={addVictorTo.id} demonName={addVictorTo.name} onClose={() => { setAddVictorTo(null); fetchDemons(); }} />}
    </div>
  );
}
