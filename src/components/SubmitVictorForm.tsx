'use client';

import { useEffect, useState, FormEvent } from 'react';

interface DemonLite {
  id: number;
  rank: number;
  name: string;
}

export default function SubmitVictorForm({ onClose }: { onClose: () => void }) {
  const [demons, setDemons] = useState<DemonLite[]>([]);
  const [players, setPlayers] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    demon_id: '',
    player: '',
    progress: '',
    video: '',
    raw_footage: '',
    notes: '',
  });

  // Pobierz listę demonów (tylko main lista) i holderów do autocomplete
  useEffect(() => {
    (async () => {
      try {
        const [demonsRes, playersRes] = await Promise.all([
          fetch('/api/demons'),
          fetch('/api/players'),
        ]);
        if (demonsRes.ok) setDemons(await demonsRes.json());
        if (playersRes.ok) setPlayers(await playersRes.json());
      } catch {
        // brak danych nie blokuje formularza — user może wpisać ręcznie
      }
    })();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/victor-submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          demon_id: Number(formData.demon_id),
          progress: Number(formData.progress),
        }),
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
        <h2 className="modal-title">Zgłoś Victora</h2>

        {success ? (
          <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
            <div style={{ fontSize: '3rem', color: '#4caf50', marginBottom: '1rem' }}>✓</div>
            <p style={{ fontSize: '1.1rem', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>
              Dziękujemy! Twoje zgłoszenie zostało przesłane do weryfikacji przez moderatorów.
            </p>
            <button className="btn-primary" onClick={onClose}>Zamknij</button>
          </div>
        ) : (
          <>
            <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              Zgłoś ukończenie demona przez gracza. Akceptujemy progress od 80%. Zgłoszenie zostanie ocenione przez moderatorów.
            </p>

            {error && <div className="login-error">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Poziom (tylko main lista)</label>
                <select name="demon_id" value={formData.demon_id} onChange={handleChange} required>
                  <option value="">— wybierz poziom —</option>
                  {demons.map((d) => (
                    <option key={d.id} value={d.id}>
                      #{d.rank} · {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Holder (nick gracza)</label>
                <input
                  type="text"
                  name="player"
                  list="players-list"
                  value={formData.player}
                  onChange={handleChange}
                  required
                  placeholder="Wpisz nick (lub wybierz z listy)"
                  autoComplete="off"
                />
                <datalist id="players-list">
                  {players.map((p) => (
                    <option key={p} value={p} />
                  ))}
                </datalist>
                <small style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>
                  Jeśli nicka nie ma na liście — wpisz własny, zostanie dodany.
                </small>
              </div>

              <div className="form-group">
                <label>Progress (%)</label>
                <input
                  type="number"
                  name="progress"
                  value={formData.progress}
                  onChange={handleChange}
                  required
                  min="80"
                  max="100"
                  step="0.01"
                  placeholder="np. 100"
                />
                <small style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>
                  Akceptujemy od 80% w górę.
                </small>
              </div>

              <div className="form-group">
                <label>Video (YouTube)</label>
                <input
                  type="url"
                  name="video"
                  value={formData.video}
                  onChange={handleChange}
                  required
                  placeholder="https://www.youtube.com/watch?v=..."
                />
              </div>

              <div className="form-group">
                <label>Raw Footage (pełen run bez cięć)</label>
                <input
                  type="url"
                  name="raw_footage"
                  value={formData.raw_footage}
                  onChange={handleChange}
                  required
                  placeholder="https://drive.google.com/..."
                />
                <small style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>
                  Link do Google Drive / YouTube (unlisted) / innego źródła z pełnym przebiegiem.
                </small>
              </div>

              <div className="form-group">
                <label>Notatka dla moderatora (opcjonalne)</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={3}
                  placeholder="np. użyty modem, uwagi, itp."
                />
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