'use client';

import { useEffect, useState } from 'react';
import type { Demon, Submission, Challenge } from '@/lib/yaml';
import AddDemonForm from '@/components/admin/AddDemonForm';
import EditDemonForm from '@/components/admin/EditDemonForm';
import AddVictorForm from '@/components/admin/AddVictorForm';
import MergeSubmissionForm from '@/components/admin/MergeSubmissionForm';
import AddChallengeForm from '@/components/admin/AddChallengeForm';
import EditChallengeForm from '@/components/admin/EditChallengeForm';
import Link from 'next/link';

export default function AdminDashboard() {
  const [demons, setDemons] = useState<Demon[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'demons' | 'submissions' | 'challenges'>('demons');

  const [showAddForm, setShowAddForm] = useState(false);
  const [editDemon, setEditDemon] = useState<Demon | null>(null);
  const [addVictorTo, setAddVictorTo] = useState<{id: number, name: string, type: 'demon' | 'challenge'} | null>(null);
  const [mergeSubmission, setMergeSubmission] = useState<Submission | null>(null);
  const [showAddChallengeForm, setShowAddChallengeForm] = useState(false);
  const [editChallenge, setEditChallenge] = useState<Challenge | null>(null);

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

  const fetchChallenges = async () => {
    try {
      const res = await fetch('/api/challenges');
      if (!res.ok) throw new Error('Błąd pobierania challenge\'ów');
      const data = await res.json();
      setChallenges(data);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const loadData = async () => {
    setLoading(true);
    await Promise.all([fetchDemons(), fetchSubmissions(), fetchChallenges()]);
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

  const handleDeleteChallenge = async (id: number, name: string) => {
    if (!confirm(`Na pewno chcesz usunąć challenge: ${name}?`)) return;
    try {
      await fetch(`/api/challenges/${id}`, { method: 'DELETE' });
      fetchChallenges();
    } catch (err) {
      alert('Błąd usuwania');
    }
  };

  const handleChallengeVictorDelete = async (challengeId: number, player: string) => {
    if (!confirm(`Usunąć rekord gracza ${player}?`)) return;
    try {
      await fetch(`/api/challenges/${challengeId}/victors`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ player })
      });
      fetchChallenges();
    } catch {
      alert('Błąd usuwania rekordu');
    }
  };

  const handleAddChallengeVictor = async (challengeId: number, challengeName: string) => {
    setAddVictorTo({ id: challengeId, name: challengeName, type: 'challenge' });
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
            className={`admin-nav-link ${activeTab === 'challenges' ? 'active' : ''}`}
            style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer', padding: '0.8rem 1rem', display: 'block' }}
            onClick={() => setActiveTab('challenges')}
          >
            FB Challenges
          </button>
          <Link href="/admin/users" className="admin-nav-link">Użytkownicy (Admin)</Link>
        </nav>
      </div>

      <div className="admin-content">
        {activeTab === 'demons' ? (
          <>
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
                    <th>Victorzy / Weryfikator</th>
                    <th style={{ textAlign: 'right' }}>Akcje</th>
                  </tr>
                </thead>
                <tbody>
                  {demons.map(demon => {
                    const verifier = demon.victors?.find(v => v.isVerifier);
                    const actualVictors = demon.victors?.filter(v => !v.isVerifier) || [];
                    return (
                      <tr key={demon.id}>
                        <td><strong style={{ color: 'var(--accent)' }}>#{demon.rank}</strong></td>
                        <td>
                          <strong>{demon.name}</strong>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>ID: {demon.level_id || 'Brak'}</div>
                        </td>
                        <td>{demon.creator}</td>
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <span style={{ fontSize: '0.9rem' }}>{actualVictors.length} zwycięzców</span>
                              <button className="btn-secondary" style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem' }} onClick={() => setAddVictorTo({ id: demon.id, name: demon.name, type: 'demon' })}>
                                + Victor / Weryfikator
                              </button>
                            </div>
                            {verifier && (
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                                Weryfikator: <strong style={{ color: 'var(--accent)' }}>{verifier.player}</strong>
                                <button 
                                  onClick={() => handleVictorDelete(demon.id, verifier.player)} 
                                  style={{ background: 'none', border: 'none', color: '#ff4b4b', cursor: 'pointer', marginLeft: '0.4rem', fontSize: '0.7rem' }}
                                >
                                  [usuń]
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                            <button className="btn-secondary" onClick={() => setEditDemon(demon)}>Edytuj</button>
                            <button className="btn-danger" onClick={() => handleDelete(demon.id, demon.name)}>Usuń</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {demons.length === 0 && (
                    <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Brak demonów</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        ) : activeTab === 'submissions' ? (
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
        ) : (
          /* ─── FB Challenges Tab ─── */
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h1 className="admin-title" style={{ margin: 0 }}>FB Challenges</h1>
              <button className="btn-primary" onClick={() => setShowAddChallengeForm(true)}>+ Dodaj Challenge</button>
            </div>

            <div className="card admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th style={{ width: '60px' }}>Rank</th>
                    <th>Nazwa</th>
                    <th>Twórca</th>
                    <th>Victorzy / Weryfikator</th>
                    <th style={{ textAlign: 'right' }}>Akcje</th>
                  </tr>
                </thead>
                <tbody>
                  {challenges.map(challenge => {
                    const verifier = challenge.victors?.find(v => v.isVerifier);
                    const actualVictors = challenge.victors?.filter(v => !v.isVerifier) || [];
                    return (
                      <tr key={challenge.id}>
                        <td><strong style={{ color: 'var(--accent)' }}>#{challenge.rank}</strong></td>
                        <td>
                          <strong>{challenge.name}</strong>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>ID: {challenge.level_id || 'Brak'}</div>
                        </td>
                        <td>{challenge.creator}</td>
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <span style={{ fontSize: '0.9rem' }}>{actualVictors.length} zwycięzców</span>
                              <button className="btn-secondary" style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem' }} onClick={() => handleAddChallengeVictor(challenge.id, challenge.name)}>
                                + Victor / Weryfikator
                              </button>
                            </div>
                            {verifier && (
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                                Weryfikator: <strong style={{ color: 'var(--accent)' }}>{verifier.player}</strong>
                                <button 
                                  onClick={() => handleChallengeVictorDelete(challenge.id, verifier.player)} 
                                  style={{ background: 'none', border: 'none', color: '#ff4b4b', cursor: 'pointer', marginLeft: '0.4rem', fontSize: '0.7rem' }}
                                >
                                  [usuń]
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                            <button className="btn-secondary" onClick={() => setEditChallenge(challenge)}>Edytuj</button>
                            <button className="btn-danger" onClick={() => handleDeleteChallenge(challenge.id, challenge.name)}>Usuń</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {challenges.length === 0 && (
                    <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Brak challenge'ów</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {showAddForm && <AddDemonForm onClose={() => { setShowAddForm(false); loadData(); }} />}
      {editDemon && <EditDemonForm demon={editDemon} onClose={() => { setEditDemon(null); loadData(); }} />}
      {addVictorTo && addVictorTo.type === 'demon' && (
        <AddVictorForm demonId={addVictorTo.id} demonName={addVictorTo.name} onClose={() => { setAddVictorTo(null); loadData(); }} />
      )}
      {addVictorTo && addVictorTo.type === 'challenge' && (
        <AddVictorForm demonId={addVictorTo.id} demonName={addVictorTo.name} onClose={() => { setAddVictorTo(null); loadData(); }} apiEndpoint={`/api/challenges/${addVictorTo.id}/victors`} />
      )}
      {mergeSubmission && <MergeSubmissionForm submission={mergeSubmission} onClose={() => { setMergeSubmission(null); loadData(); }} onMergeSuccess={() => { loadData(); }} />}
      {showAddChallengeForm && <AddChallengeForm onClose={() => { setShowAddChallengeForm(false); loadData(); }} />}
      {editChallenge && <EditChallengeForm challenge={editChallenge} onClose={() => { setEditChallenge(null); loadData(); }} />}
    </div>
  );
}
