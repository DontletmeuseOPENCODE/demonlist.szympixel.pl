'use client';

import { useState, FormEvent } from 'react';
import type { Submission } from '@/lib/yaml';

export default function MergeSubmissionForm({ 
  submission, 
  onClose, 
  onMergeSuccess 
}: { 
  submission: Submission; 
  onClose: () => void; 
  onMergeSuccess: () => void; 
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: submission.name,
    creator: submission.creator,
    level_id: submission.level_id?.toString() || '',
    video: submission.video || '',
    thumbnail: submission.thumbnail || '',
    rank: submission.rank.toString()
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 1. Add to official demon list
      const addRes = await fetch('/api/demons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!addRes.ok) {
        const data = await addRes.json();
        throw new Error(data.error || 'Błąd podczas dodawania demona do oficjalnej listy');
      }

      // 2. Delete the submission
      const deleteRes = await fetch(`/api/submissions/${submission.id}`, {
        method: 'DELETE',
      });

      if (!deleteRes.ok) {
        throw new Error('Demon został dodany, ale wystąpił błąd przy usuwaniu zgłoszenia');
      }

      onMergeSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal">
        <h2 className="modal-title">Zatwierdź i Scal Zgłoszenie</h2>
        <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
          Przeglądasz zgłoszenie poziomu <strong>{submission.name}</strong>. Możesz edytować poniższe dane przed zatwierdzeniem i dodaniem do oficjalnej listy.
        </p>
        
        {error && <div className="login-error">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Pozycja w Rankingu (Rank)</label>
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
            <input type="url" name="video" value={formData.video} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>URL Miniaturki</label>
            <input type="url" name="thumbnail" value={formData.thumbnail} onChange={handleChange} placeholder="Zostaw puste dla domyślnej z YT" />
          </div>
          
          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose} disabled={loading}>Anuluj</button>
            <button type="submit" className="btn-primary" style={{ background: '#4caf50' }} disabled={loading}>
              {loading ? 'Scalanie...' : 'Scal i Zatwierdź (Squash & Merge)'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
