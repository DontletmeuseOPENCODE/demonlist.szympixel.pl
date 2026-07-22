'use client';

import { useEffect, useState } from 'react';
import type { Demon, Submission } from '@/lib/yaml';
import type { FbChallenge } from '@/lib/fb-challenges';
import type { VictorSubmission } from '@/lib/victor-submissions';
import AddDemonForm from '@/components/admin/AddDemonForm';
import EditDemonForm from '@/components/admin/EditDemonForm';
import AddVictorForm from '@/components/admin/AddVictorForm';
import MergeSubmissionForm from '@/components/admin/MergeSubmissionForm';
import AddFbChallengeForm from '@/components/admin/AddFbChallengeForm';
import EditFbChallengeForm from '@/components/admin/EditFbChallengeForm';
import DemonDragList from '@/components/admin/DemonDragList';
import StatsTab from './StatsTab';
import Link from 'next/link';

export default function AdminDashboard() {
  const [demons, setDemons] = useState<Demon[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [fbChallenges, setFbChallenges] = useState<FbChallenge[]>([]);
  const [victorSubmissions, setVictorSubmissions] = useState<VictorSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'demons' | 'submissions' | 'fb-challenges' | 'victor-submissions' | 'stats'>('demons');

  const [showAddForm, setShowAddForm] = useState(false);
  const [showAddFbChallengeForm, setShowAddFbChallengeForm] = useState(false);
  const [editDemon, setEditDemon] = useState<Demon | null>(null);
  const [editFbChallenge, setEditFbChallenge] = useState<FbChallenge | null>(null);
  const [addVictorTo, setAddVictorTo] = useState<{id: number, name: string} | null>(null);
  const [mergeSubmission, setMergeSubmission] = useState<Submission | null>(null);

  const fetchDemons = async () => {
    try {
      const res = await fetch('/api/demons');
      if (!res.ok) throw new Error('Błąd pobierania');
      const data = await res.json();
      setDemons(data);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const fetchSubmissions = async () => {
    try {
      const res = await fetch('/api/submissions');
      if (!res.ok) throw new Error('Błąd pobierania zgłoszeń');
      const data = await res.json();
      setSubmissions(data);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const fetchFbChallenges = async () => {
    try {
      const res = await fetch('/api/fb-challenges');
      if (!res.ok) throw new Error('Błąd pobierania FB Challenges');
      const data = await res.json();
      setFbChallenges(data);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const fetchVictorSubmissions = async () => {
    try {
      const res = await fetch('/api/victor-submissions');
      if (!res.ok) throw new Error('Błąd pobierania zgłoszeń victorów');
      const data = await res.json();
      setVictorSubmissions(data);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const loadData = async () => {
    setLoading(true);
    await Promise.all([fetchDemons(), fetchSubmissions(), fetchFbChallenges(), fetchVictorSubmissions()]);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
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

  const handleRejectSubmission = async (id: number, name: string) => {
    if (!confirm(`Na pewno chcesz odrzucić i usunąć zgłoszenie poziomu: ${name}?`)) return;
    try {
      await fetch(`/api/submissions/${id}`, { method: 'DELETE' });
      fetchSubmissions();
    } catch (err) {
      alert('Błąd odrzucania zgłoszenia');
    }
  };

  const handleFbChallengeDelete = async (id: number, name: string) => {
    if (!confirm(`Na pewno chcesz usunąć FB Challenge: ${name}?`)) return;
    try {
      await fetch(`/api/fb-challenges/${id}`, { method: 'DELETE' });
      fetchFbChallenges();
    } catch {
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

  const handleApproveVictorSubmission = async (id: number) => {
    if (!confirm('Zatwierdzić to zgłoszenie? Dopisze victora do oficjalnej listy.')) return;
    try {
      const res = await fetch(`/api/victor-submissions/${id}/approve`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Błąd zatwierdzania');
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Błąd zatwierdzania');
    }
  };

  const handleRejectVictorSubmission = async (id: number, player: string) => {
    if (!confirm(`Odrzucić zgłoszenie gracza ${player}? Zostanie usunięte.`)) return;
    try {
      await fetch(`/api/victor-submissions/${id}`, { method: 'DELETE' });
      await fetchVictorSubmissions();
    } catch {
      alert('Błąd odrzucania zgłoszenia');
    }
  };

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Ładowanie danych...</div>;
  if (error) return <div className="login-error">{error}</div>;

  return (
    <div className="admin-layout">
      <div className="admin-sidebar">
        <nav className="admin-nav">
          <button
            className={`admin-nav-link ${activeTab === 'demons' ? 'active' : ''}`}
            style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer', padding: '0.8rem 1rem', display: 'block' }}
            onClick={() => setActiveTab('demons')}
          >
            Zarządzanie Demonami
          </button>
          <button
            className={`admin-nav-link ${activeTab === 'fb-challenges' ? 'active' : ''}`}
            style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer', padding: '0.8rem 1rem', display: 'block' }}
            onClick={() => setActiveTab('fb-challenges')}
          >
            FB Challenges
          </button>
          <button
            className={`admin-nav-link ${activeTab === 'submissions' ? 'active' : ''}`}
            style={{
              background: 'none',
              border: 'none',
              width: '100%',
              textAlign: 'left',
              cursor: 'pointer',
              padding: '0.8rem 1rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
            onClick={() => setActiveTab('submissions')}
          >
            <span>Zgłoszenia Community</span>
            {submissions.length > 0 && (
              <span style={{
                background: 'var(--accent)',
                color: 'white',
                borderRadius: '12px',
                padding: '0.1rem 0.5rem',
                fontSize: '0.75rem',
                fontWeight: 'bold'
              }}>
                {submissions.length}
              </span>
            )}
          </button>
          <button
            className={`admin-nav-link ${activeTab === 'victor-submissions' ? 'active' : ''}`}
            style={{
              background: 'none',
              border: 'none',
              width: '100%',
              textAlign: 'left',
              cursor: 'pointer',
              padding: '0.8rem 1rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
            onClick={() => setActiveTab('victor-submissions')}
          >
            <span>Zgłoszenia Victorów</span>
            {victorSubmissions.filter((s) => s.status === 'pending').length > 0 && (
              <span style={{
                background: 'var(--accent)',
                color: 'white',
                borderRadius: '12px',
                padding: '0.1rem 0.5rem',
                fontSize: '0.75rem',
                fontWeight: 'bold'
              }}>
                {victorSubmissions.filter((s) => s.status === 'pending').length}
              </span>
            )}
          </button>
          <button
            className={`admin-nav-link ${activeTab === 'stats' ? 'active' : ''}`}
            style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer', padding: '0.8rem 1rem', display: 'block' }}
            onClick={() => setActiveTab('stats')}
          >
            Stats
          </button>
          <Link href="/admin/users" className="admin-nav-link">Użytkownicy (Admin)</Link>
        </nav>
      </div>

      <div className="admin-content">
        {activeTab === 'demons' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h1 className="admin-title" style={{ margin: 0 }}>Lista Demonów</h1>
              <button className="btn-primary" onClick={() => setShowAddForm(true)}>+ Dodaj Demona</button>
            </div>

            <div className="card" style={{ padding: '1rem' }}>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.8rem' }}>
                💡 Przeciągnij kropki ⠿ obok demona, aby zmienić jego pozycję w rankingu.
              </p>
              <DemonDragList
                initialDemons={demons}
                renderLeft={(demon) => {
                  const verifier = demon.victors?.find(v => v.isVerifier);
                  const actualVictors = demon.victors?.filter(v => !v.isVerifier) || [];
                  return (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontFamily: 'Rajdhani, sans-serif',
                        fontWeight: 700,
                        fontSize: '1.2rem',
                        color: 'var(--accent)',
                        minWidth: '3rem',
                        textAlign: 'right',
                      }}>
                        #{demon.rank}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: '1rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {demon.name}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {demon.creator} · ID: {demon.level_id || 'Brak'} · {actualVictors.length} zwycięzców
                        </div>
                        {verifier && (
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '0.2rem' }}>
                            Weryfikator: <strong style={{ color: 'var(--accent)' }}>{verifier.player}</strong>
                          </div>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button className="btn-secondary" style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }} onClick={() => setAddVictorTo({ id: demon.id, name: demon.name })}>
                          + Victor
                        </button>
                        <button className="btn-secondary" style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }} onClick={() => setEditDemon(demon)}>
                          Edytuj
                        </button>
                        <button className="btn-danger" style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }} onClick={() => handleDelete(demon.id, demon.name)}>
                          Usuń
                        </button>
                      </div>
                    </div>
                  );
                }}
              />
              {demons.length === 0 && (
                <div className="stats-empty">Brak demonów</div>
              )}
            </div>
          </>
        )}

        {activeTab === 'submissions' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h1 className="admin-title" style={{ margin: 0 }}>Zgłoszenia od Community ({submissions.length})</h1>
            </div>

            <div className="card admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th style={{ width: '60px' }}>Suger. Rank</th>
                    <th>Nazwa</th>
                    <th>Twórca</th>
                    <th>Data zgłoszenia</th>
                    <th style={{ textAlign: 'right' }}>Akcje</th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.map(sub => (
                    <tr key={sub.id}>
                      <td><strong style={{ color: 'var(--text-dim)' }}>#{sub.rank}</strong></td>
                      <td>
                        <strong>{sub.name}</strong>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>ID: {sub.level_id || 'Brak'}</div>
                      </td>
                      <td>{sub.creator}</td>
                      <td>{new Date(sub.submitted_at).toLocaleDateString('pl-PL')}</td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                          <button
                            className="btn-primary"
                            style={{ background: '#4caf50', borderColor: '#4caf50' }}
                            onClick={() => setMergeSubmission(sub)}
                          >
                            Zatwierdź i Scal (Merge)
                          </button>
                          <button
                            className="btn-danger"
                            onClick={() => handleRejectSubmission(sub.id, sub.name)}
                          >
                            Odrzuć
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {submissions.length === 0 && (
                    <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Brak oczekujących zgłoszeń</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {activeTab === 'fb-challenges' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h1 className="admin-title" style={{ margin: 0 }}>FB Challenges ({fbChallenges.length})</h1>
              <button className="btn-primary" onClick={() => setShowAddFbChallengeForm(true)}>+ Dodaj Challenge</button>
            </div>

            <div className="card admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th style={{ width: '60px' }}>Rank</th>
                    <th>Nazwa</th>
                    <th>Twórca</th>
                    <th>Showcase</th>
                    <th>Data dodania</th>
                    <th style={{ textAlign: 'right' }}>Akcje</th>
                  </tr>
                </thead>
                <tbody>
                  {fbChallenges.map(ch => (
                    <tr key={ch.id}>
                      <td><strong style={{ color: 'var(--accent)' }}>#{ch.rank}</strong></td>
                      <td>
                        <strong>{ch.name}</strong>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>ID: {ch.level_id || 'Brak'}</div>
                      </td>
                      <td>{ch.creator}</td>
                      <td>
                        {ch.video ? (
                          <a href={ch.video} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', fontSize: '0.85rem' }}>
                            ▶ wideo
                          </a>
                        ) : (
                          <span style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>— brak —</span>
                        )}
                      </td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{new Date(ch.added_at).toLocaleDateString('pl-PL')}</td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                          <button className="btn-secondary" onClick={() => setEditFbChallenge(ch)}>Edytuj</button>
                          <button className="btn-danger" onClick={() => handleFbChallengeDelete(ch.id, ch.name)}>Usuń</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {fbChallenges.length === 0 && (
                    <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Brak FB Challenges</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {activeTab === 'victor-submissions' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h1 className="admin-title" style={{ margin: 0 }}>Zgłoszenia Victorów ({victorSubmissions.filter((s) => s.status === 'pending').length} oczekujących)</h1>
            </div>

            <div className="card admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Demon</th>
                    <th>Holder</th>
                    <th style={{ width: '80px' }}>Progress</th>
                    <th>Video</th>
                    <th>Raw Footage</th>
                    <th>Notatka</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Akcje</th>
                  </tr>
                </thead>
                <tbody>
                  {victorSubmissions.map(sub => {
                    const demon = demons.find((d) => d.id === sub.demon_id);
                    const alreadyVictor = demon?.victors?.some((v) => v.player.toLowerCase() === sub.player.toLowerCase());
                    return (
                      <tr key={sub.id}>
                        <td>
                          <strong>{demon ? demon.name : `#${sub.demon_id} (usunięty)`}</strong>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                            {demon ? `#${demon.rank}` : ''}
                          </div>
                        </td>
                        <td>
                          <strong>{sub.player}</strong>
                          {alreadyVictor && (
                            <div style={{ fontSize: '0.7rem', color: '#ff9800', marginTop: '0.2rem' }}>⚠ już na liście</div>
                          )}
                        </td>
                        <td><strong style={{ color: 'var(--accent)' }}>{sub.progress}%</strong></td>
                        <td>
                          <a href={sub.video} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', fontSize: '0.85rem' }}>
                            ▶ YT
                          </a>
                        </td>
                        <td>
                          <a href={sub.raw_footage} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', fontSize: '0.85rem' }}>
                            ▶ link
                          </a>
                        </td>
                        <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={sub.notes}>
                          {sub.notes || <span style={{ color: 'var(--text-dim)' }}>—</span>}
                        </td>
                        <td>
                          {sub.status === 'pending' && <span style={{ color: 'var(--accent)', fontSize: '0.8rem' }}>● oczekuje</span>}
                          {sub.status === 'approved' && <span style={{ color: '#4caf50', fontSize: '0.8rem' }}>✓ zatwierdzony</span>}
                          {sub.status === 'rejected' && <span style={{ color: '#ff4b4b', fontSize: '0.8rem' }}>✗ odrzucony</span>}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          {sub.status === 'pending' ? (
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                              <button
                                className="btn-primary"
                                style={{ background: '#4caf50', borderColor: '#4caf50', padding: '0.3rem 0.7rem', fontSize: '0.85rem' }}
                                onClick={() => handleApproveVictorSubmission(sub.id)}
                              >
                                Zatwierdź
                              </button>
                              <button
                                className="btn-danger"
                                style={{ padding: '0.3rem 0.7rem', fontSize: '0.85rem' }}
                                onClick={() => handleRejectVictorSubmission(sub.id, sub.player)}
                              >
                                Odrzuć
                              </button>
                            </div>
                          ) : (
                            <button
                              className="btn-secondary"
                              style={{ padding: '0.3rem 0.7rem', fontSize: '0.8rem' }}
                              onClick={() => handleRejectVictorSubmission(sub.id, sub.player)}
                            >
                              Usuń z listy
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {victorSubmissions.length === 0 && (
                    <tr><td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Brak zgłoszeń</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {activeTab === 'stats' && (
          <StatsTab />
        )}
      </div>

      {showAddForm && <AddDemonForm onClose={() => { setShowAddForm(false); loadData(); }} />}
      {editDemon && <EditDemonForm demon={editDemon} onClose={() => { setEditDemon(null); loadData(); }} />}
      {addVictorTo && <AddVictorForm demonId={addVictorTo.id} demonName={addVictorTo.name} onClose={() => { setAddVictorTo(null); loadData(); }} />}
      {mergeSubmission && <MergeSubmissionForm submission={mergeSubmission} onClose={() => { setMergeSubmission(null); loadData(); }} onMergeSuccess={() => { loadData(); }} />}
      {showAddFbChallengeForm && <AddFbChallengeForm onClose={() => { setShowAddFbChallengeForm(false); loadData(); }} />}
      {editFbChallenge && <EditFbChallengeForm challenge={editFbChallenge} onClose={() => { setEditFbChallenge(null); loadData(); }} />}
    </div>
  );
}