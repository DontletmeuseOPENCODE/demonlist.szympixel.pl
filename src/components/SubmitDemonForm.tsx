'use client';

import { useState, FormEvent } from 'react';

export default function SubmitDemonForm({ onClose }: { onClose: () => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    creator: '',
    level_id: '',
    video: '',
    thumbnail: '',
    rank: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Wystąpił błąd');
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal">
        <h2 className="modal-title">Zgłoś Nowy Poziom</h2>
        
        {success ? (
          <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
            <div style={{ fontSize: '3rem', color: '#4caf50', marginBottom: '1rem' }}>✓</div>
            <p style={{ fontSize: '1.1rem', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>
              Dziękujemy! Twoje zgłoszenie zostało przesłane do weryfikacji przez administratorów.
            </p>
            <button className="btn-primary" onClick={onClose}>Zamknij</button>
          </div>
        ) : (
          <>
            <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              Zaproponuj dodanie nowego demona do listy. Zgłoszenie zostanie ocenione przez administratorów przed publikacją.
            </p>
            
            {error && <div className="login-error">{error}</div>}
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Sugerowana Pozycja (Rank)</label>
                <input type="number" name="rank" value={formData.rank} onChange={handleChange} required min="1" placeholder="np. 5" />
              </div>
              <div className="form-group">
                <label>Nazwa Poziomu</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="np. Sonic Wave" />
              </div>
              <div className="form-group">
                <label>Twórca</label>
                <input type="text" name="creator" value={formData.creator} onChange={handleChange} required placeholder="np. Cyclic" />
              </div>
              <div className="form-group">
                <label>Level ID</label>
                <input type="number" name="level_id" value={formData.level_id} onChange={handleChange} placeholder="Opcjonalne" />
              </div>
              <div className="form-group">
                <label>Link do Wideo (YouTube)</label>
                <input type="url" name="video" value={formData.video} onChange={handleChange} required placeholder="https://www.youtube.com/watch?v=..." />
              </div>
              <div className="form-group">
                <label>URL Miniaturki</label>
                <input type="url" name="thumbnail" value={formData.thumbnail} onChange={handleChange} placeholder="Zostaw puste dla domyślnej z YT" />
              </div>
              
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={onClose} disabled={loading}>Anuluj</button>
                <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Wysyłanie...' : 'Wyślij Zgłoszenie'}</button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
