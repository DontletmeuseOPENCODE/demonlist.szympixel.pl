'use client';

import { useState, FormEvent } from 'react';

interface AddChallengeFormProps {
  onClose: () => void;
}

export default function AddChallengeForm({ onClose }: AddChallengeFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    creator: '',
    level_id: '',
    rank: '1',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/challenges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
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
        <h2 className="modal-title">Dodaj Challenge</h2>

        {error && <div className="login-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Pozycja (Rank)</label>
            <input type="number" name="rank" value={formData.rank} onChange={handleChange} required min="1" />
          </div>
          <div className="form-group">
            <label>Nazwa</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="np. Ultra Challenge" />
          </div>
          <div className="form-group">
            <label>Twórca</label>
            <input type="text" name="creator" value={formData.creator} onChange={handleChange} required placeholder="np. Cyclic" />
          </div>
          <div className="form-group">
            <label>Level ID</label>
            <input type="number" name="level_id" value={formData.level_id} onChange={handleChange} placeholder="Opcjonalne" />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose} disabled={loading}>Anuluj</button>
            <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Dodawanie...' : 'Dodaj'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
