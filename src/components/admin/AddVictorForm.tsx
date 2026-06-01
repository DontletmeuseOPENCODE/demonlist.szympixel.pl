'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';

export default function AddVictorForm({ demonId, demonName, onClose }: { demonId: number, demonName: string, onClose: () => void }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    player: '',
    link: '',
    date: new Date().toISOString().split('T')[0],
    isVerifier: false
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({ 
      ...formData, 
      [name]: type === 'checkbox' ? checked : value 
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/victors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          demon_id: demonId,
          ...formData
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
        <h2 className="modal-title">Dodaj Zwycięzcę do: {demonName}</h2>
        
        {error && <div className="login-error">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <input 
              type="checkbox" 
              id="isVerifier"
              name="isVerifier" 
              checked={formData.isVerifier} 
              onChange={handleChange} 
              style={{ width: 'auto', cursor: 'pointer' }}
            />
            <label htmlFor="isVerifier" style={{ margin: 0, cursor: 'pointer', fontWeight: 'bold' }}>Weryfikator?</label>
          </div>

          <div className="form-group">
            <label>Gracz</label>
            <input type="text" name="player" value={formData.player} onChange={handleChange} required placeholder="Nick gracza" />
          </div>
          <div className="form-group">
            <label>Dowód (Link do YouTube){formData.isVerifier ? ' (Opcjonalny)' : ''}</label>
            <input type="url" name="link" value={formData.link} onChange={handleChange} required={!formData.isVerifier} />
          </div>
          <div className="form-group">
            <label>{formData.isVerifier ? 'Data weryfikacji' : 'Data ukończenia'}</label>
            <input type="date" name="date" value={formData.date} onChange={handleChange} required />
          </div>
          
          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose} disabled={loading}>Anuluj</button>
            <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Zapisywanie...' : 'Dodaj Zwycięzcę'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
