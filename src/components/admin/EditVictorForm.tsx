'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import type { Victor } from '@/lib/yaml';

interface Props {
  demonId: number;
  victor: Victor;
  onClose: () => void;
}

/**
 * Modal edycji istniejącego victora.
 * Player name jest readonly (to klucz w demon.victors[]).
 */
export default function EditVictorForm({ demonId, victor, onClose }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    link: victor.link || '',
    date: victor.date || new Date().toISOString().split('T')[0],
    progress: victor.progress !== undefined ? String(victor.progress) : '',
    isVerifier: !!victor.isVerifier,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const body: Record<string, unknown> = {
        demon_id: demonId,
        link: formData.link,
        date: formData.date,
        isVerifier: formData.isVerifier,
      };
      if (formData.progress === '') {
        body.progress = null;
      } else {
        body.progress = Number(formData.progress);
      }

      const res = await fetch(`/api/victors/${encodeURIComponent(victor.player)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Wystąpił błąd');
      }

      router.refresh();
      onClose();
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Usunąć wpis dla gracza "${victor.player}"?`)) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/victors/${encodeURIComponent(victor.player)}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ demon_id: demonId }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Wystąpił błąd');
      }
      router.refresh();
      onClose();
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal">
        <h2 className="modal-title">Edytuj victora: {victor.player}</h2>

        {error && <div className="login-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <input
              type="checkbox"
              id="edit-isVerifier"
              name="isVerifier"
              checked={formData.isVerifier}
              onChange={handleChange}
              style={{ width: 'auto', cursor: 'pointer' }}
            />
            <label htmlFor="edit-isVerifier" style={{ margin: 0, cursor: 'pointer', fontWeight: 'bold' }}>Weryfikator?</label>
          </div>

          <div className="form-group">
            <label>Dowód (Link do YouTube){formData.isVerifier ? ' (Opcjonalny)' : ''}</label>
            <input type="url" name="link" value={formData.link} onChange={handleChange} required={!formData.isVerifier} />
          </div>
          <div className="form-group">
            <label>{formData.isVerifier ? 'Data weryfikacji' : 'Data ukończenia'}</label>
            <input type="date" name="date" value={formData.date} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Progress % (zostaw puste, aby usunąć)</label>
            <input
              type="number"
              name="progress"
              value={formData.progress}
              onChange={handleChange}
              min="80"
              max="100"
              step="0.01"
              placeholder="np. 100 (puste = usuń progress)"
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-danger" onClick={handleDelete} disabled={loading} style={{ marginRight: 'auto' }}>
              Usuń
            </button>
            <button type="button" className="btn-secondary" onClick={onClose} disabled={loading}>Anuluj</button>
            <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Zapisywanie...' : 'Zapisz Zmiany'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}