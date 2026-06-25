'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import type { FbChallenge } from '@/lib/fb-challenges';

export default function EditFbChallengeForm({ challenge, onClose }: { challenge: FbChallenge, onClose: () => void }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: challenge.name,
    creator: challenge.creator,
    level_id: challenge.level_id?.toString() || '',
    video: challenge.video || '',
    thumbnail: challenge.thumbnail || '',
    rank: challenge.rank.toString(),
    level_password: challenge.level_password || '',
    level_length: challenge.level_length || '',
    object_count: challenge.object_count?.toString() || '',
    difficulty: challenge.difficulty || '',
    gd_version: challenge.gd_version || '',
    song_name: challenge.song_name || '',
    song_author: challenge.song_author || '',
    song_url: challenge.song_url || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/fb-challenges/${challenge.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          level_id: Number(formData.level_id) || 0,
          rank: Number(formData.rank),
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
        <h2 className="modal-title">Edytuj FB Challenge: {challenge.name}</h2>

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
            <label>Level ID (opcjonalne)</label>
            <input type="number" name="level_id" value={formData.level_id} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Link do Wideo (YouTube, opcjonalne)</label>
            <input type="url" name="video" value={formData.video} onChange={handleChange} placeholder="Zostaw puste — challenge bez showcase" />
          </div>
          <div className="form-group">
            <label>URL Miniaturki (opcjonalne)</label>
            <input type="url" name="thumbnail" value={formData.thumbnail} onChange={handleChange} placeholder="Zostaw puste — domyślna zostanie pobrana z YT" />
          </div>

          <h3 style={{ marginTop: '1rem', marginBottom: '0.5rem', fontFamily: 'Rajdhani, sans-serif', color: 'var(--accent)' }}>Metadane poziomu</h3>

          <div className="form-group">
            <label>Level Password</label>
            <input type="text" name="level_password" value={formData.level_password} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Level Length</label>
            <input type="text" name="level_length" value={formData.level_length} onChange={handleChange} placeholder='np. "1m:07s"' />
          </div>
          <div className="form-group">
            <label>Object Count</label>
            <input type="number" name="object_count" value={formData.object_count} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>In-Game Difficulty</label>
            <input type="text" name="difficulty" value={formData.difficulty} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Created In (wersja GD)</label>
            <input type="text" name="gd_version" value={formData.gd_version} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Newgrounds Song — nazwa</label>
            <input type="text" name="song_name" value={formData.song_name} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Newgrounds Song — autor</label>
            <input type="text" name="song_author" value={formData.song_author} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Link do utworu na Newgrounds</label>
            <input type="url" name="song_url" value={formData.song_url} onChange={handleChange} placeholder="https://www.newgrounds.com/audio/listen/48911" />
            <small style={{ color: 'var(--text-dim)', fontSize: '0.75rem', marginTop: '0.3rem', display: 'block' }}>
              Klikalny link do muzyczki — ID wyciągane automatycznie z URL
            </small>
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