'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import type { Demon } from '@/lib/yaml';

export default function EditDemonForm({ demon, onClose }: { demon: Demon, onClose: () => void }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: demon.name,
    creator: demon.creator,
    level_id: demon.level_id?.toString() || '',
    video: demon.video || '',
    thumbnail: demon.thumbnail || '',
    rank: demon.rank.toString()
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/demons/${demon.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          level_id: Number(formData.level_id) || 0,
          rank: Number(formData.rank)
        }),
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
        <h2 className="modal-title">Edytuj Demona: {demon.name}</h2>
        
        {error && <div className="login-error">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Pozycja (Rank)</label>
            <input type="number" name="rank" value={formData.rank} onChange={handleChange} required min="1" />
          </div>
          <div className="form-group">
            <label>Nazwa Poziomu</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Twórca</label>
            <input type="text" name="creator" value={formData.creator} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Level ID</label>
            <input type="number" name="level_id" value={formData.level_id} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Link do Wideo (YouTube)</label>
            <input type="url" name="video" value={formData.video} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>URL Miniaturki</label>
            <input type="url" name="thumbnail" value={formData.thumbnail} onChange={handleChange} />
          </div>
          
          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose} disabled={loading}>Anuluj</button>
            <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Zapisywanie...' : 'Zapisz Zmiany'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
