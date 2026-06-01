'use client';

import { useState, FormEvent } from 'react';
import type { Challenge } from '@/lib/yaml';

interface EditChallengeFormProps {
  challenge: Challenge;
  onClose: () => void;
}

export default function EditChallengeForm({ challenge, onClose }: EditChallengeFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: challenge.name,
    creator: challenge.creator,
    level_id: String(challenge.level_id || ''),
    rank: String(challenge.rank),
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/challenges/${challenge.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          rank: Number(formData.rank),
          level_id: Number(formData.level_id) || 0,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Wystąpił błąd');
      }

      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal">
        <h2 className="modal-title">Edytuj Challenge: {challenge.name}</h2>

        {error && <div className="login-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Pozycja (Rank)</label>
            <input type="number" name="rank" value={formData.rank} onChange={handleChange} required min="1" />
          </div>
          <div className="form-group">
            <label>Nazwa</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Twórca</label>
            <input type="text" name="creator" value={formData.creator} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Level ID</label>
            <input type="number" name="level_id" value={formData.level_id} onChange={handleChange} placeholder="Opcjonalne" />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose} disabled={loading}>Anuluj</button>
            <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Zapisywanie...' : 'Zapisz'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
